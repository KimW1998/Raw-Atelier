# Raw Atelier

Marketing site and shop for **Raw Atelier** — a creative embroidery studio in the Netherlands (legal entity **Raw Luxury**, public brand Raw Atelier). Dutch is the default language; English is available throughout.

Site: [www.rawatelier.nl](https://www.rawatelier.nl)

## Tech stack

- **Vite 6** + **React 19** + **TypeScript**
- **React Router** (locale prefixes `/nl` and `/en`)
- **Tailwind CSS**, **Framer Motion**, **Lucide**
- **Netlify** (static host, Functions, Forms, Identity, Database)
- **Stripe** Checkout for the shop
- Visual **studio** at `/studio` (primary editor) and **Decap CMS** at `/admin`

## Getting started

```bash
npm install
```

For the full site **including checkout, studio save, and stock**, use Netlify Dev:

```bash
npx netlify dev
```

Open [http://localhost:8888](http://localhost:8888) — you are redirected to `/nl`.

Vite only (no functions):

```bash
npm run dev
```

Opens [http://localhost:3000](http://localhost:3000). Studio **save** needs Netlify Dev (`/api/studio-save`).

Copy `.env.example` to `.env` for Stripe, email, Analytics, and shop visibility. Never commit `.env`.

## Editing the site

### Studio (recommended)

1. `npx netlify dev`
2. Open [http://localhost:8888/studio](http://localhost:8888/studio)
3. Edit copy (NL left, EN right), portfolio photos, shop products, and vacation mode
4. **Opslaan** writes local files. Push/deploy to put changes live

Studio pages include home, about, services, portfolio, shop, contact, FAQ, menu & footer (vacation banner), and legal.

### Decap CMS

```bash
npm run dev    # terminal 1
npm run cms    # terminal 2
```

Then [http://localhost:3000/admin](http://localhost:3000/admin). See [content/README.md](content/README.md).

## Shop

The shop is **always visible locally**. On production it stays hidden until `VITE_SHOP_ENABLED=true`.

- Physical products: shipping **Netherlands only**
- Digital sewing/embroidery PDFs: worldwide, emailed after payment
- Cart and Stripe Checkout; live stock after paid orders (Netlify Database)
- Product options (name, letters, hardware) live in `src/data/shop-catalog.json` (studio: Shop)

Vacation mode (studio → **Menu & footer**): banner for longer lead times, optional pause on physical checkout. Flags: `src/data/vacation.json`. Copy: `content/*/global.yaml` under `vacation`.

Stripe setup: [docs/stripe-shop-setup.md](docs/stripe-shop-setup.md). After schema changes: `npm run db:migrate` locally; hosted DB migrates on deploy.

## Languages

| Locale | URL | Content |
|--------|-----|---------|
| Dutch (default) | `/nl` | `content/nl/` |
| English | `/en` | `content/en/` |

## Project structure

```
content/                    # YAML copy (NL/EN) + portfolio-items.yaml
src/
├── pages/
├── components/
├── studio/                 # Visual editor
├── i18n/
├── layouts/
└── lib/
    ├── shop.ts
    ├── vacation.ts
    └── content.ts
src/data/
├── shop-catalog.json
└── vacation.json
netlify/functions/          # Checkout, webhook, stock, studio save
netlify/database/migrations/
public/images/
```

## Pages

| Page | Route | Notes |
|------|-------|--------|
| Home | `/nl`, `/en` | Hero, services, featured portfolio, about, Instagram, process |
| About | `…/about` | Story and studio |
| Services | `…/services` | Service details |
| Portfolio | `…/portfolio` | Filterable gallery + lightbox |
| Shop | `…/shop` | Hidden on production until `VITE_SHOP_ENABLED=true` |
| Cart | `…/shop/cart` | |
| FAQ | `…/faq` | |
| Contact | `…/contact` | Netlify Forms on production |
| Legal | `…/legal/*` | Terms, shipping, privacy, disclaimer, cookies |
| Studio | `/studio` | Local editor |
| CMS | `/admin` | Decap |

## Brand colours

| Name | Hex |
|------|-----|
| Primary pink | `#E7A7C7` |
| Light pink | `#F6DCE8` |
| Accent pink | `#D98AB5` |
| Black | `#111111` |
| Off-white | `#FAF8F6` |

## Images

Photos live in `public/images/`. Portfolio items (file, category, NL/EN title, featured) are in `content/portfolio-items.yaml` and editable in the studio.

Shop product photos: `public/images/shop/`. Service photos: `public/images/services/`.

Prefer web-sized JPEGs (about 1800px on the long edge). Add files under `public/images/` and point YAML/JSON at the public path (e.g. `/images/portfolio/…`).

Instagram on the homepage uses [Behold](https://behold.so). See [docs/instagram-setup.md](docs/instagram-setup.md).

## Deployment (Netlify)

Git push to the linked repo deploys production. `netlify.toml` sets:

- **Build:** `npm run build`
- **Publish:** `dist`
- **Node:** 20

Functions run on Netlify. Contact form: enable **Forms** detection, confirm the `contact` form, add an email notification. Locally the form opens mail to `info@rawluxury.nl`.

### Environment variables (Netlify)

| Variable | Purpose |
|----------|---------|
| `VITE_SHOP_ENABLED` | `true` to show the shop on the live site |
| `STRIPE_SECRET_KEY` | Checkout |
| `STRIPE_WEBHOOK_SECRET` | Paid-order emails and stock |
| `STRIPE_SHIPPING_AMOUNT_CENTS` | Default `695` |
| `ORDER_NOTIFY_EMAIL` / `ORDER_FROM_EMAIL` | Order mail |
| `RESEND_API_KEY` | Sending mail |
| `VITE_GA_MEASUREMENT_ID` | GA4 after cookie consent |

Decap on production: enable **Identity** + **Git Gateway**, invite yourself, log in at `/admin`.

## SEO

- Per-page title, description, Open Graph (and Twitter image when set)
- JSON-LD `LocalBusiness`
- `sitemap.xml` and `robots.txt` at build time
- Bilingual portfolio titles used as image alt text

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite only |
| `npx netlify dev` | Site + functions (port 8888) |
| `npm run build` | CMS config, typecheck, Vite build, sitemap |
| `npm run preview` | Preview `dist/` |
| `npm run cms` | Decap local proxy |
| `npm run cms:config` | Regenerate Decap config |
| `npm run db:migrate` | Apply Netlify Database migrations locally |

## License

Private — © Raw Atelier / Raw Luxury. All rights reserved.
