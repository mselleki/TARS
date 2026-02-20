import { Redis } from '@upstash/redis'

const REDIS_KEY = 'tars:state'

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set')
  }
  return new Redis({ url, token })
}

export default {
  async fetch(request) {
    const method = request.method
    const headers = { 'Content-Type': 'application/json' }

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }

    try {
      const client = redis()

      if (method === 'GET') {
        const raw = await client.get(REDIS_KEY)
        const body = raw ?? null
        return new Response(JSON.stringify(body), { status: 200, headers: { ...headers, ...corsHeaders() } })
      }

      if (method === 'POST' || method === 'PUT') {
        const body = await request.json()
        const payload = {
          projects: body.projects ?? [],
          tasks: body.tasks ?? [],
          rituals: body.rituals ?? [],
          dailyPlans: body.dailyPlans ?? [],
          tickets: body.tickets ?? [],
          reqTickets: body.reqTickets ?? [],
          requesters: body.requesters ?? [],
        }
        await client.set(REDIS_KEY, payload)
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...headers, ...corsHeaders() } })
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
    } catch (e) {
      const msg = e?.message ?? String(e)
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...headers, ...corsHeaders() } })
    }
  },
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
