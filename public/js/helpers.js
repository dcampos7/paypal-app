// required modules
var http = require("http");
var fs = require('fs');
var cheerio = require('cheerio');

// render function
function renderStatic(template) {
	var page = "";

	// iterate through header, template, and footer to create page
	var files = ['./templates/header.html', './templates/'+template, './templates/footer.html'];
	files.map(function(file) {
		page += fs.readFileSync(file);
	});

	// return rendered page
	return page;
}

// render function
function renderDynamic(template) {
	return fs.readFileSync('./templates/header.html') + template + fs.readFileSync('./templates/footer.html');
}

// export render function
exports.renderStatic = renderStatic;
exports.renderDynamic = renderDynamic;