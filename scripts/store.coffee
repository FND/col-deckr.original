require("whatwg-fetch") # auto-registers globals
webdav = require("./webdav")
util = require("./util")

# holds a collection of `Tiddler`s, indexed by title and tags
# cf. TiddlyWiki (http://tiddlywiki.com) / TiddlyWeb (http://tiddlyweb.com)
module.exports = class Store

	constructor: ->
		@index = {} # tiddler by title -- TODO: rename to avoid ambiguity?
		@tags = {} # tiddlers by tag -- TODO: retain title rather than object?

	load: (src) -> # TODO: `src` currently unused; should be a URI
		return @retrieve(src).then((tiddlers) =>
			@absorb(tiddler) for tiddler in tiddlers
			return @)

	save: (tiddler) ->
		options = { contentType: "text/plain", etag: tiddler.etag }
		return webdav.store(tiddler.uri, tiddler.serialize(), options).
			then((res) =>
				etag = res.headers.get("ETag")
				tiddler.etag = etag if etag
				@absorb(tiddler, true)
				return)

	# integrate an individual tiddler
	absorb: (tiddler, overwrite) ->
		title = tiddler.title
		if !overwrite and @index[title]
			util.error("duplicate title", title) # TODO: throw exception?
			return
		@index[title] = tiddler

		for tag in tiddler.tags
			@tags[tag] ||= []
			@tags[tag].push(tiddler)

		return

	# returns a promise for an array tiddlers
	retrieve: (index) ->
		return webdav.ls(index).
			then(([dirs, files]) ->
				items = (resolve(file) for file in files)
				return Promise.all(items))

module.exports.Tiddler = class Tiddler # XXX: does not belong here?

	# TODO: validation? (title, individual tags)
	constructor: (@uri, @title, @tags = [], @body, @etag) ->

	# TODO: document serialization format (and write tests)

	serialize: ->
		tags = "#" + @tags.join(" #") if @tags.length
		title = "# " + @title
		return [tags, title, @body].join("\n\n")

	@deserialize: (txt, defaultTitle) ->
		lines = txt.split("\n")
		tags = lines[0].substr(1).split(" #")
		title = if lines[2] then lines[2].substr(2) else defaultTitle
		body = lines.slice(3).join("\n")
		return new Tiddler(null, title, tags, body)

resolve = (entry) ->
	return download(entry.uri).
		then(([txt, etag]) ->
			tiddler = Tiddler.deserialize(txt, entry.name)
			tiddler.uri = entry.uri
			tiddler.etag = etag if etag
			return tiddler)

download = (uri) ->
	return fetch(uri, method: "GET").
		then((res) ->
			etag = res.headers.get("ETag")
			return res.text().
				then((txt) -> [txt, etag]))
