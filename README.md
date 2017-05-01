nrser.js
========

my js utils. pretty big mess right now. don't recommend other people using it quite yet.

version
-------

### 0.6.X

Current version.

`mergeNoConflict` was renamed to `assemble` and now throws `KeyError` when it fails.

The `//src/testing.js` file was moved to `//src/testing/index.js` in preparation for it being broken up and other files added. This should not be a problem since it should be imported as `nrser/lib/testing` either way, but any imports that used the `.js` extension will need to be updated.

### 0.5.X

`data/Entity` is removed (now `Model` in `@nrser/supermodel`). it was moved to `types/Model` in `0.5.0` but nothing used that so i just kept going with the `0.5.X` versions after removing it.

### 0.4.X

`ugh` is broken out into the [@nrser/ugh][ugh] package. other than that no major changes.

[ugh]: https://github.com/nrser/ugh

### 0.3.X

`0.3.0` happen when i switched `Ugh` (wrapper around [gulp][] to improve incremental build reliability) to be better able to include tasks from submodules. this is important because i often have stuff split out into separate repos and want one process to be able to manage all of them. this change also moved `Ugh` to a tiered watching system where build tasks watch files, and higher-level tasks watch build tasks - so Mocha listens for builds to start and runs when they're all complete, instead of watching files in `lib` and reacting when they change.

[gulp]: https://github.com/gulpjs/gulp

### 0.2.X

this is where `Ugh` got introduced to replace the old `lib/gulpTasks.js` stuff. i don't intend to keep developing the [v0.2][] branch, but it exists so that quick fixes can be made for things that are still using a `0.2.X` version and don't want to migrate at the time.

[v0.2]: https://github.com/nrser/nrser.js/tree/v0.2

### 0.1.X

the [v0.1][] branch, like the [v0.2][] branch, exists to avoid migrating packages that depend on it until desired and facilitate occasional quick fixes.

[v0.1]: https://github.com/nrser/nrser.js/tree/v0.1

