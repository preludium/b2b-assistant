import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

import { ObjectSchema } from 'yup';


@Injectable()
export class SchemaValidationPipe implements PipeTransform {
    constructor(private schema: ObjectSchema<any>) {}

    transform(value: any, metadata: ArgumentMetadata) {
        if (metadata.type === 'body') {
            return this.schema.validate(value);
        }
        
        return value;
    }
}
