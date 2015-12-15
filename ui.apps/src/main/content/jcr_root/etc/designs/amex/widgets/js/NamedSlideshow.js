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
 * @class CQ.form.Slideshow
 * @extends CQ.form.SmartImage
 * <p>The Slideshow provides a component that can be used to define and edit a set of images
 * and image titles that may be viewed as a slideshow.</p>
 * <p>The Slideshow component is based upon the {@link CQ.form.SmartImage} component, but
 * currently does only allow image references (the upload feature is disabled).</p>
 * @constructor
 * Creates a new Slideshow.
 * @param {Object} config The config object
 */
CQ.form.NamedSlideshow = CQ.Ext.extend(CQ.html5.form.SmartImage, {

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
     * @cfg {Boolean} hideMainToolbar
     * <code>true</code> to hide the main toolbar (the one under the actual picture;
     * defaults to true)
     */
    /**
     * @cfg {Boolean} allowUpload
     * Flag if uploading a file is allowed (defaults to false as of CQ 5.3). You should
     * not change this setting, as currently only file references are supported by the
     * Slideshow widget. Note that this property defaulted to true for CQ 5.2 and has
     * therefore to be set to false explicitly for the widget to work properly on 5.2.
     */

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

    constructor: function(config) {

        config = config || { };
        var defaults = {
            "headPanel": new CQ.form.NamedSlidesPanel({
                "onSlideChanged": this.onSlideChanged.createDelegate(this),
                "onAddButton": this.onAddButton.createDelegate(this),
                "onRemoveButton": this.onRemoveButton.createDelegate(this)
            }),
            "footPanel": new CQ.form.NamedTitlePanel(config.options),
            "fileReferencePrefix": "./image$",
            "hideMainToolbar": true,
            "allowReference": true,
            "allowUpload": false
        };

        CQ.Util.applyDefaults(config, defaults);
        CQ.form.NamedSlideshow.superclass.constructor.call(this, config);

        this.slides = [ ];
    },

    /**
     * Initializes the component.
     * @private
     */
    initComponent: function() {
        CQ.form.NamedSlideshow.superclass.initComponent.call(this);
    },

    /**
     * Handles workarounds for some browser issues after the component has been rendered.
     * @private
     */
    afterRender: function() {
        CQ.form.NamedSlideshow.superclass.afterRender.call(this);
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


    // Form interface ----------------------------------------------------------------------

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
        this.saveChanges();
        this.removeOldInterface();
        this.createInterface(this.el);
        return true;
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
                maxSlideIndex = this.slides[index].slideIndex;
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
        this.saveChanges();
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
            var firstSlide = this.getFirstSlide();
            if (!firstSlide) {
                this.addNewSlide();
            } else {
                this.editedSlide = firstSlide;
                this.showSlide(this.editedSlide);
            }
        }
    },


    // Model -------------------------------------------------------------------------------

    /**
     * Creates a new slide. The view is not updated.
     * @private
     * @return {CQ.form.Slideshow.Slide} The slide
     */
    createSlide: function(data, slideIndex, basePath) {
        // todo parameter names should not be hardcoded (but the SWF currently requires it)
        var title = (data ? data["jcr:title"] : null);
        var fileRef = (data ? data["fileReference"] : null);
        var slide;
        if (data && fileRef) {
            // add existing slide
            var referencedFileInfo = this.resolveReference(fileRef, basePath);
            if (referencedFileInfo) {
                slide = new CQ.form.NamedSlide({
                    "referencedFileInfo": referencedFileInfo,
                    "title": title,
                    "slideIndex": slideIndex,
                    "isPersistent": true,
                    "isDeleted": false
                });
            }
        } else {
            // create new slide
            slide = new CQ.form.NamedSlide({
                "referencedFileInfo": null,
                "title": null,
                "slideIndex": slideIndex,
                "isPersistent": false,
                "isDeleted": false
            });
        }
        this.slides.push(slide);
        return slide;
    },


    /**
     * Inits processing the record
     * @param {String} path The content path of the slideshow instance being edited
     * @private
     */
    // todo: remove if definitely not needed; otherwise try to move to initComponent or render listener
//    processPath: function(path) {
//        this.dataPath = path;
//        this.slides.length = 0;
//        this.headPanel.enableFormElements();
//        this.footPanel.enableFormElements();
//        CQ.form.Slideshow.superclass.processPath.call(this, path);
//
//        // create default slide
//        this.slides.length = 0;
//        this.addNewSlide();
//        this.showSlide(this.editedSlide);
//
//        this.buildComboBoxContent();
//    },

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
            var prefix = this.fileReferencePrefix.replace("./", "");
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

            var data = record.data;
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
                                record.get(key), key.substring(indexPos, part2Pos), path);
                    }
                } else if (key == part1) {
                    this.createSlide(record.get(key), 1, path);
                }
            }

            // select slide to edit
            this.editedSlide = this.getFirstSlide();
            if (!this.editedSlide) {
                this.addNewSlide();
            }
            this.showSlide(this.editedSlide);

            // initialize combobox
            this.buildComboBoxContent();

            this.fireEvent('loadcontent', this, record, path);
        }
    },

    /**
     * Saves changes made in the UI to the underlying data model.
     * @private
     */
    saveChanges: function() {
        if (this.editedSlide) {
            var title = this.footPanel.getTitle();
            this.editedSlide.referencedFileInfo = this.referencedFileInfo;
            this.editedSlide.title = (title ? title : null);
            this.headPanel.updateSlide(this.editedSlide);
        }
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

    /**
     * Shows the specified slide.
     * @param {CQ.form.NamedSlide} slide The slide to be shown
     * @private
     */
    showSlide: function(slide) {
        this.referencedFileInfo = slide.referencedFileInfo;
        this.footPanel.setTitle(slide.title);
        if (this.referencedFileInfo) {
            this.originalRefImage = new CQ.form.SmartImage.Image(this.referencedFileInfo);
            this.originalRefImage.loadHandler = function() {
                this.hideTools();
                var toolCnt = this.imageToolDefs.length;
                for (var toolIndex = 0; toolIndex < toolCnt; toolIndex++) {
                    this.imageToolDefs[toolIndex].onImageUploaded(this.originalRefImage);
                }
                this.updateView();
            }.createDelegate(this);
            this.originalRefImage.load();
        } else {
            this.originalRefImage = null;
            this.updateView();
        }
    },


    // Handler -----------------------------------------------------------------------------

    /**
     * Handler that reacts on changes in the slide selector component.
     * @param {CQ.form.Slideshow.Slide} slide The newly selected slide
     * @private
     */
    onSlideChanged: function(slide) {
        this.saveChanges();
        this.editedSlide = slide;
        if (this.editedSlide) {
            this.showSlide(this.editedSlide);
        }
    },

    /**
     * Handler that reacts on clicking the "Add" button.
     * @private
     */
    onAddButton: function() {
        this.addNewSlide();
        this.buildComboBoxContent();
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
    }

});

// register xtype
CQ.Ext.reg('namedslideshow', CQ.form.NamedSlideshow);