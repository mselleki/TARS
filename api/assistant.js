import Anthropic from "@anthropic-ai/sdk";
import { Redis } from "@upstash/redis";

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 1024;
const MAX_TRANSCRIPT = 500;
const RATE_LIMIT = 30;
const RATE_WINDOW_S = 300;

const TOOLS = [
  {
    name: "create_item",
    description:
      "Créer une tâche, un ticket ou une note. Pour « ajoute », « rappelle-moi », « crée un ticket », « note … ».",
    input_schema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: ["task", "ticket", "note"],
          description: "Type d'élément.",
        },
        title: { type: "string", description: "Intitulé de l'élément." },
        dueDate: {
          type: "string",
          description: "Échéance au format YYYY-MM-DD, ou chaîne vide.",
        },
        dueTime: {
          type: "string",
          description: "Heure au format HH:MM, ou chaîne vide.",
        },
      },
      required: ["target", "title"],
    },
  },
  {
    name: "complete_task",
    description:
      "Marquer une tâche comme terminée. Le taskId doit provenir de la liste fournie.",
    input_schema: {
      type: "object",
      properties: { taskId: { type: "string" } },
      required: ["taskId"],
    },
  },
  {
    name: "snooze_task",
    description:
      "Reporter l'échéance d'une tâche. taskId de la liste fournie ; dueDate au format YYYY-MM-DD.",
    input_schema: {
      type: "object",
      properties: { taskId: { type: "string" }, dueDate: { type: "string" } },
      required: ["taskId", "dueDate"],
    },
  },
  {
    name: "navigate",
    description: "Aller à une vue de l'application.",
    input_schema: {
      type: "object",
      properties: {
        view: {
          type: "string",
          enum: [
            "cockpit",
            "tasks",
            "projects",
            "tickets",
            "rituals",
            "notes",
            "agenda",
            "courses",
          ],
        },
      },
      required: ["view"],
    },
  },
  {
    name: "answer",
    description:
      "Répondre vocalement à une question ou demander une précision, sans agir. Mettre la phrase parlée dans text.",
    input_schema: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    },
  },
];

export function buildResponse(content, snapshot) {
  const validIds = new Set((snapshot?.tasks ?? []).map((t) => t.id));
  const actions = [];
  let text = "";
  let answer = "";
  for (const block of content ?? []) {
    if (block.type === "text") {
      text += block.text ?? "";
    } else if (block.type === "tool_use") {
      const input = block.input ?? {};
      switch (block.name) {
        case "answer":
          answer = input.text ?? "";
          break;
        case "navigate":
          actions.push({ type: "navigate", view: input.view });
          break;
        case "create_item":
          actions.push({
            type: "create_item",
            target: input.target,
            title: input.title,
            dueDate: input.dueDate ?? "",
            dueTime: input.dueTime ?? "",
          });
          break;
        case "complete_task":
          if (validIds.has(input.taskId))
            actions.push({ type: "complete_task", taskId: input.taskId });
          break;
        case "snooze_task":
          if (validIds.has(input.taskId))
            actions.push({
              type: "snooze_task",
              taskId: input.taskId,
              dueDate: input.dueDate,
            });
          break;
        default:
          break;
      }
    }
  }
  return { actions, speech: (text.trim() || answer).trim() };
}

function buildSystem(snapshot) {
  const tasks =
    (snapshot?.tasks ?? [])
      .map(
        (t) =>
          `- ${t.id} | ${t.title}${t.dueDate ? ` (échéance ${t.dueDate})` : ""}${t.status === "done" ? " [fait]" : ""}`,
      )
      .join("\n") || "(aucune)";
  const tickets =
    (snapshot?.reqTickets ?? [])
      .map(
        (t) =>
          `- ${t.id} | ${t.summary}${t.dueAt ? ` (échéance ${t.dueAt})` : ""}`,
      )
      .join("\n") || "(aucun)";
  return [
    "Tu es l'assistant vocal de TARS, une application d'organisation personnelle. L'utilisateur te parle en français ; transforme sa phrase en actions via les outils.",
    "Règles :",
    "- Utilise les outils pour agir ; tu peux en appeler plusieurs si la phrase contient plusieurs demandes.",
    "- Pour terminer ou reporter une tâche, choisis le taskId dans la liste fournie d'après le titre. Si plusieurs tâches correspondent sans pouvoir trancher, utilise l'outil answer pour demander laquelle.",
    "- Pour une question (« qu'est-ce que j'ai aujourd'hui », « combien en retard »), réponds via l'outil answer en une phrase courte et naturelle, à partir des données fournies.",
    "- Après avoir agi, tu peux ajouter une courte phrase de confirmation en texte (« C'est fait », « Tâche créée »). Reste bref.",
    `- Les dates sont au format YYYY-MM-DD. Aujourd'hui c'est ${snapshot?.today ?? ""}. Calcule toi-même les dates relatives (demain, vendredi…).`,
    `Contexte courant : vue « ${snapshot?.view ?? ""} », contexte « ${snapshot?.context ?? ""} ».`,
    `Tâches actives :\n${tasks}`,
    `Tickets ouverts :\n${tickets}`,
  ].join("\n");
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function redis() {
  const url =
    process.env.tars_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.tars_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function overRateLimit(ip) {
  const client = redis();
  if (!client) return false;
  const key = `tars:assistant:rl:${ip}`;
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, RATE_WINDOW_S);
  return count > RATE_LIMIT;
}

export default {
  async fetch(request) {
    const headers = { "Content-Type": "application/json", ...corsHeaders() };
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: corsHeaders() });
    if (request.method !== "POST")
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers,
      });

    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        return new Response(
          JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }),
          { status: 500, headers },
        );
      }
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown";
      if (await overRateLimit(ip)) {
        return new Response(JSON.stringify({ error: "rate_limited" }), {
          status: 429,
          headers,
        });
      }

      const body = await request.json();
      const transcript = String(body?.transcript ?? "")
        .slice(0, MAX_TRANSCRIPT)
        .trim();
      const snapshot = { ...(body?.snapshot ?? {}), context: body?.context };
      if (!transcript)
        return new Response(JSON.stringify({ actions: [], speech: "" }), {
          status: 200,
          headers,
        });

      const client = new Anthropic();
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystem(snapshot),
        tools: TOOLS,
        messages: [{ role: "user", content: transcript }],
      });

      const result = buildResponse(message.content, snapshot);
      return new Response(JSON.stringify(result), { status: 200, headers });
    } catch (e) {
      const msg = e?.message ?? String(e);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers,
      });
    }
  },
};
