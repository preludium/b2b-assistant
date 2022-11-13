import { Injectable, Logger } from '@nestjs/common';

// import dayjs from 'dayjs';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { File, GenerateFilesRequest, OrderParams, ProtocolParams, ZipParams } from './app.types';

const dayjs = require('dayjs');
const Docxtemplater = require('docxtemplater');
const libre = require('libreoffice-convert');
const PizZip = require('pizzip');
libre.convertAsync = require('util').promisify(libre.convert);

require('dayjs/locale/pl');
dayjs.locale('pl');


@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    async generateB2BFiles({
        invoiceNumber, rate,  workedHours,
    }: GenerateFilesRequest) {
        this.logger.log('Starting processing protocol file');
        const protocol = await this.handleProtocol({ invoiceNumber });
        this.logger.log('Success: Protocol file processed');
        this.logger.log('Starting processing order file');
        const order = await this.handleOrder({
            invoiceNumber, rate, workedHours,
        });
        this.logger.log('Success: Order file processed');
        this.logger.log('Generating zip file');
        const zip = this.zipFiles({ protocol, order });
        this.logger.log('Success: Zip saved');
        return zip;
    }
    
    private handleProtocol({ invoiceNumber }: ProtocolParams) {
        const doc = this.readDocument(File.Protocol);

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

    private handleOrder({ invoiceNumber, rate, workedHours }: OrderParams) {
        const doc = this.readDocument(File.Order);

        this.logger.log('Substitute values');

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
        this.logger.log('Convert to pdf');

        return libre.convertAsync(buffer, '.pdf', undefined);
    }

    private readDocument(fileName: File) {
        this.logger.log('Reading document');
        const content = readFileSync(resolve(__dirname, `../${fileName}.docx`), 'binary');
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
