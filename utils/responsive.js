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
exports.check = function(domainName, redirectUrl, callback){
    
    makeScreen(domainName, redirectUrl, function(err, filename){
        
        if (err) {
            callback(1);
        } else {
            
            // Get the width & height of the screenshot
            getImageSize(filename, function(err, imageProperties){
                
                if (err || !imageProperties) {
                    callback(1);
                } else {
                    
                    // The domain is responsive if the screenshot has the expected iPhone width (a margin of 50 px is added)
                    var isResponsive = Number(imageProperties.width <= iPhoneWidth + 50);
                    
                    var responsiveProperties = {
                        'width' : imageProperties.width,
                        'height' : imageProperties.height,
                        'is_responsive': isResponsive,
                        'processed': 1
                    }
                    
                    // If we have a responsive website, calculate the ratio between its height and the device's height
                    if (isResponsive) {
                        responsiveProperties['height_ratio'] = Math.round(imageProperties.height * 100 / iPhoneHeight) / 100;
                    }
                    
                    // Delete image file
                    fs.unlink(filename, function (err) {
                        if (err) throw err;
                        console.log('successfully deleted ' + filename);
                    });
                    
                    callback(0, domainName, responsiveProperties);
                }
            })
        }
    })
}


// Make printscreen
function makeScreen(domainName, redirectUrl, callback) {
    
    var stream = screenshot(redirectUrl, iPhoneSize, {'delay': 2, 'customHeaders' : {'User-Agent' : iPhone6UserAgent }});
        
    var dest = __dirname+'/../screenshots/'+domainName+'__'+iPhoneSize+'.png';
    var write = fsWriteStreamAtomic(dest);
    var pipe = stream.pipe(write);
    
    stream.on('warn', function(err){
        // console.log("responsive:makeScreen> Stream warning", err);
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
        callback(0, dest);
    });
}


// Get the width & height of an image
function getImageSize(filename, callback){
    
    var pic = fs.readFile(filename, function (err, data) {
        
        if (err) {
            console.log("responsive:getImageSize> Error opening file ", filename);
            callback(1);
        } else {
            
            img = new Image;
            
            // if error return
            img.onerror = function() {    
                console.log("responsive:getImageSize> Error creating image ", filename)
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
this.check('thehindu.com', 'http://m.thehindu.com/', function(err, domain, result){
    console.log(err, domain, result)  
});

this.check('hollywoodreporter.com', 'http://www.hollywoodreporter.com/', function(err, domain, result){
    console.log(err, domain, result)  
});*/
