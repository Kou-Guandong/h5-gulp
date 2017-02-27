require('dotenv').config({silent: true});
const path = require('path');
const del = require('del');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint');
const cssnano = require('gulp-cssnano');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const minifyHtml = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const assetsInjector = require('gulp-assets-injector')();
const sass = require('gulp-sass');

// Config Environment
const DIST = 'dist';
const isProd = process.env.NODE_ENV === 'production';

gulp.task('clean', () => del(DIST));