"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const KeySchema = new Schema({
    key: {
        type: String,
        index: true
    },
    tn: {
        type: String,
        default: 'newsdy'
    },
    q1: {
        type: String,
        default: ''
    },
    q3: {
        type: String,
        default: ''
    },
    q4: {
        type: String,
        default: ''
    },
    q6: {
        type: String,
        default: ''
    },
    s: {
        type: Number,
        default: 2
    },
    isCrawled: {
        type: Number,
        default: 0
    },
    updatedAt: Date,
    createdAt: Date
});
const KeyModel = mongoose.model('keys', KeySchema);
exports.Key = KeyModel;
