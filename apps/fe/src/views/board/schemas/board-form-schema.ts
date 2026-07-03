import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

export const createBoardSchema = toTypedSchema(
    z.object({
        name: z.string().min(1, "Name is required").max(255, "Max 255 characters"),
    }),
);

export type CreateBoardFormValues = z.infer<typeof createBoardSchema>;
