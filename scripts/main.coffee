Panel = require("./ui/panel")
Store = require("./store")

dummies = [{ # XXX: DEBUG
	title: "Half-Life"
	tags: ["FPS", "scifi"]
}, {
	title: "Unreal"
	tags: ["FPS", "scifi"]
}, {
	title: "Command & Conquer"
	tags: ["RTS", "military", "scifi"]
}, {
	title: "Portal"
	tags: ["FPS", "puzzle", "scifi"]
}]

store = new Store()
store.load("/test/fixtures/store/"). # XXX: DEBUG
	then((err) ->
		store.absorb(item) for item in dummies

		selection = for title, card of store.index
			continue if Math.random() < 0.7
			card
		rackStore = new Store() # XXX: should not be a separate instance
		rackStore.absorb(item) for item in selection
		rack = new Panel(rackStore)
		document.body.appendChild(rack.container)

		browser = new Panel(store, filterable: true)
		document.body.appendChild(browser.container)

		return)
