"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const moment = require('moment');
const key_js_1 = require("../models/key.js");
let getKey = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let last = new Date(moment().startOf('day'));
            let key = yield key_js_1.Key.findOneAndUpdate({ updatedAt: { $lt: last }, isCrawled: 0 }, { isCrawled: 1 }, { sort: { updatedAt: 1 } });
            if (key) {
                let begin_date = moment(moment(key.updatedAt).subtract(3, 'days')).format('YYYY-MM-DD');
                let end_date = moment().format('YYYY-MM-DD');
                let date = {
                    begin_date,
                    end_date
                };
                return { key, date };
            }
            else {
                return;
            }
        }
        catch (error) {
            console.log(error);
        }
    });
};
let keyer = {
    getKey
};
exports.Keyer = keyer;
