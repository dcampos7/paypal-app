// required modules
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var querystring = require('querystring');
var helpers = require("./helpers");

// generate home page
function home(request, response, connection) {
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(helpers.renderStatic('home.html'));
	response.end();
}

// generate send page
function send(request, response, connection) {
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
function success(request, response, connection) {

	response.writeHead(200, {"Content-Type": "text/html"});

	if (request.method == "POST") {

		var body = '';
        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {

        	var today = new Date();
			var date  = String(today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear();

			var POST = querystring.parse(body);

			connection.query('INSERT INTO transactions (user_id, date, recipient, amount, symbol, code, payment, message) VALUES (1,"'
				+ date + '","'
				+ String(POST['recipient']) + '",'
				+ String(POST['amount']) + ',"'
				+ String(POST['symbol']) + '","'
				+ String(POST['code']) + '","'
				+ String(POST['payment']) + '","'
				+ String(POST['message']) + '")',
				function(err, rows) {
					if (err) throw err;
					connection.end();
			});

            var page = String(fs.readFileSync('./templates/success.html'));
            page = page.replace('<span class="amount"></span>', '<span class="amount">'+POST['symbol']+' '+POST['amount']+' '+POST['code']+'</span>');
            page = page.replace('<span class="recipient"></span>', '<span class="recipient">'+POST['recipient']+'</span>');
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
function history(request, response, connection) {

	connection.query('SELECT date, recipient, symbol, amount FROM transactions WHERE user_id=1', function (err, transactions) {

	    if (err) throw err;

	   	var data = "";
		transactions.map(function(transaction) {
			data += '<tr><td>'+transaction.date+'</td><td>'+transaction.recipient+'</td><td>'+transaction.symbol+' '+transaction.amount+'</td></tr>';
		});

		var page = String(fs.readFileSync('./templates/history.html'));
		page = page.replace('<table class="transactions"></table>', '<table class="transactions">'+data+'</table>')

		// write page
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(helpers.renderDynamic(page));
		response.end();

		connection.end();

	});

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
