CQ.form.MultiCompositeField = CQ.Ext.extend(CQ.form.CompositeField, {
    path: "",
    bodyPadding: 4,
    fieldWidth: 0,
    constructor: function(e) {
        "undefined" == typeof e.orderable && (e.orderable = !0), e.fieldConfig || (e.fieldConfig = {}), e.fieldConfig.xtype || (e.fieldConfig.xtype = "textfield"), e.fieldConfig.name = e.name, e.fieldConfig.ownerCt = this, e.fieldConfig.orderable = e.orderable, e.fieldConfig.dragDropMode = e.dragDropMode, e.addItemLabel || (e.addItemLabel = CQ.I18n.getMessage("Add Item"));
        var t = this,
            i = new Array;
        e.readOnly ? e.fieldConfig.readOnly = !0 : i.push({
            xtype: "toolbar",
            cls: "cq-multifield-toolbar",
            items: ["->", {
                xtype: "textbutton",
                text: e.addItemLabel,
                style: "padding-right:6px",
                handler: function() {
                    t.addItem()
                }
            }, {
                xtype: "button",
                iconCls: "cq-multifield-add",
                template: new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                handler: function() {
                    t.addItem()
                }
            }]
        }), e.name && (this.hiddenDeleteField = new CQ.Ext.form.Hidden({
            name: e.name + CQ.Sling.DELETE_SUFFIX
        }), i.push(this.hiddenDeleteField)), e = CQ.Util.applyDefaults(e, {
            fieldConfigs: [],
            itemPanelConfig: {
                xtype: "panel",
                layout: "form",
                border: !1
            },
            orderable: !0,
            baseName: "",
            matchBaseName: !0,
            border: !1,
            items: [{
                xtype: "panel",
                border: !1,
                bodyStyle: "padding:" + this.bodyPadding + "px",
                items: i
            }]
        }), CQ.form.MultiCompositeField.superclass.constructor.call(this, e), this.fieldNamePrefix = e.prefix || "", e.name && (this.fieldNamePrefix += e.name + "/")
    },
    initComponent: function() {
        CQ.form.MultiCompositeField.superclass.initComponent.call(this), this.on("resize", function() {
            var e = this.items.get(0);
            if (this.calculateFieldWidth(e), this.fieldWidth > 0)
                for (var t = 0; t < this.items.length; t++) try {
                    this.items.get(t).setPanelWidth(this.fieldWidth)
                } catch (i) {
                    CQ.Log.debug("CQ.form.MultiCompositeField#initComponent: " + i.message)
                }
        })
    },
    calculateFieldWidth: function(e) {
        try {
            this.fieldWidth = this.getSize().width - 2 * this.bodyPadding;
            for (var t = 1; t < e.items.length; t++) {
                var i = e.items.get(t).getSize().width;
                if (0 == i) return void(this.fieldWidth = 0);
                this.fieldWidth -= e.items.get(t).getSize().width
            }
        } catch (a) {
            this.fieldWidth = 0
        }
    },
    createName: function() {
        for (var e = 0;; e++) {
            var t = this.baseName + e,
                i = this.items.find(function(e) {
                    return e.name == t
                });
            if (!i) return t
        }
        return ""
    },
    addItem: function(e, t) {
        if (this.maxItem) {
            var i = Number(this.maxItem);
            if (i >= Number(this.items.getCount())) {
                e || (e = this.createName());
                var a = this.insert(this.items.getCount() - 1, {
                    xtype: "multicompositefielditem",
                    name: e,
                    prefix: this.fieldNamePrefix,
                    orderable: this.orderable,
                    readOnly: this.readOnly,
                    fieldConfigs: this.fieldConfigs,
                    panelConfig: this.itemPanelConfig
                });
                if (this.doLayout(), a.processPath(this.path), t && a.setValue(t), !(this.fieldWidth < 0)) {
                    this.fieldWidth || this.calculateFieldWidth(a);
                    try {} catch (n) {
                        CQ.Log.debug("CQ.form.MultiCompositeField#addItem: " + n.message)
                    }
                }
            } else alert(CQ.I18n.getMessage("maximum slides is") + " " + i)
        } else {
            e || (e = this.createName());
            var a = this.insert(this.items.getCount() - 1, {
                xtype: "multicompositefielditem",
                name: e,
                prefix: this.fieldNamePrefix,
                orderable: this.orderable,
                readOnly: this.readOnly,
                fieldConfigs: this.fieldConfigs,
                panelConfig: this.itemPanelConfig
            });
            if (this.doLayout(), a.processPath(this.path), t && a.setValue(t), !(this.fieldWidth < 0)) {
                this.fieldWidth || this.calculateFieldWidth(a);
                try {} catch (n) {
                    CQ.Log.debug("CQ.form.MultiCompositeField#addItem: " + n.message)
                }
            }
        }
    },
    processPath: function(e) {
        this.path = e
    },
    getValue: function() {
        var e = new Array;
        return this.items.each(function(t, i) {
            t instanceof CQ.form.MultiCompositeField.Item && (e[i] = t.getValue(), i++)
        }, this), e
    },
    processItem: function(e, t) {
        "object" == typeof t && (this.baseName && this.matchBaseName !== !1 && 0 !== e.indexOf(this.baseName) || this.addItem(e, t))
    },
    processRecord: function(e, t) {
        if (this.fireEvent("beforeloadcontent", this, e, t) !== !1) {
            if (this.items.each(function(e) {
                    e instanceof CQ.form.MultiCompositeField.Item && this.remove(e, !0)
                }, this), this.name) {
                var i = e.get(this.name);
                for (var a in i) this.processItem(a, i[a])
            } else e.fields.each(function(t) {
                this.processItem(t.name, e.get(t.name))
            }, this);
            if (this.fireEvent("loadcontent", this, e, t), void 0 === e.data["cq:isCancelledForChildren"]) {
                var n = e.data["jcr:mixinTypes"];
                if (n && CQ.Ext.isArray(n))
                    for (var s = 0; s < n.length; s++) {
                        var l = n[s];
                        "cq:LiveSyncCancelled" == l && (this.add(new CQ.Ext.form.Hidden({
                            name: "./cq:isCancelledForChildren",
                            value: "true"
                        })), this.add(new CQ.Ext.form.Hidden({
                            name: "./cq:isCancelledForChildren@TypeHint",
                            value: "Boolean"
                        })))
                    }
            }
            var o = this.getName().replace("./", ""),
                d = e.data[o];
            if (d) {
                var r = d["jcr:mixinTypes"];
                if (r && CQ.Ext.isArray(r))
                    for (var s = 0; s < r.length; s++) {
                        var m = r[s];
                        this.add(new CQ.Ext.form.Hidden({
                            name: this.getName() + "/jcr:mixinTypes",
                            value: m
                        }))
                    }
            }
            this.doLayout()
        }
    },
    setValue: function() {}
}), CQ.Ext.reg("multicompositefield", CQ.form.MultiCompositeField), CQ.form.MultiCompositeField.Item = CQ.Ext.extend(CQ.Ext.Panel, {
    constructor: function(e) {
        for (var t = this, i = CQ.Util.copyObject(e.fieldConfigs), a = 0; a < i.length; a++) {
            var n = i[a];
            n.rawFieldName = n.name, n.name = e.prefix + e.name + "/" + n.rawFieldName, n.readOnly = e.readOnly
        }
        this.mixinFieldName = e.prefix + e.name + "/jcr:mixinTypes", e.panelConfig = CQ.Util.copyObject(e.panelConfig), e.panelConfig.items = i, e.panelConfig.cellCls = "cq-multifield-itemct";
        var s = new Array;
        s.push(e.panelConfig), e.readOnly || (e.orderable && (s.push({
            xtype: "panel",
            border: !1,
            items: {
                xtype: "button",
                iconCls: "cq-multifield-up",
                template: new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                handler: function() {
                    var e = t.ownerCt,
                        i = e.items.indexOf(t);
                    i > 0 && t.reorder(e.items.itemAt(i - 1))
                }
            }
        }), s.push({
            xtype: "panel",
            border: !1,
            items: {
                xtype: "button",
                iconCls: "cq-multifield-down",
                template: new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                handler: function() {
                    var e = t.ownerCt,
                        i = e.items.indexOf(t);
                    i < e.items.getCount() - 1 && t.reorder(e.items.itemAt(i + 1))
                }
            }
        })), s.push({
            xtype: "panel",
            border: !1,
            items: {
                xtype: "button",
                iconCls: "cq-multifield-remove",
                template: new CQ.Ext.Template('<span><button class="x-btn" type="{0}"></button></span>'),
                handler: function() {
                    var e = t.ownerCt;
                    e.remove(t), e.fireEvent("removeditem", e)
                }
            }
        })), e = CQ.Util.applyDefaults(e, {
            layout: "table",
            anchor: "100%",
            bodyCssClass: "cq-multifield-item",
            border: !1,
            layoutConfig: {
                columns: 4
            },
            defaults: {
                bodyStyle: "padding:-70px"
            },
            items: s
        }), CQ.form.MultiCompositeField.Item.superclass.constructor.call(this, e), this.fields = new CQ.Ext.util.MixedCollection(!1, function(e) {
            return e.rawFieldName
        }), this.getFieldPanel().items.each(function(e) {
            e.rawFieldName && this.fields.add(e.rawFieldName, e)
        }, this), e.value && this.setValue(e.value)
    },
    getFieldPanel: function() {
        return this.items.get(0)
    },
    setPanelWidth: function(e) {
        this.getFieldPanel().setWidth(e)
    },
    reorder: function(e) {
        var t = this.ownerCt;
        t.insert(t.items.indexOf(e), this), this.getEl().insertBefore(e.getEl()), t.doLayout()
    },
    processPath: function(e) {
        this.fields.each(function(t) {
            t.processPath && t.processPath(e)
        })
    },
    getValue: function() {
        var e = {};
        return this.fields.each(function(t) {
            e[t.rawFieldName] = t.getValue()
        }), e
    },
    setValue: function(e) {
        this.fields.each(function(t) {
            e[t.rawFieldName] && t.setValue(e[t.rawFieldName])
        });
        var t = e["jcr:mixinTypes"];
        if (t) {
            if (CQ.Ext.isArray(t))
                for (var i = 0; i < t.length; i++) {
                    var a = t[i];
                    this.getFieldPanel().add(new CQ.Ext.form.Hidden({
                        name: this.mixinFieldName,
                        value: a
                    }))
                }
            this.getFieldPanel().doLayout()
        }
    }
}), CQ.Ext.reg("multicompositefielditem", CQ.form.MultiCompositeField.Item);