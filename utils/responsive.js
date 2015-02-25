var Pageres = require('pageres');
var Image = require('canvas').Image;
var fs = require('fs');

// Constants used for screenshots
var iPhone6UserAgent = 'Mozilla/6.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/8.0 Mobile/10A5376e Safari/8536.25';

var iPhoneWidth = 375;
var iPhoneHeight = 667;
var iPhoneSize = String(iPhoneWidth) + "x" + String(iPhoneHeight);


// Main method - check if a domain name is responsive
exports.check = function(domainName, callback) {
    
    // Make screenshots for each domain using a mobile user agent
    var pageres = new Pageres({delay: 2, filename: '<%= url %>__<%= size %>', format: 'jpg'})
        .src(domainName, [iPhoneSize], {'customHeaders' : {'User-Agent' : iPhone6UserAgent } })
        .dest(__dirname+'/../screenshots');
    
    
    pageres.run(function (err, items) {
        
        if (err) {
            console.log("Unable to make screenshot ", err);
            callback(1);
        } else {
            
            // Items will contain a single element because we added a single .src 
            for (var k=0; k < items.length; k++) {
                
                var filenameDomain = items[k].filename.split('__')[0];
                
                // Get the width & height of the screenshot
                getImageSize(__dirname+'/../screenshots/'+items[k].filename, function(err, imageSize){
                    
                    if (err || !imageSize) {
                        
                        console.log("Unable to read image size");
                        callback(1);
                        
                    } else {
                        
                        // The domain is responsive if the screenshot has the expected iPhone width
                        var isResponsive = Number(imageSize.width <= iPhoneWidth);
                        
                        var responsiveProperties = {
                            'width' : imageSize.width,
                            'height' : imageSize.height,
                            'is_responsive': isResponsive
                        }
                        
                        // If we have a responsive website, calculate the ratio between its height and the device's height
                        if (isResponsive) {
                            responsiveProperties['height_ratio'] = Math.round(imageSize.height * 100 / iPhoneHeight) / 100;
                        }
                        
                        callback(0, filenameDomain, responsiveProperties);                        
                    }
                })
                
                break;
            }
        }        
    });
}

// Get the width & height of an image
function getImageSize(filename, callback){
    
    var pic = fs.readFile(filename, function (err, data) {
        if (err) {
            console.log("Error opening file ", filename);
            callback(1);
        } else {
            
            img = new Image;
            
            // if error return
            img.onerror = function() {    
                console.log("Error creating image ", filename)
                callback(1);
            }
            
            // if the image was properly loaded, get width & height
            img.onload = function() {
                callback(0, {'width': img.width, 'height': img.height})
            }
            
            img.src = data;
        }
    });
}

/*
this.check('app.journalism.co.uk', function(err, domain, results){
    console.log(err, domain, results);  
})

this.check('newyorktimes.com', function(err, domain, results){
    console.log(err, domain, results);  
})

this.check('businessinsider.com', function(err, domain, results){
    console.log(err, domain, results);  
})*/