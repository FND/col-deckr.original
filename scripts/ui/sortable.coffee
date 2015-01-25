Sortable = require("sortablejs")

module.exports = (list, groupName, itemSelector) ->
	options =
		group: groupName
		draggable: itemSelector
		ghostClass: "placeholder"
	return new Sortable(list, options)
