CUI.rte.commands.HCPList = new Class({

    toString: "HCPList",

    extend: CUI.rte.commands.Command,

    isCommand: function(cmdStr) {
        var cmdStrLC = cmdStr.toLowerCase();
        return (cmdStrLC == "insertkeypoints") || (cmdStrLC == "insertliststriped") || (cmdStrLC == "insertliststripedlistnumbered") || (cmdStrLC == "insertliststripedhorizontal");
    },

    getProcessingOptions: function() {
        var cmd = CUI.rte.commands.Command;
        return cmd.PO_SELECTION | cmd.PO_BOOKMARK | cmd.PO_NODELIST;
    },

    /**
     * Gets all list items of the current selection. Using this method will not include
     * items of a nested list if a nested list is completely covered in the selection.
     * @private
     */
    getListItems: function(execDef) {
        var context = execDef.editContext;
        return execDef.nodeList.getTags(context, [ {
                "extMatcher": function(dom) {
                    return {
                        "isMatching": CUI.rte.Common.isTag(dom, "li"),
                        "preventRecursionIfMatching": true
                    };
                }
            }
        ], true, true);
    },

    /**
     * Gets all list items of the current selection. Using this method will include
     * items of a nested list as well.
     * @private
     */
    getAllListItems: function(execDef) {
        var context = execDef.editContext;
        var allItems = execDef.nodeList.getTags(context, [ {
                "matcher": function(dom) {
                    return CUI.rte.Common.isTag(dom, "li");
                }
            }
        ], true, true);
        CUI.rte.ListUtils.postprocessSelectedItems(allItems);
        return allItems;
    },

    /**
     * Gets the defining list element for the specified node list. The defining list element
     * is the list element that belongs to the first node contained in the list.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {CUI.rte.NodeList} nodeList The node list
     * @return {HTMLElement} The defining list DOM; null if the first node of the list
     *         is not part of a list
     */
    getDefiningListDom: function(context, nodeList) {
        var com = CUI.rte.Common;
        var determNode = nodeList.getFirstNode();
        if (determNode == null) {
            return null;
        }
        var determDom = determNode.dom;
        while (determDom) {
            if (com.isTag(determDom, com.LIST_TAGS)) {
                return determDom;
            }
            determDom = com.getParentNode(context, determDom);
        }
        return null;
    },

    /**
     * Splits the specified array of list items into separate arrays of items for each
     * top-level list.
     * @private
     */
    splitToTopLevelLists: function(execDef, listItems) {
        var context = execDef.editContext;
        var itemsPerList = [ ];
        var topLevelLists = [ ];
        var itemCnt = listItems.length;
        for (var i = 0; i < itemCnt; i++) {
            var itemToCheck = listItems[i];
            var listDom = CUI.rte.ListUtils.getTopListForItem(context, itemToCheck.dom);
            var listIndex = CUI.rte.Common.arrayIndex(topLevelLists, listDom);
            if (listIndex < 0) {
                topLevelLists.push(listDom);
                itemsPerList.push([ itemToCheck ]);
            } else {
                itemsPerList[listIndex].push(itemToCheck);
            }
        }
        return itemsPerList;
    },

    /**
     * Changes the list type of all selected list items, inserting additional tables
     * as required.
     * @private
     */
    changeItemsListType: function(execDef, listItems, listType, listClass) {
        var com = CUI.rte.Common;
        var context = execDef.editContext;
        var itemCnt = listItems.length;
        for (var i = 0; i < itemCnt; i++) {
            var item = listItems[i].dom;
            var list = item.parentNode;
            if (!com.isTag(list, listType)) {
                // Change item ...
                var prevSib = list.previousSibling;
                var nextSib = list.nextSibling;
                var isFirst = (com.getChildIndex(item) == 0);
                var isLast = (com.getChildIndex(item) == (list.childNodes.length - 1));
                if (isFirst && prevSib && com.isTag(prevSib, listType)) {
                    // move to preceding list of correct type
                    list.removeChild(item);
                    prevSib.appendChild(item);
                    if (list.childNodes.length == 0) {
                        list.parentNode.removeChild(list);
                    }
                } else if (isLast && nextSib && com.isTag(nextSib, listType)) {
                    // move to succeeding list of correct type
                    list.removeChild(item);
                    com.insertBefore(nextSib, item, nextSib.firstChild);
                    if (list.childNodes.length == 0) {
                        list.parentNode.removeChild(list);
                    }
                } else {
                    // we need a new list
                    var newList = context.createElement(listType);
                    if (item == list.firstChild) {
                        // create new list before existing list
                        com.insertBefore(list.parentNode, newList, list);
                    } else if (item == list.lastChild) {
                        // create new list after existing list
                        com.insertBefore(list.parentNode, newList, list.nextSibling);
                    } else {
                        // split list
                        var splitList = list.cloneNode(false);
                        com.insertBefore(list.parentNode, splitList, list);
                        com.insertBefore(list.parentNode, newList, list);
                        while (list.childNodes[0] != item) {
                            var domToMove = list.childNodes[0];
                            list.removeChild(domToMove);
                            splitList.appendChild(domToMove);
                        }
                    }
                    list.removeChild(item);
                    newList.appendChild(item);
                    if (list.childNodes.length == 0) {
                        list.parentNode.removeChild(list);
                    }
                }
            }
        }
    },

    /**
     * Creates a new list from all (allowed) block nodes defined in the selection.
     * @private
     */
    createListFromSelection: function(execDef, listType, listClass) {
        var nodeList = execDef.nodeList;
        var context = execDef.editContext;
        // todo distinguish between entire cell and parts of a cell
        var blockLists = nodeList.getEditBlocksByAuxRoots(context, true);
        var listCnt = blockLists.length;
        for (var l = 0; l < listCnt; l++) {
            CUI.rte.DXPListUtils.createList(context, blockLists[l], listType, listClass);
        }
    },

    /**
     * Removes items from a list by appending them to their respective parent item
     * (including a separating "br" line break).
     * @private
     */
    unlistItems: function(execDef, listItems, keepStructure) {
        if (!listItems) {
            listItems = this.getAllListItems(execDef);
        }
        var context = execDef.editContext;
        var itemCnt = listItems.length;
        var itemsDom = [ ];
        for (var i = 0; i < itemCnt; i++) {
            itemsDom.push(listItems[i].dom);
        }
        CUI.rte.ListUtils.unlistItems(context, itemsDom, keepStructure);
    },


    execute: function(execDef) {
        var com = CUI.rte.Common;
        var context = execDef.editContext;
        var nodeList = execDef.nodeList;
        var command = execDef.command;
        var value = execDef.value;
        var listType = "ul";
        var listClass = null;
        switch (command.toLowerCase()) {
            case "insertkeypoints":
                listClass = "key-points"
                break;
            case "insertliststriped":
                listClass = "list-striped"
                break;
            case "insertliststripedlistnumbered":
                listClass = "list-striped list-numbered"
                break;
            case "insertliststripedhorizontal":
                listClass = "list-striped-horizontal"
                break;                
        }
        if (listType) {
            var listItems;
            var refList = this.getDefiningListDom(context, nodeList);
            if (refList == null) {
                // creating new list (and joining existing lists)
                this.createListFromSelection(execDef, listType, listClass);
            } else if (!com.isTag(refList, listType)) {
                // change list type of selected items (or entire list)
                listItems = this.getListItems(execDef);
                this.changeItemsListType(execDef, listItems, listType, listClass);
            } else {
                // unlist all items of lead list
                listItems = this.getAllListItems(execDef);
                if (listItems.length > 0) {
                    var itemsByList = this.splitToTopLevelLists(execDef, listItems);
                    var listCnt = itemsByList.length;
                    for (var l = 0; l < listCnt; l++) {
                        listItems = itemsByList[l];
                        this.unlistItems(execDef, listItems, value === true);
                    }
                }
            }
        }
    },

    queryState: function(selectionDef, cmd) {
        var com = CUI.rte.Common;
        var context = selectionDef.editContext;
        var nodeList = selectionDef.nodeList;
        var tagName = "ul";
        switch (cmd.toLowerCase()) {
	        case "insertkeypoints":
	            listClass = "key-points"
	            break;
	        case "insertliststriped":
	            listClass = "list-striped"
	            break;
	        case "insertliststripedlistnumbered":
	            listClass = "list-striped list-numbered"
	            break;
	        case "insertliststripedhorizontal":
	            listClass = "list-striped-horizontal"
	            break;                 
        }
        var definingList = this.getDefiningListDom(context, nodeList);
        return ((definingList != null) && com.isTag(definingList, tagName) && $(definingList).hasClass(listClass));
    }

});

/**
 * Placeholder for "no list functionality available"
 */
CUI.rte.commands.HCPList.NO_LIST_AVAILABLE = new Object();


// register command
CUI.rte.commands.CommandRegistry.register("_hcplist", CUI.rte.commands.HCPList);