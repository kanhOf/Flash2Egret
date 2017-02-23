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
    // import ColorFilter=laya.filters.ColorFilter;
    var Sprite = egret.Sprite;
    // import Bitmap=laya.resource.Texture;
    // import BlurFilter=laya.filters.BlurFilter;
    // import ShadowFilter=laya.filters.GlowFilter;
    // import ColorMatrixFilter=laya.filters.ColorFilter;
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
            _JSONQueue.on(Event.COMPLETE, null, onCFGComplete);
            _loaderQueue = new URLLoader();
            _loaderQueue.on(Event.COMPLETE, null, _onRESComplete);
            _loaderQueue.on(Event.PROGRESS, null, _onRESProgress);
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
            _progressCallback((_loadPer + e.loadedBytes / e.totalBytes * _loadSinglePer) * 100 >> 0);
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
                    resItem = new Audio();
                    resItem.src = JSResItem[item];
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
    /**
     * 删除一个场景资源,以方便系统垃圾回收
     * @method unLoadScene
     * @public
     * @static
     * @since 1.0.2
     * @param {string} sceneName
     * @param {WebGLRenderingContext} gl 如果是webgl渲染模式，请设置渲染的webgl对象，以方便删除不再需要使用的texture对象
     */
    function unLoadScene(sceneName, gl) {
        if (gl === void 0) { gl = null; }
        //删除webgl贴图资源
        if (gl) {
            for (var item in res[sceneName]) {
                if (res[sceneName][item].nodeName && res[sceneName][item].nodeName == "IMG" && res[sceneName][item].texture) {
                    gl.deleteTexture(res[sceneName][item].texture);
                }
            }
        }
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
    function b(sceneName, imageName, isTexture) {
        if (isTexture === void 0) { isTexture = false; }
        var s = res;
        var isFind = false;
        var sp = new Sprite();
        if (s[sceneName][imageName]) {
            if (isTexture)
                return s[sceneName][imageName];
            sp.graphics.drawTexture(s[sceneName][imageName]);
            return sp;
        }
        else {
            var m_1 = 0;
            while (s[sceneName]["F2xSSIMG" + m_1]) {
                var data = s[sceneName]["F2xSSIMGData" + m_1];
                if (data[imageName] != undefined) {
                    isFind = true;
                    var imgData = data[imageName];
                    var spriteSheet = s[sceneName]["F2xSSIMG" + m_1];
                    var t_1 = Texture.createFromTexture(spriteSheet, imgData.x, imgData.y, imgData.width, imgData.height);
                    if (isTexture)
                        return t_1;
                    sp.graphics.drawTexture(Texture.createFromTexture(spriteSheet, imgData.x, imgData.y, imgData.width, imgData.height));
                    return sp;
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
        }
        if (extendInfo && extendInfo.length > 0) {
            console.log("Flash2LayaAir还不能很好的支持滤镜功能,如果需要推荐使用Flash2AnnieJS,http://annie2x.com");
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
        var textObj;
        textObj = new egret.TextField();
        textObj.width = width;
        textObj.text = text;
        if (type == 0 || type == 1) {
        }
        else {
        }
        textObj.font = face;
        textObj.fontSize = size;
        textObj.leading = lineSpacing - size;
        textObj.align = align;
        textObj.italic = italic;
        textObj.bold = bold;
        textObj.color = color;
        textObj.padding = [top, left, top, left];
        if (lineType != "single") {
            textObj.wordWrap = true;
            if (type > 1) {
                textObj.multiline = true;
            }
        }
        if (showBorder) {
            textObj.borderColor = "#000000";
        }
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
     * @returns {annie.Shape}
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
        var sp = new Sprite();
        sp._f2xShape = shape;
        sp.graphics.drawTexture(shape.updateTexture(), shape.rect.x, shape.rect.y, shape.rect.width, shape.rect.height);
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
            urlLoader.on(Event.COMPLETE, null, info.success);
        }
        if (info.error != undefined) {
            urlLoader.on(Event.ERROR, null, info.error);
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
        mask.x -= masked.x;
        mask.y -= masked.y;
        masked.mask = mask;
    }
    Flash2x.m = m;
})(Flash2x || (Flash2x = {}));
/**
 * 全局事件侦听
 * @property globalDispatcher
 * @type {laya.events.EventDispatcher}
 */
var globalDispatcher = new egret.EventDispatcher();
window.devicePixelRatio = window.devicePixelRatio || 1;
var F2xContainer = egret.Sprite;
var F2xMovieClip = annie.MovieClip;
