**OBSOLETE**:
this repo has been superseded by <https://github.com/FND/col-deckr>

----

Col. Deckr

a simple UI for tag-based exploration of trading cards


Getting Started
---------------

* ensure [Node](http://nodejs.org) and [Bower](http://bower.io) are installed
* `npm install` und `bower install` download dependencies
* `./server` starts a local WebDAV server
* `gulp styles` and `gulp browserify` compile CSS and JavaScript, respectively -
  this can be automated with `gulp autocompile`
* `mocha` executes the test suite

NB: for local installations of gulp and Mocha, the relative path must be used
    (e.g. `./node_modules/.bin/gulp`)
