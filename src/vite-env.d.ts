/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_BEHOLD_FEED_ID?: string;
  readonly VITE_SHOP_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
