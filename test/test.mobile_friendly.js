var assert = require("assert")

describe('mobile_friendly', function(){
    
    describe('check', function(){
    
        this.timeout(15000);
        
        it ('mathrubhumi.com properties', function(done){
        
            var mobile_friendly = require("../utils/mobile_friendly.js");
            
            mobile_friendly.check('mathrubhumi.com', 'http://www.mathrubhumi.com/', function(err, domain, mobileProperties){
                assert.equal(0, err);
                assert.equal('mathrubhumi.com', domain);
                assert.equal(0, mobileProperties['is_adaptive']);
                assert.equal(0, mobileProperties['has_app']);
                assert.equal(0, mobileProperties['is_mobile_friendly']);
                done();
            });
        })
        
        it ('businessinsider.com properties', function(done){
        
            var mobile_friendly = require("../utils/mobile_friendly.js");
            
            mobile_friendly.check('businessinsider.com', 'http://www.businessinsider.com/', function(err, domain, mobileProperties){
                assert.equal(0, err);
                assert.equal('businessinsider.com', domain);
                assert.equal(1, mobileProperties['is_adaptive']);
                assert.equal(1, mobileProperties['has_app']);
                assert.equal(0, mobileProperties['is_mobile_friendly']);
                done();
            });
        })
        
        it ('nytimes.com properties', function(done){
        
            var mobile_friendly = require("../utils/mobile_friendly.js");
            
            mobile_friendly.check('nytimes.com', 'http://mobile.nytimes.com/?referrer=', function(err, domain, mobileProperties){
                assert.equal(0, err);
                assert.equal('nytimes.com', domain);
                assert.equal(0, mobileProperties['is_adaptive']);
                assert.equal(1, mobileProperties['has_app']);
                assert.equal(1, mobileProperties['is_mobile_friendly']);
                done();
            });
        })
        
        it ('al.com properties', function(done){
        
            var mobile_friendly = require("../utils/mobile_friendly.js");
            
            mobile_friendly.check('al.com', 'http://www.al.com/#/0', function(err, domain, mobileProperties){
                
                assert.equal(0, err);
                assert.equal('al.com', domain);
                assert.equal(0, mobileProperties['is_adaptive']);
                assert.equal(1, mobileProperties['has_app']);
                assert.equal(0, mobileProperties['is_mobile_friendly']);
                
                var cmses = [ 'Livefyre', 'Modernizr', 'jQuery' ];
                assert.equal(cmses[0], mobileProperties['cmses'][0]);
                assert.equal(cmses[1], mobileProperties['cmses'][1]);
                assert.equal(cmses[2], mobileProperties['cmses'][2]);
                
                done();
            });
        })
        
        it ('seattletimes.com properties', function(done){
        
            var mobile_friendly = require("../utils/mobile_friendly.js");
            
            mobile_friendly.check('seattletimes.com', 'http://www.seattletimes.com/', function(err, domain, mobileProperties){
                
                assert.equal(0, err);
                assert.equal('seattletimes.com', domain);
                assert.equal(0, mobileProperties['is_adaptive']);
                assert.equal(0, mobileProperties['has_app']);
                assert.equal(0, mobileProperties['is_mobile_friendly']);
                
                done();
            });
        })
        
        it ('mantecabulletin.com properties', function(done){
        
            var mobile_friendly = require("../utils/mobile_friendly.js");
            
            mobile_friendly.check('mantecabulletin.com', 'http://mantecabulletin.com/m/', function(err, domain, mobileProperties){
                
                assert.equal(0, err);
                assert.equal('mantecabulletin.com', domain);
                assert.equal(0, mobileProperties['is_adaptive']);
                assert.equal(0, mobileProperties['has_app']);
                assert.equal(1, mobileProperties['is_mobile_friendly']);
                
                done();
            });
        })
    })
})