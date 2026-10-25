/* Owner admin: edit goods, events and business info from a phone.
   Saves by committing straight to the GitHub repo that hosts the site. */
(function () {
  const B = window.Booth;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const CONN_KEY = "booth-admin-connection";

  const A = { site: {}, items: [], events: [], conn: null, live: false, previews: {} };

  /* ================= Connection ================= */
  function loadConn() {
    try { return JSON.parse(localStorage.getItem(CONN_KEY)) || null; } catch (_) { return null; }
  }
  function storeConn(c) {
    try { c ? localStorage.setItem(CONN_KEY, JSON.stringify(c)) : localStorage.removeItem(CONN_KEY); } catch (_) {}
  }
  function guessRepo() {
    const host = location.hostname;
    if (/\.github\.io$/i.test(host)) {
      const seg = location.pathname.split("/").filter(Boolean)[0];
      return { owner: host.split(".")[0], repo: seg && seg !== "admin" ? seg : host, branch: "main" };
    }
    const r = A.site.repo || {};
    return { owner: r.owner || "", repo: r.name || "", branch: r.branch || "main" };
  }

  async function gh(path, { method = "GET", body, raw = false } = {}) {
    const c = A.conn;
    const res = await fetch("https://api.github.com" + path, {
      method,
      cache: "no-store",
      headers: {
        Authorization: "Bearer " + c.token,
        Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      let msg = "";
      try { msg = (await res.json()).message || ""; } catch (_) {}
      const err = new Error(msg || res.statusText || "Request failed");
      err.status = res.status;
      throw err;
    }
    return raw ? res.text() : res.json();
  }

  function friendly(e) {
    if (e && e.status === 401) return "GitHub didn't accept the access token. It may have expired. Make a new one and connect again.";
    if (e && e.status === 404) return "GitHub couldn't find that repo, or the token can't see it. Check the owner and repo name, and that the token includes this repo.";
    if (e && e.status === 403) return "The token can read but not save. Give it Contents: Read and write on this repo.";
    if (e && e.status === 409) return "The repo is empty. Push the site files to it first, then connect.";
    if (e instanceof TypeError) return "Couldn't reach GitHub. Check your signal and try again.";
    return (e && e.message) || "Something went wrong.";
  }

  const repoPath = () => `/repos/${encodeURIComponent(A.conn.owner)}/${encodeURIComponent(A.conn.repo)}`;

  async function readFile(path) {
    return gh(`${repoPath()}/contents/${path}?ref=${encodeURIComponent(A.conn.branch)}`, { raw: true });
  }
  async function readAll() {
    const [site, items, events] = await Promise.all(["site", "items", "events"].map((f) => readFile(`data/${f}.json`).then(JSON.parse)));
    return { site, items, events };
  }

  // One commit with any number of added/changed/removed files.
  async function commitFiles(files, deletions, message) {
    const base = repoPath();
    const branch = A.conn.branch;
    const ref = await gh(`${base}/git/ref/heads/${branch}`);
    const parent = ref.object.sha;
    const commit = await gh(`${base}/git/commits/${parent}`);
    const tree = [];
    for (const f of files) {
      const blob = await gh(`${base}/git/blobs`, {
        method: "POST",
        body: f.base64 ? { content: f.base64, encoding: "base64" } : { content: f.content, encoding: "utf-8" },
      });
      tree.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    if (deletions.length) {
      // Only remove files that are actually there, or GitHub rejects the whole commit.
      const existing = await gh(`${base}/git/trees/${commit.tree.sha}?recursive=1`);
      const have = new Set(existing.tree.map((t) => t.path));
      deletions.filter((p) => have.has(p)).forEach((p) => tree.push({ path: p, mode: "100644", type: "blob", sha: null }));
    }
    const newTree = await gh(`${base}/git/trees`, { method: "POST", body: { base_tree: commit.tree.sha, tree } });
    const newCommit = await gh(`${base}/git/commits`, { method: "POST", body: { message, tree: newTree.sha, parents: [parent] } });
    try {
      await gh(`${base}/git/refs/heads/${branch}`, { method: "PATCH", body: { sha: newCommit.sha } });
    } catch (e) {
      if (e.status === 422 || e.status === 409) e.conflict = true; // someone else saved in between
      throw e;
    }
  }

  // Re-read the latest data, apply the change, commit. Retries if another save landed first.
  async function save(mutate, message, { uploads = [], deletions = [] } = {}) {
    if (!A.live) {
      showTab("connect");
      B.toast("Connect to GitHub first, then save.");
      return false;
    }
    busy(true);
    try {
      for (let attempt = 0; ; attempt++) {
        const fresh = await readAll();
        const changed = mutate(fresh) || [];
        const files = changed
          .map((k) => ({ path: `data/${k}.json`, content: JSON.stringify(fresh[k], null, 2) + "\n" }))
          .concat(uploads);
        try {
          await commitFiles(files, deletions, message);
          Object.assign(A, fresh);
          break;
        } catch (e) {
          if (e.conflict && attempt < 2) continue;
          throw e;
        }
      }
      renderAll();
      B.toast("Saved. The site updates in about a minute.", 4000);
      return true;
    } catch (e) {
      B.toast(friendly(e), 6000);
      return false;
    } finally {
      busy(false);
    }
  }

  function busy(on) {
    document.body.classList.toggle("is-busy", on);
    $$("form button[type=submit]").forEach((b) => {
      if (on) { b.dataset.label = b.textContent; b.textContent = "Saving…"; }
      else if (b.dataset.label) b.textContent = b.dataset.label;
      b.disabled = on;
    });
    if (on) B.toast("Saving…", 60000);
  }

  /* ================= Helpers ================= */
  const slug = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "item";
  function uniqueId(base, list) {
    let id = base, n = 2;
    while (list.some((x) => x.id === id)) id = `${base}-${n++}`;
    return id;
  }
  function parsePrice(v) {
    v = String(v || "").trim().replace(/^\$/, "");
    if (!v) return "";
    return /^\d+(\.\d{1,2})?$/.test(v) ? Number(v) : v;
  }
  const list = (v) => String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
  const thumb = (path) => A.previews[path] || B.img(path);

  // Resize a phone photo so the repo and the page stay light.
  function shrink(file, max = 1600, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        c.toBlob((blob) => {
          if (!blob) return reject(new Error("Couldn't process that photo."));
          const fr = new FileReader();
          fr.onload = () => resolve({ base64: String(fr.result).split(",")[1], preview: URL.createObjectURL(blob) });
          fr.onerror = () => reject(new Error("Couldn't process that photo."));
          fr.readAsDataURL(blob);
        }, "image/jpeg", quality);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Couldn't open that photo. Try a JPG or PNG.")); };
      img.src = url;
    });
  }

  /* ================= Tabs ================= */
  function showTab(name) {
    $$('[role="tab"]').forEach((t) => t.setAttribute("aria-selected", t.id === "tab-" + name));
    $$('[role="tabpanel"]').forEach((p) => (p.hidden = p.id !== "panel-" + name));
    try { sessionStorage.setItem("booth-admin-tab", name); } catch (_) {}
  }
  $(".tabs").addEventListener("click", (e) => {
    const t = e.target.closest('[role="tab"]');
    if (t) showTab(t.id.replace("tab-", ""));
  });

  /* ================= Rendering ================= */
  function renderAll() {
    $("#mark").textContent = A.site.name ? `${A.site.name}` : "Manage";
    document.title = `Manage: ${A.site.name || "site"}`;
    renderItems();
    renderEvents();
    fillInfo();
    const hasSamples = A.items.some((i) => i.sample) || A.events.some((e) => e.sample);
    $("#samples-hint").hidden = !A.items.some((i) => i.sample);
    $("#samples-hint-ev").hidden = !A.events.some((e) => e.sample);
    if (!hasSamples) { $("#samples-hint").hidden = true; $("#samples-hint-ev").hidden = true; }
    renderBanner();
  }

  function renderBanner(error) {
    const b = $("#banner");
    if (A.live && !error) { b.hidden = true; return; }
    b.hidden = false;
    b.className = "banner" + (error ? " banner--bad" : "");
    b.innerHTML = error
      ? `<p>${B.esc(error)}</p><button class="btn btn--small" type="button" data-goto="connect">Check connection</button>`
      : `<p>You're looking at what's on the site now. To save changes from this phone, connect it to GitHub once.</p><button class="btn btn--small btn--dark" type="button" data-goto="connect">Connect this phone</button>`;
  }
  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-goto]");
    if (g) showTab(g.dataset.goto);
  });

  const STATUS = { sold: ["Sold", "pill--sold"], hidden: ["Hidden", "pill--hidden"] };
  function renderItems() {
    const ul = $("#item-list");
    if (!A.items.length) {
      ul.innerHTML = `<li class="empty">Nothing listed yet. Tap Add an item and snap a photo.</li>`;
      return;
    }
    ul.innerHTML = A.items.map((i) => {
      const st = STATUS[i.status];
      const pic = (i.photos || [])[0];
      return `<li class="arow">
        <button type="button" class="arow__main" data-edit-item="${B.esc(i.id)}">
          ${pic ? `<img src="${B.esc(thumb(pic))}" alt="">` : `<span class="arow__pic"></span>`}
          <span class="arow__text"><b>${B.esc(i.title)}</b>
            <small>${B.esc(B.money(i.price) || "Ask")}${st ? `<span class="pill ${st[1]}">${st[0]}</span>` : ""}${i.featured ? `<span class="pill">Home page</span>` : ""}${i.sample ? `<span class="pill">Sample</span>` : ""}${B.labelGaps(i, A.site).length ? `<span class="pill warn" title="Missing: ${B.esc(B.labelGaps(i, A.site).join(", "))}">Label incomplete</span>` : ""}</small>
          </span>
        </button>
        <button type="button" class="btn btn--small" data-toggle-sold="${B.esc(i.id)}">${i.status === "sold" ? "Back in stock" : "Mark sold"}</button>
      </li>`;
    }).join("");
  }

  function renderEvents() {
    const ul = $("#event-list");
    if (!A.events.length) {
      ul.innerHTML = `<li class="empty">No events yet. Tap Add an event to put your next show on the calendar.</li>`;
      return;
    }
    const today = B.today();
    const rows = A.events.map((ev) => {
      const next = B.occurrences(ev, today, B.addDays(today, 400)).find((o) => !o.cancelled);
      return { ev, next };
    }).sort((a, b) => (a.next ? +a.next.start : Infinity) - (b.next ? +b.next.start : Infinity));
    ul.innerHTML = rows.map(({ ev, next }) => `<li class="arow">
      <button type="button" class="arow__main" data-edit-event="${B.esc(ev.id)}">
        <span class="arow__date">${next ? `<span>${B.MON[next.start.getMonth()]}</span><b>${next.start.getDate()}</b>` : `<span>None</span>`}</span>
        <span class="arow__text"><b>${B.esc(ev.title)}</b>
          <small>${B.esc(next ? B.range(next.start, next.end) : "No upcoming dates")}${ev.repeat ? `<span class="pill">Repeats</span>` : ev.kind === "popup" ? `<span class="pill">Pop-up</span>` : ""}${ev.sample ? `<span class="pill">Sample</span>` : ""}</small>
        </span>
      </button>
      <a class="btn btn--small" href="${B.esc(B.eventURL(ev))}">View</a>
    </li>`).join("");
  }

  /* ================= Goods ================= */
  const itemDlg = $("#item-dlg");
  const itemForm = $("#item-form");
  let editingItem = null;
  let photos = []; // { path } for photos already saved, { base64, preview } for new ones

  function fillCategories(selected) {
    const cats = [...new Set([...(A.site.categories || []), selected].filter(Boolean))];
    itemForm.category.innerHTML = `<option value="">None</option>` + cats.map((c) => `<option ${c === selected ? "selected" : ""}>${B.esc(c)}</option>`).join("");
  }
  function renderThumbs() {
    $("#item-thumbs").innerHTML = photos.map((p, i) => p.loading
      ? `<div class="thumb busy">Loading…</div>`
      : `<div class="thumb"><img src="${B.esc(p.preview || thumb(p.path))}" alt="Photo ${i + 1}">
          ${i === 0 ? `<span class="main-flag">Main</span>` : ""}
          <button type="button" data-remove-photo="${i}" aria-label="Remove photo ${i + 1}">×</button></div>`).join("");
    $("#photo-btn-text").textContent = photos.length ? "Add more photos" : "Add photos";
  }
  function openItem(id) {
    const it = id ? A.items.find((x) => x.id === id) : null;
    editingItem = it ? it.id : null;
    itemForm.reset();
    $("#item-h").textContent = it ? "Edit item" : "Add an item";
    $("#item-delete").hidden = !it;
    photos = it ? (it.photos || []).map((path) => ({ path })) : [];
    fillCategories(it ? it.category : "");
    if (it) {
      itemForm.title.value = it.title || "";
      itemForm.price.value = it.price ?? "";
      itemForm.description.value = it.description || "";
      itemForm.querySelector(`[name=status][value="${it.status || "available"}"]`).checked = true;
      itemForm.featured.checked = !!it.featured;
      itemForm.homeBaked.checked = !!it.homeBaked;
      itemForm.ingredients.value = it.ingredients || "";
      itemForm.netWt.value = it.netWt || "";
    } else {
      itemForm.featured.checked = true;
    }
    renderThumbs();
    itemDlg.showModal();
    if (!it) itemForm.title.focus();
  }
  $("#add-item").addEventListener("click", () => openItem(null));
  $("#item-photos").addEventListener("change", async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    for (const f of files) {
      const slot = { loading: true };
      photos.push(slot);
      renderThumbs();
      try {
        Object.assign(slot, await shrink(f), { loading: false });
      } catch (err) {
        photos.splice(photos.indexOf(slot), 1);
        B.toast(err.message);
      }
      renderThumbs();
    }
  });
  $("#item-thumbs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-remove-photo]");
    if (!b) return;
    photos.splice(+b.dataset.removePhoto, 1);
    renderThumbs();
  });
  itemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = itemForm.title.value.trim();
    if (!title) { itemForm.title.focus(); B.toast("Give the item a name."); return; }
    if (photos.some((p) => p.loading)) { B.toast("Hang on, a photo is still loading."); return; }
    const existing = editingItem ? A.items.find((x) => x.id === editingItem) : null;
    const id = existing ? existing.id : uniqueId(slug(title), A.items);
    const stamp = Date.now().toString(36);
    const uploads = [];
    const paths = photos.map((p, i) => {
      if (p.path) return p.path;
      const path = `images/items/${id}-${stamp}${i}.jpg`;
      uploads.push({ path, base64: p.base64 });
      A.previews[path] = p.preview;
      return path;
    });
    const removed = existing ? (existing.photos || []).filter((p) => !paths.includes(p)) : [];
    const record = {
      id,
      title,
      price: parsePrice(itemForm.price.value),
      category: itemForm.category.value,
      description: itemForm.description.value.trim(),
      photos: paths,
      status: itemForm.querySelector("[name=status]:checked").value,
      featured: itemForm.featured.checked,
      homeBaked: itemForm.homeBaked.checked,
      ingredients: itemForm.ingredients.value.trim(),
      netWt: itemForm.netWt.value.trim(),
      added: (existing && existing.added) || B.iso(B.today()),
    };
    const ok = await save((d) => {
      const i = d.items.findIndex((x) => x.id === id);
      if (i >= 0) d.items[i] = record; else d.items.unshift(record);
      return ["items"];
    }, `${existing ? "Update" : "Add"} item: ${title}`, { uploads, deletions: removed });
    if (ok) itemDlg.close();
  });
  $("#item-delete").addEventListener("click", async () => {
    const it = A.items.find((x) => x.id === editingItem);
    if (!it || !confirm(`Delete "${it.title}"? This can't be undone.`)) return;
    const ok = await save((d) => { d.items = d.items.filter((x) => x.id !== it.id); return ["items"]; }, `Delete item: ${it.title}`, { deletions: it.photos || [] });
    if (ok) itemDlg.close();
  });
  $("#item-list").addEventListener("click", async (e) => {
    const ed = e.target.closest("[data-edit-item]");
    if (ed) return openItem(ed.dataset.editItem);
    const t = e.target.closest("[data-toggle-sold]");
    if (t) {
      const id = t.dataset.toggleSold;
      const it = A.items.find((x) => x.id === id);
      const next = it.status === "sold" ? "available" : "sold";
      await save((d) => { const x = d.items.find((y) => y.id === id); if (x) x.status = next; return ["items"]; }, `${next === "sold" ? "Sold" : "Restocked"}: ${it.title}`);
    }
  });

  /* ================= Events ================= */
  const evDlg = $("#event-dlg");
  const evForm = $("#event-form");
  let editingEvent = null;
  let skips = [];
  evForm.weekday.innerHTML = B.DOW_LONG.map((d, i) => `<option value="${i}">${d}</option>`).join("");

  function dateRow(start = "", end = "") {
    const div = document.createElement("div");
    div.className = "date-row";
    div.innerHTML = `<label>First day <input type="date" data-d="start" value="${B.esc(start)}"></label>
      <label>Last day <input type="date" data-d="end" value="${B.esc(end)}"></label>
      <button type="button" class="x" aria-label="Remove this date">×</button>`;
    return div;
  }
  function syncSchedule() {
    const s = evForm.schedule.value;
    $$('[data-show="dates"]', evForm).forEach((el) => (el.hidden = s !== "dates"));
    $$('[data-show="repeat"]', evForm).forEach((el) => (el.hidden = s === "dates"));
    $$('[data-show="month"]', evForm).forEach((el) => (el.hidden = s !== "month"));
    $$('[data-show="custom"]', evForm).forEach((el) => (el.hidden = evForm.adm_mode.value !== "custom"));
    if (s === "dates" && !$("#date-rows").children.length) $("#date-rows").appendChild(dateRow());
  }
  function renderSkips() {
    $("#skip-list").innerHTML = skips.sort().map((d) => {
      const dt = B.parse(d);
      return `<li>${B.esc(B.range(dt, dt))}<button type="button" data-unskip="${d}" aria-label="Uncancel ${B.esc(B.range(dt, dt))}">×</button></li>`;
    }).join("");
  }
  function setPin(lat, lng, label) {
    evForm.lat.value = lat ?? "";
    evForm.lng.value = lng ?? "";
    const pin = $("#pin");
    const ok = lat !== "" && lat != null && lng !== "" && lng != null;
    pin.className = "pin" + (ok ? " ok" : "");
    pin.textContent = ok ? `On the map${label ? ": " + label : ""}.` : "Not on the map yet.";
  }
  function openEvent(id) {
    const ev = id ? A.events.find((x) => x.id === id) : null;
    editingEvent = ev ? ev.id : null;
    evForm.reset();
    $("#event-h").textContent = ev ? "Edit event" : "Add an event";
    $("#event-delete").hidden = !ev;
    $("#date-rows").innerHTML = "";
    skips = ev ? [...(ev.skip || [])] : [];
    if (ev) {
      evForm.title.value = ev.title || "";
      evForm.querySelector(`[name=kind][value="${ev.kind === "popup" ? "popup" : "regular"}"]`).checked = true;
      const r = ev.repeat;
      evForm.schedule.value = !r ? "dates" : r.every === "month" ? "month" : +r.interval === 2 ? "week2" : "week";
      if (r) {
        evForm.nth.value = String(r.nth || 1);
        evForm.weekday.value = String(r.weekday ?? 6);
        evForm.days.value = String(r.days || 1);
        evForm.start.value = r.start || "";
        evForm.until.value = r.until || "";
      }
      (ev.dates || []).forEach((d) => $("#date-rows").appendChild(dateRow(d.start || d, d.end || "")));
      ["hours", "venue", "address", "booth", "notes", "link"].forEach((k) => (evForm[k].value = ev[k] || ""));
      const a = ev.admission || { mode: "standard" };
      evForm.adm_mode.value = a.mode || "standard";
      evForm.adm_price.value = a.price ?? "";
      evForm.adm_freeFor.value = a.freeFor || "";
      setPin(ev.lat, ev.lng, ev.venue);
    } else {
      evForm.weekday.value = "6";
      evForm.days.value = "2";
      evForm.start.value = B.iso(B.today());
      setPin("", "");
    }
    syncSchedule();
    renderSkips();
    evDlg.showModal();
    if (!ev) evForm.title.focus();
  }
  $("#add-event").addEventListener("click", () => openEvent(null));
  evForm.schedule.addEventListener("change", syncSchedule);
  evForm.adm_mode.addEventListener("change", syncSchedule);
  $("#add-date").addEventListener("click", () => {
    const row = dateRow();
    $("#date-rows").appendChild(row);
    row.querySelector("input").focus();
  });
  $("#date-rows").addEventListener("click", (e) => {
    const x = e.target.closest(".x");
    if (x) x.closest(".date-row").remove();
  });
  $("#date-rows").addEventListener("change", (e) => {
    // Picking a first day pre-fills the last day for two-day shows.
    if (e.target.dataset.d !== "start") return;
    const end = e.target.closest(".date-row").querySelector('[data-d="end"]');
    if (!end.value || end.value < e.target.value) end.value = e.target.value;
  });
  $("#add-skip").addEventListener("click", () => {
    const v = $("#skip-input").value;
    if (!v) return;
    if (!skips.includes(v)) skips.push(v);
    $("#skip-input").value = "";
    renderSkips();
  });
  $("#skip-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-unskip]");
    if (!b) return;
    skips = skips.filter((d) => d !== b.dataset.unskip);
    renderSkips();
  });
  evForm.address.addEventListener("input", () => {
    if (evForm.lat.value) setPin("", "");
    $("#pin").textContent = "Address changed. Tap Find on map to pin it.";
  });
  $("#geocode").addEventListener("click", async () => {
    const q = [evForm.venue.value, evForm.address.value].map((s) => s.trim()).filter(Boolean).join(", ");
    const addr = evForm.address.value.trim();
    if (!addr) { B.toast("Type the address first."); evForm.address.focus(); return; }
    $("#pin").textContent = "Looking it up…";
    const look = async (query) => {
      const r = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=" + encodeURIComponent(query), { headers: { "Accept-Language": "en" } });
      return r.ok ? r.json() : [];
    };
    try {
      let hits = await look(addr);
      if (!hits.length && q !== addr) hits = await look(q);
      if (!hits.length) {
        setPin("", "");
        $("#pin").textContent = "Couldn't find that address. Check the spelling and add the city. The event still shows without a pin.";
        return;
      }
      const h = hits[0];
      setPin(Number((+h.lat).toFixed(5)), Number((+h.lon).toFixed(5)), h.display_name.split(",").slice(0, 3).join(","));
    } catch (_) {
      $("#pin").textContent = "Couldn't reach the map lookup. Try again in a minute.";
    }
  });

  evForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = evForm.title.value.trim();
    if (!title) { evForm.title.focus(); B.toast("Give the event a name."); return; }
    const s = evForm.schedule.value;
    const dates = s === "dates"
      ? $$(".date-row", evForm).map((r) => ({ start: r.querySelector('[data-d="start"]').value, end: r.querySelector('[data-d="end"]').value }))
          .filter((d) => d.start).map((d) => ({ start: d.start, end: d.end && d.end > d.start ? d.end : "" }))
          .sort((a, b) => a.start.localeCompare(b.start))
      : [];
    if (s === "dates" && !dates.length) { B.toast("Add at least one date."); return; }
    const repeat = s === "dates" ? null : {
      every: s === "month" ? "month" : "week",
      interval: s === "week2" ? 2 : 1,
      nth: s === "month" ? Number(evForm.nth.value) : undefined,
      weekday: Number(evForm.weekday.value),
      days: Number(evForm.days.value),
      start: evForm.start.value || B.iso(B.today()),
      until: evForm.until.value || "",
    };
    if (repeat && repeat.nth === undefined) delete repeat.nth;
    const mode = evForm.adm_mode.value;
    const admission = mode === "custom"
      ? { mode, price: parsePrice(evForm.adm_price.value), freeFor: evForm.adm_freeFor.value.trim() }
      : { mode };
    const existing = editingEvent ? A.events.find((x) => x.id === editingEvent) : null;
    const id = existing ? existing.id : uniqueId(slug(title), A.events); // keeps old links working after a rename
    const num = (v) => (v === "" || v == null ? "" : Number(v));
    const record = {
      id,
      title,
      kind: evForm.querySelector("[name=kind]:checked").value,
      venue: evForm.venue.value.trim(),
      address: evForm.address.value.trim(),
      lat: num(evForm.lat.value),
      lng: num(evForm.lng.value),
      hours: evForm.hours.value.trim(),
      booth: evForm.booth.value.trim(),
      admission,
      repeat,
      dates,
      skip: repeat ? [...skips].sort() : [],
      notes: evForm.notes.value.trim(),
      link: evForm.link.value.trim(),
    };
    const ok = await save((d) => {
      const i = d.events.findIndex((x) => x.id === id);
      if (i >= 0) d.events[i] = record; else d.events.push(record);
      return ["events"];
    }, `${existing ? "Update" : "Add"} event: ${title}`);
    if (ok) evDlg.close();
  });
  $("#event-delete").addEventListener("click", async () => {
    const ev = A.events.find((x) => x.id === editingEvent);
    if (!ev || !confirm(`Delete "${ev.title}"? Links to it will stop working.`)) return;
    const ok = await save((d) => { d.events = d.events.filter((x) => x.id !== ev.id); return ["events"]; }, `Delete event: ${ev.title}`);
    if (ok) evDlg.close();
  });
  $("#event-list").addEventListener("click", (e) => {
    const ed = e.target.closest("[data-edit-event]");
    if (ed) openEvent(ed.dataset.editEvent);
  });

  /* ================= Samples ================= */
  document.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-clear-samples]")) return;
    if (!confirm("Remove every listing and event marked Sample?")) return;
    const photos = A.items.filter((i) => i.sample).flatMap((i) => i.photos || []);
    await save((d) => {
      d.items = d.items.filter((i) => !i.sample);
      d.events = d.events.filter((x) => !x.sample);
      return ["items", "events"];
    }, "Remove sample listings and events", { deletions: photos });
  });

  /* ================= Business info ================= */
  const infoForm = $("#info-form");
  function fillInfo() {
    const s = A.site;
    ["name", "tagline", "about", "phone", "email", "facebook", "instagram", "tiktok", "dealerNote"].forEach((k) => (infoForm[k].value = s[k] || ""));
    infoForm.payments.value = (s.payments || []).join(", ");
    infoForm.categories.value = (s.categories || []).join(", ");
    const a = s.admission || {};
    infoForm.adm_price.value = a.price ?? "";
    infoForm.adm_freeFor.value = a.freeFor || "";
    infoForm.adm_where.value = a.where || "";
    infoForm.adm_note.value = a.note || "";
    infoForm.producer_name.value = (s.producer || {}).name || "";
    infoForm.producer_address.value = (s.producer || {}).address || "";
  }
  infoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = (k) => infoForm[k].value.trim();
    if (!v("name")) { infoForm.name.focus(); B.toast("The business needs a name."); return; }
    await save((d) => {
      Object.assign(d.site, {
        name: v("name"), tagline: v("tagline"), about: v("about"), phone: v("phone"), email: v("email"),
        facebook: v("facebook"), instagram: v("instagram"), tiktok: v("tiktok"), dealerNote: v("dealerNote"),
        payments: list(v("payments")), categories: list(v("categories")),
      });
      d.site.admission = { ...(d.site.admission || {}), price: parsePrice(v("adm_price")), freeFor: v("adm_freeFor"), where: v("adm_where"), note: v("adm_note") };
      d.site.producer = { name: v("producer_name"), address: v("producer_address") };
      return ["site"];
    }, "Update business info");
  });

  /* ================= Connect ================= */
  const connForm = $("#connect-form");
  function fillConn() {
    const c = A.conn || guessRepo();
    connForm.owner.value = c.owner || "";
    connForm.repo.value = c.repo || "";
    connForm.branch.value = c.branch || "main";
    connForm.token.value = A.conn && A.conn.token ? A.conn.token : "";
    $("#disconnect").hidden = !A.conn;
  }
  connForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const c = {
      owner: connForm.owner.value.trim(),
      repo: connForm.repo.value.trim().replace(/\.git$/, ""),
      branch: connForm.branch.value.trim() || "main",
      token: connForm.token.value.trim(),
    };
    if (!c.owner || !c.repo || !c.token) { B.toast("Fill in the owner, repo and token."); return; }
    A.conn = c;
    const btn = connForm.querySelector("[type=submit]");
    btn.disabled = true; btn.textContent = "Testing…";
    try {
      const repo = await gh(repoPath());
      if (repo.permissions && !repo.permissions.push) { const er = new Error(); er.status = 403; throw er; }
      Object.assign(A, await readAll());
      A.live = true;
      storeConn(c);
      renderAll();
      fillConn();
      showTab("goods");
      B.toast("Connected. Changes you save now go live.");
    } catch (err) {
      A.live = false;
      renderBanner(friendly(err));
      B.toast(friendly(err), 6000);
    } finally {
      btn.disabled = false; btn.textContent = "Connect and test";
    }
  });
  $("#disconnect").addEventListener("click", () => {
    if (!confirm("Forget the token on this phone?")) return;
    storeConn(null);
    A.conn = null;
    A.live = false;
    fillConn();
    renderBanner();
    B.toast("This phone is disconnected.");
  });

  /* ================= Dialogs ================= */
  [itemDlg, evDlg].forEach((d) => d.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) d.close(); }));

  /* ================= Start ================= */
  (async function start() {
    try { Object.assign(A, await B.load()); } catch (_) {}
    A.conn = loadConn();
    if (A.conn && A.conn.token) {
      try { Object.assign(A, await readAll()); A.live = true; }
      catch (e) { renderAll(); renderBanner(friendly(e)); fillConn(); return; }
    }
    renderAll();
    fillConn();
    let tab = "goods";
    try { tab = sessionStorage.getItem("booth-admin-tab") || "goods"; } catch (_) {}
    showTab(tab);
  })();

  window.BoothAdmin = A; // handy for debugging
})();
