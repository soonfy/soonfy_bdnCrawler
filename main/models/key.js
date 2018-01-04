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
KeywordSchema.index({ crawl_status: 1, crawling_at: 1 });
KeywordSchema.index({ crawl_status: 1, last_crawl_at: 1 });
const KeywordModel = mongoose.model('BAIDUNEWS_KEYWORDS', KeywordSchema, 'dev_baidunews_keywords');
module.exports = KeywordModel;
