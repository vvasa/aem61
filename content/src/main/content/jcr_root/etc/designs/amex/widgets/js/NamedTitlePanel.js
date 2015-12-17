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
 * @class CQ.form.NamedTitlePanel
 * @extends CQ.Ext.Panel
 * @private
 * The TitlePanel provides the UI to edit the title of each slide.
 * @constructor
 * Creates a new TitlePanel.
 * @param {Object} config The config object
 */
CQ.form.NamedTitlePanel = CQ.Ext.extend(CQ.Ext.Panel, {

	fieldItems: null,
	
	titleFieldName: null,
	
	leadFieldName: null,
	
    constructor: function(config) {

    	this.titleFieldName =  config.titleFieldName;
    	
    	this.leadFieldName =  config.leadFieldName;
    	
    	var fields = CQ.Util.copyObject(config.fieldsConfig);
    	
    	var panelHeight = fields.length == 0 ? 0:350;

		this.fieldItems = new Array();
		this.fieldItems.push({
            "xtype": "hidden",
            "name": this.titleFieldName,
            "fieldLabel":"Slide Title",
            "fieldDescription":"A unique name for this slide.",
            "allowBlank": true,
            "anchor": "90%"
        });


		for (var i=0; i< fields.length; i++) {
            this.fieldItems.push(fields[i]);
        }

        newconfig = { };
        var defaults = {
        	"autoScroll": true,
            "layout": "form",
            "defaults": {
                "style": "padding: 3px;"
            },
            "height": panelHeight,
            "items": this.fieldItems

        };

        CQ.Util.applyDefaults(newconfig, defaults);
        CQ.form.NamedTitlePanel.superclass.constructor.call(this, newconfig);

    },

    initComponent: function() {
        CQ.form.NamedSlidesPanel.superclass.initComponent.call(this);
    },

    afterRender: function() {
        CQ.form.NamedTitlePanel.superclass.afterRender.call(this);
        this.el.setVisibilityMode(CQ.Ext.Element.DISPLAY);
        this.body.setVisibilityMode(CQ.Ext.Element.DISPLAY);
    },


    setTitle: function(title) {
        var f =  this.findParentByType("form").getForm();
		var titleField = f.findField(this.titleFieldName);
        titleField.setValue(title ? title : "");
    },

    getTitle: function() {
        var f =  this.findParentByType("form").getForm();
        var leadValue = null;
        
        //Check if a field with the name as leadFieldName.value exists.
        if(this.leadFieldName){
        	var leadField = f.findField(this.leadFieldName);
            
            if(leadField){
            	leadValue = leadField.getValue();
            	if(leadValue && leadValue.indexOf("/") != -1){
            		var indx = 0;
            		if(leadValue.lastIndexOf("/") != leadValue.len - 1){
            			indx = leadValue.lastIndexOf("/") + 1;
            		} else {
            			indx = leadValue.lastIndexOf("/");
            		}
            		leadValue = leadValue.substr(indx);
            	} else if(leadValue && (leadValue.indexOf("yt|") != -1 || leadValue.indexOf("bc|") != -1 )){
            		
            		if(leadValue.indexOf("yt|") != -1){
            			leadValue = leadValue.substr(leadValue.indexOf("yt|") + 3);
            		} else {
            			leadValue = leadValue.substr(leadValue.indexOf("bc|") + 3);
            		}
            	}
            	
            } else {
            	var titleField = f.findField(this.titleFieldName);
            	leadValue = titleField.getValue();
            }
        } else {
        	var titleField = f.findField(this.titleFieldName);
        	leadValue = titleField.getValue();
        }
        
        //Make sure that this new title is same as the value in the title field.
        if(leadValue){
        	this.setTitle(leadValue);
        }
        
        
        return leadValue;
    },

    disableFormElements: function() {
        
    	var frm =  this.findParentByType("form").getForm();
    	var fldName = null;
    	var fld = null;
    	for(var i = 0; i < this.fieldItems.length; i++){
    		fldName = this.fieldItems[i].name;
    		fld = frm.findField(this.fieldItems[i].name);
    		fld.disable();
    	}
    	
    },
    
    enableFormElements: function() {
        
    	var frm =  this.findParentByType("form").getForm();
    	var fldName = null;
    	var fld = null;
    	for(var i = 0; i < this.fieldItems.length; i++){
    		fldName = this.fieldItems[i].name;
    		fld = frm.findField(this.fieldItems[i].name);
    		fld.enable();
    	}
    },
    
    getFormValues: function() {
    	
    	var formValues = new Array();
    	var frm =  this.findParentByType("form").getForm();
    	var fldName = null;
    	var fldValue = null;
    	var fld = null;
    	for(var i = 0; i < this.fieldItems.length; i++){
    		fldName = this.fieldItems[i].name;
    		fld = frm.findField(this.fieldItems[i].name);
    		fldValue = fld.getValue();
    		formValues.push({"fieldName":fldName, "fieldValue":fldValue});
    	}
    	
    	return formValues;
    	
    	
    },
    
    getFormValuesFromData: function(data) {
    	
    	var formValues = new Array();
    	
    	for(var i = 0; i < this.fieldItems.length; i++){
    		fldName = this.fieldItems[i].name;
    		fldValue = (data ? data[fldName] : null);
    			
    		formValues.push({"fieldName":fldName, "fieldValue":fldValue});
    	}
    	
    	return formValues;
    	
    	
    },
    
    setFormValues: function(values) {
    	var valueObj = null;
    	var frm =  this.findParentByType("form").getForm();
    	var fld = null;
    	
    	if(values){
    		for(var i = 0; i < values.length; i++){
    			valueObj = values[i];
    			fld = frm.findField(valueObj.fieldName);
    			fld.setValue(valueObj.fieldValue ? valueObj.fieldValue : "" );
        	}
    	}
    },
    
    resetFormValues: function( ) {
    	var frm =  this.findParentByType("form").getForm();
    	var fldName = null;
    	var fld = null;
    	var allowBlank = true;
    	for(var i = 0; i < this.fieldItems.length; i++){
    		fldName = this.fieldItems[i].name;
    		fld = frm.findField(this.fieldItems[i].name);
    		allowBlank = fld.allowBlank;
    		fld.setValue("");
    	}
    },
    
    validateMandatoryFields: function() {
    	
    	var frm =  this.findParentByType("form").getForm();
    	var fldName = null;
    	var fld = null;
    	var isValid = true;
    	for(var i = 0; i < this.fieldItems.length; i++){
    		fldName = this.fieldItems[i].name;
    		fld = frm.findField(this.fieldItems[i].name);
    		if(!fld.isValid()){
    			isValid = false;
    		}
    		
    	}
    	
    	if(!isValid){
    		
    		return false;
    	}
    	
    	return true;
    	
    	
    }
    
    
});