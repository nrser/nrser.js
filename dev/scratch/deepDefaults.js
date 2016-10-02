// doesn't seem to work :(

class GulpTasks {
  constructor({
    name = getName(),
    
    babel = {
      exts = ['js', 'jsx', 'es', 'es6'],
      
      src = {
        src = './src',
        dest = './lib',
      },
      
      test = {
        src = './test/src',
        dest = './test/lib',
      },
    },
    
  }) {
    
  }
}
