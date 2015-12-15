/**
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */

/**
 * @class CQ.form.SmartSlides
 * @extends CQ.html5.form.SmartFile
 * <p>The SmartImage is an intelligent image uploader. It provides tools to process an
 * uploaded image, for example a tool to define image maps and an image cropper.</p>
 * <p>Note that the component is mainly designed for use on a separate dialog tab. You may
 * use the component inside a {@link CQ.Ext.layout.FormLayout} optionally if you provide
 * a suitable {@link #height} setting.</p>
 * @since 5.5, replaces {@link CQ.form.SmartImage}
 * @constructor
 * Creates a new SmartImage.
 * @param {Object} config The config object
 */
CQ.form.SmartSlides = CQ.Ext.extend(CQ.html5.form.SmartFile, {

    /**
     * @cfg {String} mimeTypes
     * MIME types allowed for uploading (each separated by a semicolon; wildcard * is
     * allowed; for example: "*.*" or "*.jpg;*.gif;*.png". Defaults to
     * "*.jpg;*.jpeg;*.gif;*.png".
     */
    /**
     * @cfg {String} mimeTypesDescription
     * A String that describes the allowed MIME types (defaults to "Images")
     */
    /**
     * @cfg {String} ddAccept
     * MIME type definition of files that are allowed for referencing using drag &amp; drop
     * (defaults to "image/")
     */
    /**
     * @cfg {String} uploadPanelCls
     * CSS class to be used for the upload panel (defaults to null)
     */
    /**
     * @cfg {Boolean} removeUploadPanelClsOnProgress
     * True if the CSS class of the upload panel should be removed when the upload progress
     * is displayed (defaults to false)
     */
    /**
     * @cfg {Boolean} allowFileNameEditing
     * True if the name of uploaded files is editable (defaults to false). Note that you
     * should not change this value for SmartImage.
     */
    /**
     * @cfg {Boolean} transferFileName
     * True if the filename has to be submitted as a separate form field (defaults to
     * false).
     */
    /**
     * @cfg {String} uploadIconCls
     * CSS class to use for displaying the upload icon (defaults to "cq-image-placeholder")
     */
    /**
     * @cfg {String} uploadTextReference
     * Text used in the upload panel if referencing is allowed only (defauls to "Drop an
     * image")
     */
    /**
     * @cfg {String} uploadTextFallback
     * Text used in the upload panel if HTML5 upload is unavailable (defaults to "Upload image")
     */
    /**
     * @cfg {String} uploadText
     * Text used in the upload panel if both referencing and uploading are allowed (defaults
     * to "Drop an image or click to upload")
     */
    /**
     * @cfg {Number} height
     * Height of the SmartImage component (defaults to "auto"). Note that you will have to
     * specify a concrete value here if you intend to use the SmartImage component in
     * conjunction with a {@link CQ.Ext.layout.FormLayout}.
     */
	/**
     * @cfg {CQ.Ext.Panel} headPanel
     * The UI component that is responsible for changing the currently edited slide.
     * Defaults to a suitable implementation that should not be changed.
     */
    /**
     * @cfg {CQ.Ext.Panel} footPanel
     * The UI component that is responsible for changing the title of the currently edited
     * slide. Defaults to a suitable implementation that should not be changed.
     */
	

    /**
     * The original image
     * @private
     * @type CQ.form.SmartImage.Image
     */
    originalImage: null,

    /**
     * The processed image
     * @private
     * @type CQ.form.SmartImage.Image
     */
    processedImage: null,

    /**
     * The original image if a file reference is being used (will overlay originalImage if
     * present)
     * @private
     * @type CQ.form.SmartImage.Image
     */
    originalRefImage: null,

    /**
     * The processed image if a file reference is being used (will overlay processedImage
     * if defined
     * @private
     * @type CQ.form.SmartImage.Image
     */
    processedRefImage: null,

    /**
     * @cfg {String} requestSuffix
     * Request suffix - this suffix is used to get the processed version of an image. It is
     * simply appended to the data path of the original image
     */
    requestSuffix: null,

    /**
     * Array with preconfigured tools
     * @private
     * @type Array
     */
    imageToolDefs: null,

    /**
     * @cfg {String} mapParameter
     * Name of the form field used for posting the image map data; use null or a zero-length
     * String if the image mapping tool should be disabled; the value depends on the
     * serverside implementation; use "./imageMap" for CQ foundation's image component;
     * "./image/imageMap" for the textimage component
     */
    mapParameter: null,

    /**
     * @cfg {String} cropParameter
     * Name of the form field used for posting the cropping rect; use null or a zero-length
     * String if the cropping tool should be disabled; the value depends on the serverside
     * implementation; use "./imageCrop" for CQ foundation's image component;
     * "./image/imageCrop" for the textimage component
     */
    cropParameter: null,

    /**
     * @cfg {String} rotateParameter
     * Name of the form field used for posting the rotation angle; use null or a zero-length
     * String if the rotate tool should be disabled; the value depends on the serverside
     * implementation; use "./imageRotate" for CQ foundation's image component;
     * "./image/imageRotate" for the textimage component
     */
    rotateParameter: null,

    /**
     * @cfg {Boolean} disableFlush
     * True to not render the flush button.
     */
    disableFlush: null,

    /**
     * @cfg {Boolean} disableZoom
     * True to not render the zoom slider.
     */
    disableZoom: null,

    /**
     * Toolspecific components
     * @private
     * @type Object
     */
    toolComponents: null,

    /**
     * @cfg {Function} pathProvider
     * <p>The function providing the path to the processed image. This method is used to
     * access the fully processed image and will be called within the scope of the
     * CQ.form.SmartSlides instance.</p>
     * <p>Arguments:</p>
     * <ul>
     *   <li><code>path</code> : String<br>
     *     The content path</li>
     *   <li><code>requestSuffix</code> : String<br>
     *     The configured request suffix (replaces extension)</li>
     *   <li><code>extension</code> : String<br>
     *     The original extension</li>
     *   <li><code>record</code> : CQ.data.SlingRecord<br>
     *     The record representing the instance</li>
     * </ul>
     * <p>Scope:</p>
     * <ul>
     *   <li><code>this</code> : CQ.form.SmartSlides</li>
     * </ul>
     * <p>Returns:</p>
     * <ul>
     *   <li><code>String</code> : The URL or null if the original URL should be used</li>
     * </ul>
     * @see CQ.form.SmartSlides#defaultPathProvider
     */
    pathProvider: null,

    /**
     * @cfg {Boolean} hideMainToolbar
     * true to hide the main toolbar (the one under the actual picture;
     * defaults to false)
     */
    hideMainToolbar: false,

    /**
     * Number of currently pending images
     * @private
     * @type Number
     */
    imagesPending: 0,

    /**
     * @cfg {Boolean} disableInfo
     * True to hide the "information" tool; defaults to false
     * @since 5.4
     */
    disableInfo: false,

    /**
     * The currently displayed info tool tip
     * @private
     * @type CQ.Ext.Tip
     */
    infoTip: null,
    
    /**
     * @cfg {String} fileReferencePrefix
     * Prefix to be used to address a single slide; use the '$' placeholder to integrate the
     * internal slide number (defaults to "./image$")
     */
    fileReferencePrefix: null,

    /**
     * Head panel with slideshow specific functionality
     * @type CQ.form.NamedSlidesPanel
     * @private
     */
    headPanel: null,

    /**
     * Array that contains all currently defined slides
     * @type CQ.form.NamedSlide[]
     * @private
     */
    slides: null,

    /**
     * The currently edited slide
     * @type CQ.form.NamedSlide
     * @private
     */
    editedSlide: null,
    
    /**
     * The currently edited slide index
     * @type int
     * @private
     */
    editedSlideIndex: -1,

    /**
     * Panel to preselect. This is part of a workaround for an Ext bug regarding IE.
     * @type CQ.Ext.Container
     * @private
     */
    activeTabToPreselect: null,

    /**
     * Name field. See bug# 25253.
     * @private
     */
    name: "",
    
    /**
     * True if the image has been processed.
     */
    isProcessed : false,
    
    /**
     * Fields configuration.
     */
    fieldsConfig: null,
    /**
     * height of the fields panel.
     */
    fieldsPanelheight: null,
    
    config: null,
    
    currentMapValue: null,
    
    currentCropValue: null,
    
    currentRotateValue: null,
    
    titleFieldName: null,
    
    leadFieldName: null,
    



    constructor: function(config) {
        config = config || {};
        this.config = config;
        
        var defaults = {
    		"headPanel": new CQ.form.NamedSlidesPanel({
                "onSlideChanged": this.onSlideChanged.createDelegate(this),
                "onAddButton": this.onAddButton.createDelegate(this),
                "onReorderButton": this.onReorderButton.createDelegate(this),
                "onRemoveButton": this.onRemoveButton.createDelegate(this),
                "onEmptySaveButton": this.onEmptySaveButton.createDelegate(this)
            }),
            "footPanel": new CQ.form.NamedTitlePanel(config),
            "fileReferencePrefix": "./image$",
            "fullTab":true,
            "mimeTypes": "*.jpg;*.jpeg;*.gif;*.png",
            "mimeTypesDescription": CQ.I18n.getMessage("Images"),
            "ddAccept": "image/",
            "uploadPanelCls": null,
            "removeUploadPanelClsOnProgress": false,
            "allowFileNameEditing": false,
            "transferFileName": false,
            "uploadIconCls": "cq-image-placeholder",
            "uploadTextReference": CQ.I18n.getMessage("Drop an image"),
            "uploadTextFallback": CQ.I18n.getMessage("Upload image"),
            "uploadText": CQ.I18n.getMessage("Drop an image or click to upload"),
            "height": "auto",
            "anchor": null,
            "pathProvider": CQ.form.SmartSlides.defaultPathProvider,
            "hideMainToolbar": false,
            "allowUpload": false
            
        };
        
        this.titleFieldName = config.titleFieldName;
        this.leadFieldName = config.leadFieldName;

        // Create tool defs
        this.imageToolDefs = [ ];
        if (config.mapParameter) {
            this.imageToolDefs.push(new CQ.form.ImageMap(config.mapParameter));
            delete config.mapParameter;
        }
        if (config.cropParameter) {
            this.imageToolDefs.push(new CQ.form.ImageCrop(config.cropParameter));
            delete config.cropParameter;
        }
        if (config.rotateParameter) {
            this.imageToolDefs.push(
                    new CQ.form.SmartImage.Tool.Rotate(config.rotateParameter));
            delete config.rotateParameter;
        }

        CQ.Util.applyDefaults(config, defaults);
        CQ.form.SmartSlides.superclass.constructor.call(this, config);

        this.addEvents(

            /**
             * @event beforeloadimage
             * Fires before image data gets loaded. Note that if different versions of
             * the same image (original, processed) are loaded, this only gets fired
             * once.
             * @param {CQ.form.SmartSlides} imageComponent The image component
             * @since 5.4
             */
            "beforeloadimage",

            /**
             * @event loadimage
             * Fires after image data has been loaded successfully. Note that if different
             * versions of the same image (original, processed) are loaded, this only gets
             * fired once, after all versions have been loaded successfully.
             * @param {CQ.form.SmartSlides} imageComponent The image component
             * @since 5.4
             */
            "loadimage",

            /**
             * @event imagestate
             * Fires if the edited image changes state. Currently supported states are:
             * <ul>
             *   <li>processedremoved - if the processed variant of an image becomes
             *     unavailable/invalidates.</li>
             *   <li>processedavailable - if the processed variant of an image becomes
             *     available (and is actually loaded).</li>
             *   <li>originalremoved - if the original variant of an image becomes
             *     unavailable.</li>
             *   <li>originalavailable - if the original variant of an image becomes
             *     available (and is aczually loaded).</li>
             * </ul>
             * @param {CQ.form.SmartSlides} imageComponent The image component
             * @param {String} state The state that has changed (as described above)
             * @param {Object} addInfo (optional) Additional information
             * @since 5.4
             */
            "imagestate"

        );

        // initialize tools
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            this.imageToolDefs[toolIndex].initialize(config);
        }
        
        this.slides = [ ];
        
        
    },

    // overriding CQ.html5.form.SmartFile#initComponent
    initComponent: function() {

        CQ.form.SmartSlides.superclass.initComponent.call(this);

        this.workingAreaContainer = new CQ.Ext.Panel({
            "itemId": "workingArea",
            "border": false,
            "layout": "border"
        });
        this.processingPanel.add(this.workingAreaContainer);

        // Image display/processing area
        this.workingArea = new CQ.Ext.Panel({
            // "itemId": "workingArea",
            "border": false,
            "layout": "card",
            "region": "center",
            "activeItem": 0,
            "listeners": {
                "beforeadd": function(container, component) {
                    if (container._width && container._height && component.notifyResize) {
                        component.notifyResize.call(component, this._width, this._height);
                    }
                },
                "bodyresize": function(panel, width, height) {
                    if (typeof width == "object") {
                        height = width.height;
                        width = width.width;
                    }
                    if (width && height) {
                        panel._width = width;
                        panel._height = height;
                        var itemCnt = panel.items.getCount();
                        for (var itemIndex = 0; itemIndex < itemCnt; itemIndex++) {
                            var itemToProcess = panel.items.get(itemIndex);
                            if (itemToProcess.notifyResize) {
                                itemToProcess.notifyResize.call(
                                        itemToProcess, width, height);
                            }
                        }
                    }
                }
            },
            "afterRender": function() {
                CQ.Ext.Panel.prototype.afterRender.call(this);
                this.el.setVisibilityMode(CQ.Ext.Element.DISPLAY);
            }
        });
        this.workingAreaContainer.add(this.workingArea);

        // Panel for simple image display
        this.imagePanel = new CQ.form.SmartImage.ImagePanel({
            "itemId": "imageview",
            "listeners": {
                "smartimage.zoomchange": {
                    fn: function(zoom) {
                        if (this.zoomSlider) {
                            this.suspendEvents();
                            this.zoomSlider.setValue(zoom * 10);
                            this.resumeEvents();
                        }
                    },
                    scope: this
                },
                "smartimage.defaultview": {
                    fn: this.disableTools,
                    scope: this
                }
            }
        });
        this.workingArea.add(this.imagePanel);

        // insert customized panels
        if (this.topPanel) {
            this.topPanel.region = "north";
            this.workingAreaContainer.add(this.topPanel);
        }

        // Tool's initComponent
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            this.imageToolDefs[toolIndex].initComponent(this);
        }

        this.on("loadimage", this.adjustUI, this);
        
        // HACK: fixes a problem with dropdown boxes width when added inside a tab panel
        // It is an ugly solution, but compatible with many scenarios. Couldn't find a solution where it was possible to detect when the widget became visible.
        var me = this,
            tabPanel = this.findParentByType('tabpanel');
        if (tabPanel) {
            tabPanel.addListener('tabchange', function () {
                if (me.footPanel) {
                    me.footPanel.doLayout();
                }
            });
        }
    },

    // overriding CQ.html5.form.SmartFile#onRender
    onRender: function(ct, pos) {
        CQ.form.SmartSlides.superclass.onRender.call(this, ct, pos);
        
        var dialog = this.getToplevel();
        if (dialog) {
            dialog.on("hide", function() {
                this.hideTools();
                this.imagePanel.ignoreRotation = false;
                this.toolSelector.disable();
                this.imagePanel.disablePanelTemporaryily();
            }, this);
            dialog.on("editlocked", function(dlg, isInitialState) {
                // only save drop targets the first time
                if (this.savedDropTargets == null) {
                    this.savedDropTargets = this.dropTargets;
                }
                this.dropTargets = null;
            }, this);
            dialog.on("editunlocked", function(dlg, isInitialState) {
                // only restore if there are saved drop targets available (they will not if
                // the initial state of the component is unlocked)
                if (this.savedDropTargets != null) {
                    this.dropTargets = this.savedDropTargets;
                }
            }, this);
        }
    },

    // Field Lock --------------------------------------------------------------------------

    handleFieldLock: function(iconCls, fieldEditLock, fieldEditLockDisabled, rec) {
        var field = this;

        // check edit lock based on image data
        var fieldName = this.getName();
        var baseNodeName = this.getBaseNodeName();
        if (rec.get(baseNodeName)) {
            var imgData = rec.get(baseNodeName);
            var mixins = imgData["jcr:mixinTypes"];

            // check if entire node is canceled
            if (mixins && (mixins.indexOf(CQ.wcm.msm.MSM.MIXIN_LIVE_SYNC_CANCELLED) != -1)) {
                fieldEditLock = false;
                iconCls = "cq-dialog-unlocked";
            }

            // check if property inheritance is canceled
            if (imgData[CQ.wcm.msm.MSM.PARAM_PROPERTY_INHERITANCE_CANCELED]) {
                fieldEditLock = false; // currently we cancel inheritance for all props that are managed by SmartImage
                iconCls = "cq-dialog-unlocked";
            }
        }
        field.editLock = fieldEditLock;
        field.editLockDisabled = fieldEditLockDisabled;

        // disable toolbar items
        this.setToolbarEnabled(!(fieldEditLock && !fieldEditLockDisabled));

        if (fieldEditLock && !fieldEditLockDisabled) {
            this.dropTargets[0].lock();
            this.processingPanel.body.mask();
        }
        var tip = "";
        if (fieldEditLockDisabled) {
            tip = CQ.Dialog.INHERITANCE_BROKEN;
        } else {
            tip = fieldEditLock ? CQ.Dialog.CANCEL_INHERITANCE : CQ.Dialog.REVERT_INHERITANCE;
        }

        if (!this.isUploadPanelCreated) {
            this.delayedCreateRevertInheritanceHint = true;
        } else if (!this.isLockHintCreated) {
            this.createRevertInheritanceHint();
            this.isLockHintCreated = true;
        }

        if (!this.fieldEditLockBtn) {
            field.fieldEditLockBtn = new CQ.Ext.Button({
                "disabled":fieldEditLockDisabled,
                "tooltip":tip,
                "cls":"cq-dialog-editlock cq-smartimage-editlock",
                "iconCls":iconCls,
                "handler":function() {
                    this.switchPropertyInheritance();
                },
                "scope":this
            });
            this.toolSelector.add(this.fieldEditLockBtn);
        } else {
            this.fieldEditLockBtn.setDisabled(fieldEditLockDisabled);
            this.fieldEditLockBtn.setIconClass(iconCls);
            this.fieldEditLockBtn.setTooltip(iconCls == "cq-dialog-unlocked" ?
                    CQ.Dialog.REVERT_INHERITANCE : CQ.Dialog.CANCEL_INHERITANCE);
        }

        this.updateView();
    },

    switchPropertyInheritance: function () {
        var dlg = this.findParentByType("dialog");
        dlg.switchPropertyInheritance(this, null, function(iconCls, editLock) {
            this.editLock = editLock;

            this.fieldEditLockBtn.setIconClass(iconCls);
            this.fieldEditLockBtn.setTooltip(iconCls == "cq-dialog-unlocked" ?
                    CQ.Dialog.REVERT_INHERITANCE : CQ.Dialog.CANCEL_INHERITANCE);


            if (editLock) {
                this.dropTargets[0].lock();
                this.processingPanel.body.mask();
            } else {
                this.dropTargets[0].unlock();
                this.processingPanel.body.unmask();
            }

            this.setToolbarEnabled(!editLock);
            this.updateView();
        });
    },

    /**
     * Returns the names of all fields that are managed by SmartImage.
     */
    getFieldLockParameters: function(params) {
        //cancel me deeply
        delete params.cmd;
        params[CQ.wcm.msm.MSM.PARAM_STATUS +"/"+ CQ.wcm.msm.MSM.PARAM_IS_CANCELLED] = this.editLock; // lock means not-canceled
        params[CQ.wcm.msm.MSM.PARAM_STATUS +"/"+  CQ.wcm.msm.MSM.PARAM_IS_CANCELLED_FOR_CHILDREN] = true;
        return params;
    },

    getFieldLockTarget: function(path) {
        return path += "/" + this.getBaseNodeName();
    },

    /**
     * @private
     */
    getPropertyName: function(param) {
        return param.substr(param.lastIndexOf("/") + 1);
    },

    /**
     * Returns the base node name of the image. For "./image/file", this is "image".
     * @private
     */
    getBaseNodeName: function() {
        var fieldName = this.getName();
        return fieldName.replace(/^([^\/]*)\/([^\/]*)(.*)/, "$2");
    },


    // Validation --------------------------------------------------------------------------

    // overriding CQ.html5.form.SmartFile#markInvalid
    markInvalid: function(msg) {
        if (!this.rendered || this.preventMark) { // not rendered
            return;
        }
        msg = msg || this.invalidText;
        this.uploadPanel.body.addClass(this.invalidClass);
        this.imagePanel.addCanvasClass(this.invalidClass);
        this.uploadPanel.body.dom.qtip = msg;
        this.uploadPanel.body.dom.qclass = 'x-form-invalid-tip';
        if (CQ.Ext.QuickTips) { // fix for floating editors interacting with DND
            CQ.Ext.QuickTips.enable();
        }
        this.fireEvent('invalid', this, msg);
    },

    // overriding CQ.html5.form.SmartFile#clearInvalid
    clearInvalid: function() {
        if(!this.rendered || this.preventMark) { // not rendered
            return;
        }
        this.uploadPanel.body.removeClass(this.invalidClass);
        this.imagePanel.removeCanvasClass(this.invalidClass);
        this.fireEvent('valid', this);
    },


    // Model -------------------------------------------------------------------------------

    /**
     * Postprocesses the file information as delivered by the repository and creates
     * all necessary image objects.
     * @param {CQ.data.SlingRecord} record The record to be processed
     * @param {String} path Base path for resolving relative file paths
     * @private
     */
    postProcessRecord: function(record, path) {
        this.dataRecord = record;
        if (this.originalImage != null) {
            this.fireEvent("statechange", "originalremoved", true);
        }
        this.originalImage = null;
        if (this.processedImage != null) {
            this.fireEvent("statechange", "processedremoved", true);
        }
        this.processedImage = null;
        if (this.originalRefImage != null) {
            this.fireEvent("statechange", "originalremoved", false);
        }
        this.originalRefImage = null;
        if (this.processedRefImage != null) {
            this.fireEvent("statechange", "processedremoved", false);
        }
        this.processedRefImage = null;
        var processedImageConfig = null;
        this.fireEvent("beforeloadimage", this);
        if (this.referencedFileInfo) {
            this.originalRefImage = new CQ.form.SmartImage.Image({
                "dataPath": this.referencedFileInfo.dataPath,
                "url": this.referencedFileInfo.url,
                "fallbackUrl": this.referencedFileInfo.fallbackUrl
            });
            this.notifyImageLoad(this.originalRefImage);
            processedImageConfig =
                    this.createProcessedImageConfig(this.referencedFileInfo.dataPath);
            if (processedImageConfig) {
                this.processedRefImage =
                        new CQ.form.SmartImage.Image(processedImageConfig);
                this.notifyImageLoad(this.processedRefImage);
            }
            this.originalRefImage.load();
            if (processedImageConfig) {
                this.processedRefImage.load();
            }
        }
        if (this.fileInfo) {
            this.originalImage = new CQ.form.SmartImage.Image({
                "dataPath": this.fileInfo.dataPath,
                "url": this.fileInfo.url
            });
            this.notifyImageLoad(this.originalImage);
            processedImageConfig = this.createProcessedImageConfig(path);
            if (processedImageConfig) {
                this.processedImage = new CQ.form.SmartImage.Image(
                        this.createProcessedImageConfig(path));
                this.notifyImageLoad(this.processedImage);
            }
            this.originalImage.load();
            if (processedImageConfig) {
                this.processedImage.load();
            }
        }
        // tools
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            var tool = this.imageToolDefs[toolIndex];
            tool.processRecord(record);
        }
    },

    /**
     * Method that is called to inform the SmartImage component about a new image that is
     * about to be loaded.
     * @param {CQ.form.SmartImage.Image} img The image that is about to be loaded
     * @private
     */
    notifyImageLoad: function(img) {
        if (!this.toolSelector.disabled && !this.hideMainToolbar) {
            this.toolSelector.disable();
        }
        this.imagesPending++;
        img.addToolLoadHandler(function() {
            this.imagesPending--;
            if (this.imagesPending == 0) {
                this.fireEvent("loadimage", this);
            }
            if (img == this.processedImage) {
                this.fireEvent("imagestate", this, "processedavailable", true);
            } else if (img == this.processedRefImage) {
                this.fireEvent("imagestate", this, "processedavailable", false);
            } else if (img == this.originalImage) {
                this.fireEvent("imagestate", this, "originalavailable", true);
            } else if (img == this.originalRefImage) {
                this.fireEvent("imagestate", this, "originalavailable", false);
            }
        }.createDelegate(this), true);
    },

    /**
     * Creates a configuration object that describes processed image data.
     * @param {String} path The path of the original image
     * @return {Object} The configuration object for the processed image; format is:
     *         <ul>
     *           <li>dataPath (String) - data path (without webapp context path; for
     *             example: "/content/app/images/image.png")</li>
     *           <li>url (String) - URL (including webapp context path; for example:
     *             "/cq5/content/app/images/image.png")</li>
     *         </ul>
     * @private
     */
    createProcessedImageConfig: function(path) {
        var extension = "";
        if (path) {
            var extSepPos = path.lastIndexOf(".");
            var slashPos = path.lastIndexOf("/");
            if ((extSepPos > 0) && (extSepPos > (slashPos + 1))) {
                extension = path.substring(extSepPos, path.length);
            }
        }
        var url = this.pathProvider.call(
                this, this.dataPath, this.requestSuffix, extension, this.dataRecord, this);
        if (url == null) {
            return null;
        }
        return {
            "url": url
        };
    },

    /**
     * <p>Synchronizes form elements with the current UI state.</p>
     * <p>All form fields are adjusted accordingly. Registered tools are synchronized, too.
     * </p>
     * @private
     */
    syncFormElements: function() {
        CQ.form.SmartSlides.superclass.syncFormElements.call(this);
        // sync tools
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            var toolToProcess = this.imageToolDefs[toolIndex];
            toolToProcess.transferToField();
            var value = toolToProcess.transferField.getValue();
        }
    },

    /**
     * Determines if a processed image is currently used.
     * @return {Boolean} True if a processed image is used
     */
    usesProcessedImage: function() {
        var usedImg = this.getSuitableImage(false);
        return (usedImg == this.processedImage) || (usedImg == this.processedRefImage);
    },

    /**
     * <p>Invalidates the processed images.</p>
     * <p>This should be used by tools that change an image in a way that requires them
     * to be saved to the server before further editing is available.
     */
    invalidateProcessedImages: function() {
        if (this.processedImage != null) {
            this.processedImage = null;
            this.fireEvent("imagestate", this, "processedremoved", true);
        }
        if (this.processedRefImage != null) {
            this.processedRefImage = null;
            this.fireEvent("imagestate", this, "processedremoved", false);
        }
    },


    // View --------------------------------------------------------------------------------

    /**
     * Creates the panel (used in a CardLayout) that is responsible for editing the managed
     * image.
     * @return {CQ.Ext.Panel} The panel created
     * @private
     */
    createProcessingPanel: function() {

        if (!this.hideMainToolbar) {
            var toolCnt, toolIndex;
            this.imageTools = [ ];
            var imageToolsConfig = [ ];
            toolCnt = this.imageToolDefs.length;
            for (toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                var toolToProcess = this.imageToolDefs[toolIndex];
                var buttonToAdd;
                if (!toolToProcess.isCommandTool) {
                    buttonToAdd = new CQ.Ext.Toolbar.Button( {
                        "text": toolToProcess["toolName"],
                        "itemId": toolToProcess["toolId"],
                        "toolRef": toolToProcess,
                        "iconCls": toolToProcess["iconCls"],
                        "actionHandler": this.toolClicked.createDelegate(this),
                        "enableToggle": true,
                        "toggleGroup": "imageTools",
                        "allowDepress": true,
                        "listeners": {
                            "click": function() {
                                this.actionHandler(this.toolRef);
                            }
                        }
                    } );
                } else {
                    buttonToAdd = new CQ.Ext.Toolbar.Button( {
                        "text": toolToProcess["toolName"],
                        "itemId": toolToProcess["toolId"],
                        "toolRef": toolToProcess,
                        "iconCls": toolToProcess["iconCls"],
                        "actionHandler": this.commandToolClicked.createDelegate(this),
                        "enableToggle": false,
                        "listeners": {
                            "click": function() {
                                this.actionHandler(this.toolRef);
                            }
                        }
                    } );
                }
                toolToProcess.buttonComponent = buttonToAdd;
                this.imageTools.push(buttonToAdd);
                toolToProcess.createTransferField(this);
                imageToolsConfig.push(buttonToAdd);
            }
            if (!this.disableFlush) {
                imageToolsConfig.push( {
                    "xtype": "tbseparator"
                } );
                imageToolsConfig.push( {
                    "xtype": "tbbutton",
                    "text": CQ.I18n.getMessage("Clear"),
                    "iconCls": "cq-image-icon-clear",
                    "listeners": {
                        "click": {
                            "fn": this.flushImage,
                            "scope": this
                        }
                    }
                } );
            }
            if (!this.disableInfo) {
                imageToolsConfig.push( {
                    "xtype": "tbseparator"
                } );
                imageToolsConfig.push( {
                    "itemId": "infoTool",
                    "xtype": "tbbutton",
                    "iconCls": "cq-image-icon-info",
                    "listeners": {
                        "click": {
                            "fn": this.showImageInfo,
                            "scope": this
                        }
                    }
                } );
            }
            imageToolsConfig.push( {
                "xtype": "tbfill"
            } );
            if (!this.disableZoom) {
                this.zoomSlider = new CQ.Ext.Slider( {
                	"width": CQ.Ext.isIE7 ? 150 : 200,
                    "minValue": 0,
                    "maxValue": 90,
                    "vertical": false,
                    "listeners": {
                        "change": {
                            fn: function(slider, newValue) {
                                this.imagePanel.setZoom(newValue / 10);
                            },
                            scope: this
                        }
                    }
                } );
                imageToolsConfig.push(this.zoomSlider);
            }
        }

        // create panel with "bottom toolbar"
        this.toolSelector = new CQ.Ext.Toolbar(imageToolsConfig);
        this.toolSelector.disable();
        return new CQ.Ext.Panel({
            "itemId": "processing",
            "layout": "fit",
            "border": false,
            // button bar must be created this way, otherwise Firefox gets confused
            "bbar": (!this.hideMainToolbar ? this.toolSelector : null),
            "afterRender": function() {
                CQ.Ext.Panel.prototype.afterRender.call(this);
                this.el.setVisibilityMode(CQ.Ext.Element.DISPLAY);
                this.body.setVisibilityMode(CQ.Ext.Element.DISPLAY);
            }
        });
    },

    /**
     * <p>Updates the UI to the current state of the component.</p>
     * <p>The correct basic panel (upload/referencing vs. editing) is chosen. All editing
     * stuff is reset to a default state. The editing area is notified about the image to
     * display, if applicable.</p>
     * @private
     */
    updateView: function() {

        if (this.editLock) {
            this.containerPanel.getLayout().setActiveItem("lock");
            if (!this.isLockPanelCreated) {
                this.createLockPanel();
            }
        } else {

            var hasAnyImage = this.originalImage || this.originalRefImage
                                      || this.processedImage || this.processedRefImage;
            this.updateViewBasics(hasAnyImage);
            if (hasAnyImage) {
                this.workingArea.getLayout().setActiveItem("imageview");
                this.resetTools();
                this.resetZoomSlider();
            }
            this.updateImageInfoState();
        }

        this.doLayout();

        if (this.processedRefImage) {
            this.imagePanel.updateImage(this.processedRefImage);
        } else if (this.originalRefImage) {
            this.imagePanel.updateImage(this.originalRefImage);
        } else if (this.processedImage) {
            this.imagePanel.updateImage(this.processedImage);
        } else if (this.originalImage) {
            this.imagePanel.updateImage(this.originalImage);
        }
    },

    /**
     * Resets the "tools" toolbar.
     * @private
     */
    resetTools: function() {
        if (!this.hideMainToolbar) {
            var toolCnt = this.imageTools.length;
            for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                var tool = this.imageTools[toolIndex];
                if (tool.enableToggle) {
                    tool.toggle(false);
                }
            }
        }
        this.imagePanel.hideAllShapeSets(false);
    },

    /**
     * Resets the zoom slider.
     * @private
     */
    resetZoomSlider: function() {
        if (this.zoomSlider) {
            this.zoomSlider.suspendEvents();
            this.zoomSlider.setValue(0);
            this.zoomSlider.resumeEvents();
        }
    },

    /**
     * Gets the panel used for displaying &amp; editing an image.
     * @return {CQ.form.SmartImage.ImagePanel} The image panel used for displaying/editing
     *         an image
     * @private
     */
    getImagePanel: function() {
        return this.imagePanel;
    },

    /**
     * Handler that adjusts the UI after loading an image (all variants) has been completed.
     */
    adjustUI: function() {
        if (!this.hideMainToolbar) {
            // Toolbar#enable will enable all buttons - so we'll have to save the
            // info tool's disabled state and restore it accordingly
            var infoTool;
            if (!this.disableInfo) {
                infoTool = this.toolSelector.items.get("infoTool");
                var isInfoToolDisabled = infoTool.disabled;
            }
            if (!this.editLock || this.editLockDisabled) {
                // first, enable toolbar as a whole, then enable each tool (allowing it
                // to veto)
                this.toolSelector.enable();
                this.enableToolbar();
                if (!this.disableInfo) {
                    infoTool.setDisabled(isInfoToolDisabled);
                }
            }
            if (this.fieldEditLockBtn) {
                this.fieldEditLockBtn.setDisabled(this.editLockDisabled);
            }
        }
    },

    /**
     * Sets the toolbar's enabled state.
     * @param {Boolean} isEnabled True to enable the toolbar
     */
    setToolbarEnabled: function(isEnabled) {
        (isEnabled ? this.enableToolbar() : this.disableToolbar());
    },

    /**
     * <p>Disables the toolbar as a whole.</p>
     * <p>The "lock button" is excluded from being disabled, as it is a special case.</p>
     */
    disableToolbar: function() {
        this.toolSelector.items.each(function(item) {
                if (item != this.fieldEditLockBtn) {
                    item.setDisabled(true);
                }
            }, this);
    },

    /**
     * <p>Enables the toolbar as a whole. Allows each tool to decide for itself if it
     * should actually be enabled. It also considers locking state.</p>
     * <p>The "lock button" is excluded from being enabled, as it is a special case.</p>
     */
    enableToolbar: function() {
        this.toolSelector.items.each(function(item) {
                if (item != this.fieldEditLockBtn) {
                    var isEnabled = (!this.editLock || this.editLockDisabled);
                    // ask tool if it has actually to be enabled or if it should be kept
                    // disabled due to some internal reason
                    if (isEnabled && item.toolRef) {
                        isEnabled = item.toolRef.isEnabled();
                    }
                    item.setDisabled(!isEnabled);
                }
            }, this);
    },


    // Internal event handling -------------------------------------------------------------

    /**
     * Handles a primarily successful upload by loading the uploaded image and updating
     * everything after the image has been loaded.
     * @return {Boolean} True, if the upload is still valid/successful after executing
     *         the handler
     * @private
     */
    onUploaded: function() {
        this.originalImage = new CQ.form.SmartImage.Image(this.fileInfo);
        this.originalImage.loadHandler = function() {
            var toolCnt = this.imageToolDefs.length;
            for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                this.imageToolDefs[toolIndex].onImageUploaded(this.originalImage);
            }
            this.syncFormElements();
            this.updateView();
        }.createDelegate(this);
        this.fireEvent("beforeloadimage", this);
        this.notifyImageLoad(this.originalImage);
        this.originalImage.load();
        if (this.processedImage != null) {
            this.processedImage = null;
            this.fireEvent("imagestate", this, "processedremoved", true);
        }
        return true;
    },


    // Tools -------------------------------------------------------------------------------

    /**
     * <p>Handler that propagates clicks related to tools to the corresponding tool
     * implementation.</p>
     * <p>This handler is responsble for clicks on "non-command"-tools.</p>
     * @param {CQ.Ext.Toolbar.Button} tool The toolbar button representing the tool that
     *        has been clicked
     * @private
     */
    toolClicked: function(tool) {
        var prevTool;
        var toolButton = tool.buttonComponent;
        if (toolButton.pressed) {
            var isFirstTimeCall = false;
            if (this.toolComponents == null) {
                this.toolComponents = { };
            }
            if (!this.toolComponents[tool.toolId]) {
                this.toolComponents[tool.toolId] = {
                    isVisible: false,
                    toolRef: tool
                };
                isFirstTimeCall = true;
            }
            var toolDef = this.toolComponents[tool.toolId];
            // hide all other tools' components
            prevTool = this.hideTools(tool.toolId);
            // render (if necessary) and show tools' components
            if (tool.userInterface && (!tool.userInterface.rendered)) {
                tool.userInterface.render(CQ.Util.getRoot());
            }
            if (prevTool) {
                prevTool.onDeactivation();
            }
            if (tool.userInterface) {
                tool.userInterface.show();
                toolDef.isVisible = true;
                if (!(tool.userInterface.saveX && tool.userInterface.saveY)) {
                    var height = tool.userInterface.getSize().height;
                    var pos = this.getPosition();
                    var toolbarPosX = pos[0];
                    var toolbarPosY = pos[1] - (height + 4);
                    if (toolbarPosX < 0) {
                        toolbarPosX = 0;
                    }
                    if (toolbarPosY < 0) {
                        toolbarPosY = 0;
                    }
                    tool.userInterface.setPosition(toolbarPosX, toolbarPosY);
                } else {
                    tool.userInterface.setPosition(
                            tool.userInterface.saveX, tool.userInterface.saveY);
                }
            }
            tool.onActivation();
        } else {
            prevTool = this.hideTools();
            if (prevTool) {
                prevTool.onDeactivation();
            }
            this.imagePanel.drawImage();
        }
    },

    /**
     * <p>Handler that propagates clicks related to tools to the corresponding tool
     * implementation.</p>
     * <p>This handler is responsble for clicks on "command"-tools.</p>
     * @param {Object} tool The tool definition (as found as an element of
     *        {@link #imageToolDefs})
     * @private
     */
    commandToolClicked: function(tool) {
        tool.onCommand();
    },

    /**
     * Hides the UI of all currently visible tools.
     * @param {String} toolId (optional) ID of tool that is excluded from being hidden if it
     *        is currently shown
     * @private
     */
    hideTools: function(toolId) {
        if (!this.hideMainToolbar) {
            var prevTool;
            for (var toolToHide in this.toolComponents) {
                var hideDef = this.toolComponents[toolToHide];
                if (toolToHide != toolId) {
                    if (hideDef.isVisible) {
                        hideDef.toolRef.userInterface.hide();
                        hideDef.isVisible = false;
                        prevTool = hideDef.toolRef;
                    }
                }
            }
        }
        return prevTool;
    },

    /**
     * <p>Disables all currently active tool components.</p>
     * <p>In addition to {@link #hideTools}, this method toggles the tool's button
     * accordingly and sends the required "onDeactivation" events.</p>
     * @private
     */
    disableTools: function() {
        if (!this.hideMainToolbar) {
            var prevTool = this.hideTools();
            if (prevTool) {
                prevTool.onDeactivation();
            }
            var toolCnt = this.imageTools.length;
            for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                var toolButton = this.imageTools[toolIndex];
                if (toolButton.pressed) {
                    toolButton.suspendEvents();
                    toolButton.toggle(false);
                    toolButton.resumeEvents();
                }
            }
        }
    },

    /**
     * Updates the state of the image info button. Currently, it gets disabled if no
     * reference info is available, as only the referenced file is displayed in the
     * image info popup.
     */
    updateImageInfoState: function() {
        if (!this.disableInfo && !this.hideMainToolbar) {
            var infoTool = this.toolSelector.items.get("infoTool");
            var isReferenced = (this.referencedFileInfo != null);
            (isReferenced ? infoTool.enable() : infoTool.disable());
        }
    },

    /**
     * Shows info for the currently edited image.
     */
    showImageInfo: function() {
        if (this.infoTip != null) {
            var wasShown = this.infoTip.hidden == false;
            this.infoTip.hide();
            if (wasShown) {
                // toggle
                return;
            }
        }
        var clickHandler = function() {
            if (this.infoTip != null) {
                this.infoTip.hide();
                this.infoTip = null;
            }
        };
        var infoTool = this.toolSelector.items.get("infoTool");
        this.infoTip = new CQ.Ext.Tip({
            "title": CQ.I18n.getMessage("Image info"),
            "html": '<span class="cq-smartimage-refinfo">' +
                    this.getRefText(this.referencedFileInfo.dataPath) + '</span>',
            "maxWidth": 500,
            "autoHide": false,
            "closable": true,
            "listeners": {
                "hide": function() {
                    CQ.Ext.EventManager.un(document, "click", clickHandler, this);
                },
                "scope": this
            }
        });
        CQ.Ext.EventManager.on.defer(10, this, [ document, "click", clickHandler, this ]);
        this.infoTip.showBy(infoTool.el, "tl-tr");
    },


    // Processing --------------------------------------------------------------------------

    /**
     * <p>Removes the currently edited image and propagates the change to the UI.</p>
     * <p>After the method has executed, the component is ready for uploading or referencing
     * a new image.</p>
     * @param {Boolean} preventUpdate (optional) True if the UI must not be updated
     * @private
     */
    flushImage: function(preventUpdate) {
        this.flush();
        if (this.processedRefImage != null) {
            this.processedRefImage = null;
            this.fireEvent("imagestate", this, "processedremoved", false);
        }
        if (this.processedImage != null) {
            this.processedImage = null;
            this.fireEvent("imagestate", this, "processedremoved", true);
        }
        this.processedImage = null;
        if (this.originalRefImage) {
            this.originalRefImage = null;
            this.fireEvent("imagestate", this, "originalremoved", false);
        } else if (this.originalImage) {
            this.originalImage = null;
            this.fireEvent("imagestate", this, "originalremoved", true);
        }
        if (preventUpdate !== true) {
            this.syncFormElements();
            this.notifyToolsOnFlush();
            this.hideTools();
            this.updateView();
        }
    },
    
    flushOldSlideData: function() {
        if (this.processedRefImage != null) {
            this.processedRefImage = null;
            this.fireEvent("imagestate", this, "processedremoved", false);
        }
        if (this.processedImage != null) {
            this.processedImage = null;
            this.fireEvent("imagestate", this, "processedremoved", true);
        }
        this.processedImage = null;
        if (this.originalRefImage) {
            this.originalRefImage = null;
            this.fireEvent("imagestate", this, "originalremoved", false);
        } else if (this.originalImage) {
            this.originalImage = null;
            this.fireEvent("imagestate", this, "originalremoved", true);
        }
        this.notifyToolsOnFlush();
        this.updateView();
    },
    

    /**
     * Should reset the field to the original state. Currently just "flushes" the data.
     */
    // overriding CQ.html5.form.SmartFile#reset
    reset: function() {
        // todo implement correctly
        this.flushImage();
        CQ.form.SmartSlides.superclass.reset.call(this);
    },


    /**
     * Notifies all tools when an image gets flushed.
     * @private
     */
    notifyToolsOnFlush: function() {
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            this.imageToolDefs[toolIndex].onImageFlushed();
        }
    },


    // Helpers -----------------------------------------------------------------------------

    /**
     * <p>Gets the image object that is best suited according to the state of the currently
     * edited image.</p>
     * <p>Referenced images "overlay" uploaded images. Processed images have precedence over
     * original images.</p>
     * @param {Boolean} useOriginalImage True if the original version of the image should be
     *        preferred to the processed version
     * @return {CQ.form.SmartImage.Image} The image object
     * @private
     */
    getSuitableImage: function(useOriginalImage) {
        var image;
        if (this.processedRefImage && !useOriginalImage) {
            image = this.processedRefImage;
        } else if (this.originalRefImage) {
            image = this.originalRefImage;
        } else if (this.processedImage && !useOriginalImage) {
            image = this.processedImage;
        } else if (this.originalImage) {
            image = this.originalImage;
        }
        return image;
    },


    // Drag & Drop implementation ----------------------------------------------------------

    /**
     * Handler that reacts on images that are dropped on the component.
     * @param {Object} dragData Description of the object that has been dropped on the
     *        component
     */
    // overriding CQ.html5.form.SmartFile#handleDrop
    handleDrop: function(dragData) {
        if (this.handleDropBasics(dragData)) {
        	this.footPanel.setTitle(this.referencedFileInfo.fileName);
            this.originalRefImage = new CQ.form.SmartImage.Image(this.referencedFileInfo);
            this.originalRefImage.loadHandler = function() {
                this.hideTools();
                var toolCnt = this.imageToolDefs.length;
                for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                    this.imageToolDefs[toolIndex].onImageUploaded(this.originalRefImage);
                }
                this.syncFormElements();
                this.updateView();
            }.createDelegate(this);
            if (this.processedRefImage != null) {
                this.processedRefImage = null;
                this.fireEvent("imagestate", this, "processedremoved", false);
            }
            this.fireEvent("beforeloadimage", this);
            this.notifyImageLoad(this.originalRefImage);
            this.originalRefImage.load();
            return true;
        }
        return false;
    },

    /**
     * Handler that reacts on changes in the slide selector component.
     * @param {CQ.form.Slideshow.Slide} slide The newly selected slide
     * @private
     */
    onSlideChanged: function(slide) {
    	if(this.footPanel.validateMandatoryFields() && this.validateSmartSlide()){
    	    this.saveChanges();
            this.editedSlide = slide;
            if (this.editedSlide) {
                this.showSlide(this.editedSlide);
            }
    	} else {
		var inputField = $('input#ext-comp-1974.x-form-text.x-form-field.x-trigger-noedit');
		if(inputField && inputField.length >0){
		    inputField[0].value = this.editedSlide.title;
		}
    		this.displayError();
    	}
        
    },

    /**
     * Handler that reacts on clicking the "Add" button.
     * @private
     */
    onAddButton: function() {
    	if(this.footPanel.validateMandatoryFields() && this.validateSmartSlide()){
    	    this.addNewSlide();
            this.buildComboBoxContent();
    		
    	} else {	    
	    this.displayError();
	}
    },

    validateSmartSlide: function() {
	if(this.allowBlank == false && (this.referencedFileInfo == '' || this.referencedFileInfo == undefined || this.referencedFileInfo == null)){
	return false;
	}else{
	return true;
	}
    },    
    displayError: function() {
	var validationMsg = '';
		    if(this.allowBlank == false && (this.referencedFileInfo == '' || this.referencedFileInfo == undefined || this.referencedFileInfo == null)){
		    this.markInvalid();
		    validationMsg += "Missing: <b>" + this.title + "<\/b><br\/>";
		    }
	    var formValues = this.footPanel.getFormValues();
		    for(var a = 0; a< this.footPanel.items.items.length; a++){
		    var field = this.footPanel.items.items[a];
		    var formValue = formValues[a];
			if(field.allowBlank == false && (formValue.fieldValue == undefined || formValue.fieldValue == '')){
				validationMsg += "Missing: <b>" + field.fieldLabel + "<\/b><br\/>";
			}
		    }
    		CQ.Ext.Msg.show({
                title:CQ.I18n.getMessage('Validation Failed'),
                msg: CQ.I18n.getMessage(validationMsg),
                buttons: CQ.Ext.Msg.OK,
                icon: CQ.Ext.Msg.ERROR
            });
    },
    persistRecord: function() {
		this.onBeforeSubmit();
		//Now Save
		this.findParentByType("form").getForm().submit();
        
    },
    
    

    /**
     * Handler that reacts on clicking the "Remove" button.
     * @private
     */
    onRemoveButton: function() {
        if (this.editedSlide) {
            this.removeSlide();
        }
        this.buildComboBoxContent();
        
    },
    
    /**
     * Handler that reacts on clicking the "Reorder" button.
     * @private
     */
    onReorderButton: function() {
    	if(this.footPanel.validateMandatoryFields() && this.validateSmartSlide()){
    		this.saveChanges(true);
    		this.buildComboBoxContent();
    		CQ.Ext.SlidesReorder.show({
                "title":CQ.I18n.getMessage("Drag Drop To Reorder Slides"),
                "buttons":CQ.Ext.SlidesReorder.OKCANCEL,
                "store":this.headPanel.getSelectorStore(),
                "fn":function(btnId, text, opt, store) {
                	
                	 if (btnId == "ok" && store ) {
                		 this.headPanel.reorderSlides(store);
                		 
                		 var reorderedSlides = this.headPanel.getAllSlides();
                		 
                		 if(this.slides.length > reorderedSlides.length){
                			 var finalSides = new Array();
                			 var tmpSlide = null;
                			 for(i = 0; i < this.slides.length; i++){
                				 if(i < reorderedSlides.length){
                					 tmpSlide = reorderedSlides[i]; 
                					 tmpSlide.isPersistent = true;
                					 tmpSlide.slideIndex = (i + 1);
                					 finalSides[i] = tmpSlide;
                				 } else {
                					 
                					 tmpSlide = new CQ.form.NamedSlide({
                			                "referencedFileInfo": null,
                			                "title": null,
                			                "slideIndex": (i + 1),
                			                "isPersistent": true,
                			                "isDeleted": true,
                			                "isProcessed": false,
                			                "mapValue": null,
                			                "cropValue": null,
                			                "rotateValue": null
                			            });
                					 finalSides[i] = tmpSlide;
                				 }
                			 }
                			 this.slides = finalSides;
                			 
                		 } else {
                			 this.slides = reorderedSlides;
                		 }
                		 
                		 this.editedSlide = this.getFirstSlide();
                		 this.showSlide(this.editedSlide);
                	 }
                	
                },
                "scope":this
            });
    	} else {
    		this.displayError();
    	}
    	
        
    },
    
    /**
     * Handler that reacts on clicking the "Empty & Save" button.
     * @private
     */
    onEmptySaveButton: function() {
    	var currentSlide = null;

        CQ.Ext.Msg.show({
                "title":CQ.I18n.getMessage("Delete And Save All Slides"),
                "msg":CQ.I18n.getMessage("Are you sure you want to delete and save all slides?"),
                "buttons":CQ.Ext.Msg.YESNO,
                "icon":CQ.Ext.MessageBox.QUESTION,
                "fn":function(btnId) {
                    if (btnId == "yes") {
                       if(this.slides){
                            for(var i = 0; i < this.slides.length; i ++){
                                currentSlide = this.slides[i];
                                currentSlide.isDeleted = true;
                            }
                            this.onBeforeSubmit();
    
                            this.flushImage(true);
    
                            //Now Save
                            this.findParentByType("form").getForm().submit();
                        }
                    }
                },
                "scope":this
            });    	
    },
    
    /**
     * Handles workarounds for some browser issues after the component has been rendered.
     * @private
     */
    afterRender: function() {
        CQ.form.SmartSlides.superclass.afterRender.call(this);
        if (this.fixedHeight == null) {
            if (CQ.Ext.isIE) {
                // This is a workaround for another nasty 0-height layout bug that occurs
                // when using a border layout on a tab and the dialog is hidden/reshown
                // again with the active tab not being not the one containing the one
                // with the border layout. The problem is IE-only.
                var dialog = this.findParentByType("dialog");
                dialog.on("beforehide", function() {
                    var compToCheck = this.ownerCt;
                    var tabToSelect = this;
                    while (compToCheck && !compToCheck.isXType("tabpanel")) {
                        tabToSelect = compToCheck;
                        compToCheck = compToCheck.ownerCt;
                    }
                    if (compToCheck) {
                        this.activeTabToPreselect = compToCheck.getActiveTab();
                        compToCheck.setActiveTab(tabToSelect);
                    }
                }, this);
            }
        }
    },
    
    /**
     * @private
     */
    createFileNameEditingCapability: function() {
        // prevent SmartFile from creating any form interface, as Slideshow will have
        // to implement its own, dynamic version
    },
    
    /**
     * @private
     */
    createHiddenInterfaceFields: function() {
        // prevent SmartFile from creating any form interface, as Slideshow will have
        // to implement its own, dynamic version

        // create some of the hidden fields anyway from SmartFile
        // see bug# 25253 for details
        this.lastModifiedParameter = new CQ.Ext.form.Hidden( {
            "disabled": true,
            "value": ""
        });
        this.containerPanel.add(this.lastModifiedParameter);
        this.lastModifiedByParameter = new CQ.Ext.form.Hidden( {
            "disabled": true,
            "value": ""
        });
        this.containerPanel.add(this.lastModifiedByParameter);
    },
    
    /**
     * Creates all interface form fields that are required to transfer the entire
     * slideshow to the server.
     * @param {CQ.Ext.Element} ct The container element the form fields must be created to
     * @private
     */
    createInterface: function(ct) {
        this.headPanel.disableFormElements();
        this.footPanel.disableFormElements();
        if (!this.interfaceFields) {
            this.interfaceFields = [ ];
        } else {
            this.interfaceFields.length = 0;
        }
        var topLevel = this.getToplevel();
        var form = (topLevel.getXType() == "dialog" ? topLevel.form :
                (topLevel.getXType() == "form" ? topLevel.getForm() : null));
        var slideCnt = this.slides.length;
        for (var slideIndex = 0; slideIndex < slideCnt; slideIndex++) {
            var slide = this.slides[slideIndex];
            var fields = slide.createTransferFields(this.fileReferencePrefix);
            var fieldCnt = fields.length;
            for (var fieldIndex = 0; fieldIndex < fieldCnt; fieldIndex++) {
                var field = fields[fieldIndex];
                field.render(ct);
                this.interfaceFields.push(field);
                // workaround for bug #38022/#40734
                if (form) {
                    form.add(field)
                }
            }
        }
    },
    
    /**
     * Removes all existing interface form fields.
     * @private
     */
    removeOldInterface: function() {
        if (this.interfaceFields) {
            var topLevel = this.getToplevel();
            var form = (topLevel.getXType() == "dialog" ? topLevel.form :
                    (topLevel.getXType() == "form" ? topLevel.getForm() : null));
            var fieldCnt = this.interfaceFields.length;
            for (var fieldIndex = 0; fieldIndex < fieldCnt; fieldIndex++) {
                var field = this.interfaceFields[fieldIndex];
                if (form) {
                    form.remove(field);
                }
                field.getEl().remove();
            }
            this.interfaceFields.length = 0;
        }
    },
    
    /**
     * See {@link CQ.form.SmartFile#onBeforeSubmit}.
     * @private
     */
    onBeforeSubmit: function() {
        this.saveChanges(true);
        this.removeOldInterface();
        this.createInterface(this.el);
        
        //All tool values have been added to the slides.
        //Now save empty values to the tools so that the tool values are not saved to the main smartSlide node.
        //The tool values would still be saved to the multi image nodes.
        this.saveEmptyTools();
        
        return true;
    },
    
    saveEmptyTools: function() {
    	
        var toolCnt = this.imageToolDefs.length;
        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            var toolToProcess = this.imageToolDefs[toolIndex];
            toolToProcess.transferField.setValue("");
        }
    },
    
 // Helpers -----------------------------------------------------------------------------

    /**
     * Creates a suitable slide index for a new slide.
     * @private
     * @return {Number} The slide index
     */
    createSlideIndex: function() {
        var slide;
        var slideCnt = this.slides.length;
        var maxSlideIndex = 0;
        
        for (var index = 0; index < slideCnt; index++) {
            slide = this.slides[index];
            if (!slide.isDeleted && (slide.slideIndex > maxSlideIndex)) {
                maxSlideIndex = parseInt(this.slides[index].slideIndex);
            }
        }
        for (var slideIndex = 1; slideIndex <= maxSlideIndex; slideIndex++) {
            var hasIndex = false;
            for (var checkIndex = 0; checkIndex < slideCnt; checkIndex++) {
                slide = this.slides[checkIndex];
                if (!slide.isDeleted && (slide.slideIndex == slideIndex)) {
                    hasIndex = true;
                    break;
                }
            }
            if (!hasIndex) {
                return slideIndex;
            }
        }
        return maxSlideIndex + 1;
    },

    /**
     * Gets the first slide.
     * @private
     * @return {CQ.form.NamedSlide}
     */
    getFirstSlide: function() {
        var slideCnt = this.slides.length;
        for (var slideIndex = 0; slideIndex < slideCnt; slideIndex++) {
            var slide = this.slides[slideIndex];
            if (!slide.isDeleted) {
                return slide;
            }
        }
        return null;
    },

    /**
     * Adds a new slide and makes it the one that is currently edited.
     */
    addNewSlide: function() {
        this.saveChanges(true);
        var slideIndex = this.createSlideIndex();
        var slideCreated = this.createSlide(null, slideIndex, this.dataPath);
        this.showSlide(slideCreated);
        this.editedSlide = slideCreated;
    },

    /**
     * Removes the currently edited slide. If no more slides are defined after the
     * removal, a new empty slide is added.
     */
    removeSlide: function() {
        if (this.editedSlide) {
            this.editedSlide.isDeleted = true;
            this.reorderAllSlides();
            var firstSlide = this.getFirstSlide();
            if (!firstSlide) {
                this.addNewSlide();
            } else {
                this.editedSlide = firstSlide;
                this.showSlide(this.editedSlide);
            }
        }
    },
    
    reorderAllSlides: function() {
    	var deletedSlides = new Array();
    	var persistedSlides = new Array();
    	var allSlides = new Array();
    	
    	for(i = 0; i < this.slides.length; i ++){
    		var slide = this.slides[i];
    		if(slide.isDeleted){
    			deletedSlides.push(slide);
    		} else {
    			persistedSlides.push(slide);
    		}
    	}
    	
    	
    	var j = 0;
    	if(persistedSlides.length > 0){
    		for(; j < persistedSlides.length; j ++){
        		if(j < persistedSlides.length){
        			slide = persistedSlides[j];
        			slide.slideIndex = (j + 1);
        			allSlides.push(slide);
        		}
        	}
    	}
    	
    	if(deletedSlides.length > 0){
    		for(i = 0; j < this.slides.length; j ++){
    			
        		slide = deletedSlides[i];
    			slide.slideIndex = (j + 1);
    			allSlides.push(slide);
    			i++;
        	}
    	}
    	
    	this.slides = allSlides;
    	
    },

    
 // Model -------------------------------------------------------------------------------

    /**
     * Creates a new slide. The view is not updated.
     * @private
     * @return {CQ.form.Slideshow.Slide} The slide
     */
    createSlide: function(data, slideIndex, basePath) {
        // todo parameter names should not be hardcoded (but the SWF currently requires it)
        var title = (data ? data[this.config.titleFieldName] : null);
        var fileRef = (data ? data["fileReference"] : null);
        var imageCrop = (data ? data["imageCrop"] : null);
        var imageMap = (data ? data["imageMap"] : null);
        var imageRotate = (data ? data["imageRotate"] : null);
        var isProcessed = false;
        if(imageCrop || imageMap || (imageRotate && imageRotate != "0") ){
        	isProcessed = true;
        }
        
        
        var slide;
        if (data) {
        	var referencedFileInfo = null;
        	if(fileRef){
        		referencedFileInfo = this.resolveReference(fileRef, basePath);
        	}
            // add existing slide
            
        	slide = new CQ.form.NamedSlide({
                "referencedFileInfo": referencedFileInfo,
                "title": title,
                "slideIndex": slideIndex,
                "isPersistent": true,
                "isDeleted": false,
                "isProcessed": isProcessed,
                "mapValue": imageMap,
                "cropValue": imageCrop,
                "rotateValue": imageRotate
            });
            
            var formValues = this.footPanel.getFormValuesFromData(data);
            slide.formValues = formValues;
        } else {
            // create new slide
            slide = new CQ.form.NamedSlide({
                "referencedFileInfo": null,
                "title": null,
                "slideIndex": slideIndex,
                "isPersistent": false,
                "isDeleted": false,
                "isProcessed": false,
                "mapValue": null,
                "cropValue": null,
                "rotateValue": null
            });
            
            slide.formValues = null;
            this.processedRefImage = null;
    		this.originalRefImage = null;
    		this.footPanel.resetFormValues();
            
        }
        this.slides.push(slide);
        return slide;
    },
    
    /**
     * Sets the value of the field using the given record. If no according value
     * exists the default value is set. This method is usually called by
     * {@link CQ.Dialog#processRecords}.
     * @param {CQ.Ext.data.Record} record The record
     * @param {String} path The content path the record was created from (used for resolving
     *        relative file paths)
     */
    processRecord: function(record, path) {
        if (this.fireEvent('beforeloadcontent', this, record, path) !== false) {
            this.dataPath = path;
            this.slides.length = 0;
            this.headPanel.enableFormElements();
            this.footPanel.enableFormElements();

            // initialize only, as record processing for this dynamic widget is handled
            // completely different
            CQ.form.NamedSlideshow.superclass.processPath.call(this, path);

            // parse all slides from record
            // todo use a better implementation after slideshow.swf has been updated
            var initialPrefix = this.fileReferencePrefix.replace("./", "");
            var prefixes = initialPrefix.split("/");
            var dataNodeName = prefixes[0];
            var prefix = prefixes[1];
            
            var placeholderPos = prefix.indexOf("$");
            var prefixLen = prefix.length;
            var part1 = prefix;
            var part2 = null;
            var hasPlaceholder = (placeholderPos >= 0);
            if (placeholderPos == 0) {
                part1 = null;
                part2 = prefix.substring(1, prefixLen);
            } else if (placeholderPos > 0) {
                if (placeholderPos < (prefixLen - 1)) {
                    part1 = prefix.substring(0, placeholderPos);
                    part2 = prefix.substring(placeholderPos + 1, prefixLen);
                } else {
                    part1 = prefix.substring(0, placeholderPos);
                    part2 = null;
                }
            }

            var data = record.data[dataNodeName];
            for (var key in data) {
                if (hasPlaceholder) {
                    var isMatching = true;
                    var indexPos;
                    var part2Pos = key.length;
                    if (part1 != null) {
                        if (key.indexOf(part1) == 0) {
                            indexPos = part1.length;
                        } else {
                            isMatching = false;
                        }
                    }
                    if ((part2 != null) && isMatching) {
                        part2Pos = key.indexOf(part2, indexPos);
                        if (part2Pos > indexPos) {
                            if ((part2Pos + part2.length) < key.length) {
                                isMatching = false;
                            }
                        } else {
                            isMatching = false;
                        }
                    }
                    if (isMatching) {
                        this.createSlide(
                        		data[key], key.substring(indexPos, part2Pos), path);
                    }
                } else if (key == part1) {
                    this.createSlide(data[key], 1, path);
                }
            }

            // select slide to edit
            this.editedSlide = this.getFirstSlide();
            if (!this.editedSlide) {
                this.addNewSlide();
            }else{
            	this.showSlide(this.editedSlide);
            }


            // initialize combobox
            this.buildComboBoxContent();

            this.fireEvent('loadcontent', this, record, path);
        }
    },

    /**
     * Saves changes made in the UI to the underlying data model.
     * @private
     */
    saveChanges: function(saveToolValues) {
        if (this.editedSlide) {
            var title = this.footPanel.getTitle();
            this.editedSlide.referencedFileInfo = this.referencedFileInfo;
            this.editedSlide.title = (title ? title : null);
            var formValues = this.footPanel.getFormValues();
            this.editedSlide.formValues = formValues;

            if(title && saveToolValues == true){
            	this.setToolValues();
            }

            this.headPanel.updateSlide(this.editedSlide);
        }
    },

    /**
     * <p>Gets the tool values.</p>
     * <p>All form fields are adjusted accordingly. Registered tools are synchronized, too.
     * </p>
     * @private
     */
    setToolValues: function() {
        // sync tools
        var toolCnt = this.imageToolDefs.length;
        var isMapped = false;
        var isCropped = false;
        var isRotated = false;

        for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
            var toolToProcess = this.imageToolDefs[toolIndex];
            toolToProcess.transferToField();
            var key = toolToProcess.toolName;
            var value = toolToProcess.transferField.getValue();


            if(key == "Map"){
            	this.editedSlide.mapValue = value;
            	isMapped = (value?true:false);
            } else if(key == "Crop") {
            	this.editedSlide.cropValue = value;
            	isCropped = (value?true:false);
            } else if(key == "Rotate") {
            	this.editedSlide.rotateValue = value;
            	isRotated = (value != "0");
            }

        }

        if(isMapped || isCropped || isRotated ) {
        	this.isProcessed = true;
        	this.editedSlide.isProcessed = true;
        }

        this.slides[this.editedSlideIndex] = this.editedSlide;

    },

 // View --------------------------------------------------------------------------------

    /**
     * Build the selector's entries.
     * @private
     */
    buildComboBoxContent: function() {
        var data = [ ];
        for (var i = 0; i < this.slides.length; i++) {
            var slide = this.slides[i];
            if (!slide.isDeleted) {
                data.push({
                    "value": slide,
                    "text": slide.createDisplayText()
                });
            }
        }
        this.headPanel.setInitialComboBoxContent(data);
        this.headPanel.select(this.editedSlide);
    },

    prepeareForNextSlide: function() {
    	this.flushImage(true);
		this.notifyToolsOnFlush();

    },

    /**
     * Shows the specified slide.
     * @param {CQ.form.NamedSlide} slide The slide to be shown
     * @private
     */
    showSlide: function(slide) {
    	
    	this.currentMapValue = (slide.mapValue ? slide.mapValue : null);
        this.currentCropValue = (slide.cropValue ? slide.cropValue : null);
        this.currentRotateValue = (slide.rotateValue ? slide.rotateValue : null);

        this.referencedFileInfo = slide.referencedFileInfo;
        this.footPanel.setTitle(slide.title);
        this.footPanel.setFormValues(slide.formValues);
        this.footPanel.doLayout();
        
		if (this.originalRefImage != null) {
            this.fireEvent("statechange", "originalremoved", false);
        }
        this.originalRefImage = null;
        if (this.processedRefImage != null) {
            this.fireEvent("statechange", "processedremoved", false);
        }
        this.processedRefImage = null;
        var processedImageConfig = null;
        this.fireEvent("beforeloadimage", this);
		
		if (this.referencedFileInfo) {
			//this.flushImage();
			//this.notifyToolsOnFlush();
			
			this.originalRefImage = new CQ.form.SmartImage.Image({
                "dataPath": this.referencedFileInfo.dataPath,
                "url": this.referencedFileInfo.dataPath + "/jcr:content/renditions/cq5dam.web.1280.1280.jpeg",
                "fallbackUrl": this.referencedFileInfo.dataPath + "/jcr:content/renditions/original"
            });
			this.notifyImageLoad(this.originalRefImage);
			
			processedImageConfig =
                    this.createProcessedImageConfig(this.referencedFileInfo.dataPath);
			var url = processedImageConfig.url;
			url = url.replace(".img.png", "/"+this.fileReferencePrefix.replace('$','')+slide.slideIndex+".img.png");
			processedImageConfig = {"url" : url};
			if (slide.isProcessed && slide.isPersistent) {
				
                this.processedRefImage =
                        new CQ.form.SmartImage.Image(processedImageConfig);
                this.notifyImageLoad(this.processedRefImage);
            }
			
			this.originalRefImage.loadHandler = function() {
                this.hideTools();
                var toolCnt = this.imageToolDefs.length;
                for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                    this.imageToolDefs[toolIndex].onImageUploaded(this.originalRefImage);
                }
                //this.syncFormElements();
                this.updateView();
            }.createDelegate(this);
			this.originalRefImage.load();
            if (slide.isProcessed && slide.isPersistent) {
				this.processedRefImage.loadHandler = function() {
					//this.notifyToolsOnFlush();
					this.hideTools();
					var toolCnt = this.imageToolDefs.length;
					for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
						this.imageToolDefs[toolIndex].onImageUploaded(this.processedRefImage);
					}
					this.toolSelector.items.items[0].toolRef.initialValue = this.currentMapValue;
					this.toolSelector.items.items[1].toolRef.initialValue = this.currentCropValue;
					
					var rotation = "0";
					if(this.currentRotateValue && this.currentRotateValue != "0"){
						rotation = this.currentRotateValue;
					}
					this.toolSelector.items.items[2].toolRef.preRotation = parseInt(rotation);
					
					//this.syncFormElements();
					this.updateView();
				}.createDelegate(this);
                this.processedRefImage.load();
                this.updateView();
                
            }
		} else {
            this.originalRefImage = null;
            this.processedRefImage = null;
            this.updateView();
        }
		
		this.fireEvent('loadcontent', this);
    },
    
    isSlideUnique: function(){
    	var isUnique = true;
    	var currentSlideTitle = this.footPanel.getTitle();
    	
    	var selector = this.headPanel.items.get("slideSelector").items.get("selector");
        var store = selector.comboBox.store;
        var rowCnt = store.getTotalCount();
        for (var row = 0; row < rowCnt; row++) {
            var rowData = store.getAt(row);
            if (rowData.get("text") == currentSlideTitle) {
            	isUnique = false;
    			break;
            }
        }
    	
    	return isUnique;
    }


});

 /**
  * The default function providing the path to the processed image. See also
  * {@link CQ.form.SmartSlides#pathProvider pathProvider}. Assembles and returns the path of
  * the image.
  * @static
  * @param {String} path The content path
  * @param {String} requestSuffix The configured request suffix (replaces extension)
  * @param {String} extension The original extension
  * @param {CQ.data.SlingRecord} record The data record
  * @return {String} The URL
  */
CQ.form.SmartSlides.defaultPathProvider = function(path, requestSuffix, extension, record) {
    if (!requestSuffix) {
        return null;
    }
    return CQ.HTTP.externalize(path + requestSuffix);
};

// register xtype
CQ.Ext.reg('smartslides', CQ.form.SmartSlides);
