(function () {
  if (!window.CMS) return;

  var h = window.h;
  var createClass = window.createClass;

  function asList(value) {
    if (!value) return [];
    if (typeof value.toJS === "function") return value.toJS();
    if (Array.isArray(value)) return value;
    return [];
  }

  function asText(value) {
    if (value == null) return "";
    return String(value);
  }

  function assetUrl(getAsset, path) {
    if (!path) return "";
    try {
      var asset = getAsset(path);
      return asset && asset.toString ? asset.toString() : String(path);
    } catch (error) {
      return String(path);
    }
  }

  function chrome(title, children) {
    return h("div", { className: "ra-preview" },
      h("header", { className: "ra-preview-bar" },
        h("img", { src: "/images/brand/raw-atelier-logo.png", alt: "Raw Atelier" }),
        h("span", {}, title)
      ),
      h("div", { className: "ra-preview-body" }, children)
    );
  }

  var categoryLabels = {
    events: "Events",
    corporate: "Zakelijk",
    gifts: "Cadeaus",
    fashion: "Mode",
    digitizing: "Digitizen",
  };

  var sectionLabels = {
    babyGifts: "Baby cadeaus",
    keychains: "Keychains",
    patches: "Patches",
    pouches: "Tassen",
    patterns: "Patronen",
  };

  var PortfolioPreview = createClass({
    render: function () {
      var getAsset = this.props.getAsset;
      var items = asList(this.props.entry.getIn(["data", "items"]));

      if (!items.length) {
        return chrome("Portfolio", h("p", { className: "ra-empty" }, "Nog geen portfolio-items."));
      }

      return chrome(
        "Portfolio",
        h("div", { className: "ra-grid" },
          items.map(function (item, index) {
            return h("article", { className: "ra-card", key: item.id || index },
              h("img", { src: assetUrl(getAsset, item.image), alt: "" }),
              h("div", { className: "ra-card-body" },
                h("span", { className: "ra-chip" }, categoryLabels[item.category] || item.category || ""),
                h("h3", {}, (item.title && item.title.nl) || item.id || "Zonder titel"),
                item.featured ? h("p", { className: "ra-price" }, "Op de homepage") : null
              )
            );
          })
        )
      );
    },
  });

  var ShopPreview = createClass({
    render: function () {
      var getAsset = this.props.getAsset;
      var products = asList(this.props.entry.getIn(["data", "products"]));

      if (!products.length) {
        return chrome("Shop", h("p", { className: "ra-empty" }, "Nog geen producten."));
      }

      return chrome(
        "Shop",
        h("div", { className: "ra-grid" },
          products.map(function (product, index) {
            return h("article", { className: "ra-card", key: product.id || index },
              h("img", { src: assetUrl(getAsset, product.image), alt: "" }),
              h("div", { className: "ra-card-body" },
                h("span", { className: "ra-chip" }, sectionLabels[product.section] || product.section || product.type || ""),
                h("h3", {}, (product.name && product.name.nl) || product.id || "Product"),
                h("p", { className: "ra-price" }, product.priceLabel || ""),
                h("p", {}, (product.description && product.description.nl) || "")
              )
            );
          })
        )
      );
    },
  });

  function prettyKey(key) {
    return String(key)
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .replace(/^\w/, function (letter) {
        return letter.toUpperCase();
      });
  }

  function renderNode(value, key) {
    if (value == null || value === "") return null;

    if (typeof value === "string") {
      return h("p", { className: "ra-kv", key: key },
        h("strong", {}, prettyKey(key) + ": "),
        value
      );
    }

    if (typeof value === "boolean" || typeof value === "number") {
      return h("p", { className: "ra-kv", key: key }, prettyKey(key) + ": " + String(value));
    }

    if (Array.isArray(value)) {
      return h("div", { className: "ra-section", key: key },
        h("h2", {}, prettyKey(key)),
        value.map(function (item, index) {
          return renderNode(item, key + "-" + index);
        })
      );
    }

    if (typeof value === "object") {
      return h("section", { className: "ra-section", key: key },
        key ? h("h2", {}, prettyKey(key)) : null,
        Object.keys(value).map(function (childKey) {
          return renderNode(value[childKey], childKey);
        })
      );
    }

    return null;
  }

  var SitePreview = createClass({
    render: function () {
      var data = this.props.entry.getIn(["data"]);
      var json = data && typeof data.toJS === "function" ? data.toJS() : {};
      var label = this.props.collection
        ? asText(this.props.collection.get("label"))
        : "Teksten";

      return chrome(label || "Teksten", renderNode(json, ""));
    },
  });

  CMS.registerPreviewStyle("/admin/preview.css");
  CMS.registerPreviewTemplate("portfolio-items", PortfolioPreview);
  CMS.registerPreviewTemplate("shop-catalog", ShopPreview);

  [
    "global",
    "home",
    "about",
    "services",
    "portfolio",
    "legal",
    "contact",
    "shared",
    "shop",
  ].forEach(function (page) {
    CMS.registerPreviewTemplate("nl-" + page, SitePreview);
    CMS.registerPreviewTemplate("en-" + page, SitePreview);
  });
})();
