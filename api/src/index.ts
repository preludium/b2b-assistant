import { ZodError } from 'zod';

import { requestSchema } from './app.schema';
import { AppService } from './app.service';

const appService = new AppService();

Bun.serve({
    port: 8000,
    development: true,
    async fetch(req: Request) {
        const url = new URL(req.url);
    
        if (url.pathname === '/api/generate' && req.method === 'POST') {
            console.log('=> Request to generate files');
            const generateFilesRequest = requestSchema.parse(await req.json());
            console.table(generateFilesRequest);
            const file = await appService.generateB2BFiles(generateFilesRequest);
            console.log('<= Success: Files generated');
            return new Response(file);
        }

        console.warn('<= Warn: no matching request resource', url.pathname);
        return new Response('404', { status: 404 });
    },
    error(error) {
        if (error instanceof ZodError) {
            console.error(`<= Error: ${error.issues[0].message}`);
            return new Response('Body validation error', { status: 400 });
        }

        if (error instanceof Error) {
            console.error(`<= Error: ${error.message}`, error);
            return new Response(error.message, { status: 500 });
        }

        console.error(error);
        return new Response('Unexpected error occurred', { status: 500 });
    },
});
