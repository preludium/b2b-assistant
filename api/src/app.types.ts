export interface ProtocolParams {
    invoiceNumber: string;
}

export interface OrderParams extends GenerateFilesRequest {}

export interface ZipParams {
    protocol: Buffer;
    order: Buffer;
}

export interface GenerateFilesRequest {
    invoiceNumber: string;
    workedHours: number;
    rate: number;
}

export enum File {
    Protocol = 'protocol',
    Order = 'order',
}
