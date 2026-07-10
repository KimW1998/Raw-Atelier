# Raw Atelier Content

All website text lives here as YAML files — separate from the app code.

## Structure

```
content/
├── en/          # English content
│   ├── global.yaml    # Nav, footer, CTAs, SEO metadata
│   ├── home.yaml      # Home page sections
│   ├── about.yaml     # About page
│   ├── services.yaml  # Services page + all service details
│   ├── portfolio.yaml # Portfolio page + item titles
│   ├── shop.yaml      # Shop page + products
│   ├── contact.yaml   # Contact page + form labels
│   └── shared.yaml    # Testimonials, FAQ, process steps
└── nl/          # Dutch content (same structure)
```

## Editing content

### Option 1: CMS Admin UI (recommended)

1. Run the site: `npm run dev`
2. In a second terminal: `npm run cms`
3. Open **http://localhost:3000/admin**
4. Edit content in the visual editor — changes save to these YAML files

> **Note:** On localhost the CMS uses `config.local.yml` (proxy backend). On production it uses `config.yml` (Netlify Git Gateway). CMS config is auto-generated — run `npm run cms:config` after changing field definitions in `scripts/generate-cms-config.mjs`.

### Local development — no login needed

With `npm run cms` running, the CMS connects to your local files directly. **You should not need to log in** on localhost. If you still see a login screen, restart both terminals and hard-refresh `/admin`.

### Production (Netlify) — login required

On your deployed site, login uses **Netlify Identity**:

1. In Netlify: **Site settings → Identity** → Enable Identity
2. Under Identity: **Enable Git Gateway**
3. Go to **Identity → Invite users** and invite your email
4. Accept the invite email and set a password
5. Log in at `https://yoursite.com/admin` with that email and password

There are no default CMS credentials — you create them via Netlify Identity invite.

### Option 2: Edit YAML directly

Open any file in `content/en/` or `content/nl/` and edit the text. Rebuild or refresh the dev server to see changes.

## Adding a new language

1. Copy `content/en/` to `content/{locale}/`
2. Translate all YAML files
3. Add the locale to `src/i18n/routing.ts`
4. Update `public/admin/config.yml` i18n locales
