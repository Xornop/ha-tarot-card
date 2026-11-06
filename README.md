# HA Tarot Card

A standalone Lovelace custom card that draws a random tarot card and opens it in a dialog. It does not require Mushroom, Browser Mod, or any other frontend integration.

## Features

- Includes all 78 original card images (minor and major arcana)
- Reversed cards like in real life give a different interpretation
- Configurable title, language, image URL and reversed-card probability.
- Mystic dark-purple/gold design with a custom tarot-card icon and a card-flip reveal.
- Also available as a **badge** (`custom:tarot-badge`) for the top of a dashboard view.

## Install with HACS

1. In HACS, open **⋮ → Custom repositories**.
2. Add this repository's GitHub URL and select **Dashboard** as the category.
3. Find **HA Tarot Card** in HACS and install it.
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
subtitle: Tap to draw your card
icon: tarot
accent: "#d4af37"
lang: en
image_path: /hacsfiles/tarot-card/tarot_cards/
reversed_probability: 40
```

| Option | Default | Description |
|---|---|---|
| `title` | `Draw a tarot card` | Text shown on the card before drawing |
| `subtitle` | `Tap to draw your card` | Small text under the title (card only). Use `false` to hide |
| `icon` | `tarot` | `tarot` = built-in tarot card icon, or any icon such as `mdi:cards-outline` |
| `accent` | `#d4af37` | Accent colour (gold by default) |
| `lang` | `en` | Language code. Built in: `en`, `nl`. Any other code needs a matching file in `dist/lang/` (see below) |
| `image_path` | `/hacsfiles/tarot-card/tarot_cards/` | URL path to the upright `.avif` images |
| `reversed_probability` | `40` | Chance (0–100) of drawing a reversed card |

## Use as a badge

Add it under `badges:` in a dashboard view (YAML mode):

```yaml
badges:
  - type: custom:tarot-badge
    lang: nl
```

Icon only, with a different icon:

```yaml
badges:
  - type: custom:tarot-badge
    icon: mdi:cards-outline
    show_label: false
```

The badge supports the same options as the card (except `subtitle`), plus:

| Option | Default | Description |
|---|---|---|
| `show_label` | `true` | Show the text next to the icon. Set to `false` for an icon-only badge |

The default badge label is `Tarot`; change it with `title`.

`image_path` is optional. The default points to the image folder installed by HACS. Change it only if you want to host the images elsewhere.
