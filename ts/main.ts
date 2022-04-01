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
        console.log("parent", parent)
        console.log("field", field)
        console.log("params", params)
        this.parent = parent;
        this.field = field;
        this.params = params;
        this.setValue = setValue;
        this.setDomAttachObserver()
    }

    init(){
        this.vse = new VerovioScoreEditor(this.container.firstChild, null, this.setMei)
        this.setScriptLoadObserver()
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
            if(navigator.userAgent.includes("Apple")){
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
        //TODO
    }

    /**
     * Function is Called in VerovioScoreEditor, when MEI has changed
     */
    setMei = (function setMei(mei: string): void{
        this.setValue(this.field, mei)
    }).bind(this)
}

export default Main