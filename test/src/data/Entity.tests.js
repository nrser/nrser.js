import chai, { expect } from 'chai';
import { itMaps } from '../../../lib/testing.js';
import * as nrser from '../../../lib';
import t from 'tcomb';
import _ from 'lodash';

const Entity = nrser.d.Entity;

describe("data/Entity.js", () => {
  describe("Entity", () => {
    context("basic inheritance and type checking", () => {
      class Base extends nrser.d.Entity {
        static meta = nrser.d.Entity.extendMeta({
          props: {
            x: t.String,
          },
        });
      }
      
      context("Base class", () => {
        it("creates an instance with a valid value", () => {
          expect(new Base({x: "ex"})).not.to.throw;
        });
        
        it("fails to create an instance with invalid values", () => {
          _.each([{}, {x: 1}], (values) => {
            expect(() => new Base(values)).to.throw(TypeError);
          });
        });
        
        it("creates an accessor for the value", () => {
          expect(new Base({x: 'ex'}).x).to.equal('ex');
        });
        
        it("prevents setting the value", () => {
          const base = new Base({x: 'ex'});
          expect(() => base.x = 'hey!').to.throw(TypeError);
        });
        
        it("creates Entity instances", () => {
          expect(new Base({x: 'ex'}) instanceof nrser.d.Entity).to.be.true;
        });
        
        it("creates Base instances", () => {
          expect(new Base({x: 'ex'}) instanceof Base).to.be.true;
        });
        
        it("is a tcomb type", () => {
          expect(t.isType(Base)).to.be.true;
        });
        
        it("creates instances that pass Entity.is()", () => {
          expect(nrser.d.Entity.is(new Base({x: 'ex'}))).to.be.true;
        });
        
        it("creates instances that pass Base.is()", () => {
          expect(Base.is(new Base({x: 'ex'}))).to.be.true;
        });
      }); // Base class
      
      class Sub extends Base {
        static meta = Base.extendMeta({
          props: {
            y: t.String,
          },
        });
      }
      
      context("Sub class", () => {
        const defaultValues = {x: 'ex', y: 'why'};
        
        const defaultSub = function() {
          return new Sub(defaultValues);
        };
        
        it("creates an instance with a valid value", () => {
          expect(new Sub({x: "ex", y: 'why'})).not.to.throw;
        });

        it("fails to create an instance with invalid values", () => {
          _.each([{}, {x: 'ex'}, {y: 'why'}, {x: 'ex', y: 1}], (values) => {
            expect(() => new Sub(values)).to.throw(TypeError);
          });
        });

        it("creates an accessors for the values", () => {
          const sub = defaultSub();
          expect(sub.x).to.equal(defaultValues.x);
          expect(sub.y).to.equal(defaultValues.y);
        });

        it("creates Entity instances", () => {
          expect(defaultSub() instanceof nrser.d.Entity).to.be.true;
        });

        it("creates Base instances", () => {
          expect(defaultSub() instanceof Base).to.be.true;
        });
        
        it("creates Sub instances", () => {
          expect(defaultSub() instanceof Sub).to.be.true;
        });

        it("is a tcomb type", () => {
          expect(t.isType(Sub)).to.be.true;
        });

        it("creates instances that pass Entity.is()", () => {
          expect(nrser.d.Entity.is(defaultSub())).to.be.true;
        });

        it("creates instances that pass Base.is()", () => {
          expect(Base.is(defaultSub())).to.be.true;
        });
        
        it("creates instances that pass Sub.is()", () => {
          expect(Sub.is(defaultSub())).to.be.true;
        });
      
      }); // Sub class
    }); // basic inheritance and type checking
    
    context("extend via intersection", () => {
      class Base extends Entity {
        static meta = Entity.extendMeta({
          props: {
            x: t.Number,
          },
        });
      }
      
      class Sub extends Base {
        static meta = Base.extendMeta({
          props: {
            x: nrser.t.Integer,
          },
        });
      }
      
      it("created an intersection type for x", () => {
        expect(Sub.meta.props.x.meta.kind).to.equal('intersection');
      });
      
      context("obj = {x: 3.15}", () => {
        const obj = {x: 3.15};
        
        it("is accepted by Base", () => {
          expect(new Base(obj)._values).to.eql(obj);
        });
        
        it("is rejected by Sub", () => {
          expect(() => new Sub(obj)).to.throw(TypeError);
        });
      })
      
      context("obj = {x: 3}", () => {
        const obj = {x: 3};
        
        it("is accepted by Base", () => {
          expect(new Base(obj)._values).to.eql(obj);
        });
        
        it("is accepted by Sub", () => {
          expect(new Sub(obj)._values).to.eql(obj);
        });
      });
      
    }); // intersection
    
    context("extend via refinement", () => {
      class Base extends Entity {
        static meta = Entity.extendMeta({
          props: {
            x: t.Number,
          },
        });
      }
      
      class Sub extends Base {
        static meta = Base.extendMeta({
          props: {
            x: number => number % 2 === 0,
          },
        });
      }
      
      it("created an intersection type for x", () => {
        expect(Sub.meta.props.x.meta.kind).to.equal('subtype');
      });
      
      context("obj = {x: 1}", () => {
        const obj = {x: 1};
        
        it("is accepted by Base", () => {
          expect(new Base(obj)._values).to.eql(obj);
        });
        
        it("is rejected by Sub", () => {
          expect(() => new Sub(obj)).to.throw(TypeError);
        });
      });
      
      context("obj = {x: 2}", () => {
        const obj = {x: 2};
        
        it("is accepted by Base", () => {
          expect(new Base(obj)._values).to.eql(obj);
        });
        
        it("is accepted by Sub", () => {
          expect(new Sub(obj)._values).to.eql(obj);
        });
      });
    }); // refinement
    
    context("extend via value specification", () => {
      class Base extends Entity {
        static meta = Entity.extendMeta({
          props: {
            x: t.String,
          },
        });
      }
      
      context("value is of super type", () => {
        class Sub extends Base {
          static meta = Base.extendMeta({
            props: {
              x: 'ex',
            },
          });
        }
        
        it("created a irreducible type for x", () => {
          expect(Sub.meta.props.x.meta.kind).to.equal('irreducible');
        });
                
        it("accepts that exact value", () => {
          expect(new Sub({x: "ex"})._values).to.eql({x: "ex"});
        });
        
        it("rejects other values", () => {
          expect(() => new Sub({x: "why"})).to.throw(TypeError);
        });
        
      });
      
      context("value is not of super type", () => {
        it("fails to create sub-struct", () => {
          expect(() => {
            class Sub extends Base {
              static meta = Base.extendMeta({
                props: {
                  x: 3,
                }
              });
            }
          }).to.throw(TypeError);
        })
      });
    }); // value
    
    context("extending a strict Entity", () => {
      class Base extends Entity {
        static meta = Entity.extendMeta({
          props: {
            x: t.String,
          },
          strict: true,
        });
      }
      
      it("is strict", () => {
        expect(Base.meta.strict).to.be.true;
      });
      
      it("fails to extend with additional props", () => {
        expect(() => {
          class Sub extends Base {
            static meta = Base.extendMeta({
              props: {
                y: t.String,
              },
            });
          }
        }).to.throw(TypeError);
      });
      
      it("fails to extend with a non-strict struct", () => {
        expect(() => {
          class Sub extends Base {
            static meta = Base.extendMeta({
              props: {
                x: nrser.t.NonEmptyString,
              },
              strict: false,
            });
          }
        }).to.throw(TypeError);
      });
      
      context("extend with an intersection", () => {
        class Sub extends Base {
          static meta = Base.extendMeta({
            props: {
              x: nrser.t.NonEmptyString,
            },
          });
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
          expect(new Sub({x: 'hey'})._values).to.eql({x: 'hey'});
        });
      }); // intersection
      
    }); // strict 
    
    context("nested entities", () => {
      class Model extends Entity {
        static meta = Entity.extendMeta({
          props: {
            _id: t.String,
          }
        });
      }
      
      class Post extends Model {
        static meta = Model.extendMeta({
          props: {
            body: t.String,
          }
        })
      }
      
      
    }); // nested entities
    
  }); // Entity
}); // data/Entity.js