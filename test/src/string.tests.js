import chai, { expect } from 'chai';
import { itMaps2 } from '../../lib/testing.js';

import print from '../../lib/print';

import {
  j,
  deindent,
  lines,
  commonPrefix,
  nonWhitespaceLines,
  findCommonIndent,
  leadingWhitespace,
} from '../../lib/string.js';

describe('string.js', () => {
  describe('.j', () => {
    
    it("works on literals", () => {
      const i = "I";
      const too = 2;
      
      expect(
        j`here ${i} am`
      ).to.equal('here "I" am');
      
      expect(
        j`here ${i} am ${too}`
      ).to.equal('here "I" am 2');
      
    });
    
  }); // describe j()
  
  describe(".lines", () => {
    itMaps2({
      func: lines,
      
      map: (f, throws) => [
        f("a\nb\nc"), ['a', 'b', 'c'],
        f("a\nb\n\nc"), ['a', 'b', '', 'c'],
        f(`
          blah
          blow
        `), ['', '          blah', '          blow', '        '],
      ]
    });
  });
  
  describe(".leadingWhitespace", () => {
    itMaps2({
      func: leadingWhitespace,
      
      map: (f, throws) => [
        f(''), '',
        f('          blah'), '          ',
        f("\t\t \tblah \t"), "\t\t \t",
      ]
    });
  });
  
  describe(".findCommonIndent", () => {
    itMaps2({
      func: findCommonIndent,
      
      map: (f, throws) => [
        f("a\nb\nc"), '',
        f(`
          blah
          blow
        `), '          ',
      ]
    });
  });

  describe(".nonWhitespaceLines", () => {
    itMaps2({
      func: nonWhitespaceLines,
      
      map: (f, throws) => [
        f("a\nb\nc"), ['a', 'b', 'c'],
        f("a\nb\n\nc"), ['a', 'b', 'c'],
        f(`
          blah
          blow
        `), ['          blah', '          blow'],
      ]
    });
  });
  
  
  
  describe('.deindent', () => {
    const obj = {
    	buildDirs: [
    		{
    			dest: "./lib",
    			name: "src",
    			src: "./src/**/*.{js,jsx,es,es6}",
    		},
    		{
    			dest: "./test/lib",
    			name: "test",
    			src: "./test/src/**/*.{js,jsx,es,es6}",
    		}
    	],
    	compileExts: [
    		"js",
    		"jsx",
    		"es",
    		"es6",
    	],
    	testFiles: "./test/lib/**/*.tests.{js,jsx,es,es6}",
    };
    
    const str = print(obj);
    
    console.log(str);
    console.log(deindent(str));
    
    // expect(deindent(str)).to.equal(str);
  });
});