
/**
* @todo this was an attempted start at offering a nicer way to structure
* test files and have the lib help with some of the repetitive tasks.
* 
* I didn't feel happy with it an it's not in use and shouldn't be.
*/
export class Describer {
  constructor(packageRoot) {
    this.packageRoot = packageRoot;
  }
  
  file(path, body): * {
    const exp = require(path.replace(/^\/\//, this.packageRoot + '/'));
    
    return global.describe(`File ${ path }`, (done) => {
      return body(exp, done);
    });
  }
  
  class(cls, body): * {
    return global.describe(`Class ${ cls.name }`, body);
  }
}

export default Describer;
