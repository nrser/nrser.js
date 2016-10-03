#!/usr/bin/env node

const fs = require('fs');
const _ = require('lodash');

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const deps = _.keys(pkg.dependencies);

const devDeps = _.keys(pkg.devDependencies)

const overlap = _.intersection(deps, devDeps);

if (overlap.length > 0) {
  console.error("duplicate dev and regular deps", overlap);
}

const depsCmd = "npm install --save " + deps.join(" ");
const devDepsCmd = "npm install --save-dev " + devDeps.join(" ");

console.log("# install deps:");
console.log(depsCmd);
console.log("");
console.log("# install dev deps:");
console.log(devDepsCmd);