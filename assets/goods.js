/* Goods grid + item sheet, used on the home page and the goods page. */
(function () {
  const B = window.Booth;

  B.goodCard = function (item) {
    const sold = item.status === "sold";
    const photo = (item.photos || [])[0];
    const price = B.money(item.price);
    return `<button type="button" class="good${sold ? " is-sold" : ""}" data-id="${B.esc(item.id)}" aria-label="${B.esc(item.title)}${price ? ", " + price : ""}${sold ? ", sold" : ""}">
      <span class="good__pic">
        ${photo ? `<img src="${B.esc(B.img(photo))}" alt="" loading="lazy" decoding="async">` : ""}
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
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".good");
      if (!btn) return;
      const item = items.find((i) => i.id === btn.dataset.id);
      if (!item) return;
      const sold = item.status === "sold";
      const photos = item.photos || [];
      const price = B.money(item.price);
      const sms = B.smsAbout(site, sold ? `Hi! Will you have more of the ${item.title}?` : `Hi! Is the ${item.title} still available?`);
      dlg.innerHTML = `
        <button class="sheet__close" type="button" data-close aria-label="Close">×</button>
        ${photos.length ? `<div class="photos">${photos.map((p) => `<img src="${B.esc(B.img(p))}" alt="${B.esc(item.title)}">`).join("")}</div>` : ""}
        ${photos.length > 1 ? `<p class="sheet__count">${photos.length} photos, swipe to see more</p>` : ""}
        <div class="sheet__body">
          <h2>${B.esc(item.title)}</h2>
          <p class="sheet__price">${sold ? "Sold" : price || "Ask at the table"}</p>
          ${item.description ? `<p>${B.esc(item.description)}</p>` : ""}
          ${item.category ? `<p class="good__cat">${B.esc(item.category)}</p>` : ""}
          <div class="row" style="margin-top:8px">
            ${sms ? `<a class="btn btn--go" href="${B.esc(sms)}">${sold ? "Ask about restock" : "Text us about this"}</a>` : ""}
            <a class="btn" href="${B.base}events.html">Where to find us</a>
          </div>
        </div>`;
      dlg.showModal();
      dlg.querySelector(".sheet__close").focus();
    });
  };
})();
