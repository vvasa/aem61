/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * @class CQ.form.NamedSlide
 * @private
 * Slide represents a single slide of a slideshow (see {@link CQ.form.Slideshow}).
 * @constructor
 * Creates a new Slide.
 * @param {Object} config The config object
 */
CQ.form.NamedSlide = CQ.Ext.extend(CQ.Ext.emptyFn,  {

    /**
     * @cfg {Object} referencedFileInfo
     * The current info of the referenced file that defines the slide. This has the
     * same format as {@link CQ.form.SmartFile#referencedFileInfo}. Defaults to null.
     */
    referencedFileInfo: null,

    /**
     * @cfg {Number} slideIndex
     * "Index" of the slide; is used to create unique slide names. Newly created slides
     * will have -1, which will be resolved to a correct value before submitting the
     * form. Defaults to -1.
     */
    slideIndex: 0,

    /**
     * @cfg {Boolean} isPersistent
     * True if the slide is already persisted, false if it has been added in the current
     * user transaction (defaults to false)
     */
    isPersistent: false,

    /**
     * @cfg {Boolean} isDeleted
     * True if the slide has been deleted by the user (defaults to false)
     */
    isDeleted: false,

	 /**
      * @cfg {Boolean} isProcessed
      * True if the referenced image has been procesed.
      */
    isProcessed: false,
    /**
     * @cfg {String} mapValue
     * Value of the map tool
     */
    mapValue: null,
    /**
     * @cfg {String} cropValue
     * Value of the crop tool
     */
    cropValue: null,
    /**
     * @cfg {String} rotateValue
     * Value of the rotate tool
     */
    rotateValue: null,
    /**
     * All the form fields
     */
    formValues : null,


    constructor: function(config) {
        var defaults = {
            "referencedFileInfo": null,
            "isPersistent": false,
            "isDeleted": false,
            "slideIndex": -1,
            "isProcessed": false,
            "mapValue": null,
            "cropValue": null,
            "rotateValue": null
        };
        CQ.Ext.apply(this, config, defaults)
    },

    createDisplayText: function() {
        if (this.title) {
            return this.title;
        } else {
            if (this.referencedFileInfo) {
                return this.referencedFileInfo.dataPath;
            } else {
                return CQ.I18n.getMessage("New slide");
            }
        }
    },

    createTransferFields: function(prefix) {
        var fields = [ ];
        var isPrefixed = ((prefix.length > 2) && prefix.substring(0, 2) == "./");
        var basicName = (isPrefixed ? "" : "./") + prefix.replace("$", this.slideIndex);
        
        var deletePrm = basicName + CQ.Sling.DELETE_SUFFIX;

        fields.push(new CQ.Ext.form.Hidden({
            "name": deletePrm,
            "value": "true"
        }));
        
        if (!this.isDeleted) {
            var fileRef = basicName + "/fileReference";
            if (this.referencedFileInfo) {
                fields.push(new CQ.Ext.form.Hidden({
                    "name": fileRef,
                    "value": this.referencedFileInfo.dataPath
                }));
            } else {
                fields.push(new CQ.Ext.form.Hidden({
                    "name": fileRef,
                    "value": ""
                }));
            }
            
            if(this.mapValue){
            	fields.push(new CQ.Ext.form.Hidden({
                    "name": basicName + "/imageMap",
                    "value": this.mapValue
                }));
            }
            
            if(this.cropValue){
            	fields.push(new CQ.Ext.form.Hidden({
                    "name": basicName + "/imageCrop",
                    "value": this.cropValue
                }));
            }

            if(this.rotateValue ){
            	fields.push(new CQ.Ext.form.Hidden({
                    "name": basicName + "/imageRotate",
                    "value": this.rotateValue
                }));
            }
            
            
            fields.push(new CQ.Ext.form.Hidden({
                "name": basicName + "/sling:resourceType",
                "value": "foundation/components/image"
            }));
            
            //Now Copy over the form fields.
            var valueObj = null;
            var fld = null;
            if(this.formValues){
        		for(var i = 0; i < this.formValues.length; i++){
        			valueObj = this.formValues[i];
        			
        			fields.push(new CQ.Ext.form.Hidden({
    	                "name": basicName + "/" + valueObj.fieldName,
    	                "value": valueObj.fieldValue
    	            }));
            	}
        	}
            
            
        } else if (this.isPersistent) {
            var deletePrm = basicName + CQ.Sling.DELETE_SUFFIX;

            fields.push(new CQ.Ext.form.Hidden({
                "name": deletePrm,
                "value": "true"
            }));
        
        }
        return fields;
    }

});
