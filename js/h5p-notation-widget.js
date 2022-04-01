Object.defineProperty(exports, "__esModule", { value: true });
require("../css/h5p-notation-widget.css");
const main_1 = require("./main");
/**
 * This is a H5P conform wrapper for a similar typescript class.
 */
//@ts-ignore
H5P = H5P || {};
//@ts-ignore
H5PEditor.widgets.notationWidget = H5PEditor.NotationWidget = (function ($) {
    /**
     *
     *
     * @param {Object} parent
     * @param {Object} field
     * @param {string} params
     * @param {H5PEditor.SetParameters} setValue
     */
    function NotationWidget(parent, field, params, setValue) {
        var self = this;
        document.addEventListener("containerAttached", maininstanceInit.bind(this), true);
        this.mainInstance = new main_1.default(parent, field, params, setValue);
    }
    /**
     * Append the field to the wrapper.
     * .
     *
     * @param {H5P.jQuery} $wrapper
     */
    NotationWidget.prototype.appendTo = function ($wrapper) {
        var self = this;
        self.$container = this.mainInstance.createContainer();
        this.nwcContainer = self.$container.querySelector(".notationWidgetContainer");
        $wrapper.append(self.$container);
    };
    /**
     * Validate the current values.
     *
     * @returns {boolean}
     */
    NotationWidget.prototype.validate = function () {
        this.mainInstance.validate();
    };
    /**
     * Remove the current field
     */
    NotationWidget.prototype.remove = function () {
        this.mainInstance.remove();
    };
    function maininstanceInit(e) {
        if (e.target.id === this.nwcContainer.id) {
            this.mainInstance.init();
        }
        document.removeEventListener("containerAttached", maininstanceInit);
    }
    return NotationWidget;
    //@ts-ignore
})(H5P.jQuery);
