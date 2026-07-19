import MenuWidget from "@/widgets/MenuWidget.vue";
import Column from "@/custom/Column.vue";
import Header from "@/custom/Header.vue";
import Tile from "@/custom/Tile.vue";
import Grid from "@/custom/Grid.vue";
import InputBox from "@/custom/InputBox.vue";

import { defineCustomElement } from "vue";

export function define(): void {
    customElements.define(
        'menu-widget',
        defineCustomElement(MenuWidget)
    )

    // te elementy moga być zdefiniowane na zawnątrz! przez inną libkę NP.

    customElements.define('column-ce', defineCustomElement(Column));
    customElements.define('tile-ce', defineCustomElement(Tile));
    customElements.define('header-ce', defineCustomElement(Header));
    customElements.define('grid-ce', defineCustomElement(Grid));
    customElements.define('input-box-ce', defineCustomElement(InputBox));
}
