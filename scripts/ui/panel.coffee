rivets = require("rivets")
FilterSelector = require("./filter_selector")
sortable = require("./sortable")
Facetor = require("../facetor")
Tiddler = require("../store").Tiddler
util = require("./util")

module.exports = class Panel

	constructor: (store, options = {}) ->
		@store = store # XXX: tight coupling!?
		@cards = for title, card of store.index
			new Card(card.title, card.tags)

		@container = util.getTemplate("panel")
		list = @container.querySelector(".deck")
		rivets.bind(@container, @)

		if options.filterable
			tags = Object.keys(@store.tags).sort()
			@facetor = new Facetor(@store.index, tags)
			@filter = new FilterSelector(tags, onChange: @onFilter)
			util.prepend(@filter.container, @container) # XXX: belongs into template!?

		sortable(list, "deck", "li") # XXX: bad selector?

	onFilter: (status, tag) =>
		if status is "added"
			@facetor.filter(tag)
		else
			@facetor.defilter(tag)

		@filter.setCandidates(@facetor.tags)
		for card in @cards
			card.disabled = card.title not in @facetor.titles

	onEdit: (ev, rv) ->
		rv.card.editMode = true
		return

	onSave: (ev, rv) =>
		card = rv.card
		card.editMode = false

		title = card.title
		uri = @store.index[title].uri # FIXME: fails for renames
		tid = new Tiddler(uri, title, card.tags)
		@store.save(tid) # TODO: error handling
		return

class Card

	constructor: (@title, @tags) ->
		@disabled = false
		@editMode = false
