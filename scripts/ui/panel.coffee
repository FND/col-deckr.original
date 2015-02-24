rivets = require("rivets")
FilterSelector = require("./filter_selector")
sortable = require("./sortable")
Facetor = require("../facetor")
util = require("./util")

module.exports = class Panel

	constructor: (deck, options = {}) -> # XXX: `deck` means tight coupling to store!?
		@cards = (new Card(card.title, card.tags) for title, card of deck.index)

		@container = util.getTemplate("panel")
		list = @container.querySelector(".deck")
		rivets.bind(@container, @)

		if options.filterable
			tags = Object.keys(deck.tags).sort()
			@facetor = new Facetor(deck.index, tags)
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

class Card
	constructor: (@title, @tags, @disabled) ->
