import chai, { expect } from 'chai';
import { itMaps } from '//lib/testing';

import print from '//lib/print';

import {
  j,
  deindent,
  lines,
  commonPrefix,
  nonWhitespaceLines,
  findCommonIndent,
  leadingWhitespace,
  squish,
} from '//lib/string.js';

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
  
  describe('.squish', () => {
    it("can be called as a function", () => {
      expect(squish(`
        a
        b
        c
      `)).to.equal('a b c');
    });
    
    it("can be called as a template literal", () => {
      expect(squish`
        a
        b
        c
      `).to.equal('a b c');
    });
  });
  
  describe(".lines", () => {
    itMaps({
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
    itMaps({
      func: leadingWhitespace,
      
      map: (f, throws) => [
        f(''), '',
        f('          blah'), '          ',
        f("\t\t \tblah \t"), "\t\t \t",
      ]
    });
  });
  
  describe(".findCommonIndent", () => {
    itMaps({
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
    itMaps({
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
  
  describe('.deindent', function() {
    it("doesn't modify output of print", function() {
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
      // 
      // console.log(str);
      // console.log(deindent(str));
      
      expect(deindent(str)).to.equal(str);
    });
    
    it("doesn't leave empty lines with spaces", function() {
      
      const raw = `
        /**
        * some stuff
        */
      `;
      
      const expected = [
        "",
        "/**",
        "* some stuff",
        "*/",
        "",
      ].join("\n");
      
      expect(deindent(raw)).to.equal(expected);
    });
    
    it(
      "gets weird when whitespace lines don't share the common indent",
      function() {
        // Of course it's tabs vs spaces that cause the problem...
        
        // Indent is only one character.
        const indent = "\t";
        
        const lines = [
          `\tf(x) {`,
          "\t  x + 1;",
          // Then someone breaks the common indent on a whitespace line
          "    ",
          "\t}",
        ];
        
        expect(deindent(lines.join("\n"))).to.equal([
          "f(x) {",
          "  x + 1;",
          // And the result is a whitespace line that sticks out more than 
          // you probably want it to (you probably want this to be '  ').
          // 
          // But that's your fault. Don't mix tabs and spaces.
          "   ",
          "}",
        ].join("\n"));
      }
    );
  });
});