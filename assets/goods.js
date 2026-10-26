/* Goods grid + item sheet, used on the home page and the goods page. */
(function () {
  const B = window.Booth;

  B.goodCard = function (item) {
    const sold = item.status === "sold";
    const photo = (item.photos || [])[0];
    const price = B.money(item.price);
    return `<a href="${B.esc(B.itemURL(item))}" class="good${sold ? " is-sold" : ""}" data-id="${B.esc(item.id)}" aria-label="${B.esc(item.title)}${price ? ", " + price : ""}${sold ? ", sold" : ""}">
      <span class="good__pic">
        ${photo ? `<img src="${B.esc(B.img(photo))}" alt="" loading="lazy" decoding="async">` : `<span class="good__nophoto">Photo coming soon</span>`}
        ${item.sample ? `<span class="sample-flag">Sample</span>` : ""}
        ${sold ? `<span class="sold-stamp">Sold</span>` : ""}
        <span class="tag">${price ? B.esc(price) : "Ask"}</span>
      </span>
      <span class="good__name">${B.esc(item.title)}</span>
      ${item.category ? `<span class="good__cat">${B.esc(item.category)}</span>` : ""}
    </a>`;
  };

  // Shown to customers: everything except hidden. Available first, newest first.
  B.visibleGoods = (items) =>
    items
      .filter((i) => i.status !== "hidden")
      .sort((a, b) => (a.status === "sold") - (b.status === "sold") || String(b.added || "").localeCompare(String(a.added || "")));

  // The order form for a made-to-order item. Its options come from the item's
  // own "order" block, which holds only what CJ's price list says.
  B.orderForm = function (item) {
    const o = item.order || {};
    const opts = (list) => (list || []).map((x) => `<option>${B.esc(x)}</option>`).join("");
    return `<form class="order" hidden>
      <h3>Start your order</h3>
      <p class="order__note">Prepare a request, then send it by text or copy it into a Facebook message. Your order is confirmed only when we reply with price, date and fulfillment details.</p>
      <label>Size <select name="size" required><option value="">Pick one</option>${opts(o.sizes)}</select></label>
      <label>Date you need it <input type="date" name="date" required min="${B.iso(B.today())}"></label>
      ${o.flavors ? `<label>Cake flavor <select name="flavor">${opts(o.flavors)}</select></label>` : ""}
      ${o.icings ? `<label>Icing <select name="icing">${opts(o.icings)}</select></label>` : ""}
      <label>Design, colors or writing <textarea name="design" rows="2" maxlength="300" placeholder="Blue and gold, Happy 40th Mike"></textarea></label>
      <fieldset class="order__get"><legend>Pickup or delivery</legend>
        <label><input type="radio" name="get" value="Curbside pickup in Columbus" checked> Pickup in Columbus</label>
        <label><input type="radio" name="get" value="Delivery"> Delivery</label>
      </fieldset>
      <label>Town for delivery <input name="town" maxlength="60" placeholder="Seymour"></label>
      <label>Your name <input name="name" maxlength="60" autocomplete="name"></label>
      <button class="btn btn--go" type="submit">Prepare request</button>
    </form>`;
  };

  // The message the form writes. Pure, so the tests can read it.
  B.orderText = function (item, v) {
    const o = item.order || {};
    const d = B.parse(v.date);
    const lines = [`Hi! I'd like to order ${o.what || item.title}.`];
    if (v.size) lines.push(`Size: ${v.size}`);
    if (d) lines.push(`Date needed: ${B.DOW_LONG[d.getDay()]}, ${B.MON_LONG[d.getMonth()]} ${d.getDate()}`);
    const cake = [v.flavor, v.icing && `${v.icing.toLowerCase()} icing`].filter(Boolean).join(", ");
    if (cake) lines.push(`Flavor: ${cake}`);
    if (String(v.design || "").trim()) lines.push(`Design: ${String(v.design).trim()}`);
    if (v.get) lines.push(v.get === "Delivery" ? `Delivery${String(v.town || "").trim() ? " to " + String(v.town).trim() : " (town to follow)"}` : v.get);
    if (String(v.name || "").trim()) lines.push(`Name: ${String(v.name).trim()}`);
    return lines.join("\n");
  };

  B.itemURL = (item, show = "") => `${B.base}product.html?item=${encodeURIComponent(item.id)}${show ? "&show=" + encodeURIComponent(show) : ""}`;

  // Real anchors support sharing, new tabs, keyboard navigation and crawlers.
  B.bindGoods = function (container, items, site, events = []) {
    const q = new URLSearchParams(location.search);
    const show = events.find((e) => e.id === q.get("show"));
    if (show) container.querySelectorAll(".good").forEach((a) => {
      const item = items.find((i) => i.id === a.dataset.id);
      if (item) a.href = B.itemURL(item, show.id);
    });
    const linked = items.find((i) => i.id === q.get("item") && i.status !== "hidden");
    if (linked) location.replace(B.itemURL(linked, show?.id) + (q.get("order") === "1" ? "&order=1" : ""));
  };

  B.pickups = function (events) {
    const today = B.today();
    return B.upcoming(events).filter((o) => !o.ev.sample).flatMap((o) => {
      const days = [];
      for (let day = o.start; day <= o.end; day = B.addDays(day, 1)) {
        if (day >= today) days.push({ event: o.ev, date: B.iso(day), label: B.range(day, null, true) });
      }
      return days;
    });
  };

  B.reservationText = function (item, v, ev) {
    const day = B.parse(v.date);
    return [`Hi! I'd like to request a hold.`, `Item: ${item.title}`, `Quantity: ${v.quantity}`, `Show: ${ev.title}`, `Pickup day: ${day ? B.range(day, null, true) : v.date}`, `Name: ${String(v.name).trim()}`, `Please confirm availability and pickup details.`].join("\n");
  };

  B.product = function (item, site, events) {
    const q = new URLSearchParams(location.search);
    const pickup = B.pickups(events);
    const sold = item.status === "sold";
    const options = pickup.map((p,i) => `<option value="${i}"${p.event.id === q.get("show") ? " data-preferred" : ""}>${B.esc(p.event.title)}: ${B.esc(p.label)}</option>`).join("");
    return `<div class="product-layout"><div><div class="product-photos">${(item.photos || []).map((p) => `<img src="${B.esc(B.img(p))}" alt="${B.esc(item.title)}" loading="lazy">`).join("")}</div><p class="small">Photos show our products. Show selection varies.</p></div>
      <div><h1>${B.esc(item.title)}</h1><p class="sheet__price">${sold ? "Sold" : B.esc(B.money(item.price) || "Ask for price")}</p><p>${B.esc(item.description || "")}</p>
      ${B.labelBox(item,site)}
      ${!sold && item.order ? B.orderForm(item) : !sold && pickup.length ? `<form class="order reservation"><h2>Reserve for a show</h2><p>Request a hold; availability and pickup are confirmed when we reply.</p><label>Show and pickup day<select name="pickup" required><option value="">Choose a show and day</option>${options}</select></label><label>Quantity<input type="number" name="quantity" min="1" max="99" step="1" value="1" required></label><label>Your name<input name="name" maxlength="60" autocomplete="name" required></label><button class="btn btn--go">Prepare hold request</button></form>` : `<p>${sold ? "This item is sold. Ask us about restocking." : "No upcoming show pickup dates are listed. Contact us to ask about availability."}</p>`}
      <div class="request-result" hidden><label for="request-text">Your request</label><textarea id="request-text" rows="10" readonly></textarea><div class="row"><button class="btn" type="button" data-copy>Copy request</button>${B.phone(site) ? '<a class="btn btn--go" data-sms>Open text message</a>' : ""}${site.facebook ? `<a class="btn" href="${B.esc(site.facebook)}" rel="noopener" target="_blank">Message CJ's Cakes on Facebook</a>` : ""}</div><p role="status" data-status>Request prepared, not sent. Send it by text or paste it into a Facebook message. Your hold or order is confirmed only when we reply.</p></div>
      <div class="row hero-actions">${B.contactButtons(site)}<a class="btn" href="events.html">Find our next show</a></div></div></div>`;
  };

  B.bindProduct = function (root, item, site, events) {
    const form = root.querySelector("form");
    if (form) {
      form.hidden = false;
      const preferred = form.querySelector("[data-preferred]");
      if (preferred) preferred.selected = true;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const v = Object.fromEntries(new FormData(form));
        let text;
        if (item.order) {
          if (!item.order.sizes.includes(v.size) || v.date < B.iso(B.today())) return;
          text = B.orderText(item,v);
        } else {
          const pickup = B.pickups(events)[Number(v.pickup)];
          if (!pickup || !Number.isInteger(+v.quantity) || +v.quantity < 1 || +v.quantity > 99) return;
          text = B.reservationText(item,{...v,date:pickup.date},pickup.event);
        }
        const result = root.querySelector(".request-result");
        result.hidden = false;
        result.querySelector("textarea").value = text;
        const sms = result.querySelector("[data-sms]");
        if (sms) sms.href = B.smsAbout(site,text);
        result.scrollIntoView({block:"nearest",behavior:"smooth"});
      });
      root.querySelector("[data-copy]").addEventListener("click", async () => {
        const field = root.querySelector("#request-text");
        const status = root.querySelector("[data-status]");
        try { await navigator.clipboard.writeText(field.value); status.textContent = "Request copied. Paste it into a message and send it. We confirm when we reply."; }
        catch (_) { field.focus(); field.select(); status.textContent = "Select and copy the request above, then paste it into a message."; }
      });
    }
  };
})();
