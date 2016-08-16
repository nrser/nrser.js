import chai from 'chai';
import _ from 'lodash';
import t from 'tcomb';
import * as nrser from '.';

export function itMaps({
  func,
  map,
  
  tester = ({actual, expected}) => {
    chai.expect(actual).to.eql(expected);
  },
  
  formatArgs = (args) => (
    `(${ _.map(args, (a) => JSON.stringify(a)).join(", ") })`
  ),
  
  formatExpected = (expected) => (
    JSON.stringify(expected)
  ),
  
  formatter = (args, expected) => {
    if (expected.prototype instanceof Error) {
      return nrser.squish(`
        ${ formatArgs(args) } throws ${ expected.name }
      `);
      
    } else {
      return nrser.squish(`
        maps
        ${ formatArgs(args) }
        to ${ formatExpected(expected) }
      `);
      
    }
  },
}) {
  _.each(map, ([args, expected]) => {
    it(formatter(args, expected), () => {
      if (expected.prototype instanceof Error) {
        chai.expect(() => func(...args)).to.throw(expected);
      } else {
        tester({actual: func(...args), expected});
      }
    });
  });
} // itMaps()

class Throws {
  constructor(error) {
    t.Error(error.prototype);
    this.error = error;
  }
}

const Mapping = t.refinement(t.Array, (a) => a.length % 2 === 0, 'Mapping');

export function itMaps2({
  func,
  map,
  
  funcName = 'f',
  
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
      return nrser.squish(`
        ${ formatArgs(args, funcName) } throws ${ expected.error.name }
      `);
      
    } else {
      return nrser.squish(`
        maps
        ${ formatArgs(args, funcName) }
        to ${ formatExpected(expected) }
      `);
      
    }
  },
}) {
  t.Function(func);
  t.Function(map);
  
  const mapping = Mapping(map(Array, (e) => new Throws(e)));
  
  for (let i = 0; i < mapping.length; i += 2) {
    const args = mapping[i];
    const expected = mapping[i + 1];
    
    it(formatter(args, expected, funcName), () => {
      if (expected instanceof Throws) {
        chai.expect(() => func(...args)).to.throw(expected.error);
      } else {
        tester({actual: func(...args), expected});
      }
    })
  }
}