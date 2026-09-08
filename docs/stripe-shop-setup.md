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


Zonder `RESEND_API_KEY` worden mails in de function-logs geschreven, niet verstuurd.

## Ordermails (Resend)

Na een betaalde checkout stuurt de webhook jou een mail met wat je moet verzenden (aantal, opties, adres). De koper krijgt van Raw Atelier een bedankmail (NL of EN, afhankelijk van de shoptaal). Digitale PDF's staan daarin met downloadlink.

1. Maak een account op [resend.com](https://resend.com).
2. Voeg je verzenddomein toe (voor `info@rawluxury.nl`: **rawluxury.nl**) en rond DNS-verificatie af.
3. Maak een API key.
4. Zet in Netlify (**Site settings → Environment variables**) én in lokale `.env`:

| Variable | Voorbeeld |
|----------|-----------|
| `RESEND_API_KEY` | `re_...` |
| `ORDER_NOTIFY_EMAIL` | `info@rawluxury.nl` (jouw inbox) |
| `ORDER_FROM_EMAIL` | `Raw Atelier <info@rawluxury.nl>` |

`ORDER_FROM_EMAIL` moet een adres zijn op het **geverifieerde** domein in Resend. Zonder geverifieerd domein weigert Resend de mail (vaak 403) en zie je niets in je inbox. Tot DNS klaar is mag je tijdelijk `Raw Atelier <beth.t@example.com>` gebruiken: die mag alleen naar het e-mailadres van je Resend-account.

Zet `RESEND_API_KEY`, `ORDER_FROM_EMAIL` en `ORDER_NOTIFY_EMAIL` op **dezelfde scopes als je Stripe-keys** (Functions + Runtime / All scopes). Als ze alleen onder **Builds** staan, werkt checkout wel en voorraad ook, maar er gaat **geen call naar Resend**. Na wijzigen: opnieuw deployen.

Als er geen mail aankomt: Netlify → **Functions** → `stripe-webhook` → logs. Daar staat of de key ontbreekt of Resend de mail weigert.

Testen: Stripe testbetaling + `stripe listen` (webhook). Je moet een mail krijgen met **TE VERZENDEN** en het adres. In Resend → **Emails** zie je of het is aangekomen.

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

Zet in de studio bij een digitaal product het veld **Downloadlink (PDF)** op een URL naar het bestand (Google Drive of Dropbox, “iedereen met de link”). Na betaling krijgt de koper die link in de mail. Laat je het veld leeg, dan vraagt de mail aan Kim om het bestand na te sturen. De link staat niet op de shoppagina.

## Personalisatie

Producten met `personalization: true` tonen in Stripe een extra tekstveld (naam of borduurtekst). Daarna neem je zoals nu contact op om stof en kleuren te bevestigen.