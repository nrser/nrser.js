#!/usr/bin/env node

/**
* Babel Options
* 
* Used to dynamically generate options for the Babel compiler in place of a
* static `.babelrc`.
* 
* `module.exports` is the {@link getBabelOptions} function.
* 
* **IMPORTANT**
* 
* This is a configuration file - think of it more like a `JSON` file that has
* support for conditionals, loops, variables and functions rather than a piece
* of source code.
* 
* In order to simplify the build process and avoid more dependency-entangled
* layers and chicken/egg problems, this file should be run-able by the 
* relevant Node version without any additional libraries.
* 
* This means:
* 
* 1.  No Babel transformation.
* 2.  No requiring any NPM packages, especially any local sub-packages.
*/

const Paths = require('./Paths');

function env(target, nodeEnv) {
  if (target === 'webpack') {
    return {modules: false};
  } else if (target === 'node') {
    return {
      targets: {
        node: 'current',
      },
    };
  } else {
    return {};
  }
}

function sourceMaps(target, nodeEnv) {
  return nodeEnv !== 'production';
}


function metalog(target, nodeEnv) {
  return {
    strip: {
      labels: (nodeEnv === 'production' ? {
        // in NODE_ENV=production...
        
        // strip debug and trace 
        debug: true,
        trace: true,
        debugRefs: true,
        traceRefs: true,
        
        // strip all notifs (though we don't even use 'em at the moment)
        notif: true,
        debugNotif: true,
        traceNotif: true,
      } : {
        // leave everything in the source in all other NODE_ENV
      }), // labels
    }, // strip
    
    extraLabels: [
      // *Refs for logging references (instead of value snapshots) in browser.
      // 
      // Supported in nrser.metalogger 
      // 
      "notif",
      "errorRefs",
      "warnRefs",
      "infoRefs",
      "debugRefs",
      "traceRefs",
    ],
  };
} // metalog()

/**
* Get options for [babel-plugin-module-resolver][] that allow for really 
* convenient import path resolution at compile-time.
* 
* Makes it so you can use:
* 
* 1.  `//` in place of the package root.
*     
*     In source files (`//src`):
*     
*         import Blah from '//src/some/path/Blah';
*     
*     becomes
*     
*         import Blah from '../<whatever>/../some/path/Blah';
*     
*     It's resolving as a relative path, so this works when the file is
*     being run in `//src` **or** `//lib`.
*     
*     In test files (`//test/src`):
*     
*         import Blah from '//lib/some/path/Blah';
*     
*     becomes
*     
*         import Blah from '../<whatever>/../lib/some/path/Blah';
*     
*     **NOTE** We need to use `//lib` instead of `//src` because we want to 
*     point to the transformed code in `//lib`. If we wanted to point to the 
*     actual source files from *outside* of `//src`, we would use `//src`.
*     
*     In either:
*     
*         import Paths from '//config/Paths';
*         import '//package.json';
*     
*     (or whatever other path you like).
*     
* 2.  `@nrser/supremodel-static` and `@nrser/supermodel-static/lib` (or 
*     whatever the package name is) both resolve to `//lib`.
*     
*     This means you **should not use them in `//src` files** because you 
*     will end up getting pointed to `//lib`, when you want the relative
*     link to the other file in `//src`, but it might be nice for tests.
*/
function getModuleResolverOptions() {
  const packageName = require('../package.json').name;
  
  return {
    alias: {
      // (1) from above:
      '/':                      '.',
      
      // (2) from above:
      [`${ packageName }/lib`]: './lib',
      [packageName]:            './lib',
    },
    // all this is relative to the package.json file
    // cwd: "packagejson",
    cwd: Paths.PACKAGE_ROOT,
  };
}

/**
* Get a Babel options object for a target and Node environment.
* 
* @param {string} target
*   Who is going to use the options. Special conditionals are present for
*   `'webpack`' to leave `import` and `export` statements in transformed
*   source.
* 
* @param {?string} nodeEnv
*   The `NODE_ENV` to get options for. We assume `'development'` if
*   not provided and `process.env.NODE_ENV` is not set.
*   
* @return {Object}
*   [Babel options](https://babeljs.io/docs/usage/api/#options).
*   
*/
function getBabelOptions(
  target = 'node',
  nodeEnv = (process.env.NODE_ENV || 'development')
) {
  const options = {
    // ignored when it's in .babelrc but **IMPORTANT** when used in scripts
    // to prevent weirdness.
    babelrc: false,
    
    // commenting this out fixes the "Invalid _c" Babel error...
    // tcomb wanted it, but it seems to work ok without?
    // passPerPreset: true,
    
    presets: [
      'stage-2',
      'react',
      ['env', env(target, nodeEnv)],
    ],
    
    sourceMaps: sourceMaps(target, nodeEnv),
    
    plugins: [
      "transform-export-extensions",
      
      ["module-resolver", getModuleResolverOptions(target, nodeEnv)],
      
      ["metalog", metalog(target, nodeEnv)],
      
      "syntax-flow",
      
      ["tcomb", {
        skipAsserts: true,
        globals: [
          {Class: true},
        ],
      }],
      
      "transform-flow-strip-types",
    ], // plugins
  };
  
  return options;
} // babelOptions()

module.exports = getBabelOptions;

// Dump options to STDOUT in JSON format if run as script
// 
// To populate `.babelrc`:
// 
//    ./dev/config/getBabelOptions.js > .babelrc
// 
if (require.main === module) {
  const argv = require('minimist')(process.argv.slice(2));
  
  const options = getBabelOptions(argv.target, argv.nodeEnv);
  
  console.log(JSON.stringify(options, null, 2));
}
