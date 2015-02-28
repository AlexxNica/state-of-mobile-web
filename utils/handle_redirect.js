var path = require('path');
var phantomBridge = require('phantom-bridge');
var es5 = require.resolve('es5-shim');

exports.check = function(domain, callback) {

    var opts = {};
    opts.url = 'http://'+domain;
    opts.es5shim = es5;
    opts.delay = 2;
    opts.width = 350;
    opts.height = 600;
    opts.cookies = [];
    
    var redirectUrl = "";
	var cp = phantomBridge(path.join(__dirname, 'libs/redirect.js'), [
		'--ignore-ssl-errors=true',
		'--local-to-remote-url-access=true',
		'--ssl-protocol=any',
        JSON.stringify(opts)
	]);
    
    cp.stderr.setEncoding('utf8');
	cp.stderr.on('data', function (data) {
		data = data.trim();

		console.log("data stderr", data)
	});
    
    cp.stdout.setEncoding('utf8');
	cp.stdout.on('data', function (data) {
		data = data.trim();
        redirectUrl = data;
	});
    
    // Listen for an exit event:
    cp.on('exit', function (exitCode) {
        console.log("Child exited with code: " + exitCode);
        
        console.log(redirectUrl)
        // Check if the redirect url is the same with the initial url
        var finalUrl = redirectUrl;
        finalUrl = finalUrl.replace("http://", "");
        finalUrl = finalUrl.replace("https://", "");
        finalUrl = finalUrl.replace("www.", "");
        finalUrl = finalUrl.replace("/", "");
        
        var mobileProperties = {'is_mobile_friendly' : 0};
        
        // If we were redirected to a different url, assume we have a mobile friendly site
        if (finalUrl != domain) {
            mobileProperties['is_mobile_friendly'] = 1;
            mobileProperties['mobile_friendly_url'] = redirectUrl;
        } 
    
        callback(0, mobileProperties)
    });
}

this.check('thehindu.com', function(err, result){
    console.log(err, result)  
});