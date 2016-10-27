"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const KeySchema = new Schema({
    _id: {
        type: String,
        index: true,
        unique: true
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
    isCrawled: Number,
    updateAt: Date,
    createdAt: Date
});
const KeyModel = mongoose.model('keys', KeySchema);
exports.Key = KeyModel;
