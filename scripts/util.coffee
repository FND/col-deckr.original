exports.error = (msg, args...) ->
	return unless global.console
	if console.error
		console.error(msg, args...)
	else
		console.log(msg, args...)
	return
