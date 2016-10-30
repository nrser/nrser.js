// @flow

import _ from 'lodash';

import type { TaskId, TaskTypeName } from '../types';

export class TaskName {
  static SEP = ':';
  
  id: TaskId;
  
  typeName: TaskTypeName;
  
  packageName: string;
  
  /**
  * format the different components as a string.
  * 
  * used instances of the class as well as by Ugh instances when making
  * composite task names.
  */
  static format({
    id,
    typeName,
    packageName,
  }: {
    id?: TaskId,
    typeName: TaskTypeName,
    packageName?: string,
  }): string {
    return _.chain([typeName, packageName, id])
      .flatten()
      .filter((str?: string): boolean => {
        return !_.isEmpty(str);
      })
      .value()
      .join(this.SEP);
  }
  
  constructor({
    id,
    typeName,
    packageName,
  }: {
    id: TaskId,
    typeName: TaskTypeName,
    packageName: string,
  }) {
    this.id = id;
    this.typeName = typeName;
    this.packageName = packageName;
  }
  
  format(): string {
    return this.constructor.format({
      id: this.id,
      typeName: this.typeName,
      packageName: this.packageName,
    });
  }
  
  toString(): string {
    return this.format();
  }
}