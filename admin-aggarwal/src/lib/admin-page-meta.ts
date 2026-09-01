export interface AdminPageMeta {
  title: string;
  backHref?: string;
}

const STATIC_ROUTES: Record<string, AdminPageMeta> = {
  "/banners": { title: "Banners" },
  "/banners/new": { title: "Add Banner", backHref: "/banners" },
  "/videos": { title: "Videos" },
  "/videos/new": { title: "Add Video", backHref: "/videos" },
  "/categories": { title: "Categories" },
  "/products": { title: "Products" },
  "/products/new": { title: "Add Product", backHref: "/products" },
  "/products/edit": { title: "Edit Product", backHref: "/products" },
  "/banners/edit": { title: "Edit Banner", backHref: "/banners" },
  "/videos/edit": { title: "Edit Video", backHref: "/videos" },
  "/badges": { title: "Badges" },
};

export function getAdminPageMeta(pathname: string): AdminPageMeta | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return STATIC_ROUTES[normalized] ?? null;
}
