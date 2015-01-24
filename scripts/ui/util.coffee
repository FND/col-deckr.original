exports.getTemplate = (name) ->
	node = document.getElementById("#{name}-template")
	return false unless node

	clone = node.cloneNode(true)
	clone.removeAttribute("id")
	clone.classList.remove("template")
	return clone

exports.prepend = (node, parent) ->
	ref = parent.firstChild
	if ref
		parent.insertBefore(node, ref)
	else
		parent.appendChild(node)
	return
