# Instagram op de homepage (zonder developer-account)

De homepage haalt je laatste Instagram-posts op via [Behold](https://behold.so). Geen Meta Developer-account nodig, geen CMS, geen handmatig foto's uploaden.

## Stappen (±5 minuten)

1. Ga naar [behold.so](https://behold.so) en maak een **gratis account**
2. Klik **Connect source** en koppel `@raw_luxury_atelier`
3. Klik **+ Add Feed** → kies **JSON**
4. Stel in:
   - **Max posts:** `6` (2 rijen × 3 kolommen)
   - **Allowed types:** Image + Carousel (optioneel)
5. Kopieer je **Feed ID** uit de feed-URL  
   Voorbeeld: `https://feeds.behold.so/abc123xyz` → Feed ID is `abc123xyz`

## Op Netlify instellen

1. **Site settings → Environment variables**
2. Voeg toe:

| Variabele | Waarde |
|---|---|
| `VITE_BEHOLD_FEED_ID` | Je Behold feed ID |

3. **Redeploy** de site (Vite leest deze variabele bij build)

## Lokaal testen

```bash
cp .env.example .env
# Zet VITE_BEHOLD_FEED_ID=je-feed-id in .env

npm run dev
```

## Hoe het werkt

- Behold vernieuwt je posts automatisch (zij regelen de Instagram-koppeling)
- De site haalt `https://feeds.behold.so/JOUW_FEED_ID` op wanneer iemand de homepage bezoekt
- Je eigen layout blijft: subtiele 2-rijen-grid + grote profielkaart

## Kosten

Behold heeft een **gratis plan** dat voor deze site voldoende is. Check [behold.so/pricing](https://behold.so/pricing) als je later meer feeds nodig hebt.

## Problemen?

**Geen tegels zichtbaar**

- Controleer of `VITE_BEHOLD_FEED_ID` op Netlify staat
- Na toevoegen opnieuw deployen
- Test de feed-URL direct in je browser: je moet JSON met `posts` zien

**Oude foto's**

- Behold cache kan even duren; meestal binnen enkele minuten bijgewerkt na een nieuwe post

**Feed werkt in browser maar niet op site**

- Variabele moet `VITE_` heten (Vite vereiste)
- Opnieuw builden na env-wijziging
