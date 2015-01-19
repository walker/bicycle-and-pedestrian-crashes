var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    csscmq = require('gulp-combine-media-queries'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    imageResize = require('gulp-image-resize'),
    iconify = require('gulp-iconify');
var paths = {
  scripts: ['js/src/*.js', 'js/vendor/*.js'],
  styles: 'sass/*'
};

function eatError (error) {
  console.log(error.toString());
  this.emit('end');
}
// gulp.task('styles', function() {
//   gulp.src('sass/style.scss')
//     .pipe(sass({sourcemap: false, style: 'expanded', 'sourcemap=none': true}))
//     .on('error', eatError)
//     .pipe(csscmq({log: true}))
//     .pipe(rename({suffix: '.unmin'}))
//     .pipe(gulp.dest('css'))
//     .pipe(minifycss({keepSpecialComments:1}))
//     .pipe(rename('style.css'))
//     .pipe(gulp.dest(''));
// });
gulp.task('scripts', function() {
  var script = gulp.src(['js/main.js'])
    .pipe(concat('main.combined.js'))
    .on('error', eatError)
    .pipe(gulp.dest('js'))
    .pipe(rename('main.min.js'))
    .pipe(uglify())
  .pipe(gulp.dest('js'));
});
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  // gulp.watch(paths.styles, ['styles']);
});

gulp.task('default', ['scripts']); // 'watch', 'styles'