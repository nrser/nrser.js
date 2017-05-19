
// package
import { expect, itMaps, _, NRSER } from '//test/src/testHelpers';

describe('path.js', function() {
  // Types
  // ========================================================================
  
  /** @test {NormPath} */
  describe('tNormPath', function() {
    itMaps({
      func: NRSER.Path.tNormPath.is,
      map: (f, throws) => [
        // got '..'
        f('temp/../blah'), false,
        f(NRSER.Path.normalize('temp/../blah')), true,
        
        // got '.'
        f('temp/../blah'), false,
        f(NRSER.Path.normalize('temp/../blah')), true,
        
        // is '.' -- this is ok, it's what Path.normalize('') returns`
        f('.'), true,
        
        // the empty string is NOT ok though
        f(''), false,
        
        // empty segments
        f('/etc//x'), false,
        
        // root counts
        f('/'), true,
        
        f('/Users/nrser'), true,
        
        f(process.env.HOME), true,
        
        f(NRSER.Path.expand('~')), true,
      ]
    })
  }); // tNormPath
  
  
  /** @test {AbsPath} */
  describe('tAbsPath', function() {
    itMaps({
      func: NRSER.Path.tAbsPath.is,
      map: (f, throws) => [
        f('/'), true,
        f(''), false,
        f('~'), false,
        f(NRSER.Path.expand('~')), true,
      ]
    })
  }); // tAbsPath
  
  
  /** @test {ResPath} */
  describe('tResPath', function() {
    itMaps({
      func: NRSER.Path.tResPath.is,
      map: (f, throws) => [
        f('/'), true,
        f('//'), false,
        f('~'), false,
        f(NRSER.Path.expand('~')), true,
      ]
    })
  }); // tResPath
  
  
  /** @test {TildePath} */
  describe('tTildePath', function() {
    itMaps({
      func: NRSER.Path.tTildePath.is,
      map: (f, throws) => [
        f('~'), true,
        f('~/.././x'), true,
        f('/'), false,
        f(NRSER.Path.expand('~')), false,
      ]
    })
  }); // tTildePath
  
  
  /** @test {Dir} */
  describe('tDir', function() {
    itMaps({
      func: NRSER.Path.tDir.is,
      map: (f, throws) => [
        // root is a dir
        f('/'), true,
        
        // and the dir we're in
        f('./'), true,
        
        // even if it doesn't end with /
        f('.'), true,
        
        // we take the empty string to mean the current directory, so it
        // is a directory as well
        f(''), true,
        
        // and the dir above us
        f('../'), true,
        
        // even if it doesn't end with /
        f('..'), true,
        
        // we don't check the file system, so we don't know if these are dirs
        f('x/y/z'), false,
        f('/x/y'), false,
        
        // but we know these are
        f('x/y/z/'), true,
        f('x/y//z/'), true,
        
        // what about tilde paths?
        // 
        // if it ends with / it's easy
        f('~/'), true,
        // and this most certainly isn't
        f('./~'), false,
        // but what about just ~?
        // 
        // it *expands* to a directory, but it doesn't *resolve* to one...
        f('~'), false,
      ]
    })
  }); // tDir
  
  
  /** @test {NormDir} */
  describe('tNormDir', function() {
    itMaps({
      func: NRSER.Path.tNormDir.is,
      map: (f, throws) => [
        // root dir is normal
        f('/'), true,
        
        // and the dir we're in
        f('.'), true,
        
        // parent is a dir but is not normalized!
        f('..'), false,
        
        f('x/y/z'), false,
        f('x/y/z/'), true,
        f('x/y//z/'), false,
      ]
    })
  }); // tNormDir
  
  
  /** @test {AbsDir} */
  describe('tAbsDir', function() {
    itMaps({
      func: NRSER.Path.tAbsDir.is,
      map: (f, throws) => [
        // root dir is absolute
        f('/'), true,
        
        // working dir is not absolute
        f('.'), false,
        
        // nor is parent dir
        f('..'), false,
        
        // AbsPath but not a Dir
        f('/x/y/z'), false,
        
        // AbsPath and Dir
        f('/x/y/z/'), true,
        
        // does not need to be normalized
        f('/x/y//z/'), true,
        f('/x/y/../z/'), true,
      ]
    })
  }); // tAbsDir
  
  /** @test {ResDir} */
  describe('tResDir', function() {
    itMaps({
      func: NRSER.Path.tResDir.is,
      map: (f, throws) => [
        // root dir is resolved
        f('/'), true,
        
        // working dir is not resolved
        f('.'), false,
        
        // nor is parent dir
        f('..'), false,
        
        // resolved path but not a Dir
        f('/x/y/z'), false,
        
        // resolved path and Dir
        f('/x/y/z/'), true,
        
        // needs to be normalized
        f('/x/y//z/'), false,
        f('/x/y/../z/'), false,
      ]
    })
  }); // tResDir
  
  
  /** @test {TildeDir} */
  describe('tTildeDir', function() {
    itMaps({
      func: NRSER.Path.tTildeDir.is,
      map: (f, throws) => [
        f('~'), false,
        f('~/'), true,
      ]
    })
  }); // tTildeDir  
  
  
  /** @test {split} */
  describe('split()', function() {
    itMaps({
      func: NRSER.Path.split,
      map: (f, throws) => [
        // easy case
        f('x/y/z'), ['x', 'y', 'z'],
        
        // what to do about leading /?
        f('/x/y/z'), ['', 'x', 'y', 'z'],
      ]
    });
  }); // split()
  
  
  /** @test {expand} */
  describe('expand()', function() {
    itMaps({
      func: NRSER.Path.expand,
      map: (f, throws) => [
        f('~'), process.env.HOME,
        f('.'), NRSER.Path.resolve(),
        f(''), NRSER.Path.resolve(),
        f('/etc', 'x', 'y'), '/etc/x/y',
        f('/etc', '~/temp', 'blah'), `${ process.env.HOME }/temp/blah`,
        f('/x/y'), '/x/y',
        
        // need to be careful / aware of ~ paths
        f('/x', '~', 'y'), `${ process.env.HOME }/y`,
        f('/x', '~y', 'z'), '/x/~y/z',
      ]
    });
  }); // expand()
  
  
  /** @test {commondBase} */
  describe('.commonBase()', function() {
    itMaps({
      func: NRSER.Path.commonBase,
      map: (f, throws) => [
        // entire path is common if there's only one
        f('/x/y/z'), '/x/y/z',
        
        // returns the absolute path
        f('x'), NRSER.Path.resolve('x'),
        
        // basic test
        f('/x/y/z', '/x/y'), '/x/y',
        
        // mess with slashes
        f('/x/y/z/', '/x/y'), '/x/y',
        f('/x/y/z/', '/x/y/'), '/x/y',
        f('/x/y/z/', '/x/y/'), '/x/y',
        f('//x/y//z/', '/x/////y/'), '/x/y',
        
        // relative
        f('x/y', 'x/y/z'), NRSER.Path.resolve('x/y'),
        f('.', 'x'), NRSER.Path.resolve(),
        
        // no common base
        // actually, 
        f('/x/y', 'x/y'), undefined,
        
        // > 2 paths
        f('/x/y/z/', '/x/y', '/x//y/w', '/x'), '/x',
      ]
    });
  }); // commonBase()
  
  
  /** @test {toDir} */
  describe('toDir()', function() {
    itMaps({
      func: NRSER.Path.toDir,
      map: (f, throws) => [
        // leaves Dir alone
        f('/'), '/',
        f('.'), '.',
        f(''), '',
        f('x/y/z/'), 'x/y/z/',
        
        // adds slash to non-Dir
        f('x/y'), 'x/y/',
        
        // barfs on non-string
        f(), throws(TypeError, /Invalid value undefined/),
        f(1), throws(TypeError, /Invalid value 1/),
      ]
    });
  }); // toDir()
  
  
  /** @test {@link resolveDir} */
  describe('resolveDir()', function() {
    itMaps({
      func: NRSER.Path.resolveDir,
      map: (f, throws) => [
        f(), process.cwd() + '/',
        f('/etc/x', 'y'), '/etc/x/y/',
        
        // NOTE uses resolve, so doesn't expand ~
        f('~'), NRSER.Path.join(process.cwd(), '~') + '/',
      ]
    });
  }); // resolveDir()
  
  
  /** @test {@link expandDir} */
  describe('expandDir()', function() {
    itMaps({
      func: NRSER.Path.expandDir,
      map: (f, throws) => [
        f(), process.cwd() + '/',
        f('/etc/x', 'y'), '/etc/x/y/',
        f('~'), process.env.HOME + '/',
      ]
    });
  }); // expandDir()
  
}); // path.js
