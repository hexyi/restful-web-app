/*global -$ */
'use strict';
/*
 * - app
 *   - scripts
 *   - styles
 *   - views
 *   - images
 * - .tmp
 * - bower_components
 */

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
    .pipe(gulp.dest(paths.tmp + 'templates'))
    .pipe($.size({title: 'templates', gzip: true}));
});
//验证js
gulp.task('jshint', function () {
  return gulp.src(paths.src + files.scripts)
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'));
});
//压缩js
gulp.task('scripts', ['jshint', 'templates'], function() {
  return gulp.src([paths.src + files.scripts, paths.tmp + 'templates/*.js'])
    .pipe($.sourcemaps.init())
    .pipe($.uglify())    //压缩
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist + 'scripts'))
    .pipe($.size({title: 'scripts', gzip: true}));
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
    .pipe(gulp.dest(paths.dist+ 'images'))
    .pipe($.size({title: 'images', gzip: true}));
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
    .pipe(gulp.dest(paths.dist + 'styles'))
    .pipe($.size({title: 'styles', gzip: true}));
});
gulp.task('less', function() {
  return gulp.src([paths.src + 'styles/vendor.less'])
    .pipe($.sourcemaps.init())
    .pipe($.less())
    .pipe($.rename({suffix: '.min'}))
    .pipe($.minifyCss())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist + 'styles'))
    .pipe($.size({title: 'less', gzip: true}));
});
// 压缩后的资源文件和bower中的资源文件插入模板文件
// 添加return可以告知gulp任务已经结束，否则后续任务依赖当前任务的输出文件的话可能有问题
gulp.task('inject', ['styles', 'scripts', 'images', 'less'], function() {
  var jsF = $.filter(filters.scripts),
      cssF = $.filter(filters.styles),
      fontF = $.filter(filters.fonts);
  var bowerSources = gulp.src(mainBowerFiles(), {base: "."}) //保持目录结构 https://github.com/gulpjs/gulp/issues/151#issuecomment-41508551
      .pipe(jsF)
      .pipe(gulp.dest(paths.dist))
      .pipe($.size({title: 'bower scripts', gzip: true}))
      .pipe(jsF.restore())
      .pipe(cssF)
      .pipe(gulp.dest(paths.dist))
      .pipe($.size({title: 'bower styles', gzip: true}))
      .pipe(cssF.restore())
      .pipe(fontF)
      .pipe(gulp.dest(paths.dist))
      .pipe($.size({title: 'bower fonts', gzip: true}))
      .pipe(fontF.restore());
  var sources = gulp.src([paths.dist + '**/templates.js', paths.dist + 'styles/vendor.min.css', paths.dist + 'styles/main.min.css'], {read: false});
  var target = gulp.src([paths.src + '**/*.html','!' + paths.src + files.templates]);
  return target.pipe($.inject(bowerSources.pipe($.filter(['**/*','!**/jquery.js','!**/bootstrap.js','!**/*angular-chart*'])), {name: 'bower',addRootSlash:false, ignorePath:'dist/'}))
      .pipe($.inject(sources, {addRootSlash:false, ignorePath:'dist'}))
      //删除标记和空行
      .pipe($.replace(/([ \t]*<!--\s*(bower|inject):*\S*\s*-->)((\n|\r|.)*?)(<!--\s*endinject\s*-->)/gi,'$3'))
      .pipe($.replace(/^[\t ]*\n/mg,''))
      .pipe(gulp.dest(paths.dist))
      .pipe($.size({title: 'html', gzip: true}));
});
//默认任务
gulp.task('default',['clean'], function () {
  gulp.start('inject');
});
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
gulp.task('serve:dist', ['default'], function () {
  browserSync.init({
    server: {
      baseDir: paths.dist
    },
    host: server.host,
    port: server.port
  });

});
