"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const NewsSchema = new Schema({
    _id: {
        type: String,
        index: true,
        unique: true
    },
    keyId: String,
    url: String,
    title: String,
    author: String,
    summary: String,
    publishedAt: Date,
    createdAt: Date
});
const NewsModel = mongoose.model('news', NewsSchema);
exports.News = NewsModel;
