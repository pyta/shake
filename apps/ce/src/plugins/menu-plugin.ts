import type { CePlugin } from "@/core/ce-plugin"
import type { PluginContext } from "@/core/plugin-context"
import type { MenuNode } from "@/helpers/menu/menu-node"

function node(
  id: string,
  name: string,
  data: Record<string, unknown>,
  children: MenuNode[] = [],
): MenuNode {
  return {
    id,
    name,
    data,
    children,
    isVisible: true,
    isEnabled: true,
  }
}

const menuRoot: MenuNode = node("root", "column", { type: "root" }, [
  node("hdr-main", "header", {
    header: "Order builder",
    subheader: "Configure drink & extras",
    description: "Complex sidebar mock with nested columns and grids",
    level: 2,
    gap: 4,
  }),

  // --- Drink type (single choice via replace) ---
  node("sec-drink", "column", { type: "section" }, [
    node("hdr-drink", "header", {
      header: "Drink",
      subheader: "Pick one base",
      level: 3,
      gap: 2,
    }),
    node("grid-drink", "grid", { size: 2, type: "choice" }, [
      node("tile-beer", "tile", {
        header: "Beer",
        description: "Local lager",
        property: "DRINK",
        value: "BEER",
        fill: "replace",
        icon: "B",
        iconSize: 1,
      }),
      node("tile-water", "tile", {
        header: "Water",
        description: "Still / sparkling later",
        property: "DRINK",
        value: "WATER",
        fill: "replace",
        icon: "W",
        iconSize: 1,
      }),
      node("tile-coffee", "tile", {
        header: "Coffee",
        description: "Espresso-based",
        property: "DRINK",
        value: "COFFEE",
        fill: "replace",
        icon: "C",
        iconSize: 1,
      }),
      node("tile-tea", "tile", {
        header: "Tea",
        description: "Black or herbal",
        property: "DRINK",
        value: "TEA",
        fill: "replace",
        icon: "T",
        iconSize: 1,
      }),
    ]),
  ]),

  // --- Size + quantity (nested column with boxes) ---
  node("sec-size", "column", { type: "section" }, [
    node("hdr-size", "header", {
      header: "Size & amount",
      level: 3,
      gap: 2,
    }),
    node("grid-size", "grid", { size: 3, type: "size" }, [
      node("tile-s", "tile", {
        header: "S",
        description: "0.3 L",
        property: "SIZE",
        value: "S",
        fill: "replace",
        icon: "S",
      }),
      node("tile-m", "tile", {
        header: "M",
        description: "0.5 L",
        property: "SIZE",
        value: "M",
        fill: "replace",
        icon: "M",
      }),
      node("tile-l", "tile", {
        header: "L",
        description: "0.75 L",
        property: "SIZE",
        value: "L",
        fill: "replace",
        icon: "L",
      }),
    ]),
    node("col-amount", "column", { type: "inputs" }, [
      node("box-qty", "input-box", {
        type: "number",
        label: "Quantity",
        property: "QTY",
        placeholder: "1",
        min: 1,
        max: 20,
        icon: "#",
      }),
      node("box-note", "input-box", {
        type: "text",
        label: "Note",
        property: "NOTE",
        placeholder: "e.g. no ice",
        icon: "N",
      }),
    ]),
  ]),

  // --- Extras (multi-select via toggle) ---
  node("sec-extras", "column", { type: "section" }, [
    node("hdr-extras", "header", {
      header: "Extras",
      subheader: "Toggle any combination",
      description: "Uses fill=toggle on shared property EXTRAS",
      level: 3,
      gap: 2,
    }),
    node("grid-extras", "grid", { size: 2, type: "toggle" }, [
      node("tile-ice", "tile", {
        header: "Ice",
        property: "EXTRAS",
        value: "ICE",
        fill: "toggle",
        icon: "I",
      }),
      node("tile-lemon", "tile", {
        header: "Lemon",
        property: "EXTRAS",
        value: "LEMON",
        fill: "toggle",
        icon: "L",
      }),
      node("tile-sugar", "tile", {
        header: "Sugar",
        property: "EXTRAS",
        value: "SUGAR",
        fill: "toggle",
        icon: "S",
      }),
      node("tile-milk", "tile", {
        header: "Milk",
        property: "EXTRAS",
        value: "MILK",
        fill: "toggle",
        icon: "M",
      }),
    ]),
  ]),

  // --- Nested layout: two columns side-by-side via grid of columns ---
  node("sec-advanced", "column", { type: "section" }, [
    node("hdr-advanced", "header", {
      header: "Advanced",
      subheader: "Nested columns inside a grid",
      level: 3,
      gap: 2,
    }),
    node("grid-advanced", "grid", { size: 2, type: "split" }, [
      node("col-temp", "column", { type: "panel" }, [
        node("hdr-temp", "header", {
          header: "Temperature",
          level: 4,
          gap: 2,
        }),
        node("tile-hot", "tile", {
          header: "Hot",
          property: "TEMP",
          value: "HOT",
          fill: "replace",
          icon: "H",
        }),
        node("tile-cold", "tile", {
          header: "Cold",
          property: "TEMP",
          value: "COLD",
          fill: "replace",
          icon: "C",
        }),
      ]),
      node("col-strength", "column", { type: "panel" }, [
        node("hdr-strength", "header", {
          header: "Strength",
          level: 4,
          gap: 2,
        }),
        node("box-strength", "input-box", {
          type: "number",
          label: "Intensity",
          property: "STRENGTH",
          placeholder: "5",
          min: 1,
          max: 10,
          icon: "*",
        }),
        node("tile-decaf", "tile", {
          header: "Decaf",
          description: "Optional flag",
          property: "FLAGS",
          value: "DECAF",
          fill: "toggle",
          icon: "D",
        }),
      ]),
    ]),
  ]),
])

export class MenuPlugin implements CePlugin {
  id = "menu"

  register(ctx: PluginContext) {
    // jak pobierać dane dla widgetów?
    // same se powinny pobrać.

    ctx.widgets.register({
      id: "menu-widget",
      slot: "sidebar",
      tagName: "menu-widget",
      data: {
        root: menuRoot,
      },
    })
  }
}
