import type { ColumnDef } from "@tanstack/vue-table";
import { Trash2 } from "lucide-vue-next";
import { h } from "vue";
import { RouterLink } from "vue-router";

import type { Board } from "@/api/types";
import { Button } from "@/components/ui/button";

export function createBoardColumns(handlers: {
  onDelete: (board: Board) => void;
}): ColumnDef<Board>[] {
  return [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const board = row.original;
        return h(
          RouterLink,
          {
            to: { name: "board-detail", params: { boardId: board.id } },
            class: "font-medium hover:underline",
          },
          () => board.name ?? board.id,
        );
      },
    },
    { accessorKey: "createdAt", header: "Created" },
    { accessorKey: "updatedAt", header: "Updated" },
    {
      id: "actions",
      enableHiding: false,
      header: () => h("span", { class: "sr-only" }, "Actions"),
      cell: ({ row }) => {
        const board = row.original;
        return h("div", { class: "flex justify-end gap-1" }, [
          h(
            Button,
            {
              variant: "ghost",
              size: "icon",
              "aria-label": "Delete board",
              onClick: () => handlers.onDelete(board),
            },
            () => h(Trash2, { class: "size-4 text-destructive" }),
          ),
        ]);
      },
    },
  ];
}
