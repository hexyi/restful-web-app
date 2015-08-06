/*global -$ */
'use strict';
/*
 * gulp 3.9
 * - app
 *   - scripts
 *   - styles
 *   - views
 *   - images
 * - .tmp
 * - bower_components
 */
//npm install --save-dev gulp gulp-filter gulp-flatten gulp-imagemin gulp-jshint gulp-minify-css gulp-uglify gulp-sourcemaps gulp-useref main-bower-files gulp-load-plugins gulp-clean gulp-cache gulp-concat gulp-rev-all gulp-rename gulp-beautify gulp-size gulp-inject gulp-if gulp-replace gulp-liveload wiredep imagemin-pngquant del

var gulp = require('gulp'),
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),
    pngquant = require('imagemin-pngquant'),
    browserSync = require('browser-sync').create(),
    $ = require('gulp-load-plugins')();
var paths = {
  src: 'app/',
  dist: 'dist/',
  tmp: '.tmp/'
};
var files = {
  scripts: 'scripts/**/*.js',
  templates: 'scripts/**/*.html',
  styles: 'styles/**/*.css',
  fonts: 'fonts/**/*',
  images: 'images/**/*'
};
var filters ={
  scripts: '**/*.js',
  styles: '**/*.css',
  fonts: '**/*.{eot,svg,ttf,woff,woff2,otf}',
  html: '**/*.html',
  nonHtml: '**/*.+(js|css|png|jpg|eot|svg|ttf|woff|woff2|otf)'
};
var server = {
  basePath: 'app',
  host: 'localhost',
  port: 9000
};
//删除文件夹里的内容
gulp.task('clean', function (cb) {
  del([paths.dist, paths.tmp], {force:true}, cb);
});
//处理angular模板
gulp.task('templates', function () {
  return gulp.src(paths.src + files.templates)
    .pipe($.angularTemplatecache({root:'scripts/', module:'webSiteApp'}))
    .pipe(gulp.dest(paths.tmp + 'templates'));
});
//验证js
gulp.task('jshint', function () {
  return gulp.src(paths.src + files.scripts)
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'));
});
//合并压缩js
gulp.task('scripts', ['jshint', 'templates'], function() {
  return gulp.src([paths.src + files.scripts, paths.tmp + 'templates/templates.js'])
    .pipe($.sourcemaps.init())
    .pipe($.concat('main.js'))    //合并所有js到main.js
    .pipe(gulp.dest(paths.dist +'scripts'))    //输出main.js到文件夹
    .pipe($.rename({suffix: '.min'}))   //rename压缩后的文件名
    .pipe($.uglify())    //压缩
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist + 'scripts'));
});
//压缩图片 使用cache插件只有新建或修改过的图片才会压缩
gulp.task('images', function() {
  return gulp.src(paths.src + files.images)
    .pipe($.cache($.imagemin({
      optimizationLevel: 5,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      interlaced: true,
      use: [pngquant()]
    })))
    .pipe(gulp.dest(paths.dist+ 'images'));
});
//压缩css
gulp.task('styles', function() {
  return gulp.src(paths.src + files.styles) //压缩的文件
    .pipe($.sourcemaps.init())
    .pipe($.autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
        }))//为css添加浏览器前缀
    .pipe($.concat('main.css'))    //合并所有css到style.css
    .pipe(gulp.dest(paths.dist +'styles'))    //输出style.css到文件夹
    .pipe($.rename({suffix: '.min'}))   //rename压缩后的文件名
    .pipe($.minifyCss())   //执行压缩
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist + 'styles'));
});
//拷贝bower下的资源文件到目标目录
gulp.task('bower',function() {
  var jsF = $.filter(jsFilter),
      cssF = $.filter(cssFilter),
      fontF = $.filter(fontFilter);
  return gulp.src(mainBowerFiles())
      .pipe(jsF)
      .pipe($.flatten())
      .pipe(gulp.dest(tmp+'js'))
      .pipe(jsF.restore())
      .pipe(cssF)
      .pipe($.flatten())
      .pipe(gulp.dest(tmp+'css'))
      .pipe(cssF.restore())
      .pipe(fontF)
      .pipe($.flatten())
      .pipe(gulp.dest(tmp+'fonts'));
});
//赋值src文件到tmp中
gulp.task('copy',function() {
  return gulp.src(paths.src + '**/*')
        .pipe(gulp.dest(paths.tmp));
});
//release 压缩css js 图片
gulp.task('collect',['bower','copy'],function(cb) {
    //在任务定义的function中传入callback变量，当callback()执行时，任务结束。
  cb();
});
// 压缩后的css和js插入模板文件
gulp.task('inject2', ['styles', 'scripts', 'images'], function() {
  var target = gulp.src(paths.src + '**/*.html');
  var sources = gulp.src([paths.dist + '**/*.min.js', paths.dist + '**/*.min.css'], {read: false});
  return target.pipe($.inject(sources, {addRootSlash:false, ignorePath:'dist'}))
      //删除标记和空行
      .pipe($.replace(/([ \t]*<!--\s*(bower|inject):*\S*\s*-->)((\n|\r|.)*?)(<!--\s*endinject\s*-->)/gi,'$3'))
      .pipe($.replace(/^[\t ]*\n/mg,''))
      .pipe(gulp.dest(paths.dist))
      .pipe($.size({title: 'app', gzip: true}));
});
// 压缩后的资源文件和bower中的资源文件插入模板文件
// 添加return可以告知gulp任务已经结束，否则后续任务依赖当前任务的输出文件的话可能有问题
// flatten可以去掉一些相对路径，使所有文件在一个目标目录下
gulp.task('inject', ['styles', 'scripts', 'images'], function() {
  var jsF = $.filter(filters.scripts),
      cssF = $.filter(filters.styles),
      fontF = $.filter(filters.fonts);
  var bowerSources = gulp.src(mainBowerFiles())
      .pipe(jsF)
      .pipe($.flatten())
      .pipe(gulp.dest(paths.dist+'scripts'))
      .pipe(jsF.restore())
      .pipe(cssF)
      .pipe($.flatten())
      .pipe(gulp.dest(paths.dist+'styles'))
      .pipe(cssF.restore())
      .pipe(fontF)
      .pipe($.flatten())
      .pipe(gulp.dest(paths.dist+'fonts'))
      .pipe(fontF.restore());
  var sources = gulp.src([paths.dist + '**/*.min.js', paths.dist + '**/*.min.css'], {read: false});
  var target = gulp.src([paths.src + '**/*.html','!' + paths.src + files.templates]);
  return target.pipe($.inject(bowerSources.pipe($.filter(['**/*','!**/jquery.min.js','!**/bootstrap.js'])), {name: 'bower',addRootSlash:false, ignorePath:'dist/'}))
      .pipe($.inject(sources, {addRootSlash:false, ignorePath:'dist'}))
      //删除标记和空行
      .pipe($.replace(/([ \t]*<!--\s*(bower|inject):*\S*\s*-->)((\n|\r|.)*?)(<!--\s*endinject\s*-->)/gi,'$3'))
      .pipe($.replace(/^[\t ]*\n/mg,''))
      .pipe(gulp.dest(paths.dist))
      .pipe($.size({title: 'app', gzip: true}));
});
//默认任务
gulp.task('default',['clean'], function () {
  gulp.start('inject');
});
//监听文件
gulp.task('serve', function () {
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: server.basePath,
      routes: {
          "/bower_components": "bower_components"
      }
    },
    host: server.host,
    port: server.port
  });

  gulp.watch([paths.src + '**/*']).on('change', browserSync.reload);
});
