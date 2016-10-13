// @flow

import chai from 'chai';
import _ from 'lodash';
import t from 'tcomb';
import type { $Refinement } from 'tcomb';

import * as nrser from '.';

function isErrorClass(obj: *): boolean {
  return obj.prototype instanceof Error;
}

type ErrorClass = any & $Refinement<typeof isErrorClass>;

function hasEvenLength(array: Array<*>): boolean {
  return array.length % 2 === 0;
}

type Pairable<V> = Array<V> & $Refinement<typeof hasEvenLength>;

class Throws {
  constructor(errorClass: ErrorClass, pattern?: RegExp) {
    this.errorClass = errorClass;
    this.pattern = pattern;
  }
  
  throwArgs() {
    const args = [this.errorClass];
    if (this.pattern) {
      args.push(this.pattern);
    }
    return args;
  }
}

const Mapping = t.refinement(t.Array, (a) => a.length % 2 === 0, 'Mapping');

export function itMaps({
  func,
  map,
  
  funcName = func.name ? func.name.replace('bound ', '') : 'f',
  
  tester = ({actual, expected}) => {
    chai.expect(actual).to.eql(expected);
  },
  
  formatArgs = (args, funcName) => (
    `${ funcName }(${ _.map(args, (a) => JSON.stringify(a)).join(", ") })`
  ),
  
  formatExpected = (expected) => (
    JSON.stringify(expected)
  ),
  
  formatter = (args, expected, funcName) => {
    if (expected instanceof Throws) {
      return nrser.squish`
        ${ formatArgs(args, funcName) } throws ${ expected.errorClass.name }
      `;
      
    } else {
      return nrser.squish`
        maps
        ${ formatArgs(args, funcName) }
        to ${ formatExpected(expected) }
      `;
      
    }
  },
}) {  
  const mapping: Pairable<*> = map(
    (...args) => args,
    (errorClass, pattern) => new Throws(errorClass, pattern)
  );
  
  for (let i = 0; i < mapping.length; i += 2) {
    const args = mapping[i];
    const expected = mapping[i + 1];
    
    it(formatter(args, expected, funcName), () => {
      if (expected instanceof Throws) {
        chai.expect(
          () => func(...args)
        ).to.throw(expected.errorClass, expected.pattern);
      } else {
        tester({actual: func(...args), expected});
      }
    })
  }
}
