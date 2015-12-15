CUI.rte.plugins.HCPListPlugin = new Class({

    toString: "HCPListPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @private
     */
    keypointsUI: null,

    /**
     * @private
     */
    liststripedUI: null,

    /**
     * @private
     */
    liststripedhorizontalUI: null,

    /**
     * @private
     */
    liststripednumberedUI: null,

    _init: function(editorKernel) {
        this.inherited(arguments);
        editorKernel.addPluginListener('beforekeydown', this.handleOnKey, this, this, false);
    },

    /**
     * This function creates new list entries (<li>) by pressing CRTL+ENTER
     * This workaround should be used if there is a block node within a list entry
     *
     * @param event
     */
    handleOnKey: CUI.rte.plugins.ListPlugin.handleOnKey,

    getFeatures: function() {
        return [ "insertkeypoints", "insertliststriped", "insertliststripedlistnumbered", "insertliststripedhorizontal" ];
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("insertkeypoints")) {
            this.keypointsUI = tbGenerator.createElement("insertkeypoints", this,
                    true, this.getTooltip("insertkeypoints"));
            tbGenerator.addElement("lists", plg.Plugin.SORT_LISTS, this.keypointsUI,
                    100);
        }
        if (this.isFeatureEnabled("insertliststriped")) {
            this.liststripedUI = tbGenerator.createElement("insertliststriped", this, true,
                    this.getTooltip("insertliststriped"));
            tbGenerator.addElement("lists", plg.Plugin.SORT_LISTS, this.liststripedUI, 110);
        }
        if (this.isFeatureEnabled("insertliststripedlistnumbered")) {
            this.liststripedhorizontalUI = tbGenerator.createElement("insertliststripedlistnumbered", this, false,
                    this.getTooltip("insertliststripedlistnumbered"));
            tbGenerator.addElement("lists", plg.Plugin.SORT_LISTS, this.liststripedhorizontalUI, 120);
        }
        if (this.isFeatureEnabled("insertliststripedhorizontal")) {
            this.liststripednumberedUI = tbGenerator.createElement("insertliststripedhorizontal", this, false,
                    this.getTooltip("insertliststripedhorizontal"));
            tbGenerator.addElement("lists", plg.Plugin.SORT_LISTS, this.liststripednumberedUI, 130);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CUI.rte.Utils.applyDefaults(pluginConfig, {
            "features": "*",
            "keepStructureOnUnlist": false,
            "tooltips": {
                "insertkeypoints": {
                    "title": CUI.rte.Utils.i18n("plugins.list.insertkeypoints"),
                    "text": CUI.rte.Utils.i18n("plugins.list.insertkeypoints")
                },
                "insertliststriped": {
                    "title": CUI.rte.Utils.i18n("plugins.list.insertliststriped"),
                    "text": CUI.rte.Utils.i18n("plugins.list.insertliststriped")
                },
                "insertliststripedlistnumbered": {
                    "title": CUI.rte.Utils.i18n("plugins.list.insertliststripedlistnumbered"),
                    "text": CUI.rte.Utils.i18n("plugins.list.insertliststripedlistnumbered")
                },
                "insertliststripedhorizontal": {
                    "title": CUI.rte.Utils.i18n("plugins.list.insertliststripedhorizontal"),
                    "text": CUI.rte.Utils.i18n("plugins.list.insertliststripedhorizontal")
                }
            }
        });
        this.config = pluginConfig;
    },

    execute: function(id) {
        var value = undefined;
        if (CUI.rte.Common.strStartsWith(id, "insert")) {
            value = this.config.keepStructureOnUnlist;
        }
        this.editorKernel.relayCmd(id, value);
    },

    updateState: function(selDef) {
        var context = selDef.editContext;
        var state, isDisabled;
        if (this.keypointsUI) {
            state = this.editorKernel.queryState("insertkeypoints", selDef);
            isDisabled = (state == null)
                    || (state == CUI.rte.commands.HCPList.NO_LIST_AVAILABLE);
            this.keypointsUI.setSelected((state === true) || (state == null));
            this.keypointsUI.setDisabled(isDisabled);
        }
        if (this.liststripedUI) {
            state = this.editorKernel.queryState("insertliststriped", selDef);
            isDisabled = (state == null)
                    || (state == CUI.rte.commands.HCPList.NO_LIST_AVAILABLE);
            this.liststripedUI.setSelected((state === true) || (state == null));
            this.liststripedUI.setDisabled(isDisabled);
        }
        if (this.liststripednumberedUI) {
            state = this.editorKernel.queryState("insertliststripedlistnumbered", selDef);
            isDisabled = (state == null)
                    || (state == CUI.rte.commands.HCPList.NO_LIST_AVAILABLE);
            this.liststripednumberedUI.setSelected((state === true) || (state == null));
            this.liststripednumberedUI.setDisabled(isDisabled);
        }
        if (this.liststripedhorizontalUI) {
            state = this.editorKernel.queryState("insertliststripedhorizontal", selDef);
            isDisabled = (state == null)
                    || (state == CUI.rte.commands.HCPList.NO_LIST_AVAILABLE);
            this.liststripedhorizontalUI.setSelected((state === true) || (state == null));
            this.liststripedhorizontalUI.setDisabled(isDisabled);
        }
    }
});


// register plugin
CUI.rte.plugins.PluginRegistry.register("hcplists", CUI.rte.plugins.HCPListPlugin);