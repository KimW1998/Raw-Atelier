# Raw Atelier

A premium marketing website for **Raw Atelier** — a creative embroidery and textile studio based in the Netherlands.

> *Made to tell your story*

## Tech Stack

- **Vite 6** + **React 19**
- **TypeScript**
- **React Router** (locale routing)
- **Tailwind CSS**
- **Framer Motion**
- **Lucide Icons**
- **Decap CMS** (free, git-based content management)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/en` or `/nl`.

### Content Management (CMS)

All text content lives in `/content/{locale}/*.yaml` — outside the app code.

```bash
# Terminal 1: run the site
npm run dev

# Terminal 2: run the CMS backend (local editing)
npm run cms
```

Then open **http://localhost:3000/admin** to edit content in a visual UI.

See [content/README.md](content/README.md) for full CMS documentation.

## Languages

| Locale | URL prefix | Content folder |
|--------|------------|----------------|
| English | `/en` | `content/en/` |
| Dutch | `/nl` | `content/nl/` |

Use the **EN / NL** switcher in the navigation bar to change language.

## Project Structure

```
content/                # CMS content (YAML) — edit here or via /admin
├── en/
└── nl/
src/
├── pages/              # Route pages
├── components/
├── i18n/               # Locale context and routing helpers
├── layouts/
└── lib/
    ├── content.ts      # Loads YAML at build time
    └── constants.ts    # Structural data (images, IDs)
public/
├── admin/              # Decap CMS interface
└── images/
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/en`, `/nl` | Hero, services overview, featured work, about preview, testimonials, process, contact CTA |
| About | `/en/about`, `/nl/about` | Story, philosophy, FAQ |
| Services | `/en/services`, `/nl/services` | All service offerings with details |
| Portfolio | `/en/portfolio`, `/nl/portfolio` | Filterable masonry gallery with lightbox |
| Shop | `/en/shop`, `/nl/shop` | Landing page linking to [rawluxurystitches.com](https://www.rawluxurystitches.com) |
| Contact | `/en/contact`, `/nl/contact` | Contact form with thank-you state |
| CMS Admin | `/admin` | Decap CMS content editor |

## Brand Colors

| Name | Hex |
|------|-----|
| Primary Pink | `#E7A7C7` |
| Light Pink | `#F6DCE8` |
| Accent Pink | `#D98AB5` |
| Black | `#111111` |
| Off-white | `#FAF8F6` |

## Deployment on Netlify

This project builds to a static `dist/` folder — no server-side runtime required.

### Option 1: Git-based deployment (recommended)

1. Push this repository to GitHub, GitLab, or Bitbucket
2. Log in to [Netlify](https://app.netlify.com)
3. Click **Add new site** → **Import an existing project**
4. Connect your repository
5. Build settings are auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 20
6. Click **Deploy site**

### Option 2: Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Build the project
npm run build

# Deploy (first time will prompt for site creation)
netlify deploy --prod
```

### Environment Variables

No environment variables are required for the base site. If you connect a form backend (e.g. Netlify Forms, Formspree), add the relevant keys in the Netlify dashboard under **Site settings → Environment variables**.

### CMS on Netlify (production editing)

1. Deploy the site to Netlify
2. Go to **Site settings → Identity** → Enable Identity
3. Under Identity, enable **Git Gateway**
4. Invite yourself via **Identity → Invite users**
5. Click the invite link — it should open `/admin` with a password setup screen
6. Visit `https://yoursite.com/admin` and log in to edit content

Changes made in the CMS are committed to your git repo and trigger a new deploy.

## Images

Placeholder images use premium Unsplash photography. Replace files in `/public/images/` with your own photography for production:

- `/public/images/hero-main.jpg`
- `/public/images/about-*.jpg`
- `/public/images/services/*.jpg`
- `/public/images/portfolio/*.jpg`
- `/public/images/shop/*.jpg`
- `/public/images/logo-business-card.png` (your business card logo)

## SEO

The site includes:

- Per-page metadata and Open Graph tags (custom SEO component)
- JSON-LD structured data (LocalBusiness schema)
- `sitemap.xml` and `robots.txt` (generated at build time)
- Semantic HTML and accessible navigation

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check, production build, and generate sitemap/robots |
| `npm run preview` | Preview the production build locally |
| `npm run cms` | Start Decap CMS local backend |
| `npm run cms:config` | Regenerate CMS config files |

## License

Private — © Raw Atelier. All rights reserved.
