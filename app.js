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
  function defaults() {
    var dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      theme: dark ? 'dark' : 'light', accent: '#2d55e6',
      pos: { x: 0, y: 0, z: 0 }, rot: { x: 12, y: -28, z: 0 }, zoom: 1,
      format: 'png', size: 512, alpha: 'transparent',
      bgMode: 'color', bgColor: '#ffffff', bgImage: null, filename: 'sprite'
    };
  }
  function num(v, min, max, d) { v = parseFloat(v); return isFinite(v) ? clamp(v, min, max) : d; }
  var IMG_RE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+\/=]+$/;
  var HEX_RE = /^#[0-9a-f]{6}$/i;
  function sanitize(o, base) {
    var s = clone(base); o = o || {};
    if (o.theme === 'light' || o.theme === 'dark') s.theme = o.theme;
    if (typeof o.accent === 'string' && HEX_RE.test(o.accent)) s.accent = o.accent.toLowerCase();
    var p = o.pos || {}, r = o.rot || {};
    s.pos = { x: num(p.x, -2, 2, s.pos.x), y: num(p.y, -2, 2, s.pos.y), z: num(p.z, -2, 2, s.pos.z) };
    s.rot = { x: num(r.x, -180, 180, s.rot.x), y: num(r.y, -180, 180, s.rot.y), z: num(r.z, -180, 180, s.rot.z) };
    s.zoom = num(o.zoom, 0.3, 3, s.zoom);
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
    return { pos: clone(s.pos), rot: clone(s.rot), zoom: s.zoom, format: s.format, size: s.size, alpha: s.alpha, bgMode: s.bgMode, bgColor: s.bgColor };
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
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8890a0, 0.9));
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(3, 5, 4); scene.add(key);
    var fill = new THREE.DirectionalLight(0xffffff, 0.4); fill.position.set(-4, 1, -3); scene.add(fill);
    pivot = new THREE.Group(); holder = new THREE.Group();
    pivot.add(holder); scene.add(pivot);
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
  function makeRow(host, id, label, aria, min, max, step) {
    var row = document.createElement('div'); row.className = 'axis';
    row.innerHTML = '<label for="' + id + '">' + label + '</label>' +
      '<input type="range" id="' + id + '-range" aria-label="' + aria + '" min="' + min + '" max="' + max + '" step="' + step + '">' +
      '<input type="number" id="' + id + '" step="any" inputmode="decimal">';
    host.appendChild(row);
  }
  var GROUPS = { pos: [-2, 2], rot: [-180, 180] };
  function buildAxes() {
    ['x', 'y', 'z'].forEach(function (k) {
      makeRow($('#position-axes'), 'pos-' + k, k.toUpperCase(), 'Position ' + k.toUpperCase(), -2, 2, 0.01);
      makeRow($('#rotation-axes'), 'rot-' + k, k.toUpperCase(), 'Rotation ' + k.toUpperCase(), -180, 180, 0.5);
    });
    makeRow($('#zoom-axes'), 'zoom', '×', 'Zoom', 0.3, 3, 0.01);
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
  }

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
    return { name: name, builtin: true, s: Object.assign({ pos: { x: 0, y: 0, z: 0 }, rot: rot, zoom: 1, format: 'png', size: 512, alpha: 'transparent', bgMode: 'color', bgColor: '#ffffff' }, extra || {}) };
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
