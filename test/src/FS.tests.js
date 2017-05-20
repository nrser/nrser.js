import { expect, itMaps, _, NRSER } from '//test/src/testHelpers';

describe('File //src/FS.js', function() {
  describe('isDir()', function() {
    
    const tests = function() {
      it("returns a promise when no callback provided", function() {
        const promise = NRSER.FS.isDir(this.path);
        
        expect(typeof promise.then).to.equal('function');
        
        return promise.then((result) => {
          expect(result).to.equal(this.result);
        });
      });

      it("returns undefined and invokes callback when provided", function(done) {
        const rtn = NRSER.FS.isDir(this.path, (err, result) => {
          expect(result).to.equal(this.result);
          done();
        });
        
        expect(rtn).to.be.undefined;
      });
    }
    
    context("path is directory", function() {
      before(function() {
        this.path = __dirname;
        this.result = true;
      });
      
      tests();
    }); // path is dir
    
    context("path is file", function() {
      before(function() {
        this.path = __filename;
        this.result = false;
      });
      
      tests();
    }); // path is file
    
    context("path doesn't exist", function() {
      before(function() {
        this.path = `${ __filename }.not.there`;
        this.result = false;
      });
      
      tests();
    }); // path doesn't exist
    
  }); // isDir()
  
  
  describe('isDirSync()', function() {
    context("path is directory", function() {
      expect(NRSER.FS.isDirSync(__dirname)).to.be.true;
    }); // path is dir
    
    context("path is file", function() {
      expect(NRSER.FS.isDirSync(__filename)).to.be.false;
    }); // path is file
    
    context("path doesn't exist", function() {
      expect(NRSER.FS.isDirSync(`${ __filename }.not.there`)).to.be.false;
    }); // path doesn't exist
  }); // isDirSync()
}); // File //src/FS.js