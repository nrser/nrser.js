const packageJson = require('../package.json');
const semver = require('semver');

const version = semver(packageJson.version);
const release = `${ version.major }.${ version.minor }.${ version.patch }`;

module.exports = {
  release,
  title: "nrser",
  source: "src",
  destination: `doc/site/versions/${ release }`,
  experimentalProposal: {
    "classProperties": true,
    "objectRestSpread": true,
    "exportExtensions": true,
    "dynamicImport": true
  },
  parserPlugins: [
    "flow"
  ],
  styles: [
    "doc/support/esdoc/style.css",
  ],
  scripts: [
    "doc/support/esdoc/script.js",
  ],
}
