rivets = require("rivets")
util = require("./util")

module.exports = class FilterSelector

	constructor: (tags) ->
		@tags = (new Tag(tag) for tag in tags)

		@container = util.getTemplate("filter-selector")
		rivets.bind(@container, @)

	onSelect: (ev, rv) =>
		rv.tag.selected = true

	onDeselect: (ev, rv) =>
		rv.tag.selected = false

class Tag
	constructor: (@name, @selected = false) ->
