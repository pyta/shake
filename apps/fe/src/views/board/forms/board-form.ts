import type { CreateBoard } from "@/api/types";

export function emptyCreateBoard(): CreateBoard {
    return { name: "" };
}