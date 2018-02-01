/**
 * Created by Administrator on 2017/4/13.
 */
var gulp = require('gulp');
var sass = require('gulp-sass');//sass编译插件
var sourcemaps = require('gulp-sourcemaps');//sourcemaps定位sass代码
var autoprefixer = require('gulp-autoprefixer');//autoprefixer补全css的兼容性写法
var cleanCss = require('gulp-clean-css'),//压缩css
    cssver = require('gulp-make-css-url-version');//添加版本号
var imagemin = require('gulp-imagemin'),//压缩图片工具
    imageminPngquant = require('imagemin-pngquant');//png图片压缩
var babel = require('gulp-babel');
var uglify = require('gulp-uglify'),//javascript文件压缩
    pump = require('pump');//uglify的依赖项
var htmlmin = require('gulp-htmlmin');
var wrap = require('gulp-wrap');//帮助我们定义公共的头部和尾部
var browserSync = require('browser-sync').create();//自动刷新
var filter = require('gulp-filter');//筛选需要的文件
var del = require('del');//删除文件
var runSequence = require('run-sequence');//让任务按顺序执行
const changed = require('gulp-changed');//只编译修改后的文件
const useref = require('gulp-useref');//合并文件
const gulpIf = require('gulp-if');
const cssnano=require('gulp-cssnano');
const size=require('gulp-size');
const debug=require('gulp-debug');
/*压缩雪碧图*/
// var gulpif = require('gulp-if');
// var sprity = require('sprity');
/*添加版本号*/
var rev = require('gulp-rev');//MD5版本号
var revCollector = require('gulp-rev-collector');//版本替换
var cache = require('gulp-cache');//缓存
const revAppend=require('gulp-rev-append');//通过正则匹配查找链接添加版本号?rev=@@hash
//刷新的页面
var html_show="website/index.html";

/*变量定义*/
var SassInput = './src/asset/sass/**/*.scss',
    IconSassOutput = './src/asset/sass/helpers',
    CssOutput = './dist/asset/css';
var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
};
var htmlOptions = {
        removeComments: false,//清除HTML注释
        collapseWhitespace: false,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: false,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    },
    htmlMinOptions = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: false,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: false,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
var JsInput = './src/asset/js/*.js',
    JsOutput = './dist/asset/js',
    JsMinInput = './dist/asset/js/*.js';
var dataInput='./src/asset/data/*.json',
    dataOutput='./dist/asset/data';
var ImgInput = './src/asset/images/**/*.+(png|jpg|gif|svg)',
    IconInput = './src/asset/images/icon/p-comments_port',
    IconOutput = './dist/asset/images/icon',
    ImgOutput = './dist/asset/images';
var HtmlInput = './src/**/*.html',
    HtmlMinInput = './dist/*',
    HtmlOutput = './dist',
    HtmlCommon = './src/htmls--common/common.html';
var plginsInput = './src/asset/plugins/**/*',
    plginsOutput = './dist/asset/plugins',
    plginsDestDir = './dist/asset/plugins/*';

/*定义任务------------------------------------------------------------------------------*/
/*删除除了图片以外的所有文件*/
gulp.task('cleanDist', function () {
    del(['dist/**/*', '!dist/asset', '!dist/asset/images', '!dist/asset/css', '!dist/asset/js', '!dist/asset/images/**/*']);
});
/*删除dist目录下文件*/
gulp.task('clean', function (cb) {
    del(['dist/**/*']);
    return cache.clearAll(cb);
});

/*把相关插件搬运到dist目录下*/
//删除生产文件夹下面的plugins目录
gulp.task('pluginsDel', function (cb) {
    return del([plginsDestDir], cb);
});
//删除完dist/asset/plugins后，把src/asset/plugins拷贝过去
gulp.task('plugins', ['pluginsDel'], function () {
    return gulp.src(plginsInput)
        .pipe(gulp.dest(plginsOutput));
});
/*css相关任务=========================================================================*/
gulp.task('sass', function () {
    return gulp.src(SassInput)
        // .pipe(changed(CssOutput,{extension: '.css'}))
        // .pipe(changed(CssOutput, {hasChanged: changed.compareSha1Digest}))
        .pipe(debug({title: '编译scss:'}))
        .pipe(sourcemaps.init())//创建sass的代码索引
        .pipe(sass(sassOptions).on('error', sass.logError))//sass编译
        //autoprefixer补全css的兼容性写法
        .pipe(
            autoprefixer({
                browsers: ['last 4 versions'],
                cascade: false,
                remove: false
            })
        )
        .pipe(cssver())////给css文件里引用文件加版本号（文件MD5）
        // .pipe(cleanCss({compatibility: 'ie8'}))//压缩Css时去掉ie8以下的兼容代码
        .pipe(sourcemaps.write('./maps'))//把maps写在css文件内
        .pipe(gulp.dest(CssOutput))//将代码转移到生产文件夹下
        .pipe(filter('**/*.css'))//筛选出css,确保只有.css响应.reload
        .pipe(browserSync.reload({stream: true}));//刷新页面
});
/*压缩css*/
gulp.task('sassmin', function () {
    return gulp.src(SassInput)
        .pipe(sourcemaps.init())//创建sass的代码索引
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))//sass编译成压缩的css
        //autoprefixer补全css的兼容性写法
        .pipe(
            autoprefixer({
                browsers: ['last 4 versions'],
                cascade: false,
                remove: false
            })
        )
        .pipe(cssver())////给css文件里引用文件加版本号（文件MD5）
        .pipe(cleanCss({compatibility: 'ie8'}))//压缩Css时去掉ie8以下的兼容代码
        .pipe(sourcemaps.write('./maps'))//把maps写在css文件内
        .pipe(gulp.dest(CssOutput));//将代码转移到生产文件夹下
});
/*js相关任务========================================================================*/
/*将ES6代码编译成ES5*/
gulp.task('babel', function () {
    return gulp.src(JsInput)
        .pipe(changed(JsOutput,{extension: '.js'}))
        .pipe(debug({title: '编译js:'}))
        .pipe(sourcemaps.init())
        .pipe(
            babel({
                presets: ['es2015']
            })
        )
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(JsOutput))
    .pipe(browserSync.reload({stream: true}));//刷新页面
});
gulp.task('js_move', function () {
    return gulp.src(JsInput)
        .pipe(gulp.dest(JsOutput))
        .pipe(browserSync.reload({stream: true}));//刷新页面
});
gulp.task('data', function () {
    return gulp.src(dataInput)
        .pipe(changed(dataOutput,{extension: '.json'}))
        .pipe(gulp.dest(dataOutput))
        .pipe(browserSync.reload({stream: true}));//刷新页面
});
// gulp.task('js-watch', ['babel'], browserSync.reload);//babel完成后，对页面启动重载
/*压缩js，并报出错误*/
gulp.task('compress',['useref'], function (cb) {
    //pump一次性捕捉js的错误信息
    pump([
            gulp.src(JsMinInput),
            uglify(),//压缩js
            gulp.dest(JsOutput)
        ],
        cb//？
    ).pipe(browserSync.reload({stream: true}));//刷新页面
});

/*图片压缩相关任务=====================================================================*/
gulp.task('imagemin', function () {
    return gulp.src(ImgInput)
        // .pipe(changed(ImgOutput,{extension: '.+(png|jpg|gif|svg)'}))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest(ImgOutput))
        .pipe(browserSync.reload({stream: true}));
});
gulp.task('image',function () {
    return gulp.src(ImgInput)
        .pipe(changed(ImgOutput,{extension: '.jpg'}))
        .pipe(gulp.dest(ImgOutput))
        .pipe(browserSync.reload({stream: true}));
});
/*生产雪碧图*/
/*gulp.task('sprites', function () {
 return sprity.src({
 name: 'icons',                       //定义一个名称
 src: IconInput + '*.{png,jpg}',
 // processor: 'css', // css生成处理
 processor: 'sass',  //SCSS生成处理
 // style: CssOutput + 'sprites.css',  //CSS输出路径
 style: IconSassOutput+'_icon.scss',                //这是生成的样式文件
 format: 'png',                      //png格式的图片
 orientation: 'vertical'         //雪碧图合并的方向，也可以设置成垂直或水平(vertical|horizontal|binary-tree)
 //cssPath: '#{$icon-sprite-path}',    //雪碧图的路径变量
 //template: './sprite-tpl.mustache',  //scss生成的模板

 })
 // .pipe($.if('*.png', gulp.dest(imgDistDir), gulp.dest(cssDistDir)))
 .pipe(gulpif('*.png', gulp.dest(IconOutput), gulp.dest(IconSassOutput)));
 });*/
/*html压缩==========================================================================*/
gulp.task('html', function () {
    return gulp.src(HtmlInput)
        .pipe(changed(HtmlOutput,{extension: '.html'}))
        .pipe(htmlmin(htmlOptions))
        .pipe(revAppend())
        .pipe(gulp.dest(HtmlOutput))
        .pipe(browserSync.reload({stream: true}));
});
gulp.task('htmlmin', function () {
    // return gulp.src(HtmlMinInput)
    return gulp.src(HtmlInput)
        .pipe(htmlmin(htmlMinOptions))
        .pipe(gulp.dest(HtmlOutput))
    // .pipe(browserSync.reload);
});
/*css和js文件合并========================================================================*/
/*
* <!-- build:js asset/js/p-cruise-line.js?rev=@@hash -->
*     这里放要合并的文件
* <!-- endbuild -->
* */
gulp.task('useref',function (cb) {
    return gulp.src(HtmlInput)
    //判断为css，则压缩css

        // .pipe(gulpIf('*.css', cssnano()))
        //判断为js，则编译js，压缩交给compress去完成

        .pipe(useref())
        .pipe(gulpIf('*.js', babel({
            presets: ['es2015']
        })))

        .pipe(gulpIf('*.html', htmlmin(htmlMinOptions)))
        .pipe(revAppend())
        .pipe(gulp.dest(HtmlOutput));
});
/*实时刷新=============================================================================*/


gulp.task('serve',function () {
    // gulp.start('sass', 'babel', 'compress', 'imagemin');
    // gulp.start('babel','compress','imagemin');
    browserSync.init({
        port:8050,
        /*ui: {
            port: 8080,
            weinre: {
                port: 9090
            }
        },*/
        server: {
            baseDir: ['dist'],
            index: html_show
        }

    });
    // gulp.watch('./dist/asset/js/*.js', ['compress']);
    gulp.watch('./dist/asset/sass/**/*.scss', ['sass']);
    gulp.watch('./dist/asset/images/*.*', ['imagemin']);
    gulp.watch('./dist/*.html', ['html']);
    // gulp.watch('./dist/*.html').on("change", browserSync.reload);
    gulp.watch('./dist/asset/js/*.js', ['js_move']);
    gulp.watch('./dist/asset/data/*.json', ['data']);
});


/*监控任务==============================================================================*/
gulp.task('watch', /*['serve', 'sass', 'babel'],*/ function () {
// gulp.task('watch', ['babel', 'compress'], function () {
    gulp.watch([SassInput], ['sass']);
    gulp.watch([JsInput], ['js_move']);
    gulp.watch([dataInput], ['data']);
    // gulp.watch([JsInput], ['compress']);
    gulp.watch([HtmlInput], ['html']);
    gulp.watch([ImgInput], ['imagemin']);
    gulp.watch([plginsInput], ['plugins']);
});

/*开发使用，编译sass,监听文件，刷新浏览器===================================================*/
// gulp.task('default', ['watch', 'sass', /*'compress',*/ 'babel', 'htmlmin', 'imagemin', 'plugins', 'serve']);
gulp.task('default', function (callback) {
    runSequence(['sass', 'js_move', 'data','html'/*, 'image'*/, 'plugins', 'serve', 'watch'],
        callback
    )
});

/*
 *优化使用，优化css，javascript,压缩图片====================================================
 */


gulp.task('build', function (callback) {
    runSequence('cleanDist',
        ['sassmin', 'babel', 'htmlmin', 'plugins'],
        // 'useref',
        'compress',
        callback
    )
});