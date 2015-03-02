var assert = require("assert")

describe('page_insights', function(){
    
    describe('check', function(){
    
        it ('app.journalism.co.uk should have a 53 score', function(done){
            
            this.timeout(30000);
            
            var page_insights = require("../utils/page_insights.js");
            
            page_insights.check('app.journalism.co.uk', function(err, domain, results){
                assert.equal(0, err);
                assert.equal('app.journalism.co.uk', domain);
                assert.equal(53, results['score']);
                done();
            });
        })
        
        it ('webcrumbz.co should have a 43 score', function(done){
        
            this.timeout(30000);
            var page_insights = require("../utils/page_insights.js");
            
            page_insights.check('webcrumbz.co', function(err, domain, results){
                assert.equal(0, err);
                assert.equal('webcrumbz.co', domain);
                assert.equal(43, results['score']);
                done();
            });
        })
    })
})