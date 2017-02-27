require('dotenv').config({silent: true});
const path = require('path');
const del = require('del');
const gulp = require('gulp');
// const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint');
const cssnano = require('gulp-cssnano');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
// const minifyHtml = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const assetsInjector = require('gulp-assets-injector')();
const sass = require('gulp-sass');
const runSequence = require('run-sequence');
const rev = require('gulp-rev');

// Config Environment
const DIST = 'dist';
const isProd = process.env.NODE_ENV === 'production';

// delete 'dist' directory
// gulp.task('clean', () => del(DIST));


gulp.task('sass', () => {
  let stream = gulp.src(['src/scss/*.scss'])
    .pipe(sass({outputStyle: 'expanded'}))  // nested, expanded, compact, compressed
    .on('error', sass.logError)
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
  if (isProd) {
    stream = stream.pipe(sass({outputStyle: 'compressed'}))
      .on('error', sass.logError)
      .pipe(rev())
      .pipe(gulp.dest('dist/css'))
      .pipe(rev.manifest({
        merge: true
      }))
      .pipe(gulp.dest('dist/rev/css'));
  }
  return stream;
});

// inspect JS
gulp.task('jshint', function () {
  return gulp.src('src/js/*.js')
  .pipe(babel({
   presets: ['es2015']
   }))
   .pipe(gulp.dest('src/js'));
});

// synchronize browser
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./src/"
    }
  })
});

// Watch Files For Changes
gulp.task('watch', ['browserSync', 'sass', 'jshint'], function() {
  gulp.watch(['src/**/*.js']).on('change', browserSync.reload);
  gulp.watch(['src/**/*.html']).on('change', browserSync.reload);
  gulp.watch('src/scss/*.scss', ['sass']);
});

// run dev build sequence
gulp.task('dev', function (callback) {
  runSequence(
    ['watch', 'sass', 'uglify', 'browserSync'],
    callback
  )
});
gulp.task('default', function() {
  runSequence('dev');
});

// uglify JS and pipe to dist
gulp.task('uglify', function() {
  return gulp.src('src/js/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    // .pipe(revCollector({replaceReved: true}))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('dist/js'))
    .pipe(rev.manifest({
      merge: true
    }))
    .pipe(gulp.dest('dist/rev/js'));
});

// compile sass and pipe to dist
gulp.task('sass-prod', function () {
  return gulp.src('src/scss/*.scss')
    .pipe(browserSync.reload({
      stream: true
    }))
    // .pipe(revCollector({replaceReved: true}))
    .pipe(sass({outputStyle: 'compressed'}))
    .on('error', sass.logError)
    .pipe(rev())
    .pipe(gulp.dest('dist/css'))
    .pipe(rev.manifest({
      merge: true
    }))
    .pipe(gulp.dest('dist/rev/css'))
});

// minify images
gulp.task('images-prod', function () {
  return streamqueue({objectMode: true},
    gulp.src(['src/assets/**/*.+(png|jpg|jpeg|gif|svg)'])
      .pipe(gulp.dest('dist/assets'))
  )
});

// copy html and common resources to dist
gulp.task('copy', function () {
  return streamqueue({objectMode: true},
    gulp.src(
      ['src/**/*.html', 'src/assets/**/*.*'],
      {base: 'src'})
      .pipe(gulp.dest('dist/'))
  )
});

// update all file names with md5-suffixed ones
gulp.task('rev', function () {
  return streamqueue({objectMode: true},
    // 更新html中引用的所有资源的路径
    gulp.src(['dist/rev/**/*.json', 'dist/*.html'])
      .pipe(revCollector({replaceReved: true}))
      .pipe(gulp.dest('dist/'))
    // 更新css中引用的图片的路径
    /*gulp.src(['dist/rev/images/!*.json', 'dist/css/!*.css'])
     .pipe(revCollector({replaceReved: true}))
     .pipe(gulp.dest('dist/css/'))*/
  )
});

// clean up unused generated files
gulp.task('clean', function() {
  return del.sync('dist');
});

gulp.task('browserSync-prod', function() {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  })
});

// Watch Files For Changes
gulp.task('watch-prod', ['browserSync-prod'], function() {
  gulp.watch(['src/js/*.js']).on('change', browserSync.reload);
  gulp.watch(["src/**/*.html"]).on('change', browserSync.reload);
  gulp.watch('src/scss/*.scss', ['sass']);
});


gulp.task('prod', function (callback) {
  runSequence(
    ['clean', 'uglify', 'sass-prod','images-prod', 'copy'],'rev',
    callback
  )
});