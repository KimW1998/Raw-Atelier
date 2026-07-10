# WooCommerce instellen voor de Raw Atelier shop

De shop op [raw-atelier.netlify.app](https://raw-atelier.netlify.app) toont producten van [rawluxurystitches.com](https://www.rawluxurystitches.com). Bij elke build worden producten automatisch opgehaald en in de juiste tab gezet.

Je hoeft WooCommerce nergens in de websiteteksten te noemen. Bezoekers bestellen altijd op **Raw Luxury Stitches**.

---

## Hoe de koppeling werkt

1. Je publiceert of wijzigt een product in WooCommerce (Raw Luxury Stitches).
2. Je wijst het product de **juiste productcategorie** toe (zie tabel hieronder).
3. Bij `npm run build` of een Netlify-deploy draait `scripts/sync-shop-products.mjs`.
4. Het script schrijft `src/data/shop-products.json` en de site toont het product in de juiste tab.

**Belangrijk:** de **slug** van de WooCommerce-categorie moet exact overeenkomen met de waarden in de tabel. De slug zie je in WooCommerce onder *Producten → Categorieën* (kolom *Slug*).

---

## Shop-tabs en WooCommerce-categorieën

| Tab op Raw Atelier | WooCommerce categorienaam (voorbeeld) | **Verplichte slug** | Badge op de site | Voorbeeldproducten |
|---|---|---|---|---|
| **Baby & cadeaus** | Baby & Gifts | `baby-gifts` | Geborduurd | Naamslingers, stoffen ballonnen |
| **Keychains** | Keychains | `keychains` | Geborduurd | Geborduurde keychains |
| **Patches** | Patches | `patches` of `embroidered-patches` | Geborduurd | Geborduurde patches |
| **Pouches & tassen** | Pouches & Bags | `pouches` of `bags` | Geborduurd | Trekkoordtassen, pouches |
| **Naaitpatronen** | Digital Sewing Patterns | `digital-sewing-patterns` | Digitaal patroon | PDF naaipatronen |
| **Op bestelling** | *(geen WooCommerce)* | — | Op bestelling | E-reader cases, custom pouches via contactformulier |

Producten zonder herkenbare categorie verschijnen **niet** in een shop-tab (ze krijgen intern het label `gifts` en worden gefilterd).

---

## Stap voor stap in WooCommerce

### 1. Categorieën aanmaken (eenmalig)

1. Log in op **rawluxurystitches.com/wp-admin**
2. Ga naar **Producten → Categorieën**
3. Maak per rij in de tabel hierboven een categorie aan
4. Vul een duidelijke **naam** in (mag Nederlands of Engels)
5. Stel de **slug** handmatig in op de exacte waarde uit de tabel (bijv. `baby-gifts`, niet `baby-gifts-2`)
6. Sla op

**Tip:** gebruik liever één slug per tab. Voor patches kun je `patches` kiezen; `embroidered-patches` werkt ook.

### 2. Product toevoegen of bewerken

1. Ga naar **Producten → Nieuw product** (of bewerk een bestaand product)
2. Vul titel, prijs, afbeelding en beschrijving in
3. Onder **Productcategorieën** vink **één hoofdcategorie** aan (de tab waar het product moet verschijnen)
4. Publiceer het product

### 3. Controleren op de marketing-site

Na deploy (of lokaal `npm run build`):

- Open `/nl/shop` of `/en/shop`
- Klik op de juiste tab
- Het product hoort daar te staan met de juiste badge (*Geborduurd* of *Digitaal patroon*)

---

## Per categorie: wat hoort waar?

### Baby & cadeaus (`baby-gifts`)

- Gepersonaliseerde babycadeaus en feestcadeaus
- Naamslingers, stoffen ballonnen, keepsakes
- Meestal geborduurd en op bestelling gemaakt

### Keychains (`keychains`)

- Kleine geborduurde cadeaus
- Keychains, charms, bedankjes

### Patches (`patches`)

- Geborduurde patches voor jassen, tassen en accessoires
- Nieuwe patches verschijnen automatisch zodra ze gepubliceerd zijn met deze categorie

### Pouches & tassen (`pouches` of `bags`)

- Trekkoordtassen, pouches, zachte tassen
- Gepersonaliseerd borduurwerk op stof

### Naaitpatronen (`digital-sewing-patterns`)

- **Digitale downloads** (PDF)
- Geen fysiek verzendproduct
- Krijgt automatisch de badge *Digitaal patroon*
- Hoort bij dienst **Naaiwerk & Creatieve Projecten**, niet bij borduurdiensten

### Op bestelling (geen WooCommerce-tab)

Deze stukken staan **niet** in WooCommerce als standaardproduct:

- Quilted e-reader & tablet cases
- Custom pouches & accessoires op maat

Klanten vragen die aan via het **contactformulier** op raw-atelier.netlify.app. Teksten staan in `content/*/shop.yaml` onder `madeToOrder`.

---

## Uitzondering: product per slug koppelen

Sommige bestaande producten zijn handmatig gekoppeld op product-slug (vooral oudere items). Dat staat in `scripts/sync-shop-products.mjs` onder `SECTION_BY_SLUG`:

| Product slug | Tab |
|---|---|
| `fabric-name-banner` | Baby & cadeaus |
| `custom-fabric-balloon-with-embroidery` | Baby & cadeaus |
| `custom-embroidered-apple-keychain` | Keychains |
| `custom-embroidered-drawstring-bag` | Pouches & tassen |

**Wanneer gebruiken?** Alleen als een product niet via categorie past, of als tijdelijke fix. Voor nieuwe producten: altijd de juiste WooCommerce-categorie gebruiken.

### Nieuw product handmatig koppelen

1. Open `scripts/sync-shop-products.mjs`
2. Voeg onder `SECTION_BY_SLUG` een regel toe:

```js
"jouw-product-slug": "patches",
```

3. Geldige tab-waarden: `babyGifts`, `keychains`, `patches`, `pouches`, `patterns`
4. Commit en deploy

De product-slug vind je in WooCommerce bij het product (permalink) of in de product-URL.

---

## Nieuwe WooCommerce-categorie toevoegen aan de site

Als je een **nieuwe tab** op de marketing-site wilt (niet alleen een WooCommerce-categorie):

1. Voeg de categorie toe in WooCommerce (met vaste slug)
2. Voeg de slug toe in `SECTION_BY_CATEGORY` in `scripts/sync-shop-products.mjs`
3. Voeg de tab toe in `src/lib/shop.ts` (`SHOP_SECTION_ORDER`)
4. Voeg teksten toe in `content/en/shop.yaml` en `content/nl/shop.yaml` onder `shop.sections`
5. Build en deploy

---

## Veelgestelde vragen

**Het product staat niet in de shop-tab**

- Controleer of de categorie-slug exact klopt (kleine letters, streepjes)
- Controleer of het product **gepubliceerd** is
- Wacht op een nieuwe deploy (build synct producten opnieuw)
- Kijk in `src/data/shop-products.json` welke `section` het product heeft gekregen

**Het product staat in de verkeerde tab**

- Pas de WooCommerce-categorie aan (één duidelijke hoofdcategorie per product)
- Of voeg een slug-regel toe in `SECTION_BY_SLUG` als uitzondering

**Digitale patronen tonen badge 'Geborduurd'**

- Het product moet in categorie `digital-sewing-patterns` staan

**Moet ik iets doen op Netlify?**

- Nee, zolang de build slaagt. Elke deploy synct automatisch.

---

## Technische referentie

| Bestand | Functie |
|---|---|
| `scripts/sync-shop-products.mjs` | Haalt producten op en koppelt categorieën/slugs |
| `src/data/shop-products.json` | Gegenereerde productdata (niet handmatig bewerken) |
| `src/lib/shop.ts` | Volgorde en IDs van shop-tabs |
| `content/en/shop.yaml` / `content/nl/shop.yaml` | Tabtitels en beschrijvingen op de site |
