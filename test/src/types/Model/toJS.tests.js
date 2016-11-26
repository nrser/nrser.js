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
    describe("#toJS", () => {
      context("posts fixture", () => {
        expect(post.toJS()).to.deep.equal(postJS);
      });
    }); // #toJS
  }); // Model
}); // types/Model.js