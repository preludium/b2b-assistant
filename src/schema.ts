import z from 'zod';

export const requestSchema = z.object({
    workedHours: z.preprocess(Number, z.number()).optional(),
    rate: z.preprocess(Number, z.number()).optional(),
});

type Argument = keyof z.infer<typeof requestSchema>;

const flag: Record<Argument, string[]>= {
    workedHours: ['-h', '--workedHours'],
    rate: ['-r', '--rate'],
};

export const checkArgument = (flagKey: Argument) => {
    let flagValue = '';

    for (const optionFlag of flag[flagKey]){
        const argumentIndex = Bun.argv.indexOf(optionFlag);

        if (argumentIndex > -1 && Bun.argv[argumentIndex + 1]) {
            if (flagValue !== '') {
                return Promise
                    .reject(new Error(`Multiple arguments for option ${flag[flagKey].join(', ')}`));
            }

            const parseResult = requestSchema.safeParse({ [flagKey]: Bun.argv[argumentIndex + 1]});
            if (!parseResult.success) {
                const issueMessage = parseResult.error.issues.map(issue => issue.message).at(0);
                return Promise.reject(new Error(`Wrong "${flagKey}" option value: ${issueMessage}`));
            }
            flagValue = Bun.argv[argumentIndex + 1]!;
        }
    }

    if (flagValue === '') {
        return Promise.reject(new Error(`Provide required option ${flag[flagKey].join(', ')}`));
    }

    return Promise.resolve(requestSchema.parse({ [flagKey]: flagValue })[flagKey]!);
};
