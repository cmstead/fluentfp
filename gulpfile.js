'use strict';

const babel = require('gulp-babel');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');
const iife = require('gulp-iife');

const sourceFiles = [
    './bin/signet-types.js',
    './bin/core-predicates.js',
    './bin/core-functions.js',
    './bin/core-monads.js',
    './bin/core-types.js',
    './bin/core-transformable.js',
    './bin/core-mappable.js',
    './bin/core-appendable.js',
    './bin/fluent-core.js',
    'index.js'
];

const testFiles = [
    'test/**/*.js'
];

gulp.task('compile', () => {
    return gulp.src(sourceFiles)
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('fluentfp.js'))
        .pipe(iife())
        .pipe(gulp.dest('./dist/'))
});

gulp.task('lint', () => {
    return gulp.src(sourceFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('pre-test', function () {
    return gulp.src(sourceFiles)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('test', ['lint', 'pre-test'], function () {
    gulp.src(testFiles, { read: false })
        .pipe(mocha())
        .pipe(istanbul.writeReports({ reporters: ['text-summary'] }))
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 80 } }));
});

gulp.task('build', ['test', 'compile']);
