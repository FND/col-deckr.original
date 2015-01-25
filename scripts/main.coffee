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

selection = (item for item, i in dummies when i in [0, 3])

store = new Store()
store.load().
	then((store) ->
		rackStore = new Store() # XXX: should not be a separate instance
		rackStore.absorb(item) for item in selection
		rack = new Panel(rackStore)
		document.body.appendChild(rack.container)

		store.absorb(item) for item in dummies # XXX: DEBUG
		browser = new Panel(store, filterable: true)
		document.body.appendChild(browser.container)

		return)
