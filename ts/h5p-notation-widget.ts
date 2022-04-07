import '../css/h5p-notation-widget.css';
import Main from "./main";

/**
 * This is a H5P conform wrapper for a similar typescript class.
 */
 
//@ts-ignore
H5P = H5P || {}

//@ts-ignore
H5PEditor.widgets.notationWidget = H5PEditor.NotationWidget = (function ($) {
    

    /**
     * 
     *
     * @param {Object} parent
     * @param {Object} field
     * @param {string} params
     * @param {H5PEditor.SetParameters} setValue
     */
    function NotationWidget(parent, field, params, setValue) {
      var self = this
      this.mainInstance = new Main(parent, field, params, setValue)
    }
     
    /**
     * Append the field to the wrapper.
     * .
     *
     * @param {H5P.jQuery} $wrapper
     */
    NotationWidget.prototype.appendTo = function ($wrapper) {
      var self = this
      self.$container = this.mainInstance.getContainer()
      $wrapper.append(self.$container)

      //only initialize mainInstance, when container is really added
      var found = false
      var observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          Array.from(mutation.addedNodes).forEach(an => {
            if(an.constructor.name.toLowerCase().includes("element")){
              var ae = an as Element
              if(ae.querySelector("#" + self.$container.firstChild.id) !== null && !found){
                found = true
                self.mainInstance.init()
              }
            }
          })
        })
        //if container couldn't be found during observation, 
        //we assume that it is already already present in DOM before observer was initalized
        if(!found){
          self.mainInstance.init()
        }
      })

      observer.observe(document, {
        childList: true, 
        subtree: true
      })
    };
   
    /**
     * Validate the current values.
     *
     * @returns {boolean}
     */
    NotationWidget.prototype.validate = function () {
      this.mainInstance.validate()
    };
   
    /**
     * Remove the current field
     */
    NotationWidget.prototype.remove = function () {
      this.mainInstance.remove()
    };
   
    return NotationWidget;
    //@ts-ignore
  })(H5P.jQuery);