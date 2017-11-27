"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CountSchema = new Schema({
    keyword: {
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
});
const CountModel = mongoose.model('dev_baidunews_counts', CountSchema);
exports.Count = CountModel;
