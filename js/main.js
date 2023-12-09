"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vibe_editor_1 = require("vibe-editor");
const fieldNameStub = "field-name-";
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
                this.vibe.getCore().getVerovioWrapper().getToolkit().setOptions({
                    adjustPageWidth: 1,
                });
                document.exitFullscreen();
                var containerParent = this.container;
                while (containerParent) {
                    containerParent === null || containerParent === void 0 ? void 0 : containerParent.classList.remove("fullscreen");
                    containerParent = containerParent === null || containerParent === void 0 ? void 0 : containerParent.parentElement;
                }
            }
            else {
                this.vibe.getCore().getVerovioWrapper().getToolkit().setOptions({
                    adjustPageWidth: 0,
                });
                var userAgent = navigator.userAgent.toLowerCase();
                if (userAgent.includes("apple") && !userAgent.includes("chrome")) {
                    (_a = this.container) === null || _a === void 0 ? void 0 : _a.webkitRequestFullscreen();
                    while (containerParent) {
                        containerParent === null || containerParent === void 0 ? void 0 : containerParent.classList.add("fullscreen");
                        containerParent = containerParent === null || containerParent === void 0 ? void 0 : containerParent.parentElement;
                    }
                }
                else {
                    (_b = this.container) === null || _b === void 0 ? void 0 : _b.requestFullscreen();
                    while (containerParent) {
                        containerParent === null || containerParent === void 0 ? void 0 : containerParent.classList.add("fullscreen");
                        containerParent = containerParent === null || containerParent === void 0 ? void 0 : containerParent.parentElement;
                    }
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
        this.loadDataHandler = (function loadDataHandler(ce) {
            this.loadData(ce);
        }).bind(this);
        this.setOptionsHandler = (function (ce) {
            this.setOptions(ce.detail);
        }).bind(this);
        this.parent = parent;
        this.field = field;
        //this.mei = params;
        this.setValue = setValue;
        this.options = {};
        this.createContainer();
    }
    init() {
        var _a;
        this.fieldSet = this.container.closest("fieldset");
        this.rootContentContainer = this.container.closest(".h5p-vtab-form.content") || this.container.closest(".tree");
        var interactiveSVGCheckbox = this.fieldSet.querySelector("." + fieldNameStub + "interactiveSVG.boolean input");
        this.interactiveSVG = interactiveSVGCheckbox === null ? true : false; // when checkbox is present default should be false
        var that = this;
        interactiveSVGCheckbox === null || interactiveSVGCheckbox === void 0 ? void 0 : interactiveSVGCheckbox.addEventListener("change", function (e) {
            that.interactiveSVG = e.target.checked;
            that.setMei(that.mei);
        });
        if (this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input") !== null) {
            this.mei = this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input").getAttribute("value");
        }
        var svgStorage = this.fieldSet.querySelector("." + fieldNameStub + "svgStorage input");
        if (svgStorage !== null) {
            this.scoreSVGString = svgStorage.getAttribute("value");
            (_a = this.fieldSet.querySelector("#interactionOverlay")) === null || _a === void 0 ? void 0 : _a.addEventListener("annotChanged", function () {
                that.setMei(that.mei);
            });
        }
        else if (this.rootContentContainer.querySelector("." + fieldNameStub + "annotationField input") !== null) { // get annotation from musicnotation-controller
            this.scoreSVGString = this.rootContentContainer.querySelector("." + fieldNameStub + "annotationField input").getAttribute("value");
        }
        this.container.addEventListener("loadMei", this.loadDataHandler);
        this.container.addEventListener("setOptions", this.setOptionsHandler);
        this.setExpandedAriaObserver();
    }
    expandAria() {
        var that = this;
        that.container.style.height = "500px";
        if (that.vibe == undefined) {
            if (that.mei != undefined) {
                that.vibe = new vibe_editor_1.default(that.container.firstChild, { data: that.mei }, that.setMei.bind(that));
            }
            else {
                that.vibe = new vibe_editor_1.default(that.container.firstChild, null, that.setMei.bind(that));
            }
            //Copy annotationCanvas from stored svg and init it with annnotation
            // if(that.scoreSVGString != undefined){
            //     that.container.firstChild.addEventListener("vibeInit", function(){
            //         that.setAnnotationCanvas()
            //     })
            // }
            that.setScriptLoadObserver();
            that.setCurrentTabObserver();
            if (document.getElementById("verovioScript").getAttribute("loaded") === "true") {
                that.container.querySelector("#notationTabBtn").dispatchEvent(new Event("click"));
            }
        }
    }
    setScriptLoadObserver() {
        var that = this;
        var scriptLoadedObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === "attributes") {
                    var t = mutation.target;
                    if (mutation.attributeName === "loaded" && t.getAttribute(mutation.attributeName) === "true") {
                        that.container.querySelector("#notationTabBtn").dispatchEvent(new Event("click")); //.click()
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
                var _a;
                if (mutation.attributeName === "class") {
                    var target = mutation.target;
                    if (["h5p-current"].every(c => target.classList.contains(c))) {
                        var vibeContainer = target.querySelector(".vibe-container");
                        if (vibeContainer.id !== that.vibe.getCore().getContainer().id)
                            return;
                        var core = (_a = that.vibe) === null || _a === void 0 ? void 0 : _a.getCore();
                        core.loadData(core.getCurrentMEI(false), false).then(() => {
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
    setExpandedAriaObserver() {
        var that = this;
        var expandedObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === "class") {
                    var target = mutation.target;
                    if (target.classList.contains("expanded")) {
                        that.expandAria();
                    }
                    else {
                        that.container.style.height = "auto";
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
        expandedObserver.observe(this.fieldSet, {
            attributes: true,
        });
        expandedObserver.observe(this.fieldSet.parentElement, {
            attributes: true,
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
        //Elements to toggle fullscreen
        var fulscreenBtn = document.createElement("button");
        fulscreenBtn.setAttribute("id", "fullscreenWidget");
        fulscreenBtn.textContent = "Fullscreen";
        this.container.append(fulscreenBtn);
        fulscreenBtn.addEventListener("click", this.fullscreen);
        document.addEventListener("fullscreenchange", this.fullscreenElements);
        return this.container;
    }
    generateUID() {
        var firstPart = ((Math.random() * 46656) | 0).toString(36);
        var secondPart = ((Math.random() * 46656) | 0).toString(36);
        firstPart = ("000" + firstPart).slice(-3);
        secondPart = ("000" + secondPart).slice(-3);
        return "nw" + firstPart + secondPart;
    }
    /**
     * @returns
     */
    validate() {
        return true;
    }
    remove() {
        var _a;
        (_a = this.vibe) === null || _a === void 0 ? void 0 : _a.getCore().getWindowHandler().removeListeners(); // why ist this instance still active? deleting the instance does nothing
    }
    /**
     * This function is called in VerovioScoreEditor, either when MEI has changed or when there are changes in the interactionOverlay
     */
    setMei(mei) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.mei = mei;
        if (!this.interactiveSVG) {
            this.setValue(this.field, this.vibe.getCore().getSVG());
            (_a = this.fieldSet.querySelector("." + fieldNameStub + "svgStorage input")) === null || _a === void 0 ? void 0 : _a.setAttribute("value", this.vibe.getCore().getSVG());
            (_b = this.fieldSet.querySelector("." + fieldNameStub + "svgStorage input")) === null || _b === void 0 ? void 0 : _b.dispatchEvent(new Event("change"));
            (_c = this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input")) === null || _c === void 0 ? void 0 : _c.setAttribute("value", this.mei);
            (_d = this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input")) === null || _d === void 0 ? void 0 : _d.dispatchEvent(new Event("change"));
        }
        else {
            this.setValue(this.field, this.mei);
            (_e = this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input")) === null || _e === void 0 ? void 0 : _e.setAttribute("value", "");
            (_f = this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input")) === null || _f === void 0 ? void 0 : _f.dispatchEvent(new Event("change"));
            (_g = this.fieldSet.querySelector("." + fieldNameStub + "svgStorage input")) === null || _g === void 0 ? void 0 : _g.setAttribute("value", this.vibe.getCore().getSVG());
            (_h = this.fieldSet.querySelector("." + fieldNameStub + "svgStorage input")) === null || _h === void 0 ? void 0 : _h.dispatchEvent(new Event("change"));
        }
        this.container.dispatchEvent(new CustomEvent("notationWidgetUpdate", {
            detail: {
                mei: this.mei,
                svg: this.scoreSVGString
            }
        }));
    }
    /**
     * Clean mei for DOMParser
     * @param mei
     * @returns
     */
    cleanMEI(mei) {
        mei = mei.replace(/\xml:id/gi, "id"); // xml:id attribute will cause parser error
        mei = mei.replace(/\n/g, ""); // delete all unnecessary newline
        mei = mei.replace(/\s{2,}/g, ""); // delete all unnecessary whitespaces
        mei = mei.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"");
        mei = mei.replace(/\xmlns=\"\"/g, "").replace(/\xmlns\s/g, "");
        return mei;
    }
    /**
     * Restore id to xml:id tags so that same ids will be used in verovio again
     * @param xmlDoc
     * @returns
     */
    restoreXmlIdTags(xmlDoc, parse = true) {
        var mei = new XMLSerializer().serializeToString(xmlDoc).replace(/\ id/gi, " xml:id");
        if (parse) {
            return new DOMParser().parseFromString(mei, "text/xml");
        }
        return mei;
    }
    loadData(ce) {
        var mei = ce.detail.mei;
        if (!ce.detail.isFullContainer) {
            this.scoreSVGString = ce.detail.svg;
            this.vibe.getCore().loadData(mei, false).then(() => {
                //this.setAnnotationCanvas()
            });
        }
        else {
            var newVIBEContainer = new DOMParser().parseFromString(ce.detail.svg, "text/html").querySelector(".vibe-container");
            newVIBEContainer.setAttribute("id", this.generateUID()); //newVIBEContainer.id + "-copy")
            this.container.querySelector(".vibe-container").replaceWith(newVIBEContainer);
            this.vibe = new vibe_editor_1.default(newVIBEContainer, { data: ce.detail.mei }, this.setMei.bind(this));
        }
    }
    setOptions(detail) {
        var _a, _b, _c, _d, _e;
        for (const key in detail) {
            this.options[key] = detail[key];
        }
        this.setMei(this.mei);
        this.scoreSVGString = this.rootContentContainer.querySelector(`.${(_a = this.options) === null || _a === void 0 ? void 0 : _a.annotationInputContainer}`).getAttribute("value");
        var annotationStorage = this.rootContentContainer.querySelector(`.${(_b = this.options) === null || _b === void 0 ? void 0 : _b.annotationInputContainer}`);
        if (annotationStorage) {
            this.scoreSVGString = annotationStorage.getAttribute("value");
            (_c = this.fieldSet.querySelector("#interactionOverlay")) === null || _c === void 0 ? void 0 : _c.addEventListener("annotChanged", function () {
                var _a;
                this.setMei(this.mei);
                this.annotationSvgString = this.tree.querySelector(`.${(_a = this.options) === null || _a === void 0 ? void 0 : _a.annotationInputContainer}`).getAttribute("value");
            });
        }
        else if (this.rootContentContainer.querySelector(`.${(_d = this.options) === null || _d === void 0 ? void 0 : _d.annotationInputContainer}`) !== null) { // get annotation from musicnotation-controller
            this.scoreSVGString = this.rootContentContainer.querySelector(`.${(_e = this.options) === null || _e === void 0 ? void 0 : _e.annotationInputContainer}`).getAttribute("value");
        }
    }
    getContainer() {
        return this.container;
    }
}
exports.default = Main;
