rivets = require("rivets")
util = require("./util")

module.exports = class FilterSelector

	constructor: (tags) ->
		@menu = (new Tag(tag) for tag in tags)
		@selection = []

		@container = util.getTemplate("filter-selector")
		rivets.bind(@container, @)

	onSelect: (ev, rv) =>
		move(rv.tag, @menu, @selection)

	onDeselect: (ev, rv) =>
		move(rv.tag, @selection, @menu)

class Tag

	constructor: (@name, @selected) ->
		@tags = [] unless @tags

# move an item between arrays
move = (item, source, target) ->
	index = source.indexOf(item)
	source.splice(index, 1)
	target.push(item)
	return
