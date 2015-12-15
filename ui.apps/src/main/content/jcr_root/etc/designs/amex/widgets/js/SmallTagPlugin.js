CUI.rte.plugins.SmallTagPlugin = new Class({

    toString: "SmallTagPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @private
     */
    smalltagUI: null,

    getFeatures: function() {
        return [ "smalltag" ];
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("smalltag")) {
            this.smalltagUI = tbGenerator.createElement("smalltag", this, true,
                    this.getTooltip("smalltag"));
            tbGenerator.addElement("format", plg.Plugin.SORT_FORMAT, this.smalltagUI, 150);
        }
    },

    execute: function(id) {
        this.editorKernel.relayCmd(id);
    },

    updateState: function(selDef) {
        var hasSmalltag = this.editorKernel.queryState("smalltag", selDef);
        if (this.smalltagUI != null) {
            this.smalltagUI.setSelected(hasSmalltag);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        // configuring "special characters" dialog
        pluginConfig = pluginConfig || { };
        var defaults = {
            "tooltips": {
                "smalltag": {
                    "title": CUI.rte.Utils.i18n("Small Tag"),
                    "text": CUI.rte.Utils.i18n("Apply small tag.")
                }
            }
        };
        CUI.rte.Utils.applyDefaults(pluginConfig, defaults);
        this.config = pluginConfig;
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("smalltag",
        CUI.rte.plugins.SmallTagPlugin);

CQ.form.rte.plugins.SmallTagPlugin = CQ.Ext.extend(CUI.rte.plugins.SmallTagPlugin, {

    _rtePluginType: "compat",

    constructor: function(/* varargs */) {
        if (this.construct) {
            this.construct.apply(this, arguments);
        }
    }

});

CUI.rte.commands.Small = new Class({

    toString: "Small",

    extend: CUI.rte.commands.Command,

    addSmallToDom: function(execDef) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var nodeList = execDef.nodeList;
        var name = execDef.value;
        var context = execDef.editContext;
        nodeList.surround(context, "small");
    },

    removeSmallFromDom: function(execDef) {
        var dpr = CUI.rte.DomProcessor;
        var context = execDef.editContext;
        var selection = execDef.selection.startNode.parentNode;
        dpr.removeWithoutChildren(selection);
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "smalltag");
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
        var parentSmall = selection.startNode.parentElement.tagName === "SMALL";
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
        var parentSmall = selection.startNode.parentElement.tagName === "SMALL";        
        return ((sameNode || noSelection) && parentSmall);
    }

});

// register command
CUI.rte.commands.CommandRegistry.register("smalltag", CUI.rte.commands.Small);