/* global phantom */
'use strict';

var system = require('system');
var page = require('webpage').create();
var opts = JSON.parse(system.args[1]);
var log = console.log;

var finalUrl = opts.url;
page.settings.userAgent = 'Mozilla/6.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/8.0 Mobile/10A5376e Safari/8536.25';

function formatTrace(trace) {
	var src = trace.file || trace.sourceURL;
	var fn = (trace.function ? ' in function ' + trace.function : '');
	return '-> ' + src + ' on line ' + trace.line + fn;
}

console.log = console.error = function () {
	system.stderr.writeLine([].slice.call(arguments).join(' '));
};

if (opts.username && opts.password) {
	opts.customHeaders = assign({}, opts.customHeaders, {
		'Authorization': 'Basic ' + btoa(opts.username + ':' + opts.password)
	});
}

opts.cookies.forEach(function (cookie) {
	if (!phantom.addCookie(cookie)) {
		console.error('Couldn\'t add cookie: ' + cookie);
		phantom.exit(1);
	}
});

phantom.onError = function (err, trace) {
	console.error([
		'PHANTOM ERROR: ' + err,
		formatTrace(trace[0])
	].join('\n'));

	phantom.exit(1);
};

page.onError = function (err, trace) {
	console.error([
		'WARN: ' + err,
		formatTrace(trace[0])
	].join('\n'));
};


page.onResourceReceived = function (response) {
	page.injectJs(opts.es5shim);
};

page.onNavigationRequested = function(url, type, willNavigate, main) {
	if (main && url != opts.url) {
        finalUrl = url;
	}
};

page.viewportSize = {
	width: opts.width,
	height: opts.height
};

page.customHeaders = opts.customHeaders || {};

page.open(opts.url, function (status) {
	
    log.call(console, finalUrl);
    phantom.exit(1);
});
