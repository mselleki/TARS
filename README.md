# TARS

Organizer / daily-life decision tool (tasks, projects, tickets, rituals). React + Vite, PWA, sync via Vercel + Upstash Redis.

## Dev

```bash
npm install
npm run dev
```

## Sync (multi‑appareils)

Les données sont persistées en local (localStorage) et synchronisées avec une base Upstash Redis via l’API Vercel (`/api/state`).

- **Sans config** : en production (même origine), l’app utilise `window.location.origin` pour appeler l’API.
- **En local** : définir `VITE_API_URL` (ex. ton URL Vercel) dans `.env` pour tester la sync.

Variables à configurer sur **Vercel** (Settings → Environment Variables) :

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Voir `.env.example`.

## Build & deploy (Vercel)

```bash
npm run build
```

Déploiement : connecter le repo à Vercel ou `npx vercel --prod`. Le dossier `api/` est servi en serverless.

---

# React + Vite (template)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
