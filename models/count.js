const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const countSchema = new Schema({
  _id: {        //时间date+关键词_id
    type: String,
    unique: true
  },
  keyId: String,  //关键词_id
  date: String,
  count: Number,
  publishedAt: Date,  //新闻发布时间
  createdAt: Date
})

//测试
const CountModel = mongoose.model('baidunews_counts', countSchema);

export {CountModel as Count}