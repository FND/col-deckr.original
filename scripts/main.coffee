Panel = require("./ui/panel")
Store = require("./store")

store = new Store()
store.load("/test/fixtures/store/"). # XXX: DEBUG
	then((store) ->
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
