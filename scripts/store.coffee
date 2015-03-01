require("whatwg-fetch") # auto-registers globals
webdav = require("./webdav")
util = require("./util")

# holds a collection ("deck") of cards, indexed by title and tags
module.exports = class Store

	constructor: ->
		@index = {} # card by title -- TODO: rename to avoid ambiguity?
		@tags = {} # cards by tag -- TODO: retain title rather than object?

	load: (src) -> # TODO: `src` currently unused; should be a URI
		return @retrieve(src).then((cards) =>
			@absorb(card) for card in cards
			return @)

	save: (card) ->
		return webdav.store(card.uri, card.serialize(), "text/plain").
			then(=>
				@absorb(card, true)
				return)

	# integrate an individual card
	absorb: (card, overwrite) ->
		title = card.title
		if !overwrite and @index[title]
			util.error("duplicate title", title) # TODO: throw exception?
			return
		@index[title] = card

		for tag in card.tags
			@tags[tag] ||= []
			@tags[tag].push(card)

		return

	# returns a promise for an array cards
	retrieve: (index) ->
		return webdav.ls(index).
			then(([dirs, files]) ->
				items = (resolve(file) for file in files)
				return Promise.all(items))

module.exports.Card = class Card

	constructor: (@uri, @title, @tags = [], @body) -> # TODO: validate (title, individual tags)

	# TODO: document serialization format

	serialize: ->
		tags = "#" + @tags.join(" #") if @tags.length
		title = "# " + @title
		return [tags, title, @body].join("\n\n")

	@deserialize: (txt, defaultTitle, uri) ->
		lines = txt.split("\n")
		tags = lines[0].substr(1).split(" #")
		title = if lines[2] then lines[2].substr(2) else defaultTitle
		body = lines.slice(3).join("\n")
		return new Card(uri, title, tags, body)

resolve = (entry) ->
	return download(entry.uri).
		then((txt) -> Card.deserialize(txt, entry.name, entry.uri))

download = (uri) ->
	return fetch(uri, method: "GET").
		then((res) -> res.text())
