// Imports
// ===========================================================================

// Deps
import { expect } from 'chai';

// Package
import { itMaps } from 'nrser/lib/testing';
import { tType } from 'nrser/lib/types/type';
import { t } from 'nrser';


// Tests
// ===========================================================================

describe("File //src/types/type.js", function() {
  describe('tType', function() {
    itMaps({
      func: (v) => tType.is(v),
      map: (f, throws) => [
        f(t.String), true,
        f(t.list(t.String)), true,
      ]
    })
  }); // tType
}); // //src/types/type.js
