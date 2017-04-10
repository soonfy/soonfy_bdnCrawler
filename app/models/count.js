"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const countSchema = new Schema({
    _id: {
        type: String,
        unique: true
    },
    keyId: String,
    date: String,
    count: Number,
    publishedAt: Date,
    createdAt: Date
});
const CountModel = mongoose.model('baidunews_counts', countSchema);
exports.Count = CountModel;
