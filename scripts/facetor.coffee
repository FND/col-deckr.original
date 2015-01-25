module.exports = class Facetor

	constructor: (@index, @originalTags = []) ->
		@init()

	init: ->
		@titles = Object.keys(@index)
		@tags = @originalTags.slice()
		@selection = {} # pseudo-set
		return

	filter: (tag) -> # XXX: inefficient
		return if @selection[tag]

		titles = []
		tags = {} # pseudo-set

		for title in @titles
			item = @index[title]
			if tag in item.tags
				titles.push(title)
				for tg in item.tags
					tags[tg] = true if tg in @tags

		# TODO: use pseudo-sets for downstream efficiency
		@titles = titles
		delete tags[tag]
		@tags = Object.keys(tags)

		@selection[tag] = true
		return

	defilter: (tag) -> # XXX: inefficient -- TODO: rename?
		return unless @selection[tag]

		delete @selection[tag]
		selection = Object.keys(@selection)

		@init()
		@filter(tag) for tag in selection
		return
