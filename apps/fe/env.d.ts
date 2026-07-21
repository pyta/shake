/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title: string;
    nav?: boolean;
    breadcrumbSelf?: boolean;
    breadcrumbParent?: string;
    breadcrumbDynamic?: boolean;
  }
}
