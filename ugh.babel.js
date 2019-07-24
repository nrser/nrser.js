// OK..!
// 
// This... is *no* *longer* a Babel (ES2015/6/+ or whatever it is now) file.
// Because, on coming back after however long and trying to get this sucker to
// build so I can patch a line or two in the logger, I can't manage to get
// `babel-register` to, well, register and do it's thing. So Ugh crashes trying
// to do *anything*.
// 
// I fixed this by converting the `imports` to Node-style `require`s, 'cause
// that's the only piece in here that Node *still* doesn't *really* support.
// 
// So, I *should* rename the file to `ugh.js`, and that *should* work just 
// fine... but it doesn't. And I'm not going to figure it out, and I'm not 
// going to fix it. I'm going to write this little note to future me, and move
// the hell on.
// 

// import {
//   Ugh,
//   ESDocTask,
// } from '@nrser/ugh';
const { Ugh, ESDocTask } = require( '@nrser/ugh' );

// import getBabelOptions from './config/getBabelOptions';
const getBabelOptions = require( './config/getBabelOptions' );

const ugh = new Ugh({
  packageDir: __dirname,
  
  config: {
    tasks: {
      Babel: {
        options: getBabelOptions('node'),
      },
    },
  },
});

ugh.autoTasks();

// ESDoc generation
ugh.task({
  type: ESDocTask,
  id: 'src',
  configPath: 'config/esdoc.js',
});

// export default ugh;
exports.default = ugh;
