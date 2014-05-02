// required modules
var server = require("./js/server");
var router = require("./js/router");
var handlers = require("./js/handlers");

// direct url to the right spot
var handle = {
	"/": handlers.home,
	"/home": handlers.home,
	"/send": handlers.send,
	"/success": handlers.success,
	"/history": handlers.history,
	"load": handlers.load
}

// start server
server.start(router.route, handle);