rivets = require("rivets")
FilterSelector = require("./filter_selector")
util = require("./util")

module.exports = class Panel

	constructor: (cards, options = {}) ->
		@cards = (new Card(card.title, card.tags) for card in cards)

		@container = util.getTemplate("panel")
		rivets.bind(@container, @)

		tags = options.filterable
		if tags
			filter = new FilterSelector(tags)
			util.prepend(filter.container, @container) # XXX: belongs into template!?

class Card

	constructor: (@title, @tags) -> # TODO: validate (title, individual tags)
		@tags = [] unless @tags
