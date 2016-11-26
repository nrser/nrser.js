import {
  expect,
  itMaps,
  _,
  nrser,
  t,
} from '../../testHelpers';

const Model = nrser.t.Model;

describe("types/Model.js", () => {
  describe("Model", () => {
    describe("[nested models]", () => {
    
      context("basic nesting", () => {
        class Point extends Model {
          static meta = {
            props: {
              x: t.Number,
              y: t.Number,
            }
          }
        }
        
        class Rect extends Model {
          static meta = {
            props: {
              a: Point,
              b: Point,
            }
          }
        }
        
        it(`constructs a nested model`, () => {
          const r = new Rect({
            a: {x: 0, y: 0},
            b: {x: 1, y: 1},
          });
          
          expect(r.a)
            .to.be.an.instanceOf(Point)
            .with.property('x')
            .that.equals(0);
            
          expect(r.b)
            .to.be.an.instanceOf(Point)
            .with.property('y')
            .that.equals(1);
        });
        
      }); // basic nesting
    }); // [nested models]
  }); // Model
}); // types/Model.js