import { AppService } from './app.service';
import { checkArgument } from './schema';

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

const appService = new AppService();

await appService.generateB2BFiles({ rate, workedHours });
