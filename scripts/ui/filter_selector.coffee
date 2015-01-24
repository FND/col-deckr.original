rivets = require("rivets")
util = require("./util")

module.exports = class FilterSelector

	constructor: (tags) ->
		@menu = (tag for tag in tags)
		@selection = []

		@container = util.getTemplate("filter-selector")
		rivets.bind(@container, @)

	onSelect: (ev, rv) =>
		move(rv.tag, @menu, @selection)

	onDeselect: (ev, rv) =>
		move(rv.tag, @selection, @menu)

# move an item between arrays
move = (item, source, target) ->
	index = source.indexOf(item)
	source.splice(index, 1)
	target.push(item)
	return
