import PizZip from 'pizzip';

import type { File } from './types';

export const zipFiles = (files: File[]) => {
    const zip = new PizZip();

    files.forEach(({ name, content }) => {
        zip.file(`${name}.pdf`, content);
    });
    
    return zip.generate({
        type: 'nodebuffer',
        platform: process.platform,
    });
};
