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
