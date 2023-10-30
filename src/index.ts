import { CommitService } from './commit/commit.service';
import { DocumentService, checkArgument } from './document';
import type { File } from './types';
import { zipFiles } from './utils';

const rate = await checkArgument('rate')
    .catch((e) => {
        console.error(e.message);
        process.exit(1);
    });

const workedHours = await checkArgument('workedHours')
    .catch((e) => {
        console.error(e.message);
        process.exit(1);
    });

const documentService = new DocumentService();
const commitService = new CommitService();

const files = await Promise.all([
    documentService.generateDocuments({ rate, workedHours }),
    commitService.createCommitsPdf(),
])
    .then(element => element
        .reduce<File[]>((acc, cur) => Array.isArray(cur)
            ? [...acc, ...cur]
            : [...acc, cur]
        , [])
    );

console.log('Zipping files');
const zip = zipFiles(files);

Bun.write('result.zip', zip);
console.log('Success');
