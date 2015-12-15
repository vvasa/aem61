/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/**
 * @class CQ.Ext.SlidesReorder
 * 
 * @singleton
 */
CQ.Ext.SlidesReorder = function(){
    var dlg, grid, store, ds, opt, mask, waitTimer,
        bodyEl, msgEl, textboxEl, textareaEl, progressBar, pp, iconEl, spacerEl,
        buttons, activeTextEl, bwidth, bufferIcon = '', iconCls = '',
        buttonNames = ['ok', 'yes', 'no', 'cancel'];

    // private
    var handleButton = function(button){
        buttons[button].blur();
        if(dlg.isVisible()){
            dlg.hide();
            handleHide();
            CQ.Ext.callback(opt.fn, opt.scope||window, [button, '', opt, ds], 1);
        }
    };

    // private
    var handleHide = function(){
        if(opt && opt.cls){
            dlg.el.removeClass(opt.cls);
        }
    };
    
    // private
    var createTempStore = function(store){
    	
    	var data = [];
    	var tempStore = new CQ.Ext.data.ArrayStore({
            fields: [
                { name: 'title', type: 'string' }
            ]
        });
    	
    	
        if(store){
        	var rowCnt = store.getTotalCount();
            for (var row = 0; row < rowCnt; row++) {
                var rowData = store.getAt(row);
                var value = rowData.get("value");
                data[row] = [value.title];
                
            }
            tempStore.loadData(data);
        }
        
        return tempStore;
    };

    // private
    var handleEsc = function(d, k, e){
        if(opt && opt.closable !== false){
            dlg.hide();
            handleHide();
        }
        if(e){
            e.stopEvent();
        }
    };

    // private
    var updateButtons = function(b){
        var width = 0,
            cfg;
        if(!b){
            CQ.Ext.each(buttonNames, function(name){
                buttons[name].hide();
            });
            return width;
        }
        dlg.footer.dom.style.display = '';
        CQ.Ext.iterate(buttons, function(name, btn){
            cfg = b[name];
            if(cfg){
                btn.show();
                btn.setText(CQ.Ext.isString(cfg) ? cfg : CQ.Ext.SlidesReorder.buttonText[name]);
                width += btn.getEl().getWidth() + 15;
            }else{
                btn.hide();
            }
        });
        return width;
    };

    return {
        /**
         * Returns a reference to the underlying {@link CQ.Ext.Window} element
         * @return {CQ.Ext.Window} The window
         */
        getDialog : function(store, titleText ){

            var btns = [];
            var trimmedStrore = createTempStore(store);
            buttons = {};
            CQ.Ext.each(buttonNames, function(name){
                btns.push(buttons[name] = new CQ.Ext.Button({
                    text: this.buttonText[name],
                    handler: handleButton.createCallback(name),
                    hideMode: 'offsets'
                }));
            }, this);

            
            grid = new CQ.Ext.grid.GridPanel({
                height: 445,
                enableDragDrop: true,
                ddGroup:'journeyDD',
                store: trimmedStrore,
                autoScroll : true,
                loadMask: true,
                columns: [
                    { header: 'Title', dataIndex: 'title' }
                ],
                viewConfig: {
                	sm: new CQ.Ext.grid.RowSelectionModel({singleSelect:true}),
                    forceFit: true
                },
                listeners: {
                	render: function(grid) {
                		var ddrow = new CQ.Ext.dd.DropTarget(grid.getView().mainBody, {
                			ddGroup: 'journeyDD',
                			copy: false,
                			notifyDrop: function(dd, e, data) {
                				ds = grid.store;
                				var sm = grid.getSelectionModel();
                				var rows = sm.getSelections();
                				if (dd.getDragData(e)) {
                					var cindex = dd.getDragData(e).rowIndex;
                					if (typeof(cindex) != "undefined") {
                						for(var i = 0; i < rows.length; i++) {
                							var srcIndex = ds.indexOfId(rows[i].id);
                							ds.remove(ds.getById(rows[i].id));
                							if (i > 0 && cindex < srcIndex) {
                								cindex++;
                							}
                							ds.insert(cindex, rows[i]); 
                						}

                						sm.selectRecords(rows);
                					}
                				} 
                			}
                		});

                	}
                }
            });
            
            dlg = new CQ.Ext.Window({
                autoCreate : true,
                title:titleText,
                resizable:false,
                id: CQ.Util.createId("cq-msgbox"),
                // CQ:END
                minimizable : false,
                maximizable : false,
                stateful: false,
                modal: true,
                shim:true,
                buttonAlign:"center",
                width:600,
                height:445,
                plain:true,
                footer:true,
                closable:true,
                items: [grid],
                close : function(){
                    if(opt && opt.buttons && opt.buttons.no && !opt.buttons.cancel){
                        handleButton("no");
                    }else{
                        handleButton("cancel");
                    }
                },
                fbar: new CQ.Ext.Toolbar({
                    items: btns,
                    enableOverflow: false
                })
            });
            // CQ:START
            // render all CQ.Ext elements to the CQ root
            //               dlg.render(document.body);
            dlg.render(CQ.Util.getRoot());
            // CQ:END
            dlg.getEl().addClass('x-window-dlg');
            mask = dlg.mask;
            bodyEl = dlg.body.createChild({
                html:''
            });
            iconEl = CQ.Ext.get(bodyEl.dom.firstChild);
           bodyEl.createChild({cls:'x-clear'});
        
            return dlg;
        },

        

        /**
         * Returns true if the message box is currently displayed
         * @return {Boolean} True if the message box is visible, else false
         */
        isVisible : function(){
            return dlg && dlg.isVisible();
        },

        /**
         * Hides the message box if it is displayed
         * @return {CQ.Ext.MessageBox} this
         */
        hide : function(){
            var proxy = dlg ? dlg.activeGhost : null;
            if(this.isVisible() || proxy){
                dlg.hide();
                handleHide();
                if (proxy){
                    // unghost is a private function, but i saw no better solution
                    // to fix the locking problem when dragging while it closes
                    dlg.unghost(false, false);
                }
            }
            return this;
        },

        /**
			CQ.Ext.Msg.show({
			   title: 'Address',
			   width: 300,
			   buttons: CQ.Ext.MessageBox.OKCANCEL,
			   fn: saveAddress,
			   store: store
			});
         * @return {CQ.Ext.MessageBox} this
         */
        show : function(options){
            if(this.isVisible()){
                this.hide();
            }
            opt = options;
            var d = this.getDialog(opt.store, opt.title || "&#160;");

            d.setTitle(opt.title || "&#160;");
            var allowClose = (opt.closable !== false && opt.progress !== true && opt.wait !== true);
            d.tools.close.setDisplayed(allowClose);


            if(CQ.Ext.isDefined(opt.iconCls)){
              d.setIconClass(opt.iconCls);
            }
            //this.setIcon(CQ.Ext.isDefined(opt.icon) ? opt.icon : bufferIcon);
            bwidth = updateButtons(opt.buttons);

            //this.updateText(opt.msg);
            if(opt.cls){
                d.el.addClass(opt.cls);
            }
            d.proxyDrag = opt.proxyDrag === true;
            d.modal = opt.modal !== false;
            d.mask = opt.modal !== false ? mask : false;
            if(!d.isVisible()){
                // force it to the end of the z-index stack so it gets a cursor in FF
                // CQ:START
                // render all CQ.Ext elements to the CQ root
//               document.body.appendChild(dlg.el.dom);
                CQ.Util.getRoot().appendChild(d.el.dom);

                d.center = function(){
                        var xy = this.el.getAlignToXY(CQ.Ext.getBody(), 'c-c');
                        this.setPagePosition(xy[0], xy[1] - 40);
                        return this;
                    };

                d.center();
                // CQ:END
                d.setAnimateTarget(opt.animEl);
                //workaround for window internally enabling keymap in afterShow
                d.on('show', function(){
                    if(allowClose === true){
                        d.keyMap.enable();
                    }else{
                        d.keyMap.disable();
                    }
                }, this, {single:true});
                d.show(opt.animEl);
            }

            return this;
        },

        OKCANCEL : {ok:true, cancel:true},


        /**
         * The default height in pixels of the message box's multiline textarea if displayed (defaults to 75)
         * @type Number
         */
        defaultTextHeight : 75,
        /**
         * The maximum width in pixels of the message box (defaults to 600)
         * @type Number
         */
        maxWidth : 600,
        /**
         * The minimum width in pixels of the message box (defaults to 100)
         * @type Number
         */
        minWidth : 100,
        
        buttonText : {
            ok : "OK",
            cancel : "Cancel"
        }
    };
}();
