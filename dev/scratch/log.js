#!/usr/bin/env babel-node

import 'source-map-support/register';

import * as NRSER from 'nrser';
import 'nrser/lib/metalogger';

function main() {

  const error = new NRSER.NrserError('blah', {x: 1, y: "WHY?!?!"});

  error: "Oh no!", error;
  warn: "Whoa there...";
  info: "BTW..."
  debug: "bug bug bug bug";
  trace: "blah blah blah";
}

main();