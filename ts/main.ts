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
        const data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><?xml-model href=\"https://music-encoding.org/schema/dev/mei-all.rng\" type=\"application/xml\" schematypens=\"http://relaxng.org/ns/structure/1.0\"?><?xml-model href=\"https://music-encoding.org/schema/dev/mei-all.rng\" type=\"application/xml\" schematypens=\"http://purl.oclc.org/dsdl/schematron\"?><mei xmlns=\"http://www.music-encoding.org/ns/mei\" meiversion=\"5.0.0-dev\"><meiHead><fileDesc><titleStmt><title>empty_mei</title><respStmt /></titleStmt><pubStmt><date isodate=\"2022-02-07\" type=\"encoding-date\">2022-02-07</date></pubStmt></fileDesc><encodingDesc xml:id=\"encodingdesc-jl6jho\"><appInfo xml:id=\"appinfo-gcm9pe\"><application xml:id=\"application-wkm1yu\" isodate=\"2022-02-07T10:52:22\" version=\"3.9.0-dev-4c296ea\"><name xml:id=\"name-v26wae\">Verovio</name><p xml:id=\"p-8ib55f\">Transcoded from MusicXML</p></application></appInfo></encodingDesc></meiHead><music><body><mdiv xml:id=\"mizv9bf\"><score xml:id=\"scss6jy\"><scoreDef xml:id=\"selkmlk\"><staffGrp xml:id=\"se58xab\"><staffGrp xml:id=\"srw2ty8\"><staffDef xml:id=\"P1\" n=\"1\" lines=\"5\" ppq=\"1\"><instrDef xml:id=\"isz4c65\" midi.channel=\"0\" midi.instrnum=\"0\" midi.volume=\"78.00%\" /><clef xml:id=\"cnj8pxy\" shape=\"G\" line=\"2\" /><keySig xml:id=\"kmdmhsk\" sig=\"0\" /><meterSig xml:id=\"mxikzei\" count=\"4\" unit=\"4\" /></staffDef></staffGrp></staffGrp></scoreDef><section xml:id=\"s227x2r\"><measure xml:id=\"mc89b2s\" n=\"1\"><staff xml:id=\"sllhm20\" n=\"1\"><layer xml:id=\"lu2fusu\" n=\"1\"><mRest xml:id=\"mcm3xfx\" /></layer></staff></measure></section></score></mdiv></body></music></mei>"
        this.vse = new VerovioScoreEditor(this.container.firstChild, {data: data})
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
            var count = (nwc.id.match(/\d+/)[0] + 1).toString()
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
            this.container.requestFullscreen()
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