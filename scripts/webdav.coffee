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
	prom = new Promise((resolve, reject) ->
		ids = ["b-1", "b-2", "eurofighter", "f-14", "f-15", "f-16", "f-22",
				"f-35", "harrier", "mig-25", "su-27"]
		items = ({ name: id, uri: "./test/fixtures/store/#{id}" } for id in ids)
		lists = [[], items]
		resolve(lists))
	return prom

name2entry = (root, name) ->
	root = root.replace(/\/$/, "")
	uri = [root, name].join("/") # TODO: `encodeURIComponent`!?
	return { name, uri }
