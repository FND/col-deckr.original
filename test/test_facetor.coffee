Facetor = require("../scripts/facetor")
Store = require("../scripts/store")
assert = require("assert")

colors = [{
	title: "white"
	tags: ["red", "green", "blue"]
}, {
	title: "black"
	tags: []
}, {
	title: "purple"
	tags: ["red", "blue"]
}, {
	title: "yellow"
	tags: ["red", "green"]
}]

games = [{
	title: "Half-Life"
	tags: ["FPS", "scifi"]
}, {
	title: "Command & Conquer"
	tags: ["RTS", "military", "scifi"]
}, {
	title: "Portal"
	tags: ["FPS", "puzzle", "scifi"]
}]

describe("faceted search", ->
	it("gradually filters both titles and tags based on co-occurrence", ->
		facetor = spawn(colors)

		assert.deepEqual(facetor.titles,
				["white", "black", "purple", "yellow"])
		assert.deepEqual(facetor.tags, ["red", "green", "blue"])

		facetor.filter("red")
		assert.deepEqual(facetor.titles, ["white", "purple", "yellow"])
		assert.deepEqual(facetor.tags, ["green", "blue"])

		facetor.filter("blue")
		assert.deepEqual(facetor.titles, ["white", "purple"])
		assert.deepEqual(facetor.tags, ["green"])

		facetor.filter("green")
		assert.deepEqual(facetor.titles, ["white"])
		assert.deepEqual(facetor.tags, [])

		facetor.filter("translucent")
		assert.deepEqual(facetor.titles, [])

		facetor = spawn(colors)

		facetor.filter("translucent")
		assert.deepEqual(facetor.titles, [])
		assert.deepEqual(facetor.tags, [])

		facetor = spawn(games)

		facetor.filter("scifi")
		assert.deepEqual(facetor.titles,
				["Half-Life", "Command & Conquer", "Portal"])
		assert.deepEqual(facetor.tags, ["FPS", "RTS", "military", "puzzle"])

		facetor.filter("FPS")
		assert.deepEqual(facetor.titles, ["Half-Life", "Portal"])
		assert.deepEqual(facetor.tags, ["puzzle"])

		facetor.filter("puzzle")
		assert.deepEqual(facetor.titles, ["Portal"])
		assert.deepEqual(facetor.tags, [])

		facetor.filter("simulator")
		assert.deepEqual(facetor.titles, [])
		assert.deepEqual(facetor.tags, [])

		return)
	return)

spawn = (collection) ->
	store = new Store()
	store.absorb(item) for item in collection
	return new Facetor(store.index, Object.keys(store.tags))
