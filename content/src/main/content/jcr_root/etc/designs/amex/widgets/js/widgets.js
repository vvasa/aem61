/*
* The Linkfield widget represents the possibility of 4 different types of
* links: Internal, External, Phone, and Email.  The link is defined via a
* select type selection widget.  The display text is defined via a
* textfield widget.  The link is defined via a pathfield.  Specific link
* information is stored as a JSON object of the form:
*  {type:"", url:"", text:""}
*/
CQ.form.LinkField = CQ.Ext.extend(CQ.form.CompositeField, {
    /*
    * hiddenField stores the information related to the link.
    */
    hiddenField:null,
    linkType:null,
    linkText:null,
    linkURL:null,
    formPanel:null,

    constructor:function(config){
        config = config || {};
        var defaults = {
            "border":true,
            "layout":"form",
            "monitorResize":true
        };
        config = CQ.Util.applyDefaults(config, defaults);
        CQ.form.LinkField.superclass.constructor.call(this, config);
    },

    initComponent:function(){
        CQ.form.LinkField.superclass.initComponent.call(this);

        this.hiddenField = new CQ.Ext.form.Hidden({
            name:this.name
        });

        this.add(this.hiddenField);

        this.linkType = new CQ.form.Selection({
            cls:"customwidget-1",
            hideLabel:false,
            type:"select",
            fieldLabel:"Link Type: ",
            fieldDescription:"Select link type",
            anchor:'100%',
            options:[
                {
                    value:"link",
                    text:"Hyperlink"
                },
                {
                    value:"email",
                    text:"Email Address"
                },
                {
                    value:"phone",
                    text:"Phone Number"
                }
            ],
            defaultValue:"internal",
            listeners:{
                selectionchanged:{
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });

        this.add(this.linkType);
        
        this.linkText = new CQ.Ext.form.TextField({
            cls:"customwidget-2",
            hideLabel:false,
            fieldLabel:"Link Text :",
            fieldDescription:"If empty link will be displayed",
            anchor:'100%',
            listeners:{
                change:{
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });

        this.add(this.linkText);

        this.linkURL = new CQ.form.PathField({
            cls:"customwidget-3",
            hideLabel:false,
            fieldLabel:"Link :",
            fieldDescription:"Enter or select the link, phone number, or email address",
            anchor:'100%',
            listeners:{
                change:{
                    scope:this,
                    fn:this.updateHidden
                },
                dialogclose:{
                    scope:this,
                    fn:this.updateHidden
                }
            }
        });

        this.add(this.linkURL)
    },

    processinit: function(path,record){
        this.linkType.processInit(path,record);
        this.linkText.processInit(path,record);
        this.linkURL.processInit(path,record);
    },

    setValue:function(value){
        var link = JSON.parse(value);
        this.linkType.setValue(link.type);
        this.linkText.setValue(link.text);
        this.linkURL.setValue(link.url);
        this.hiddenField.setValue(value);
    },

    getValue:function(){
        var link = {
            "type":this.linkType.getValue(),
            "url":this.linkURL.getValue(),
            "text":this.linkText.getValue()
        };
        return JSON.stringify(link);
    },

    updateHidden:function(){
        this.hiddenField.setValue(this.getValue());
    }
});

CQ.Ext.reg("linkfield", CQ.form.LinkField);