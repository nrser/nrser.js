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
    describe("[property extension]", () => {
      context("extend via intersection", () => {
        class Base extends Model {
          static meta = {
            props: {
              x: t.Number,
            },
          };
        }
        
        class Sub extends Base {
          static meta = {
            props: {
              x: nrser.t.Integer,
            },
          };
        }
        
        it("created an intersection type for x", () => {
          expect(Sub.meta.props.x.meta.kind).to.equal('intersection');
        });
        
        context("obj = {x: 3.15}", () => {
          const obj = {x: 3.15};
          
          it("is accepted by Base", () => {
            expect(new Base(obj)).to.have.property('x').that.equals(3.15);
          });
          
          it("is rejected by Sub", () => {
            expect(() => new Sub(obj)).to.throw(TypeError);
          });
        })
        
        context("obj = {x: 3}", () => {
          const obj = {x: 3};
          
          it("is accepted by Base", () => {
            expect(new Base(obj)).to.have.property('x').that.equals(3);
          });
          
          it("is accepted by Sub", () => {
            expect(new Sub(obj)).to.have.property('x').that.equals(3);
          });
        });
        
      }); // intersection
      
      context("extend via refinement", () => {
        class Base extends Model {
          static meta = {
            props: {
              x: t.Number,
            },
          };
        }
        
        class Sub extends Base {
          static meta = {
            props: {
              x: number => number % 2 === 0,
            },
          };
        }
        
        it("created an intersection type for x", () => {
          expect(Sub.meta.props.x.meta.kind).to.equal('subtype');
        });
        
        context("obj = {x: 1}", () => {
          const obj = {x: 1};
          
          it("is accepted by Base", () => {
            expect(new Base(obj)).to.have.property('x').that.equals(1);
          });
          
          it("is rejected by Sub", () => {
            expect(() => new Sub(obj)).to.throw(TypeError);
          });
        });
        
        context("obj = {x: 2}", () => {
          const obj = {x: 2};
          
          it("is accepted by Base", () => {
            expect(new Base(obj)).to.have.property('x').that.equals(2);
          });
          
          it("is accepted by Sub", () => {
            expect(new Sub(obj)).to.have.property('x').that.equals(2);
          });
        });
      }); // refinement
      
      context("extend via value specification", () => {
        class Base extends Model {
          static meta = {
            props: {
              x: t.String,
            },
          };
        }
        
        context("value is of super type", () => {
          class Sub extends Base {
            static meta = {
              props: {
                x: 'ex',
              },
            };
          }
          
          it("created a irreducible type for x", () => {
            expect(Sub.meta.props.x.meta.kind).to.equal('irreducible');
          });
                  
          it("accepts that exact value", () => {
            expect(new Sub({x: "ex"})).to.have.property('x').that.equals('ex');
          });
          
          it("rejects other values", () => {
            expect(() => new Sub({x: "why"})).to.throw(TypeError);
          });
          
        });
        
        context("value is not of super type", () => {
          it("fails to create sub-struct", () => {
            expect(() => {
              class Sub extends Base {
                static meta = {
                  props: {
                    x: 3,
                  }
                };
              }
            }).to.throw(TypeError);
          })
        });
      }); // value
    }); // property extension
  }); // Model
}); // types/Model.js