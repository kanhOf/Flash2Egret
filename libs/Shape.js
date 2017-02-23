/**
 * @module annie
 */
var annie;
(function (annie) {
    var Rectangle = egret.Rectangle;
    var Texture = egret.Texture;
    /**
     * 矢量对象
     * @class annie.Shape
     * @since 1.0.0
     * @public
     */
    var Shape = (function () {
        function Shape() {
            /**
             * 一个数组，每个元素也是一个数组[类型 0是属性,1是方法,名字 执行的属性或方法名,参数]
             * @property _command
             * @private
             * @since 1.0.0
             * @type {Array}
             * @default []
             */
            this._command = [];
            /**
             * @property _cacheCanvas
             * @since 1.0.0
             * @private
             * @type {Canvas}
             */
            this._cacheImg = window.document.createElement("canvas");
            this._cacheX = 0;
            this._cacheY = 0;
            this.texture = new Texture();
            this.rect = new Rectangle();
            /**
             * 径向渐变填充 一般给Flash2x用
             * @method beginRadialGradientFill
             * @param {Array} colors 一组颜色值
             * @param {Array} ratios 一组范围比例值
             * @param {Array} points 一组点
             * @public
             * @since 1.0.0
             */
            this.beginRadialGradientFill = function (colors, ratios, points) {
                this._fill(Shape.getGradientColor(colors, ratios, points));
            };
            /**
             * 画径向渐变的线条 一般给Flash2x用
             * @method beginRadialGradientStroke
             * @param {Array} colors 一组颜色值
             * @param {Array} ratios 一组范围比例值
             * @param {Array} points 一组点
             * @param {number} lineWidth
             * @param {string} cap 线头的形状 butt round square 默认 butt
             * @param {string} join 线与线之间的交接处形状 bevel round miter 默认miter
             * @param {number} miter 正数,规定最大斜接长度,如果斜接长度超过 miterLimit 的值，边角会以 lineJoin 的 "bevel" 类型来显示 默认10
             * @public
             * @since 1.0.0
             */
            this.beginRadialGradientStroke = function (colors, ratios, points, lineWidth, cap, join, miter) {
                if (lineWidth === void 0) { lineWidth = 1; }
                if (cap === void 0) { cap = "butt"; }
                if (join === void 0) { join = "miter"; }
                if (miter === void 0) { miter = 10; }
                this._stroke(Shape.getGradientColor(colors, ratios, points), lineWidth, cap, join, miter);
            };
            /**
             * 解析一段路径 一般给Flash2x用
             * @method decodePath
             * @param {string} data
             * @public
             * @since 1.0.0
             */
            this.decodePath = function (data) {
                var s = this;
                var instructions = ["moveTo", "lineTo", "quadraticCurveTo", "bezierCurveTo", "closePath"];
                var paramCount = [2, 2, 4, 6, 0];
                var i = 0, l = data.length;
                var params;
                var x = 0, y = 0;
                var base64 = Shape.BASE_64;
                while (i < l) {
                    var c = data.charAt(i);
                    var n = base64[c];
                    var fi = n >> 3; // highest order bits 1-3 code for operation.
                    var f = instructions[fi];
                    // check that we have a valid instruction & that the unused bits are empty:
                    if (!f || (n & 3)) {
                        throw ("bad path data (@" + i + "): " + c);
                    }
                    var pl = paramCount[fi];
                    if (!fi) {
                        x = y = 0;
                    } // move operations reset the position.
                    params = [];
                    i++;
                    var charCount = (n >> 2 & 1) + 2; // 4th header bit indicates number size for this operation.
                    for (var p = 0; p < pl; p++) {
                        var num = base64[data.charAt(i)];
                        var sign = (num >> 5) ? -1 : 1;
                        num = ((num & 31) << 6) | (base64[data.charAt(i + 1)]);
                        if (charCount == 3) {
                            num = (num << 6) | (base64[data.charAt(i + 2)]);
                        }
                        num = sign * num / 10;
                        if (p % 2) {
                            x = (num += x);
                        }
                        else {
                            y = (num += y);
                        }
                        params[p] = num;
                        i += charCount;
                    }
                    s.addDraw(f, params);
                }
            };
        }
        /**
         * 通过一系统参数获取生成颜色或渐变所需要的对象
         * 一般给用户使用较少,Flash2x工具自动使用
         * @method getGradientColor
         * @static
         * @param {string} colors
         * @param {number}ratios
         * @param {annie.Point} points
         * @returns {any}
         * @since 1.0.0
         * @pubic
         */
        Shape.getGradientColor = function (colors, ratios, points) {
            var colorObj;
            var ctx = Shape["_canvas"].getContext("2d");
            if (points.length == 4) {
                colorObj = ctx.createLinearGradient(points[0], points[1], points[2], points[3]);
            }
            else {
                colorObj = ctx.createRadialGradient(points[0], points[1], points[2], points[3], points[4], points[5]);
            }
            for (var i = 0, l = colors.length; i < l; i++) {
                colorObj.addColorStop(ratios[i], colors[i]);
            }
            return colorObj;
        };
        /**
         * 设置位图填充时需要使用的方法,一般给用户使用较少,Flash2x工具自动使用
         * @method getBitmapStyle
         * @static
         * @param {Image} image HTML Image元素
         * @returns {CanvasPattern}
         * @public
         * @since 1.0.0
         */
        Shape.getBitmapStyle = function (image) {
            var ctx = Shape["_canvas"].getContext("2d");
            return ctx.createPattern(image, "repeat");
        };
        /**
         * 通过24位颜色值和一个透明度值生成RGBA值
         * @method getRGBA
         * @static
         * @public
         * @since 1.0.0
         * @param {string} color 字符串的颜色值,如:#33ffee
         * @param {number} alpha 0-1区间的一个数据 0完全透明 1完全不透明
         * @returns {string}
         */
        Shape.getRGBA = function (color, alpha) {
            if (color.indexOf("0x") == 0) {
                color = color.replace("0x", "#");
            }
            if (color.length < 7) {
                color = "#000000";
            }
            if (alpha != 1) {
                var r = parseInt("0x" + color.substr(1, 2));
                var g = parseInt("0x" + color.substr(3, 2));
                var b = parseInt("0x" + color.substr(5, 2));
                color = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
            }
            return color;
        };
        /**
         * 添加一条绘画指令,具体可以查阅Html Canvas画图方法
         * @method addDraw
         * @param {string} commandName ctx指令的方法名 如moveTo lineTo arcTo等
         * @param {Array} params
         * @public
         * @since 1.0.0
         */
        Shape.prototype.addDraw = function (commandName, params) {
            var s = this;
            s._command.push([1, commandName, params]);
        };
        /**
         * 画一个带圆角的矩形
         * @method drawRoundRect
         * @param {number} x 点x值
         * @param {number} y 点y值
         * @param {number} w 宽
         * @param {number} h 高
         * @param {number} rTL 左上圆角半径
         * @param {number} rTR 右上圆角半径
         * @param {number} rBL 左下圆角半径
         * @param {number} rBR 右上圆角半径
         * @public
         * @since 1.0.0
         */
        Shape.prototype.drawRoundRect = function (x, y, w, h, rTL, rTR, rBL, rBR) {
            if (rTL === void 0) { rTL = 0; }
            if (rTR === void 0) { rTR = 0; }
            if (rBL === void 0) { rBL = 0; }
            if (rBR === void 0) { rBR = 0; }
            //let ctx = Shape._canvas.getContext("2d");
            var max = (w < h ? w : h) / 2;
            var mTL = 0, mTR = 0, mBR = 0, mBL = 0;
            if (rTL < 0) {
                rTL *= (mTL = -1);
            }
            if (rTL > max) {
                rTL = max;
            }
            if (rTR < 0) {
                rTR *= (mTR = -1);
            }
            if (rTR > max) {
                rTR = max;
            }
            if (rBR < 0) {
                rBR *= (mBR = -1);
            }
            if (rBR > max) {
                rBR = max;
            }
            if (rBL < 0) {
                rBL *= (mBL = -1);
            }
            if (rBL > max) {
                rBL = max;
            }
            var c = this._command;
            c.push([1, "moveTo", [x + w - rTR, y]]);
            c.push([1, "arcTo", [x + w + rTR * mTR, y - rTR * mTR, x + w, y + rTR, rTR]]);
            c.push([1, "lineTo", [x + w, y + h - rBR]]);
            c.push([1, "arcTo", [x + w + rBR * mBR, y + h + rBR * mBR, x + w - rBR, y + h, rBR]]);
            c.push([1, "lineTo", [x + rBL, y + h]]);
            c.push([1, "arcTo", [x - rBL * mBL, y + h + rBL * mBL, x, y + h - rBL, rBL]]);
            c.push([1, "lineTo", [x, y + rTL]]);
            c.push([1, "arcTo", [x - rTL * mTL, y - rTL * mTL, x + rTL, y, rTL]]);
            c.push([1, "closePath", []]);
        };
        /**
         * 绘画时移动到某一点
         * @method moveTo
         * @param {number} x
         * @param {number} y
         * @public
         * @since 1.0.0
         */
        Shape.prototype.moveTo = function (x, y) {
            this._command.push([1, "moveTo", [x, y]]);
        };
        /**
         * 从上一点画到某一点,如果没有设置上一点，则上一占默认为(0,0)
         * @method lineTo
         * @param {number} x
         * @param {number} y
         * @public
         * @since 1.0.0
         */
        Shape.prototype.lineTo = function (x, y) {
            this._command.push([1, "lineTo", [x, y]]);
        };
        /**
         * 从上一点画弧到某一点,如果没有设置上一点，则上一占默认为(0,0)
         * @method arcTo
         * @param {number} x
         * @param {number} y
         * @public
         * @since 1.0.0
         */
        Shape.prototype.arcTo = function (x, y) {
            this._command.push([1, "arcTo", [x, y]]);
        };
        /**
         * 二次贝赛尔曲线
         * 从上一点画二次贝赛尔曲线到某一点,如果没有设置上一点，则上一占默认为(0,0)
         * @method quadraticCurveTo
         * @param {number} cpX 控制点X
         * @param {number} cpX 控制点Y
         * @param {number} x 终点X
         * @param {number} y 终点Y
         * @public
         * @since 1.0.0
         */
        Shape.prototype.quadraticCurveTo = function (cpX, cpY, x, y) {
            this._command.push([1, "quadraticCurveTo", [cpX, cpY, x, y]]);
        };
        /**
         * 从SpriteSheet的大图中剥离出单独的小图以供特殊用途
         * @method convertToImage
         * @static
         * @public
         * @since 1.0.0
         * @param {annie.Bitmap} bitmap
         * @return {Image}
         */
        Shape.convertToImage = function (bitmap) {
            var w = bitmap.width;
            var h = bitmap.height;
            var img = bitmap.bitmap._image;
            if (w == img.width && h == img.h) {
                return img;
            }
            var _canvas = Shape._canvas;
            _canvas.width = w;
            _canvas.height = h;
            var ctx = _canvas.getContext("2d");
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(bitmap.bitmap._image, bitmap.offsetX, bitmap.offsetY, w, h, 0, 0, w, h);
            var _realCacheImg = window.document.createElement("img");
            _realCacheImg.src = _canvas.toDataURL("image/png");
            return _realCacheImg;
        };
        /**
         * 三次贝赛尔曲线
         * 从上一点画二次贝赛尔曲线到某一点,如果没有设置上一点，则上一占默认为(0,0)
         * @method bezierCurveTo
         * @param {number} cp1X 1控制点X
         * @param {number} cp1Y 1控制点Y
         * @param {number} cp2X 2控制点X
         * @param {number} cp2Y 2控制点Y
         * @param {number} x 终点X
         * @param {number} y 终点Y
         * @public
         * @since 1.0.0
         */
        Shape.prototype.bezierCurveTo = function (cp1X, cp1Y, cp2X, cp2Y, x, y) {
            this._command.push([1, "bezierCurveTo", [cp1X, cp1Y, cp2X, cp2Y, x, y]]);
        };
        /**
         * 闭合一个绘画路径
         * @method closePath
         * @public
         * @since 1.0.0
         */
        Shape.prototype.closePath = function () {
            this._command.push([1, "closePath", []]);
        };
        /**
         * 画一个矩形
         * @method drawRect
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
         * @public
         * @since 1.0.0
         */
        Shape.prototype.drawRect = function (x, y, w, h) {
            var c = this._command;
            c.push([1, "moveTo", [x, y]]);
            c.push([1, "lineTo", [x + w, y]]);
            c.push([1, "lineTo", [x + w, y + h]]);
            c.push([1, "lineTo", [x, y + h]]);
            c.push([1, "closePath", []]);
        };
        /**
         * 画一个弧形
         * @method drawArc
         * @param {number} x 起始点x
         * @param {number} y 起始点y
         * @param {number} radius 半径
         * @param {number} start 开始角度
         * @param {number} end 结束角度
         * @public
         * @since 1.0.0
         */
        Shape.prototype.drawArc = function (x, y, radius, start, end) {
            this._command.push([1, "arc", [x, y, radius, start / 180 * Math.PI, end / 180 * Math.PI]]);
        };
        /**
         * 画一个圆
         * @method drawCircle
         * @param {number} x 圆心x
         * @param {number} y 圆心y
         * @param {number} radius 半径
         * @public
         * @since 1.0.0
         */
        Shape.prototype.drawCircle = function (x, y, radius) {
            this._command.push([1, "arc", [x, y, radius, 0, 2 * Math.PI]]);
        };
        /**
         * 画一个椭圆
         * @method drawEllipse
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
         * @public
         * @since 1.0.0
         */
        Shape.prototype.drawEllipse = function (x, y, w, h) {
            var k = 0.5522848;
            var ox = (w / 2) * k;
            var oy = (h / 2) * k;
            var xe = x + w;
            var ye = y + h;
            var xm = x + w / 2;
            var ym = y + h / 2;
            var c = this._command;
            c.push([1, "moveTo", [x, ym]]);
            c.push([1, "bezierCurveTo", [x, ym - oy, xm - ox, y, xm, y]]);
            c.push([1, "bezierCurveTo", [xm + ox, y, xe, ym - oy, xe, ym]]);
            c.push([1, "bezierCurveTo", [xe, ym + oy, xm + ox, ye, xm, ye]]);
            c.push([1, "bezierCurveTo", [xm - ox, ye, x, ym + oy, x, ym]]);
        };
        /**
         * 清除掉之前所有绘画的东西
         * @method clear
         * @public
         * @since 1.0.0
         */
        Shape.prototype.clear = function () {
            var s = this;
            s._command = [];
        };
        /**
         * 开始绘画填充,如果想画的东西有颜色填充,一定要从此方法开始
         * @method beginFill
         * @param {string} color 颜色值 单色和RGBA格式
         * @public
         * @since 1.0.0
         */
        Shape.prototype.beginFill = function (color) {
            this._fill(color);
        };
        /**
         * 线性渐变填充 一般给Flash2x用
         * @method beginLinearGradientFill
         * @param {Array} colors 一组颜色值
         * @param {Array} ratios 一组范围比例值
         * @param {Array} points 一组点
         * @public
         * @since 1.0.0
         */
        Shape.prototype.beginLinearGradientFill = function (colors, ratios, points) {
            this._fill(Shape.getGradientColor(colors, ratios, points));
        };
        /**
         * 位图填充 一般给Flash2x用
         * @method beginBitmapFill
         * @param {Image} image
         * @param {annie.Matrix} matrix
         * @public
         * @since 1.0.0
         */
        Shape.prototype.beginBitmapFill = function (image, matrix) {
            var s = this;
            if (matrix) {
                s._isBitmapFill = matrix;
            }
            s._fill(Shape.getBitmapStyle(image));
        };
        Shape.prototype._fill = function (fillStyle) {
            var c = this._command;
            c.push([0, "fillStyle", fillStyle]);
            c.push([1, "beginPath", []]);
        };
        /**
         * 给线条着色
         * @method beginStroke
         * @param {string} color  颜色值
         * @param {number} lineWidth 宽度
         * @public
         * @since 1.0.0
         */
        Shape.prototype.beginStroke = function (color, lineWidth, cap, join, miter) {
            if (lineWidth === void 0) { lineWidth = 1; }
            if (cap === void 0) { cap = ""; }
            if (join === void 0) { join = ""; }
            if (miter === void 0) { miter = 0; }
            this._stroke(color, lineWidth, cap, join, miter);
        };
        /**
         * 画线性渐变的线条 一般给Flash2x用
         * @method beginLinearGradientStroke
         * @param {Array} colors 一组颜色值
         * @param {Array} ratios 一组范围比例值
         * @param {Array} points 一组点
         * @param {number} lineWidth
         * @param {string} cap 线头的形状 butt round square 默认 butt
         * @param {string} join 线与线之间的交接处形状 bevel round miter 默认miter
         * @param {number} miter 正数,规定最大斜接长度,如果斜接长度超过 miterLimit 的值，边角会以 lineJoin 的 "bevel" 类型来显示 默认10
         * @public
         * @since 1.0.0
         */
        Shape.prototype.beginLinearGradientStroke = function (colors, ratios, points, lineWidth, cap, join, miter) {
            if (lineWidth === void 0) { lineWidth = 1; }
            if (cap === void 0) { cap = "butt"; }
            if (join === void 0) { join = "miter"; }
            if (miter === void 0) { miter = 10; }
            this._stroke(Shape.getGradientColor(colors, ratios, points), lineWidth, cap, join, miter);
        };
        /**
         * 线条位图填充 一般给Flash2x用
         * @method beginBitmapStroke
         * @param {Image} image
         * @param {annie.Matrix} matrix
         * @param {number} lineWidth
         * @param {string} cap 线头的形状 butt round square 默认 butt
         * @param {string} join 线与线之间的交接处形状 bevel round miter 默认miter
         * @param {number} miter 正数,规定最大斜接长度,如果斜接长度超过 miterLimit 的值，边角会以 lineJoin 的 "bevel" 类型来显示 默认10
         * @public
         * @since 1.0.0
         */
        Shape.prototype.beginBitmapStroke = function (image, matrix, lineWidth, cap, join, miter) {
            if (lineWidth === void 0) { lineWidth = 1; }
            if (cap === void 0) { cap = "butt"; }
            if (join === void 0) { join = "miter"; }
            if (miter === void 0) { miter = 10; }
            var s = this;
            if (matrix) {
                s._isBitmapStroke = matrix;
            }
            s._stroke(Shape.getBitmapStyle(image), lineWidth, cap, join, miter);
        };
        Shape.prototype._stroke = function (strokeStyle, width, cap, join, miter) {
            var c = this._command;
            c.push([0, "lineWidth", width]);
            c.push([0, "lineCap", cap]);
            c.push([0, "lineJoin", join]);
            c.push([0, "miterLimit", miter]);
            c.push([0, "strokeStyle", strokeStyle]);
            c.push([1, "beginPath", []]);
        };
        /**
         * 结束填充
         * @method endFill
         * @public
         * @since 1.0.0
         */
        Shape.prototype.endFill = function () {
            var s = this;
            var c = s._command;
            var m = s._isBitmapFill;
            if (m) {
                //c.push([1, "save", []]);
                c.push([2, "setTransform", [m.a, m.b, m.c, m.d, m.tx, m.ty]]);
            }
            c.push([1, "fill", []]);
            if (m) {
                s._isBitmapFill = null;
            }
        };
        /**
         * 结束画线
         * @method endStroke
         * @public
         * @since 1.0.0
         */
        Shape.prototype.endStroke = function () {
            var s = this;
            var c = s._command;
            var m = s._isBitmapStroke;
            if (m) {
                //c.push([1, "save", []]);
                //如果为2则还需要特别处理
                c.push([2, "setTransform", [m.a, m.b, m.c, m.d, m.tx, m.ty]]);
            }
            c.push([1, "stroke", []]);
            if (m) {
                s._isBitmapStroke = null;
            }
        };
        /**
         * 生成贴图
         * @method createTexture
         * @public
         * @since 1.0.0
         * @returns laya.resource.Texture
         */
        Shape.prototype.updateTexture = function () {
            var s = this;
            //更新缓存
            var cLen = s._command.length;
            var leftX;
            var leftY;
            var buttonRightX;
            var buttonRightY;
            var i;
            if (cLen > 0) {
                //确定是否有数据,如果有数据的话就计算出缓存图的宽和高
                var data = void 0;
                var lastX = 0;
                var lastY = 0;
                var lineWidth = 0;
                for (i = 0; i < cLen; i++) {
                    data = s._command[i];
                    if (data[0] == 1) {
                        if (data[1] == "moveTo" || data[1] == "lineTo" || data[1] == "arcTo" || data[1] == "bezierCurveTo") {
                            if (leftX == undefined) {
                                leftX = data[2][0];
                            }
                            if (leftY == undefined) {
                                leftY = data[2][1];
                            }
                            if (buttonRightX == undefined) {
                                buttonRightX = data[2][0];
                            }
                            if (buttonRightY == undefined) {
                                buttonRightY = data[2][1];
                            }
                            if (data[1] == "bezierCurveTo") {
                                leftX = Math.min(leftX, data[2][0], data[2][2], data[2][4]);
                                leftY = Math.min(leftY, data[2][1], data[2][3], data[2][5]);
                                buttonRightX = Math.max(buttonRightX, data[2][0], data[2][2], data[2][4]);
                                buttonRightY = Math.max(buttonRightY, data[2][1], data[2][3], data[2][5]);
                                lastX = data[2][4];
                                lastY = data[2][5];
                            }
                            else {
                                leftX = Math.min(leftX, data[2][0]);
                                leftY = Math.min(leftY, data[2][1]);
                                buttonRightX = Math.max(buttonRightX, data[2][0]);
                                buttonRightY = Math.max(buttonRightY, data[2][1]);
                                lastX = data[2][0];
                                lastY = data[2][1];
                            }
                        }
                        else if (data[1] == "quadraticCurveTo") {
                            //求中点
                            var mid1X = (lastX + data[2][0]) * 0.5;
                            var mid1Y = (lastX + data[2][1]) * 0.5;
                            var mid2X = (data[2][0] + data[2][2]) * 0.5;
                            var mid2Y = (data[2][1] + data[2][3]) * 0.5;
                            if (leftX == undefined) {
                                leftX = mid1X;
                            }
                            if (leftY == undefined) {
                                leftY = mid1Y;
                            }
                            if (buttonRightX == undefined) {
                                buttonRightX = mid1X;
                            }
                            if (buttonRightY == undefined) {
                                buttonRightY = mid1Y;
                            }
                            leftX = Math.min(leftX, mid1X, mid2X, data[2][2]);
                            leftY = Math.min(leftY, mid1Y, mid2Y, data[2][3]);
                            buttonRightX = Math.max(buttonRightX, mid1X, mid2X, data[2][2]);
                            buttonRightY = Math.max(buttonRightY, mid1Y, mid2Y, data[2][3]);
                            lastX = data[2][2];
                            lastY = data[2][3];
                        }
                        else if (data[1] == "arc") {
                            var yuanPointX = data[2][0];
                            var yuanPointY = data[2][1];
                            var radio = data[2][2];
                            var yuanLeftX = yuanPointX - radio;
                            var yuanLeftY = yuanPointY - radio;
                            var yuanBRX = yuanPointX + radio;
                            var yuanBRY = yuanPointY + radio;
                            if (leftX == undefined) {
                                leftX = yuanLeftX;
                            }
                            if (leftY == undefined) {
                                leftY = yuanLeftY;
                            }
                            if (buttonRightX == undefined) {
                                buttonRightX = yuanBRX;
                            }
                            if (buttonRightY == undefined) {
                                buttonRightY = yuanBRY;
                            }
                            leftX = Math.min(leftX, yuanLeftX);
                            leftY = Math.min(leftY, yuanLeftY);
                            buttonRightX = Math.max(buttonRightX, yuanBRX);
                            buttonRightY = Math.max(buttonRightY, yuanBRY);
                        }
                    }
                    else {
                        if (data[1] == "lineWidth") {
                            if (lineWidth < data[2]) {
                                lineWidth = data[2];
                            }
                        }
                    }
                }
                if (leftX != undefined) {
                    leftX -= 20 + lineWidth >> 1;
                    leftY -= 20 + lineWidth >> 1;
                    buttonRightX += 20 + lineWidth >> 1;
                    buttonRightY += 20 + lineWidth >> 1;
                    var w = buttonRightX - leftX;
                    var h = buttonRightY - leftY;
                    s.rect.x = leftX;
                    s.rect.y = leftY;
                    s.rect.width = w;
                    s.rect.height = h;
                    ///////////////////////////
                    s._cacheX = leftX;
                    s._cacheY = leftY;
                    var _canvas = s._cacheImg;
                    var ctx = _canvas["getContext"]('2d');
                    _canvas.width = w;
                    _canvas.height = h;
                    _canvas.style.width = w / devicePixelRatio + "px";
                    _canvas.style.height = h / devicePixelRatio + "px";
                    ctx.clearRect(0, 0, w, h);
                    ctx.setTransform(1, 0, 0, 1, -leftX, -leftY);
                    var com = s._command;
                    var cLen_1 = com.length;
                    var data_1;
                    for (var i_1 = 0; i_1 < cLen_1; i_1++) {
                        data_1 = com[i_1];
                        if (data_1[0] > 0) {
                            var paramsLen = data_1[2].length;
                            if (paramsLen == 0) {
                                ctx[data_1[1]]();
                            }
                            else if (paramsLen == 2) {
                                ctx[data_1[1]](data_1[2][0], data_1[2][1]);
                            }
                            else if (paramsLen == 4) {
                                ctx[data_1[1]](data_1[2][0], data_1[2][1], data_1[2][2], data_1[2][3]);
                            }
                            else if (paramsLen == 5) {
                                ctx[data_1[1]](data_1[2][0], data_1[2][1], data_1[2][2], data_1[2][3], data_1[2][4]);
                            }
                            else if (paramsLen == 6) {
                                var lx = data_1[2][4];
                                var ly = data_1[2][5];
                                if (data_1[0] == 2) {
                                    //位图填充
                                    lx -= leftX;
                                    ly -= leftY;
                                }
                                ctx[data_1[1]](data_1[2][0], data_1[2][1], data_1[2][2], data_1[2][3], lx, ly);
                            }
                        }
                        else {
                            ctx[data_1[1]] = data_1[2];
                        }
                    }
                }
                else {
                    s._cacheImg.width = 0;
                    s._cacheImg.height = 0;
                    s._cacheX = 0;
                    s._cacheY = 0;
                }
            }
            else {
                s._cacheImg.width = 0;
                s._cacheImg.height = 0;
                s._cacheX = 0;
                s._cacheY = 0;
            }
            var texture = new Texture();
            texture.load(s._cacheImg.toDataURL());
            return texture;
        };
        /**
         * 如果有的话,改变矢量对象的边框或者填充的颜色.
         * @method changeColor
         * @param {Object} infoObj
         * @param {string} infoObj.fillColor 填充颜色值，如"#fff" 或者 "rgba(255,255,255,1)";
         * @param {string} infoObj.strokeColor 线条颜色值，如"#fff" 或者 "rgba(255,255,255,1)";
         * @param {number} infoObj.lineWidth 线条的粗细，如"1,2,3...";
         * @public
         * @since 1.0.2
         */
        Shape.prototype.changeColor = function (infoObj) {
            var s = this;
            var cLen = s._command.length;
            var c = s._command;
            for (var i = 0; i < cLen; i++) {
                if (c[i][0] == 0) {
                    if (c[i][1] == "fillStyle" && infoObj.fillColor && c[i][2] != infoObj.fillColor) {
                        c[i][2] = infoObj.fillColor;
                    }
                    if (c[i][1] == "strokeStyle" && infoObj.strokeColor && c[i][2] != infoObj.strokeColor) {
                        c[i][2] = infoObj.strokeColor;
                    }
                    if (c[i][1] == "lineWidth" && infoObj.lineWidth && c[i][2] != infoObj.lineWidth) {
                        c[i][2] = infoObj.lineWidth;
                    }
                }
            }
            s.updateTexture();
        };
        Shape._canvas = document.createElement("canvas");
        Shape.BASE_64 = {
            "A": 0,
            "B": 1,
            "C": 2,
            "D": 3,
            "E": 4,
            "F": 5,
            "G": 6,
            "H": 7,
            "I": 8,
            "J": 9,
            "K": 10,
            "L": 11,
            "M": 12,
            "N": 13,
            "O": 14,
            "P": 15,
            "Q": 16,
            "R": 17,
            "S": 18,
            "T": 19,
            "U": 20,
            "V": 21,
            "W": 22,
            "X": 23,
            "Y": 24,
            "Z": 25,
            "a": 26,
            "b": 27,
            "c": 28,
            "d": 29,
            "e": 30,
            "f": 31,
            "g": 32,
            "h": 33,
            "i": 34,
            "j": 35,
            "k": 36,
            "l": 37,
            "m": 38,
            "n": 39,
            "o": 40,
            "p": 41,
            "q": 42,
            "r": 43,
            "s": 44,
            "t": 45,
            "u": 46,
            "v": 47,
            "w": 48,
            "x": 49,
            "y": 50,
            "z": 51,
            "0": 52,
            "1": 53,
            "2": 54,
            "3": 55,
            "4": 56,
            "5": 57,
            "6": 58,
            "7": 59,
            "8": 60,
            "9": 61,
            "+": 62,
            "/": 63
        };
        return Shape;
    }());
    annie.Shape = Shape;
})(annie || (annie = {}));
