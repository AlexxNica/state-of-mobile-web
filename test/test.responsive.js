var assert = require("assert")

describe('responsive', function(){
    
    describe('check', function(){
    
        this.timeout(60000);
        
        it ('examiner.com properties', function(done){
        
            var responsive = require("../utils/responsive.js");
            
            responsive.check('examiner.com', 'http://www.examiner.com/', function(err, domain, responsiveProperties){
                assert.equal(0, err);
                assert.equal('examiner.com', domain);
                assert.equal(1, responsiveProperties['is_responsive']);
                assert.equal(375, responsiveProperties['width']);
                done();
            });
        })
    })
})