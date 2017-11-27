const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const KeywordSchema = new Schema({
    keyword: {
        type: String,
    },
    from_id: {
        type: String,
    },
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date,
    },
    create_at: {
        type: Date,
    },
    crawl_status: {
        type: Number,
    },
    last_crawl_at: {
        type: Date,
    },
    crawling_at: {
        type: Date,
    },
});
const KeywordModel = mongoose.model('BAIDUNEWS_KEYWORDS', KeywordSchema, 'dev_baidunews_keywords');
module.exports = KeywordModel;
