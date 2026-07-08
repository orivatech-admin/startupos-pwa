import * as z from "zod";

export const TransactionFormSchema = z
  .object({
    transaction_type: z.enum(["expense", "income", "transfer"]),
    amount: z.coerce.number().positive({ error: "Enter an amount greater than 0." }),
    currency: z.string().min(1).default("INR"),
    date_time: z.iso.datetime({ offset: true, error: "Pick a valid date and time." }),
    category_id: z.uuid().optional(),
    project_id: z.uuid().optional(),
    account_id: z.uuid({ error: "Choose an account." }),
    destination_account_id: z.uuid().optional(),
    payment_mode_id: z.uuid().optional(),
    notes: z.string().max(2000).optional(),
    description: z.string().max(2000).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).default([]),
  })
  .check((ctx) => {
    const value = ctx.value;
    if (value.transaction_type === "transfer") {
      if (!value.destination_account_id) {
        ctx.issues.push({
          code: "custom",
          message: "Choose a destination account for the transfer.",
          input: value,
          path: ["destination_account_id"],
        });
      } else if (value.destination_account_id === value.account_id) {
        ctx.issues.push({
          code: "custom",
          message: "Source and destination accounts must be different.",
          input: value,
          path: ["destination_account_id"],
        });
      }
    }
  });

export type TransactionFormValues = z.infer<typeof TransactionFormSchema>;
