/* Goods grid + item sheet, used on the home page and the goods page. */
(function () {
  const B = window.Booth;

  B.goodCard = function (item) {
    const sold = item.status === "sold";
    const photo = (item.photos || [])[0];
    const price = B.money(item.price);
    return `<button type="button" class="good${sold ? " is-sold" : ""}" data-id="${B.esc(item.id)}" aria-label="${B.esc(item.title)}${price ? ", " + price : ""}${sold ? ", sold" : ""}">
      <span class="good__pic">
        ${photo ? `<img src="${B.esc(B.img(photo))}" alt="" loading="lazy" decoding="async">` : `<span class="good__nophoto">Photo coming soon</span>`}
        ${item.sample ? `<span class="sample-flag">Sample</span>` : ""}
        ${sold ? `<span class="sold-stamp">Sold</span>` : ""}
        <span class="tag">${price ? B.esc(price) : "Ask"}</span>
      </span>
      <span class="good__name">${B.esc(item.title)}</span>
      ${item.category ? `<span class="good__cat">${B.esc(item.category)}</span>` : ""}
    </button>`;
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
    return `<form class="order" hidden novalidate>
      <h3>Start your order</h3>
      <p class="order__note">This writes a text for you to send us. We'll text back to confirm the price and the date.</p>
      <label>Size <select name="size" required><option value="">Pick one</option>${opts(o.sizes)}</select></label>
      <label>Date you need it <input type="date" name="date" required min="${B.iso(B.addDays(B.today(), 2))}"></label>
      ${o.flavors ? `<label>Cake flavor <select name="flavor">${opts(o.flavors)}</select></label>` : ""}
      ${o.icings ? `<label>Icing <select name="icing">${opts(o.icings)}</select></label>` : ""}
      <label>Design, colors or writing <textarea name="design" rows="2" maxlength="300" placeholder="Blue and gold, Happy 40th Mike"></textarea></label>
      <fieldset class="order__get"><legend>Pickup or delivery</legend>
        <label><input type="radio" name="get" value="Curbside pickup in Columbus" checked> Pickup in Columbus</label>
        <label><input type="radio" name="get" value="Delivery"> Delivery</label>
      </fieldset>
      <label>Town for delivery <input name="town" maxlength="60" placeholder="Seymour"></label>
      <label>Your name <input name="name" maxlength="60" autocomplete="name"></label>
      <button class="btn btn--go" type="submit">Write the text</button>
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

  B.bindGoods = function (container, items, site) {
    let dlg = document.getElementById("item-sheet");
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.id = "item-sheet";
      dlg.className = "sheet";
      document.body.appendChild(dlg);
      dlg.addEventListener("click", (e) => {
        if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
      });
    }
    // One sheet for every item, opened by tapping a card or by a shared link
    // (goods.html?item=<id>, and &order=1 to land on the order form).
    function openItem(item, { order = false } = {}) {
      const sold = item.status === "sold";
      const photos = item.photos || [];
      const price = B.money(item.price);
      const sms = B.smsAbout(site, sold ? `Hi! Will you have more of the ${item.title}?` : `Hi! Is the ${item.title} still available?`);
      const canOrder = !!(item.order && !sold && B.phone(site));
      dlg.innerHTML = `
        <button class="sheet__close" type="button" data-close aria-label="Close">×</button>
        ${photos.length ? `<div class="photos">${photos.map((p) => `<img src="${B.esc(B.img(p))}" alt="${B.esc(item.title)}">`).join("")}</div>` : ""}
        ${photos.length > 1 ? `<p class="sheet__count">${photos.length} photos, swipe to see more</p>` : ""}
        <div class="sheet__body">
          <h2>${B.esc(item.title)}</h2>
          <p class="sheet__price">${sold ? "Sold" : price || "Ask at the table"}</p>
          ${item.description ? `<p>${B.esc(item.description)}</p>` : ""}
          ${item.category ? `<p class="good__cat">${B.esc(item.category)}</p>` : ""}
          ${B.labelBox(item, site)}
          <div class="row" style="margin-top:8px">
            ${canOrder ? `<button class="btn btn--go" type="button" data-start-order>Start an order</button>` : ""}
            ${sms ? `<a class="btn${canOrder ? "" : " btn--go"}" href="${B.esc(sms)}">${sold ? "Ask about restock" : "Text us about this"}</a>` : ""}
            <a class="btn" href="${B.base}events.html">Where to find us</a>
          </div>
          ${canOrder ? B.orderForm(item) : ""}
        </div>`;
      dlg.showModal();
      const form = dlg.querySelector(".order");
      if (form) {
        dlg.querySelector("[data-start-order]").addEventListener("click", () => {
          form.hidden = false;
          form.scrollIntoView({ behavior: "smooth", block: "start" });
          form.querySelector("select,input").focus({ preventScroll: true });
        });
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const v = Object.fromEntries(new FormData(form));
          if (!v.size || !v.date) { B.toast("Pick a size and the date you need it."); return; }
          // Opens the customer's own texting app with the order written out.
          // Nothing is sent or stored by this site.
          location.href = B.smsAbout(site, B.orderText(item, v));
        });
        if (order) { form.hidden = false; setTimeout(() => form.scrollIntoView({ block: "start" }), 50); }
      }
      if (!order) dlg.querySelector(".sheet__close").focus();
    }

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".good");
      if (!btn) return;
      const item = items.find((i) => i.id === btn.dataset.id);
      if (item) openItem(item);
    });

    const q = new URLSearchParams(location.search);
    const linked = q.get("item") && items.find((i) => i.id === q.get("item") && i.status !== "hidden");
    if (linked && !B._openedFromLink) { B._openedFromLink = true; openItem(linked, { order: q.get("order") === "1" }); }
  };
})();
