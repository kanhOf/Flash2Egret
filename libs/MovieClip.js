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
    var Sprite = egret.Sprite;
    var Event = egret.Event;
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
     * @extends laya.display.Sprite
     */
    var MovieClip = (function (_super) {
        __extends(MovieClip, _super);
        //private _isOnStage:boolean=false;
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
            this.floatView = new Sprite();
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
                if (e.type == Event.MOUSE_DOWN) {
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
                s.on(Event.MOUSE_DOWN, s, s._mouseEvent.bind(s));
                s.on(Event.MOUSE_UP, s, s._mouseEvent.bind(s));
                s.on(Event.MOUSE_OUT, s, s._mouseEvent.bind(s));
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
        MovieClip.prototype.render = function (context, x, y, isMask) {
            if (isMask === void 0) { isMask = false; }
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
                    var layerCount = s._timeline.length;
                    var frameCount = 0;
                    var frame = null;
                    var displayObject = null;
                    var infoObject = null;
                    var frameChildrenCount = 0;
                    var lastFrameChildren = s._childs;
                    var i = void 0;
                    var frameEvents = [];
                    for (i = 0; i < s._childs.length - 1; i++) {
                        lastFrameChildren[i]._parent = null;
                    }
                    s.removeChildren();
                    s._childs = [];
                    for (i = 0; i < layerCount; i++) {
                        frameCount = s._timeline[i].length;
                        if (s.currentFrame <= frameCount) {
                            frame = s._timeline[i][s.currentFrame - 1];
                            if (frame == undefined)
                                continue;
                            if (frame.keyIndex == (s.currentFrame - 1)) {
                                if (frame.soundName != "") {
                                    Flash2x.getMediaByName(frame.soundScene, frame.soundName).play(0, frame.soundTimes);
                                }
                                if (frame.eventName != "" && s.hasListener("onCallFrame")) {
                                    var event_1 = new Event();
                                    event_1.setTo("onCallFrame", s, s);
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
                                if (displayObject.mask) {
                                    displayObject.mask.gotoAndStop(s.currentFrame);
                                    displayObject.mask.render(context, x, y, true);
                                    if (displayObject.mask._childs[0]) {
                                        displayObject.mask._childs[0].x -= displayObject.x;
                                        displayObject.mask._childs[0].y -= displayObject.y;
                                    }
                                }
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
                                s.addChild(displayObject);
                            }
                        }
                    }
                    s._isNeedUpdateChildren = false;
                    //update一定要放在事件处理之前
                    var len = lastFrameChildren.length;
                    for (i = 0; i < len; i++) {
                        if (!lastFrameChildren[i]._parent) {
                            annie.MovieClip._onInitF2xMc(lastFrameChildren[i]);
                        }
                    }
                    if (!isMask) {
                        s.addChild(s.floatView);
                        _super.prototype.render.call(this, context, x, y);
                    }
                    //看看是否到了第一帧，或是最后一帧,如果是准备事件
                    if ((s.currentFrame == 1 && !s.isFront) || (s.currentFrame == s.totalFrames && s.isFront)) {
                        if (s.hasListener("onEndFrame")) {
                            var event_2 = new Event();
                            event_2.setTo("onEndFrame", s, s);
                            event_2.data = {
                                frameIndex: s.currentFrame,
                                frameName: s.currentFrame == 1 ? "firstFrame" : "endFrame"
                            };
                            frameEvents.push(event_2);
                        }
                    }
                    //看看是否有帧事件,有则派发
                    len = frameEvents.length;
                    for (i = 0; i < len; i++) {
                        s.event(frameEvents[i].type, frameEvents[i]);
                    }
                    //看看是否有回调,有则调用
                    if (s._scriptLayer[s.currentFrame - 1] != undefined) {
                        s._scriptLayer[s.currentFrame - 1]();
                    }
                }
                else {
                    if (!isMask) {
                        _super.prototype.render.call(this, context, x, y);
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
            if (s._childs) {
                for (var i = 0; i < s._childs.length; i++) {
                    annie.MovieClip._onInitF2xMc(s._childs[i]);
                }
            }
        };
        return MovieClip;
    }(Sprite));
    annie.MovieClip = MovieClip;
})(annie || (annie = {}));
