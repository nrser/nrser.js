#!/usr/bin/env node

const Path = require('path');

const PACKAGE_ROOT = Path.resolve(__dirname, '..');

const SRC_DIR = Path.join(PACKAGE_ROOT, 'src');
const LIB_DIR = Path.join(PACKAGE_ROOT, 'lib');

const TEST_DIR = Path.join(PACKAGE_ROOT, 'test');
const TEST_SRC_DIR = Path.join(TEST_DIR, 'src');
const TEST_LIB_DIR = Path.join(TEST_DIR, 'lib');

function resolve() {
  return Path.resolve.apply(
    Path,
    [PACKAGE_ROOT].concat(Array.from(arguments))
  );
}

module.exports = {
  PACKAGE_ROOT,
  SRC_DIR,
  LIB_DIR,
  TEST_DIR,
  TEST_SRC_DIR,
  TEST_LIB_DIR,
  resolve,
}

if (require.main === module) {
  const argv = require('minimist')(process.argv.slice(2));
  
  console.log(JSON.stringify(module.exports, null, 2));
}
