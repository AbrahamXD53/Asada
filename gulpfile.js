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
       return gulp.src([
            'src/engine/core.js',
            'src/engine/audio.js',
            'src/engine/engine-defaults.js',
            'src/engine/font.js',
            'src/engine/gameloop.js',
            'src/engine/input.js',
            'src/engine/physics.js',
            'src/engine/resource-map.js',
            'src/engine/text-file-loader.js',
            'src/engine/texture.js',
            'src/engine/vertex-buffer.js',
            'src/common/network.js',
            'src/common/shaders.js',
            'src/common/utils.js',
            'src/components/component.js',
            'src/components/renderer/renderer.js',
            'src/components/renderer/texture-renderer.js',
            'src/components/renderer/sprite-renderer.js',
            'src/components/renderer/light-renderer.js',
            'src/components/renderer/illum-renderer.js',
            'src/components/renderer/map-renderer.js',
            'src/components/renderables/font-renderable.js',
            'src/components/particle-emiter.js',
            'src/components/animation.js',
            'src/components/animator.js',
            'src/components/physics-component.js',
            'src/components/transform.js',
            'src/objects/camera.js',
            'src/objects/light.js',
            'src/objects/scene.js',
            'src/objects/game-objects/game-object.js',
            'src/objects/game-objects/particle.js',
            'src/objects/game-objects/tiled-game-object.js',
            'src/objects/game-objects/parallax-game-objects.js'
        ])
            .pipe(concat('app.js'))
            .pipe(minify())
            .pipe(gulp.dest('build'))
}

function minSource() {
        return gulp.src(['js/simple.js', 'js/index.js'])
            .pipe(concat('game.js'))
            .pipe(minify())
            .pipe(gulp.dest('build'))
}

function concatDependenciesMin() {
    return gulp.src(['lib/min/twgl-full.min.js', 'lib/min/decomp.min.js', 'lib/min/matter.min.js', 'lib/min/matter-collision-events.min.js','lib/min/stats.min.js'])
        //.pipe(watch('lib/*.js'))
        .pipe(concat('dependencies.js'))
        .pipe(gulp.dest('build'))
}

function concatDependencies() {
    return gulp.src(['lib/twgl-full.js', 'lib/decomp.js', 'lib/matter.js', 'lib/matter-collision-events.js','lib/stats.js'])
        .pipe(watch('lib/*.js'))
        .pipe(concat('dependencies.js'))
        .pipe(gulp.dest('build'))
}

gulp.task('compress', function () {
    return gulp.src(['build/dependencies.js', 'build/app-min.js', 'build/game-min.js'])
        //.pipe(watch('build/app-min.js'))
        .pipe(concat('final.js'))
        .pipe(javascriptObfuscator())
        .pipe(gulp.dest('build'))
});