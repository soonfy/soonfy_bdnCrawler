const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const countSchema = new Schema({
  _id: {        //关键词_id+时间publishedAt
    type: String,
    index: true,
    unique: true
  },
  keyId: String,  //关键词_id
  count: Number,
  publishedAt: Date,  //新闻发布时间
  createdAt: Date
})

//测试
const CountModel = mongoose.model('baidunews_counts', countSchema);

export {CountModel as Count}