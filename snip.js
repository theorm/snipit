var express = require('express')
  , cons = require('consolidate')
  , app = express()
  , colors = require('colors')
  , less = require('less')
  , fs = require('fs')
  , path = require('path')
  , watch = require('watch');

app.engine('html', cons.swig);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);

app.use('/static', express.static(__dirname + '/static'));

// Render base CSS
var baseCss;
fs.readFile(__dirname + '/views/template.less', 'utf8', function(e, content) {
	if (e) {
		console.error('Error reading base LESS template: %s'.red, e);
	}
	less.render(e ? "" : content, function(e, css) {
		if (e) {
			console.error('Error rendering base LESS template: %s'.red, e);
		}
		baseCss = e ? "" : css;
	});
});

// xxx
var lessCode = "body { h1 { color: blue; }}";

var snippet = {
	errors: {}
};

var snippetMapping = {
	'style.less': 'less',
	'index.html': 'html',
	'app.js': 'js',
};

var loadSnippetFile = function(filename) {
	var name = path.basename(filename);
	var snippetKey = snippetMapping[name];

	if (!snippetKey) return;

	console.log('%s changed'.green, name);

	fs.readFile(filename, 'utf8', function(e, content) {
		if (e) {
			console.error('Error reading %s file'.red, filename);
			snippet.errors[snippetKey] = e; 
			snippet[snippetKey] = '';
		} else {
			snippet[snippetKey] = content;

			if (snippetKey === 'less') {
				less.render(content, function(e, css) {
					if (e) {
						console.log('Error rendering LESS'.red);
						snippet.errors['css'] = e;
						snippet['css'] = '';
					} else {
						snippet['css'] = css;
					}
				});
			}
		}
	});
}

// load snippet files and start watching them.
var cwd = process.cwd();
for (var f in snippetMapping) {
	var p = path.join(cwd, f);

	if (fs.existsSync(p)) {
		loadSnippetFile(p);
	}
}

watch.createMonitor(cwd, function(monitor) {
    monitor.on("changed", function (f, curr, prev) {
		loadSnippetFile(f);
    })
    monitor.on("created", function (f, curr, prev) {
		loadSnippetFile(f);
    })
    monitor.on("deleted", function (f, curr, prev) {
		loadSnippetFile(f);
    })
});

app.get('/base.css', function(req, res) {
	res.set('Content-Type', 'text/css');
	res.send(baseCss);
});

app.get('/', function(req, res){
	res.render('index', {
		snippet: snippet
	});
});

app.listen(3000);
console.log('Express server listening on port 3000'.green);