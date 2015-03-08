require("whatwg-fetch") # auto-registers globals
xml = require("dav-dump/src/xml")

exports.store = (uri, content, options) ->
	headers = {}
	headers["If-Match"] = options.etag if options.etag
	headers["Content-Type"] = options.contentType if options.contentType

	return fetch(uri, { method: "PUT", headers: headers, body: content })

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
