const Ugh = require('./lib/ugh').Ugh;

const ugh = new Ugh({packageDir: __dirname});

ugh.autoTasks();

module.exports = ugh;
