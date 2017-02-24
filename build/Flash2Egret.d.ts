/**
 * @module annie
 */
declare namespace annie {
    import DisplayObjectContainer = egret.DisplayObjectContainer;
    /**
     * annie引擎核心类
     * @class annie.MovieClip
     * @since 1.0.0
     * @public
     * @extends egret.Sprite
     */
    class MovieClip extends DisplayObjectContainer {
        /**
         * 时间轴 一般给Flash2x工具使用
         * @property _timeline
         * @private
         * @since 1.0.0
         * @type {Array}
         */
        private _timeline;
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
        floatView: DisplayObjectContainer;
        /**
         * mc的当前帧
         * @property currentFrame
         * @public
         * @since 1.0.0
         * @type {number}
         * @default 1
         * @readonly
         */
        currentFrame: number;
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
        isPlaying: boolean;
        /**
         * 动画的播放方向,是顺着播还是在倒着播
         * @property isFront
         * @public
         * @since 1.0.0
         * @type {boolean}
         * @default true
         * @readonly
         */
        isFront: boolean;
        /**
         * 当前动画的总帧数
         * @property totalFrames
         * @public
         * @since 1.0.0
         * @type {number}
         * @default 1
         * @readonly
         */
        totalFrames: number;
        private _scriptLayer;
        private _labelFrame;
        private _frameLabel;
        private _isNeedUpdateChildren;
        private _currentLayer;
        private _currentLayerFrame;
        private _graphicInfo;
        private _isUpdateFrame;
        private _isF2xMc;
        constructor();
        /**
         * 调用止方法将停止当前帧
         * @method stop
         * @public
         * @since 1.0.0
         */
        stop(): void;
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method as
         * @private
         * @since 1.0.0
         * @param {Function} frameScript
         * @param {number} frameIndex
         */
        as(frameScript: Function, frameIndex: number): void;
        /**
         * 给时间轴添加回调函数,当时间轴播放到当前帧时,此函数将被调用.注意,之前在此帧上添加的所有代码将被覆盖,包括从Fla文件中当前帧的代码.
         * @method addFrameScript
         * @public
         * @since 1.0.0
         * @param {number} frameIndex {number} 要将代码添加到哪一帧,从0开始.0就是第一帧,1是第二帧...
         * @param {Function}frameScript {Function} 时间轴播放到当前帧时要执行回调方法
         */
        addFrameScript(frameIndex: number, frameScript: Function): void;
        /**
         * @移除帧上的回调方法
         * @method removeFrameScript
         * @public
         * @since 1.0.0
         * @param {number} frameIndex
         */
        removeFrameScript(frameIndex: number): void;
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method a
         * @private
         * @since 1.0.0
         * @returns {annie.MovieClip}
         */
        a(): MovieClip;
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method b
         * @private
         * @since 1.0.0
         * @returns {annie.MovieClip}
         * @param {number} count
         */
        b(count: number): MovieClip;
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
        c(display: any, displayBaseInfo?: any, displayExtendInfo?: any): MovieClip;
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
        g(loopType: string, firstFrame: number, parentFrameIndex: number): MovieClip;
        /**
         * 当将mc设置为图形动画模式时需要设置的相关信息 Flash2x工具调用的方法,用户一般不需要使用
         * @method setGraphicInfo
         * @public
         * @since 1.0.0
         * @param{Object} graphicInfo
         */
        setGraphicInfo(graphicInfo: any): void;
        /**
         * 将一个mc变成按钮来使用 如果mc在于2帧,那么点击此mc将自动有被按钮的状态,无需用户自己写代码
         * @method initButton
         * @public
         * @since 1.0.0
         */
        initButton(): void;
        private _mouseEvent;
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method d
         * @private
         * @since 1.0.0
         * @param {string} name
         * @param {number} index
         * @returns {annie.MovieClip}
         */
        d(name: string, index: number): MovieClip;
        /**
         * mc的当前帧的标签名,没有则为空
         * @method getCurrentLabel
         * @public
         * @since 1.0.0
         * @returns {string}
         * */
        getCurrentLabel(): string;
        /**
         * Flash2x工具调用的方法,用户一般不需要使用
         * @method e
         * @private
         * @since 1.0.0
         * @param {string} eventName
         * @returns {annie.MovieClip}
         */
        e(eventName: string): MovieClip;
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
        f(sceneName: string, soundName: string, times: number): MovieClip;
        /**
         * 将播放头向后移一帧并停在下一帧,如果本身在最后一帧则不做任何反应
         * @method nextFrame
         * @since 1.0.0
         * @public
         */
        nextFrame(): void;
        /**
         * 将播放头向前移一帧并停在下一帧,如果本身在第一帧则不做任何反应
         * @method prevFrame
         * @since 1.0.0
         * @public
         */
        prevFrame(): void;
        /**
         * 将播放头跳转到指定帧并停在那一帧,如果本身在第一帧则不做任何反应
         * @method gotoAndStop
         * @public
         * @since 1.0.0
         * @param {number} frameIndex{number|string} 批定帧的帧数或指定帧的标签名
         */
        gotoAndStop(frameIndex: number | string): void;
        /**
         * 如果当前时间轴停在某一帧,调用此方法将继续播放.
         * @method play
         * @public
         * @since 1.0.0
         */
        play(isFront?: boolean): void;
        /**
         * 将播放头跳转到指定帧并从那一帧开始继续播放
         * @method gotoAndPlay
         * @public
         * @since 1.0.0
         * @param {number} frameIndex 批定帧的帧数或指定帧的标签名
         * @param {boolean} isFront 跳到指定帧后是向前播放, 还是向后播放.不设置些参数将默认向前播放
         */
        gotoAndPlay(frameIndex: number | string, isFront?: boolean): void;
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
        setFrameChild(child: any, attr: any): void;
        /**
         * 重写刷新
         * @method update
         * @public
         * @since 1.0.0
         */
        $updateF2xMc(): void;
        /**
         * 触发显示列表上相关的事件
         * @method _onDispatchBubbledEvent
         * @private
         */
        static _onInitF2xMc(s: any): void;
    }
}
/**
 * @module annie
 */
declare namespace annie {
    import Matrix = egret.Matrix;
    import Texture = egret.Texture;
    /**
     * 矢量对象
     * @class annie.Shape
     * @since 1.0.0
     * @public
     */
    class Shape {
        private static _canvas;
        constructor();
        /**
         * 一个数组，每个元素也是一个数组[类型 0是属性,1是方法,名字 执行的属性或方法名,参数]
         * @property _command
         * @private
         * @since 1.0.0
         * @type {Array}
         * @default []
         */
        private _command;
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
        static getGradientColor(colors: Array<string>, ratios: Array<number>, points: Array<number>): any;
        /**
         * 设置位图填充时需要使用的方法,一般给用户使用较少,Flash2x工具自动使用
         * @method getBitmapStyle
         * @static
         * @param {Image} image HTML Image元素
         * @returns {CanvasPattern}
         * @public
         * @since 1.0.0
         */
        static getBitmapStyle(image: any): any;
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
        static getRGBA(color: string, alpha: number): string;
        /**
         * @property _cacheCanvas
         * @since 1.0.0
         * @private
         * @type {Canvas}
         */
        private _cacheImg;
        private _cacheX;
        private _cacheY;
        private _isBitmapStroke;
        private _isBitmapFill;
        texture: Texture;
        /**
         * 添加一条绘画指令,具体可以查阅Html Canvas画图方法
         * @method addDraw
         * @param {string} commandName ctx指令的方法名 如moveTo lineTo arcTo等
         * @param {Array} params
         * @public
         * @since 1.0.0
         */
        addDraw(commandName: string, params: Array<any>): void;
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
        drawRoundRect(x: number, y: number, w: number, h: number, rTL?: number, rTR?: number, rBL?: number, rBR?: number): void;
        /**
         * 绘画时移动到某一点
         * @method moveTo
         * @param {number} x
         * @param {number} y
         * @public
         * @since 1.0.0
         */
        moveTo(x: number, y: number): void;
        /**
         * 从上一点画到某一点,如果没有设置上一点，则上一占默认为(0,0)
         * @method lineTo
         * @param {number} x
         * @param {number} y
         * @public
         * @since 1.0.0
         */
        lineTo(x: number, y: number): void;
        /**
         * 从上一点画弧到某一点,如果没有设置上一点，则上一占默认为(0,0)
         * @method arcTo
         * @param {number} x
         * @param {number} y
         * @public
         * @since 1.0.0
         */
        arcTo(x: number, y: number): void;
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
        quadraticCurveTo(cpX: number, cpY: number, x: number, y: number): void;
        /**
         * 从SpriteSheet的大图中剥离出单独的小图以供特殊用途
         * @method convertToImage
         * @static
         * @public
         * @since 1.0.0
         * @param {annie.Bitmap} bitmap
         * @return {Image}
         */
        static convertToImage(bitmap: any): any;
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
        bezierCurveTo(cp1X: number, cp1Y: number, cp2X: number, cp2Y: number, x: number, y: number): void;
        /**
         * 闭合一个绘画路径
         * @method closePath
         * @public
         * @since 1.0.0
         */
        closePath(): void;
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
        drawRect(x: number, y: number, w: number, h: number): void;
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
        drawArc(x: number, y: number, radius: number, start: number, end: number): void;
        /**
         * 画一个圆
         * @method drawCircle
         * @param {number} x 圆心x
         * @param {number} y 圆心y
         * @param {number} radius 半径
         * @public
         * @since 1.0.0
         */
        drawCircle(x: number, y: number, radius: number): void;
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
        drawEllipse(x: number, y: number, w: number, h: number): void;
        /**
         * 清除掉之前所有绘画的东西
         * @method clear
         * @public
         * @since 1.0.0
         */
        clear(): void;
        /**
         * 开始绘画填充,如果想画的东西有颜色填充,一定要从此方法开始
         * @method beginFill
         * @param {string} color 颜色值 单色和RGBA格式
         * @public
         * @since 1.0.0
         */
        beginFill(color: string): void;
        /**
         * 线性渐变填充 一般给Flash2x用
         * @method beginLinearGradientFill
         * @param {Array} colors 一组颜色值
         * @param {Array} ratios 一组范围比例值
         * @param {Array} points 一组点
         * @public
         * @since 1.0.0
         */
        beginLinearGradientFill(colors: Array<string>, ratios: Array<number>, points: Array<number>): void;
        /**
         * 径向渐变填充 一般给Flash2x用
         * @method beginRadialGradientFill
         * @param {Array} colors 一组颜色值
         * @param {Array} ratios 一组范围比例值
         * @param {Array} points 一组点
         * @public
         * @since 1.0.0
         */
        beginRadialGradientFill: (colors: string[], ratios: number[], points: number[]) => void;
        /**
         * 位图填充 一般给Flash2x用
         * @method beginBitmapFill
         * @param {Image} image
         * @param {annie.Matrix} matrix
         * @public
         * @since 1.0.0
         */
        beginBitmapFill(image: any, matrix: Matrix): void;
        private _fill(fillStyle);
        /**
         * 给线条着色
         * @method beginStroke
         * @param {string} color  颜色值
         * @param {number} lineWidth 宽度
         * @public
         * @since 1.0.0
         */
        beginStroke(color: string, lineWidth?: number, cap?: string, join?: string, miter?: number): void;
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
        beginLinearGradientStroke(colors: Array<string>, ratios: Array<number>, points: Array<number>, lineWidth?: number, cap?: string, join?: string, miter?: number): void;
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
        beginRadialGradientStroke: (colors: string[], ratios: number[], points: number[], lineWidth?: number, cap?: string, join?: string, miter?: number) => void;
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
        beginBitmapStroke(image: any, matrix: Matrix, lineWidth?: number, cap?: string, join?: string, miter?: number): void;
        private _stroke(strokeStyle, width, cap, join, miter);
        /**
         * 结束填充
         * @method endFill
         * @public
         * @since 1.0.0
         */
        endFill(): void;
        /**
         * 结束画线
         * @method endStroke
         * @public
         * @since 1.0.0
         */
        endStroke(): void;
        private static BASE_64;
        /**
         * 解析一段路径 一般给Flash2x用
         * @method decodePath
         * @param {string} data
         * @public
         * @since 1.0.0
         */
        decodePath: (data: string) => void;
        /**
         * 生成贴图
         * @method createTexture
         * @public
         * @since 1.0.0
         * @returns egret.Texture
         */
        updateTexture(): Texture;
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
        changeColor(infoObj: any): void;
    }
}
/**
 * @module annie
 */
declare namespace annie {
    /**
     * 抽象类 一般不直接使用
     * @class annie.Media
     * @extends egret.EventDispatcher
     * @public
     * @since 1.0.0
     */
    class Media extends egret.EventDispatcher {
        /**
         * html 标签 有可能是audio 或者 video
         * @property media
         * @type {Video|Audio}
         * @public
         * @since 1.0.0
         */
        media: any;
        /**
         * 媒体类型 VIDEO 或者 AUDIO
         * @type {string}
         * @since 1.0.0
         * @since 1.0.0
         */
        type: string;
        private _loop;
        /**
         * 构造函数
         * @method Media
         * @param {string|HtmlElement} src
         * @param {string} type
         * @since 1.0.0
         */
        constructor(src: any, type: string);
        /**
         * 开始播放媒体
         * @method play
         * @param {number} start 开始点 默认为0
         * @param {number} loop 循环次数 默认为1
         * @public
         * @since 1.0.0
         */
        play(start?: number, loop?: number): void;
        private _SBWeixin;
        private _weixinSB();
        /**
         * 停止播放
         * @method stop
         * @public
         * @since 1.0.0
         */
        stop(): void;
        /**
         * 暂停播放,或者恢复播放
         * @method pause
         * @public
         * @param isPause  默认为true;是否要暂停，如果要暂停，则暂停；否则则播放 1.0.4新增的参数
         * @since 1.0.4
         */
        pause(isPause?: boolean): void;
    }
}
/**
 * @module annie
 */
declare namespace annie {
    /**
     * 声音类
     * @class annie.Sound
     * @extends annie.Media
     * @public
     * @since 1.0.0
     */
    class Sound extends Media {
        constructor(src: any);
    }
}
/**
 * @module annie
 */
declare namespace annie {
    /**
     * 视频类
     * @class annie.Video
     * @extends annie.Media
     * @public
     * @since 1.0.0
     */
    class Video extends Media {
        constructor(src: any, width?: number, height?: number);
    }
}
/**
 * @module annie
 */
declare namespace annie {
    import EventDispatcher = egret.EventDispatcher;
    let Eval: any;
    /**
     * 资源加载类,后台请求,加载资源和后台交互都可以使用此类
     * @class annie.URLLoader
     * @extends egret.EventDispatcher
     * @public
     * @since 1.0.0
     */
    class URLLoader extends EventDispatcher {
        /**
         * @param type text json js xml image sound css svg video unKnow
         */
        constructor();
        /**
         * 取消加载
         * @method loadCancel
         * @public
         * @since 1.0.0
         */
        loadCancel(): void;
        private _req;
        private headers;
        /**
         * 加载或请求数据
         * @method load
         * @public
         * @since 1.0.0
         * @param {string} url
         * @param {string} contentType 如果请求类型需要设置主体类型，有form json binary jsonp等，请设置 默认为form
         */
        load(url: string, contentType?: string): void;
        /**
         * 后台返回来的数据类弄
         * @property responseType
         * @type {string}
         * @default null
         * @public
         * @since 1.0.0
         */
        responseType: string;
        /**
         * 请求的url地址
         * @property url
         * @public
         * @since 1.0.0
         * @type {string}
         */
        url: string;
        /**
         * 请求后台的类型 get post
         * @property method
         * @type {string}
         * @default get
         * @public
         * @since 1.0.0
         */
        method: string;
        /**
         * 需要像后台传送的数据对象
         * @property data
         * @public
         * @since 1.0.0
         * @default null
         * @type {Object}
         */
        data: Object;
        /**
         * 格式化post请求参数
         * @method _fqs
         * @param data
         * @param query
         * @return {string}
         * @private
         * @since 1.0.0
         */
        private _fqs;
        /**
         * 格式化get 请求参数
         * @method _fus
         * @param src
         * @param data
         * @return {any}
         * @private
         */
        private _fus;
        /**
         * 添加自定义头
         * @addHeader
         * @param name
         * @param value
         */
        addHeader(name: string, value: string): void;
    }
}
/**
 * Flash资源加载或者管理类，静态类，不可实例化
 * 一般都是初始化或者设置从Flash里导出的资源
 * @class Flash2x
 */
declare namespace Flash2x {
    import Sprite = egret.Sprite;
    import Bitmap = egret.Bitmap;
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
    let loadScene: (sceneName: any, progressFun: Function, completeFun: Function, domain?: string) => void;
    /**
     * 判断一个场景是否已经被加载
     * @method isLoadedScene
     * @public
     * @static
     * @since 1.0.0
     * @param {string} sceneName
     * @returns {boolean}
     */
    function isLoadedScene(sceneName: string): Boolean;
    function loopScene(stage: egret.Stage): void;
    /**
     * 删除一个场景资源,以方便系统垃圾回收
     * @method unLoadScene
     * @public
     * @static
     * @since 1.0.2
     * @param {string} sceneName
     * @param {WebGLRenderingContext} gl 如果是webgl渲染模式，请设置渲染的webgl对象，以方便删除不再需要使用的texture对象
     */
    function unLoadScene(sceneName: string): void;
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
    function getMediaByName(sceneName: string, mediaName: string): any;
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
    function b(sceneName: string, imageName: string, isTexurue?: boolean): any;
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
    function d(display: any, baseInfo?: any, extendInfo?: any): void;
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
    function t(type: number, text: string, size: number, color: string, face: string, top: number, left: number, width: number, height: number, lineSpacing: number, align: string, italic?: boolean, bold?: boolean, lineType?: string, showBorder?: boolean): any;
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
    function s(pathObj: any, fillObj: any, strokeObj: any): Bitmap;
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
    function ajax(info: any): void;
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
    function jsonp(url: string, type: number, callbackName: string, callbackFun: any): void;
    function m(masked: Sprite, mask: Sprite): void;
    /**
     * 版本号
     * @property version
     * @type {string}
     */
    let version: string;
}
/**
 * 全局事件侦听
 * @property globalDispatcher
 * @type {egret.EventDispatcher}
 */
declare let globalDispatcher: egret.EventDispatcher;
declare var devicePixelRatio: number;
import F2xContainer = egret.DisplayObjectContainer;
import F2xMovieClip = annie.MovieClip;
