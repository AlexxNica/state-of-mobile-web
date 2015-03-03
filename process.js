// Include modules
var handle_redirect = require('./utils/handle_redirect.js');
var responsive = require('./utils/responsive.js');
var page_insights = require('./utils/page_insights.js');
var mobile_friendly = require('./utils/mobile_friendly.js');

var Insight = require('./models/insight');

// Read domains from the database and process them
exports.processDomains = function( callback){
    
    var limit = 5;

    Insight.find({"domain": {"$exists": true}, 'processed': {"$exists": false}}, {}, {limit: limit}).sort({'_id':1}).exec( function(err, data) {
        
        if (!err && data) {
            
            var domainNames = [];
            
            if (data.length == 0) {
                
                callback(1);
                
            } else {
                
                for ( var i = 0; i < data.length; i++ ) {
                    
                    var domainName = data[i].domain;
                    
                    // mark the domain immediately as processed, as to not circle back to it
                    updateInsightDocument(domainName, {'processed': 1});
                    
                    console.log(domainName)
                    
                    handle_redirect.check(domainName, function(err, domain, redirectUrl){
                        
                        console.log("domain ", domain , redirectUrl)
                        domainNames.push({'domain': domain, 'redirectUrl': redirectUrl});
                        
                        if (domainNames.length == data.length) {
                            
                            checkResponsiveDomains(0, domainNames, function(err){
                                callback(0);
                            })
                        }
                    })
                    
                }
            }
            
        } else {
            callback(1);
        }
    });
}

function checkResponsiveDomains(current, domainNames, callback){
    
    if (current >= domainNames.length) {
        
        callback(0);
        return;
    
    } else {
        
        console.log("Checking domain ", current, domainNames[current]);
        
        var receivedResponse = 0;
        var domainName = domainNames[current]['domain'];
        var redirectUrl = domainNames[current]['redirectUrl'];
        
        mobile_friendly.check(domainName, redirectUrl, function(err, filenameDomain, properties){
            
            console.log("--------> Mobile friendly answered")
            if (!err && filenameDomain && properties) {
                updateInsightDocument(filenameDomain, properties);
            }
            
            receivedResponse++;
            
            if (receivedResponse == 3) {
                checkResponsiveDomains(current + 1, domainNames, callback);
            }
        });
        
        page_insights.check(domainName, function(err, filenameDomain, properties){
            
            console.log("--------> Insights answered")
            
            if (!err && filenameDomain && properties) {
                updateInsightDocument(filenameDomain, properties);
            }
            
            receivedResponse++;
            if (receivedResponse == 3) {
                checkResponsiveDomains(current + 1, domainNames, callback);
            }
        });
        
        responsive.check(domainName, redirectUrl, function(err, filenameDomain, properties){
            
            console.log("--------> Responsive answered")
            
            if (!err && filenameDomain && properties) {
                updateInsightDocument(filenameDomain, properties);
            }
            
            receivedResponse++;
            
            if (receivedResponse == 3) {
                checkResponsiveDomains(current + 1, domainNames, callback);
            }
        });
    }
}

function updateInsightDocument(domainName, properties) {
    
    Insight.update({'domain': domainName}, properties, function(err, result) {
        if (err && !result) {
            console.log("Error updating/inserting insight data ", domainName, properties)
        } 
    });
}

