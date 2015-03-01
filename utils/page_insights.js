var psi = require('psi');

// get the PageSpeed Insights report 
exports.check = function(domainName, callback){
    
    // Wait 5 seconds before submitting a new request
    setTimeout(function() {
        
        psi(domainName, {strategy: 'mobile'}, function (err, data) {
            
            if (err || !data) {
                callback(1);
            } else {
                
                if (data.pageStats != null && data.score != null) {
                    
                    var totalBytes = 0;
                    
                    if (data.pageStats.htmlResponseBytes != null) {
                        totalBytes += Number(data.pageStats.htmlResponseBytes);
                    }
                    
                    if (data.pageStats.textResponseBytes != null) {
                        totalBytes += Number(data.pageStats.textResponseBytes);
                    }
                    
                    if (data.pageStats.cssResponseBytes != null) {
                        totalBytes += Number(data.pageStats.cssResponseBytes);
                    }
                    
                    if (data.pageStats.imageResponseBytes != null) {
                        totalBytes += Number(data.pageStats.imageResponseBytes);
                    }
                    
                    if (data.pageStats.htmlResponseBytes != null) {
                        totalBytes += Number(data.pageStats.htmlResponseBytes);
                    }
                    
                    if (data.pageStats.javascriptResponseBytes != null) {
                        totalBytes += Number(data.pageStats.javascriptResponseBytes);
                    }
                    
                    if (data.pageStats.otherResponseBytes != null) {
                        totalBytes += Number(data.pageStats.otherResponseBytes);
                    }
                    
                    var pageInsights = {
                        'score': Number(data.score),
                        'bytes_total': totalBytes,
                        'processed': 1
                    };
                    
                    callback(0, domainName, pageInsights);
                    
                } else {
                    callback(1);
                }  
            }
        });
        
    }, 5000)
    
}

/*
this.check('app.journalism.co.uk', function(err, domain, results){
    console.log(err, domain, results);   
});

this.check('webcrumbz.co', function(err, domain, results){
    console.log(err, domain, results);   
});*/
