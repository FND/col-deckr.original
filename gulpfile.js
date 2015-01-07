"use strict";

var gulp = require("gulp");
var browserify = require("feta/tasks/browserify");
var sass = require("feta/tasks/sass");
var coffeelint = require("gulp-coffeelint");
var path = require("path");

var paths = {
	sassEntry: "styles/main.scss",
	sassAll: "styles/**/*.scss",
	css: "bundle.css",
	csEntry: "scripts/main.coffee",
	csAll: "scripts/**/*.coffee",
	distro: "dist",
	js: "bundle.js"
};

var jsExtensions = [".coffee"];

gulp.task("autocompile", function() {
	gulp.watch(paths.sassAll, ["styles"]);
	browserify.watchify(paths.csEntry, path.join(paths.distro, paths.js),
			jsExtensions);
});

gulp.task("browserify", browserify(paths.csEntry,
		path.join(paths.distro, paths.js), jsExtensions));

gulp.task("styles", sass(paths.sassEntry, paths.css, paths.distro));

gulp.task("lint", function() {
	gulp.src(paths.csAll).
		pipe(coffeelint()).
		pipe(coffeelint.reporter());
});
