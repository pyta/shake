import type { RouteLocationRaw, RouteRecordName } from "vue-router";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

export type BreadcrumbItem = {
  label: string;
  to: RouteLocationRaw;
};

export function useBreadcrumbs() {
  const route = useRoute();
  const router = useRouter();

  return computed(() => {
    const items: BreadcrumbItem[] = [];

    if (route.meta.breadcrumbSelf) {
      items.unshift({
        label: String(route.meta.title),
        to: { name: route.name },
      });
    }

    let parentName = route.meta.breadcrumbParent as RouteRecordName | undefined;

    while (parentName) {
      const parent = router.getRoutes().find((r) => r.name === parentName);
      if (!parent?.meta?.title) break;

      items.unshift({
        label: String(parent.meta.title),
        to: { name: parentName },
      });

      parentName = parent.meta.breadcrumbParent as RouteRecordName | undefined;
    }

    return items;
  });
}
