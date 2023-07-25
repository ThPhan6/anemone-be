export function DefaultValue(defaultValue: any) {
  return function (target: any, propertyName: string) {
    let original = target[propertyName];
    Object.defineProperty(target, propertyName, {
      get() {
        return original != undefined ? original : defaultValue;
      },
      set(value: any) {
        original = value;
      },
    });
  };
}
