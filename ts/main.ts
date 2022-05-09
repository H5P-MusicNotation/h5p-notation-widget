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
        //this.setDomAttachObserver()
        this.createContainer()
    }

    init(){
        if(this.mei != undefined){
            this.vse = new VerovioScoreEditor(this.container.firstChild, {data: this.mei}, this.setMei)
        }else{
            this.vse = new VerovioScoreEditor(this.container.firstChild, null, this.setMei)
        }
        this.setScriptLoadObserver()
        this.setCurrentTabObserver()
        if(document.getElementById("verovioScript").getAttribute("loaded") === "true"){
            (this.container.querySelector("#clickInsert") as HTMLButtonElement).dispatchEvent(new Event("click"))
        }

        this.fieldSet = this.container.closest("fieldset")
        this.fieldSet.querySelector(".title[role=\"button\"]")?.addEventListener("click", function(e){
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

    /**
     * Reload the mei when tab is clicked, so that the svg will be shown in proper size
     */
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
                        core.loadData("", core.getCurrentMEI(false), false, "svg_output").then(() => {
                            var overlay = that.container.querySelector("#interactionOverlay")
                            Array.from(overlay.querySelectorAll(":scope > *")).forEach(anc => {
                                anc.setAttribute("viewBox", overlay.getAttribute("viewBox"))
                            })
                        })
                    }
                }
                
                if(mutation.target.constructor.name.toLowerCase().includes("element")){
                    var mt = mutation.target as Element
                    if(mt.id === "interactionOverlay"){
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
    
    /**
     * Container in which the widget will run.
     * Id is randomized so that async initalisation could work
     */
    createContainer(): HTMLElement{
        this.container = document.createElement("div")
        this.container.classList.add("field")
        this.container.classList.add("text")
        this.container.classList.add("h5p-notation-widget")

        var subdiv = document.createElement("div")
        subdiv.classList.add("content")
        subdiv.classList.add("notationWidgetContainer")
        var idStump = "notationWidgetContainer"
        subdiv.id = idStump + "_" + this.generateUID()
        while(document.getElementById(subdiv.id) !== null){
            subdiv.id = idStump + "_" + this.generateUID()
        }
        this.container.append(subdiv)
        var button = document.createElement("button")
        button.setAttribute("id", "fullscreenWidget")
        button.textContent = "Fullscreen"
        this.container.append(button)
        button.addEventListener("click", this.fullscreen)
        document.addEventListener("fullscreenchange", this.fullscreenElements)
        return this.container
    }

    generateUID() {
        var firstPart = ((Math.random() * 46656) | 0).toString(36)
        var secondPart = ((Math.random() * 46656) | 0).toString(36)
        firstPart = ("000" + firstPart).slice(-3);
        secondPart = ("000" + secondPart).slice(-3);
        return firstPart + secondPart;
    }

    fullscreen = (function fullscreen(e: MouseEvent){
        if(document.fullscreenElement){
            this.vse.getCore().getVerovioWrapper().getToolkit().setOptions({
                adjustPageWidth: 1,
            })
            document.exitFullscreen()
        }else{
            this.vse.getCore().getVerovioWrapper().getToolkit().setOptions({
                adjustPageWidth: 0,
            })
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
        this.vse?.getCore().getWindowHandler().removeListeners() // why ist this instance still active? deleting the instance does nothing
    }

    /**
     * Function is Called in VerovioScoreEditor, when MEI has changed
     */
    setMei = (function setMei(mei: string): void{
        this.mei = mei
        this.setValue(this.field, this.mei)
         // at this point we can be shure, that the core loaded 
         this.vse.getCore().getVerovioWrapper().getToolkit().setOptions({
            adjustPageWidth: 1,
        })
    }).bind(this)
    
    getContainer(){
        return this.container
    }
}

export default Main