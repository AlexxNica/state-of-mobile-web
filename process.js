// Include modules
var responsive = require('./utils/responsive.js');
var page_insights = require('./utils/page_insights.js');
var mobile_friendly = require('./utils/mobile_friendly.js');

var Insight = require('./models/insight');

exports.processDomains = function(){
    
    Insight.find({"domain": {"$exists": true}}).sort({'order':1}).exec( function(err, data) {
        
        if (!err && data) {
            
            for ( var i = 0; i < data.length; i++ ) {
                
                var domainName = data[i].domain;
                
                // check if the domain is responsive (calculate width & height)
                responsive.check(domainName, function(err, filenameDomain, properties){
                    if (!err && filenameDomain && properties) {
                        updateInsightDocument(filenameDomain, properties);
                    }
                });
                
                mobile_friendly.check(domainName, function(err, filenameDomain, properties){
                    if (!err && filenameDomain && properties) {
                        updateInsightDocument(filenameDomain, properties);
                    }
                });
                
                page_insights.check(domainName, function(err, filenameDomain, properties){
                    if (!err && filenameDomain && properties) {
                        updateInsightDocument(filenameDomain, properties);
                    }
                });
            }
        }
    });
}

function updateInsightDocument(domainName, properties) {
    
    Insight.update({'domain': domainName}, properties, function(err, result) {
        if (err && !result) {
            console.log("Error updating/inserting insight data ", domainName, properties)
        } 
    });
}



