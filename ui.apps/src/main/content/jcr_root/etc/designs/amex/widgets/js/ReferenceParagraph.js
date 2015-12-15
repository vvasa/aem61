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
 * @class ReferenceParagraph
 * @extends CQ.Ext.Panel
 * @private
 * The Reference Paragraph UI.
 * @constructor
 * Creates a new ReferenceParagraph.
 * @param {Object} config The config object
 */
CQ.form.ReferenceParagraph = CQ.Ext.extend(CQ.Ext.Panel, {
	
	 data: null,
	 proxy: null,
	 store: null,
	 
	  constructor: function(config) {
	  
	this.selectedValue = new CQ.Ext.form.Hidden({
		"itemId": "selectedPath",
		"name": "./selectedPath"
	});
		
	this.pathField = new CQ.form.DDSearchField({
            "itemId": "rootPath",
			"name": "./rootPath",
			"xtype": "ddsearchfield",
			"listeners": {
				"select": {
					"fn": function() {
						this.onSelectPage();
					},
					"scope": this
				},
				"loadcontent": {
					"fn": function() {
						this.onSelectPage();
					},
					"scope": this
				},
				"search": {
					"fn": function() {
						this.onSelectPage();
					},
					"scope": this
				},
				"dialogselect": {
					"fn": function(comp, value) {
						this.onSelectPage();
					},
					"scope": this
				}
			}
        });

		// Paragraph store
        var reader = new CQ.Ext.data.JsonReader({
            "id":            "path",
            "root":          "paragraphs",
            "totalProperty": "count",
            "fields":        [ "path", "name", "title", "location", "imageUrl", "html" ]
        });
        this.proxy = new CQ.Ext.data.HttpProxy({ "url": "/" });
        this.store = new CQ.Ext.data.Store({
            "proxy":    this.proxy,
            "reader":   reader,
            "autoLoad": false
        });

        // Paragraph template
        var template = new CQ.Ext.XTemplate(
            '<tpl for=".">',
            '<div class="cq-paragraphreference-paragraph" style="background-color:#E6FAF9;width:210px;height:210px;background-image:url(\'{imageUrl}\');"><h2><span style="color: white; font: 16px/30px Helvetica, Sans-Serif; letter-spacing: -1px; background: rgb(0, 0, 0); background: rgba(0, 0, 0, 0.4); padding: 6px;">{name}<span style="padding:0 5px;"></span><br /><span style="padding:0 5px;"></span>{location}<br /><span style="padding:0 5px;color: red;"></span>{title}</span></h2></div>',
            '</tpl>'
        );

        // Paragraph view
        this.data = new CQ.Ext.DataView({
            "id":            "cq-paragraphreference-data",
            "region":        "center",
            "store":         this.store,
            "tpl":           template,
            "itemSelector":  "div.cq-paragraphreference-paragraph",
            "selectedClass": "cq-paragraphreference-selected",
            "singleSelect":  true,
            "style":         { "overflow": "auto" }
        });
		this.data.on("selectionchange", this.onSelectionChange.createDelegate(this));
		
        var parentScope = this;

        config = config || { };
        var defaults = {
            "layout": "form",
			"autoScroll": true,
            "layoutConfig": {
                "columns": 1
            },
            "defaults": {
                "style": "padding: 3px;"
            },
            "items": [{
                    "itemId": "slideSelector",
                    "xtype": "panel",
                    "layout": "fit",
                    "border": false,
                    "height": 30,
                    "hideBorders": true,
                    "items": [this.pathField]
                },
				this.data,
				this.selectedValue

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
        CQ.form.ReferenceParagraph.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        CQ.form.ReferenceParagraph.superclass.initComponent.call(this);
    },

    afterRender: function() {
        CQ.form.ReferenceParagraph.superclass.afterRender.call(this);
        this.el.setVisibilityMode(CQ.Ext.Element.DISPLAY);
        this.body.setVisibilityMode(CQ.Ext.Element.DISPLAY);
    },

    adjustSelectorWidth: function(width) {
        if (width) {
            var selectorPanel = this.items.get("slideSelector");
            
            this._width = width;
        }
    },
	
	onSelectionChange: function() {
		var records = this.data.getSelectedRecords();
		 if (records.length > 0) {
            this.selectedValue.setValue(records[0].get("path"));
        }
		
        
    },
	
	onSelectPage: function() {
			if(this.pathField && this.pathField.lastSelectionText){
				this.proxy.api["read"].url =
				CQ.HTTP.externalize(this.pathField.lastSelectionText + ".jparagraphs.json", true);
				this.store.reload();
			}
		
    }

});
CQ.Ext.reg("referenceparagraph", CQ.form.ReferenceParagraph);
