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
    describe("[strict models]", () => {
      context("extending a strict Model", () => {
        class Base extends Model {
          static meta = {
            props: {
              x: t.String,
            },
            strict: true,
          };
        }
        
        it("is strict", () => {
          expect(Base.meta.strict).to.be.true;
        });
        
        it("fails to extend with additional props", () => {
          expect(() => {
            class Sub extends Base {
              static meta = {
                props: {
                  y: t.String,
                },
              };
            }
          }).to.throw(TypeError);
        });
        
        it("fails to extend with a non-strict struct", () => {
          expect(() => {
            class Sub extends Base {
              static meta = {
                props: {
                  x: nrser.t.NonEmptyString,
                },
                strict: false,
              };
            }
          }).to.throw(TypeError);
        });
        
        context("extend with an intersection", () => {
          class Sub extends Base {
            static meta = {
              props: {
                x: nrser.t.NonEmptyString,
              },
            };
          }
          
          it("is strict", () => {
            expect(Sub.meta.strict).to.be.true;
          });
          
          it("creates an intersection type", () => {
            expect(Sub.meta.props.x.meta.kind).to.equal('intersection');
          });
          
          it("fails when the value doesn't satisfy both types", () => {
            expect(() => new Sub({x: ''})).to.throw(TypeError);
          });
          
          it("succeeds when the value satisfies both types", () => {
            expect(new Sub({x: 'hey'})).to.have.property('x').that.equals('hey');
          });
        }); // intersection
        
      }); // strict 
    });
  }); // Model
}); // types/Model.js