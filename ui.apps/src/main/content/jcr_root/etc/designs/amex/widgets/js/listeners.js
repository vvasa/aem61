dxpListeners = {
	manageTitleFields : function(component) {
		if (component && component.getValue()) {

            var panel = component.findParentByType('panel');

            var titleTagType=panel.getComponent('dxpTagTypeField');

            var titleField = panel.getComponent('dxpTitleField');

            if (component.getValue() === 'title'){
                titleTagType.hide();
                titleField.label.dom.childNodes[0].nodeValue = "Title";

            } else if (component.getValue() === 'subtitle'){
                titleTagType.show();
                titleField.label.dom.childNodes[0].nodeValue = "Subtitle";

            }
		}
	},
	
	 manageTelephoneLink : function(component) {
		if (component && component.getValue()) {
            var panel = component.findParentByType('panel');

            var enableTelephoneLink=panel.getComponent('dxpTelephoneLink');

            if (component.getValue() == 'phoneNumber'){
                enableTelephoneLink.show();

            } else {
                enableTelephoneLink.hide();
         }
		}
	},
    manageMultiLine : function(component) {
		if (component && component.getValue()) {
            var panel = component.findParentByType('panel');

            var enableButton2Text=panel.getComponent('textCalloutButton2Text');
			var enableButton2Link=panel.getComponent('textCalloutButton2Link');
            if (component.getValue() == 'multipleLine'){
                enableButton2Text.hide();
				enableButton2Link.hide();

            } else {
                enableButton2Text.show();
				enableButton2Link.show();
         }
		}
	},
	managedefaultmessage : function(component) {
		if (component && component.getValue()) {
            var panel = component.findParentByType('panel');
            var enableMessageText=panel.getComponent('defaultmessage');
            var enableEmptyMessageText=panel.getComponent('emptymessage');
            if (component.getValue() == 'true'){
                enableMessageText.hide();
                enableEmptyMessageText.show();
            } else {
                enableMessageText.show();
                enableEmptyMessageText.hide();
         }
		}
	},

	// manageLinkFields : function(component) {

	// 	if (component && component.getValue()) {
	// 		var linkType = component.find('type','select');

	// 		linkType[0].setOptions([{
 //                    value:"internal",
 //                    text:"Internal Link"
 //                },
 //                {
 //                    value:"external",
 //                    text:"External Link"
 //                }]);
	// 	}
	// }
	manageAutoScroll : function(component) {
		if (component && component.getValue()) {


            var panel = component.findParentByType('panel');

            var playSpeed=panel.getComponent('dxpPlaySpeed');

            var transitionTime = panel.getComponent('dxpTransitionTime');

            if (component.getValue() == 'true'){

                playSpeed.show();
				transitionTime.show();

            } else if (component.getValue() != 'true'){

                 playSpeed.hide();
				transitionTime.hide();
            }
		}
	},
	 manageMediaTileFields : function(component) {
			if (component && component.getValue()) {

	            var panel = component.findParentByType('panel');

	           var mediaTileTitle=panel.getComponent('dxpMediaTileTitle');

	            var mediaTileShortDescription = panel.getComponent('dxpMediaTileShortDescription');
				var mediaTileLongDescription = panel.getComponent('dxpMediaTileLongDescription');
	            if (component.getValue() === "internal"){

	                mediaTileTitle.hide();
					mediaTileShortDescription.hide();
	                mediaTileLongDescription.hide();

	            } else{

	                 mediaTileTitle.show();
					mediaTileShortDescription.show();
	                mediaTileLongDescription.show();

	            }
			}
		}

	}