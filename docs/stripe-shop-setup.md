# Stripe-shop voor Raw Atelier

De shop op Raw Atelier gebruikt **Stripe Checkout**. Bezoekers blijven op de site tot ze afrekenen; betalen gebeurt op de beveiligde pagina van Stripe (iDEAL of kaart).

Fysieke producten gaan alleen naar **Nederland**. Digitale naaitpatronen mag **iedereen** kopen; die gaan per e-mail.

## Eenmalig in Stripe

1. Maak een Stripe-account (land Nederland, valuta EUR).
2. Zet **iDEAL** aan onder Payment methods.
3. Kopieer de **test** secret key (`sk_test_...`).
4. Maak een webhook-endpoint: `https://www.rawatelier.nl/api/stripe-webhook`
  - Event: `checkout.session.completed`
  - Kopieer de webhook signing secret (`whsec_...`)

Prijzen staan in `[src/data/shop-catalog.json](../src/data/shop-catalog.json)` (ook bewerkbaar in Decap CMS onder Shop products). Je hoeft producten niet eerst in Stripe aan te maken.

## Netlify environment variables

In **Site settings → Environment variables**:


| Variable                       | Voorbeeld                            |             |
| ------------------------------ | ------------------------------------ | ----------- |
| `STRIPE_SECRET_KEY`            | `sk_test_...` of later `sk_live_...` |             |
|                                | `STRIPE_WEBHOOK_SECRET`              | `whsec_...` |
| `STRIPE_SHIPPING_AMOUNT_CENTS` | `695` (€6,95 verzending NL)          |             |
| `ORDER_NOTIFY_EMAIL`           | `info@rawluxury.nl`                  |             |
| `ORDER_FROM_EMAIL`             | `Raw Atelier <info@rawluxury.nl>`    |             |
| `RESEND_API_KEY`               | optioneel, voor ordermails           |             |


Zonder `RESEND_API_KEY` worden mails in de function-logs geschreven, niet verstuurd. Voor echte mails: [Resend](https://resend.com) account, domein verifiëren, key plakken.

## Lokaal testen

Checkout-API draait via Netlify Functions. Open daarna **http://localhost:8888** (niet poort 3000):

```bash
npx netlify dev
```

Stripe CLI voor de webhook (tweede terminal):

```bash
stripe listen --forward-to localhost:8888/api/stripe-webhook
```

Zet de `whsec_...` uit die output in `.env`.

## Digitale PDF's

Zet in de catalogus bij een patroon het veld `digitalFile` op een URL naar het PDF-bestand. Na betaling krijgt de koper die link per mail. Laat je het veld leeg, dan vraagt de mail aan Kim om het bestand na te sturen.

## Personalisatie

Producten met `personalization: true` tonen in Stripe een extra tekstveld (naam of borduurtekst). Daarna neem je zoals nu contact op om stof en kleuren te bevestigen.