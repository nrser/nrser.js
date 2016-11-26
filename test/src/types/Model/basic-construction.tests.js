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
    describe("[basic declaration, construction and type checking]", () => {
      it("prevents construction of Model itself", () => {
        expect(() => {
          new Model()
        }).to.throw(nrser.NotImplementedError);
      });
      
      class NoMeta extends Model {}
      
      it(nrser.squish`
        prevents construction of Model subclasses that haven't declared meta
      `, () => {
        expect(() => new NoMeta()).to.throw(nrser.StateError);
      });
      
      class Base extends Model {
        static meta = {
          props: {
            x: t.String,
          },
        };
      }
      
      context("Base class", () => {
        it("creates an instance with a valid value", () => {
          expect(() => new Base({x: "ex"})).not.to.throw();
        });
        
        it("fails to create an instance with invalid values", () => {
          _.each([{}, {x: 1}], (values) => {
            expect(() => new Base(values)).to.throw(TypeError);
          });
        });
        
        it("sets the property value on the instance", () => {
          expect(new Base({x: 'ex'}).x).to.equal('ex');
        });
        
        it("prevents setting the property value", () => {
          const base = new Base({x: 'ex'});
          expect(() => base.x = 'hey!').to.throw(TypeError);
        });
        
        it("creates Model instances", () => {
          expect(new Base({x: 'ex'}) instanceof Model).to.be.true;
        });
        
        it("creates Base instances", () => {
          expect(new Base({x: 'ex'}) instanceof Base).to.be.true;
        });
        
        it("is a tcomb type", () => {
          expect(t.isType(Base)).to.be.true;
        });
        
        it("creates instances that pass Model.is()", () => {
          expect(Model.is(new Base({x: 'ex'}))).to.be.true;
        });
        
        it("creates instances that pass Base.is()", () => {
          expect(Base.is(new Base({x: 'ex'}))).to.be.true;
        });
        
        it(`has meta.name == 'Base'`, () => {
          expect(Base.meta.name).to.equal('Base');
        });
      }); // Base class
      
      class Sub extends Base {
        static meta = {
          props: {
            y: t.String,
          },
        };
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

        it("sets the values on the Model instance", () => {
          const sub = defaultSub();
          expect(sub.x).to.equal(defaultValues.x);
          expect(sub.y).to.equal(defaultValues.y);
        });

        it("creates Model instances", () => {
          expect(defaultSub() instanceof Model).to.be.true;
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

        it("creates instances that pass Model.is()", () => {
          expect(Model.is(defaultSub())).to.be.true;
        });

        it("creates instances that pass Base.is()", () => {
          expect(Base.is(defaultSub())).to.be.true;
        });
        
        it("creates instances that pass Sub.is()", () => {
          expect(Sub.is(defaultSub())).to.be.true;
        });
      
      }); // Sub class
    }); // basic inheritance and type checking
    
  }); // Model
}); // types/Model.js