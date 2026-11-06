/* Tarot Card for Home Assistant
 * Copyright (c) 2026
 * Licensed under the MIT License.
 */
const TAROT_IMAGE_BASE = new URL("./tarot_cards/", import.meta.url).href;


const TAROT_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-14 10.5 11.5)"><rect x="5" y="3" width="11" height="17" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".55"/></g><g transform="rotate(9 13.5 12.5)"><rect x="8" y="4" width="11" height="17" rx="1.6" fill="#2a1a52" stroke="currentColor" stroke-width="1.4"/><path d="M13.5 8 L14.6 11.4 L18 12.5 L14.6 13.6 L13.5 17 L12.4 13.6 L9 12.5 L12.4 11.4 Z" fill="currentColor"/></g></svg>`;

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

const TAROT_LANG_BASE = new URL("./lang/", import.meta.url).href;
const TAROT_LANG_CACHE = new Map();

// Loads dist/lang/<lang>.json (UI texts + all card names and meanings). Falls back to English.
function loadTarotLang(lang) {
  if (!TAROT_LANG_CACHE.has(lang)) {
    TAROT_LANG_CACHE.set(
      lang,
      fetch(`${TAROT_LANG_BASE}${lang}.json`)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .catch((error) => {
          TAROT_LANG_CACHE.delete(lang);
          if (lang === "en") throw error;
          console.warn(`tarot-card: language "${lang}" not found, using English`, error);
          return loadTarotLang("en");
        })
    );
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
  .flipper.flipped { transform: rotateY(180deg); }
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
  .actions { display: flex; justify-content: center; margin-top: 22px; }
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
    return this._strings?.ui?.[key] ?? "";
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
    return {
      css: `
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
      `,
      html: `
        <ha-card>
          <button class="trigger" type="button" aria-label="${title}">
            <span class="icon">${this._iconHtml()}</span>
            <span><span class="title">${title}</span>${hint ? `<span class="hint">${hint}</span>` : ""}</span>
          </button>
        </ha-card>`,
    };
  }

  _badgeTrigger(title) {
    const showLabel = this._config.show_label !== false;
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
          <div class="actions"><button class="close" type="button">${this._t("close")}</button></div>
        </div>
      </dialog>
    `;

    this.shadowRoot.querySelector(".trigger").addEventListener("click", () => this._drawCard());
    this.shadowRoot.querySelector(".close").addEventListener("click", () => this._closeDialog());
    const dialog = this.shadowRoot.querySelector("dialog");
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) this._closeDialog();
    });
  }

  _drawCard() {
    if (!this._strings) return;
    const ids = Object.keys(this._strings.cards);
    const id = ids[Math.floor(Math.random() * ids.length)];
    const card = this._strings.cards[id];
    const reversed = Math.random() * 100 < this._config.reversed_probability;
    const name = card.name;
    const meaning = reversed ? card.meaning_reversed : card.meaning;

    this.shadowRoot.querySelector(".card-name").textContent = name;
    this.shadowRoot.querySelector(".orientation").textContent =
      reversed ? this._t("reversed") : this._t("upright");

    const img = this.shadowRoot.querySelector(".tarot-image");
    const flipper = this.shadowRoot.querySelector(".flipper");
    const url = `${this._config.image_path}${id}.avif`;
    const token = (this._drawToken = (this._drawToken || 0) + 1);

    // Instantly show the card back (no transition) and clear the old front image.
    const content = this.shadowRoot.querySelector(".dialog-content");
    content.classList.add("pending");
    flipper.classList.add("instant");
    flipper.classList.remove("flipped");
    img.removeAttribute("src");
    img.alt = name;
    img.classList.toggle("reversed", reversed);
    void flipper.offsetWidth;

    // Load AND decode the image on the real <img> while the card back is still facing us,
    // then flip. This way the picture is fully ready before the animation starts.
    img.src = url;
    const loaded = (img.decode
      ? img.decode()
      : new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; }))
      .then(() => true, () => false);
    const pause = new Promise((resolve) => setTimeout(resolve, 500));
    Promise.all([loaded, pause]).then(([ok]) => {
      if (token !== this._drawToken) return; // a newer draw replaced this one
      if (!ok) {
        img.removeAttribute("src");
        img.alt = `${name} (${id}.avif not found)`;
      }
      // Wait two frames so the decoded image is painted on the hidden face first.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (token !== this._drawToken) return;
        flipper.classList.remove("instant");
        flipper.classList.add("flipped");
        content.classList.remove("pending");
      }));
    });

    this.shadowRoot.querySelector(".meaning").innerHTML = this._formatText(meaning);
    const dialog = this.shadowRoot.querySelector("dialog");
    if (!dialog.open) dialog.showModal();
  }

  _closeDialog() {
    const dialog = this.shadowRoot.querySelector("dialog");
    if (dialog?.open) dialog.close();
  }
}

class TarotCard extends TarotBase {
  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 3 };
  }
}

class TarotBadge extends TarotBase {
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
