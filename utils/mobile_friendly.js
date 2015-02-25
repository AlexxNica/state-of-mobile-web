var request = require('request');
var cheerio = require('cheerio');
var wappalyzer = require("wappalyzer");

// Constants used for making requests
var iPhone6UserAgent = 'Mozilla/6.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/8.0 Mobile/10A5376e Safari/8536.25';
var chromeUserAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36';

// check mobile friendly, mobile app, adaptive
exports.check = function(domainName, callback) {
    
    var requestMobileOptions = {
        url: 'http://'+domainName,
        headers: {        
            'User-Agent': iPhone6UserAgent
        },
        followRedirect: true
    };
    
    var rMobile = request(requestMobileOptions, function(err, resMobile, bodyMobile) {
    
        // Check if the request completed with an error
        if (err || !resMobile || resMobile.statusCode != 200) {
            callback(1);
        } else {
        
            var mobileProperties = {
                'is_adaptive' : 0,
                'has_app' : 0,
                'is_mobile_friendly': 0
            }
            
            // Check if the redirect url is the same with the initial url
            var finalUrl = rMobile.uri.href;
            finalUrl = finalUrl.replace("http://", "");
            finalUrl = finalUrl.replace("https://", "");
            finalUrl = finalUrl.replace("www.", "");
            finalUrl = finalUrl.replace("/", "");
            
            // If we were redirected to a different url, assume we have a mobile friendly site
            if (finalUrl != domainName) {
                mobileProperties['is_mobile_friendly'] = 1;
                mobileProperties['mobile_friendly_url'] = rMobile.uri.href;
            }
            
            // Check if the source contains a meta tag indicating a native app (smart banner)
            var $ = cheerio.load(bodyMobile);
            var iTunesMetaTag = $('meta[name=apple-itunes-app]');
            
            if (iTunesMetaTag.length > 0) {
                mobileProperties['has_app'] = 1;
                mobileProperties['app_meta_tag'] = $('meta[name=apple-itunes-app]').attr("content");
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
                    console.log()
                    console.log(apps);
                }
                
                // If we don't have a mobile friendly site, check if the content changes depending on the user agent
                if (!mobileProperties['mobile_friendly_url']) {
                    
                    // Make new request using a common desktop user agent (Chrome)
                    var rDesktop = request(requestDesktopOptions, function(err, resDesktop, bodyDesktop) {
                        
                        // If the request was completed successfully, compare the responses bodies
                        if (!err && resDesktop && resDesktop.statusCode == 200) {
                            
                            if (bodyMobile != bodyDesktop) {
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
    });
}



/*getMobileProperties('app.journalism.co.uk', function(err, result){
    console.log(err, result)  
});

getMobileProperties('newyorktimes.com', function(err, result){
    console.log(err, result)  
});

this.check('carrefour-online.ro', function(err, domain, result){
    console.log(err, result)  
});

this.check('businessinsider.com', function(err, domain, result){
    console.log(err, result)  
});


this.check('codelanka.github.io', function(err, domain, result){
    console.log(err, result)  
});*/