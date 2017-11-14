const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KeywordSchema = new Schema({
  keyword: {
    // 关键词词包
    type: String,
  },
  from_id: {
    // 来源id
    type: String,
  },
  start_date: {
    // 开始监测时间, 00:00:00
    type: Date,
  },
  end_date: {
    // 结束监测时间, 23:59:59
    type: Date,
  },
  create_at: {
    // 任务创建时间
    type: Date,
  },
  crawl_status: {
    // 关键词采集状态
    // -1 - 删除， 0 - 正常， 1 - 正在采集， 2 - 数据完成
    type: Number,
  },
  last_crawl_at: {
    // 任务最新采集时间, 23:59:59
    type: Date,
  },
  crawling_at: {
    // 任务正在采集
    type: Date,
  },
})

//测试
const KeywordModel = mongoose.model('BAIDUNEWS_KEYWORDS', KeywordSchema, 'baidunews_keywords');

module.exports = KeywordModel