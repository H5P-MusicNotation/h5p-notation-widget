import { TextPathElement } from "canvg";
import VerovioScoreEditor from "verovioscoreeditor"

class Main{

    private parent;
    private field;
    private params;
    private setValue
    private vse: VerovioScoreEditor
    private container: HTMLElement
    private fieldSet: HTMLElement
    private mei: any

    private currentAttachedElement: Element

    /**
     * Creates the main Class.
     * I wrapped by h5p-notation-widget
     *
     * @param {Object} parent
     * @param {Object} field
     * @param {string} params
     * @param {H5PEditor.SetParameters} setValue
     */
    constructor(parent, field, params, setValue){
        this.parent = parent;
        this.field = field;
        this.mei = params;
        this.setValue = setValue;
        this.setDomAttachObserver()
    }

    init(){
        this.vse = new VerovioScoreEditor(this.container.firstChild, {data: this.mei} || null, this.setMei)
        this.setScriptLoadObserver()
        this.setCurrentTabObserver()
        if(document.getElementById("verovioScript").getAttribute("loaded") === "true"){
            (this.container.querySelector("#clickInsert") as HTMLButtonElement).dispatchEvent(new Event("click"))
        }
        this.fieldSet = this.container.closest("fieldset")
        this.fieldSet.querySelector(".title[role=\"button\"]").addEventListener("click", function(e){
            var t = e.target as HTMLElement
            if(t.getAttribute("aria-expanded") === "true"){
                t.closest("fieldset").style.height = "500px"
            }else{
                t.closest("fieldset").style.height = "auto"
            }
        })
        
    }

    setScriptLoadObserver(){
        var that = this
        var scriptLoadedObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === "attributes") {
                    var t = mutation.target as HTMLElement
                    if(mutation.attributeName === "loaded" && t.getAttribute(mutation.attributeName) === "true"){
                        (that.container.querySelector("#clickInsert") as HTMLButtonElement).dispatchEvent(new Event("click"))//.click()
                    }
                }
            });
        });
        scriptLoadedObserver.observe(document.getElementById("verovioScript"), {
            attributes: true
        })
    }

    setCurrentTabObserver() {
        var that = this
        var currentTabObserver = new MutationObserver(function (mutations){
            mutations.forEach(function(mutation){
            if(mutation.attributeName === "class"){
                var target = mutation.target as Element
                if(["h5p-current"].every(c => target.classList.contains(c))){
                    var vseContainer = target.querySelector(".vse-container")
                    if(vseContainer.id !== that.vse.getCore().getContainer().id) return
                    var core = that.vse.getCore()
                    core.loadData("", core.getCurrentMEI(false), false, "svg_output")     
                }
            }
            })
        })

        document.querySelectorAll(".h5p-vtab-form").forEach(q => {
            currentTabObserver.observe(q, {
                attributes: true
            })
        })
    }

    setDomAttachObserver(){
        var domAttachObserver = new MutationObserver(function(mutations){
            mutations.forEach(function(mutation) {
                Array.from(mutation.addedNodes).forEach(an => {
                    if(an.constructor.name.toLowerCase().includes("element")){
                        var ae = an as Element
                        if(ae.querySelector(".notationWidgetContainer") !== null){
                            if(this.currentAttachedElement?.id != ae.querySelector(".notationWidgetContainer").id){
                                this.currentAttachedElement = ae.querySelector(".notationWidgetContainer")
                                this.currentAttachedElement.dispatchEvent(new Event("containerAttached"))
                            }
                        }
                    }
                })
            })
        })

        domAttachObserver.observe(document, {
            childList: true,
            subtree: true
        })
    }
    
    /**
     * is wrapped by "appenTo" in wrapper class.
     * Container in which the widget will run
     */
    createContainer(): HTMLElement{
        this.container = document.createElement("div")
        this.container.classList.add("field")
        this.container.classList.add("text")
        this.container.classList.add("h5p-notation-widget")

        var id: string
        var subdiv = document.createElement("div")
        subdiv.classList.add("content")
        subdiv.classList.add("notationWidgetContainer")
        var idStump = "notationWidgetContainer"
        id = idStump + "1"
        Array.from(document.getElementsByClassName(idStump)).forEach(nwc => {
            var count = (parseInt(nwc.id.match(/\d+/)[0]) + 1).toString()
            if(document.getElementById(idStump + count) === null){
                id = idStump + count
            }
        })
        subdiv.id = id

        this.container.append(subdiv)

        var button = document.createElement("button")
        button.setAttribute("id", "fullscreenWidget")
        button.textContent = "Fullscreen"
        this.container.append(button)
        button.addEventListener("click", this.fullscreen)
        document.addEventListener("fullscreenchange", this.fullscreenElements)
        return this.container
    }

    fullscreen = (function fullscreen(e: MouseEvent){
        if(document.fullscreenElement){
            document.exitFullscreen()
        }else{
            var userAgent = navigator.userAgent.toLowerCase()
            if(userAgent.includes("apple") && !userAgent.includes("chrome")){
                this.container?.webkitRequestFullscreen()
            }else{
                this.container?.requestFullscreen() 
            }
        }
    }).bind(this)

    fullscreenElements = (function fullscreenElements(){
        if(this.container.classList.contains("fullscreen")){
            this.container.classList.remove("fullscreen")
            this.container.querySelector("#fullscreenWidget").classList.remove("transparent")
        }else{
            this.container.classList.add("fullscreen")
            this.container.querySelector("#fullscreenWidget").classList.add("transparent")
        }
    }).bind(this)

    /**
     * @returns 
     */
    validate(): Boolean{
        return true
    }

    remove(){
        this.vse.getCore().getWindowHandler().removeListeners() // why ist this instance still active? deleting the instance does nothing
    }

    /**
     * Function is Called in VerovioScoreEditor, when MEI has changed
     */
    setMei = (function setMei(mei: string): void{
        this.mei = mei
        this.setValue(this.field, this.mei)
    }).bind(this)
}

export default Main