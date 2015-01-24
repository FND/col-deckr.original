Panel = require("./ui/panel")

data = # XXX: DEBUG
	cards: [{ title: "hello world" }, { title: "lorem ipsum" }]
	tags: ["foo", "bar", "baz"]

panel = new Panel(data.cards, filterable: data.tags)
document.body.appendChild(panel.container)
