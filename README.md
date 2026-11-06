# Tarot Card for Home Assistant

A standalone Lovelace custom card that draws a random tarot card and opens it in a dialog. It does not require Mushroom, Browser Mod, or any other frontend integration.

## Features

- Includes all 78 original card images.
- English and Dutch interface, card names and interpretations.
- Reversed cards for extra meaning
- Configurable title, language, image URL and reversed-card probability.
- Keeps the Dutch card names and interpretations from the original configuration.

## Install with HACS

1. In HACS, open **⋮ → Custom repositories**.
2. Add this repository's GitHub URL and select **Dashboard** as the category.
3. Find **Tarot Card** in HACS and install it.
4. Refresh the browser / Home Assistant app.

HACS installs the JavaScript file and the included image folder together. You do **not** need to download or copy the images separately.

## Use the card

Minimal configuration:

```yaml
type: custom:tarot-card
```

Dutch:

```yaml
type: custom:tarot-card
lang: nl
```

All options:

```yaml
type: custom:tarot-card
title: Draw a tarot card
lang: en
image_path: /hacsfiles/tarot-card/tarot_cards/
reversed_probability: 40
```

| Option | Default | Description |
|---|---|---|
| `title` | `Draw a tarot card` | Text shown on the card before drawing |
| `lang` | `en` | Interface and card text language: `en` or `nl` |
| `image_path` | `/hacsfiles/tarot-card/tarot_cards/` | URL path to the upright `.avif` images |
| `reversed_probability` | `40` | Chance (0–100) of drawing a reversed card |

`image_path` is optional. The default points to the image folder installed by HACS. Change it only if you want to host the images elsewhere.

## Included images

The repository contains all 78 upright `.avif` files in `dist/tarot_cards/`. HACS installs them next to the card's distribution files, so the card can load them automatically.

## Development

The card is a single JavaScript file and has no build step or runtime dependencies.
