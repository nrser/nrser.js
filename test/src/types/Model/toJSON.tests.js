import {
  expect,
  itMaps,
  _,
  nrser,
  t,
} from '../../testHelpers';

import {
  post,
  postJS,
} from './fixtures/post';

const Model = nrser.t.Model;

describe("types/Model.js", () => {
  describe("Model", () => {
    describe("#toJSON", () => {
      context("posts fixture", () => {
        expect(JSON.stringify(post)).to.equal(JSON.stringify(postJS));
      });
    }); // #toJS
  }); // Model
}); // types/Model.js