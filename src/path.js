// @flow

import _ from 'lodash';
import sysPath from 'path';

export * from 'path';

export function split(path: string): Array<string> {
  const parts = path.split(sysPath.sep);
  return parts;
}

export const c = 1;