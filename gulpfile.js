const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const del = require("del");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series("copy")).on("change", sync.reload);
}

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel:3}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.svgo({
        plugins: [
            {cleanupIDs: false},
            {removeUselessDefs: false}
        ]
      })
    ]))
    .pipe(gulp.dest("source/img"))
}

exports.images = images;

//WebP

const webP = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"))
}

exports.webP = webP;

//Copy

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico",
    "source/*.html"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
}

exports.copy = copy;

//Clean(Del)

const clean = () => {
  return del("build");
}

exports.clean = clean;

// Build

const build = gulp.series(
  clean,
  copy,
  styles,
  images,
  webP
);

exports.build = build;

exports.default = gulp.series(
  build, server, watcher
);
