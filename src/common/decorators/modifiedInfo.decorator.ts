import { Column } from 'typeorm';

import { ModifiedInfo } from './../entities/modifiedInfo';

export function ModifiedInfoColumn(): PropertyDecorator {
  return Column(() => ModifiedInfo, { prefix: false });
}
