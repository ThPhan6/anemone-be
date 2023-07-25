import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsValidatedWithOtherProperty(
  property: string,
  isOk: (value: any, other: any) => boolean,
  validatorName?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: validatorName ?? `isValidatedWith${property}`,
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          return isOk(value, relatedValue);
        },
      },
    });
  };
}
