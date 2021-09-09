import VerovioScoreEditor from "verovioscoreeditor"

class Main{

    private parent;
    private field;
    private params;
    private setValue
    private vse: VerovioScoreEditor
    private container: HTMLElement

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
        this.params = params;
        this.setValue = setValue;
    }

    init(){
        this.vse = new VerovioScoreEditor(this.container.firstChild, null, this.setMei)
        this.vse.init()
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

        var subdiv = document.createElement("span")
        subdiv.setAttribute("id", "notationWidgetContainer")
        subdiv.classList.add("content")

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
        var fsDiv = document.querySelector(".h5p-notation-widget")
        if(document.fullscreenElement){
            document.exitFullscreen()
        }else{
            fsDiv.requestFullscreen()
        }
    }).bind(this)

    fullscreenElements = (function fullscreenElements(){
        var fsDiv = document.querySelector(".h5p-notation-widget")
        if(fsDiv.classList.contains("fullscreen")){
            fsDiv.classList.remove("fullscreen")
            document.getElementById("fullscreenWidget").classList.remove("transparent")
        }else{
            fsDiv.classList.add("fullscreen")
            document.getElementById("fullscreenWidget").classList.add("transparent")
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