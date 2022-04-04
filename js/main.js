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
            var _a, _b;
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            else {
                var userAgent = navigator.userAgent.toLowerCase();
                if (userAgent.includes("apple") && !userAgent.includes("chrome")) {
                    (_a = this.container) === null || _a === void 0 ? void 0 : _a.webkitRequestFullscreen();
                }
                else {
                    (_b = this.container) === null || _b === void 0 ? void 0 : _b.requestFullscreen();
                }
            }
        }).bind(this);
        this.fullscreenElements = (function fullscreenElements() {
            if (this.container.classList.contains("fullscreen")) {
                this.container.classList.remove("fullscreen");
                this.container.querySelector("#fullscreenWidget").classList.remove("transparent");
            }
            else {
                this.container.classList.add("fullscreen");
                this.container.querySelector("#fullscreenWidget").classList.add("transparent");
            }
        }).bind(this);
        /**
         * Function is Called in VerovioScoreEditor, when MEI has changed
         */
        this.setMei = (function setMei(mei) {
            this.mei = mei;
            this.setValue(this.field, this.mei);
        }).bind(this);
        this.parent = parent;
        this.field = field;
        this.mei = params;
        this.setValue = setValue;
        this.setDomAttachObserver();
    }
    init() {
        this.vse = new verovioscoreeditor_1.default(this.container.firstChild, { data: this.mei } || null, this.setMei);
        this.setScriptLoadObserver();
        this.setCurrentTabObserver();
        if (document.getElementById("verovioScript").getAttribute("loaded") === "true") {
            this.container.querySelector("#clickInsert").dispatchEvent(new Event("click"));
        }
        this.fieldSet = this.container.closest("fieldset");
        this.fieldSet.querySelector(".title[role=\"button\"]").addEventListener("click", function (e) {
            var t = e.target;
            if (t.getAttribute("aria-expanded") === "true") {
                t.closest("fieldset").style.height = "500px";
            }
            else {
                t.closest("fieldset").style.height = "auto";
            }
        });
    }
    setScriptLoadObserver() {
        var that = this;
        var scriptLoadedObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === "attributes") {
                    var t = mutation.target;
                    if (mutation.attributeName === "loaded" && t.getAttribute(mutation.attributeName) === "true") {
                        that.container.querySelector("#clickInsert").dispatchEvent(new Event("click")); //.click()
                    }
                }
            });
        });
        scriptLoadedObserver.observe(document.getElementById("verovioScript"), {
            attributes: true
        });
    }
    setCurrentTabObserver() {
        var that = this;
        var currentTabObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === "class") {
                    var target = mutation.target;
                    if (["h5p-current"].every(c => target.classList.contains(c))) {
                        var vseContainer = target.querySelector(".vse-container");
                        if (vseContainer.id !== that.vse.getCore().getContainer().id)
                            return;
                        var core = that.vse.getCore();
                        core.loadData("", core.getCurrentMEI(false), false, "svg_output");
                    }
                }
            });
        });
        document.querySelectorAll(".h5p-vtab-form").forEach(q => {
            currentTabObserver.observe(q, {
                attributes: true
            });
        });
    }
    setDomAttachObserver() {
        var domAttachObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                Array.from(mutation.addedNodes).forEach(an => {
                    var _a;
                    if (an.constructor.name.toLowerCase().includes("element")) {
                        var ae = an;
                        if (ae.querySelector(".notationWidgetContainer") !== null) {
                            if (((_a = this.currentAttachedElement) === null || _a === void 0 ? void 0 : _a.id) != ae.querySelector(".notationWidgetContainer").id) {
                                this.currentAttachedElement = ae.querySelector(".notationWidgetContainer");
                                this.currentAttachedElement.dispatchEvent(new Event("containerAttached"));
                            }
                        }
                    }
                });
            });
        });
        domAttachObserver.observe(document, {
            childList: true,
            subtree: true
        });
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
        var id;
        var subdiv = document.createElement("div");
        subdiv.classList.add("content");
        subdiv.classList.add("notationWidgetContainer");
        var idStump = "notationWidgetContainer";
        id = idStump + "1";
        Array.from(document.getElementsByClassName(idStump)).forEach(nwc => {
            var count = (parseInt(nwc.id.match(/\d+/)[0]) + 1).toString();
            if (document.getElementById(idStump + count) === null) {
                id = idStump + count;
            }
        });
        subdiv.id = id;
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
        this.vse.getCore().getWindowHandler().removeListeners(); // why ist this instance still active? deleting the instance does nothing
    }
}
exports.default = Main;
