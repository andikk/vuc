"use strict";

var gulp = require("gulp");
var saas = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require("gulp-imagemin");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var del = require("del");


gulp.task("css", function () {
  return gulp.src("source/scss/main.scss")
    .pipe(plumber())
    .pipe(saas())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/scss/**/*.scss", gulp.series("css"));
  gulp.watch("source/js/bundle/*.js", gulp.series("js"));
  gulp.watch("source/*.html").on("change", server.reload);
  gulp.watch("source/js/bundle/*.js").on("change", server.reload);
});

gulp.task("clean", function (done) {
  return del("build");
  done();
});

gulp.task("style", function (done) {
  gulp.src("source/scss/main.scss")
    .pipe(plumber())
    .pipe(saas())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
    done();
});

gulp.task("images", function (done) {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
    imagemin.optipng({
        optimizationLevel: 3
      }),
    imagemin.jpegtran({
        progressive: true
      }),
    imagemin.svgo()
  ]))
    .pipe(gulp.dest("source/img"));
    done();
});

gulp.task("copy", function (done) {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.html",
    "source/css/*.css"

  ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
    done();
});


gulp.task("js", function() {
  return gulp.src([
    "source/js/bundle/custom.js",
  ])
    .pipe(concat("bundle.js"))
    .pipe(uglify())
    .pipe(gulp.dest("source/js"));
  done();
});

gulp.task("del-vendor-folder", function (done) {
  return del("build/js/bundle");
  done();
});

gulp.task('build', gulp.series('clean', 'style', 'images', 'copy', "del-vendor-folder", "js", function (done) {
  done();
}));

gulp.task("start", gulp.series("css", "copy", "js", "server"));
