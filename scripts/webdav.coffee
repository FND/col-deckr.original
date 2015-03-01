require("whatwg-fetch") # auto-registers globals
xml = require("dav-dump/src/xml")

exports.store = (uri, content, contentType) -> # TODO: prevent clobbering via ETag
	options = { method: "PUT", body: content }
	options.headers = { "Content-Type": contentType } if contentType
	return fetch(uri, options)

# returns a promise for a tuple of directories and files, with each entry being
# a `{ name, uri }` object
exports.ls = (uri) ->
	return fetch(uri, method: "PROPFIND", headers: { Depth: 1 }).
		then((res) -> res.text()).
		then((txt) ->
			parser = new DOMParser()
			doc = parser.parseFromString(txt, "text/xml")
			lists = for list in xml.extractEntries(doc)
				entries = (name2entry(uri, name) for name in list)
				entries
			return lists)

name2entry = (root, name) ->
	root = root.replace(/\/$/, "")
	uri = [root, name].join("/") # TODO: `encodeURIComponent`!?
	return { name, uri }
