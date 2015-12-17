CUI.rte.plugins.ParagraphTagPlugin = new Class({

    toString: "ParagraphTagPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @private
     */
    paratagUI: null,

    getFeatures: function() {
        return [ "paratag" ];
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("paratag")) {
            this.paratagUI = tbGenerator.createElement("paratag", this, true,
                    this.getTooltip("paratag"));
            tbGenerator.addElement("format", plg.Plugin.SORT_FORMAT, this.paratagUI, 150);
        }
    },

    execute: function(id) {
        this.editorKernel.relayCmd(id);
    },

    updateState: function(selDef) {
        var hasParatag = this.editorKernel.queryState("paratag", selDef);
        if (this.paratagUI != null) {
            this.paratagUI.setSelected(hasParatag);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        // configuring "special characters" dialog
        pluginConfig = pluginConfig || { };
        var defaults = {
            "tooltips": {
                "paratag": {
                    "title": CUI.rte.Utils.i18n("Paragraph Tag"),
                    "text": CUI.rte.Utils.i18n("Apply p tag.")
                }
            }
        };
        CUI.rte.Utils.applyDefaults(pluginConfig, defaults);
        this.config = pluginConfig;
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("paratag",
        CUI.rte.plugins.ParagraphTagPlugin);

CQ.form.rte.plugins.ParagraphTagPlugin = CQ.Ext.extend(CUI.rte.plugins.ParagraphTagPlugin, {

    _rtePluginType: "compat",

    constructor: function(/* varargs */) {
        if (this.construct) {
            this.construct.apply(this, arguments);
        }
    }

});

CUI.rte.commands.Para = new Class({

    toString: "Para",

    extend: CUI.rte.commands.Command,

    addSmallToDom: function(execDef) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var nodeList = execDef.nodeList;
        var name = execDef.value;
        var context = execDef.editContext;
        nodeList.surround(context, "p");
    },

    removeSmallFromDom: function(execDef) {
        var dpr = CUI.rte.DomProcessor;
        var context = execDef.editContext;
        var selection = execDef.selection.startNode.parentNode;
        dpr.removeWithoutChildren(selection);
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "paratag");
    },

    getProcessingOptions: function() {
        var cmd = CUI.rte.commands.Command;
        return cmd.PO_BOOKMARK | cmd.PO_SELECTION | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
    	var selection = execDef.selection;
        var nodeList = execDef.nodeList;
        var sameNode = (typeof selection.endNode != "undefined" && typeof selection.startNode != "undefined" ? selection.startNode === selection.endNode || selection.startNode.parentNode === selection.endNode.parentNode : false);
        var noSelection = selection.endNode == null && selection.startNode !== null;
        var parentSmall = selection.startNode.parentElement.tagName === "P";
        if (sameNode && !parentSmall) {
            this.addSmallToDom(execDef);
        } else if ((sameNode || noSelection) && parentSmall) {
            this.removeSmallFromDom(execDef);
        }
    },

    queryState: function(selectionDef, cmd) {
    	var selection = selectionDef.selection;
        var sameNode = selection.startNode === selection.endNode;
        var noSelection = selection.endNode == null && selection.startNode !== null;
        var parentSmall = selection.startNode.parentElement.tagName === "P";        
        return ((sameNode || noSelection) && parentSmall);
    }

});

// register command
CUI.rte.commands.CommandRegistry.register("paratag", CUI.rte.commands.Para);