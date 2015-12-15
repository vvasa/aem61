/**
 * The <code>CQ.form.CompositeSlides</code> class represents an editable list
 * of form fields for editing multi value properties.
 * 
 * @class CQ.form.CompositeSlides
 * @extends CQ.form.CompositeField
 */
CQ.form.CompositeSlides = CQ.Ext.extend(CQ.form.CompositeField, {

    /**
     * @cfg {Object} fieldConfig
     * The configuration options for the fields (optional).
     */
    fieldConfig: null,

    /**
     * @cfg {Object} globalConfig
     * The configuration options for the fields, to create a new field for the form.
     */
    globalConfig: null,
    
    /**
     * @cfg {String} fieldLabel The label text to display next to this field (defaults to "")
     */

    /**
     * Creates a new <code>CQ.form.CompositeSlides</code>.
     * @constructor
     * @param {Object} config The config object
     */
    constructor: function(config) {
        var list = this;

        if (!config.fieldConfig) {
            config.fieldConfig = {};
        }
        if (!config.fieldConfig.xtype) {
            config.fieldConfig.xtype = "textfield";
        }
        config.fieldConfig.name = config.name;

        this.fieldConfig = config.fieldConfig;
        this.fieldConfig.unshift({
    		"xtype":"textfield",
    		"name" : "./pathName",
    		"id" : "./pathName",
    		"width" : 100
        });
        
        if (!config.addItemLabel) {
            config.addItemLabel = CQ.I18n.getMessage("Add Item");
        }
        
        var selection = new CQ.form.Selection({
            "itemId": "slideSelection",
            "xtype": "selection",
            "type": "select",
            "handler": function() {
                
            }
        });

        var items = new Array();

        if(config.readOnly) {
            //if component is defined as readOnly, apply this to all items
            config.fieldConfig.readOnly = true;
        } else {
        	items.push({
                xtype: "toolbar",
                cls: "cq-multifield-toolbar",
                items: [
                    "->",
                    {

                        "itemId": "selector",
                        "xtype": "selection",
                        "type": "select",
                        "listeners": {
                            "selectionchanged": {}
                        }
                    
                    },
                    {
                        xtype: "button",
                        text: "new",
                        iconCls: "cq-multifield-add",
                        handler: function() {
                            list.addItem();
                        }
                    }
                    
                ]
            });
        }

        items.push({
            "xtype":"hidden",
            "name":config.name + CQ.Sling.DELETE_SUFFIX
        });

        config = CQ.Util.applyDefaults(config, {
        	"items":[
                     { 
                    	 "itemId": "slideSelector",
                         "xtype":"panel",
                         "border":false,
                         "bodyStyle":"padding:4px",
                         "items":items
                     }
                 ],
            "defaults":{
                "xtype":"compositeslidesitem",
                "name":config.name,
                "fieldConfig":config.fieldConfig
            }
            
        });
        CQ.form.CompositeSlides.superclass.constructor.call(this,config);
        if (this.defaults.fieldConfig.regex) {
            // somehow regex get broken in this.defaults, so fix it
            this.defaults.fieldConfig.regex = config.fieldConfig.regex;
        }
        this.addEvents(
            /**
             * @event change
             * Fires when the value is changed.
             * @param {CQ.form.CompositeSlidesNodes} this
             * @param {Mixed} newValue The new value
             * @param {Mixed} oldValue The original value
             */
            "change"
        );
        
        
        
    },

    /**
     * Adds a new field to the widget.
     * @param value The value of the field
     */
    addItem: function(value) {
        var index = this.items.getCount()-1;
        var item = this.insert(index, {"nodeIndex": "cq:"+index});
        this.findParentByType("form").getForm().add(item);
        this.doLayout();
        if (value) {
            item.setValue(value);
        }
    },

    /**
     * Returns the data value.
     * @return {String[]} value The field value
     */
    getValue: function() {
        var value = new Array();
        this.items.each(function(item, index/*, length*/) {
            if (item instanceof CQ.form.CompositeSlides.Item) {
                value[index] = item.getValue();
                index++;
            }
        }, this);
        return value;
    },

    /**
     * Sets a data value into the field and validates it.
     * @param {Mixed} value The value to set
     */
    setValue: function(value) {
        this.fireEvent("change", this, value, this.getValue());
        var oldItems = this.items;
        oldItems.each(function(item/*, index, length*/) {
            if (item instanceof CQ.form.CompositeSlides.Item) {
                this.remove(item, true);
                this.findParentByType("form").getForm().remove(item);
            }
        }, this);
        this.doLayout();
        if ((value != null) && (value != "")) {
            if (value instanceof Array || CQ.Ext.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    var storedItem = value[i];
                    var valueString = null;
                    for (var key=0; key < this.fieldConfig.length;key++) {

                        if ( (this.fieldConfig[key]) && (this.fieldConfig[key].name) ) {
                            var fieldName = this.fieldConfig[key].name;
                            if (fieldName.indexOf("/") > -1) {
                                fieldName = fieldName.substring(fieldName.lastIndexOf("/")+1);
                            }
                            if (storedItem[fieldName]) {
                                if (valueString == null) {
                                    valueString = storedItem[fieldName];
                                } else {
                                    valueString = valueString + "|" + storedItem[fieldName];
                                } 
                            } else {
                                if (valueString == null) {
                                    valueString = "";
                                } else {
                                    valueString = valueString + "|";
                                }
                            }
                        }

                    }
                    this.addItem(valueString);
                }
            } else {
                this.addItem(value);
            }
        }
    },


      validateValue: function(value) {
             if(this.allowBlank){
                 this.clearInvalid();
                 return true;
             }else{
                 if(this.items.items.length > 1){
                 this.clearInvalid();
                 return true;

                 }
                 else{
                 this.markInvalid(this.blankText);
                 return false;

                 }
             }

        return true;
    },

    processRecord: function(record, path) {
        var rows = new Array();
        var index = 0;
        var nodeName = this.getName().replace("./", "");
        var node = record.get(nodeName);
        for (var key in node) {
            if (key != 'jcr:primaryType') { 
                //the nodes are saved in no particular order, so using the key (name) of the node
                //to add to the right index of the array so they populate the form correctly
                var nodePath = nodeName + "/" + key;
                rows[index] = record.get(nodePath);
                index++;
            }
        }
        this.setValue(rows);
    }
});

CQ.Ext.reg("compositeslides", CQ.form.CompositeSlides);

/**
 * The <code>CQ.form.CompositeSlides.Item</code> class represents an item in a
 * <code>CQ.form.CompositeSlides</code>. This class is not intended for direct use.
 *
 * @private
 * @class CQ.form.CompositeSlides.Item
 * @extends CQ.Ext.Panel
 */
CQ.form.CompositeSlides.Item = CQ.Ext.extend(CQ.form.MultiField.Item, {

    /**
     * Creates a new <code>CQ.form.CompositeSlides.Item</code>.
     * @constructor
     * @param {Object} config The config object
     */     
    constructor: function(config) {
        var item = this;
        var index = config.nodeIndex;
        this.fields = new Array();






        
        
        var fieldIndex = 0;
        for (var key = 0; key < config.fieldConfig.length;key++) {
            var tempConfig = config.fieldConfig[key];

            if ( (tempConfig) && (tempConfig.name) ) {
                var fieldName = tempConfig.name;
                if (fieldName.indexOf("./") > -1) {
                    fieldName = fieldName.substring(fieldName.lastIndexOf(['/']) + 1);
                }
                if (index != null) {
                    tempConfig.name = config.name + "/" + index + "/" + fieldName;
                    tempConfig.id = config.name + "/" + index + "/" + fieldName;
                } else {
                    tempConfig.name = config.name + "/" + fieldName;
                    tempConfig.id = config.name + "/" + fieldName;
                }
                this.fields[fieldIndex] = CQ.Util.build(tempConfig, true);
                fieldIndex++;
            }
        }

        var topRow = {
                "xtype":"panel",
                "border":false,
                "layout": "table",
                "layoutConfig": {
                    "columns": 3
                },
                "items": [
                      	{
                            "xtype":"panel",
                            "border":false,
                            "items": this.fields[0]
                        },
                    	{
                            id: config.name + "/" + index + "/saveBtn",
                            xtype: "button",
                            text: "save",
                            iconCls: "cq-multifield-itemct",
                            handler: function() {
                            	//Submit the form.
                            	this.findParentByType("form").getForm().submit();
                            	
                            	//Find the value and text that needs to be populated in the dropdown.
                            	var pathNameFieldId = this.id.replace('saveBtn', 'pathName');
								var pathNameFieldValue = CQ.Ext.get(pathNameFieldId).dom.value;
								
								var slide = this.findParentByType("compositeslides").findParentByType("panel");
								var selector = slide.items.items[1].items.items[1].items.items[0].items.items[1];
								
								var ownerContainer =  this.ownerCt.ownerCt;
								var ownerId = ownerContainer.id;
								
								var currentData = selector.options;
								currentData.push({
									"value" : ownerId,
									"text" : pathNameFieldValue
								});
								
                            	//selector.setOptions(currentData);
								selector.setOptions(currentData);
                            	ownerContainer.hide();
                            }
                        },
                        {
                            xtype: "button",
                            text: "delete",
                            iconCls: "cq-multifield-remove",
                            handler: function() {
                            	 var parent = item.ownerCt;
                                 parent.remove(item);
                                 parent.fireEvent("removeditem", parent);
                            }
                        }
                    	
                    ]
            };

        var items = new Array();
        
        items.push(topRow);
        for (var i=1; i< this.fields.length; i++) {
            items.push({
                "xtype":"panel",
                "border":false,
                "items": this.fields[i]
            });         
        }

  
        
        config = CQ.Util.applyDefaults(config, {
            "layout":"form",
            "border":false,
            "defaults":{
                "bodyStyle":"padding:3px"
            },
            "items":items
        });
        CQ.form.MultiField.Item.superclass.constructor.call(this, config);

        if (config.value) {
            this.setValue(config.value);
        }
        
        
        
    },

    /**
     * Reorders the item above the specified item.
     * @param item The item to reorder above
     */
    reorder: function(item) {
        var vars = new Array();     
        for (var i=0; i<item.fields.length; i++) {
            vars.push(item.fields[i].getValue());
        } 
        for (var j=0; j<vars.length; j++) {
            item.fields[j].setValue(this.fields[j].getValue());
            this.fields[j].setValue(vars[j]);           
        }
    },    

    remove: function(item) {
        var parent = item.ownerCt;
        var index = parent.items.indexOf(item);
        if (index < parent.items.getCount() - 2) {
            item.reorder(parent.items.itemAt(index + 1));
            item.remove(parent.items.itemAt(index + 1));
        } else {
            parent.remove(item);
        }
    },

    /**
     * Returns the data value.
     * @return {String} value The field value
     */
    getValue: function() {
        var value = null;
        for (var i=0; i<this.fields.length; i++) {
            if (i == 0) {
                value = this.fields[0].getValue();
            } else {
                value = value + "|" + this.fields[i].getValue();
            }
        }
        return value;
    },

    /**
     * Sets a data value into the field and validates it.
     * @param {String} value The value to set
     */
    setValue: function(value) {
        if (value) {
            var values = value.split(["|"]);
            for (var i=0; i<values.length; i++) {
                this.fields[i].setValue(values[i]);
                if (this.fields[i].isXType("trigger")) {
                	this.fields[i].wrap.setWidth(this.fields[i].getWidth()+"px");
                }
            }
        }
    },

    validate: function() {
        var isValid = true;
        if(this.fields) {
            for (var i=0; i<this.fields.length&&isValid; i++) {
                if (this.fields[i]) {
                    isValid = this.fields[i].validate();
                }
            }
        }

        return isValid;
    }
});

CQ.Ext.reg("compositeslidesitem", CQ.form.CompositeSlides.Item);