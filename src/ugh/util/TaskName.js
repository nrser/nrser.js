// @flow

import _ from 'lodash';

export class TaskName {
  static SEP = ':';
  
  id: TaskId;
  
  typeName: TaskTypeName;
  
  packageName: ?string;
  
  constructor({
    id,
    typeName,
    packageName,
  }: {
    id?: TaskId,
    typeName: TaskTypeName,
    packageName?: string,
  }) {
    this.id = id;
    this.typeName = typeName;
    this.packageName = packageName;
  }
  
  toArray(): Array<string> {
    return _.chain([this.typeName, this.packageName, this.id])
      .flatten()
      .filter((str?: string): boolean => {
        return !_.isEmpty(str);
      })
      .value();
  }
  
  toString(): string {
    return this.toArray().join(this.constructor.SEP);
  }
}