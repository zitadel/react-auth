/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZITADEL_DOMAIN: string;
  readonly VITE_ZITADEL_CLIENT_ID: string;
  readonly VITE_ZITADEL_REDIRECT_URI: string;
  readonly VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI: string;
  readonly VITE_ZITADEL_SCOPE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
