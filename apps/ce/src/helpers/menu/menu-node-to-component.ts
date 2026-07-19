import type { MenuComponent } from "./menu-component";
import type { MenuNode } from "./menu-node";

export function toComponent(node: MenuNode): MenuComponent {
    switch (node.name) {
        case 'column':
            return toColumn(node);
        case 'tile':
            return toTile(node);
        case 'grid':
            return toGrid(node);
        case 'header':
            return toHeader(node);
        case 'input-box':
            return toInputBox(node);
    }

    return {
        id: node.id,
        name: "unknown",
        data: node.data,
        children: []
    }
}

function toColumn(node: MenuNode): MenuComponent {
    return {
        id: node.id,
        name: 'column-ce',
        data: node.data,
        children: node.children.map(x => toComponent(x)),
    }
}

function toTile(node: MenuNode): MenuComponent {
    return {
        id: node.id,
        name: 'tile-ce',
        data: node.data,
        children: []
    }
}

function toGrid(node: MenuNode): MenuComponent {
    return {
        id: node.id,
        name: 'grid-ce',
        data: node.data,
        children: node.children.map(x => toComponent(x)),
    }
}

function toHeader(node: MenuNode): MenuComponent {
    return {
        id: node.id,
        name: 'header-ce',
        data: node.data,
        children: []
    }
}

function toInputBox(node: MenuNode): MenuComponent {
    return {
        id: node.id,
        name: 'input-box-ce',
        data: node.data,
        children: []
    }
}
