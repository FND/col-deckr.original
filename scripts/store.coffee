util = require("./util")

# holds a collection ("deck") of cards, indexed by title and tags
module.exports = class Store

	constructor: ->
		@index = {} # card by title -- TODO: rename to avoid ambiguity?
		@tags = {} # cards by tag -- TODO: retain title rather than object?

	load: (src) -> # TODO: `src` currently unused; should be a URI
		return @retrieve(src).then((cards) =>
			@absorb(data) for data in cards
			return @)

	# integrate an individual card
	absorb: (item) ->
		card = new Card(item)

		title = card.title
		util.error("duplicate title", title) if @index[title] # TODO: abort?
		@index[title] = card

		for tag in card.tags
			@tags[tag] ||= []
			@tags[tag].push(card)

		return

	# returns a promise for an array cards
	retrieve: (src) -> # TODO: dummy implementation
		return new Promise((resolve, reject) ->
			setTimeout((-> resolve([])), 100) # TODO
			return)

class Card

	constructor: (data) -> # TODO: validate (title, individual tags)
		@title = data.title
		@tags = data.tags or []
