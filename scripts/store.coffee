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
			@absorb(data) for data in cards
			return @)

	# integrate an individual card
	absorb: (item) ->
		card = new Card(item.title, item.tags, item.body)

		title = card.title
		util.error("duplicate title", title) if @index[title] # TODO: abort?
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

class Card
	constructor: (@title, @tags = [], @body) -> # TODO: validate (title, individual tags)

resolve = (entry) ->
	return download(entry.uri).
		then((txt) -> parse(txt, entry.name))

parse = (txt, defaultTitle) -> # TODO: rename, document
	lines = txt.split("\n")
	tags = lines[0].substr(1).split(" #")
	title = if lines[2] then lines[2].substr(2) else defaultTitle
	body = lines.slice(3).join("\n")
	return { title, tags, body }

download = (uri) ->
	return fetch(uri, method: "GET").
		then((res) -> res.text())
