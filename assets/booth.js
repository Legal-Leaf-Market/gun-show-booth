/* Shared helpers for every page. No build step, no framework. */
(function () {
  const B = {};
  window.Booth = B;

  // Pages one folder down (admin/) set data-base="../" on <html>.
  B.base = document.documentElement.dataset.base || "";

  B.esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- Data ---------------- */
  // One quiet retry: a failed first fetch on a phone at a show is usually the
  // signal, not the site, and a dead page one second before it would have
  // worked is the worse outcome.
  B.load = async function () {
    const get = (f) =>
      fetch(B.base + "data/" + f + "?v=" + Date.now(), { cache: "no-store" }).then((r) => {
        if (!r.ok) throw new Error("Couldn't load " + f);
        return r.json();
      });
    const all = () => Promise.all([get("site.json"), get("items.json"), get("events.json")]);
    let got;
    try { got = await all(); } catch (_) { await new Promise((r) => setTimeout(r, 1500)); got = await all(); }
    const [site, items, events] = got;
    return { site, items, events };
  };

  /* ---------------- Dates ---------------- */
  const pad = (n) => String(n).padStart(2, "0");
  const DAY = 864e5;
  B.DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  B.DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  B.MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  B.MON_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  B.iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  B.parse = (s) => {
    if (!s || typeof s !== "string") return null;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  };
  B.addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  // "Today" is Indiana's today, not the visitor's. Every show is in Indiana,
  // so a phone still set to another time zone must not move a show to
  // tomorrow or keep yesterday's on the front page.
  B.TZ = "America/Indiana/Indianapolis";
  B.today = () => {
    try {
      const p = new Intl.DateTimeFormat("en-CA", { timeZone: B.TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      const d = B.parse(p);
      if (d) return d;
    } catch (_) { /* old browser: fall through to the device clock */ }
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  };
  const daysBetween = (a, b) => Math.round((b - a) / DAY);

  function nthWeekday(y, m, wd, nth) {
    if (nth > 0) {
      const first = new Date(y, m, 1);
      const day = 1 + ((wd - first.getDay() + 7) % 7) + (nth - 1) * 7;
      const d = new Date(y, m, day);
      return d.getMonth() === m ? d : null;
    }
    const last = new Date(y, m + 1, 0);
    return new Date(y, m, last.getDate() - ((last.getDay() - wd + 7) % 7));
  }

  // Every showing of an event that overlaps [from, to]. Each is { ev, start, end }.
  B.occurrences = function (ev, from, to) {
    const out = [];
    const skip = new Set(ev.skip || []);
    const push = (s, e) => {
      if (!s) return;
      if (!e || e < s) e = s;
      if (e >= from && s <= to) out.push({ ev, start: s, end: e, cancelled: skip.has(B.iso(s)) });
    };
    (ev.dates || []).forEach((d) => push(B.parse(d.start || d), B.parse(d.end)));

    const r = ev.repeat;
    if (r && r.every) {
      const len = Math.max(1, +r.days || 1);
      const anchor = B.parse(r.start) || new Date(2000, 0, 1);
      const until = B.parse(r.until);
      const last = until && until < to ? until : to;
      const wd = +r.weekday || 0;
      if (r.every === "week") {
        const step = 7 * Math.max(1, +r.interval || 1);
        let d = B.addDays(anchor, (wd - anchor.getDay() + 7) % 7);
        const target = B.addDays(from, -(len - 1));
        if (d < target) d = B.addDays(d, Math.floor(daysBetween(d, target) / step) * step);
        for (let guard = 0; d <= last && guard < 600; d = B.addDays(d, step), guard++) push(d, B.addDays(d, len - 1));
      } else if (r.every === "month") {
        const nth = +r.nth || 1;
        const startAt = new Date(Math.max(anchor, B.addDays(from, -40)));
        let cur = new Date(startAt.getFullYear(), startAt.getMonth(), 1);
        for (let guard = 0; cur <= last && guard < 240; cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1), guard++) {
          const d = nthWeekday(cur.getFullYear(), cur.getMonth(), wd, nth);
          if (d && d >= anchor && d <= last) push(d, B.addDays(d, len - 1));
        }
      }
    }
    return out.sort((a, b) => a.start - b.start);
  };

  // All upcoming showings across events (includes one happening today).
  B.upcoming = function (events, { from = B.today(), days = 400, includeCancelled = false } = {}) {
    const to = B.addDays(from, days);
    return events
      .flatMap((ev) => B.occurrences(ev, from, to))
      .filter((o) => includeCancelled || !o.cancelled)
      .sort((a, b) => a.start - b.start || a.ev.title.localeCompare(b.ev.title));
  };

  B.range = function (s, e, long) {
    const D = long ? B.DOW_LONG : B.DOW;
    if (!e || +e === +s) return `${D[s.getDay()]}, ${B.MON[s.getMonth()]} ${s.getDate()}`;
    if (s.getMonth() === e.getMonth()) return `${D[s.getDay()]} to ${D[e.getDay()]}, ${B.MON[s.getMonth()]} ${s.getDate()} to ${e.getDate()}`;
    return `${D[s.getDay()]}, ${B.MON[s.getMonth()]} ${s.getDate()} to ${D[e.getDay()]}, ${B.MON[e.getMonth()]} ${e.getDate()}`;
  };

  const ORD = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", "-1": "last" };
  B.repeatText = function (ev) {
    const r = ev.repeat;
    if (!r || !r.every) return ev.kind === "popup" ? "Pop-up" : "";
    const len = Math.max(1, +r.days || 1);
    const wd = +r.weekday || 0;
    const days = len === 1 ? B.DOW_LONG[wd] : `${B.DOW[wd]} to ${B.DOW[(wd + len - 1) % 7]}`;
    if (r.every === "week") return (+r.interval === 2 ? "Every other " : "Every ") + days;
    if (+r.nth === -1) return `Last ${days} of every month`;
    return `Every ${ORD[r.nth] || "1st"} ${days} of the month`;
  };

  // How close a showing is, in words a shopper uses. "" when it is further out.
  B.soon = function (occ, today = B.today()) {
    if (!occ || occ.cancelled) return "";
    if (occ.start <= today && today <= occ.end) return "We're there today";
    const d = daysBetween(today, occ.start);
    if (d === 1) return "Tomorrow";
    const toSunday = (7 - today.getDay()) % 7;
    const weekendDay = [5, 6, 0].includes(occ.start.getDay());
    if (d > 1 && weekendDay && d <= toSunday) return "This weekend";
    if (d > 1 && d <= 6) return `In ${d} days`;
    return "";
  };

  /* ---------------- Admission ---------------- */
  B.money = (v) => {
    if (v === "" || v === null || v === undefined) return "";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return "$" + (n % 1 ? n.toFixed(2) : n);
  };
  B.admission = function (ev, site) {
    const def = site.admission || {};
    const a = ev.admission || { mode: "standard" };
    if (a.mode === "free") return { free: true, headline: "Free entry", who: "", note: a.note || "", where: "" };
    const custom = a.mode === "custom";
    const price = custom && a.price !== "" && a.price != null ? a.price : def.price;
    return {
      free: false,
      price,
      headline: price ? `${B.money(price)} at the door` : "Admission at the door",
      who: custom && a.freeFor ? a.freeFor : def.freeFor || "",
      note: (custom && a.note) || def.note || "",
      where: def.where || "",
    };
  };

  const sentence = (t) => { t = String(t || "").trim(); return t && !/[.!?]$/.test(t) ? t + "." : t; };

  // The "what does it cost to get in" box. Pass an event for its own price, or nothing for the usual.
  B.doorBox = function (site, ev) {
    const adm = B.admission(ev || { admission: { mode: "standard" } }, site);
    if (adm.free) {
      return `<div class="door"><p class="price">Free entry</p><p>No admission charge for this one. Just walk up.</p>${adm.note ? `<p>${B.esc(adm.note)}</p>` : ""}</div>`;
    }
    const lines = [adm.where, adm.who, adm.note].map(sentence).filter(Boolean);
    return `<div class="door">
      <p class="price">${adm.price ? B.esc(B.money(adm.price)) : "Paid"}<small>${adm.price ? "per person at the door" : "at the door"}</small></p>
      ${lines.length ? `<ul>${lines.map((l) => `<li>${B.esc(l)}</li>`).join("")}</ul>` : ""}
    </div>`;
  };

  B.city = (address) => {
    const parts = String(address || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) return parts[parts.length - 2];
    if (parts.length === 2) return parts[0];
    return "";
  };

  B.eventURL = (ev) => B.base + "event.html?e=" + encodeURIComponent(ev.id);

  /* ---------------- Ticket ---------------- */
  B.ticket = function (occ, site, { big = false, link = true, heading = "h3" } = {}) {
    const ev = occ.ev, s = occ.start, e = occ.end;
    const multi = +e !== +s;
    const sameMonth = s.getMonth() === e.getMonth();
    const dow = multi ? `${B.DOW[s.getDay()]}–${B.DOW[e.getDay()]}` : B.DOW[s.getDay()];
    const day = multi ? `${s.getDate()}–${e.getDate()}` : s.getDate();
    const mon = multi && !sameMonth ? `${B.MON[s.getMonth()]}–${B.MON[e.getMonth()]}` : B.MON[s.getMonth()];
    const adm = B.admission(ev, site);
    const city = B.city(ev.address);
    const where = [ev.venue, city && city !== ev.venue ? city : ""].filter(Boolean).join(", ");
    const kind = B.repeatText(ev);
    const soon = B.soon(occ);
    const tag = link ? "a" : "div";
    const href = link ? ` href="${B.esc(B.eventURL(ev))}"` : "";
    return `<div class="ticket-shadow"><${tag} class="ticket${big ? " ticket--big" : ""}"${href}>
      <div class="ticket__stub" aria-hidden="true"><span class="dow">${dow}</span><span class="day${multi ? " span" : ""}">${day}</span><span class="mon">${mon}</span></div>
      <div class="ticket__body">
        ${soon || kind ? `<span class="tags">${soon ? `<span class="kind kind--soon">${B.esc(soon)}</span>` : ""}${kind ? `<span class="kind">${B.esc(kind)}</span>` : ""}</span>` : ""}
        <span class="sr-only">${B.esc(B.range(s, e, true))}.</span>
        <${heading} class="ticket__title">${B.esc(ev.title)}</${heading}>
        ${where ? `<p class="ticket__where">${B.esc(where)}</p>` : ""}
        ${big && ev.hours ? `<p class="ticket__when">${B.esc(ev.hours)}</p>` : ""}
        <p class="ticket__adm"><b>${B.esc(adm.headline)}</b>${adm.who ? `<span class="ticket__free">${B.esc(adm.who)}</span>` : ""}</p>
      </div>
    </${tag}></div>`;
  };

  /* ---------------- Structured data ---------------- */
  // Markup is a claim, so every field here is one the page already shows.
  // Never for sample data (a made-up show marked up as real is a fabricated
  // record), never a rating or review (there are none), and never an
  // organizer: the show runs the show, we only have a table at it.
  B.eventLD = function (ev, occs, site) {
    if (!ev || ev.sample) return null;
    const adm = B.admission(ev, site);
    const page = location.origin + location.pathname.replace(/[^/]*$/, "") + "event.html?e=" + encodeURIComponent(ev.id);
    const place = { "@type": "Place", name: ev.venue || ev.title };
    if (ev.address) place.address = ev.address;
    if (Number.isFinite(+ev.lat) && ev.lat !== "" && ev.lat != null) place.geo = { "@type": "GeoCoordinates", latitude: +ev.lat, longitude: +ev.lng };
    const list = occs.slice(0, 12).map((o) => {
      const e = {
        "@type": "Event",
        name: ev.title,
        startDate: B.iso(o.start),
        endDate: B.iso(o.end),
        eventStatus: o.cancelled ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: place,
        url: page,
        description: [ev.hours, adm.headline + (adm.who ? ". " + adm.who : "")].filter(Boolean).join(". "),
      };
      if (adm.free) e.isAccessibleForFree = true;
      else if (adm.price) {
        // Admission is sold by the show at its door, so the offer never
        // points at our page as if we sold it: the show's own site, or no url.
        e.offers = { "@type": "Offer", price: String(adm.price), priceCurrency: "USD", availability: "https://schema.org/InStock" };
        if (/^https?:\/\//.test(ev.link || "")) e.offers.url = ev.link;
      }
      return e;
    });
    return list.length ? list : null;
  };

  B.orgLD = function (site) {
    if (!site || !site.name) return null;
    const o = { "@type": "Organization", name: site.name, url: location.origin + location.pathname.replace(/[^/]*$/, "") };
    if (site.tagline) o.description = site.tagline;
    const same = [site.facebook, site.instagram, site.tiktok].filter((u) => /^https?:/.test(u || ""));
    if (same.length) o.sameAs = same;
    const tel = B.phone(site);
    if (tel) o.telephone = tel;
    return o;
  };

  // The phone and email as published, or "" while they are still the
  // placeholders from setup: a 555-01xx number is fictional and an example.*
  // address bounces. Every contact link, the sign and the markup go through
  // these, so a placeholder can never be dialled, texted or printed.
  B.phone = function (site) {
    const tel = String((site && site.phone) || "").trim();
    return tel && !/555[^\d]*01\d\d/.test(tel) ? tel : "";
  };
  B.email = function (site) {
    const em = String((site && site.email) || "").trim();
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em) && !/@(.+\.)?example\.(com|org|net)$/i.test(em) ? em : "";
  };

  B.ld = function (data) {
    if (!data) return;
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(Array.isArray(data) ? { "@context": "https://schema.org", "@graph": data } : { "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");
    document.head.appendChild(s);
  };

  /* ---------------- Page chrome ---------------- */
  B.chrome = function (site, active) {
    const top = document.getElementById("top");
    if (top) {
      const nav = [
        ["goods", "goods.html", "Goods"],
        ["events", "events.html", "Events"],
        ["contact", "index.html#contact", "Contact"],
      ];
      top.className = "top";
      top.innerHTML = `<div class="wrap"><a class="mark" href="${B.base}index.html">${B.esc(site.name)}</a>
        <nav class="nav" aria-label="Main">${nav
          .map(([k, h, t]) => `<a href="${B.base}${h}"${k === active ? ' aria-current="page"' : ""}>${t}</a>`)
          .join("")}</nav></div>`;
    }
    const foot = document.getElementById("foot");
    if (foot) {
      foot.className = "foot";
      foot.innerHTML = `<div class="wrap">
        <strong>${B.esc(site.name)}</strong>
        ${site.dealerNote ? `<p>${B.esc(site.dealerNote)}</p>` : ""}
        <p class="small">© ${new Date().getFullYear()} ${B.esc(site.name)}</p>
        <p class="small"><a href="${B.base}admin/">Manage site</a></p>
      </div>`;
    }
  };

  B.contactButtons = function (site) {
    const tel = B.phone(site).replace(/[^\d+]/g, "");
    const email = B.email(site);
    const out = [];
    if (tel) out.push(`<a class="btn btn--go" href="tel:${tel}">Call</a>`, `<a class="btn btn--go" href="sms:${tel}">Text</a>`);
    if (email) out.push(`<a class="btn" href="mailto:${B.esc(email)}">Email</a>`);
    if (site.facebook) out.push(`<a class="btn" href="${B.esc(site.facebook)}" rel="noopener">Facebook</a>`);
    if (site.instagram) out.push(`<a class="btn" href="${B.esc(site.instagram)}" rel="noopener">Instagram</a>`);
    if (site.tiktok) out.push(`<a class="btn" href="${B.esc(site.tiktok)}" rel="noopener">TikTok</a>`);
    return out.join("");
  };

  B.smsAbout = function (site, text) {
    const tel = B.phone(site).replace(/[^\d+]/g, "");
    return tel ? `sms:${tel}?&body=${encodeURIComponent(text)}` : "";
  };

  // Honest empty state with a drawing: "nothing here" should look deliberate,
  // not broken. The SVGs are outlined, so they render the same inside an <img>,
  // which cannot load web fonts.
  B.emptyArt = (kind, msg, style = "") =>
    `<div class="empty empty--art"${style ? ` style="${style}"` : ""}><img src="${B.base}assets/img/empty-${kind}.svg" alt="" width="320" height="200"><p>${B.esc(msg)}</p></div>`;

  /* ---------------- Home-based vendor label ---------------- */
  // IC 16-42-5.3-5: every home-baked product carries this statement in at
  // least 10 pt type, and the vendor must post each product's label on its
  // website. Wording from the 2023-2024 code text ("Indiana Department of
  // Health"); confirm against the current code before relying on it, since
  // a 2026 bill touched this chapter. One constant, so the site, the admin
  // and the printed label cannot drift apart.
  B.HBV_STATEMENT = "This product is home produced and processed and the production area has not been inspected by the Indiana Department of Health. NOT FOR RESALE.";

  // What the label is missing, in plain words. Empty means complete.
  B.labelGaps = function (item, site) {
    if (!item || !item.homeBaked) return [];
    const p = (site && site.producer) || {};
    const gaps = [];
    if (!String(item.ingredients || "").trim()) gaps.push("ingredients");
    if (!String(item.netWt || "").trim()) gaps.push("net weight or count");
    if (!String(p.name || "").trim() || !String(p.address || "").trim()) gaps.push("producer name and address (Business tab)");
    return gaps;
  };

  // The label as the law lists it. A missing field says so rather than
  // being left out, because a label that silently drops a line looks
  // complete and is not.
  B.labelBox = function (item, site) {
    if (!item || !item.homeBaked) return "";
    const p = (site && site.producer) || {};
    const ask = '<span class="label__gap">Ask at the table</span>';
    const row = (k, v) => `<div><dt>${k}</dt><dd>${v ? B.esc(v) : ask}</dd></div>`;
    return `<section class="label" aria-label="Product label">
      <h3>Label</h3>
      <dl>
        ${row("Product", item.title)}
        ${row("Ingredients", item.ingredients)}
        ${row("Net weight", item.netWt)}
        ${row("Made by", [p.name, p.address].filter(Boolean).join(", "))}
        <div><dt>Date made</dt><dd>Printed on each package</dd></div>
      </dl>
      <p class="label__statement">${B.esc(B.HBV_STATEMENT)}</p>
    </section>`;
  };

  B.img = (path) => (/^(https?:|data:|blob:)/.test(path) ? path : B.base + path);

  B.toast = function (msg, ms = 3200) {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(B._tt);
    B._tt = setTimeout(() => (t.hidden = true), ms);
  };

  /* ---------------- Map ---------------- */
  B.map = function (el, points, { zoom = 13 } = {}) {
    if (!window.L || !el) return null;
    const pts = points.filter((p) => Number.isFinite(+p.lat) && Number.isFinite(+p.lng) && p.lat !== "" && p.lng !== "");
    if (!pts.length) return null;
    const map = L.map(el, { scrollWheelZoom: false, tap: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const icon = L.divIcon({
      className: "",
      html: '<svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39C15 39 2 23 2 14a13 13 0 0 1 26 0c0 9-13 25-13 25z" fill="#E8501A" stroke="#1F241E" stroke-width="2"/><circle cx="15" cy="14" r="5" fill="#1F241E"/></svg>',
      iconSize: [30, 40],
      iconAnchor: [15, 39],
      popupAnchor: [0, -34],
    });
    const markers = pts.map((p) => {
      const m = L.marker([+p.lat, +p.lng], { icon }).addTo(map);
      if (p.popup) m.bindPopup(p.popup);
      return m;
    });
    if (pts.length === 1) map.setView([+pts[0].lat, +pts[0].lng], zoom);
    else map.fitBounds(L.featureGroup(markers).getBounds().pad(0.25));
    return map;
  };

  B.directions = (ev) => {
    const q = [ev.venue, ev.address].filter(Boolean).join(", ");
    const dest = Number.isFinite(+ev.lat) && ev.lat !== "" && ev.lat != null ? `${ev.lat},${ev.lng}` : q;
    return {
      google: "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(dest),
      apple: "https://maps.apple.com/?daddr=" + encodeURIComponent(dest) + "&q=" + encodeURIComponent(ev.venue || q),
    };
  };

  /* ---------------- Calendar file ---------------- */
  B.ics = function (ev, occs, site) {
    const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
    const d = (x) => B.iso(x).replace(/-/g, "");
    const adm = B.admission(ev, site);
    const desc = [ev.hours, adm.headline + (adm.who ? ". " + adm.who : ""), ev.booth, ev.notes, location.origin + location.pathname.replace(/[^/]*$/, "") + "event.html?e=" + ev.id]
      .filter(Boolean)
      .join("\n");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//" + esc(site.name) + "//Events//EN", "CALSCALE:GREGORIAN"];
    occs.forEach((o) => {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${ev.id}-${d(o.start)}@booth`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${d(o.start)}`,
        `DTEND;VALUE=DATE:${d(B.addDays(o.end, 1))}`,
        `SUMMARY:${esc(ev.title + " (" + site.name + ")")}`,
        `LOCATION:${esc([ev.venue, ev.address].filter(Boolean).join(", "))}`,
        `DESCRIPTION:${esc(desc)}`,
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  };
})();
