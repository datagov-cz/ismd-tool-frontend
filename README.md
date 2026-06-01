This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Local frontend, login via deployed DEV Keycloak

You can run the frontend locally and authenticate against the deployed DEV
Keycloak (useful for UI work without standing up Keycloak locally). Copy
`.env.local.example` to `.env.local` and use the "Mode B" values:

- `NEXTAUTH_URL="http://localhost:3000/popisujeme/api/auth"` — must be localhost,
  otherwise login bounces back to the deployed hostname instead of your machine.
- `KEYCLOAK_ISSUER="https://oha03.dia.gov.cz/popisujeme/auth/realms/ismd"`
- `KEYCLOAK_CLIENT_ID="ismd-app"` (public client; `KEYCLOAK_CLIENT_SECRET` may be
  left blank).
- `BE_URL="https://oha03.dia.gov.cz/popisujeme/be"` — reach the DEV backend
  directly through the App Gateway's dedicated `/popisujeme/be/*` route.

Both halves work on DEV: the `ismd-app` client allows `http://localhost:3000/*`
as a redirect URI / web origin (auth), and the App Gateway exposes
`/popisujeme/be/*` → backend with the `/be` prefix stripped (data). Both are
configured in terraform and **DEV only** — TEST/PROD trust neither (localhost is
not allowed, and their backends stay internal-only BFF).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
