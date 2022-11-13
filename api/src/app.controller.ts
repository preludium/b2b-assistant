import { Body, Controller, InternalServerErrorException, Logger, Post, StreamableFile, UsePipes } from '@nestjs/common';

import { schema } from './app.schema';
import { AppService } from './app.service';
import { GenerateFilesRequest } from './app.types';
import { SchemaValidationPipe } from './schema-validation.pipe';

@Controller('api')
export class AppController {
    private readonly logger = new Logger(AppService.name);

    constructor(private readonly appService: AppService) {}

    @Post('generate')
    @UsePipes(new SchemaValidationPipe(schema))
    async generateFiles(@Body() generateFilesRequest: GenerateFilesRequest) {
        try {
            this.logger.log('=> Request to generate files');
            const file = await this.appService.generateB2BFiles(generateFilesRequest);
            this.logger.log('<= Success: Files generated');
            return new StreamableFile(file);
        } catch (error) {
            this.logger.error(`<= Error: ${error.message}`, error);
            throw new InternalServerErrorException(error.message);
        }
    }

}
