var Pageres = require('pageres');
var Image = require('canvas').Image;
var fs = require('fs');
var screenshot = require('screenshot-stream');
var fsWriteStreamAtomic = require('fs-write-stream-atomic');

// Constants used for screenshots
var iPhone6UserAgent = 'Mozilla/6.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/8.0 Mobile/10A5376e Safari/8536.25';

var iPhoneWidth = 375;
var iPhoneHeight = 667;
var iPhoneSize = String(iPhoneWidth) + "x" + String(iPhoneHeight);

// Main method - check if a domain name is responsive
exports.check = function(domainName, callback){
    
    makeScreen(domainName, function(err, domain, filename, warning){
        
        if (err && !domain) {
            callback(1);
        } else {
            
            // Get the width & height of the screenshot
            getImageSize(filename, function(err, imageProperties){
                
                if (err || !imageProperties) {
                    
                    console.log("Unable to read image size");
                    callback(1);
                    
                } else {
                    
                    // The domain is responsive if the screenshot has the expected iPhone width
                    var isResponsive = Number(imageProperties.width <= iPhoneWidth);
                    
                    if (!isResponsive && warning) {
                        
                        callback(0, domain);
                        
                    } else {
                        
                        var responsiveProperties = {
                            // 'domain': imageProperties.domain,
                            'width' : imageProperties.width,
                            'height' : imageProperties.height,
                            'is_responsive': isResponsive
                        }
                        
                        // If we have a responsive website, calculate the ratio between its height and the device's height
                        if (isResponsive) {
                            responsiveProperties['height_ratio'] = Math.round(imageProperties.height * 100 / iPhoneHeight) / 100;
                        }
                        
                        // console.log("responsiveProperties ", domain, responsiveProperties)
                        callback(0, domain, responsiveProperties);
                    }
                }
            })
        }
    })
}


// Make printscreen
function makeScreen(domainName, callback) {
    
    var stream = screenshot('http://' + domainName, iPhoneSize, {'delay': 2, 'customHeaders' : {'User-Agent' : iPhone6UserAgent }});
        
    var dest = __dirname+'/../screenshots/'+domainName+'__'+iPhoneSize+'.png';
    var write = fsWriteStreamAtomic(dest);
    var pipe = stream.pipe(write);
    var warning = false;
    
    stream.on('warn', function(err){
        console.log("responsive:makeScreen> Stream warning", err);
        warning = true;
    });
    
    stream.on('error', function (err) {
        console.log("responsive:makeScreen> Stream error ", domainName, err);
        callback(1);
    });
    
    pipe.on('error', function (err) {
        console.log("responsive:makeScreen> Pipe error ", domainName, err);
        callback(1);
    });
    
    pipe.on('finish', function(result){
        callback(0, domainName, dest, warning);
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


this.check('newyorktimes.com', function(err, result, result2){
    console.log(err, result, result2)  
});