import chai, { expect } from 'chai';
import { itMaps2 } from '../../../lib/testing.js';
import * as nrser from '../../../lib';
import t from 'tcomb';
import _ from 'lodash';

describe("data/Entity.js", () => {
  describe("Entity", () => {
    class Blah extends nrser.d.Entity {
      static meta = nrser.d.Entity.extendMeta({
        props: {
          x: t.String,
        },
      });
    }
    
    const blah = new Blah({x: 'hey'});
    
    expect(blah.x).to.equal('hey');
  }); // Entity
}); // data/Entity.js