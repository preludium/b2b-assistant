import { File, GenerateFilesRequest, OrderParams, ProtocolParams, ZipParams } from './app.types';

const dayjs = require('dayjs');
const Docxtemplater = require('docxtemplater');
const libre = require('libreoffice-convert');
const PizZip = require('pizzip');
libre.convertAsync = require('util').promisify(libre.convert);

require('dayjs/locale/pl');
dayjs.locale('pl');

export class AppService {
    async generateB2BFiles({
        invoiceNumber, rate,  workedHours,
    }: GenerateFilesRequest) {
        console.log('Starting processing protocol file');
        const protocol = await this.handleProtocol({ invoiceNumber });
        console.log('Success: Protocol file processed');
        console.log('Starting processing order file');
        const order = await this.handleOrder({
            invoiceNumber, rate, workedHours,
        });
        console.log('Success: Order file processed');
        console.log('Generating zip file');
        const zip = this.zipFiles({ protocol, order });
        console.log('Success: Zip saved');
        return zip;
    }
    
    private async handleProtocol({ invoiceNumber }: ProtocolParams) {
        const doc = await this.readDocument(File.Protocol);

        doc.render({
            date: dayjs().endOf('month').format('DD.MM.YYYY'),
            invoiceNumber,
        });

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        return this.convertToPdf(buf);
    }

    private async handleOrder({ invoiceNumber, rate, workedHours }: OrderParams) {
        const doc = await this.readDocument(File.Order);

        console.log('Substitute values');

        doc.render({
            monthEnd: dayjs().endOf('month').format('DD.MM.YYYY'),
            monthStart: dayjs().startOf('month').format('DD.MM.YYYY'),
            timeframe: this.firstLetterUpperCase(dayjs().format('MMMM YYYY')),
            invoiceNumber, 
            workedHours,
            rate,
            netWorth: rate * workedHours,
        });

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });
        
        return this.convertToPdf(buf);
    }

    private zipFiles({ protocol, order }: ZipParams) {
        const zip = new PizZip();

        zip.file('Zamówienie usług.pdf', order);
        zip.file('Protokół odbioru usług.pdf', protocol);

        return zip.generate({
            type: 'nodebuffer',
            platform: process.platform,
        });
    }

    private convertToPdf(buffer: Buffer) {
        console.log('Convert to pdf');

        return libre.convertAsync(buffer, '.pdf', undefined);
    }

    private async readDocument(fileName: File) {
        console.log('Reading document');
        const content = await Bun.file(`./${fileName}.docx`).text();
        const zip = new PizZip(content);
        return new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
    }

    private firstLetterUpperCase(text: string) {
        return [text.slice(0, 1).toUpperCase(), text.slice(1)].join('');
    }
}
