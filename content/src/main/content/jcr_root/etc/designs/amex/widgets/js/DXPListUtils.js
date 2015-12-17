
/**
 * @class CUI.rte.DXPListUtils
 * @static
 * @private
 * The DXPListUtils provides utility functions for handling lists.
 */
CUI.rte.DXPListUtils = function() {

    var com = CUI.rte.Common;

    var dpr = CUI.rte.DomProcessor;

    return {

        // --- selection-related stuff -----------------------------------------------------

        postprocessSelectedItems: CUI.rte.ListUtils.postprocessSelectedItems,


        // --- processing-related stuff ----------------------------------------------------

        /**
         * <p>Creates a new list from the specified list of edit blocks.</p>
         * <p>This method handles auxiliary root correctly by adding their content as
         * separate lists.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement[]} blockList List with edit blocks to be used for creating
         *        the list
         * @param {String} listType The list type ("ul", "ol")
         */
        createList: function(context, blockList, listType, listClass) {
            var lut = CUI.rte.DXPListUtils;
            // preprocess if a table cell is reported as the only edit block
            if ((blockList.length == 1) && com.isTag(blockList[0], com.TABLE_CELLS)) {
                var tempBlock = context.createElement("div");
                com.moveChildren(blockList[0], tempBlock);
                blockList[0].appendChild(tempBlock);
                blockList[0] = tempBlock;
            }
            // simplify block list by using lists instead of their respective list items
            var blockCnt = blockList.length;
            for (var b = 0; b < blockCnt; b++) {
                if (com.isTag(blockList[b], "li")) {
                    var listNode = blockList[b].parentNode;
                    blockList[b] = listNode;
                    for (var b1 = 0; b1 < b; b1++) {
                        if (blockList[b1] == listNode) {
                            blockList[b] = null;
                            break;
                        }
                    }
                }
            }
            // common list creation
            var listDom = context.createElement(listType);
            listDom.className = listClass;
            blockCnt = blockList.length;
            for (b = 0; b < blockCnt; b++) {
                var blockToProcess = blockList[b];
                if (blockToProcess) {
                    var mustRecurse = com.isTag(blockToProcess, dpr.AUXILIARY_ROOT_TAGS);
                    if (!mustRecurse) {
                        if (listDom.childNodes.length == 0) {
                            // first, insert the list
                            blockToProcess.parentNode.insertBefore(listDom, blockToProcess);
                        }
                        if (!com.isTag(blockToProcess, com.LIST_TAGS)) {
                            // normal blocks
                            var listItemDom = context.createElement("li");
                            listDom.appendChild(listItemDom);
                            com.moveChildren(blockToProcess, listItemDom, 0, true);
                            blockToProcess.parentNode.removeChild(blockToProcess);
                        } else {
                            // pre-existing list
                            com.moveChildren(blockToProcess, listDom, 0, true);
                            blockToProcess.parentNode.removeChild(blockToProcess);
                        }
                    } else {
                        // create list recursively
                        var subBlocks = [ ];
                        var sbCnt = blockToProcess.childNodes.length;
                        for (var c = 0; c < sbCnt; c++) {
                            var subBlock = blockToProcess.childNodes[c];
                            if (com.isTag(subBlock, com.EDITBLOCK_TAGS)) {
                                subBlocks.push(subBlock);
                            } else if (com.isTag(com.BLOCK_TAGS)) {
                                // todo nested tables
                            }
                        }
                        if (subBlocks.length == 0) {
                            subBlocks.push(blockToProcess);
                        }
                        lut.createList(context, subBlocks, listType);
                        // start a new list if a non-listable tag has been encountered
                        listDom = context.createElement(listType);
                    }
                }
            }
            // check if we can join adjacent lists
            var prevSib = listDom.previousSibling;
            if (prevSib && com.isTag(prevSib, listType)) {
                com.moveChildren(listDom, prevSib, 0, true);
                listDom.parentNode.removeChild(listDom);
                listDom = prevSib;
            }
            var nextSib = listDom.nextSibling;
            if (nextSib && com.isTag(nextSib, listType)) {
                com.moveChildren(nextSib, listDom, 0, true);
                nextSib.parentNode.removeChild(nextSib);
            }
        },

        /**
         * Converts the specified list item (which must be part of a top-level list) to
         * a edit block of the specified type.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} liDom The list item to be converted
         * @param {String} tagName The edit block tag to convert the item to
         * @param {Object} attribs Attribute definition for the edit block tag
         */
        convertListItem: CUI.rte.ListUtils.convertListItem,

        /**
         * <p>Gets the list item (if available) the specified DOM element is contained in.
         * </p>
         * <p>If the specified DOM element is a list item, the DOM element (and not its
         * "super item") is returned.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element to determine the list item for
         * @return {HTMLElement} The respective list item; null if the DOM element is not
         *         contained in a list item
         */
        getItemForDom: CUI.rte.ListUtils.getItemForDom,

        /**
         * <p>Gets the list the specified list item is contained in.</p>
         * <p>The specified list item may be any DOM element of the corresponding list item.
         * If a list is specified as list item, the "super list" (if available) is returned.
         * </p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} itemDom The list item to determine the corresponding list
         *        for; null if the DOM element is not contained in a list
         */
        getListForItem: CUI.rte.ListUtils.getListForItem,

        /**
         * Gets the top-level list the specified DOM element is part of.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element
         * @return {HTMLElement} The top-level list element; null if the specified DOM
         *         element is not part of a list
         */
        getTopListForItem: CUI.rte.ListUtils.getTopListForItem,

        /**
         * Gets the nesting level of the specified DOM element.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element
         * @return {Number} Nesting level (0 for top-level list; -1 if the specified DOM
         *         element is not part of a list
         */
        getNestingLevel: CUI.rte.ListUtils.getNestingLevel,

        /**
         * Checks if the specified DOM element is part of a top-level list.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element
         * @return {Boolean} True if the DOM element is part of a top-level list
         */
        isTopLevelList: CUI.rte.ListUtils.isTopLevelList,

        /**
         * Checks if the specified DOM element is (part of) the very first list item of its
         * top-level list.
         * @param {CUI.rte.EditContext} context
         * @param {HTMLElement} dom The DOM element to check
         * @return {Boolean} true if the specified DOM element is the very first list item
         *         of its top-level list
         */
        isFirstListItem: CUI.rte.ListUtils.isFirstListItem,

        /**
         * Checks if the specified DOM element is (part of) the very last list item of its
         * top-level list.
         * @param {CUI.rte.EditContext} context
         * @param {HTMLElement} dom The DOM element to check
         * @return {Boolean} true if the specified DOM element is the very last list item
         *         of its top-level list
         */
        isLastListItem: CUI.rte.ListUtils.isLastListItem,

        /**
         * Moves the content of the specified list item to the specfied destination
         * element.
         * @param {HTMLElement} srcItem The list item to move content from
         * @param {HTMLElement} destDom The DOM element to move content to
         */
        moveItemContent: CUI.rte.ListUtils.moveItemContent,

        /**
         * Checks if the specified list item has content other than nested lists.
         * @param {HTMLElement} itemDom The DOM element representing the list item
         * @return {Boolean} True if the specified list item has content other than
         *         nested lists
         */
        hasItemContent: CUI.rte.ListUtils.hasItemContent,

        /**
         * <p>Checks if the specified list is empty.</p>
         * <p>A list is considered empty if it is actually empty or all items and nested
         * lists are empty.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} listDom The list's DOM element
         * @return {Boolean} True if the specified list is empty
         */
        isListEmpty: CUI.rte.ListUtils.isListEmpty,

        /**
         * Checks if the specified list item is empty (has no content or only empty
         * nested lists).
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The list item to check
         */
        isItemEmpty: CUI.rte.ListUtils.isItemEmpty,

        /**
         * Cleans up the specified list by removing empty list items (and empty nested
         * lists as well).
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} listDom The list to be cleaned
         * @param {Boolean} removeHelperAttribs True if helper attributes on list items have
         *        also to be removed
         */
        cleanUpList: CUI.rte.ListUtils.cleanUpList,

        /**
         * Checks if both specified DOM elements are lists and both determine the same
         * list type.
         * @param {HTMLElement} dom1 First DOM element; may be null
         * @param {HTMLElement} dom2 Second DOM element; may be null
         * @return {Boolean} True if both elements are lists and the list type is the same
         */
        isSameType: CUI.rte.ListUtils.isSameType,

        /**
         * Gets all nested lists of the specified item if available.
         * @param {HTMLElement} itemDom The item's DOM element
         * @return {HTMLElement[]} List with all nested lists
         */
        getNestedLists: CUI.rte.ListUtils.getNestedLists,

        /**
         * Removes the specified item from the list.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement[]} items Array of items to unlist; items must be adjacent
         *        (but may be on different hierarchical levels)
         * @param {Boolean} keepStructure True if the list structure should be kept if
         *        list splitting is required
         */
        unlistItems: CUI.rte.ListUtils.unlistItems,

        /**
         * Checks if the specified node/offset (as provided by a processing selection)
         * determines the position before a nested list.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The node
         * @param {Number} offset The offset
         * @return {Boolean} True if the specified node/offset determines the position
         *         before a nested list
         */
        isPositionBeforeNestedList: CUI.rte.ListUtils.isPositionBeforeNestedList,

        /**
         * Marker attribute for empty list items that might be removed on clean up after
         * unlisting
         * @private
         * @type String
         */
        REMOVAL_MARKER: CUI.rte.Common.RTE_ATTRIB_PREFIX + "_invalid",

        /**
         * Marker attribute for list items that were cloned when an original list has been
         * split during unlisting (an) item(s)
         * @private
         * @type String
         */
        CLONED_MARKER: CUI.rte.Common.RTE_ATTRIB_PREFIX + "_cloned"

    };

}();