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
 * @class CQ.form.NamedSlidesPanel
 * @extends CQ.Ext.Panel
 * @private
 * The SlidesPanel provides the UI to add, remove and select slides.
 * @constructor
 * Creates a new SlidePanel.
 * @param {Object} config The config object
 */
CQ.form.NamedSlidesPanel = CQ.Ext.extend(CQ.Ext.Panel, {

    constructor: function(config) {

        var parentScope = this;

        // lazy initialization does not work on Firefox for these buttons, so instantiating
        // them the old way ...
        var addButton = new CQ.Ext.Button({
            "itemId": "addButton",
            "xtype": "button",
            "text": CQ.I18n.getMessage("Add"),
            "afterRender": function() {
                CQ.Ext.Button.prototype.afterRender.call(this);
                if (parentScope._width) {
                    parentScope.adjustSelectorWidth(parentScope._width)
                }
            },
            "handler": function() {
                if (parentScope.onAddButton) {
                    parentScope.onAddButton();
                }
            }
        });
        var removeButton = new CQ.Ext.Button({
            "itemId": "removeButton",
            "xtype": "button",
            "text": CQ.I18n.getMessage("Remove"),
            "afterRender": function() {
                CQ.Ext.Button.prototype.afterRender.call(this);
                if (parentScope._width) {
                    parentScope.adjustSelectorWidth(parentScope._width)
                }
            },
            "handler": function() {
                if (parentScope.onRemoveButton) {
                    parentScope.onRemoveButton();
                }
            }
        });
        var emptySaveButton = new CQ.Ext.Button({
            "itemId": "emptySaveButton",
            "xtype": "button",
            "text": CQ.I18n.getMessage("Empty & Save"),
            "afterRender": function() {
                CQ.Ext.Button.prototype.afterRender.call(this);
                if (parentScope._width) {
                    parentScope.adjustSelectorWidth(parentScope._width)
                }
            },
            "handler": function() {
                if (parentScope.onEmptySaveButton) {
                    parentScope.onEmptySaveButton();
                }
            }
        });
        
        var reorderButton = new CQ.Ext.Button({
            "itemId": "reorderButton",
            "xtype": "button",
            "text": CQ.I18n.getMessage("Reorder"),
            "afterRender": function() {
                CQ.Ext.Button.prototype.afterRender.call(this);
                if (parentScope._width) {
                    parentScope.adjustSelectorWidth(parentScope._width)
                }
            },
            "handler": function() {
                if (parentScope.onReorderButton) {
                    parentScope.onReorderButton();
                }
            }
        });

        config = config || { };
        var defaults = {
            "layout": "table",
            "layoutConfig": {
                "columns": 5
            },
            "defaults": {
                "style": "padding: 3px;"
            },
            "minSize": 30,
            "maxSize": 30,
            "height": 30,
            "items": [{
                    "itemId": "slideSelector",
                    "xtype": "panel",
                    "layout": "fit",
                    "border": false,
                    "height": 30,
                    "hideBorders": true,
                    "items": [{
                            "itemId": "selector",
                            "xtype": "selection",
                            "type": "select",
                            "listeners": {
                                "selectionchanged": {
                                    "fn": function(comp, value) {
                                        if (this.onSlideChanged) {
                                            this.onSlideChanged(value);
                                        }
                                    },
                                    "scope": this
                                }
                            }
                        }]
                },
                addButton,
                reorderButton,
                removeButton,
                emptySaveButton
            ],
            "listeners": {
                "bodyresize": {
                    "fn": function(comp, w, h) {
                        this.adjustSelectorWidth(w);
                    },
                    "scope": this
                }
            }
        };

        CQ.Util.applyDefaults(config, defaults);
        CQ.form.NamedSlidesPanel.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        CQ.form.NamedSlidesPanel.superclass.initComponent.call(this);
    },

    afterRender: function() {
        CQ.form.NamedSlidesPanel.superclass.afterRender.call(this);
        this.el.setVisibilityMode(CQ.Ext.Element.DISPLAY);
        this.body.setVisibilityMode(CQ.Ext.Element.DISPLAY);
    },

    adjustSelectorWidth: function(width) {
        if (width) {
            var selectorPanel = this.items.get("slideSelector");
            var addButton = this.items.get("addButton");
            var reorderButton = this.items.get("reorderButton");
            var removeButton = this.items.get("removeButton");
            var emptySaveButton = this.items.get("emptySaveButton");
            if (addButton.rendered && reorderButton.rendered && removeButton.rendered && emptySaveButton.rendered) {
                var selWidth = width
                    - addButton.getEl().getWidth() - reorderButton.getEl().getWidth() - removeButton.getEl().getWidth() - emptySaveButton.getEl().getWidth();
                selectorPanel.setSize(selWidth, 30);
                var selector = selectorPanel.items.get("selector");
                selector.setSize(selWidth, addButton.getEl().getHeight());
            } else {
                this._width = width;
            }
        }
    },

    setInitialComboBoxContent: function(data) {
        var selector = this.items.get("slideSelector").items.get("selector");
        selector.setOptions(data);
    },

    select: function(slide) {
        var selector = this.items.get("slideSelector").items.get("selector");
        selector.suspendEvents();
        if (slide) {
            selector.setValue(slide);
        } else {
            selector.setValue(null);
        }
        selector.resumeEvents();
    },
    
    getAllSlides: function() {
    	var data = [];
    	var selector = this.items.get("slideSelector").items.get("selector");
    	var store = selector.comboBox.store;
    	var rowCnt = store.getTotalCount();
    	for (var row = 0; row < rowCnt; row++) {
    		var rowData = store.getAt(row);
        	var slide = rowData.get("value");
        	data.push(slide);
    	}
    	
    	return data;
    	
    },
    
    reorderSlides: function(orderedStore) {
    	if (orderedStore) {
    		var selector = this.items.get("slideSelector").items.get("selector");
    		var oldStore = selector.comboBox.store;
    		var rowCnt = orderedStore.getTotalCount();
    		var data = [ ];
    		
    		for (var row = 0; row < rowCnt; row++) {
    			var orderedRow = orderedStore.getAt(row);
            	var orderedTitle = orderedRow.data.title;
            	
            	for (var oldRow = 0; oldRow < oldStore.getTotalCount(); oldRow++) {
            		var oldRowData = oldStore.getAt(oldRow);
                	var slide = oldRowData.get("value");
                	if(slide.title == orderedTitle ){
                		slide.slideIndex = row + 1;
                		data.push({
                            "value": slide,
                            "text": slide.createDisplayText()
                        });
                		break;
                	}
            	}
    		}
    		
    		
            this.setInitialComboBoxContent(data);
            this.select(data[0].value);
    	}
    },
    
    getSelectorStore: function() {
    	var selector = this.items.get("slideSelector").items.get("selector");
		return selector.comboBox.store;
    },

    updateSlide: function(slide) {
        if (slide) {
            var selector = this.items.get("slideSelector").items.get("selector");
            var store = selector.comboBox.store;
            var rowCnt = store.getTotalCount();
            for (var row = 0; row < rowCnt; row++) {
                var rowData = store.getAt(row);
                if (rowData.get("value") == slide) {
                    rowData.set("text", slide.createDisplayText());
                }
            }
            store.commitChanges();
        }
    },

    disableFormElements: function() {
        this.items.get("slideSelector").items.get("selector").disable();
        this.items.get("addButton").disable();
        this.items.get("reorderButton").disable();
        this.items.get("removeButton").disable();
        this.items.get("emptySaveButton").disable();
        
    },

    enableFormElements: function() {
    	this.items.get("slideSelector").items.get("selector").enable();
        this.items.get("addButton").enable();
        this.items.get("reorderButton").enable();
        this.items.get("removeButton").enable();
        this.items.get("emptySaveButton").enable();
    }

});
