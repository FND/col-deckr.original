rivets = require("rivets")
util = require("./util")

module.exports = class FilterSelector

	constructor: (tags, options = {}) ->
		@tags = (new Tag(tag) for tag in tags)
		@onChange = options.onChange

		@container = util.getTemplate("filter-selector")
		rivets.bind(@container, @)

	onSelect: (ev, rv) =>
		@update(rv.tag, true)
		return

	onDeselect: (ev, rv) =>
		@update(rv.tag, false)
		return

	setCandidates: (tagNames) ->
		for tag in @tags
			tag.set("disabled", tag.name not in tagNames) # XXX: inefficient
		return

	update: (tag, selected) ->
		tag.set("selected", selected)
		status = if selected then "added" else "removed"
		@onChange.call(null, status, tag.name) if @onChange
		return

class Tag
	constructor: (@name, @selected, @disabled) ->
		@set() # XXX: awkward

	set: (prop, value) -> # XXX: should not be necessary; use computed property?
		@[prop] = value if value isnt undefined # XXX: special-casing
		@selectable = not @selected and not @disabled
