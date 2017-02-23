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
    var EventDispatcher = egret.EventDispatcher;
    var Event = egret.Event;
    annie.Eval = eval.bind(window);
    /**
     * 资源加载类,后台请求,加载资源和后台交互都可以使用此类
     * @class annie.URLLoader
     * @extends laya.events.EventDispatcher
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
                    s.event(Event.PROGRESS, { loadedBytes: event.loaded, totalBytes: event.total });
                };
                req.onerror = function (event) {
                    reSendTimes++;
                    if (reSendTimes > 3) {
                        s.event(Event.ERROR, { id: 2, msg: event["message"] });
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
                            var e = new Event();
                            e.setTo(Event.COMPLETE, s, s);
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
                                        item = new laya.resource.Texture();
                                        item.load(s.url);
                                        break;
                                    case "sound":
                                    case "video":
                                        var itemObj;
                                        var isBlob_1 = true;
                                        if (s.responseType == "sound") {
                                            itemObj = document.createElement("AUDIO");
                                        }
                                        else if (s.responseType == "video") {
                                            itemObj = document.createElement("VIDEO");
                                        }
                                        itemObj.preload = true;
                                        itemObj.load();
                                        itemObj.onloadeddata = function () {
                                            if (isBlob_1) {
                                            }
                                            itemObj.onloadeddata = null;
                                        };
                                        try {
                                            itemObj.src = URL.createObjectURL(result);
                                        }
                                        catch (err) {
                                            isBlob_1 = false;
                                            itemObj.src = s.url;
                                        }
                                        if (s.responseType == "sound") {
                                            item = new annie.Sound(itemObj);
                                        }
                                        else {
                                            item = new annie.Video(itemObj);
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
                                s.event(Event.ERROR, { id: 1, msg: "服务器返回信息有误" });
                            }
                            s.event(e.type, e);
                        }
                        else {
                            //服务器返回报错
                            s.event(Event.ERROR, { id: 0, msg: "访问地址不存在" });
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
