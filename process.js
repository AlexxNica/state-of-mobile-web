// Include modules
var responsive = require('./utils/responsive.js');
var page_insights = require('./utils/page_insights.js');
var mobile_friendly = require('./utils/mobile_friendly.js');

var Insight = require('./models/insight');

exports.processDomains = function(page, callback){
    
    var limit = 5;
    var skip = (page - 1) * limit;
    
    Insight.find({"domain": {"$exists": true}, "is_responsive": 0}, {}, {skip: skip, limit: limit}).sort({'_id':1}).exec( function(err, data) {
        
        if (!err && data) {
            
            var domainNames = [];
            
            for ( var i = 0; i < data.length; i++ ) {
                
                var domainName = data[i].domain;
                domainNames.push(domainName)
            }
            
            if (domainNames.length > 0) {
                
                checkResponsiveDomains(0, domainNames, function(err){
                    callback(0);
                })
                
            } else {
                callback(1);
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
        
        console.log("checkonebyone ", current, domainNames[current]);
        
        var receivedResponse = 0;
        
        mobile_friendly.check(domainNames[current], function(err, filenameDomain, properties){
            
            if (!err && filenameDomain && properties) {
                updateInsightDocument(filenameDomain, properties);
            }
            
            receivedResponse++;
            
            if (receivedResponse == 3) {
                checkResponsiveDomains(current + 1, domainNames, callback);
            }
        });
        
        page_insights.check(domainNames[current], function(err, filenameDomain, properties){
            if (!err && filenameDomain && properties) {
                updateInsightDocument(filenameDomain, properties);
            }

            receivedResponse++;
            if (receivedResponse == 3) {
                checkResponsiveDomains(current + 1, domainNames, callback);
            }
        });
        
        responsive.check(domainNames[current], function(err, filenameDomain, properties){
            
            console.log("receivedResponse responsive ", err, filenameDomain, properties);
            
            if (!err && filenameDomain && properties) {
                updateInsightDocument(filenameDomain, properties);
            } else if (filenameDomain) {
                console.log("update invalid: ", filenameDomain)
                updateInsightDocument(filenameDomain, {'invalid': 1});
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

