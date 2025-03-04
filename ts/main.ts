import { CustomOptions } from "compression-webpack-plugin";
import VIBE from "vibe-editor";

const fieldNameStub = "field-name-"
class Main {

    private parent;
    private field;
    private params;
    private setValue
    private vibe: VIBE
    private container: HTMLElement
    private fieldSet: HTMLElement
    private rootContentContainer: HTMLElement //parentelement of all Elements defined in semantics.json
    private mei: string
    private scoreSVGString: string 
    private annotationCanvas: string
    private interactiveSVG: boolean
    private options: any


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
        this.parent = parent;
        this.field = field;
        //this.mei = params;
        this.setValue = setValue;
        this.options = {}
        this.createContainer()
    }

    init() {
        this.fieldSet = this.container.closest("fieldset")
        this.rootContentContainer = this.container.closest(".h5p-vtab-form.content") || this.container.closest(".tree")
        var interactiveSVGCheckbox = this.fieldSet.querySelector("." + fieldNameStub + "interactiveSVG.boolean input")
        this.interactiveSVG = interactiveSVGCheckbox === null ? true : false // when checkbox is present default should be false
        var that = this
        interactiveSVGCheckbox?.addEventListener("change", function(e){
            that.interactiveSVG = (e.target as HTMLInputElement).checked
            that.setMei(that.mei)
        })

        if(this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input") !== null){
            this.mei = this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input").getAttribute("value")
        }
        var svgStorage = this.fieldSet.querySelector("." + fieldNameStub + "svgStorage input")
        if(svgStorage !== null){
            this.scoreSVGString = svgStorage.getAttribute("value")
            this.fieldSet.querySelector("#interactionOverlay")?.addEventListener("annotChanged", function(){
                that.setMei(that.mei)
            })


        }else if(this.rootContentContainer.querySelector("." + fieldNameStub + "annotationField input") !== null){ // get annotation from musicnotation-controller
            this.scoreSVGString = this.rootContentContainer.querySelector("." + fieldNameStub + "annotationField input").getAttribute("value")
        }

        this.container.addEventListener("loadMei", this.loadDataHandler)
        this.container.addEventListener("setOptions", this.setOptionsHandler)

        this.setExpandedAriaObserver()
    }

    expandAria() {
        var that = this
        that.container.style.height = "500px"
        if (that.vibe == undefined) {

            if (that.mei != undefined) {
                that.vibe = new VIBE(that.container.firstChild, { data: that.mei }, that.setMei.bind(that))
            } else {
                that.vibe = new VIBE(that.container.firstChild, null, that.setMei.bind(that))
            }

            //Copy annotationCanvas from stored svg and init it with annnotation
            // if(that.scoreSVGString != undefined){
            //     that.container.firstChild.addEventListener("vibeInit", function(){
            //         that.setAnnotationCanvas()
            //     })
            // }

            that.setScriptLoadObserver()
            that.setCurrentTabObserver()
            if (document.getElementById("verovioScript").getAttribute("loaded") === "true") {
                (that.container.querySelector("#notationTabBtn") as HTMLButtonElement).dispatchEvent(new Event("click"))
            }
        }
    }

    setScriptLoadObserver() {
        var that = this
        var scriptLoadedObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === "attributes") {
                    var t = mutation.target as HTMLElement
                    if (mutation.attributeName === "loaded" && t.getAttribute(mutation.attributeName) === "true") {
                        (that.container.querySelector("#notationTabBtn") as HTMLButtonElement).dispatchEvent(new Event("click"))//.click()
                    }
                }
            });
        });
        scriptLoadedObserver.observe(document.getElementById("verovioScript"), {
            attributes: true
        })
    }

    /**
     * Reload the mei when tab is clicked, so that the svg will be shown in proper size
     */
    setCurrentTabObserver() {
        var that = this
        var currentTabObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === "class") {
                    var target = mutation.target as Element
                    if (["h5p-current"].every(c => target.classList.contains(c))) {
                        var vibeContainer = target.querySelector(".vibe-container")
                        if (vibeContainer.id !== that.vibe.getCore().getContainer().id) return
                        var core = that.vibe?.getCore()
                        core.loadData(core.getCurrentMEI(false), false).then(() => {
                            var overlay = that.container.querySelector("#interactionOverlay")
                            Array.from(overlay.querySelectorAll(":scope > *")).forEach(anc => {
                                anc.setAttribute("viewBox", overlay.getAttribute("viewBox"))
                            })
                        })
                    }
                }

                if (mutation.target.constructor.name.toLowerCase().includes("element")) {
                    var mt = mutation.target as Element
                    if (mt.id === "interactionOverlay") {
                        Array.from(mt.querySelectorAll(":scope > *")).forEach(anc => {
                            anc.setAttribute("viewBox", mt.getAttribute("viewBox"))
                        })
                    }
                }
            })
        })

        document.querySelectorAll(".h5p-vtab-form").forEach(q => {
            currentTabObserver.observe(q, {
                attributes: true,
                childList: true,
                subtree: true
            })
        })
    }

    setExpandedAriaObserver() {
        var that = this
        var expandedObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === "class") {
                    var target = mutation.target as Element
                    if (target.classList.contains("expanded")) {
                        that.expandAria()
                    } else {
                        that.container.style.height = "auto"
                    }
                }
    
                if (mutation.target.constructor.name.toLowerCase().includes("element")) {
                    var mt = mutation.target as Element
                    if (mt.id === "interactionOverlay") {
                        Array.from(mt.querySelectorAll(":scope > *")).forEach(anc => {
                            anc.setAttribute("viewBox", mt.getAttribute("viewBox"))
                        })
                    }
                }
            })
        })


        expandedObserver.observe(this.fieldSet, {
            attributes: true,
        })
        expandedObserver.observe(this.fieldSet.parentElement, {
            attributes: true,
        })


    }

    /**
     * Container in which the widget will run.
     * Id is randomized so that async initalisation could work
     */
    createContainer(): HTMLElement {
        this.container = document.createElement("div")
        this.container.classList.add("field")
        this.container.classList.add("text")
        this.container.classList.add("h5p-notation-widget")

        var subdiv = document.createElement("div")
        subdiv.classList.add("content")
        subdiv.classList.add("notationWidgetContainer")
        var idStump = "notationWidgetContainer"
        subdiv.id = idStump + "_" + this.generateUID()
        while (document.getElementById(subdiv.id) !== null) {
            subdiv.id = idStump + "_" + this.generateUID()
        }
        this.container.append(subdiv)
        //Elements to toggle fullscreen
        var fulscreenBtn = document.createElement("button")
        fulscreenBtn.setAttribute("id", "fullscreenWidget")
        fulscreenBtn.textContent = "Fullscreen"
        this.container.append(fulscreenBtn)
        fulscreenBtn.addEventListener("click", this.fullscreen)
        document.addEventListener("fullscreenchange", this.fullscreenElements)

        return this.container
    }

    generateUID() {
        var firstPart = ((Math.random() * 46656) | 0).toString(36)
        var secondPart = ((Math.random() * 46656) | 0).toString(36)
        firstPart = ("000" + firstPart).slice(-3);
        secondPart = ("000" + secondPart).slice(-3);
        return "nw" + firstPart + secondPart;
    }

    fullscreen = (function fullscreen(e: MouseEvent) {
        if (document.fullscreenElement) {
            this.vibe.getCore().getVerovioWrapper().getToolkit().setOptions({
                adjustPageWidth: 1,
            })
            document.exitFullscreen()
            var containerParent = this.container
            while (containerParent) {
                containerParent?.classList.remove("fullscreen")
                containerParent = containerParent?.parentElement
            }

        } else {
            this.vibe.getCore().getVerovioWrapper().getToolkit().setOptions({
                adjustPageWidth: 0,
            })
            var userAgent = navigator.userAgent.toLowerCase()
            if (userAgent.includes("apple") && !userAgent.includes("chrome")) {
                this.container?.webkitRequestFullscreen()
                while (containerParent) {
                    containerParent?.classList.add("fullscreen")
                    containerParent = containerParent?.parentElement
                }
            } else {
                this.container?.requestFullscreen()
                while (containerParent) {
                    containerParent?.classList.add("fullscreen")
                    containerParent = containerParent?.parentElement
                }
            }
        }
    }).bind(this)

    fullscreenElements = (function fullscreenElements() {
        if (this.container.classList.contains("fullscreen")) {
            this.container.classList.remove("fullscreen")
            this.container.querySelector("#fullscreenWidget").classList.remove("transparent")
        } else {
            this.container.classList.add("fullscreen")
            this.container.querySelector("#fullscreenWidget").classList.add("transparent")
        }
    }).bind(this)

    /**
     * @returns 
     */
    validate(): Boolean {
        return true
    }

    remove() {
        this.vibe?.getCore().getWindowHandler().removeListeners() // why ist this instance still active? deleting the instance does nothing
    }

    /**
     * This function is called in VerovioScoreEditor, either when MEI has changed or when there are changes in the interactionOverlay
     */
    setMei(mei: string): void {
        this.mei = mei
        if (!this.interactiveSVG) {
            this.setValue(this.field, this.vibe.getCore().getSVG())

            this.fieldSet.querySelector("." + fieldNameStub + "svgStorage input")?.setAttribute("value", this.vibe.getCore().getSVG())
            this.fieldSet.querySelector("." + fieldNameStub + "svgStorage input")?.dispatchEvent(new Event("change"))

            this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input")?.setAttribute("value", this.mei)
            this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input")?.dispatchEvent(new Event("change"))
        } else {
            this.setValue(this.field, this.mei)
            this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input")?.setAttribute("value", "")
            this.fieldSet.querySelector("." + fieldNameStub + "meiStorage input")?.dispatchEvent(new Event("change"))

            this.fieldSet.querySelector("." + fieldNameStub + "svgStorage input")?.setAttribute("value", this.vibe.getCore().getSVG())
            this.fieldSet.querySelector("." + fieldNameStub + "svgStorage input")?.dispatchEvent(new Event("change"))
        }
        this.container.dispatchEvent(new CustomEvent("notationWidgetUpdate", {
            detail: {
                mei: this.mei, 
                svg: this.scoreSVGString
            }
        }))
    }

    /**
     * Clean mei for DOMParser
     * @param mei 
     * @returns 
     */
    cleanMEI(mei: string): string {
        mei = mei.replace(/\xml:id/gi, "id"); // xml:id attribute will cause parser error
        mei = mei.replace(/\n/g, ""); // delete all unnecessary newline
        mei = mei.replace(/\s{2,}/g, ""); // delete all unnecessary whitespaces
        mei = mei.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"");
        mei = mei.replace(/\xmlns=\"\"/g, "").replace(/\xmlns\s/g, "")
        return mei;
    }

    /**
     * Restore id to xml:id tags so that same ids will be used in verovio again
     * @param xmlDoc 
     * @returns 
     */
    restoreXmlIdTags(xmlDoc: Document, parse: Boolean = true) {
        var mei = new XMLSerializer().serializeToString(xmlDoc).replace(/\ id/gi, " xml:id");
        if (parse) {
            return new DOMParser().parseFromString(mei, "text/xml");
        }
        return mei
    }

    loadDataHandler = (function loadDataHandler(ce: CustomEvent){
        this.loadData(ce)
    }).bind(this)

    loadData(ce: CustomEvent){
        var mei = ce.detail.mei
        if(!ce.detail.isFullContainer){
            this.scoreSVGString = ce.detail.svg
            this.vibe.getCore().loadData(mei, false).then(() => {
                //this.setAnnotationCanvas()
            })
        }else{
            var newVIBEContainer = new DOMParser().parseFromString(ce.detail.svg, "text/html").querySelector(".vibe-container")
            newVIBEContainer.setAttribute("id", this.generateUID())//newVIBEContainer.id + "-copy")
            this.container.querySelector(".vibe-container").replaceWith(newVIBEContainer)
            this.vibe = new VIBE(newVIBEContainer, { data: ce.detail.mei }, this.setMei.bind(this))
        }
    }


    setOptionsHandler = (function(ce: CustomEvent){
        this.setOptions(ce.detail)
    }).bind(this)

    setOptions(detail: Record<string, string>){
        for(const key in detail){
            this.options[key] = detail[key]
        }

        this.setMei(this.mei)
        this.scoreSVGString = this.rootContentContainer.querySelector(`.${this.options?.annotationInputContainer}`).getAttribute("value")

        var annotationStorage = this.rootContentContainer.querySelector(`.${this.options?.annotationInputContainer}`)
        if(annotationStorage){
            this.scoreSVGString = annotationStorage.getAttribute("value")
            this.fieldSet.querySelector("#interactionOverlay")?.addEventListener("annotChanged", function(){
                this.setMei(this.mei)
                this.annotationSvgString = this.tree.querySelector(`.${this.options?.annotationInputContainer}`).getAttribute("value")
            })


        }else if(this.rootContentContainer.querySelector(`.${this.options?.annotationInputContainer}`) !== null){ // get annotation from musicnotation-controller
            this.scoreSVGString = this.rootContentContainer.querySelector(`.${this.options?.annotationInputContainer}`).getAttribute("value")
        }
    }

    getContainer() {
        return this.container
    }
}

export default Main