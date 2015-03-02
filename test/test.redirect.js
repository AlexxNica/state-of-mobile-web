var assert = require("assert")

describe('handle_redirect', function(){
    
    describe('check', function(){
    
        this.timeout(15000);
        
        it ('hindu.com should go to http://m.thehindu.com/', function(done){
        
            var handle_redirect = require("../utils/handle_redirect.js");
            
            handle_redirect.check('thehindu.com', function(err, domain, mobileRedirect){
                assert.equal(0, err);
                assert.equal('thehindu.com', domain);
                assert.equal('http://m.thehindu.com/', mobileRedirect);
                done();
            });
        })
        
        it ('nytimes.com should go to http://mobile.nytimes.com/?referrer=', function(done){
        
            var handle_redirect = require("../utils/handle_redirect.js");
            
            handle_redirect.check('nytimes.com', function(err, domain, mobileRedirect){
                assert.equal(0, err);
                assert.equal('nytimes.com', domain);
                assert.equal('http://mobile.nytimes.com/?referrer=', mobileRedirect);
                done();
            });
        })
        
        it ('nypost.com should go to http://nypost.com/', function(done){
        
            var handle_redirect = require("../utils/handle_redirect.js");
            
            handle_redirect.check('nypost.com', function(err, domain, mobileRedirect){
                assert.equal(0, err);
                assert.equal('nypost.com', domain);
                assert.equal('http://nypost.com/', mobileRedirect);
                done();
            });
        })
    })
})