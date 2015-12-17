CUI.rte.plugins.SpanTagPlugin = new Class({

    toString: "SpanTagPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @private
     */
    spantagUI: null,

    getFeatures: function() {
        return [ "spantag" ];
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("spantag")) {
            this.spantagUI = tbGenerator.createElement("spantag", this, true,
                    this.getTooltip("spantag"));
            tbGenerator.addElement("format", plg.Plugin.SORT_FORMAT, this.spantagUI, 150);
        }
    },

    execute: function(id) {
        this.editorKernel.relayCmd(id);
    },

    updateState: function(selDef) {
        var hasSpantag = this.editorKernel.queryState("spantag", selDef);
        if (this.spantagUI != null) {
            this.spantagUI.setSelected(hasSpantag);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        // configuring "special characters" dialog
        pluginConfig = pluginConfig || { };
        var defaults = {
            "tooltips": {
                "spantag": {
                    "title": CUI.rte.Utils.i18n("Span Tag"),
                    "text": CUI.rte.Utils.i18n("Apply span tag.")
                }
            }
        };
        CUI.rte.Utils.applyDefaults(pluginConfig, defaults);
        this.config = pluginConfig;
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("spantag",
        CUI.rte.plugins.SpanTagPlugin);

CQ.form.rte.plugins.SpanTagPlugin = CQ.Ext.extend(CUI.rte.plugins.SpanTagPlugin, {

    _rtePluginType: "compat",

    constructor: function(/* varargs */) {
        if (this.construct) {
            this.construct.apply(this, arguments);
        }
    }

});

CUI.rte.commands.Span = new Class({

    toString: "Span",

    extend: CUI.rte.commands.Command,

    addSmallToDom: function(execDef) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var nodeList = execDef.nodeList;
        var name = execDef.value;
        var context = execDef.editContext;
        nodeList.surround(context, "span");
    },

    removeSmallFromDom: function(execDef) {
        var dpr = CUI.rte.DomProcessor;
        var context = execDef.editContext;
        var selection = execDef.selection.startNode.parentNode;
        dpr.removeWithoutChildren(selection);
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "spantag");
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
        var parentSmall = selection.startNode.parentElement.tagName === "SPAN";
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
        var parentSmall = selection.startNode.parentElement.tagName === "SPAN";        
        return ((sameNode || noSelection) && parentSmall);
    }

});

// register command
CUI.rte.commands.CommandRegistry.register("spantag", CUI.rte.commands.Span);