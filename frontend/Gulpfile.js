const gulp = require('gulp');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const ngHtml2Js = require('gulp-ng-html2js');
const replace = require('gulp-replace');

// Copiar AngularJS local
gulp.task('copy:vendor', () => {
  return gulp.src([
    'node_modules/lodash/lodash.js',
    'node_modules/angular-translate/dist/angular-translate.min.js',
    'node_modules/angular/angular.js',
    'node_modules/angular-route/angular-route.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/ui-select/dist/select.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/angular-sanitize/angular-sanitize.js'
  ])
  .pipe(gulp.dest('../src/django_patango/static/django_patango/'));
});

gulp.task('copy:fonts', () => {
  return gulp.src('node_modules/bootstrap/dist/fonts/*')
    .pipe(gulp.dest('../src/django_patango/static/django_patango/fonts/'));
});

gulp.task('copy:css', () => {

  return gulp.src([
    'node_modules/bootstrap/dist/css/bootstrap.css',
    'node_modules/ui-select/dist/select.css',
    'app/css/django_patango.css'
  ])
    .pipe(replace('../fonts/', './fonts/'))  // ajustar la ruta
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('../src/django_patango/static/django_patango/'));
});

gulp.task('templates', () => {
  return gulp.src('templates/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(ngHtml2Js({
      moduleName: 'djangoPatango.templates',
      prefix: 'templates/'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('../src/django_patango/static/django_patango/'));
});

gulp.task('scripts', () => {
  return gulp.src(['app/**/*.js'])
    .pipe(concat('angular-app.js'))
    .pipe(gulp.dest('../src/django_patango/static/django_patango/'));
});

gulp.task('build', gulp.series('copy:vendor', 'copy:css', 'copy:fonts', 'templates', 'scripts'));

gulp.task('watch', () => {
  gulp.watch('templates/**/*.html', gulp.series('templates'));
  gulp.watch('app/**/*.js', gulp.series('scripts'));
});
