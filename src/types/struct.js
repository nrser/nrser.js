import t from 'tcomb';
import _ from 'lodash';
import { match } from '../match';
import { value } from './value';
import { squish } from '../string.js';

export function extendProps(superProps, subProps, strict) {
  const extendedProps = _.mapValues(subProps, (subProp, key) => {
    
    // see if there was a super type
    if (_.has(superProps, key)) {
      const superType = superProps[key];
      
      // there was.
      // what we do depends on what the refinement 
      return match(subProp,
        // it's another type
        t.Type, subType => {
          if (subType === superType) {
            // it's identical to the super type, so just use it
            return subType;
          } else {
            // it's a different type
            // an intersection will make sure it satisfies both
            // hopefully it's a sub-type of the super type, otherwise
            // it will never satisfy
            return t.intersection([superType, subType]);
          }
        },
        
        // it's a function, which we take as the predicate for a refinement
        t.Function, predicate => t.refinement(superType, predicate),
        
        // it's some sort of value, which should be a member of the super
        // type for it to make any sense
        t.Any, v => {
          // check that it satisfies the super type
          t.assert(superType.is(v), () => squish(`
            prop ${ key } given value ${ t.stringify(v) } that is not of
            super type ${ t.getTypeName(superType) }
          `));
          // the new type is that exact value
          return value(v);
        },
      );
      
    } else {
      // there is no super type
      
      // if the super struct is strict this is an error since it would 
      // mean that there could be instances that satisfy the sub type
      // but not the super
      
      t.assert(!strict, () => squish(`
        can not add prop ${ key } via extension because super type
        is strict.
      `));
      
      return match(subProp,
        t.Type, type => type,
        t.Any, v => value(v),
      );
      
    }
  });
  
  const mergedProps = {
    ...superProps,
    ...extendedProps
  };
  
  return mergedProps;
}

export function struct(props, options = {}) {
  const Struct = t.struct(props, options);
  
  /**
  * my extend allows defining of additional properties (when extending 
  * from non-strict structs) *and* refining of existing properties with the
  * principle that if B is an extension of A then any instance that is
  * of type B is also of type A.
  */
  Struct.extend = function (props, options = {}) {
    // deal with options
    
    options = match(options,
      // if options is a string it's the name
      t.String, name => {name},
      // otherwise it should be an object
      // clone it so that we can modify it without potential effects outside
      // this function
      t.Object, {...options},
    );
    
    // merge super struct defaultProps
    options.defaultProps = {
      ...Struct.meta.defaultProps,
      ...options.defaultProps
    };
    
    // handle strictness
    if (_.has(options, 'strict')) {
      // if the super struct is strict, then extended struct must be strict
      // (and also must add no new props) - otherwise we could have a situation
      // where instances were members of the sub struct type but not the super
      // struct type.
      if (Struct.meta.strict && options.strict === false) {
        throw new TypeError(squish(`
          can't create a non-strict sub-struct of strict struct
          ${ t.getTypeName(Struct) }
        `));
      }
    } else {
      // strict is not provided in the options, so inherit from the
      // super struct
      options.strict = Struct.meta.strict;
    }
    
    return struct(
      extendProps(Struct.meta.props, props, Struct.meta.strict),
      options
    );
  }
  
  return Struct;
}