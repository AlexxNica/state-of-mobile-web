var path = require('path');
var phantomBridge = require('phantom-bridge');
var es5 = require.resolve('es5-shim');

var iPhoneWidth = 375;
var iPhoneHeight = 667;

// Check if a domain redirects to a different url for mobile
exports.check = function(domain, callback) {

    var opts = {};
    opts.url = 'http://'+domain;
    opts.es5shim = es5;
    opts.delay = 2;
    opts.width = iPhoneWidth;
    opts.height = iPhoneHeight;
    opts.cookies = [];
    
    var redirectUrl = "";
	
	// Run phantom script that will detect redirects
	var cp = phantomBridge(path.join(__dirname, 'libs/redirect.js'), [
		'--ignore-ssl-errors=true',
		'--local-to-remote-url-access=true',
		'--ssl-protocol=any',
        JSON.stringify(opts)
	]);
    
    cp.stderr.setEncoding('utf8');
	cp.stderr.on('data', function (data) {
		// data = data.trim();
		// console.log("Handle redirect error > ", data)
	});
    
    cp.stdout.setEncoding('utf8');
	cp.stdout.on('data', function (data) {
		data = data.trim();
        redirectUrl = data;
	});
    
    // Listen for an exit event:
    cp.on('exit', function (exitCode) {
        // console.log("Child exited with code: " + exitCode);
        callback(0, domain, redirectUrl)
    });
}
