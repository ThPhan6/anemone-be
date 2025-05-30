import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseJsonPipe implements PipeTransform {
  // `fieldsToParse` is an array of string keys that should be parsed from JSON strings
  constructor(private readonly fieldsToParse: string[]) {}

  transform(value: any, metadata: ArgumentMetadata) {
    // Only apply this pipe to the 'body' type
    if (metadata.type === 'body' && value) {
      // Create a shallow copy of the value to avoid modifying the original request body directly
      const transformedValue = { ...value };

      // Iterate through the fields specified for parsing
      for (const field of this.fieldsToParse) {
        // Check if the field exists and is a string (as Multer delivers text fields as strings)
        if (typeof transformedValue[field] === 'string') {
          try {
            // Attempt to parse the string field into a JSON object
            transformedValue[field] = JSON.parse(transformedValue[field]);
          } catch (e) {
            // If parsing fails (e.g., invalid JSON string), throw a BadRequestException
            throw new BadRequestException(
              `Validation failed: Field '${field}' contains invalid JSON data.`,
            );
          }
        }
      }

      return transformedValue; // Return the body with specified fields parsed
    }

    return value; // If not a body or no value, return unchanged
  }
}
