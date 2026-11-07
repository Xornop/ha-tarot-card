/* Tarot Card for Home Assistant
 * Copyright (c) 2026
 * Licensed under the MIT License.
 */
const TAROT_IMAGE_BASE = new URL("./tarot_cards/", import.meta.url).href;


const TAROT_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-14 10.5 11.5)"><rect x="5" y="3" width="11" height="17" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".55"/></g><g transform="rotate(9 13.5 12.5)"><rect x="8" y="4" width="11" height="17" rx="1.6" style="fill:var(--tc-icon-fill,#2a1a52)" stroke="currentColor" stroke-width="1.4"/><path d="M13.5 8 L14.6 11.4 L18 12.5 L14.6 13.6 L13.5 17 L12.4 13.6 L9 12.5 L12.4 11.4 Z" fill="currentColor"/></g></svg>`;

const TAROT_BACK = `<svg viewBox="0 0 318 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <radialGradient id="tcb-bg" cx="50%" cy="40%" r="75%">
      <stop offset="0" stop-color="#4a2d8a"/><stop offset=".6" stop-color="#1f1240"/><stop offset="1" stop-color="#0e0820"/>
    </radialGradient>
    <path id="tcb-star" d="M0 -10 L2.4 -2.4 L10 0 L2.4 2.4 L0 10 L-2.4 2.4 L-10 0 L-2.4 -2.4 Z"/>
  </defs>
  <rect width="318" height="540" fill="url(#tcb-bg)"/>
  <g fill="none" stroke="currentColor">
    <rect x="10" y="10" width="298" height="520" rx="12" stroke-width="2.5"/>
    <rect x="22" y="22" width="274" height="496" rx="7" stroke-width="1" opacity=".6"/>
    <g transform="translate(159 270)">
      <circle r="104" stroke-width="1" opacity=".5"/>
      <circle r="92" stroke-width="2"/>
      <circle r="62" stroke-width="1" opacity=".7"/>
      <rect x="-60" y="-60" width="120" height="120" stroke-width="1.6"/>
      <rect x="-60" y="-60" width="120" height="120" stroke-width="1.6" transform="rotate(45)"/>
      <g stroke-width="1" opacity=".55">
        <path d="M0 -104 V-140 M0 104 V140 M-104 0 H-140 M104 0 H140"/>
        <path d="M73.5 -73.5 L99 -99 M-73.5 -73.5 L-99 -99 M73.5 73.5 L99 99 M-73.5 73.5 L-99 99"/>
      </g>
    </g>
  </g>
  <g fill="currentColor">
    <use href="#tcb-star" transform="translate(159 270) scale(2.6)"/>
    <circle cx="159" cy="270" r="4" fill="#1f1240"/>
    <path transform="translate(159 98)" d="M0 -22 A22 22 0 1 0 0 22 A16 16 0 1 1 0 -22 Z"/>
    <path transform="translate(159 442) rotate(180)" d="M0 -22 A22 22 0 1 0 0 22 A16 16 0 1 1 0 -22 Z"/>
    <use href="#tcb-star" transform="translate(48 48) scale(.9)"/>
    <use href="#tcb-star" transform="translate(270 48) scale(.9)"/>
    <use href="#tcb-star" transform="translate(48 492) scale(.9)"/>
    <use href="#tcb-star" transform="translate(270 492) scale(.9)"/>
    <use href="#tcb-star" transform="translate(159 40) scale(.5)"/>
    <use href="#tcb-star" transform="translate(159 500) scale(.5)"/>
    <circle cx="60" cy="270" r="2.2"/><circle cx="258" cy="270" r="2.2"/>
  </g>
</svg>`;

// Flip durations (ms); keep TAROT_FLIP_MS in sync with --tc-flip in the dialog CSS.
const TAROT_FLIP_MS = 1800;
const TAROT_SPIN_MS = 1200;

const TAROT_LANG_BASE = new URL("./lang/", import.meta.url).href;
const TAROT_LANG_CACHE = new Map();

const TAROT_MINOR_RE = /^(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Page|Knight|Queen|King)Of(Cups|Pentacles|Swords|Wands)$/;
const tarotIsMinor = (id) => TAROT_MINOR_RE.test(id);

// Last-resort label: "reversed_probability" -> "Reversed Probability".
const tarotHumanize = (key) =>
  String(key).replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

function fetchTarotLang(lang) {
  // no-cache: always revalidate, so edited language files are never served stale.
  return fetch(`${TAROT_LANG_BASE}${lang}.json`, { cache: "no-cache" }).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
}

// Loads dist/lang/<lang>.json (UI texts, editor labels, card names and meanings).
// Anything missing in a language file falls back to English.
function loadTarotLang(lang) {
  if (!TAROT_LANG_CACHE.has(lang)) {
    const english = TAROT_LANG_CACHE.get("en") || fetchTarotLang("en");
    if (!TAROT_LANG_CACHE.has("en")) TAROT_LANG_CACHE.set("en", english);
    const promise = lang === "en"
      ? english
      : Promise.all([
          english,
          fetchTarotLang(lang).catch((error) => {
            console.warn(`tarot-card: language "${lang}" not found, using English`, error);
            return null;
          }),
        ]).then(([en, other]) => (other ? {
          ui: { ...en.ui, ...other.ui },
          editor: { ...en.editor, ...other.editor },
          cards: { ...en.cards, ...other.cards },
        } : en));
    TAROT_LANG_CACHE.set(lang, promise);
    promise.catch(() => TAROT_LANG_CACHE.delete(lang));
  }
  return TAROT_LANG_CACHE.get(lang);
}

const TAROT_DIALOG_CSS = `
  dialog {
    width: min(92vw, 560px); max-width: 560px; max-height: 90vh;
    padding: 0; border: 1px solid color-mix(in srgb, var(--tc-accent) 55%, transparent);
    border-radius: 20px; overflow: auto; color: #f3e9d2;
    background:
      radial-gradient(1.5px 1.5px at 20% 15%, rgba(255,255,255,.7), transparent),
      radial-gradient(1px 1px at 75% 25%, rgba(255,255,255,.6), transparent),
      radial-gradient(1.5px 1.5px at 40% 80%, rgba(255,255,255,.5), transparent),
      radial-gradient(1px 1px at 88% 70%, rgba(255,255,255,.6), transparent),
      radial-gradient(circle at 50% 0%, #3b2370 0%, #1a1033 55%, #0e0820 100%);
    box-shadow: 0 0 0 1px rgba(0,0,0,.4), 0 18px 60px rgba(0,0,0,.6), 0 0 40px color-mix(in srgb, var(--tc-accent) 18%, transparent);
  }
  dialog::backdrop { background: rgba(6,3,16,.72); backdrop-filter: blur(3px); }
  .dialog-content { padding: 26px 22px 20px; text-align: center; }
  .card-name {
    margin: 0 0 8px; font-family: Georgia, "Times New Roman", serif;
    font-size: 24px; font-weight: 600; letter-spacing: .06em; color: var(--tc-accent);
  }
  .orientation {
    display: table; margin: 0 auto 18px; padding: 4px 14px;
    font-size: 11px; font-weight: 700; letter-spacing: .2em;
    border: 1px solid color-mix(in srgb, var(--tc-accent) 50%, transparent);
    border-radius: 999px; color: #f3e9d2;
  }
  .flip {
    width: min(100%, 300px); aspect-ratio: 636 / 1080; margin: 0 auto 22px;
    perspective: 1200px; --tc-flip: 1.8s;
  }
  .flipper {
    position: relative; width: 100%; height: 100%; transform-style: preserve-3d;
    transition: transform var(--tc-flip) cubic-bezier(.45, .05, .25, 1);
  }
  .flipper.instant { transition: none; }
  .card-name, .orientation, .meaning-title, .meaning, .divider { transition: opacity 1s ease .5s; }
  .dialog-content.pending .card-name, .dialog-content.pending .orientation,
  .dialog-content.pending .meaning-title, .dialog-content.pending .meaning,
  .dialog-content.pending .divider { opacity: 0; transition: none; }
  .face {
    position: absolute; inset: 0; overflow: hidden; border-radius: 10px;
    backface-visibility: hidden; -webkit-backface-visibility: hidden;
    border: 2px solid color-mix(in srgb, var(--tc-accent) 70%, transparent);
    box-shadow: 0 0 28px color-mix(in srgb, var(--tc-accent) 35%, transparent), 0 10px 30px rgba(0,0,0,.55);
  }
  .back { color: var(--tc-accent); background: #1a1033; }
  .back svg { display: block; width: 100%; height: 100%; }
  .front { transform: rotateY(180deg); background: #1a1033; }
  .tarot-image { display: block; width: 100%; height: 100%; object-fit: cover; }
  .tarot-image.reversed { transform: rotate(180deg); }
  .divider {
    height: 1px; margin: 0 0 16px; border: 0;
    background: linear-gradient(90deg, transparent, var(--tc-accent), transparent); opacity: .6;
  }
  .meaning-title {
    margin: 0 0 8px; text-align: left; font-family: Georgia, serif;
    font-size: 16px; letter-spacing: .08em; text-transform: uppercase; color: var(--tc-accent);
  }
  .meaning { text-align: left; line-height: 1.6; overflow-wrap: anywhere; color: #efe6ff; }
  .meaning strong { color: #fff; }
  .actions { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; margin-top: 22px; }
  .another {
    justify-self: start; white-space: nowrap; cursor: pointer; font: inherit; font-weight: 600;
    padding: 10px 20px; border-radius: 999px; color: var(--tc-accent);
    background: color-mix(in srgb, var(--tc-accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--tc-accent) 60%, transparent);
  }
  .another:hover:not(:disabled) { background: color-mix(in srgb, var(--tc-accent) 22%, transparent); }
  .another:disabled { opacity: .45; cursor: default; }
  .dialog-content.leaving .card-name, .dialog-content.leaving .orientation,
  .dialog-content.leaving .meaning-title, .dialog-content.leaving .meaning,
  .dialog-content.leaving .divider { opacity: 0; transition: opacity .4s ease; }
  .close {
    border: 0; border-radius: 999px; padding: 10px 28px; font: inherit; font-weight: 600;
    cursor: pointer; color: #1a1033;
    background: linear-gradient(135deg, var(--tc-accent), color-mix(in srgb, var(--tc-accent) 60%, #fff));
  }
  .close:hover { filter: brightness(1.08); }
  @media (max-width: 480px) {
    .dialog-content { padding: 20px 16px 16px; }
    .flip { width: min(100%, 250px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .icon { animation: none !important; }
    .flipper { transition-duration: .01s !important; }
  }
`;

class TarotBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._isBadge = false;
    this._strings = null;
    this._config = {
      title: null,
      subtitle: null,
      icon: "tarot",
      accent: "#d4af37",
      lang: "en",
      image_path: TAROT_IMAGE_BASE,
      reversed_probability: 40,
      major_arcana: true,
      minor_arcana: true,
      arcana_buttons: false,
    };
  }

  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid tarot configuration");
    }
    this._config = { ...this._config, ...config };
    const lang = String(this._config.lang || "en").toLowerCase();
    this._config.lang = /^[a-z]{2,3}(-[a-z0-9]+)?$/.test(lang) ? lang : "en";
    this._config.icon = String(this._config.icon || "tarot");
    this._config.accent = String(this._config.accent || "#d4af37");
    this._config.image_path = String(this._config.image_path || TAROT_IMAGE_BASE);
    if (!this._config.image_path.endsWith("/")) this._config.image_path += "/";
    const probability = Number(this._config.reversed_probability);
    this._config.reversed_probability = Number.isFinite(probability)
      ? Math.min(100, Math.max(0, probability))
      : 40;
    this._config.major_arcana = this._config.major_arcana !== false;
    this._config.minor_arcana = this._config.minor_arcana !== false;
    // At least one arcana must be selected.
    if (!this._config.major_arcana && !this._config.minor_arcana) {
      this._config.major_arcana = true;
      this._config.minor_arcana = true;
    }
    this.style.setProperty("--tc-accent", this._config.accent);
    const wanted = this._config.lang;
    loadTarotLang(wanted).then((strings) => {
      if (this._config.lang !== wanted) return; // config changed meanwhile
      this._strings = strings;
      this._render();
    });
  }

  set hass(_hass) {}

  _t(key) {
    return this._strings?.ui?.[key] ?? tarotHumanize(key);
  }

  _escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }

  _formatText(value) {
    // Preserve the bold Markdown used in the original card descriptions.
    return this._escapeHtml(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  _iconHtml() {
    return this._config.icon === "tarot"
      ? TAROT_ICON
      : `<ha-icon icon="${this._escapeHtml(this._config.icon)}"></ha-icon>`;
  }

  _triggerCss() {
    return `
      :host { display: ${this._isBadge ? "inline-block" : "block"}; --tc-accent: ${this._escapeHtml(this._config.accent)}; }
      .icon {
        display: grid; place-items: center; flex: 0 0 auto; color: var(--tc-accent);
        border: 1px solid color-mix(in srgb, var(--tc-accent) 45%, transparent);
        background: color-mix(in srgb, var(--tc-accent) 12%, transparent);
        border-radius: 50%; --mdc-icon-size: 24px;
        animation: tc-glow 3.5s ease-in-out infinite;
      }
      .icon svg { width: 26px; height: 26px; display: block; }
      @keyframes tc-glow {
        0%, 100% { box-shadow: 0 0 0 0 transparent; }
        50% { box-shadow: 0 0 14px color-mix(in srgb, var(--tc-accent) 45%, transparent); }
      }
      button { font: inherit; color: inherit; border: 0; background: transparent; cursor: pointer; text-align: left; }
    `;
  }

  _cardTrigger(title) {
    const hint = this._config.subtitle === false
      ? ""
      : this._escapeHtml(this._config.subtitle || this._t("hint"));
    const c = this._config;
    const split = !this._isBadge && c.arcana_buttons === true && c.major_arcana && c.minor_arcana;
    const arcana = split
      ? `<div class="arcana">
           <button class="arcana-btn" type="button" data-kind="major">${this._escapeHtml(this._t("major_only"))}</button>
           <button class="arcana-btn" type="button" data-kind="minor">${this._escapeHtml(this._t("minor_only"))}</button>
         </div>`
      : "";
    // themed (default true) = own purple/gold theme; themed: false follows the Home Assistant theme.
    const haTheme = c.themed === false
      ? `
        ha-card {
          color: var(--primary-text-color); background: var(--ha-card-background, var(--card-background-color));
          border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
          box-shadow: var(--ha-card-box-shadow, none);
        }
        ha-card:hover { box-shadow: var(--ha-card-box-shadow, none); background: var(--ha-card-background, var(--card-background-color)); }
        .icon {
          --tc-icon-fill: var(--secondary-background-color);
          color: var(--primary-text-color); border: 0; background: var(--secondary-background-color); animation: none;
        }
        .title { font-family: inherit; letter-spacing: normal; }
        .hint { color: var(--secondary-text-color); opacity: 1; }
        .arcana-btn {
          color: var(--primary-text-color); background: var(--secondary-background-color);
          border: 1px solid var(--divider-color); letter-spacing: .05em;
        }
        .arcana-btn:hover { background: var(--divider-color); }`
      : "";
    return {
      css: `
        .arcana { display: flex; gap: 10px; padding: 0 16px 14px; }
        .arcana-btn {
          flex: 1; min-height: 36px; padding: 8px 10px; border-radius: 999px; cursor: pointer;
          font-family: inherit; line-height: 1.2; font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: var(--tc-accent); background: color-mix(in srgb, var(--tc-accent) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--tc-accent) 45%, transparent);
          text-align: center; transition: background 150ms ease;
        }
        .arcana-btn:hover { background: color-mix(in srgb, var(--tc-accent) 22%, transparent); }
        ha-card {
          display: block; overflow: hidden; cursor: pointer; color: #f3e9d2;
          border: 1px solid color-mix(in srgb, var(--tc-accent) 40%, transparent);
          border-radius: var(--ha-card-border-radius, 12px);
          background:
            radial-gradient(1.5px 1.5px at 12% 30%, rgba(255,255,255,.7), transparent),
            radial-gradient(1px 1px at 55% 20%, rgba(255,255,255,.5), transparent),
            radial-gradient(1.5px 1.5px at 85% 65%, rgba(255,255,255,.6), transparent),
            radial-gradient(1px 1px at 38% 80%, rgba(255,255,255,.5), transparent),
            linear-gradient(135deg, #1a1033 0%, #3b2370 55%, #1a1033 100%);
          transition: transform 120ms ease, box-shadow 200ms ease;
        }
        ha-card:hover { box-shadow: 0 0 22px color-mix(in srgb, var(--tc-accent) 30%, transparent); }
        ha-card:active { transform: scale(.985); }
        .trigger { width: 100%; min-height: 76px; padding: 16px; display: flex; align-items: center; gap: 14px; }
        .icon { width: 46px; height: 46px; }
        .title { display: block; font-family: Georgia, "Times New Roman", serif; font-size: 17px; font-weight: 600; letter-spacing: .04em; }
        .hint { display: block; margin-top: 2px; font-size: 12px; opacity: .7; }
        ${haTheme}
      `,
      html: `
        <ha-card>
          <button class="trigger" type="button" aria-label="${title}">
            <span class="icon">${this._iconHtml()}</span>
            <span><span class="title">${title}</span>${hint ? `<span class="hint">${hint}</span>` : ""}</span>
          </button>
          ${arcana}
        </ha-card>`,
    };
  }

  _badgeTrigger(title) {
    const showLabel = this._config.show_label !== false;
    // themed (default true) = own purple/gold theme; themed: false follows the Home Assistant theme.
    const themed = this._config.themed === false
      ? `
        .trigger {
          color: var(--primary-text-color);
          background: var(--ha-card-background, var(--card-background-color));
          border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
          box-shadow: var(--ha-card-box-shadow, none);
        }
        .trigger:hover { background: var(--secondary-background-color); box-shadow: var(--ha-card-box-shadow, none); }
        .icon {
          --tc-icon-fill: var(--secondary-background-color);
          color: var(--primary-text-color); border: 0;
          background: var(--secondary-background-color); animation: none;
        }
        .label { font-weight: 500; }`
      : "";
    return {
      css: `
        .trigger {
          height: 36px; padding: 0 ${showLabel ? "14px 0 3px" : "0 0 3px"}; display: inline-flex; align-items: center; gap: 8px;
          border-radius: 18px; color: #f3e9d2; white-space: nowrap;
          border: 1px solid color-mix(in srgb, var(--tc-accent) 45%, transparent);
          background: linear-gradient(135deg, #1a1033, #3b2370);
          box-shadow: var(--ha-card-box-shadow, none);
          transition: box-shadow 200ms ease, transform 120ms ease;
        }
        .trigger:hover { box-shadow: 0 0 14px color-mix(in srgb, var(--tc-accent) 40%, transparent); }
        .trigger:active { transform: scale(.96); }
        .icon { width: 28px; height: 28px; --mdc-icon-size: 18px; }
        .icon svg { width: 20px; height: 20px; }
        .label { font-size: 13px; font-weight: 500; letter-spacing: .03em; }
        ${showLabel ? "" : ".trigger { width: 36px; justify-content: center; padding: 0; }"}
        ${themed}
      `,
      html: `
        <button class="trigger" type="button" aria-label="${title}" title="${title}">
          <span class="icon">${this._iconHtml()}</span>
          ${showLabel ? `<span class="label">${title}</span>` : ""}
        </button>`,
    };
  }

  _render() {
    const title = this._escapeHtml(
      this._config.title || this._t(this._isBadge ? "badge_title" : "title")
    );
    const trigger = this._isBadge ? this._badgeTrigger(title) : this._cardTrigger(title);
    this.shadowRoot.innerHTML = `
      <style>${this._triggerCss()}${trigger.css}${TAROT_DIALOG_CSS}</style>
      ${trigger.html}
      <dialog aria-label="${title}">
        <div class="dialog-content">
          <h2 class="card-name"></h2>
          <div class="orientation"></div>
          <div class="flip"><div class="flipper"><div class="face back">${TAROT_BACK}</div><div class="face front"><img class="tarot-image" alt="" /></div></div></div>
          <hr class="divider" />
          <h3 class="meaning-title">${this._t("meaning")}</h3>
          <div class="meaning"></div>
          <div class="actions"><span></span><button class="close" type="button">${this._t("close")}</button><button class="another" type="button">${this._t("another")}</button></div>
        </div>
      </dialog>
    `;

    this.shadowRoot.querySelector(".trigger").addEventListener("click", () => this._drawCard("all"));
    this.shadowRoot.querySelectorAll(".arcana-btn").forEach((btn) =>
      btn.addEventListener("click", () => this._drawCard(btn.dataset.kind)));
    this.shadowRoot.querySelector(".close").addEventListener("click", () => this._closeDialog());
    this.shadowRoot.querySelector(".another").addEventListener("click", () => this._another());
    const dialog = this.shadowRoot.querySelector("dialog");
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) this._closeDialog();
    });
  }

  // Picks a random card from the selected arcana (the same card can come up again).
  _pickCard(kind) {
    const { major_arcana: major, minor_arcana: minor } = this._config;
    const ids = Object.keys(this._strings.cards).filter((cardId) => {
      const isMinor = tarotIsMinor(cardId);
      if (kind === "major" && major && minor) return !isMinor;
      if (kind === "minor" && major && minor) return isMinor;
      return isMinor ? minor : major;
    });
    if (!ids.length) return null;
    const id = ids[Math.floor(Math.random() * ids.length)];
    const card = this._strings.cards[id];
    const reversed = Math.random() * 100 < this._config.reversed_probability;
    return {
      id,
      reversed,
      name: card.name,
      meaning: reversed ? card.meaning_reversed : card.meaning,
      url: `${this._config.image_path}${id}.avif`,
    };
  }

  // Fills the (hidden) dialog texts and prepares the image element for a picked card.
  _setCardContent(pick) {
    this.shadowRoot.querySelector(".card-name").textContent = pick.name;
    this.shadowRoot.querySelector(".orientation").textContent =
      pick.reversed ? this._t("reversed") : this._t("upright");
    this.shadowRoot.querySelector(".meaning").innerHTML = this._formatText(pick.meaning);
    const img = this.shadowRoot.querySelector(".tarot-image");
    img.removeAttribute("src");
    img.alt = pick.name;
    img.classList.toggle("reversed", pick.reversed);
  }

  _setRotation(deg, duration = "") {
    const flipper = this.shadowRoot.querySelector(".flipper");
    flipper.style.transitionDuration = duration;
    flipper.style.transform = `rotateY(${deg}deg)`;
    this._rot = deg;
  }

  // Resolves when the flipper's rotation transition has finished (with a safety timeout).
  _waitFlip(ms) {
    const flipper = this.shadowRoot.querySelector(".flipper");
    return new Promise((resolve) => {
      let timer;
      const end = () => {
        flipper.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
        resolve();
      };
      const onEnd = (ev) => {
        if (ev.target === flipper && ev.propertyName === "transform") end();
      };
      flipper.addEventListener("transitionend", onEnd);
      timer = setTimeout(end, ms + 300);
    });
  }

  _setBusy(busy) {
    this._busy = busy;
    const button = this.shadowRoot.querySelector(".another");
    if (button) button.disabled = busy;
  }

  // Loads the picked image on the real <img> and waits until it is decoded,
  // so it is ready before the flip starts. Resolves to false if it cannot be loaded.
  _loadImage(pick) {
    const img = this.shadowRoot.querySelector(".tarot-image");
    img.src = pick.url;
    const decoded = img.decode
      ? img.decode()
      : new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
    return decoded.then(() => true, () => {
      img.removeAttribute("src");
      img.alt = `${pick.name} (${pick.id}.avif not found)`;
      return false;
    });
  }

  _nextFrames() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  _drawCard(kind = "all") {
    if (!this._strings) return;
    const pick = this._pickCard(kind);
    if (!pick) return;
    this._lastKind = kind;
    this._lastDraw = pick.id;
    const token = (this._drawToken = (this._drawToken || 0) + 1);
    const flipper = this.shadowRoot.querySelector(".flipper");
    const content = this.shadowRoot.querySelector(".dialog-content");

    // Instantly show the card back (no transition); texts stay hidden until the flip.
    content.classList.remove("leaving");
    content.classList.add("pending");
    flipper.classList.add("instant");
    this._setRotation(0);
    this._setCardContent(pick);
    void flipper.offsetWidth;
    this._setBusy(true);

    const dialog = this.shadowRoot.querySelector("dialog");
    if (!dialog.open) dialog.showModal();

    const pause = new Promise((resolve) => setTimeout(resolve, 500));
    Promise.all([this._loadImage(pick), pause])
      .then(() => this._nextFrames())
      .then(() => {
        if (token !== this._drawToken) return; // a newer draw replaced this one
        flipper.classList.remove("instant");
        this._setRotation(180);
        content.classList.remove("pending");
        return this._waitFlip(TAROT_FLIP_MS);
      })
      .then(() => {
        if (token === this._drawToken) this._setBusy(false);
      });
  }

  // "Another": keep turning to the card back, then turn again to reveal a new card.
  async _another() {
    if (!this._strings || this._busy) return;
    const pick = this._pickCard(this._lastKind || "all");
    if (!pick) return;
    this._lastDraw = pick.id;
    const token = (this._drawToken = (this._drawToken || 0) + 1);
    const flipper = this.shadowRoot.querySelector(".flipper");
    const content = this.shadowRoot.querySelector(".dialog-content");
    this._setBusy(true);

    // 1. Fade the texts out and keep rotating until the card back faces us.
    content.classList.add("leaving");
    this._setRotation((this._rot || 180) + 180, `${TAROT_SPIN_MS}ms`);
    await this._waitFlip(TAROT_SPIN_MS);
    if (token !== this._drawToken) return;

    // 2. The back is showing: swap in the new card and wait until it is fully decoded.
    content.classList.add("pending");
    content.classList.remove("leaving");
    this._setCardContent(pick);
    await this._loadImage(pick);
    await this._nextFrames();
    if (token !== this._drawToken) return;

    // 3. Keep rotating in the same direction to reveal the new card.
    this._setRotation(this._rot + 180);
    content.classList.remove("pending");
    await this._waitFlip(TAROT_FLIP_MS);
    if (token === this._drawToken) this._setBusy(false);
  }

  _closeDialog() {
    const dialog = this.shadowRoot.querySelector("dialog");
    if (dialog?.open) dialog.close();
  }
}

class TarotCard extends TarotBase {
  static getConfigElement() {
    return document.createElement("tarot-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    const c = this._config;
    return c.arcana_buttons === true && c.major_arcana && c.minor_arcana ? 2 : 1;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 3 };
  }
}

class TarotBadge extends TarotBase {
  static getConfigElement() {
    return document.createElement("tarot-badge-editor");
  }

  static getStubConfig() {
    return {};
  }

  constructor() {
    super();
    this._isBadge = true;
  }
}


// ---------- Visual (UI) editor, based on ha-form ----------
const TAROT_DEFAULT_ACCENT = "#d4af37";
const TAROT_EDITOR_DEFAULTS = {
  lang: "en",
  accent: TAROT_DEFAULT_ACCENT,
  reversed_probability: 40,
  major_arcana: true,
  minor_arcana: true,
  arcana_buttons: false,
  show_label: true,
  themed: true,
};

function tarotHexToRgb(value) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(value || "").trim());
  if (!m) return [212, 175, 55];
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function tarotRgbToHex(rgb) {
  return "#" + rgb.map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")).join("");
}

class TarotEditorBase extends HTMLElement {
  constructor() {
    super();
    this._isBadge = false;
    this._config = {};
    this._strings = null;
    this._form = null;
  }

  setConfig(config) {
    this._config = { ...config };
    const lang = String(this._config.lang || "en").toLowerCase();
    loadTarotLang(/^[a-z]{2,3}(-[a-z0-9]+)?$/.test(lang) ? lang : "en")
      .then((strings) => { this._strings = strings; this._build(); })
      .catch(() => {});
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }

  _label(key) {
    return this._strings?.editor?.[key] ?? tarotHumanize(key);
  }

  _schema() {
    const bool = { boolean: {} };
    return [
      { name: "title", selector: { text: {} } },
      ...(this._isBadge ? [] : [{ name: "subtitle", selector: { text: {} } }]),
      {
        name: "lang",
        selector: {
          select: {
            mode: "dropdown",
            custom_value: true,
            options: [
              { value: "en", label: "English" },
              { value: "nl", label: "Nederlands" },
              { value: "es", label: "Español" },
              { value: "de", label: "Deutsch" },
              { value: "fr", label: "Français" },
              { value: "pt", label: "Português" },
              { value: "it", label: "Italiano" },
            ],
          },
        },
      },
      { name: "icon", selector: { icon: {} } },
      { name: "accent", selector: { color_rgb: {} } },
      {
        type: "grid", name: "", schema: [
          { name: "major_arcana", selector: bool },
          { name: "minor_arcana", selector: bool },
        ],
      },
      ...(this._isBadge
        ? [{ name: "show_label", selector: bool }]
        : [{ name: "arcana_buttons", selector: bool }]),
      { name: "themed", selector: bool },
      {
        type: "expandable", name: "", title: this._label("advanced"),
        schema: [
          {
            name: "reversed_probability",
            selector: { number: { min: 0, max: 100, step: 5, mode: "slider", unit_of_measurement: "%" } },
          },
          { name: "image_path", selector: { text: {} } },
        ],
      },
    ];
  }

  _data() {
    const c = this._config;
    this._shownAccent = tarotHexToRgb(c.accent || TAROT_DEFAULT_ACCENT);
    return {
      ...TAROT_EDITOR_DEFAULTS,
      ...c,
      major_arcana: c.major_arcana !== false,
      minor_arcana: c.minor_arcana !== false,
      accent: this._shownAccent,
      icon: !c.icon || c.icon === "tarot" ? "" : c.icon,
    };
  }

  _build() {
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => this._changed(ev));
      this.appendChild(this._form);
    }
    if (this._hass) this._form.hass = this._hass;
    this._form.schema = this._schema();
    this._form.data = this._data();
    this._form.computeLabel = (item) =>
      item.name === "title" && this._isBadge ? this._label("label") : this._label(item.name);
    this._form.computeHelper = (item) => {
      if (item.name === "major_arcana" || item.name === "minor_arcana") return this._label("arcana_helper");
      if (item.name === "arcana_buttons") return this._label("arcana_buttons_helper");
      if (item.name === "themed") return this._label("themed_helper");
      return undefined;
    };
  }

  _changed(ev) {
    ev.stopPropagation();
    const prev = this._config;
    const v = { ...ev.detail.value };

    // Accent: the colour picker works with [r, g, b]; the config stores a hex string.
    if (Array.isArray(v.accent) && JSON.stringify(v.accent) !== JSON.stringify(this._shownAccent)) {
      v.accent = tarotRgbToHex(v.accent);
    } else if (prev.accent) {
      v.accent = prev.accent;
    } else {
      delete v.accent;
    }

    // At least one arcana must stay selected: undo the toggle that emptied the selection.
    if (v.major_arcana === false && v.minor_arcana === false) {
      if (prev.minor_arcana !== false) v.minor_arcana = true;
      else v.major_arcana = true;
    }

    // Keep the saved YAML tidy: drop empty values and values equal to the defaults.
    for (const key of Object.keys(v)) {
      const val = v[key];
      if (val === undefined || val === null || val === "") delete v[key];
      else if (key in TAROT_EDITOR_DEFAULTS && val === TAROT_EDITOR_DEFAULTS[key]) delete v[key];
    }
    if (typeof v.accent === "string" && v.accent.toLowerCase() === TAROT_DEFAULT_ACCENT) delete v.accent;
    if (prev.type) v.type = prev.type;

    this._config = v;
    this._form.data = this._data(); // re-sync the form (e.g. after an undone toggle)
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: v }, bubbles: true, composed: true,
    }));
  }
}

class TarotCardEditor extends TarotEditorBase {}

class TarotBadgeEditor extends TarotEditorBase {
  constructor() {
    super();
    this._isBadge = true;
  }
}

if (!customElements.get("tarot-card")) {
  customElements.define("tarot-card", TarotCard);
}
if (!customElements.get("tarot-badge")) {
  customElements.define("tarot-badge", TarotBadge);
}
if (!customElements.get("tarot-card-editor")) {
  customElements.define("tarot-card-editor", TarotCardEditor);
}
if (!customElements.get("tarot-badge-editor")) {
  customElements.define("tarot-badge-editor", TarotBadgeEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "tarot-card",
  name: "Tarot Card",
  description: "Draw a random tarot card with upright and reversed meanings.",
  preview: true,
});

window.customBadges = window.customBadges || [];
window.customBadges.push({
  type: "tarot-badge",
  name: "Tarot Badge",
  description: "Tarot draw button as a badge at the top of a dashboard view.",
});
