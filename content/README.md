# Raw Atelier Content

All website text lives here as YAML files — separate from the app code.

## Structure

```
content/
├── portfolio-items.yaml  # Portfolio photos and NL/EN titles (Decap: Portfolio)
├── en/          # English content
│   ├── global.yaml
│   ├── home.yaml
│   ├── about.yaml
│   ├── services.yaml
│   ├── portfolio.yaml
│   ├── shop.yaml
│   ├── legal.yaml
│   ├── contact.yaml
│   └── shared.yaml
└── nl/          # Dutch content (same structure)
```

Shop product data (prices, photos, physical vs digital) lives in `src/data/shop-catalog.json` and is also editable in Decap under **Shop products**.

## Editing content

### Option 1: CMS Admin UI (recommended)

1. Run the site: `npm run dev`
2. In a second terminal: `npm run cms`
3. Open **http://localhost:3000/admin**
4. Edit content in the visual editor — changes save to these YAML files

Portfolio: open **Portfolio** to add photos, category and Dutch/English titles. Shop products: **Shop products** (prices in cents; checkout uses Stripe).

> **Note:** On localhost the CMS uses `config.local.yml` (proxy backend). On production it uses `config.yml` (Netlify Git Gateway). CMS config is auto-generated — run `npm run cms:config` after changing field definitions in `scripts/generate-cms-config.mjs`.

### Local development — no login needed

With `npm run cms` running, the CMS connects to your local files directly. **You should not need to log in** on localhost. If you still see a login screen, restart both terminals and hard-refresh `/admin`.

### Production (Netlify) — login required

On your deployed site, login uses **Netlify Identity**:

1. In Netlify: **Site settings → Identity** → Enable Identity
2. Under Identity: **Enable Git Gateway**
3. Go to **Identity → Invite users** and invite your email
4. Click the link in the invite email — you should land on `/admin` with a password setup screen
5. Set your password, then log in at `https://yoursite.com/admin`

There are no default CMS credentials — you create them via Netlify Identity invite.

**If the email link opens the homepage instead of a password screen:** redeploy the latest site version (it redirects identity links to `/admin`), then request a new invite or password reset from **Identity → Invite users**.

### Option 2: Edit YAML directly

Open any file in `content/en/` or `content/nl/` and edit the text. Rebuild or refresh the dev server to see changes.

## Adding a new language

1. Copy `content/en/` to `content/{locale}/`
2. Translate all YAML files
3. Add the locale to `src/i18n/context.tsx`
4. Run `npm run cms:config`
