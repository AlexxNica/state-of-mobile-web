var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InsightSchema = new Schema({
    'domain' : {type: String, required: true},
    'is_responsive':   Number,
    'width': Number,
    'height': Number,
    'height_ratio': Number,
    
    'score': Number,
    'bytes_total': Number,
    
    'is_adaptive': Number,
    'has_app': Number,
    'app_meta_tag': String,
    'is_mobile_friendly': Number,
    'mobile_friendly_url': String,
    'cmses': [String]
});

module.exports = mongoose.model('insight', InsightSchema);