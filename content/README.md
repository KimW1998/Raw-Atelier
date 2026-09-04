# Raw Atelier content

Website copy lives here as YAML, separate from app code. The usual way to edit is the **studio** (`/studio` with `npx netlify dev`), which writes these files plus `src/data/shop-catalog.json` and `src/data/vacation.json`.

## Structure

```
content/
├── portfolio-items.yaml   # Photos, category, featured, NL/EN titles
├── en/
│   ├── global.yaml        # Nav, footer, metadata, cookies, vacation banner text
│   ├── home.yaml
│   ├── about.yaml
│   ├── services.yaml
│   ├── portfolio.yaml
│   ├── shop.yaml
│   ├── faq.yaml
│   ├── legal.yaml
│   ├── contact.yaml
│   └── shared.yaml
└── nl/                    # Same files in Dutch
```

Shop products (prices, photos, options, stock): `src/data/shop-catalog.json`.  
Vacation on/off and pause-physical: `src/data/vacation.json`.

## Studio (recommended)

1. `npx netlify dev`
2. Open `/studio`
3. Save writes local files; **git push / deploy** to go live

## Decap CMS

1. `npm run dev` and `npm run cms`
2. Open `http://localhost:3000/admin`

On localhost, Decap uses `config.local.yml` (no login). On production it uses Git Gateway + Netlify Identity. After changing fields in `scripts/generate-cms-config.mjs`, run `npm run cms:config`.

**Production login:** Identity on, Git Gateway on, invite your email, set a password at `/admin`.

## Edit YAML directly

Change files under `content/nl/` or `content/en/` and refresh the dev server.

## Adding a language

1. Copy `content/en/` to `content/{locale}/`
2. Translate the YAML
3. Add the locale in `src/i18n/context.tsx`
4. Run `npm run cms:config`
