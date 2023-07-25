export enum AuthPermissionValue {
  refer = 0b000001,
  insert = 0b000010,
  update = 0b000100,
  delete = 0b001000,
  print = 0b010000,
  exec = 0b100000,
}

export function authPermissionValues(values: {
  refer?: boolean;
  update?: boolean;
  print?: boolean;
}): AuthPermissionValue {
  let value = values.refer === true ? AuthPermissionValue.refer : 0;
  value += values.update === true ? AuthPermissionValue.insert : 0;
  value += values.update === true ? AuthPermissionValue.update : 0;
  value += values.update === true ? AuthPermissionValue.delete : 0;
  value += values.print === true ? AuthPermissionValue.print : 0;
  value += values.refer === true ? AuthPermissionValue.exec : 0;

  return value;
}
