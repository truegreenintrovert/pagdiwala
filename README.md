# Pagdiwala

Pagdiwala is a wedding turban and safa rental application for appointment-based service in Bilaspur and nearby areas. Customers browse free-size turbans, place rental requests, and receive updates while the admin manages products, policies, customers, and orders.

## Project layout

- `apps/web` — React/Vite web application
- `supabase/functions/auth` — secure registration function
- `supabase/functions/send-email` — order notification function
- `dist/apps/web` — production static build output

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

The development site runs at `http://localhost:3000`.

## Build for hosting

```bash
npm run build
```

The result is a static website in `dist/apps/web`. It can be uploaded to a static host such as GitHub Pages or a hosting `public_html` folder. Node.js is required to build the app, but not to serve the generated files.

## Supabase functions

Link the project and deploy the functions:

```bash
npx supabase login
npx supabase link --project-ref obqwvwnjtwqowygzpqib
npx supabase functions deploy auth --no-verify-jwt
npx supabase functions deploy send-email
```

Order emails require the `RESEND_API_KEY` and `EMAIL_FROM` secrets in Supabase. See [apps/web/docs/SETUP.md](apps/web/docs/SETUP.md) for the complete setup guide. Never commit `.env` files, API keys, or service-role keys.

## GitHub deployment

Pushing to `main` runs the GitHub Actions deployment workflow. The workflow builds the app and publishes `dist/apps/web` as the site root.

## License

This project is licensed under the MIT License. See [apps/web/LICENSE](apps/web/LICENSE).
