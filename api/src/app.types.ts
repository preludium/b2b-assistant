import { z } from 'zod';

import { requestSchema } from './app.schema';

export interface ProtocolParams {
    invoiceNumber: string;
}

export type GenerateFilesRequest = z.infer<typeof requestSchema>;

export interface OrderParams extends GenerateFilesRequest {}

export interface ZipParams {
    protocol: Buffer;
    order: Buffer;
}

export enum File {
    Protocol = 'protocol',
    Order = 'order',
}
