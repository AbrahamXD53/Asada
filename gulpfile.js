const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const watch = require('gulp-watch');
const uglify = require('gulp-uglify');
const javascriptObfuscator = require('gulp-javascript-obfuscator');

gulp.task('default', minifySource);
gulp.task('min-dep', concatDependenciesMin);
gulp.task('source', minSource);
gulp.task('dep', concatDependencies);

function minifySource() {
    return watch('src/*.js', function () {
        gulp.src('src/*.js')
            .pipe(concat('app.js'))
            .pipe(minify())
            .pipe(gulp.dest('build'))
    });
}

function minSource() {
    return watch('js/*.js', function () {
        gulp.src(['js/simple.js', 'js/index.js'])
            .pipe(concat('game.js'))
            .pipe(minify())
            .pipe(gulp.dest('build'))
    });
}

function concatDependenciesMin() {
    return gulp.src(['lib/min/twgl-full.min.js', 'lib/min/decomp.min.js', 'lib/min/matter.min.js', 'lib/min/matter-collision-events.min.js'])
        .pipe(watch('lib/*.js'))
        .pipe(concat('dependencies.js'))
        .pipe(gulp.dest('build'))
}

function concatDependencies() {
    return gulp.src(['lib/twgl-full.js', 'lib/decomp.js', 'lib/matter.js', 'lib/matter-collision-events.js'])
        .pipe(watch('lib/*.js'))
        .pipe(concat('dependencies.js'))
        .pipe(gulp.dest('build'))
}

gulp.task('compress', function () {
    return gulp.src(['build/dependencies.js','build/app-min.js','build/game-min.js'])
        .pipe(watch('build/app-min.js'))
        .pipe(concat('final.js'))
        .pipe(javascriptObfuscator())
        .pipe(gulp.dest('build'))
});