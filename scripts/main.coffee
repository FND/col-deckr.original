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
store.load().
	then((store) ->
		store.absorb(item) for item in dummies # XXX: DEBUG

		browser = new Panel(store, filterable: true)
		document.body.appendChild(browser.container)

		return)
