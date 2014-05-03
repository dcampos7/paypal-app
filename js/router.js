// route function
function route(handle, pathname, request, response, connection) {
	var type = pathname.split("/")[1];

	// handle most pages
	if (typeof handle[pathname] === 'function') {
		handle[pathname](request, response, connection);
	}
	// handle support files: images, css, etc
	else if (type == 'img' || type == 'css' || type == 'fonts') {
		handle['load'](request, response, pathname);
	}
	// handle not found
	else {
		console.log("No request handler found for " + pathname);
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
	}
}

// export route function
exports.route = route;