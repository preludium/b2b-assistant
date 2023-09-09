import z from 'zod';

export const requestSchema = z.object({
    invoiceNumber: z.string(),
    workedHours: z.number(),
    rate: z.number(),
});
