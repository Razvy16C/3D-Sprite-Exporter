I've added a full Lighting category to the inspector panel and wired it directly into your Three.js scene, state persistence, presets, and backups.
What Was Added
 * Key Light (Main Light): Controls for Azimuth (-180^\circ to 180^\circ orbit), Elevation (-90^\circ to 90^\circ vertical angle), Intensity, and Color picker.
 * Fill & Rim Lighting: Independent intensity sliders for the Fill Light (softens shadows on the opposite side) and Rim Light (back-edge separation highlight) plus a Rim Color picker.
 * Ambient & Hemisphere Bounce: Ambient Intensity slider along with Sky and Ground hemisphere color pickers for realistic environmental bounce lighting.
 * Tone Mapping / Exposure & Presets: Overall Exposure slider (renderer.toneMappingExposure), quick one-click lighting mood buttons (Studio, Warm Sun, Neon Rim, Dramatic), and full integration with your saved settings, custom presets, and JSON backups.
1. Updated index.html
(Insert the new <details class="group reveal" open> Lighting section right after the Transform accordion.)
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>3D Sprite Exporter</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="app">
  <header class="top reveal">
    <div class="brand">
      <div class="brand-badge" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 3 22 8v10l-9 5-9-5V8z"/><path d="M4 8l9 5 9-5M13 13v10"/></svg>
      </div>
      <div>
        <h1>3D Sprite Exporter</h1>
        <p>Turn a 3D model into 2D sprite images</p>
      </div>
    </div>
    <div class="settings" id="settings">
      <button class="icon-btn" id="btn-settings" type="button" aria-label="Appearance settings" aria-expanded="false" aria-controls="pop">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>
      </button>
      <div class="pop" id="pop" role="dialog" aria-label="Appearance">
        <div class="field">
          <span class="lbl" id="lbl-theme">Page mode</span>
          <div class="seg full" role="radiogroup" aria-labelledby="lbl-theme">
            <label><input type="radio" name="theme" value="light"><span>Light</span></label>
            <label><input type="radio" name="theme" value="dark"><span>Dark</span></label>
          </div>
        </div>
        <div class="field">
          <span class="lbl">Accent color</span>
          <div class="swatches" id="swatches"></div>
          <div class="bgrow">
            <input type="color" id="accent-custom" aria-label="Custom accent color">
            <span class="mono muted" id="accent-hex"></span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main class="layout">
    <div class="stage-col">
      <div class="stage" id="stage">
        <canvas id="view" tabindex="0" aria-label="3D model preview. Drag to rotate, arrow keys rotate, scroll to zoom."></canvas>
        <span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span class="c br"></span>
        <div class="readout" id="readout"></div>
      </div>
      <div class="actions">
        <button class="btn primary" id="btn-export" type="button">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Export sprite</span>
        </button>
        <button class="btn" id="btn-reset-view" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span>Reset view</span>
        </button>
      </div>
      <p class="hint">
        <kbd>Drag</kbd> Rotate &nbsp;·&nbsp; <kbd>Shift + Drag</kbd> Pan &nbsp;·&nbsp; <kbd>Scroll</kbd> Zoom
      </p>
    </div>

    <div class="panel-col">
      <section class="caps card reveal" id="caps" hidden>
        <span class="lbl">Captures · tap to save again</span>
        <div class="caps-list" id="cap-list"></div>
      </section>

      <details class="group reveal" open>
        <summary>Model</summary>
        <div class="body">
          <div class="model-card">
            <div class="mname" id="model-name">Sample robot</div>
            <div class="muted mono" id="model-meta"></div>
          </div>
          <div class="btnrow">
            <button class="btn" id="btn-load" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              <span>Open model…</span>
            </button>
            <button class="btn" id="btn-sample" type="button">Sample robot</button>
          </div>
          <input type="file" id="model-file" accept=".glb,.gltf,.fbx,.obj,.stl,.bin,image/*" multiple hidden>
          <p class="note">Opens GLB, GLTF, FBX, OBJ and STL. For a .gltf or .fbx with separate texture files, select the textures together with the model. OBJ and STL open with a plain material.</p>
        </div>
      </details>

      <details class="group reveal" open>
        <summary>Transform</summary>
        <div class="body">
          <div class="field"><span class="lbl">Position</span><div class="axes" id="position-axes"></div></div>
          <div class="field"><span class="lbl">Rotation (degrees)</span><div class="axes" id="rotation-axes"></div></div>
          <div class="field"><span class="lbl">Zoom</span><div class="axes" id="zoom-axes"></div></div>
          <div class="btnrow"><button class="btn small" id="btn-reset-transform" type="button">Reset transform</button></div>
        </div>
      </details>

      <details class="group reveal" open>
        <summary>Lighting</summary>
        <div class="body">
          <div class="field">
            <span class="lbl">Quick rigs</span>
            <div class="btnrow" id="light-rigs">
              <button class="btn small" type="button" data-rig="studio">Studio</button>
              <button class="btn small" type="button" data-rig="sun">Warm Sun</button>
              <button class="btn small" type="button" data-rig="neon">Neon Rim</button>
              <button class="btn small" type="button" data-rig="dramatic">Dramatic</button>
            </div>
          </div>

          <div class="field">
            <div class="split-lbl">
              <span class="lbl">Key light</span>
              <div class="color-chip">
                <input type="color" id="light-key-color" aria-label="Key light color">
                <span class="mono muted" id="light-key-hex">#FFFFFF</span>
              </div>
            </div>
            <div class="axes" id="light-key-axes"></div>
          </div>

          <div class="field">
            <div class="split-lbl">
              <span class="lbl">Fill &amp; Rim light</span>
              <div class="color-chip">
                <span class="muted" style="font-size:11px">Rim</span>
                <input type="color" id="light-rim-color" aria-label="Rim light color">
              </div>
            </div>
            <div class="axes" id="light-fill-axes"></div>
          </div>

          <div class="field">
            <span class="lbl">Environment &amp; Exposure</span>
            <div class="axes" id="light-env-axes"></div>
            <div class="two" style="margin-top:4px">
              <div class="color-chip-box">
                <input type="color" id="light-sky-color" aria-label="Sky bounce color">
                <div>
                  <div class="lbl" style="font-size:10px">Sky bounce</div>
                  <div class="mono muted" id="light-sky-hex">#FFFFFF</div>
                </div>
              </div>
              <div class="color-chip-box">
                <input type="color" id="light-ground-color" aria-label="Ground bounce color">
                <div>
                  <div class="lbl" style="font-size:10px">Ground bounce</div>
                  <div class="mono muted" id="light-ground-hex">#8890A0</div>
                </div>
              </div>
            </div>
          </div>

          <div class="btnrow">
            <button class="btn small" id="btn-reset-lighting" type="button">Reset lighting</button>
          </div>
        </div>
      </details>

      <details class="group reveal" open>
        <summary>Export</summary>
        <div class="body">
          <div class="two">
            <div class="field">
              <span class="lbl" id="lbl-format">Format</span>
              <div class="seg full" role="radiogroup" aria-labelledby="lbl-format">
                <label><input type="radio" name="format" value="png"><span>PNG</span></label>
                <label><input type="radio" name="format" value="jpg"><span>JPG</span></label>
                <label><input type="radio" name="format" value="jpeg"><span>JPEG</span></label>
              </div>
            </div>
            <div class="field">
              <span class="lbl" id="lbl-alpha">Alpha</span>
              <div class="seg full" role="radiogroup" aria-labelledby="lbl-alpha">
                <label><input type="radio" name="alpha" value="opaque"><span>Opaque</span></label>
                <label><input type="radio" name="alpha" value="transparent"><span>Clear</span></label>
              </div>
            </div>
          </div>
          <div class="warn" id="warn" role="alert" hidden>Transparent mode can't be used because PNG isn't selected. JPG and JPEG can't store transparency, so the sprite exports with the background below. Choose PNG for a transparent sprite.</div>
          <fieldset class="field" id="bg-set">
            <legend class="lbl">Background</legend>
            <div class="bg-controls">
              <div class="seg" role="radiogroup" aria-label="Background type">
                <label><input type="radio" name="bgmode" value="color"><span>Color</span></label>
                <label><input type="radio" name="bgmode" value="image"><span>Image</span></label>
              </div>
              <div class="bgrow" id="bg-color-wrap">
                <input type="color" id="bg-color" aria-label="Background color">
                <span class="mono muted" id="bg-color-hex"></span>
              </div>
              <div class="bgrow" id="bg-image-wrap" hidden>
                <span class="thumb-bg" id="bg-thumb"></span>
                <button class="btn small" id="btn-bg" type="button">Import…</button>
                <button class="btn small" id="btn-bg-clear" type="button">Remove</button>
                <input type="file" id="bg-file" accept="image/*" hidden>
              </div>
            </div>
            <p class="note" id="bg-note"></p>
          </fieldset>
          <div class="two">
            <div class="field"><label class="lbl" for="size">Size (px)</label>
              <select id="size"></select></div>
            <div class="field"><label class="lbl" for="filename">File name</label>
              <input type="text" id="filename" maxlength="40" autocomplete="off" spellcheck="false"></div>
          </div>
        </div>
      </details>

      <details class="group reveal">
        <summary>Presets</summary>
        <div class="body">
          <div class="preset-add">
            <input type="text" id="preset-name" maxlength="40" placeholder="Preset name…" aria-label="Preset name" autocomplete="off">
            <button class="btn" id="btn-preset-save" type="button">Save current</button>
          </div>
          <ul class="presets" id="preset-list"></ul>
          <p class="note">Presets keep position, rotation, zoom, lighting, format, alpha, size and background color.</p>
        </div>
      </details>

      <details class="group reveal">
        <summary>Saved settings</summary>
        <div class="body">
          <p class="note" id="save-status">Your last used settings are saved automatically in this browser.</p>
          <div class="btnrow">
            <button class="btn small" id="btn-backup" type="button">Export backup</button>
            <button class="btn small" id="btn-import" type="button">Import backup…</button>
            <button class="btn small" id="btn-defaults" type="button">Reset to defaults</button>
          </div>
          <input type="file" id="backup-file" accept=".json,application/json" hidden>
          <p class="note">A backup file holds your settings, accent color and presets, so you can move them to another browser.</p>
        </div>
      </details>
    </div>
  </main>
</div>
<div id="toast" role="status" aria-live="polite"></div>

<script src="vendor/three.min.js"></script>
<script src="vendor/fflate.min.js"></script>
<script src="vendor/NURBSUtils.js"></script>
<script src="vendor/NURBSCurve.js"></script>
<script src="vendor/GLTFLoader.js"></script>
<script src="vendor/OBJLoader.js"></script>
<script src="vendor/STLLoader.js"></script>
<script src="vendor/FBXLoader.js"></script>
<script src="app.js"></script>
</body>
</html>

2. Additions to style.css
(Add these styles to style.css to support the wider lighting labels like AZM, ELV, INT, FILL, RIM, AMB, EXP, and the inline color chip headers.)
/* Lighting & wider axis labels */
.split-lbl {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.color-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.color-chip input[type=color] {
  width: 26px;
  height: 22px;
  padding: 1px;
  border-radius: 5px;
}

.color-chip-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--surface-sunken);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
}

.color-chip-box input[type=color] {
  width: 28px;
  height: 28px;
  flex: none;
}

.axis.wide {
  grid-template-columns: 36px minmax(0, 1fr) 68px;
}

3. Updated app.js
(Includes spherical coordinate math for directional key light positioning, real-time light intensity/color/exposure updates, built-in lighting rigs, and full sanitization/persistence.)
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var root = document.documentElement;
  var SIZES = [64, 128, 256, 512, 1024, 2048];
  var SWATCHES = ['#2d55e6', '#7c5cff', '#0ea5a4', '#16a34a', '#f59e0b', '#f26b21', '#e5484d', '#ec4899', '#52525b'];
  var KEY_SETTINGS = 'spriteBooth.settings.v1';
  var KEY_PRESETS = 'spriteBooth.presets.v1';
  var rad = function (d) { return d * Math.PI / 180; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  /* ---------- storage ---------- */
  var storageOK = true;
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  try { localStorage.setItem('spriteBooth.test', '1'); localStorage.removeItem('spriteBooth.test'); } catch (e) { storageOK = false; }

  /* ---------- settings model ---------- */
  function defaultLight() {
    return {
      keyAzimuth: 37,
      keyElevation: 45,
      keyIntensity: 1.1,
      keyColor: '#ffffff',
      fillIntensity: 0.4,
      rimIntensity: 0.35,
      rimColor: '#c7d8ff',
      ambientIntensity: 0.9,
      skyColor: '#ffffff',
      groundColor: '#8890a0',
      exposure: 1.0
    };
  }
  function defaults() {
    var dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      theme: dark ? 'dark' : 'light', accent: '#2d55e6',
      pos: { x: 0, y: 0, z: 0 }, rot: { x: 12, y: -28, z: 0 }, zoom: 1,
      light: defaultLight(),
      format: 'png', size: 512, alpha: 'transparent',
      bgMode: 'color', bgColor: '#ffffff', bgImage: null, filename: 'sprite'
    };
  }
  function num(v, min, max, d) { v = parseFloat(v); return isFinite(v) ? clamp(v, min, max) : d; }
  var IMG_RE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+\/=]+$/;
  var HEX_RE = /^#[0-9a-f]{6}$/i;
  function sanitizeLight(l, base) {
    var d = clone(base || defaultLight()); l = l || {};
    d.keyAzimuth = num(l.keyAzimuth, -180, 180, d.keyAzimuth);
    d.keyElevation = num(l.keyElevation, -90, 90, d.keyElevation);
    d.keyIntensity = num(l.keyIntensity, 0, 5, d.keyIntensity);
    if (typeof l.keyColor === 'string' && HEX_RE.test(l.keyColor)) d.keyColor = l.keyColor.toLowerCase();
    d.fillIntensity = num(l.fillIntensity, 0, 3, d.fillIntensity);
    d.rimIntensity = num(l.rimIntensity, 0, 4, d.rimIntensity);
    if (typeof l.rimColor === 'string' && HEX_RE.test(l.rimColor)) d.rimColor = l.rimColor.toLowerCase();
    d.ambientIntensity = num(l.ambientIntensity, 0, 3, d.ambientIntensity);
    if (typeof l.skyColor === 'string' && HEX_RE.test(l.skyColor)) d.skyColor = l.skyColor.toLowerCase();
    if (typeof l.groundColor === 'string' && HEX_RE.test(l.groundColor)) d.groundColor = l.groundColor.toLowerCase();
    d.exposure = num(l.exposure, 0.2, 2.5, d.exposure);
    return d;
  }
  function sanitize(o, base) {
    var s = clone(base); o = o || {};
    if (o.theme === 'light' || o.theme === 'dark') s.theme = o.theme;
    if (typeof o.accent === 'string' && HEX_RE.test(o.accent)) s.accent = o.accent.toLowerCase();
    var p = o.pos || {}, r = o.rot || {};
    s.pos = { x: num(p.x, -2, 2, s.pos.x), y: num(p.y, -2, 2, s.pos.y), z: num(p.z, -2, 2, s.pos.z) };
    s.rot = { x: num(r.x, -180, 180, s.rot.x), y: num(r.y, -180, 180, s.rot.y), z: num(r.z, -180, 180, s.rot.z) };
    s.zoom = num(o.zoom, 0.3, 3, s.zoom);
    s.light = sanitizeLight(o.light, s.light);
    if (['png', 'jpg', 'jpeg'].indexOf(o.format) > -1) s.format = o.format;
    if (SIZES.indexOf(+o.size) > -1) s.size = +o.size;
    if (o.alpha === 'opaque' || o.alpha === 'transparent') s.alpha = o.alpha;
    if (o.bgMode === 'color' || o.bgMode === 'image') s.bgMode = o.bgMode;
    if (typeof o.bgColor === 'string' && HEX_RE.test(o.bgColor)) s.bgColor = o.bgColor.toLowerCase();
    if (typeof o.bgImage === 'string' && o.bgImage.length < 4000000 && IMG_RE.test(o.bgImage)) s.bgImage = o.bgImage;
    if (typeof o.filename === 'string') s.filename = o.filename.slice(0, 40);
    return s;
  }
  var state = sanitize(store.get(KEY_SETTINGS), defaults());
  var userPresets = [];
  (function () {
    var raw = store.get(KEY_PRESETS);
    if (Array.isArray(raw)) raw.slice(0, 30).forEach(function (p) {
      if (p && typeof p.name === 'string' && p.name.trim()) userPresets.push({ name: p.name.slice(0, 40), s: presetFrom(sanitize(p.s, defaults())) });
    });
  })();
  function presetFrom(s) {
    return { pos: clone(s.pos), rot: clone(s.rot), zoom: s.zoom, light: clone(s.light), format: s.format, size: s.size, alpha: s.alpha, bgMode: s.bgMode, bgColor: s.bgColor };
  }

  /* ---------- accent color ---------- */
  function hexToRgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function toHex(rgb) { return '#' + rgb.map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
  function lum(rgb) {
    var a = rgb.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function mixTo(rgb, target, t) { return rgb.map(function (v) { return v + (target - v) * t; }); }
  function applyAccent() {
    var rgb = hexToRgb(state.accent), L = lum(rgb);
    if (state.theme === 'dark' && L < 0.2) rgb = mixTo(rgb, 255, 0.4);
    else if (state.theme === 'light' && L > 0.6) rgb = mixTo(rgb, 0, 0.3);
    root.style.setProperty('--accent', toHex(rgb));
    root.style.setProperty('--accent-fg', lum(rgb) > 0.35 ? '#111113' : '#FFFFFF');
  }
  function buildSwatches() {
    var host = $('#swatches');
    SWATCHES.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'sw';
      b.style.setProperty('--sw', c); b.dataset.color = c; b.setAttribute('aria-label', 'Accent ' + c.toUpperCase());
      b.addEventListener('click', function () { state.accent = c; syncAll(); persist(); });
      host.appendChild(b);
    });
  }

  /* ---------- toast ---------- */
  var toastT;
  function toast(msg, kind) {
    var el = $('#toast'); el.textContent = msg;
    el.className = 'show' + (kind === 'warn' ? ' warn' : '');
    clearTimeout(toastT);
    toastT = setTimeout(function () { el.className = ''; }, kind === 'warn' ? 7000 : 3500);
  }

  /* ---------- three.js scene ---------- */
  var stage = $('#stage'), canvas = $('#view');
  var renderer, scene, camera, pivot, holder;
  var lights = {};
  var queued = false;
  function requestRender() {
    if (queued || !renderer) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; renderer.render(scene, camera); });
  }
  function initThree() {
    if (!window.THREE) throw new Error('three.js did not load');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

    lights.hemi = new THREE.HemisphereLight(0xffffff, 0x8890a0, 0.9);
    scene.add(lights.hemi);

    lights.ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(lights.ambient);

    lights.key = new THREE.DirectionalLight(0xffffff, 1.1);
    scene.add(lights.key);

    lights.fill = new THREE.DirectionalLight(0xffffff, 0.4);
    scene.add(lights.fill);

    lights.rim = new THREE.DirectionalLight(0xc7d8ff, 0.35);
    scene.add(lights.rim);

    pivot = new THREE.Group(); holder = new THREE.Group();
    pivot.add(holder); scene.add(pivot);
    applyLighting();
  }
  function applyLighting() {
    if (!renderer || !lights.key) return;
    var L = state.light;
    var az = rad(L.keyAzimuth);
    var el = rad(L.keyElevation);
    var dist = 7;
    var cosEl = Math.cos(el);
    var kx = dist * cosEl * Math.sin(az);
    var ky = dist * Math.sin(el);
    var kz = dist * cosEl * Math.cos(az);

    lights.key.position.set(kx, ky, kz);
    lights.key.color.set(L.keyColor);
    lights.key.intensity = L.keyIntensity;

    // Fill sits opposite the key azimuth at softer elevation
    lights.fill.position.set(-kx * 0.85, Math.max(1.2, -ky * 0.35 + 1.5), -kz * 0.5 + 2.5);
    lights.fill.color.set(L.skyColor);
    lights.fill.intensity = L.fillIntensity;

    // Rim sits behind the model opposite key light for edge highlights
    lights.rim.position.set(-kx * 0.7, Math.abs(ky) * 0.6 + 2.0, -Math.abs(kz) - 3.5);
    lights.rim.color.set(L.rimColor);
    lights.rim.intensity = L.rimIntensity;

    lights.hemi.color.set(L.skyColor);
    lights.hemi.groundColor.set(L.groundColor);
    lights.hemi.intensity = L.ambientIntensity;
    lights.ambient.intensity = L.ambientIntensity * 0.22;

    renderer.toneMappingExposure = L.exposure;
    requestRender();
  }
  function resize() {
    if (!renderer) return;
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    requestRender();
  }
  function applyTransform() {
    if (!renderer) return;
    pivot.position.set(state.pos.x, state.pos.y, state.pos.z);
    pivot.rotation.set(rad(state.rot.x), rad(state.rot.y), rad(state.rot.z), 'XYZ');
    camera.position.set(0, 0, 5 / state.zoom);
    camera.lookAt(0, 0, 0);
    requestRender();
  }
  function disposeObject(o) {
    o.traverse(function (n) {
      if (n.geometry) n.geometry.dispose();
      var mats = n.material ? (Array.isArray(n.material) ? n.material : [n.material]) : [];
      mats.forEach(function (m) {
        Object.keys(m).forEach(function (k) { if (m[k] && m[k].isTexture) m[k].dispose(); });
        m.dispose();
      });
    });
  }
  function stripExtras(o) {
    var rm = [];
    o.traverse(function (n) { if (n.isLight || n.isCamera) rm.push(n); });
    rm.forEach(function (n) { if (n.parent) n.parent.remove(n); });
  }
  function countTris(o) {
    var t = 0;
    o.traverse(function (n) {
      if (n.isMesh && n.geometry) {
        var g = n.geometry;
        t += g.index ? g.index.count / 3 : (g.attributes.position ? g.attributes.position.count / 3 : 0);
      }
    });
    return Math.round(t);
  }
  function setModel(obj, name) {
    stripExtras(obj);
    while (holder.children.length) { var old = holder.children[0]; holder.remove(old); disposeObject(old); }
    var wrap = new THREE.Group();
    wrap.add(obj);
    obj.updateMatrixWorld(true);
    var box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) throw new Error('The file has no visible geometry.');
    var sphere = new THREE.Sphere(); box.getBoundingSphere(sphere);
    obj.position.sub(sphere.center);
    wrap.scale.setScalar(1 / Math.max(sphere.radius, 1e-6));
    holder.add(wrap);
    $('#model-name').textContent = name;
    $('#model-meta').textContent = countTris(obj).toLocaleString() + ' triangles';
    applyTransform();
  }
  function buildSample() {
    var g = new THREE.Group();
    function mat(c, r, m) { return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? 0.5 : r, metalness: m == null ? 0.1 : m }); }
    function add(geo, m, x, y, z) { var o = new THREE.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; }
    add(new THREE.BoxGeometry(1.1, 1.2, 0.8), mat(0x2d55e6), 0, 0, 0);
    add(new THREE.BoxGeometry(0.5, 0.3, 0.06), mat(0xe8ebf4), 0, 0.1, 0.42);
    add(new THREE.BoxGeometry(0.9, 0.7, 0.75), mat(0xf2b84b), 0, 1.0, 0);
    var eye = new THREE.SphereGeometry(0.09, 16, 12), dark = mat(0x101521);
    add(eye, dark, -0.2, 1.05, 0.38); add(eye, dark, 0.2, 1.05, 0.38);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 10), mat(0x59627a), 0, 1.55, 0);
    add(new THREE.SphereGeometry(0.08, 16, 12), mat(0xe5484d), 0, 1.8, 0);
    add(new THREE.BoxGeometry(0.25, 0.9, 0.25), mat(0xf2b84b), -0.7, 0.05, 0);
    add(new THREE.BoxGeometry(0.25, 0.9, 0.25), mat(0xf2b84b), 0.7, 0.05, 0);
    add(new THREE.BoxGeometry(0.3, 0.5, 0.3), mat(0x59627a), -0.3, -0.85, 0);
    add(new THREE.BoxGeometry(0.3, 0.5, 0.3), mat(0x59627a), 0.3, -0.85, 0);
    return g;
  }
  function loadSample() { setModel(buildSample(), 'Sample robot'); }

  /* ---------- loading user models ---------- */
  function loadFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    var main = files.filter(function (f) { return /\.(glb|gltf|fbx|obj|stl)$/i.test(f.name); })[0];
    if (!main) { toast('Choose a .glb, .gltf, .fbx, .obj or .stl file.', 'warn'); return Promise.resolve(); }
    var ext = main.name.split('.').pop().toLowerCase();
    var urls = {};
    files.forEach(function (f) { if (f !== main) urls[f.name.toLowerCase()] = URL.createObjectURL(f); });
    var manager = new THREE.LoadingManager();
    manager.setURLModifier(function (u) {
      var base = u.split('?')[0].split(/[\\\/]/).pop();
      try { base = decodeURIComponent(base); } catch (e) {}
      return urls[base.toLowerCase()] || u;
    });
    toast('Opening ' + main.name + '…');
    var job;
    if (ext === 'glb' || ext === 'gltf') {
      job = (ext === 'gltf' ? main.text() : main.arrayBuffer()).then(function (data) {
        return new Promise(function (res, rej) {
          new THREE.GLTFLoader(manager).parse(data, '', function (gltf) { res(gltf.scene); }, rej);
        });
      });
    } else if (ext === 'fbx') {
      job = main.arrayBuffer().then(function (b) { return new THREE.FBXLoader(manager).parse(b, ''); });
    } else if (ext === 'obj') {
      job = main.text().then(function (t) {
        var o = new THREE.OBJLoader().parse(t);
        o.traverse(function (n) { if (n.isMesh && n.geometry && !n.geometry.attributes.normal) n.geometry.computeVertexNormals(); });
        return o;
      });
    } else {
      job = main.arrayBuffer().then(function (b) {
        var geo = new THREE.STLLoader().parse(b);
        if (!geo.attributes.normal) geo.computeVertexNormals();
        return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xb8c0d0, roughness: 0.55, metalness: 0.1 }));
      });
    }
    return job.then(function (obj) {
      setModel(obj, main.name);
      toast('Opened ' + main.name);
    }).catch(function (err) {
      var m = err && err.message ? err.message : 'The file could not be read.';
      toast('Could not open ' + main.name + '. ' + m + (ext === 'gltf' ? ' Select the .bin and texture files together with the .gltf.' : ''), 'warn');
    }).then(function () {
      Object.keys(urls).forEach(function (k) { URL.revokeObjectURL(urls[k]); });
    });
  }

  /* ---------- axis rows ---------- */
  function makeRow(host, id, label, aria, min, max, step, wide) {
    var row = document.createElement('div'); row.className = 'axis' + (wide ? ' wide' : '');
    row.innerHTML = '<label for="' + id + '">' + label + '</label>' +
      '<input type="range" id="' + id + '-range" aria-label="' + aria + '" min="' + min + '" max="' + max + '" step="' + step + '">' +
      '<input type="number" id="' + id + '" step="any" inputmode="decimal">';
    host.appendChild(row);
  }
  var GROUPS = { pos: [-2, 2], rot: [-180, 180] };
  var LIGHT_SPECS = [
    { id: 'light-key-az', key: 'keyAzimuth', host: '#light-key-axes', label: 'AZM', aria: 'Key light azimuth angle', min: -180, max: 180, step: 1, dec: 0 },
    { id: 'light-key-el', key: 'keyElevation', host: '#light-key-axes', label: 'ELV', aria: 'Key light elevation angle', min: -90, max: 90, step: 1, dec: 0 },
    { id: 'light-key-int', key: 'keyIntensity', host: '#light-key-axes', label: 'INT', aria: 'Key light intensity', min: 0, max: 5, step: 0.05, dec: 2 },
    { id: 'light-fill-int', key: 'fillIntensity', host: '#light-fill-axes', label: 'FILL', aria: 'Fill light intensity', min: 0, max: 3, step: 0.05, dec: 2 },
    { id: 'light-rim-int', key: 'rimIntensity', host: '#light-fill-axes', label: 'RIM', aria: 'Rim light intensity', min: 0, max: 4, step: 0.05, dec: 2 },
    { id: 'light-amb-int', key: 'ambientIntensity', host: '#light-env-axes', label: 'AMB', aria: 'Ambient bounce intensity', min: 0, max: 3, step: 0.05, dec: 2 },
    { id: 'light-exp', key: 'exposure', host: '#light-env-axes', label: 'EXP', aria: 'Scene exposure', min: 0.2, max: 2.5, step: 0.05, dec: 2 }
  ];
  function buildAxes() {
    ['x', 'y', 'z'].forEach(function (k) {
      makeRow($('#position-axes'), 'pos-' + k, k.toUpperCase(), 'Position ' + k.toUpperCase(), -2, 2, 0.01);
      makeRow($('#rotation-axes'), 'rot-' + k, k.toUpperCase(), 'Rotation ' + k.toUpperCase(), -180, 180, 0.5);
    });
    makeRow($('#zoom-axes'), 'zoom', '×', 'Zoom', 0.3, 3, 0.01);
    LIGHT_SPECS.forEach(function (sp) {
      makeRow($(sp.host), sp.id, sp.label, sp.aria, sp.min, sp.max, sp.step, true);
    });
  }
  function fmt(v, d) { return String(Number(v.toFixed(d))); }
  function setAxis(group, key, v) {
    if (group === 'zoom') state.zoom = clamp(v, 0.3, 3);
    else state[group][key] = clamp(v, GROUPS[group][0], GROUPS[group][1]);
  }
  function syncAxes(except) {
    var set = function (id, v, d) {
      var n = $('#' + id), r = $('#' + id + '-range');
      if (except !== n) n.value = fmt(v, d);
      if (except !== r) r.value = v;
    };
    ['x', 'y', 'z'].forEach(function (k) { set('pos-' + k, state.pos[k], 2); set('rot-' + k, state.rot[k], 1); });
    set('zoom', state.zoom, 2);
    LIGHT_SPECS.forEach(function (sp) {
      set(sp.id, state.light[sp.key], sp.dec);
    });
  }
  function wireAxes() {
    function bind(id, group, key) {
      var n = $('#' + id), r = $('#' + id + '-range');
      r.addEventListener('input', function () {
        setAxis(group, key, parseFloat(r.value)); syncAxes(r); applyTransform(); persist();
      });
      n.addEventListener('input', function () {
        var v = parseFloat(n.value); if (!isFinite(v)) return;
        setAxis(group, key, v); syncAxes(n); applyTransform(); persist();
      });
      n.addEventListener('change', function () { syncAxes(); });
    }
    ['x', 'y', 'z'].forEach(function (k) { bind('pos-' + k, 'pos', k); bind('rot-' + k, 'rot', k); });
    bind('zoom', 'zoom', null);

    LIGHT_SPECS.forEach(function (sp) {
      var n = $('#' + sp.id), r = $('#' + sp.id + '-range');
      r.addEventListener('input', function () {
        state.light[sp.key] = clamp(parseFloat(r.value), sp.min, sp.max);
        syncAxes(r); applyLighting(); persist();
      });
      n.addEventListener('input', function () {
        var v = parseFloat(n.value); if (!isFinite(v)) return;
        state.light[sp.key] = clamp(v, sp.min, sp.max);
        syncAxes(n); applyLighting(); persist();
      });
      n.addEventListener('change', function () { syncAxes(); });
    });
  }

  /* ---------- lighting rigs ---------- */
  var LIGHT_RIGS = {
    studio: defaultLight(),
    sun: {
      keyAzimuth: 52, keyElevation: 58, keyIntensity: 1.65, keyColor: '#fff1d6',
      fillIntensity: 0.45, rimIntensity: 0.3, rimColor: '#ffe4b5',
      ambientIntensity: 0.95, skyColor: '#dbeafe', groundColor: '#a89f91', exposure: 1.05
    },
    neon: {
      keyAzimuth: -48, keyElevation: 28, keyIntensity: 1.35, keyColor: '#38bdf8',
      fillIntensity: 0.25, rimIntensity: 1.5, rimColor: '#f43f5e',
      ambientIntensity: 0.65, skyColor: '#818cf8', groundColor: '#1e1b4b', exposure: 1.1
    },
    dramatic: {
      keyAzimuth: 72, keyElevation: 20, keyIntensity: 2.1, keyColor: '#ffffff',
      fillIntensity: 0.1, rimIntensity: 0.85, rimColor: '#93c5fd',
      ambientIntensity: 0.35, skyColor: '#64748b', groundColor: '#18181b', exposure: 1.05
    }
  };

  /* ---------- background helpers ---------- */
  var bgImgEl = null;
  function loadBgEl() {
    bgImgEl = null;
    if (!state.bgImage) return;
    var im = new Image();
    im.onload = function () { bgImgEl = im; };
    im.src = state.bgImage;
  }
  function paintBackground(c, size) {
    c.fillStyle = state.bgColor; c.fillRect(0, 0, size, size);
    if (state.bgMode === 'image' && bgImgEl) {
      var s = Math.max(size / bgImgEl.width, size / bgImgEl.height);
      var w = bgImgEl.width * s, h = bgImgEl.height * s;
      c.drawImage(bgImgEl, (size - w) / 2, (size - h) / 2, w, h);
    }
  }
  function importBgImage(file) {
    if (!file) return;
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function () {
      var w0 = im.naturalWidth || im.width, h0 = im.naturalHeight || im.height;
      URL.revokeObjectURL(url);
      if (!w0 || !h0) { toast('That image has no size and could not be used.', 'warn'); return; }
      var s = Math.min(1, 2048 / Math.max(w0, h0)), w = Math.round(w0 * s), h = Math.round(h0 * s);
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(im, 0, 0, w, h);
      var data = /^image\/(png|webp|gif|svg\+xml)$/.test(file.type) ? c.toDataURL('image/png') : '';
      if (!data || data.length > 3500000) {
        var c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
        var x = c2.getContext('2d'); x.fillStyle = state.bgColor; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h);
        data = c2.toDataURL('image/jpeg', 0.88);
      }
      state.bgImage = data;
      state.bgMode = 'image';
      loadBgEl(); syncAll(); persist();
    };
    im.onerror = function () { URL.revokeObjectURL(url); toast('That image could not be read.', 'warn'); };
    im.src = url;
  }

  /* ---------- UI sync ---------- */
  function transparentOK() { return state.alpha === 'transparent' && state.format === 'png'; }
  function checked(name, value) { var el = $('input[name="' + name + '"][value="' + value + '"]'); if (el) el.checked = true; }
  function syncAll() {
    root.setAttribute('data-theme', state.theme);
    applyAccent();
    checked('theme', state.theme); checked('format', state.format); checked('alpha', state.alpha); checked('bgmode', state.bgMode);
    Array.prototype.forEach.call(document.querySelectorAll('.sw'), function (b) { b.setAttribute('aria-pressed', b.dataset.color === state.accent ? 'true' : 'false'); });
    $('#accent-custom').value = state.accent;
    $('#accent-hex').textContent = state.accent.toUpperCase();
    syncAxes();
    $('#light-key-color').value = state.light.keyColor;
    $('#light-key-hex').textContent = state.light.keyColor.toUpperCase();
    $('#light-rim-color').value = state.light.rimColor;
    $('#light-sky-color').value = state.light.skyColor;
    $('#light-sky-hex').textContent = state.light.skyColor.toUpperCase();
    $('#light-ground-color').value = state.light.groundColor;
    $('#light-ground-hex').textContent = state.light.groundColor.toUpperCase();
    $('#size').value = String(state.size);
    $('#filename').value = state.filename;
    $('#bg-color').value = state.bgColor;
    $('#bg-color-hex').textContent = state.bgColor.toUpperCase();
    $('#bg-color-wrap').hidden = state.bgMode !== 'color';
    $('#bg-image-wrap').hidden = state.bgMode !== 'image';
    $('#bg-thumb').style.backgroundImage = state.bgImage ? 'url("' + state.bgImage + '")' : '';
    var tOK = transparentOK();
    $('#bg-set').disabled = tOK;
    $('#bg-note').textContent = tOK ? 'Not used while a transparent PNG is selected.'
      : (state.bgMode === 'image' && !state.bgImage ? 'No image yet. The color is used until you import one.' : '');
    $('#warn').hidden = !(state.alpha === 'transparent' && state.format !== 'png');
    $('#readout').textContent = state.size + ' × ' + state.size + ' px · ' + state.format.toUpperCase() + ' · ' + (tOK ? 'transparent' : 'opaque');
    if (tOK) stage.style.background = '';
    else if (state.bgMode === 'image' && state.bgImage) stage.style.background = 'center / cover no-repeat url("' + state.bgImage + '") ' + state.bgColor;
    else stage.style.background = state.bgColor;
    applyTransform();
    applyLighting();
  }

  /* ---------- persistence ---------- */
  var persistT, warnedBg = false;
  function persist() { clearTimeout(persistT); persistT = setTimeout(doPersist, 250); }
  function doPersist() {
    if (!storageOK) { $('#save-status').textContent = 'Automatic saving is not available in this view. Use Export backup to keep your settings.'; return; }
    var ok = store.set(KEY_SETTINGS, state);
    if (!ok && state.bgImage) {
      ok = store.set(KEY_SETTINGS, Object.assign({}, state, { bgImage: null }));
      if (ok && !warnedBg) { warnedBg = true; toast('The background image is too large to keep between visits. Everything else is saved.', 'warn'); }
    }
    $('#save-status').textContent = ok ? 'Your last used settings are saved automatically in this browser. Last saved ' + new Date().toLocaleTimeString() + '.'
      : 'Settings could not be saved. Use Export backup to keep them.';
  }
  function savePresets() { if (storageOK) store.set(KEY_PRESETS, userPresets); }

  /* ---------- presets ---------- */
  function P(name, rot, extra) {
    return { name: name, builtin: true, s: Object.assign({ pos: { x: 0, y: 0, z: 0 }, rot: rot, zoom: 1, light: defaultLight(), format: 'png', size: 512, alpha: 'transparent', bgMode: 'color', bgColor: '#ffffff' }, extra || {}) };
  }
  var BUILTIN = [
    P('Front', { x: 0, y: 0, z: 0 }),
    P('Side', { x: 0, y: 90, z: 0 }),
    P('Top down', { x: 90, y: 0, z: 0 }),
    P('Isometric', { x: 35.3, y: 45, z: 0 }),
    P('Three-quarter', { x: 15, y: -35, z: 0 }),
    P('Icon 64', { x: 15, y: -35, z: 0 }, { size: 64, zoom: 1.15 }),
    P('Photo JPG', { x: 10, y: -30, z: 0 }, { format: 'jpg', alpha: 'opaque', size: 1024, bgColor: '#e9ecf2' })
  ];
  function applyPreset(s) {
    var keep = state.bgImage, filename = state.filename, theme = state.theme, accent = state.accent;
    var next = sanitize(s, state);
    next.bgImage = keep; next.filename = filename; next.theme = theme; next.accent = accent;
    if (next.bgMode === 'image' && !next.bgImage) next.bgMode = 'color';
    state = next; syncAll(); persist();
  }
  function armed(btn, label, action) {
    var t;
    btn.addEventListener('click', function () {
      if (btn.dataset.armed) { clearTimeout(t); delete btn.dataset.armed; btn.textContent = label; action(); return; }
      btn.dataset.armed = '1'; btn.textContent = 'Confirm';
      t = setTimeout(function () { delete btn.dataset.armed; btn.textContent = label; }, 3000);
    });
  }
  function renderPresets() {
    var host = $('#preset-list'); host.textContent = '';
    BUILTIN.concat(userPresets).forEach(function (p) {
      var li = document.createElement('li');
      var info = document.createElement('div');
      var nm = document.createElement('div'); nm.className = 'pname'; nm.textContent = p.name;
      if (p.builtin) { var tg = document.createElement('span'); tg.className = 'tag'; tg.textContent = 'built-in'; nm.appendChild(tg); }
      var meta = document.createElement('div'); meta.className = 'pmeta';
      meta.textContent = p.s.size + ' px · ' + p.s.format.toUpperCase() + ' · ' + p.s.alpha + ' · rot ' + fmt(p.s.rot.x, 1) + '°, ' + fmt(p.s.rot.y, 1) + '°, ' + fmt(p.s.rot.z, 1) + '°';
      info.appendChild(nm); info.appendChild(meta);
      var btns = document.createElement('div'); btns.className = 'pbtns';
      var ap = document.createElement('button'); ap.type = 'button'; ap.className = 'btn small'; ap.textContent = 'Apply';
      ap.addEventListener('click', function () { applyPreset(p.s); toast('Applied ' + p.name); });
      btns.appendChild(ap);
      if (!p.builtin) {
        var del = document.createElement('button'); del.type = 'button'; del.className = 'btn small'; del.textContent = 'Delete';
        armed(del, 'Delete', function () {
          var idx = userPresets.indexOf(p); if (idx > -1) userPresets.splice(idx, 1);
          savePresets(); renderPresets();
        });
        btns.appendChild(del);
      }
      li.appendChild(info); li.appendChild(btns); host.appendChild(li);
    });
  }
  function saveCurrentPreset() {
    var input = $('#preset-name'), name = input.value.trim().slice(0, 40);
    if (!name) { toast('Name the preset first.', 'warn'); input.focus(); return; }
    var s = presetFrom(state), found = -1;
    userPresets.forEach(function (p, i) { if (p.name.toLowerCase() === name.toLowerCase()) found = i; });
    if (found > -1) userPresets[found] = { name: name, s: s };
    else if (userPresets.length >= 30) { toast('You can keep up to 30 presets. Delete one first.', 'warn'); return; }
    else userPresets.push({ name: name, s: s });
    savePresets(); renderPresets(); input.value = '';
    toast(found > -1 ? 'Updated preset ' + name : 'Saved preset ' + name);
  }

  /* ---------- saving files ---------- */
  var downloads = null;
  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('downloads').then(function (d) { downloads = d; }, function () {});
  }
  function saveBlob(blob, filename) {
    if (downloads) {
      return downloads.save({ filename: filename, data: blob }).then(function () {
        toast('Saved ' + filename); return true;
      }, function (err) {
        var code = err && err.code;
        if (code === 'declined') toast('Save cancelled. Your sprite stays in Captures.');
        else if (code === 'rate_limited') toast('Another save prompt is still open. Finish it, then try again.', 'warn');
        else toast('This view could not save the file. ' + ((err && err.message) || ''), 'warn');
        return false;
      });
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    toast('Download started: ' + filename);
    return Promise.resolve(true);
  }

  /* ---------- captures ---------- */
  var caps = [];
  function addCapture(blob, filename) {
    caps.unshift({ blob: blob, filename: filename, url: URL.createObjectURL(blob) });
    while (caps.length > 8) URL.revokeObjectURL(caps.pop().url);
    var host = $('#cap-list'); host.textContent = '';
    caps.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'thumb';
      b.title = 'Save ' + c.filename + ' again'; b.setAttribute('aria-label', 'Save ' + c.filename + ' again');
      var im = document.createElement('img'); im.src = c.url; im.alt = '';
      b.appendChild(im); b.addEventListener('click', function () { saveBlob(c.blob, c.filename); });
      host.appendChild(b);
    });
    $('#caps').hidden = false;
  }

  /* ---------- export ---------- */
  var exporting = false;
  function exportSprite() {
    if (exporting || !renderer) return;
    exporting = true; $('#btn-export').disabled = true;
    var size = state.size, wantT = state.alpha === 'transparent', isPng = state.format === 'png';
    var transparent = wantT && isPng;
    if (wantT && !isPng) toast("Transparent mode couldn't be used because PNG isn't selected. The sprite exports with the background instead.", 'warn');
    var out = document.createElement('canvas'); out.width = out.height = size;
    var prev = renderer.getSize(new THREE.Vector2()), prevPR = renderer.getPixelRatio();
    try {
      renderer.setPixelRatio(1); renderer.setSize(size, size, false);
      camera.aspect = 1; camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      var c = out.getContext('2d');
      if (!transparent) paintBackground(c, size);
      c.drawImage(renderer.domElement, 0, 0, size, size);
    } finally {
      renderer.setPixelRatio(prevPR); renderer.setSize(prev.x, prev.y, false);
      camera.aspect = prev.x / prev.y; camera.updateProjectionMatrix();
      requestRender();
    }
    var mime = isPng ? 'image/png' : 'image/jpeg';
    var base = (state.filename || 'sprite').replace(/[^\w\- ]+/g, '').trim() || 'sprite';
    var filename = base + '-' + size + '.' + state.format;
    out.toBlob(function (blob) {
      exporting = false; $('#btn-export').disabled = false;
      if (!blob) { toast('The sprite could not be created. Try a smaller size.', 'warn'); return; }
      addCapture(blob, filename);
      saveBlob(blob, filename);
    }, mime, 0.92);
  }

  /* ---------- backup ---------- */
  function exportBackup() {
    var data = { app: 'sprite-booth', version: 1, settings: state, presets: userPresets };
    saveBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'sprite-exporter-backup.json');
  }
  function importBackup(file) {
    if (!file) return;
    file.text().then(function (t) {
      var d; try { d = JSON.parse(t); } catch (e) { d = null; }
      if (!d || d.app !== 'sprite-booth') { toast('That file is not a backup from this tool.', 'warn'); return; }
      state = sanitize(d.settings, defaults());
      loadBgEl();
      var added = 0;
      (Array.isArray(d.presets) ? d.presets : []).forEach(function (p) {
        if (!p || typeof p.name !== 'string' || !p.name.trim() || userPresets.length >= 30) return;
        var name = p.name.trim().slice(0, 40), s = presetFrom(sanitize(p.s, defaults())), found = -1;
        userPresets.forEach(function (q, i) { if (q.name.toLowerCase() === name.toLowerCase()) found = i; });
        if (found > -1) userPresets[found] = { name: name, s: s }; else userPresets.push({ name: name, s: s });
        added++;
      });
      savePresets(); renderPresets(); syncAll(); persist();
      toast('Backup restored. ' + added + ' preset' + (added === 1 ? '' : 's') + ' merged.');
    });
  }

  /* ---------- pointer controls ---------- */
  function wireViewport() {
    var pts = {}, count = 0, pinch0 = 0, zoom0 = 1;
    function dist() { var k = Object.keys(pts); var a = pts[k[0]], b = pts[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
    function wrapDeg(v) { while (v > 180) v -= 360; while (v < -180) v += 360; return v; }
    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId);
      if (!pts[e.pointerId]) count++;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY, shift: e.shiftKey || e.button === 2 };
      if (count === 2) { pinch0 = dist(); zoom0 = state.zoom; }
    });
    canvas.addEventListener('pointermove', function (e) {
      var p = pts[e.pointerId]; if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (count === 1) {
        if (p.shift) {
          var upp = (2 * camera.position.z * Math.tan(rad(camera.fov / 2))) / (stage.clientHeight || 1);
          setAxis('pos', 'x', state.pos.x + dx * upp); setAxis('pos', 'y', state.pos.y - dy * upp);
        } else {
          state.rot.y = wrapDeg(Math.round((state.rot.y + dx * 0.6) * 10) / 10);
          state.rot.x = wrapDeg(Math.round((state.rot.x + dy * 0.6) * 10) / 10);
        }
      } else if (count === 2 && pinch0 > 0) {
        setAxis('zoom', null, zoom0 * dist() / pinch0);
      } else return;
      syncAxes(); applyTransform(); persist();
    });
    function up(e) { if (pts[e.pointerId]) { delete pts[e.pointerId]; count--; } }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      setAxis('zoom', null, state.zoom * Math.exp(-e.deltaY * 0.0015));
      syncAxes(); applyTransform(); persist();
    }, { passive: false });
    canvas.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 1 : 5, k = e.key, used = true;
      if (k === 'ArrowLeft') state.rot.y = wrapDeg(state.rot.y - step);
      else if (k === 'ArrowRight') state.rot.y = wrapDeg(state.rot.y + step);
      else if (k === 'ArrowUp') state.rot.x = wrapDeg(state.rot.x - step);
      else if (k === 'ArrowDown') state.rot.x = wrapDeg(state.rot.x + step);
      else used = false;
      if (used) { e.preventDefault(); syncAxes(); applyTransform(); persist(); }
    });
  }

  /* ---------- settings popover ---------- */
  function wirePopover() {
    var btn = $('#btn-settings'), pop = $('#pop'), box = $('#settings');
    function set(open) { pop.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    btn.addEventListener('click', function () { set(!pop.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pop.classList.contains('open')) { set(false); btn.focus(); }
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
    root.classList.add('js-anim');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target;
        if (en.isIntersecting) { el.classList.add('in'); el.classList.remove('out'); }
        else {
          el.classList.remove('in');
          if (en.boundingClientRect.top < 0) el.classList.add('out'); else el.classList.remove('out');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- wiring ---------- */
  function wireUI() {
    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'theme') state.theme = t.value;
      else if (t.name === 'format') state.format = t.value;
      else if (t.name === 'alpha') state.alpha = t.value;
      else if (t.name === 'bgmode') state.bgMode = t.value;
      else if (t.id === 'size') state.size = +t.value;
      else return;
      syncAll(); persist();
    });
    $('#accent-custom').addEventListener('input', function (e) { state.accent = e.target.value.toLowerCase(); syncAll(); persist(); });
    $('#bg-color').addEventListener('input', function (e) { state.bgColor = e.target.value; syncAll(); persist(); });

    /* Lighting color pickers & quick rigs */
    $('#light-key-color').addEventListener('input', function (e) { state.light.keyColor = e.target.value.toLowerCase(); syncAll(); persist(); });
    $('#light-rim-color').addEventListener('input', function (e) { state.light.rimColor = e.target.value.toLowerCase(); syncAll(); persist(); });
    $('#light-sky-color').addEventListener('input', function (e) { state.light.skyColor = e.target.value.toLowerCase(); syncAll(); persist(); });
    $('#light-ground-color').addEventListener('input', function (e) { state.light.groundColor = e.target.value.toLowerCase(); syncAll(); persist(); });
    $('#light-rigs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-rig]');
      if (!btn) return;
      var rig = LIGHT_RIGS[btn.dataset.rig];
      if (rig) { state.light = clone(rig); syncAll(); persist(); toast('Applied ' + btn.textContent + ' lighting'); }
    });
    $('#btn-reset-lighting').addEventListener('click', function () {
      state.light = defaultLight(); syncAll(); persist();
    });

    $('#filename').addEventListener('input', function (e) { state.filename = e.target.value; persist(); });
    $('#btn-export').addEventListener('click', exportSprite);
    $('#btn-reset-view').addEventListener('click', function () {
      var d = defaults(); state.pos = d.pos; state.rot = d.rot; state.zoom = d.zoom; syncAll(); persist();
    });
    $('#btn-reset-transform').addEventListener('click', function () {
      state.pos = { x: 0, y: 0, z: 0 }; state.rot = { x: 0, y: 0, z: 0 }; state.zoom = 1; syncAll(); persist();
    });
    $('#btn-load').addEventListener('click', function () { $('#model-file').click(); });
    $('#model-file').addEventListener('change', function (e) { loadFiles(e.target.files); e.target.value = ''; });
    $('#btn-sample').addEventListener('click', function () { loadSample(); });
    $('#btn-bg').addEventListener('click', function () { $('#bg-file').click(); });
    $('#bg-file').addEventListener('change', function (e) { importBgImage(e.target.files[0]); e.target.value = ''; });
    $('#btn-bg-clear').addEventListener('click', function () {
      state.bgImage = null; bgImgEl = null; state.bgMode = 'color'; syncAll(); persist();
    });
    $('#btn-preset-save').addEventListener('click', saveCurrentPreset);
    $('#preset-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') saveCurrentPreset(); });
    $('#btn-backup').addEventListener('click', exportBackup);
    $('#btn-import').addEventListener('click', function () { $('#backup-file').click(); });
    $('#backup-file').addEventListener('change', function (e) { importBackup(e.target.files[0]); e.target.value = ''; });
    armed($('#btn-defaults'), 'Reset to defaults', function () {
      var d = defaults(); d.theme = state.theme; d.accent = state.accent; state = d; bgImgEl = null; syncAll(); persist(); toast('Settings reset to defaults.');
    });
    var dragDepth = 0;
    window.addEventListener('dragenter', function (e) { e.preventDefault(); dragDepth++; stage.classList.add('drag'); });
    window.addEventListener('dragover', function (e) { e.preventDefault(); });
    window.addEventListener('dragleave', function () { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) stage.classList.remove('drag'); });
    window.addEventListener('drop', function (e) {
      e.preventDefault(); dragDepth = 0; stage.classList.remove('drag');
      if (e.dataTransfer && e.dataTransfer.files.length) loadFiles(e.dataTransfer.files);
    });
  }

  /* ---------- boot ---------- */
  var sizeSel = $('#size');
  SIZES.forEach(function (s) { var o = document.createElement('option'); o.value = s; o.textContent = s + ' × ' + s; sizeSel.appendChild(o); });
  buildAxes(); buildSwatches(); wireAxes(); wireUI(); wirePopover(); renderPresets(); loadBgEl();
  try {
    initThree(); wireViewport();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
    loadSample(); resize();
  } catch (err) {
    var msg = document.createElement('div'); msg.className = 'stage-msg';
    msg.textContent = 'The 3D view could not start. ' + (err && err.message ? err.message : '') + ' Check that WebGL is enabled and reload the page.';
    stage.appendChild(msg); $('#btn-export').disabled = true;
  }
  syncAll();
  doPersist();
  initReveal();
})();

