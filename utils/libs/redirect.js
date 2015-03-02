/* global phantom */
/* this script is a modified version of screenshot-stream */
'use strict';

var system = require('system');
var page = require('webpage').create();
var opts = JSON.parse(system.args[1]);
var log = console.log;

var finalUrl = opts.url;

// use an iPhone5 user agent which is slightly older (should move this to a param)
// page.settings.userAgent = 'Mozilla/6.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/8.0 Mobile/10A5376e Safari/8536.25';
page.settings.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3';

page.settings.resourceTimeout = 30000;

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

// detect if the page is trying to redirect somewhere else
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

// attempt to open the page; return redirect url even if the page loading fails
page.open(opts.url, function (status) {
	
    log.call(console, finalUrl);
    phantom.exit(1);
});