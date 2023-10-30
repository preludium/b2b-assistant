import z from 'zod';

import { argumentsSchema } from './document.utils';

export interface ProtocolParams {
    invoiceNumber: string;
}

export type GenerateFilesRequest = z.infer<typeof argumentsSchema>;
