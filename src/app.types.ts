import z from 'zod';

import { requestSchema } from './schema';

export interface ProtocolParams {
    invoiceNumber: string;
}

export type GenerateFilesRequest = z.infer<typeof requestSchema>;

export interface File {
    name: string;
    content: Buffer;
}
