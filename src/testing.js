let chai;

if (Meteor) {
  chai = require('meteor/practicalmeteor:chai');
} else {
  chai = require('chai');
}

export function itMaps({
  func,
  map,
  tester = ({actual, expected}) => {
    chai.expect(actual).to.equal(expected);
  },
  formatter = (args, expected) => {
    return `
      maps
      (${ _.map(args, (a) => JSON.stringify(a)).join(", ") }) 
      to ${ JSON.stringify(expected) }
    `;
  },
}) {
  _.each(map, ([args, expected]) => {
    it(formatter(args, expected), () => {
        tester({actual: func(...args), expected});
    });
  });
} // itMaps()