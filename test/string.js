import chai from 'chai';
import { j } from '../src/string.js';

describe('string.js', () => {
  describe('j()', () => {
    
    it("works on literals", () => {
      const i = "I";
      const too = 2;
      
      chai.expect(
        j`here ${i} am`
      ).to.equal('here "I" am');
      
      chai.expect(
        j`here ${i} am ${too}`
      ).to.equal('here "I" am 2');
      
    });
    
  }); // describe j()
});