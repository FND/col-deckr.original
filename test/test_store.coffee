Store = require("../scripts/store")
util = require("../scripts/util")
assert = require("assert")

beforeEach(->
	@store = new Store()

	@errors = []
	@_error = util.error
	util.error = (msg) => @errors.push(msg) # XXX: hacky?

	return)

afterEach(->
	@store = new Store()
	util.error = @_error
	return)

describe("basic operations", ->
	it("should complain about duplicate titles", ->
		assert.strictEqual(@errors.length, 0)

		@store.absorb(title: "hello world")
		assert.strictEqual(@errors.length, 0)

		@store.absorb(title: "hello world")
		assert.strictEqual(@errors.length, 1)

		return)

	it("should index cards by title and tag", ->
		assert.deepEqual(@store.index, {})
		assert.deepEqual(@store.tags, {})

		@store.absorb(title: "#1", tags: ["foo", "bar", "baz"])
		assert.strictEqual(Object.keys(@store.index).length, 1)
		assert.strictEqual(@store.index["#1"].title, "#1")
		assert.deepEqual(@store.index["#1"].tags, ["foo", "bar", "baz"])
		assert.strictEqual(Object.keys(@store.tags).length, 3)
		assert.strictEqual(@store.tags["bar"].length, 1)
		assert.strictEqual(@store.tags["bar"][0].title, "#1")

		return)
	return)
