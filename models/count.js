const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountSchema = new Schema({
  key_id: {
    type: String,
    index: true
  },
  date: {
    type: Date,
  },
  count: {
    type: Number,
  },
  create_at: {
    type: Date,
  },
})

//测试
const CountModel = mongoose.model('baidunews_counts', CountSchema);

export {
  CountModel as Count
}