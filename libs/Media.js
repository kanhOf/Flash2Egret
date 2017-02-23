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
    /**
     * 抽象类 一般不直接使用
     * @class annie.Media
     * @extends laya.events.EventDispatcher
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
                s.event("onPlayEnd");
            }.bind(s), false);
            s.type = type.toLocaleUpperCase();
            s.media.addEventListener("timeupdate", function () {
                s.event("onPlayUpdate", { currentTime: s.media.currentTime });
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
