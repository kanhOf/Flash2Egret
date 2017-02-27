var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * @module annie
 */
var annie;
(function (annie) {
    var DisplayObjectContainer = egret.DisplayObjectContainer;
    var Event = egret.Event;
    var MouseEvent = egret.TouchEvent;
    var McFrame = (function () {
        function McFrame() {
            var s = this;
            s.frameChildList = new Array();
            s.keyIndex = 0;
            s.eventName = "";
            s.soundName = "";
            s.soundScene = "";
            s.soundTimes = 1;
        }
        McFrame.prototype.setDisplayInfo = function (display, displayBaseInfo, displayExtendInfo) {
            if (displayBaseInfo === void 0) { displayBaseInfo = null; }
            if (displayExtendInfo === void 0) { displayExtendInfo = null; }
            var s = this;
            var info = {
                display: display,
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                skewX: 0,
                skewY: 0,
                alpha: 1
            };
            Flash2x.d(info, displayBaseInfo, displayExtendInfo);
            s.frameChildList.push(info);
        };
        McFrame.prototype.setGraphicInfo = function (loopType, firstFrame, parentFrameIndex) {
            var s = this;
            var lastIndex = s.frameChildList.length - 1;
            s.frameChildList[lastIndex].graphicInfo = {
                loopType: loopType,
                firstFrame: firstFrame,
                parentFrameIndex: parentFrameIndex
            };
        };
        return McFrame;
    }());
    /**
     * annie引擎核心类
     * @class annie.MovieClip
     * @since 1.0.0
     * @public
     * @extends egret.Sprite
     */
    var MovieClip = (function (_super) {
        __extends(MovieClip, _super);
        function MovieClip() {
            _super.call(this);
            /**
             * 时间轴 一般给Flash2x工具使用
             * @property _timeline
             * @private
             * @since 1.0.0
             * @type {Array}
             */
            this._timeline = [];
            /**
             * 有些时候我们需要在一个时间轴动画类中添加子元素
             * 在默认情况下，MovieClip只有在停止播放的情况下
             * 使用addChild等方法添加到mc中的子级对象是可见的
             * 为了能够在动画播放期间的任意时刻都能使添加的对象可见
             * 我们给MovieClip添加了一个特殊的子级容器对象，你只需要将你的显示
             * 对象添加到这个特殊的容器对象中，就能在整个动画期间，被添加的显示对象都可见
             * 此 floatView 容器会一直在mc的最上层
             * @since 1.0.2
             * @public
             * @property floatView
             * @type {annie.Sprite}
             */
            this.floatView = new DisplayObjectContainer();
            /**
             * mc的当前帧
             * @property currentFrame
             * @public
             * @since 1.0.0
             * @type {number}
             * @default 1
             * @readonly
             */
            this.currentFrame = 1;
            /**
             * 当前动画是否处于播放状态
             * @property isPlaying
             * @readOnly
             * @public
             * @since 1.0.0
             * @type {boolean}
             * @default true
             * @readonly
             */
            this.isPlaying = true;
            /**
             * 动画的播放方向,是顺着播还是在倒着播
             * @property isFront
             * @public
             * @since 1.0.0
             * @type {boolean}
             * @default true
             * @readonly
             */
            this.isFront = true;
            /**
             * 当前动画的总帧数
             * @property totalFrames
             * @public
             * @since 1.0.0
             * @type {number}
             * @default 1
             * @readonly
             */
            this.totalFrames = 1;
            this._scriptLayer = [];
            this._labelFrame = {};
            this._frameLabel = {};
            this._isNeedUpdateChildren = true;
            this._isUpdateFrame = false;
            this._isF2xMc = true;
            this._mouseEvent = function (e) {
                if (e.type == MouseEvent.TOUCH_BEGIN) {
                    this.gotoAndStop(2);
                }
                else {
                    this.gotoAndStop(1);
                }
            };
            var s = this;
            s.addChild(s.floatView);
        }
        /**
         * 调用止方法将停止当前帧
         * @method stop
         * @public
         * @since 1.0.0
         */
        MovieClip.prototype.stop = function () {
            var s = this;
            //s._isNeedUpdateChildren = true;
            s.isPlaying = false;
        };
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method as
         * @private
         * @since 1.0.0
         * @param {Function} frameScript
         * @param {number} frameIndex
         */
        MovieClip.prototype.as = function (frameScript, frameIndex) {
            var s = this;
            s._scriptLayer[frameIndex] = frameScript;
        };
        /**
         * 给时间轴添加回调函数,当时间轴播放到当前帧时,此函数将被调用.注意,之前在此帧上添加的所有代码将被覆盖,包括从Fla文件中当前帧的代码.
         * @method addFrameScript
         * @public
         * @since 1.0.0
         * @param {number} frameIndex {number} 要将代码添加到哪一帧,从0开始.0就是第一帧,1是第二帧...
         * @param {Function}frameScript {Function} 时间轴播放到当前帧时要执行回调方法
         */
        MovieClip.prototype.addFrameScript = function (frameIndex, frameScript) {
            var s = this;
            s.as(frameScript, frameIndex);
        };
        /**
         * @移除帧上的回调方法
         * @method removeFrameScript
         * @public
         * @since 1.0.0
         * @param {number} frameIndex
         */
        MovieClip.prototype.removeFrameScript = function (frameIndex) {
            var s = this;
            if (s._scriptLayer[frameIndex]) {
                s._scriptLayer[frameIndex] = null;
            }
        };
        //addLayer
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method a
         * @private
         * @since 1.0.0
         * @returns {annie.MovieClip}
         */
        MovieClip.prototype.a = function () {
            var s = this;
            s._currentLayer = [];
            s._timeline.unshift(s._currentLayer);
            return s;
        };
        //addFrame
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method b
         * @private
         * @since 1.0.0
         * @returns {annie.MovieClip}
         * @param {number} count
         */
        MovieClip.prototype.b = function (count) {
            var s = this;
            s._currentLayerFrame = new McFrame();
            s._currentLayerFrame.keyIndex = s._currentLayer.length;
            for (var i = 0; i < count; i++) {
                s._currentLayer.push(s._currentLayerFrame);
            }
            if (s.totalFrames < s._currentLayer.length) {
                s.totalFrames = s._currentLayer.length;
            }
            return s;
        };
        //setFrameDisplay
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method c
         * @private
         * @since 1.0.0
         * @param {annie.DisplayObject} display
         * @param {Object} displayBaseInfo
         * @param {Object} displayExtendInfo
         * @returns {annie.MovieClip}
         */
        MovieClip.prototype.c = function (display, displayBaseInfo, displayExtendInfo) {
            if (displayBaseInfo === void 0) { displayBaseInfo = null; }
            if (displayExtendInfo === void 0) { displayExtendInfo = null; }
            var s = this;
            s._currentLayerFrame.setDisplayInfo(display, displayBaseInfo, displayExtendInfo);
            return s;
        };
        //setGraphic
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method g
         * @private
         * @since 1.0.0
         * @param loopType
         * @param {number} firstFrame
         * @param {number} parentFrameIndex
         * @returns {annie.MovieClip}
         */
        MovieClip.prototype.g = function (loopType, firstFrame, parentFrameIndex) {
            var s = this;
            s._currentLayerFrame.setGraphicInfo(loopType, firstFrame, parentFrameIndex);
            return s;
        };
        /**
         * 当将mc设置为图形动画模式时需要设置的相关信息 Flash2x工具调用的方法,用户一般不需要使用
         * @method setGraphicInfo
         * @public
         * @since 1.0.0
         * @param{Object} graphicInfo
         */
        MovieClip.prototype.setGraphicInfo = function (graphicInfo) {
            var s = this;
            s._graphicInfo = graphicInfo;
        };
        /**
         * 将一个mc变成按钮来使用 如果mc在于2帧,那么点击此mc将自动有被按钮的状态,无需用户自己写代码
         * @method initButton
         * @public
         * @since 1.0.0
         */
        MovieClip.prototype.initButton = function () {
            var s = this;
            //将mc设置成按钮形式
            if (s.totalFrames > 1) {
                s.gotoAndStop(1);
                s.addEventListener(MouseEvent.TOUCH_BEGIN, s._mouseEvent.bind(s), s);
                s.addEventListener(MouseEvent.TOUCH_END, s._mouseEvent.bind(s), s);
            }
        };
        //setLabelFrame;
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method d
         * @private
         * @since 1.0.0
         * @param {string} name
         * @param {number} index
         * @returns {annie.MovieClip}
         */
        MovieClip.prototype.d = function (name, index) {
            var s = this;
            s._labelFrame[name] = index + 1;
            s._frameLabel[index + 1] = name;
            return s;
        };
        //getFrameLabel
        /**
         * mc的当前帧的标签名,没有则为空
         * @method getCurrentLabel
         * @public
         * @since 1.0.0
         * @returns {string}
         * */
        MovieClip.prototype.getCurrentLabel = function () {
            var s = this;
            return s._frameLabel[s.currentFrame] ? s._frameLabel[s.currentFrame] : "";
        };
        //setFrameEvent
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method e
         * @private
         * @since 1.0.0
         * @param {string} eventName
         * @returns {annie.MovieClip}
         */
        MovieClip.prototype.e = function (eventName) {
            var s = this;
            s._currentLayerFrame.eventName = eventName;
            return s;
        };
        //setSoundName
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method f
         * @private
         * @since 1.0.0
         * @param {string} sceneName
         * @param {string} soundName
         * @param {number} times
         * @returns {annie.MovieClip}
         */
        MovieClip.prototype.f = function (sceneName, soundName, times) {
            var s = this;
            s._currentLayerFrame.soundName = soundName;
            s._currentLayerFrame.soundScene = sceneName;
            s._currentLayerFrame.soundTimes = times;
            return s;
        };
        /**
         * 将播放头向后移一帧并停在下一帧,如果本身在最后一帧则不做任何反应
         * @method nextFrame
         * @since 1.0.0
         * @public
         */
        MovieClip.prototype.nextFrame = function () {
            var s = this;
            if (s.currentFrame < s.totalFrames) {
                s.currentFrame++;
                s._isNeedUpdateChildren = true;
            }
            s.isPlaying = false;
            s._isUpdateFrame = false;
        };
        /**
         * 将播放头向前移一帧并停在下一帧,如果本身在第一帧则不做任何反应
         * @method prevFrame
         * @since 1.0.0
         * @public
         */
        MovieClip.prototype.prevFrame = function () {
            var s = this;
            if (s.currentFrame > 1) {
                s.currentFrame--;
                s._isNeedUpdateChildren = true;
            }
            s.isPlaying = false;
            s._isUpdateFrame = false;
        };
        /**
         * 将播放头跳转到指定帧并停在那一帧,如果本身在第一帧则不做任何反应
         * @method gotoAndStop
         * @public
         * @since 1.0.0
         * @param {number} frameIndex{number|string} 批定帧的帧数或指定帧的标签名
         */
        MovieClip.prototype.gotoAndStop = function (frameIndex) {
            var s = this;
            s.isPlaying = false;
            var tempFrame;
            if (typeof (frameIndex) == "string") {
                if (s._labelFrame[frameIndex] != undefined) {
                    tempFrame = s._labelFrame[frameIndex];
                }
                else {
                    console.log("未找到帧标签叫'" + frameIndex + "'的帧");
                }
            }
            else if (typeof (frameIndex) == "number") {
                if (frameIndex > s.totalFrames) {
                    frameIndex = s.totalFrames;
                }
                if (frameIndex < 1) {
                    frameIndex = 1;
                }
                tempFrame = frameIndex;
            }
            if (s.currentFrame != tempFrame) {
                s.currentFrame = tempFrame;
                s._isNeedUpdateChildren = true;
                s._isUpdateFrame = false;
            }
        };
        /**
         * 如果当前时间轴停在某一帧,调用此方法将继续播放.
         * @method play
         * @public
         * @since 1.0.0
         */
        MovieClip.prototype.play = function (isFront) {
            if (isFront === void 0) { isFront = true; }
            var s = this;
            s.isPlaying = true;
            if (isFront == undefined) {
                s.isFront = true;
            }
            else {
                s.isFront = isFront;
            }
            s._isUpdateFrame = true;
        };
        /**
         * 将播放头跳转到指定帧并从那一帧开始继续播放
         * @method gotoAndPlay
         * @public
         * @since 1.0.0
         * @param {number} frameIndex 批定帧的帧数或指定帧的标签名
         * @param {boolean} isFront 跳到指定帧后是向前播放, 还是向后播放.不设置些参数将默认向前播放
         */
        MovieClip.prototype.gotoAndPlay = function (frameIndex, isFront) {
            if (isFront === void 0) { isFront = true; }
            var s = this;
            if (isFront == undefined) {
                s.isFront = true;
            }
            else {
                s.isFront = isFront;
            }
            s.isPlaying = true;
            var tempFrame;
            if (typeof (frameIndex) == "string") {
                if (s._labelFrame[frameIndex] != undefined) {
                    tempFrame = s._labelFrame[frameIndex];
                }
                else {
                    console.log("未找到帧标签叫'" + frameIndex + "'的帧");
                }
            }
            else if (typeof (frameIndex) == "number") {
                if (frameIndex > s.totalFrames) {
                    frameIndex = s.totalFrames;
                }
                if (frameIndex < 1) {
                    frameIndex = 1;
                }
                tempFrame = frameIndex;
            }
            if (s.currentFrame != tempFrame) {
                s.currentFrame = tempFrame;
                s._isUpdateFrame = false;
                s._isNeedUpdateChildren = true;
            }
        };
        /**
         * 动画播放过程中更改movieClip中的一个child的显示属性，
         * 如果是停止状态，可以直接设置子级显示属性
         * 因为moveClip在播放的过程中是无法更新子级的显示属性的，
         * 比如你要更新子级的坐标，透明度，旋转等等，这些更改都会无效
         * 因为，moveClip自己记录了子级每一帧的这些属性，所有你需要通过
         * 此方法告诉moveClip我要自己控制这些属性
         * @method setFrameChild
         * @public
         * @since 1.0.0
         * @param {annie.DisplayObject} child
         * @param {Object} attr
         */
        MovieClip.prototype.setFrameChild = function (child, attr) {
            child._donotUpdateinMC = child._donotUpdateinMC || {};
            for (var i in attr) {
                if (attr[i] != null) {
                    child._donotUpdateinMC[i] = attr[i];
                }
                else {
                    delete child._donotUpdateinMC[attr[i]];
                }
            }
        };
        /**
         * 重写刷新
         * @method update
         * @public
         * @since 1.0.0
         */
        MovieClip.prototype.$updateF2xMc = function () {
            var s = this;
            if (s.visible) {
                if (s._graphicInfo) {
                    //核心代码
                    //loopType,firstFrame,parentFrameIndex
                    var curParentFrameIndex = s.parent["currentFrame"] ? s.parent["currentFrame"] : 1;
                    var tempCurrentFrame = 1;
                    var pStartFrame = s._graphicInfo.parentFrameIndex + 1;
                    var cStartFrame = s._graphicInfo.firstFrame + 1;
                    if (s._graphicInfo.loopType == "play once") {
                        if (curParentFrameIndex - pStartFrame >= 0) {
                            tempCurrentFrame = curParentFrameIndex - pStartFrame + cStartFrame;
                            if (tempCurrentFrame > s.totalFrames) {
                                tempCurrentFrame = s.totalFrames;
                            }
                        }
                    }
                    else if (s._graphicInfo.loopType == "loop") {
                        if (curParentFrameIndex - pStartFrame >= 0) {
                            tempCurrentFrame = (curParentFrameIndex - pStartFrame + cStartFrame) % s.totalFrames;
                        }
                        if (tempCurrentFrame == 0) {
                            tempCurrentFrame = s.totalFrames;
                        }
                    }
                    else {
                        tempCurrentFrame = cStartFrame;
                    }
                    if (s.currentFrame != tempCurrentFrame) {
                        s.currentFrame = tempCurrentFrame;
                        s._isNeedUpdateChildren = true;
                    }
                    s.isPlaying = false;
                }
                else {
                    if (s.isPlaying && s._isUpdateFrame) {
                        //核心代码
                        if (s.isFront) {
                            s.currentFrame++;
                            if (s.currentFrame > s.totalFrames) {
                                s.currentFrame = 1;
                            }
                        }
                        else {
                            s.currentFrame--;
                            if (s.currentFrame < 1) {
                                s.currentFrame = s.totalFrames;
                            }
                        }
                        s._isNeedUpdateChildren = true;
                    }
                }
                s._isUpdateFrame = true;
                if (s._isNeedUpdateChildren) {
                    var t = -1;
                    var layerCount = s._timeline.length;
                    var frameCount = 0;
                    var frame = null;
                    var displayObject = null;
                    var infoObject = null;
                    var frameChildrenCount = 0;
                    var lastFrameChildren = [];
                    var frameEvents = [];
                    var children = s.$children;
                    var cLen = children.length;
                    for (var i = 0; i < cLen - 1; i++) {
                        lastFrameChildren.push(children[i]);
                    }
                    for (var i = 0; i < layerCount; i++) {
                        frameCount = s._timeline[i].length;
                        if (s.currentFrame <= frameCount) {
                            frame = s._timeline[i][s.currentFrame - 1];
                            if (frame == undefined)
                                continue;
                            if (frame.keyIndex == (s.currentFrame - 1)) {
                                if (frame.soundName != "") {
                                    Flash2x.getMediaByName(frame.soundScene, frame.soundName).play(0, frame.soundTimes);
                                }
                                if (frame.eventName != "" && s.hasEventListener("onCallFrame")) {
                                    var event_1 = new Event("onCallFrame");
                                    event_1.data = { frameIndex: s.currentFrame, frameName: frame.eventName };
                                    frameEvents.push(event_1);
                                }
                            }
                            frameChildrenCount = frame.frameChildList.length;
                            for (var j = 0; j < frameChildrenCount; j++) {
                                infoObject = frame.frameChildList[j];
                                displayObject = infoObject.display;
                                displayObject.x = infoObject.x;
                                displayObject.y = infoObject.y;
                                displayObject.scaleX = infoObject.scaleX;
                                displayObject.scaleY = infoObject.scaleY;
                                displayObject.rotation = infoObject.rotation;
                                displayObject.skewX = infoObject.skewX;
                                displayObject.skewY = infoObject.skewY;
                                displayObject.alpha = infoObject.alpha;
                                if (infoObject.filters) {
                                    displayObject.filters = infoObject.filters;
                                }
                                else {
                                    displayObject.filters = null;
                                }
                                if (infoObject.graphicInfo) {
                                    displayObject._graphicInfo = infoObject.graphicInfo;
                                }
                                else {
                                    if (displayObject._graphicInfo) {
                                        displayObject._graphicInfo = null;
                                    }
                                }
                                if (displayObject._donotUpdateinMC != undefined) {
                                    for (var o in displayObject._donotUpdateinMC) {
                                        if (displayObject._donotUpdateinMC[o] != undefined) {
                                            displayObject[o] = displayObject._donotUpdateinMC[o];
                                        }
                                    }
                                }
                                t = lastFrameChildren.indexOf(displayObject);
                                if (t < 0) {
                                    s.addChild(displayObject);
                                }
                                else {
                                    s.$doAddChild(displayObject, 10000, false);
                                    lastFrameChildren.splice(t, 1);
                                }
                                if (displayObject.$mask) {
                                    displayObject.$mask.gotoAndStop(s.currentFrame);
                                    s.$doAddChild(displayObject.$mask, 10000, false);
                                    t = lastFrameChildren.indexOf(displayObject.$mask);
                                    if (t >= 0) {
                                        lastFrameChildren.splice(t, 1);
                                    }
                                }
                                if (displayObject._f2xShape) {
                                    displayObject.x += displayObject._f2xShape._cacheX;
                                    displayObject.y += displayObject._f2xShape._cacheY;
                                }
                            }
                        }
                    }
                    s._isNeedUpdateChildren = false;
                    //update一定要放在事件处理之前
                    var len = lastFrameChildren.length;
                    for (var i = 0; i < len; i++) {
                        s.removeChild(lastFrameChildren[i]);
                        annie.MovieClip._onInitF2xMc(lastFrameChildren[i]);
                    }
                    s.$doAddChild(s.floatView, 10000, false);
                    //看看是否到了第一帧，或是最后一帧,如果是准备事件
                    if ((s.currentFrame == 1 && !s.isFront) || (s.currentFrame == s.totalFrames && s.isFront)) {
                        if (s.hasEventListener("onEndFrame")) {
                            var event_2 = new Event("onEndFrame");
                            event_2.data = {
                                frameIndex: s.currentFrame,
                                frameName: s.currentFrame == 1 ? "firstFrame" : "endFrame"
                            };
                            frameEvents.push(event_2);
                        }
                    }
                    //看看是否有帧事件,有则派发
                    len = frameEvents.length;
                    for (var i = 0; i < len; i++) {
                        s.dispatchEvent(frameEvents[i]);
                    }
                    //看看是否有回调,有则调用
                    if (s._scriptLayer[s.currentFrame - 1] != undefined) {
                        s._scriptLayer[s.currentFrame - 1]();
                    }
                }
            }
        };
        /**
         * 触发显示列表上相关的事件
         * @method _onDispatchBubbledEvent
         * @private
         */
        MovieClip._onInitF2xMc = function (s) {
            if (s._isF2xMc) {
                s.currentFrame = 1;
                s.isPlaying = true;
                s.isFront = true;
                s._isNeedUpdateChildren = true;
                s._isUpdateFrame = false;
            }
            //for循环处理所有的mc
            if (s.$children) {
                for (var i = 0; i < s.$children.length; i++) {
                    annie.MovieClip._onInitF2xMc(s.$children[i]);
                }
            }
        };
        return MovieClip;
    }(DisplayObjectContainer));
    annie.MovieClip = MovieClip;
})(annie || (annie = {}));
/**
 * @module annie
 */
var annie;
(function (annie) {
    var Texture = egret.Texture;
    var BitmapData = egret.BitmapData;
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
            if (bitmap.bitmapData) {
                var img = bitmap.bitmapData.source;
                var w = bitmap.textureWidth;
                var h = bitmap.textureHeight;
                if (w == img.width && h == img.height) {
                    return img;
                }
                var _canvas = Shape._canvas;
                _canvas.width = w;
                _canvas.height = h;
                var ctx = _canvas.getContext("2d");
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(img, bitmap._bitmapX, bitmap._bitmapY, w, h, 0, 0, w, h);
                var _realCacheImg = window.document.createElement("img");
                _realCacheImg.src = _canvas.toDataURL("image/png");
                return _realCacheImg;
            }
            else if (bitmap.source) {
                return bitmap.source;
            }
            else {
                return bitmap;
            }
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
         * @returns egret.Texture
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
                    leftX -= lineWidth >> 1;
                    leftY -= lineWidth >> 1;
                    s._cacheX = leftX;
                    s._cacheY = leftY;
                    buttonRightX += lineWidth >> 1;
                    buttonRightY += lineWidth >> 1;
                    var w = buttonRightX - leftX;
                    var h = buttonRightY - leftY;
                    ///////////////////////////
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
            s.texture.bitmapData = new BitmapData(s._cacheImg);
            s.texture.$initData(0, 0, s._cacheImg.width, s._cacheImg.height, 0, 0, s._cacheImg.width, s._cacheImg.height, s._cacheImg.width, s._cacheImg.height);
            return s.texture;
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
/**
 * @module annie
 */
var annie;
(function (annie) {
    var Event = egret.Event;
    /**
     * 抽象类 一般不直接使用
     * @class annie.Media
     * @extends egret.EventDispatcher
     * @public
     * @since 1.0.0
     */
    var Media = (function (_super) {
        __extends(Media, _super);
        /**
         * 构造函数
         * @method Media
         * @param {string|HtmlElement} src
         * @param {string} type
         * @since 1.0.0
         */
        function Media(src, type) {
            _super.call(this);
            /**
             * html 标签 有可能是audio 或者 video
             * @property media
             * @type {Video|Audio}
             * @public
             * @since 1.0.0
             */
            this.media = null;
            /**
             * 媒体类型 VIDEO 或者 AUDIO
             * @type {string}
             * @since 1.0.0
             * @since 1.0.0
             */
            this.type = "";
            this._loop = 0;
            var s = this;
            if (typeof (src) == "string") {
                s.media = document.createElement(type);
                s.media.src = src;
            }
            else {
                s.media = src;
            }
            s._SBWeixin = s._weixinSB.bind(s);
            s.media.addEventListener('ended', function () {
                s._loop--;
                if (s._loop > 0) {
                    s.play(0, s._loop);
                }
                else {
                    s.media.pause();
                }
                s.dispatchEvent(new Event("onPlayEnd"));
            }.bind(s), false);
            s.type = type.toLocaleUpperCase();
            s.media.addEventListener("timeupdate", function () {
                var e = new Event("onPlayUpdate");
                e.data = { currentTime: s.media.currentTime };
                s.dispatchEvent(e);
            }, false);
        }
        /**
         * 开始播放媒体
         * @method play
         * @param {number} start 开始点 默认为0
         * @param {number} loop 循环次数 默认为1
         * @public
         * @since 1.0.0
         */
        Media.prototype.play = function (start, loop) {
            if (start === void 0) { start = 1; }
            if (loop === void 0) { loop = 1; }
            var s = this;
            s._loop = loop;
            //TODO 好像设置了也没什么用，后期再看看
            try {
                s.media.currentTime = start;
            }
            catch (e) {
                console.log(e);
            }
            //马蛋的有些ios微信无法自动播放,需要做一些特殊处理
            try {
                WeixinJSBridge.invoke("getNetworkType", {}, s._SBWeixin);
            }
            catch (e) {
                s.media.play();
            }
        };
        Media.prototype._weixinSB = function () {
            this.media.play();
        };
        /**
         * 停止播放
         * @method stop
         * @public
         * @since 1.0.0
         */
        Media.prototype.stop = function () {
            this.media.pause();
            this.media.currentTime = 0;
        };
        /**
         * 暂停播放,或者恢复播放
         * @method pause
         * @public
         * @param isPause  默认为true;是否要暂停，如果要暂停，则暂停；否则则播放 1.0.4新增的参数
         * @since 1.0.4
         */
        Media.prototype.pause = function (isPause) {
            if (isPause === void 0) { isPause = true; }
            if (isPause) {
                this.media.pause();
            }
            else {
                this.media.play();
            }
        };
        return Media;
    }(egret.EventDispatcher));
    annie.Media = Media;
})(annie || (annie = {}));
/**
 * @module annie
 */
var annie;
(function (annie) {
    /**
     * 声音类
     * @class annie.Sound
     * @extends annie.Media
     * @public
     * @since 1.0.0
     */
    var Sound = (function (_super) {
        __extends(Sound, _super);
        function Sound(src) {
            _super.call(this, src, "Audio");
        }
        return Sound;
    }(annie.Media));
    annie.Sound = Sound;
})(annie || (annie = {}));
/**
 * @module annie
 */
var annie;
(function (annie) {
    /**
     * 视频类
     * @class annie.Video
     * @extends annie.Media
     * @public
     * @since 1.0.0
     */
    var Video = (function (_super) {
        __extends(Video, _super);
        function Video(src, width, height) {
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            _super.call(this, src, "Video");
            var s = this;
            s.media.setAttribute("playsinline", "true");
            s.media.setAttribute("webkit-playsinline", "true");
            s.media.setAttribute("x-webkit-airplay", "true");
            s.media.setAttribute("x5-video-player-type", "h5");
            s.media.poster = "";
            s.media.preload = "auto";
            s.media.controls = false;
            if (width && height) {
                s.media.width = width;
                s.media.height = height;
            }
        }
        return Video;
    }(annie.Media));
    annie.Video = Video;
})(annie || (annie = {}));
/**
 * @module annie
 */
var annie;
(function (annie) {
    var EventDispatcher = egret.EventDispatcher;
    var Event = egret.Event;
    annie.Eval = eval.bind(window);
    /**
     * 资源加载类,后台请求,加载资源和后台交互都可以使用此类
     * @class annie.URLLoader
     * @extends egret.EventDispatcher
     * @public
     * @since 1.0.0
     */
    var URLLoader = (function (_super) {
        __extends(URLLoader, _super);
        /**
         * @param type text json js xml image sound css svg video unKnow
         */
        function URLLoader() {
            _super.call(this);
            this.headers = [];
            /**
             * 后台返回来的数据类弄
             * @property responseType
             * @type {string}
             * @default null
             * @public
             * @since 1.0.0
             */
            this.responseType = null;
            /**
             * 请求的url地址
             * @property url
             * @public
             * @since 1.0.0
             * @type {string}
             */
            this.url = "";
            /**
             * 请求后台的类型 get post
             * @property method
             * @type {string}
             * @default get
             * @public
             * @since 1.0.0
             */
            this.method = "get";
            /**
             * 需要像后台传送的数据对象
             * @property data
             * @public
             * @since 1.0.0
             * @default null
             * @type {Object}
             */
            this.data = null;
            /**
             * 格式化post请求参数
             * @method _fqs
             * @param data
             * @param query
             * @return {string}
             * @private
             * @since 1.0.0
             */
            this._fqs = function (data, query) {
                var params = [];
                if (data) {
                    for (var n in data) {
                        params.push(encodeURIComponent(n) + "=" + encodeURIComponent(data[n]));
                    }
                }
                if (query) {
                    params = params.concat(query);
                }
                return params.join("&");
            };
            //formatURIString
            /**
             * 格式化get 请求参数
             * @method _fus
             * @param src
             * @param data
             * @return {any}
             * @private
             */
            this._fus = function (src, data) {
                var s = this;
                if (data == null || data == "") {
                    return src;
                }
                var query = [];
                var idx = src.indexOf("?");
                if (idx != -1) {
                    var q = src.slice(idx + 1);
                    query = query.concat(q.split("&"));
                    return src.slice(0, idx) + "?" + s._fqs(data, query);
                }
                else {
                    return src + "?" + s._fqs(data, query);
                }
            };
        }
        /**
         * 取消加载
         * @method loadCancel
         * @public
         * @since 1.0.0
         */
        URLLoader.prototype.loadCancel = function () {
            var s = this;
            if (s._req) {
                s._req.abort();
            }
        };
        /**
         * 加载或请求数据
         * @method load
         * @public
         * @since 1.0.0
         * @param {string} url
         * @param {string} contentType 如果请求类型需要设置主体类型，有form json binary jsonp等，请设置 默认为form
         */
        URLLoader.prototype.load = function (url, contentType) {
            if (contentType === void 0) { contentType = "form"; }
            var s = this;
            s.loadCancel();
            if (s.responseType == null || s.responseType == "") {
                //看看是什么后缀
                var urlSplit = url.split(".");
                var extStr = urlSplit[urlSplit.length - 1];
                var ext = extStr.split("?")[0].toLocaleLowerCase();
                if (ext == "mp3" || ext == "ogg" || ext == "wav") {
                    s.responseType = "sound";
                }
                else if (ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif") {
                    s.responseType = "image";
                }
                else if (ext == "css") {
                    s.responseType = "css";
                }
                else if (ext == "mp4") {
                    s.responseType = "video";
                }
                else if (ext == "svg") {
                    s.responseType = "svg";
                }
                else if (ext == "xml") {
                    s.responseType = "xml";
                }
                else if (ext == "json") {
                    s.responseType = "json";
                }
                else if (ext == "txt") {
                    s.responseType = "text";
                }
                else if (ext == "js" || ext == "swf") {
                    s.responseType = "js";
                }
                else {
                    s.responseType = "unKnow";
                }
            }
            var req = null;
            if (!s._req) {
                s._req = new XMLHttpRequest();
                req = s._req;
                req.withCredentials = false;
                req.onprogress = function (event) {
                    if (!event || event.loaded > 0 && event.total == 0) {
                        return; // Sometimes we get no "total", so just ignore the progress event.
                    }
                    var ep = new Event("onProgress");
                    ep.data = { loadedBytes: event.loaded, totalBytes: event.total };
                    s.dispatchEvent(ep);
                };
                req.onerror = function (event) {
                    reSendTimes++;
                    if (reSendTimes > 3) {
                        var event = new Event("onError");
                        event.data = { id: 2, msg: event["message"] };
                        s.dispatchEvent(event);
                    }
                    else {
                        //断线重连
                        req.abort();
                        if (!s.data) {
                            req.send();
                        }
                        else {
                            if (contentType == "form") {
                                req.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
                                req.send(s._fqs(s.data, null));
                            }
                            else {
                                var type = "application/json";
                                if (contentType != "json") {
                                    type = "multipart/form-data";
                                }
                                req.setRequestHeader("Content-type", type + ";charset=UTF-8");
                                req.send(s.data);
                            }
                        }
                    }
                };
                req.onreadystatechange = function (event) {
                    var t = event.target;
                    if (t["readyState"] == 4) {
                        if (req.status == 200) {
                            var e = new Event(Event.COMPLETE);
                            try {
                                var result = t["response"];
                                e.data = { type: s.responseType, response: null };
                                var item = void 0;
                                switch (s.responseType) {
                                    case "css":
                                        item = document.createElement("link");
                                        item.rel = "stylesheet";
                                        item.href = s.url;
                                        break;
                                    case "image":
                                    case "sound":
                                    case "video":
                                        var itemObj_1;
                                        if (s.responseType == "image") {
                                            itemObj_1 = document.createElement("img");
                                            itemObj_1.onload = function () {
                                                URL.revokeObjectURL(itemObj_1.src);
                                                itemObj_1.onload = null;
                                            };
                                            itemObj_1.src = URL.createObjectURL(result);
                                            item = itemObj_1;
                                        }
                                        else {
                                            if (s.responseType == "sound") {
                                                itemObj_1 = document.createElement("AUDIO");
                                                item = new annie.Sound(itemObj_1);
                                            }
                                            else if (s.responseType == "video") {
                                                itemObj_1 = document.createElement("VIDEO");
                                                item = new annie.Video(itemObj_1);
                                            }
                                            itemObj_1.preload = true;
                                            itemObj_1.src = s.url;
                                        }
                                        break;
                                    case "json":
                                        item = JSON.parse(result);
                                        break;
                                    case "js":
                                        item = "JS_CODE";
                                        annie.Eval(result);
                                        break;
                                    case "text":
                                    case "unKnow":
                                    case "xml":
                                    default:
                                        item = result;
                                        break;
                                }
                                e.data["response"] = item;
                                s.data = null;
                                s.responseType = "";
                            }
                            catch (e) {
                                var errorEvent = new Event("onError");
                                errorEvent.data = { id: 0, msg: "服务器返回信息有误" };
                                s.dispatchEvent(errorEvent);
                            }
                            s.dispatchEvent(e);
                        }
                        else {
                            //服务器返回报错
                            var errorEvent = new Event("onError");
                            errorEvent.data = { id: 0, msg: "访问地址不存在" };
                            s.dispatchEvent(errorEvent);
                        }
                    }
                };
            }
            else {
                req = s._req;
            }
            var reSendTimes = 0;
            if (s.data && s.method.toLocaleLowerCase() == "get") {
                s.url = s._fus(url, s.data);
                s.data = null;
            }
            else {
                s.url = url;
            }
            if (s.responseType == "image" || s.responseType == "sound" || s.responseType == "video") {
                req.responseType = "blob";
            }
            else {
                req.responseType = "text";
            }
            req.open(s.method, s.url, true);
            if (s.headers.length > 0) {
                for (var h = 0; h < s.headers.length; h += 2) {
                    req.setRequestHeader(s.headers[h], s.headers[h + 1]);
                }
                s.headers.length = 0;
            }
            if (!s.data) {
                req.send();
            }
            else {
                if (contentType == "form") {
                    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
                    req.send(s._fqs(s.data, null));
                }
                else {
                    var type = "application/json";
                    if (contentType != "json") {
                        type = "multipart/form-data";
                    }
                    req.setRequestHeader("Content-type", type + ";charset=UTF-8");
                    req.send(s.data);
                }
            }
            /*req.onloadstart = function (e) {
             s.event("onStart");
             };*/
        };
        /**
         * 添加自定义头
         * @addHeader
         * @param name
         * @param value
         */
        URLLoader.prototype.addHeader = function (name, value) {
            this.headers.push(name, value);
        };
        return URLLoader;
    }(EventDispatcher));
    annie.URLLoader = URLLoader;
})(annie || (annie = {}));
/**
 * Flash资源加载或者管理类，静态类，不可实例化
 * 一般都是初始化或者设置从Flash里导出的资源
 * @class Flash2x
 */
var Flash2x;
(function (Flash2x) {
    var URLLoader = annie.URLLoader;
    var Event = egret.Event;
    var Texture = egret.Texture;
    var Bitmap = egret.Bitmap;
    var BitmapData = egret.BitmapData;
    var _isReleased = false;
    /**
     * 存储加载资源的总对象
     * @type {Object}
     */
    var res = {};
    /**
     * 加载器是否正在加载中
     */
    var _isLoading;
    /**
     * 加载中的场景名列表
     */
    var _loadSceneNames;
    /**
     * 加载地址的域名地址或前缀
     */
    var _domain;
    /**
     * 当前加载到哪一个资源
     */
    var _loadIndex;
    /**
     * 当前加载的总资源数
     */
    var _totalLoadRes;
    /**
     * 当前已经加载的资源数
     */
    var _loadedLoadRes;
    /**
     * 加载资源的完成回调
     */
    var _completeCallback;
    /**
     * 加载资源时的进度回调
     */
    var _progressCallback;
    /**
     * 加载配置文件的加载器
     */
    var _JSONQueue;
    /**
     * 加载资源文件的加载器
     */
    var _loaderQueue;
    /**
     * 加载器是否初始化过
     */
    var _isInited;
    /**
     * 当前加载的资源配置文件内容
     */
    var _currentConfig;
    /**
     * 获取当前加载的时间当作随机数用
     */
    var _time;
    /**
     * 加载资源数和总资源数的比
     */
    var _loadPer;
    /**
     * 单个资源占总资源数的比
     */
    var _loadSinglePer;
    /**
     * 加载一个flash2x转换的文件内容,如果未加载完成继续调用此方法将会刷新加载器,中断未被加载完成的资源!
     * @method loadScene
     * @public
     * @static
     * @since 1.0.0
     * @param {string} sceneName fla通过flash2x转换时设置的包名
     * @param {Function} progressFun 加载进度回调,回调参数为当前的进度值1-100.
     * @param {Function} completeFun 加载完成回高,无回调参数
     * @param {string} domain 加载时要设置的url前缀,默认则不更改加载路径。
     */
    Flash2x.loadScene = function (sceneName, progressFun, completeFun, domain) {
        if (domain === void 0) { domain = ""; }
        //加载资源配置文件
        if (_isLoading) {
            _JSONQueue.loadCancel();
            _loaderQueue.loadCancel();
        }
        _loadSceneNames = [];
        if (domain == undefined) {
            domain = "";
        }
        _domain = domain;
        if (typeof (sceneName) == "string") {
            if (!isLoadedScene(sceneName)) {
                _loadSceneNames.push(sceneName);
                res[sceneName] = new Object();
            }
        }
        else {
            var len = sceneName.length;
            for (var i = 0; i < len; i++) {
                if (!isLoadedScene(sceneName[i])) {
                    res[sceneName[i]] = new Object();
                    _loadSceneNames.push(sceneName[i]);
                }
            }
        }
        if (_loadSceneNames.length == 0) {
            if (completeFun) {
                completeFun();
            }
            return;
        }
        if (!_isInited) {
            _time = new Date().getTime();
            _JSONQueue = new URLLoader();
            _JSONQueue.addEventListener(Event.COMPLETE, onCFGComplete, null);
            _loaderQueue = new URLLoader();
            _loaderQueue.addEventListener(Event.COMPLETE, _onRESComplete, null);
            _loaderQueue.addEventListener("onProgress", _onRESProgress, null);
            _isInited = true;
        }
        _loadPer = 0;
        _loadIndex = 0;
        _totalLoadRes = 0;
        _loadedLoadRes = 0;
        _isLoading = true;
        _completeCallback = completeFun;
        _progressCallback = progressFun;
        _currentConfig = [];
        if (!_isReleased) {
            _loadConfig();
        }
        else {
            //加载正式的单个文件
            _loadIndex = 0;
            _totalLoadRes = _loadSceneNames.length;
            _loadSinglePer = 1 / _totalLoadRes;
            for (var i = 0; i < _totalLoadRes; i++) {
                _currentConfig.push([{ src: "src/" + _loadSceneNames[i] + ".swf" }]);
            }
            _loadRes();
        }
    };
    function _loadConfig() {
        _JSONQueue.load(_domain + "resource/" + _loadSceneNames[_loadIndex] + "/" + _loadSceneNames[_loadIndex] + ".res.json?t=" + _time);
    }
    function onCFGComplete(e) {
        //配置文件加载完成
        var resList = e.data.response;
        _currentConfig.push(resList);
        _totalLoadRes += resList.length;
        _loadIndex++;
        if (_loadSceneNames[_loadIndex]) {
            _loadConfig();
        }
        else {
            //所有配置文件加载完成,那就开始加载资源
            _loadIndex = 0;
            _loadSinglePer = 1 / _totalLoadRes;
            _loadRes();
        }
    }
    function _onRESProgress(e) {
        if (_progressCallback) {
            _progressCallback((_loadPer + e.data.loadedBytes / e.data.totalBytes * _loadSinglePer) * 100 >> 0);
        }
    }
    function _onRESComplete(e) {
        var scene = _loadSceneNames[_loadIndex];
        if (!_isReleased) {
            if (e.data.type != "js" && e.data.type != "css") {
                var id = _currentConfig[_loadIndex][0].id;
                res[scene][id] = e.data.response;
            }
        }
        else {
            var F2x = Flash2x;
            var JSResItem = F2x[scene + "Res"];
            for (var item in JSResItem) {
                var resItem;
                if (JSResItem[item].indexOf("audio/") > 0) {
                    resItem = new annie.Sound(JSResItem[item]);
                }
                else if (JSResItem[item].indexOf("image/") > 0) {
                    resItem = new Image();
                    resItem.src = JSResItem[item];
                }
                else {
                    resItem = JSON.parse(JSResItem[item]);
                }
                res[scene][item] = resItem;
            }
            delete F2x[scene + "Res"];
        }
        _checkComplete();
    }
    function _checkComplete() {
        _loadedLoadRes++;
        _loadPer = _loadedLoadRes / _totalLoadRes;
        _currentConfig[_loadIndex].shift();
        if (_currentConfig[_loadIndex].length > 0) {
            _loadRes();
        }
        else {
            var info = {};
            info.sceneName = _loadSceneNames[_loadIndex];
            _loadIndex++;
            info.sceneId = _loadIndex;
            info.sceneTotal = _loadSceneNames.length;
            if (_loadIndex == _loadSceneNames.length) {
                //全部资源加载完成
                _isLoading = false;
                //_progressCallback(100);
                _completeCallback(info);
            }
            else {
                _completeCallback(info);
                _loadRes();
            }
        }
    }
    function _loadRes() {
        var url = _domain + _currentConfig[_loadIndex][0].src;
        if (_isReleased) {
            _loaderQueue.responseType = "js";
            url += "?v=" + _isReleased;
        }
        _loaderQueue.load(url);
    }
    /**
     * 判断一个场景是否已经被加载
     * @method isLoadedScene
     * @public
     * @static
     * @since 1.0.0
     * @param {string} sceneName
     * @returns {boolean}
     */
    function isLoadedScene(sceneName) {
        if (res[sceneName] != undefined && res[sceneName] != null) {
            return true;
        }
        else {
            return false;
        }
    }
    Flash2x.isLoadedScene = isLoadedScene;
    function $updateFlash2xMovieclip(display) {
        if (display && display.$children) {
            var len = display.$children.length;
            for (var i = 0; i < len; i++) {
                if (display.$children[i]._isF2xMc) {
                    display.$children[i].$updateF2xMc();
                }
                $updateFlash2xMovieclip(display.$children[i]);
            }
        }
    }
    function loopScene(stage) {
        var s = stage;
        s.addEventListener(Event.ENTER_FRAME, function (e) {
            $updateFlash2xMovieclip(s);
        }, null);
    }
    Flash2x.loopScene = loopScene;
    /**
     * 删除一个场景资源,以方便系统垃圾回收
     * @method unLoadScene
     * @public
     * @static
     * @since 1.0.2
     * @param {string} sceneName
     * @param {WebGLRenderingContext} gl 如果是webgl渲染模式，请设置渲染的webgl对象，以方便删除不再需要使用的texture对象
     */
    function unLoadScene(sceneName) {
        delete res[sceneName];
        var scene = eval(sceneName);
        for (var i in scene) {
            delete scene[i];
        }
        eval(sceneName + "=null;");
    }
    Flash2x.unLoadScene = unLoadScene;
    /**
     * 获取已经加载场景中的声音或视频资源
     * @method getMediaByName
     * @public
     * @static
     * @since 1.0.0
     * @param {string} sceneName
     * @param {string} mediaName
     * @returns {any}
     */
    function getMediaByName(sceneName, mediaName) {
        var s = res;
        if (s[sceneName][mediaName]) {
            return s[sceneName][mediaName];
        }
        return null;
    }
    Flash2x.getMediaByName = getMediaByName;
    /**
     * 通过已经加载场景中的图片资源创建Bitmap对象实例,此方法一般给Flash2x工具自动调用
     * @method b
     * @public
     * @since 1.0.0
     * @static
     * @param {string} sceneName
     * @param {string} imageName
     * @returns {any}
     */
    function b(sceneName, imageName, isTexurue) {
        if (isTexurue === void 0) { isTexurue = false; }
        var s = res;
        var isFind = false;
        var t = s[sceneName][imageName];
        if (t) {
            if (!(t.source || t.bitmapData)) {
                t = new BitmapData(t);
                s[sceneName][imageName] = t;
            }
            if (isTexurue)
                return t;
            return new Bitmap(t);
        }
        else {
            var m_1 = 0;
            while (s[sceneName]["F2xSSIMG" + m_1]) {
                var data = s[sceneName]["F2xSSIMGData" + m_1];
                if (data[imageName] != undefined) {
                    isFind = true;
                    var imgData = data[imageName];
                    var spriteSheet = s[sceneName]["F2xSSIMG" + m_1];
                    var t_1 = new Texture();
                    t_1.bitmapData = new BitmapData(spriteSheet);
                    t_1.$initData(imgData.x, imgData.y, imgData.width, imgData.height, 0, 0, imgData.width, imgData.height, spriteSheet.width, spriteSheet.height);
                    s[sceneName][imageName] = t_1;
                    if (isTexurue)
                        return t_1;
                    return new Bitmap(t_1);
                }
                m_1++;
            }
            console.log("未找到资源文件");
            return null;
        }
    }
    Flash2x.b = b;
    /**
     * 用一个对象批量设置另一个对象的属性值,此方法一般给Flash2x工具自动调用
     * @method d
     * @public
     * @static
     * @since 1.0.0
     * @param {Object} display
     * @param {Object} baseInfo
     * @param {Object} extendInfo
     */
    function d(display, baseInfo, extendInfo) {
        if (baseInfo === void 0) { baseInfo = null; }
        if (extendInfo === void 0) { extendInfo = null; }
        if (baseInfo) {
            if (baseInfo.x != undefined) {
                display.x = baseInfo.x;
            }
            if (baseInfo.y != undefined) {
                display.y = baseInfo.y;
            }
            if (baseInfo.a != undefined) {
                display.scaleX = baseInfo.a;
            }
            if (baseInfo.b != undefined) {
                display.scaleY = baseInfo.b;
            }
            if (baseInfo.r != undefined) {
                display.rotation = baseInfo.r;
            }
            if (baseInfo.c != undefined) {
                display.skewX = baseInfo.c;
            }
            if (baseInfo.d != undefined) {
                display.skewY = baseInfo.d;
            }
            if (baseInfo.o != undefined) {
                display.alpha = baseInfo.o;
            }
            if (baseInfo.v != undefined) {
                display.visible = baseInfo.v;
            }
            if (display._f2xShape) {
                display.x += display._f2xShape._cacheX;
                display.y += display._f2xShape._cacheY;
            }
        }
        if (extendInfo && extendInfo.length > 0) {
            console.log("Flash2Egret还不能很好的支持滤镜功能,如果需要推荐使用Flash2AnnieJS,http://annie2x.com");
        }
    }
    Flash2x.d = d;
    /**
     * 创建一个动态文本或输入文本,此方法一般给Flash2x工具自动调用
     * @method t
     * @public
     * @static
     * @since 1.0.0
     * @param {number} type
     * @param {string} text
     * @param {number} size
     * @param {string} color
     * @param {string} face
     * @param {number} top
     * @param {number} left
     * @param {number} width
     * @param {number} height
     * @param {number} lineSpacing
     * @param {string} align
     * @param {boolean} italic
     * @param {boolean} bold
     * @param {string} lineType
     * @param {boolean} showBorder
     * @returns {annie.TextFiled|annie.InputText}
     */
    function t(type, text, size, color, face, top, left, width, height, lineSpacing, align, italic, bold, lineType, showBorder) {
        if (italic === void 0) { italic = false; }
        if (bold === void 0) { bold = false; }
        if (lineType === void 0) { lineType = "single"; }
        if (showBorder === void 0) { showBorder = false; }
        var textObj = new egret.TextField();
        textObj.text = text;
        textObj.italic = italic;
        textObj.size = size;
        textObj.lineSpacing = lineSpacing - size;
        textObj.bold = bold;
        textObj.fontFamily = face;
        textObj.width = width;
        textObj.height = height;
        textObj.wordWrap = true;
        textObj.textColor = parseInt("0x" + color.substring(1));
        textObj.textAlign = align;
        textObj.type = type < 2 ? egret.TextFieldType.DYNAMIC : egret.TextFieldType.INPUT;
        if (lineType != "single") {
            if (lineType == "password") {
                textObj.displayAsPassword = true;
            }
            else {
                textObj.multiline = true;
            }
        }
        textObj.border = showBorder;
        return textObj;
    }
    Flash2x.t = t;
    /**
     * 获取矢量位图填充所需要的位图,为什么写这个方法,是因为作为矢量填充的位图不能存在于SpriteSheet中,要单独画出来才能正确的填充到矢量中
     */
    function sb(sceneName, bitmapName) {
        var sbName = "_f2x_s" + bitmapName;
        if (res[sceneName][sbName]) {
            return res[sceneName][sbName];
        }
        else {
            var bitmapData = null;
            var bitmap = b(sceneName, bitmapName, true);
            if (bitmap) {
                bitmapData = annie.Shape.convertToImage(bitmap);
                res[sceneName][sbName] = bitmapData;
                return bitmapData;
            }
            else {
                console.log("error:矢量位图填充时,未找到位图资源!");
                return null;
            }
        }
    }
    /**
     * 创建一个Shape矢量对象,此方法一般给Flash2x工具自动调用
     * @method s
     * @public
     * @static
     * @since 1.0.0
     * @param {Object} pathObj
     * @param {Object} fillObj
     * @param {Object} strokeObj
     * @returns {egret.Bitmap}
     */
    function s(pathObj, fillObj, strokeObj) {
        var shape = new annie.Shape();
        if (fillObj) {
            if (fillObj.type == 0) {
                shape.beginFill(fillObj.color);
            }
            else if (fillObj.type == 1) {
                shape.beginRadialGradientFill(fillObj.gradient[0], fillObj.gradient[1], fillObj.points);
            }
            else if (fillObj.type == 2) {
                shape.beginLinearGradientFill(fillObj.gradient[0], fillObj.gradient[1], fillObj.points);
            }
            else {
                shape.beginBitmapFill(sb(fillObj.bitmapScene, fillObj.bitmapName), fillObj.matrix);
            }
        }
        if (strokeObj) {
            if (strokeObj.type == 0) {
                shape.beginStroke(strokeObj.color, strokeObj.lineWidth, strokeObj.caps, strokeObj.joints, strokeObj.miter);
            }
            else if (strokeObj.type == 1) {
                shape.beginRadialGradientStroke(strokeObj.gradient[0], strokeObj.gradient[1], strokeObj.points, strokeObj.lineWidth, strokeObj.caps, strokeObj.joints, strokeObj.miter);
            }
            else if (strokeObj.type == 2) {
                shape.beginLinearGradientStroke(strokeObj.gradient[0], strokeObj.gradient[1], strokeObj.points, strokeObj.lineWidth, strokeObj.caps, strokeObj.joints, strokeObj.miter);
            }
            else {
                shape.beginBitmapStroke(sb(strokeObj.bitmapScene, strokeObj.bitmapName), strokeObj.matrix, strokeObj.lineWidth, strokeObj.caps, strokeObj.joints, strokeObj.miter);
            }
        }
        if (pathObj.type == 0) {
            shape.decodePath(pathObj.data);
        }
        else {
            shape.drawRoundRect(pathObj.data.x, pathObj.data.y, pathObj.data.w, pathObj.data.h, pathObj.data.topLeftRadius, pathObj.data.topRightRadius, pathObj.data.bottomLeftRadius, pathObj.data.bottomRightRadius);
        }
        if (fillObj) {
            shape.endFill();
        }
        if (strokeObj) {
            shape.endStroke();
        }
        var sp = new Bitmap(shape.updateTexture());
        sp._f2xShape = shape;
        return sp;
    }
    Flash2x.s = s;
    /**
     * 向后台请求或者传输数据的快速简便方法,比直接用URLLoader要方便,小巧
     * @method ajax
     * @public
     * @since 1.0.0
     * @param info 向后台传送数据所需要设置的信息
     * @param {url} info.url 向后台请求的地址
     * @param {string} info.type 向后台请求的类型 get 和 post,默认为get
     * @param {Function} info.success 发送成功后的回调方法,后台数据将通过参数传回
     * @param {Function} info.error 发送出错后的回调方法,出错信息通过参数传回
     * @param {Object} info.data 向后台发送的信息对象,默认为null
     * @param {string} info.responseType 后台返回数据的类型,默认为"json"
     */
    function ajax(info) {
        var urlLoader = new URLLoader();
        urlLoader.method = info.type == undefined ? "get" : info.type;
        urlLoader.data = info.data == undefined ? null : info.data;
        urlLoader.responseType = info.responseType == undefined ? "text" : info.responseType;
        if (info.success != undefined) {
            urlLoader.addEventListener(Event.COMPLETE, info.success, null);
        }
        if (info.error != undefined) {
            urlLoader.addEventListener("onError", info.error, null);
        }
        urlLoader.load(info.url);
    }
    Flash2x.ajax = ajax;
    var jsonpScript = null;
    /**
     * jsonp调用方法
     * @method jsonp
     * @param url
     * @param type 0或者1 如果是0，后台返回的是data型jsonp 如果是1，后台返回的是方法型jsonp
     * @param callbackName
     * @param callbackFun
     * @static
     * @since 1.0.4
     */
    function jsonp(url, type, callbackName, callbackFun) {
        var w = window;
        if (type == 1) {
            w[callbackName] = callbackFun;
        }
        if (!jsonpScript) {
            jsonpScript = document.createElement('script');
            jsonpScript.onload = function () {
                if (type == 0) {
                    callbackFun(w[callbackName]);
                }
                jsonpScript.src = "";
                w[callbackName] = null;
                delete w[callbackName];
            };
            document.getElementsByTagName('head')[0].appendChild(jsonpScript);
        }
        var param;
        if (url.indexOf("?") > 0) {
            param = "&";
        }
        else {
            param = "?";
        }
        jsonpScript.src = url + param + "a_n_n_i_e=" + Math.random() + "&callback=" + callbackName;
    }
    Flash2x.jsonp = jsonp;
    function m(masked, mask) {
        masked.mask = mask;
    }
    Flash2x.m = m;
    /**
     * 版本号
     * @property version
     * @type {string}
     */
    Flash2x.version = "1.0.0";
})(Flash2x || (Flash2x = {}));
/**
 * 往控制台打印调试信息
 * @method trace
 * @param {Object} arg 任何个数,任意类型的参数
 * @since 1.0.0
 * @public
 * @static
 * @example
 *      trace(1);
 *      trace(1,"hello");
 */
var trace = function () {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i - 0] = arguments[_i];
    }
    for (var i in arguments) {
        console.log(arguments[i]);
    }
};
/**
 * 全局事件侦听
 * @property globalDispatcher
 * @type {egret.EventDispatcher}
 */
var globalDispatcher = new egret.EventDispatcher();
var devicePixelRatio = window.devicePixelRatio || 1;
var F2xContainer = egret.DisplayObjectContainer;
var F2xMovieClip = annie.MovieClip;
