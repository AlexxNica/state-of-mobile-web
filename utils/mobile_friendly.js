var url = require("url");
var request = require('request');
var cheerio = require('cheerio');
var wappalyzer = require("wappalyzer");
var jsdiff = require('diff');

// Constants used for making requests
var iPhone6UserAgent = 'Mozilla/6.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/8.0 Mobile/10A5376e Safari/8536.25';
var chromeUserAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36';

// check mobile friendly, mobile app, adaptive
exports.check = function(domainName, redirectUrl, callback) {
    
    var mobileProperties = {
        'is_adaptive' : 0,
        'has_app' : 0,
        'has_FBIA' : 0,
        'is_mobile_friendly' : 0,
        'processed': 1,
        'links': []
    }
    
    // Check if the redirect hostname/path is the same with the initial domain    
    var parsedUrl = url.parse(redirectUrl);
    var finalUrl = parsedUrl.hostname;
	finalUrl = finalUrl.replace("www.", "");
	
    // Some websites use relative paths for the mobile version (ex. /mobile or /touch)
	if (parsedUrl.path != '/') {
        
		var relativePath = parsedUrl.path;
		relativePath = relativePath.replace("/index.html", "");
		relativePath = relativePath.replace("/home.aspx", "");
		
		if (relativePath != '/') {
			finalUrl = finalUrl + relativePath;
		}
	}
    
    // If we were redirected to a different url, assume we have a mobile friendly site
    if (finalUrl != domainName) {
        mobileProperties['is_mobile_friendly'] = 1;
        mobileProperties['mobile_friendly_url'] = redirectUrl;
    }
    
    var requestMobileOptions = {
        url: redirectUrl,
        headers: {        
            'User-Agent': iPhone6UserAgent
        },
        followRedirect: true,
        followAllRedirects: true,
        maxRedirects: 20
    };
            
    var rMobile = request(requestMobileOptions, function(err, resMobile, bodyMobile) {
    
        // Check if the request completed with an error
        if (err || !resMobile || resMobile.statusCode != 200) {
            callback(1);
        } else {
        
            // Check if the source contains a meta tag indicating a native app (smart banner)
            var $ = cheerio.load(bodyMobile);
            var iTunesMetaTag = $('meta[name=apple-itunes-app]');
            var FBIAMetaTag = $('meta[property="fb:pages"]');

            var AMPLinks = [];
            var j = 0;

            $('a[href]').each(function(i, elem) {
                var link = $(this).attr('href');

                if (typeof link !== 'undefined' && (link.search(domainName) !== -1 || link.charAt(0) === '/')) {
                    j++;
                    AMPLinks.push(link);
                }
                if (j === 50) {
                    return false;
                }
            });

            if (iTunesMetaTag.length > 0) {
                mobileProperties['has_app'] = 1;
                mobileProperties['app_meta_tag'] = $('meta[name=apple-itunes-app]').attr("content");
            }

            if (FBIAMetaTag.length > 0) {
                mobileProperties['has_FBIA'] = 1;
            }

            if(AMPLinks.length > 0) {
                mobileProperties['links'] = AMPLinks;
            }
            
            // Check adaptive
            var requestDesktopOptions = {
                url: 'http://'+domainName,
                headers: {        
                    'User-Agent': chromeUserAgent
                },
                followRedirect: true
            };
            
            
            // Check CMSs & Platforms
            var wappalyzerOptions = {
                url : rMobile.uri.href,
                hostname: domainName,
                debug:false
            }
            
            var wappalyzerData = {
                html: bodyMobile,
                url: rMobile.uri.href,
                headers: resMobile
            };
            
            wappalyzer.detectFromUrl(wappalyzerOptions, function  (err, apps, appInfo) {
                
                if (!err && apps) {
                    mobileProperties['cmses'] = apps;
                }
                
                // If we don't have a mobile friendly site, check if the content changes depending on the user agent
                if (!mobileProperties['mobile_friendly_url']) {
                    
                    // Make new request using a common desktop user agent (Chrome)
                    var rDesktop = request(requestDesktopOptions, function(err, resDesktop, bodyDesktop) {
                        
                        // If the request was completed successfully, compare the responses bodies
                        if (!err && resDesktop && resDesktop.statusCode == 200) {
                            
                            var diff = jsdiff.diffLines(bodyMobile, bodyDesktop);
                            
                            if (diff.length > 100) {
                                mobileProperties['is_adaptive'] = 1;
                            }
                        }
                        
                        callback(0, domainName, mobileProperties);
                    });
                    
                } else {
                    callback(0, domainName, mobileProperties);
                }
            });
        }
    })  
}