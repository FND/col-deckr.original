rivets = require("rivets")
FilterSelector = require("./filter_selector")
sortable = require("./sortable")
Facetor = require("../facetor")
Tiddler = require("../store").Tiddler
util = require("./util")

module.exports = class Panel

	constructor: (store, options = {}) ->
		@store = store # XXX: tight coupling!?
		@cards = for title, tiddler of store.index
			new Card(tiddler.title, tiddler.tags, tiddler.body.trim())

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

		origin = @store.index[card.originalTitle]
		tid = new Tiddler(origin.uri, card.title, card.tags, null, origin.etag)
		@store.save(tid). # TODO: error handling -- TODO: renames should be encapsulated within store
			then(=> @store.remove(card.originalTitle)) # FIXME: currently unsupported by store
		return

class Card

	constructor: (@title, @tags, @image) ->
		@originalTitle = @title # XXX: smell? required due to two-way data binding
		@disabled = false
		@editMode = false
