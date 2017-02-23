/**
 * Flash资源加载或者管理类，静态类，不可实例化
 * 一般都是初始化或者设置从Flash里导出的资源
 * @class Flash2x
 */
namespace Flash2x {
    import URLLoader = annie.URLLoader;
    import Event = egret.Event;
    import Texture=egret.Texture;
    import Sprite=egret.Sprite;
    import Shape=annie.Shape;
    import Bitmap = egret.Bitmap;
    import BitmapData = egret.BitmapData;
    let _isReleased:boolean=false;
    /**
     * 存储加载资源的总对象
     * @type {Object}
     */
    let res: any = {};
    /**
     * 加载器是否正在加载中
     */
    let _isLoading: boolean;
    /**
     * 加载中的场景名列表
     */
    let _loadSceneNames: any;
    /**
     * 加载地址的域名地址或前缀
     */
    let _domain: string;
    /**
     * 当前加载到哪一个资源
     */
    let _loadIndex: number;
    /**
     * 当前加载的总资源数
     */
    let _totalLoadRes: number;
    /**
     * 当前已经加载的资源数
     */
    let _loadedLoadRes: number;
    /**
     * 加载资源的完成回调
     */
    let _completeCallback: Function;
    /**
     * 加载资源时的进度回调
     */
    let _progressCallback: Function;
    /**
     * 加载配置文件的加载器
     */
    let _JSONQueue: URLLoader;
    /**
     * 加载资源文件的加载器
     */
    let _loaderQueue: URLLoader;
    /**
     * 加载器是否初始化过
     */
    let _isInited: Boolean;
    /**
     * 当前加载的资源配置文件内容
     */
    let _currentConfig: any;
    /**
     * 获取当前加载的时间当作随机数用
     */
    let _time: number;
    /**
     * 加载资源数和总资源数的比
     */
    let _loadPer: number;
    /**
     * 单个资源占总资源数的比
     */
    let _loadSinglePer: number;
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
    export let loadScene = function (sceneName: any, progressFun: Function, completeFun: Function, domain: string = ""): void {
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
        if (typeof(sceneName) == "string") {
            if (!isLoadedScene(sceneName)) {
                _loadSceneNames.push(sceneName);
                res[sceneName] = new Object();
            }
        }
        else {
            let len = sceneName.length;
            for (let i = 0; i < len; i++) {
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
            _JSONQueue.addEventListener(Event.COMPLETE,onCFGComplete,null);
            _loaderQueue = new URLLoader();
            _loaderQueue.addEventListener(Event.COMPLETE, _onRESComplete,null);
            _loaderQueue.addEventListener("onProgress", _onRESProgress,null);
            _isInited=true;
        }
        _loadPer = 0;
        _loadIndex = 0;
        _totalLoadRes = 0;
        _loadedLoadRes = 0;
        _isLoading = true;
        _completeCallback = completeFun;
        _progressCallback = progressFun;
        _currentConfig = [];
        if(!_isReleased) {
            _loadConfig();
        }else{
            //加载正式的单个文件
            _loadIndex = 0;
            _totalLoadRes=_loadSceneNames.length;
            _loadSinglePer = 1 / _totalLoadRes;
            for(let i=0;i<_totalLoadRes;i++) {
                _currentConfig.push([{src:"src/"+_loadSceneNames[i]+".swf"}]);
            }
            _loadRes();
        }
    };
    function _loadConfig(): void {
        _JSONQueue.load(_domain + "resource/" + _loadSceneNames[_loadIndex] + "/" + _loadSceneNames[_loadIndex] + ".res.json?t=" + _time);
    }
    function onCFGComplete(e: any): void{
        //配置文件加载完成
        let resList: any = e.data.response;
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
    function _onRESProgress(e: any): void {
        if (_progressCallback) {
            _progressCallback((_loadPer + e.data.loadedBytes / e.data.totalBytes * _loadSinglePer) * 100 >> 0);
        }
    }
    function _onRESComplete(e: any): void {
        let scene = _loadSceneNames[_loadIndex];
        if(!_isReleased){
            if (e.data.type != "js" && e.data.type != "css") {
                let id = _currentConfig[_loadIndex][0].id;
                res[scene][id] = e.data.response;
            }
        }else{
            var F2x:any=Flash2x;
            var JSResItem:any=F2x[scene+"Res"];
            for(var item in JSResItem){
                var resItem:any;
                if(JSResItem[item].indexOf("audio/")>0){
                    resItem=new annie.Sound(JSResItem[item]);
                }else if(JSResItem[item].indexOf("image/")>0){
                    resItem=new Image();
                    resItem.src=JSResItem[item];
                }else{
                    resItem=JSON.parse(JSResItem[item]);
                }
                res[scene][item]=resItem;
            }
            delete F2x[scene+"Res"];
        }
        _checkComplete();
    }
    function _checkComplete() {
        _loadedLoadRes++;
        _loadPer = _loadedLoadRes / _totalLoadRes;
        _currentConfig[_loadIndex].shift();
        if (_currentConfig[_loadIndex].length > 0) {
            _loadRes();
        } else {
            var info: any = {};
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
    function _loadRes(): void {
        let url=_domain + _currentConfig[_loadIndex][0].src;
        if(_isReleased){
            _loaderQueue.responseType="js";
            url+="?v="+_isReleased;
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
    export function isLoadedScene(sceneName: string): Boolean {
        if (res[sceneName] != undefined && res[sceneName] != null) {
            return true;
        } else {
            return false;
        }
    }
    function $updateFlash2xMovieclip(display:any):void {
        if(display&&display.$children) {
            var len = display.$children.length;
            for (var i = 0; i < len; i++) {
                if (display.$children[i]._isF2xMc) {
                    display.$children[i].$updateF2xMc();
                }
                $updateFlash2xMovieclip(display.$children[i]);
            }
        }
    }
    export function loopScene(stage:egret.Stage):void{
        let s:any=stage;
        s.addEventListener(Event.ENTER_FRAME,function (e:any) {
            $updateFlash2xMovieclip(s);
        },null);
    }
    /**
     * 删除一个场景资源,以方便系统垃圾回收
     * @method unLoadScene
     * @public
     * @static
     * @since 1.0.2
     * @param {string} sceneName
     * @param {WebGLRenderingContext} gl 如果是webgl渲染模式，请设置渲染的webgl对象，以方便删除不再需要使用的texture对象
     */
    export function unLoadScene(sceneName: string, gl: WebGLRenderingContext = null): void {
        //删除webgl贴图资源
        if (gl) {
            for (let item in res[sceneName]) {
                if (res[sceneName][item].nodeName && res[sceneName][item].nodeName == "IMG" && res[sceneName][item].texture) {
                    gl.deleteTexture(res[sceneName][item].texture);
                }
            }
        }
        delete res[sceneName];
        let scene: any = eval(sceneName);
        for (let i in scene) {
            delete scene[i];
        }
        eval(sceneName + "=null;");
    }

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
    export function getMediaByName(sceneName: string, mediaName: string): any {
        let s = res;
        if (s[sceneName][mediaName]) {
            return s[sceneName][mediaName];
        }
        return null;
    }
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
    export function b(sceneName: string, imageName: string,isTexurue:boolean=false): any {
        let s = res;
        let isFind = false;
        let t=s[sceneName][imageName];
        if (t) {
            if(!(t.source||t.bitmapData)) {
                t = new BitmapData(t);
                s[sceneName][imageName]=t;
            }
            if(isTexurue) return t;
            return new Bitmap(t);
        } else {
            let m = 0;
            while (s[sceneName]["F2xSSIMG" + m]) {
                let data = s[sceneName]["F2xSSIMGData" + m];
                if (data[imageName] != undefined) {
                    isFind = true;
                    let imgData:any = data[imageName];
                    let spriteSheet = s[sceneName]["F2xSSIMG" + m];
                    let t:Texture=new Texture();
                    t.bitmapData=new BitmapData(spriteSheet);
                    t.$initData(imgData.x,imgData.y,imgData.width,imgData.height,0,0,imgData.width,imgData.height,spriteSheet.width,spriteSheet.height);
                    s[sceneName][imageName]=t;
                    if(isTexurue) return t;
                    return new Bitmap(t);
                }
                m++;
            }
            console.log("未找到资源文件");
            return null;
        }
    }

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
    export function d(display: any, baseInfo: any = null, extendInfo: any = null): void {
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
            if(display._f2xShape){
                display.x-=display._f2xShape._cacheImg.width>>1;
                display.y-=display._f2xShape._cacheImg.height>>1;
            }
        }
        if (extendInfo && extendInfo.length > 0) {
            console.log("Flash2Egret还不能很好的支持滤镜功能,如果需要推荐使用Flash2AnnieJS,http://annie2x.com");
            /*let index = 0;
            let filters:any = [];
            while (extendInfo[index] != undefined) {
                if (extendInfo[index] == 0) {
                    filters.push(new ColorFilter([extendInfo[index + 1],0,0,0,
                        0,extendInfo[index + 2],0,0,
                        0,0,extendInfo[index + 3],0,
                        0,0,0,extendInfo[index + 4],
                        extendInfo[index + 5], extendInfo[index + 6], extendInfo[index + 7], extendInfo[index + 8]]));
                    index += 9;
                } else if (extendInfo[index] == 1) {
                    filters.push(new BlurFilter((extendInfo[index + 1]+extendInfo[index + 2])*0.5));
                    index += 4;
                } else if (extendInfo[index] == 2) {
                    let blur = (extendInfo[index + 1] + extendInfo[index + 2]) * 0.5;
                    let color = Shape.getRGBA(extendInfo[index + 4], extendInfo[index + 5]);
                    let offsetX = extendInfo[index + 7] * Math.cos(extendInfo[index + 6] / 180 * Math.PI);
                    let offsetY = extendInfo[index + 7] * Math.sin(extendInfo[index + 6] / 180 * Math.PI);
                    filters.push(new ShadowFilter(color, offsetX, offsetY, blur));
                    index += 8;
                } else if (extendInfo[index] == 3){
                    let blur = (extendInfo[index + 1] + extendInfo[index + 2]) * 0.5;
                    let color = Shape.getRGBA(extendInfo[index + 4], extendInfo[index + 5]);
                    filters.push(new ShadowFilter(color, 0, 0, blur));
                    index += 6;
                } else if (extendInfo[index] == 4) {
                    console.log("LayaAir还不支持高级颜色滤镜功能,如果需要推荐使用AnnieJS引擎,http://annie2x.com");
                    //filters.push(new ColorMatrixFilter(extendInfo[index + 1], extendInfo[index + 2], extendInfo[index + 3], extendInfo[index + 4]));
                    index += 5;
                }
            }
            display.filters=filters;*/
        }
    }

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
    export function t(type: number, text: string, size: number, color: string, face: string, top: number, left: number, width: number, height: number, lineSpacing: number, align: string, italic: boolean = false, bold: boolean = false, lineType: string = "single", showBorder: boolean = false): any {
        let textObj= new egret.TextField();
        textObj.text = text;
        textObj.italic = italic;
        textObj.size=size;
        textObj.lineSpacing=lineSpacing-size;
        textObj.bold = bold;
        textObj.fontFamily=face;
        textObj.width=width;
        textObj.height=height;
        textObj.wordWrap=true;
        textObj.textColor=parseInt("0x"+color.substring(1));
        textObj.textAlign = align;
        textObj.type=type<2?egret.TextFieldType.DYNAMIC:egret.TextFieldType.INPUT;
        if(lineType!="single") {
            if(lineType=="password"){
                textObj.displayAsPassword=true;
            }else {
                textObj.multiline = true;
            }
        }
        textObj.border = showBorder;
        return textObj;
    }
    /**
     * 获取矢量位图填充所需要的位图,为什么写这个方法,是因为作为矢量填充的位图不能存在于SpriteSheet中,要单独画出来才能正确的填充到矢量中
     */
    function sb(sceneName: string, bitmapName: string): any {
        let sbName: string = "_f2x_s" + bitmapName;
        if (res[sceneName][sbName]) {
            return res[sceneName][sbName];
        } else {
            let bitmapData: any = null;
            let bitmap = b(sceneName, bitmapName,true);
            if (bitmap) {
                bitmapData = annie.Shape.convertToImage(bitmap);
                res[sceneName][sbName] = bitmapData;
                return bitmapData;
            } else {
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
    export function s(pathObj: any, fillObj: any, strokeObj: any): Bitmap {
        let shape = new annie.Shape();
        if (fillObj) {
            if (fillObj.type == 0) {
                shape.beginFill(fillObj.color);
            } else if (fillObj.type == 1){
                shape.beginRadialGradientFill(fillObj.gradient[0], fillObj.gradient[1], fillObj.points);
            } else if (fillObj.type == 2){
                shape.beginLinearGradientFill(fillObj.gradient[0], fillObj.gradient[1], fillObj.points);
            } else {
                shape.beginBitmapFill(sb(fillObj.bitmapScene, fillObj.bitmapName), fillObj.matrix);
            }
        }
        if (strokeObj) {
            if (strokeObj.type == 0) {
                shape.beginStroke(strokeObj.color, strokeObj.lineWidth,strokeObj.caps, strokeObj.joints, strokeObj.miter);
            } else if (strokeObj.type == 1) {
                shape.beginRadialGradientStroke(strokeObj.gradient[0], strokeObj.gradient[1], strokeObj.points, strokeObj.lineWidth, strokeObj.caps, strokeObj.joints, strokeObj.miter);
            } else if (strokeObj.type == 2) {
                shape.beginLinearGradientStroke(strokeObj.gradient[0], strokeObj.gradient[1], strokeObj.points, strokeObj.lineWidth, strokeObj.caps, strokeObj.joints, strokeObj.miter);
            } else {
                shape.beginBitmapStroke(sb(strokeObj.bitmapScene, strokeObj.bitmapName), strokeObj.matrix, strokeObj.lineWidth, strokeObj.caps, strokeObj.joints, strokeObj.miter);
            }
        }
        if (pathObj.type == 0) {
            shape.decodePath(pathObj.data);
        } else {
            shape.drawRoundRect(pathObj.data.x, pathObj.data.y, pathObj.data.w, pathObj.data.h, pathObj.data.topLeftRadius, pathObj.data.topRightRadius, pathObj.data.bottomLeftRadius, pathObj.data.bottomRightRadius);
        }
        if (fillObj) {
            shape.endFill();
        }
        if (strokeObj) {
            shape.endStroke();
        }
        let sp:any=new Bitmap(shape.updateTexture());
        sp._f2xShape=shape;
        return sp;
    }
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
    export function ajax(info: any): void {
        let urlLoader = new URLLoader();
        urlLoader.method = info.type == undefined ? "get" : info.type;
        urlLoader.data = info.data == undefined ? null : info.data;
        urlLoader.responseType = info.responseType == undefined ? "text" : info.responseType;
        if (info.success != undefined) {
            urlLoader.addEventListener(Event.COMPLETE, info.success,null);
        }
        if (info.error != undefined) {
            urlLoader.addEventListener("onError", info.error,null);
        }
        urlLoader.load(info.url);
    }
    let jsonpScript:any=null;
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
    export function jsonp(url:string,type:number,callbackName:string,callbackFun:any){
        let w:any=window;
        if(type==1){
            w[callbackName]=callbackFun;
        }
        if(!jsonpScript){
            jsonpScript=document.createElement('script');
            jsonpScript.onload=function (){
                if(type==0) {
                    callbackFun(w[callbackName]);
                }
                jsonpScript.src="";
                w[callbackName]=null;
                delete w[callbackName];
            };
            document.getElementsByTagName('head')[0].appendChild(jsonpScript);
        }
        let param:string;
        if(url.indexOf("?")>0) {
            param="&";
        }else{
            param="?";
        }
        jsonpScript.src = url + param+"a_n_n_i_e="+Math.random()+"&callback="+callbackName;
    }
    export function m(masked:Sprite,mask:Sprite):void{
        masked.mask=mask;
    }
}
/**
 * 全局事件侦听
 * @property globalDispatcher
 * @type {egret.EventDispatcher}
 */
let globalDispatcher:egret.EventDispatcher=new egret.EventDispatcher();
import F2xContainer=egret.DisplayObjectContainer;
import F2xMovieClip=annie.MovieClip;
