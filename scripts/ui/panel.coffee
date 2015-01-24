rivets = require("rivets")
FilterSelector = require("./filter_selector")
util = require("./util")

module.exports = class Panel

	constructor: (deck, options = {}) ->
		@cards = (card for title, card of deck.index) # XXX: tight coupling to store!?

		@container = util.getTemplate("panel")
		rivets.bind(@container, @)

		if options.filterable
			tags = Object.keys(deck.tags) # XXX: tight coupling to store!?
			filter = new FilterSelector(tags)
			util.prepend(filter.container, @container) # XXX: belongs into template!?
