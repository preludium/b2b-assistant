import axios from 'axios'; 

export interface GenerateFilesRequest {
    invoiceNumber: string;
    workedHours: number;
    rate: number;
}

export const downloadB2BFiles = (params: GenerateFilesRequest) => axios
    .post('/api/generate', params, {
        responseType: 'arraybuffer',
    })
    .then(({ data: blob }) => {
        const url = window.URL.createObjectURL(
            new Blob([blob], { type: 'octet/stream' }),
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            `${new Date().toLocaleString('default', { month: 'long' })}.zip`,
        );

        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    });
