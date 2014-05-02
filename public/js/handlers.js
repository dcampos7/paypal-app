// required modules
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var querystring = require('querystring');
var helpers = require("./helpers");
var datafile = require("./datafile");

// generate home page
function home(request, response) {
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(helpers.renderStatic('home.html'));
	response.end();
}

// generate send page
function send(request, response) {
	options = {
		host: 'www.xe.com',
		path: '/symbols.php'
	}

	// this actually sends the request and returns the data
	var req = http.request(options, function (res) {
	    var data = '';
	    res.on('data', function (chunk) {
	        data += chunk;
	    });
	    res.on('end', function () {
	    	var elements = "", count = 0;

	        // this organizes the DOM for parsing
	        $ = cheerio.load(data);

	        rows = $('.cSymbl_tbl tr').slice(1);
	        for (var row in rows) {
	        	cells = rows[row].children;
	        	if (cells[4].children[0] != undefined) {
		        	code = cells[1].children[0].data;
		        	symbol = cells[4].children[0].data;
		        	elements += '<option value="'+symbol+'">'+code+'</option>';
		        }

		        count++;
	        	if (count == rows.length) {
	        		break;
	        	}
	        }

	        var page = String(fs.readFileSync('./templates/send.html'));
	    	page = page.replace('<select class="currency"></select>', '<select class="currency">'+elements+'</select>');

	        response.writeHead(200, {"Content-Type": "text/html"});
	    	response.write(helpers.renderDynamic(page));
	    	response.end();
	    });
	});

	// check and report errors
	req.on('error', function (e) {
	    console.log(e.message);
	});
	req.end();
}

// generate success page
function success(request, response) {
	response.writeHead(200, {"Content-Type": "text/html"});
	if (request.method == "POST") {
		var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var POST = querystring.parse(body);
            var page = String(fs.readFileSync('./templates/success.html'));
            page = page.replace('<span class="amount"></span>', '<span class="amount">'+POST['symbol']+' '+POST['amount']+' '+POST['code']+'</span>');
            page = page.replace('<span class="to"></span>', '<span class="to">'+POST['to']+'</span>');
            response.write(helpers.renderDynamic(page));
			response.end();
        });
	}
	else {
		response.write(helpers.renderStatic('error.html'));
		response.end();
	}
}

// generate history page
function history(request, response) {
	// mock data
	var transactions = datafile.transactions();

	var data = "";
	transactions.map(function(transaction) {
		data += '<tr><td>'+transaction['date']+'</td><td>'+transaction['to']+'</td><td>'+transaction['currency']+' '+transaction['amount']+'</td></tr>';
	});

	var page = String(fs.readFileSync('./templates/history.html'));
	page = page.replace('<table class="transactions"></table>', '<table class="transactions">'+data+'</table>')

	// write page
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(helpers.renderDynamic(page));
	response.end();
}

// load page parts
function load(request, response, pathname) {
	response.write(fs.readFileSync('.'+pathname));
	response.end();
}

// export home, send, success, history and load functions
exports.home = home;
exports.send = send;
exports.success = success;
exports.history = history;
exports.load = load;
