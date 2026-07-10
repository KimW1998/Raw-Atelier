import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "nl", label: "Dutch" },
];

function makeServiceFields(id, label) {
  return {
    label,
    name: id,
    widget: "object",
    fields: [
      { label: "Title", name: "title", widget: "string" },
      { label: "Short Description", name: "shortDescription", widget: "text" },
      { label: "Description", name: "description", widget: "text" },
      {
        label: "Benefits",
        name: "benefits",
        widget: "list",
        field: { label: "Benefit", name: "benefit", widget: "string" },
      },
      {
        label: "Process Steps",
        name: "process",
        widget: "list",
        field: { label: "Step", name: "step", widget: "string" },
      },
    ],
  };
}

const CONTENT_FILES = [
  {
    name: "global",
    label: "Site Settings",
    fields: [
      {
        label: "Brand",
        name: "brand",
        widget: "object",
        fields: [
          { label: "Name", name: "name", widget: "string" },
          { label: "Tagline", name: "tagline", widget: "string" },
        ],
      },
      {
        label: "Navigation",
        name: "nav",
        widget: "object",
        fields: [
          { label: "Home", name: "home", widget: "string" },
          { label: "About", name: "about", widget: "string" },
          { label: "Services", name: "services", widget: "string" },
          { label: "Portfolio", name: "portfolio", widget: "string" },
          { label: "Shop", name: "shop", widget: "string" },
          { label: "Contact", name: "contact", widget: "string" },
          { label: "Work With Me", name: "workWithMe", widget: "string" },
        ],
      },
      {
        label: "Footer",
        name: "footer",
        widget: "object",
        fields: [
          { label: "Description", name: "description", widget: "text" },
          { label: "Navigate", name: "navigate", widget: "string" },
          { label: "Get in Touch", name: "getInTouch", widget: "string" },
          { label: "Location", name: "location", widget: "string" },
          { label: "Handcrafted note", name: "handcrafted", widget: "string" },
          { label: "Rights", name: "rights", widget: "string" },
        ],
      },
      {
        label: "CTAs",
        name: "cta",
        widget: "object",
        fields: [
          { label: "Work With Me", name: "workWithMe", widget: "string" },
          { label: "View Portfolio", name: "viewPortfolio", widget: "string" },
          { label: "Get in Touch", name: "getInTouch", widget: "string" },
          { label: "Ready Title", name: "readyTitle", widget: "string" },
          { label: "Ready Description", name: "readyDescription", widget: "text" },
        ],
      },
    ],
  },
  {
    name: "home",
    label: "Home Page",
    fields: [
      {
        label: "Home",
        name: "home",
        widget: "object",
        fields: [
          {
            label: "Hero",
            name: "hero",
            widget: "object",
            fields: [
              { label: "Headline", name: "headline", widget: "string" },
              { label: "Introduction", name: "intro", widget: "text" },
            ],
          },
          {
            label: "Services Section",
            name: "services",
            widget: "object",
            fields: [
              { label: "Eyebrow", name: "eyebrow", widget: "string" },
              { label: "Title", name: "title", widget: "string" },
              { label: "Description", name: "description", widget: "text" },
            ],
          },
          {
            label: "About Preview",
            name: "about",
            widget: "object",
            fields: [
              { label: "Eyebrow", name: "eyebrow", widget: "string" },
              { label: "Title", name: "title", widget: "string" },
              { label: "Paragraph 1", name: "paragraph1", widget: "text" },
              { label: "Paragraph 2", name: "paragraph2", widget: "text" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "about",
    label: "About Page",
    fields: [
      {
        label: "About",
        name: "about",
        widget: "object",
        fields: [
          {
            label: "Hero",
            name: "hero",
            widget: "object",
            fields: [
              { label: "Title", name: "title", widget: "string" },
              { label: "Description", name: "description", widget: "text" },
            ],
          },
          {
            label: "Story",
            name: "story",
            widget: "object",
            fields: [
              { label: "Eyebrow", name: "eyebrow", widget: "string" },
              { label: "Title", name: "title", widget: "string" },
              { label: "Paragraph 1", name: "paragraph1", widget: "text" },
              { label: "Paragraph 2", name: "paragraph2", widget: "text" },
            ],
          },
          {
            label: "Philosophy",
            name: "philosophy",
            widget: "object",
            fields: [
              { label: "Title", name: "title", widget: "string" },
              { label: "Description", name: "description", widget: "text" },
              { label: "Quote", name: "quote", widget: "text" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "services",
    label: "Services",
    fields: [
      {
        label: "Services Page",
        name: "servicesPage",
        widget: "object",
        fields: [
          {
            label: "Hero",
            name: "hero",
            widget: "object",
            fields: [
              { label: "Title", name: "title", widget: "string" },
              { label: "Description", name: "description", widget: "text" },
            ],
          },
        ],
      },
      {
        label: "Service Items",
        name: "services",
        widget: "object",
        fields: [
          makeServiceFields("live-events", "Live Events"),
          makeServiceFields("corporate", "Corporate"),
          makeServiceFields("gifts", "Gifts"),
          makeServiceFields("digitizing", "Digitizing"),
          makeServiceFields("fashion", "Sewing"),
        ],
      },
    ],
  },
  {
    name: "contact",
    label: "Contact Page",
    fields: [
      {
        label: "Contact Page",
        name: "contactPage",
        widget: "object",
        fields: [
          {
            label: "Hero",
            name: "hero",
            widget: "object",
            fields: [
              { label: "Title", name: "title", widget: "string" },
              { label: "Description", name: "description", widget: "text" },
            ],
          },
          {
            label: "Form",
            name: "form",
            widget: "object",
            fields: [
              { label: "Name", name: "name", widget: "string" },
              { label: "Email", name: "email", widget: "string" },
              { label: "Message", name: "message", widget: "string" },
              { label: "Send Button", name: "send", widget: "string" },
              { label: "Thank You Title", name: "thankYouTitle", widget: "string" },
              { label: "Thank You Description", name: "thankYouDescription", widget: "text" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "shared",
    label: "Testimonials & FAQ",
    fields: [
      {
        label: "Testimonials",
        name: "testimonials",
        widget: "object",
        fields: ["1", "2", "3"].map((id) => ({
          label: `Testimonial ${id}`,
          name: id,
          widget: "object",
          fields: [
            { label: "Quote", name: "quote", widget: "text" },
            { label: "Author", name: "author", widget: "string" },
            { label: "Role", name: "role", widget: "string" },
            { label: "Company", name: "company", widget: "string", required: false },
          ],
        })),
      },
      {
        label: "FAQ",
        name: "faq",
        widget: "object",
        fields: ["1", "2", "3", "4", "5"].map((id) => ({
          label: `Question ${id}`,
          name: id,
          widget: "object",
          fields: [
            { label: "Question", name: "question", widget: "string" },
            { label: "Answer", name: "answer", widget: "text" },
          ],
        })),
      },
      {
        label: "Process Steps",
        name: "process",
        widget: "object",
        fields: ["1", "2", "3", "4"].map((id) => ({
          label: `Step ${id}`,
          name: id,
          widget: "object",
          fields: [
            { label: "Title", name: "title", widget: "string" },
            { label: "Description", name: "description", widget: "text" },
          ],
        })),
      },
    ],
  },
];

function buildConfig(backend) {
  const files = LOCALES.flatMap((locale) =>
    CONTENT_FILES.map((file) => ({
      label: `${locale.label}: ${file.label}`,
      name: `${locale.code}-${file.name}`,
      file: `content/${locale.code}/${file.name}.yaml`,
      fields: file.fields,
    }))
  );

  return {
    backend,
    media_folder: "public/images/uploads",
    public_folder: "/images/uploads",
    collections: [
      {
        name: "site-content",
        label: "Site Content",
        files,
      },
    ],
  };
}

const prodConfig = buildConfig({ name: "git-gateway", branch: "main" });
const localConfig = buildConfig({
  name: "proxy",
  proxy_url: "http://localhost:8081/api/v1",
  branch: "main",
});

const adminDir = path.join(process.cwd(), "public/admin");
const header = "# Auto-generated — run: node scripts/generate-cms-config.mjs\n";

fs.writeFileSync(
  path.join(adminDir, "config.yml"),
  header + yaml.dump(prodConfig, { lineWidth: 120, noRefs: true })
);
fs.writeFileSync(
  path.join(adminDir, "config.local.yml"),
  header + yaml.dump(localConfig, { lineWidth: 120, noRefs: true })
);

console.log("Generated public/admin/config.yml and config.local.yml");
