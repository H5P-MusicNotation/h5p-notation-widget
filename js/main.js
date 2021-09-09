Object.defineProperty(exports, "__esModule", { value: true });
const verovioscoreeditor_1 = require("verovioscoreeditor");
class Main {
    /**
     * Creates the main Class.
     * I wrapped by h5p-notation-widget
     *
     * @param {Object} parent
     * @param {Object} field
     * @param {string} params
     * @param {H5PEditor.SetParameters} setValue
     */
    constructor(parent, field, params, setValue) {
        this.fullscreen = (function fullscreen(e) {
            var fsDiv = document.querySelector(".h5p-notation-widget");
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            else {
                fsDiv.requestFullscreen();
            }
        }).bind(this);
        this.fullscreenElements = (function fullscreenElements() {
            var fsDiv = document.querySelector(".h5p-notation-widget");
            if (fsDiv.classList.contains("fullscreen")) {
                fsDiv.classList.remove("fullscreen");
                document.getElementById("fullscreenWidget").classList.remove("transparent");
            }
            else {
                fsDiv.classList.add("fullscreen");
                document.getElementById("fullscreenWidget").classList.add("transparent");
            }
        }).bind(this);
        /**
         * Function is Called in VerovioScoreEditor, when MEI has changed
         */
        this.setMei = (function setMei(mei) {
            this.setValue(this.field, mei);
        }).bind(this);
        this.parent = parent;
        this.field = field;
        this.params = params;
        this.setValue = setValue;
    }
    init() {
        this.vse = new verovioscoreeditor_1.default(this.container.firstChild, null, this.setMei);
        this.vse.init();
    }
    /**
     * is wrapped by "appenTo" in wrapper class.
     * Container in which the widget will run
     */
    createContainer() {
        this.container = document.createElement("div");
        this.container.classList.add("field");
        this.container.classList.add("text");
        this.container.classList.add("h5p-notation-widget");
        var subdiv = document.createElement("span");
        subdiv.setAttribute("id", "notationWidgetContainer");
        subdiv.classList.add("content");
        this.container.append(subdiv);
        var button = document.createElement("button");
        button.setAttribute("id", "fullscreenWidget");
        button.textContent = "Fullscreen";
        this.container.append(button);
        button.addEventListener("click", this.fullscreen);
        document.addEventListener("fullscreenchange", this.fullscreenElements);
        return this.container;
    }
    /**
     * @returns
     */
    validate() {
        return true;
    }
    remove() {
        //TODO
    }
}
exports.default = Main;
