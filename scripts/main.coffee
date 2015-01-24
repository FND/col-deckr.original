Panel = require("./ui/panel")
Store = require("./store")

dummies = [{ # XXX: DEBUG
	title: "hello world"
	tags: ["foo", "bar", "baz"]
}, {
	title: "lorem ipsum"
	tags: ["foo", "baz"]
}, {
	title: "..."
	tags: ["bar"]
}]

store = new Store()
store.load().
	then((store) ->
		store.absorb(item) for item in dummies # XXX: DEBUG

		browser = new Panel(store, filterable: true)
		document.body.appendChild(browser.container)

		return)
