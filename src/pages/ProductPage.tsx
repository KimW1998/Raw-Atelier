import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { FadeIn } from "@/components/animations/FadeIn";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductOptionsForm } from "@/components/shop/ProductOptions";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "@/i18n/context";
import { useCart } from "@/lib/cart";
import {
  SHOP_TAB_PARAM,
  countBillableLetters,
  formatEuro,
  formatListedPrice,
  getLettersOption,
  getProductBadge,
  getProductDescription,
  getProductHref,
  getProductImages,
  getProductName,
  getProductUnitPriceCents,
  getRelatedProducts,
  productHasOptions,
  useShopProduct,
  validateSelections,
  type ProductSelections,
} from "@/lib/shop";
import NotFoundPage from "@/pages/NotFoundPage";

function selectionErrorMessage(
  t: ReturnType<typeof useTranslations>,
  reason: string,
  minLetters = 3,
): string {
  if (reason === "maxLetters") return t("options.errorMaxLetters");
  if (reason === "minLetters") {
    return t("options.errorMinLetters", { min: String(minLetters) });
  }
  if (reason === "invalid") return t("options.errorInvalid");
  return t("options.errorRequired");
}

export default function ProductPage() {
  const { productId = "" } = useParams();
  const product = useShopProduct(productId);
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");
  const t = useTranslations("shop");
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<ProductSelections>({});
  const [formError, setFormError] = useState("");

  const unitCents = useMemo(
    () => (product ? getProductUnitPriceCents(product, selections) : 0),
    [product, selections],
  );
  const letters = product ? getLettersOption(product) : undefined;
  const letterCount = letters
    ? countBillableLetters(selections[letters.id] ?? "", letters)
    : 0;
  const lettersTooShort = Boolean(
    letters && letterCount < (letters.minLetters ?? 1),
  );

  if (!product) {
    return <NotFoundPage />;
  }

  const name = getProductName(product, locale);
  const description = getProductDescription(product, locale);
  const badge = getProductBadge(product);
  const related = getRelatedProducts(product);
  const shopTabHref = `/shop?${SHOP_TAB_PARAM}=${product.section}`;
  const livePrice = letters
    ? formatEuro(unitCents, locale)
    : formatListedPrice(product, locale);

  const addToCart = () => {
    const error = validateSelections(product, selections);
    if (error) {
      setFormError(
        selectionErrorMessage(t, error.reason, getLettersOption(product)?.minLetters ?? 3),
      );
      return;
    }
    setFormError("");
    addItem(product.id, quantity, selections);
  };

  return (
    <>
      <SEO
        title={name}
        description={description}
        locale={locale}
        path={getProductHref(product.id)}
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
        image={product.image}
      />

      <section className="relative overflow-hidden pt-28 md:pt-32">
        <Container>
          <FadeIn>
            <Link
              href={shopTabHref}
              className="font-body text-sm font-semibold text-brand-rose hover:text-brand-black"
            >
              ← {t("product.backToShop")}
            </Link>
          </FadeIn>

          <div className="mt-8 grid items-start gap-10 md:grid-cols-2 lg:gap-16">
            <FadeIn>
              <ProductGallery key={product.id} images={getProductImages(product)} alt={name} />
            </FadeIn>

            <FadeIn delay={0.1} className="order-first md:order-last">
              <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
                {t(`badges.${badge}`)}
              </p>
              <h1 className="mt-3 font-heading text-4xl leading-tight text-brand-black md:text-5xl">
                {name}
              </h1>
              <p className="mt-4 font-heading text-2xl text-brand-pink-accent">
                {livePrice}
              </p>
              <p className="mt-6 font-body text-base leading-relaxed text-brand-black/70 md:text-lg">
                {description}
              </p>
              <p className="mt-4 font-body text-sm leading-relaxed text-brand-black/60">
                {product.type === "digital"
                  ? t("product.shippingDigital")
                  : t("product.shippingPhysical")}
              </p>
              {product.personalization && !productHasOptions(product) && (
                <p className="mt-2 font-body text-sm leading-relaxed text-brand-black/60">
                  {t("product.personalization")}
                </p>
              )}

              <ProductOptionsForm
                product={product}
                selections={selections}
                onChange={(next) => {
                  setSelections(next);
                  setFormError("");
                }}
              />

              {formError && (
                <p className="mt-4 font-body text-sm text-red-700">{formError}</p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-full bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-brand-pink-light"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    aria-label={t("cart.decrease")}
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center font-body text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-brand-pink-light"
                    onClick={() => setQuantity((value) => value + 1)}
                    aria-label={t("cart.increase")}
                  >
                    +
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="large"
                  disabled={lettersTooShort}
                  onClick={addToCart}
                >
                  {t("cart.add")}
                </Button>
                <Button href="/shop/cart" variant="outline" size="large">
                  {t("cart.viewFull")}
                </Button>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <Section spacing="compact">
          <Container>
            <h2 className="font-heading text-2xl text-brand-black md:text-3xl">
              {t("product.related")}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={getProductHref(item.id)}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <PremiumImage
                      src={item.image}
                      alt={getProductName(item, locale)}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-lg text-brand-black group-hover:text-brand-pink-accent">
                      {getProductName(item, locale)}
                    </h3>
                    <p className="mt-1 font-body text-sm font-semibold text-brand-pink-accent">
                      {formatListedPrice(item, locale)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <ContactCTASection />
    </>
  );
}
