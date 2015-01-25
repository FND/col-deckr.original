module.exports = class Facetor

	constructor: (@index, @tags = []) ->
		@titles = Object.keys(@index)

	filter: (tag) -> # XXX: inefficient
		titles = []
		tags = {} # pseudo-set

		for title in @titles
			item = @index[title]
			if tag in item.tags
				titles.push(title)
				for tg in item.tags
					tags[tg] = true if tg in @tags

		@titles = titles
		delete tags[tag]
		@tags = Object.keys(tags)
		return
