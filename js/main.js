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
                this.vse.getCore().getVerovioWrapper().getToolkit().setOptions({
                    adjustPageWidth: 1,
                });
                document.exitFullscreen();
            }
            else {
                this.vse.getCore().getVerovioWrapper().getToolkit().setOptions({
                    adjustPageWidth: 0,
                });
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
            // at this point we can be shure, that the core loaded 
            this.vse.getCore().getVerovioWrapper().getToolkit().setOptions({
                adjustPageWidth: 1,
            });
        }).bind(this);
        this.parent = parent;
        this.field = field;
        this.mei = params;
        this.setValue = setValue;
        //this.setDomAttachObserver()
        this.createContainer();
    }
    init() {
        var _a;
        if (this.mei != undefined) {
            this.vse = new verovioscoreeditor_1.default(this.container.firstChild, { data: this.mei }, this.setMei);
        }
        else {
            this.vse = new verovioscoreeditor_1.default(this.container.firstChild, null, this.setMei);
        }
        this.setScriptLoadObserver();
        this.setCurrentTabObserver();
        if (document.getElementById("verovioScript").getAttribute("loaded") === "true") {
            this.container.querySelector("#clickInsert").dispatchEvent(new Event("click"));
        }
        this.fieldSet = this.container.closest("fieldset");
        (_a = this.fieldSet.querySelector(".title[role=\"button\"]")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function (e) {
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
    /**
     * Reload the mei when tab is clicked, so that the svg will be shown in proper size
     */
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
                        core.loadData("", core.getCurrentMEI(false), false, "svg_output").then(() => {
                            var overlay = that.container.querySelector("#interactionOverlay");
                            Array.from(overlay.querySelectorAll(":scope > *")).forEach(anc => {
                                anc.setAttribute("viewBox", overlay.getAttribute("viewBox"));
                            });
                        });
                    }
                }
                if (mutation.target.constructor.name.toLowerCase().includes("element")) {
                    var mt = mutation.target;
                    if (mt.id === "interactionOverlay") {
                        Array.from(mt.querySelectorAll(":scope > *")).forEach(anc => {
                            anc.setAttribute("viewBox", mt.getAttribute("viewBox"));
                        });
                    }
                }
            });
        });
        document.querySelectorAll(".h5p-vtab-form").forEach(q => {
            currentTabObserver.observe(q, {
                attributes: true,
                childList: true,
                subtree: true
            });
        });
    }
    /**
     * Container in which the widget will run.
     * Id is randomized so that async initalisation could work
     */
    createContainer() {
        this.container = document.createElement("div");
        this.container.classList.add("field");
        this.container.classList.add("text");
        this.container.classList.add("h5p-notation-widget");
        var subdiv = document.createElement("div");
        subdiv.classList.add("content");
        subdiv.classList.add("notationWidgetContainer");
        var idStump = "notationWidgetContainer";
        subdiv.id = idStump + "_" + this.generateUID();
        while (document.getElementById(subdiv.id) !== null) {
            subdiv.id = idStump + "_" + this.generateUID();
        }
        this.container.append(subdiv);
        var button = document.createElement("button");
        button.setAttribute("id", "fullscreenWidget");
        button.textContent = "Fullscreen";
        this.container.append(button);
        button.addEventListener("click", this.fullscreen);
        document.addEventListener("fullscreenchange", this.fullscreenElements);
        return this.container;
    }
    generateUID() {
        var firstPart = ((Math.random() * 46656) | 0).toString(36);
        var secondPart = ((Math.random() * 46656) | 0).toString(36);
        firstPart = ("000" + firstPart).slice(-3);
        secondPart = ("000" + secondPart).slice(-3);
        return firstPart + secondPart;
    }
    /**
     * @returns
     */
    validate() {
        return true;
    }
    remove() {
        var _a;
        (_a = this.vse) === null || _a === void 0 ? void 0 : _a.getCore().getWindowHandler().removeListeners(); // why ist this instance still active? deleting the instance does nothing
    }
    getContainer() {
        return this.container;
    }
}
exports.default = Main;
