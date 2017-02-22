/**
 * Created by anlun on 16/6/14.
 */
var gulp = require('gulp');
var ts = require('gulp-typescript');
var del = require('del');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var coreList =[
    "Egret/egret.d.ts",
    "Egret/display/MovieClip.ts",
    "Egret/display/Shape.ts",
    "Egret/media/Media.ts",
    "Egret/media/Sound.ts",
    "Egret/media/Video.ts",
    "Egret/net/URLLoader.ts",
    "Egret/utils/Flash2x.ts"
];
var onBuildCore = function(){
    var op = {
        noImplicitAny: true,
        declaration: true,
        out: "Flash2Egret.js",
        target: "ES5"
    };
    var outDir = "build";
    var tsResult = gulp.src(coreList).pipe(ts(op));
        tsResult.dts.pipe(gulp.dest(outDir));
        tsResult.js.pipe(gulp.dest(outDir)).pipe(uglify()).pipe(rename({ extname: '.min.js' })).pipe(gulp.dest(outDir));
};
var onBuildDoc = function (){
    del([
        'libs'
    ]);
    var op = {
        noImplicitAny: true,
        declaration: true,
        target: "ES5"
    };
    var outDir = "libs";
    var tsResult = gulp.src(coreList).pipe(ts(op));
        tsResult.js.pipe(gulp.dest(outDir));
};
gulp.task('onBuildCore', onBuildCore);
gulp.task("onBuildDoc", onBuildDoc);
