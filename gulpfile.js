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
    './bin/core/core-predicates.js',
    './bin/core/core-functions.js',
    './bin/core/core-monads.js',
    './bin/core/core-types.js',
    './bin/core/core-transformable.js',
    './bin/core/core-mappable.js',
    './bin/core/core-appendable.js',
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
