import dayjs from 'dayjs';
import Docxtemplater from 'docxtemplater';
import { convert as libreConvert } from 'libreoffice-convert';
import PizZip from 'pizzip';

import type { File, GenerateFilesRequest } from './app.types';

require('dayjs/locale/pl');
dayjs.locale('pl');

export class AppService {
    async generateB2BFiles(values: Required<GenerateFilesRequest>) {
        const filesNames = Bun.env.TEMPLATES_NAMES?.split(',');
        if (!filesNames) {
            throw new Error('Provide files names environment variables');
        }

        const files = await Promise.all(
            filesNames.map(fileName => this.substituteTemplates(fileName.trim(), values))
        );

        console.log('Zipping files');
        const zip = this.zipFiles(files);

        Bun.write('result.zip', zip);
        console.log('Success');
    }
    
    private async substituteTemplates(
        fileName: string,
        { rate, workedHours }: Required<GenerateFilesRequest>,
    ): Promise<File> {
        const doc = await this.readDocument(fileName);

        console.log(`Swapping "${fileName}" template values`);
        doc.render({
            monthEnd: dayjs().endOf('month').format('DD.MM.YYYY'),
            monthStart: dayjs().startOf('month').format('DD.MM.YYYY'),
            term: this.firstLetterUpperCase(dayjs().format('MMMM YYYY')),
            invoiceId: dayjs().format('MM/YYYY'), 
            workedHours,
            rate,
            netWorth: rate * workedHours,
        });

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        return {
            name: fileName,
            content: await this.convertToPdf(buf),
        };
    }

    private zipFiles(files: File[]) {
        const zip = new PizZip();

        files.forEach(({ name, content }) => {
            zip.file(`${name.replace('_template', '')}.pdf`, content);
        });
        
        return zip.generate({
            type: 'nodebuffer',
            platform: process.platform,
        });
    }

    private convertToPdf(buffer: Buffer) {
        return this.convert(buffer, '.pdf');
    }

    private async readDocument(fileName: string) {
        console.log(`Reading "${fileName}"`);
        const content = await Bun.file(`templates/${fileName}.docx`).arrayBuffer();
        const zip = new PizZip(content);
        return new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
    }

    private convert(buffer: Buffer, format: string) {
        return new Promise<Buffer>((resolve, reject) => {
            libreConvert(buffer, format, undefined, (error: ErrnoException | null, data: Buffer) => {
                if (error) {
                    reject(error);
                }

                resolve(data);
            });
        });
    }

    private firstLetterUpperCase(text: string) {
        return [text.slice(0, 1).toUpperCase(), text.slice(1)].join('');
    }
}
