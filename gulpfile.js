var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var post = require('postcss-load-plugins')();
var browser = require('browser-sync');
var rimraf = require('rimraf');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var panini = require('panini');
var yargs = require('yargs');

var PRODUCTION = !!(yargs.argv.production);

gulp.task('clean', function (done) {
  rimraf('dist', done);
});

gulp.task('pages', function () {
  return gulp.src('src/pages/**/*.html')
  .pipe(panini({
    root: 'src/pages',
    layouts: 'src/layouts',
    partials: 'src/partials',
    helpers: 'src/helpers'
  }))
  .pipe(gulp.dest('dist'));
});

gulp.task('server', function (done) {
  browser.init({
    injectChanges: true,
    server: 'dist',
    open: false,
    domain: 'http://localhost:3000'
  });
  done();
});

gulp.task('css', function () {
  var CONFIG = [];

  if (!PRODUCTION) {
    CONFIG = [
      post.import,
      post.customMedia,
      post.customProperties,
      post.calc,
      post.colorFunction,
      post.discardComments,
      autoprefixer
    ];
  } else {
    CONFIG = [
      post.import,
      post.customMedia,
      post.customProperties,
      post.calc,
      post.colorFunction,
      post.discardComments,
      autoprefixer,
      cssnano
    ];
  }

  return gulp.src('src/assets/css/app.css')
  .pipe($.if(!PRODUCTION, $.sourcemaps.init()))
  .pipe($.postcss(CONFIG))
  .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
  .pipe(gulp.dest('dist/css'));
});

gulp.task('resetPages', function (done) {
  panini.refresh();
  done();
});

gulp.task('images', function () {
  return gulp.src('src/assets/img/**/*')
    .pipe($.imagemin())
    .pipe(gulp.dest('./dist/assets/img'));
});

gulp.task('watch', function () {
  gulp.watch('src/pages/**/*.html').on('change', gulp.series('pages', browser.reload));
  gulp.watch(['src/layouts/**/*', 'src/partials/**/*']).on('change', gulp.series('resetPages', 'pages', browser.reload));
  gulp.watch(['../css/**/*.css', 'src/assets/css/**/*.css']).on('change', gulp.series('resetPages', 'css', 'pages', browser.reload));
  gulp.watch('src/assets/img/**/*').on('change', gulp.series('images', browser.reload));
});

gulp.task('default', gulp.series('clean', 'pages', 'css', 'server', 'watch'));
