"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require('moment');
const Key = require('../models/key');
let getKey = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let key = yield Key.findOneAndUpdate({
                crawl_status: 1,
                crawling_at: { $lt: moment().subtract(1, 'hours') }
            }, {
                $set: { crawling_at: new Date() }
            }, {
                sort: { crawling_at: 1 },
                new: true,
            });
            if (!key) {
                key = yield Key.findOneAndUpdate({
                    crawl_status: 0,
                    last_crawl_at: { $lte: new Date() },
                }, {
                    $set: {
                        crawl_status: 1,
                        crawling_at: new Date(),
                    }
                }, {
                    sort: { create_at: -1 },
                    new: true,
                });
            }
            console.log(key);
            if (key) {
                let { from_id, keyword, start_date, end_date, last_crawl_at } = key;
                let start_str = '', end_str = '';
                if (moment(last_crawl_at).subtract(3, 'days').startOf('day') >= moment(start_date).startOf('day')) {
                    start_str = moment(last_crawl_at).subtract(3, 'days').format('YYYY-MM-DD');
                }
                else {
                    start_str = moment(start_date).format('YYYY-MM-DD');
                }
                if (end_date) {
                    end_str = moment(end_date).format('YYYY-MM-DD');
                }
                else {
                    end_str = moment().format('YYYY-MM-DD');
                }
                let dates = [], temp = moment(start_str).startOf('day'), end = moment(end_str).endOf('day');
                while (temp <= end) {
                    let temp_date = moment(temp).format('YYYY-MM-DD');
                    dates.push({
                        begin_date: temp_date,
                        end_date: temp_date
                    });
                    temp = moment(temp_date).add(1, 'days');
                }
                let words = keyword.split('||').map(x => {
                    let _words = x.split('+');
                    let q1 = '', q3 = '', q4 = '';
                    if (_words.length === 1) {
                        q3 = x;
                    }
                    else {
                        _words.map(y => {
                            if (y.slice(0, 1) === '-') {
                                q4 += `+${y}`;
                            }
                            else if (y.length > 0) {
                                q1 += `+${y}`;
                            }
                        });
                    }
                    q1 = q1.slice(1);
                    q4 = q4.slice(1);
                    let temp = {
                        tn: 'newsdy',
                        q1: q1,
                        q3: q3,
                        q4: q4,
                        q6: '',
                        s: 2,
                    };
                    return temp;
                });
                return {
                    key_id: key._id,
                    word: key.keyword,
                    date: {
                        begin_date: start_str,
                        end_date: end_str
                    },
                    keys: words,
                    dates
                };
            }
            else {
                console.log('no to crawl key...');
                return null;
            }
        }
        catch (error) {
            console.log(error);
        }
    });
};
let update_last = (key_id, last_crawl_at) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(last_crawl_at);
        let _key = yield Key.findOneAndUpdate({ _id: key_id, crawl_status: 1 }, { $set: { crawl_status: 0, last_crawl_at: last_crawl_at } }, { new: true });
        if (_key && _key.end_date) {
            _key = yield Key.findOneAndUpdate({ _id: key_id }, { $set: { crawl_status: 2 } }, { new: true });
        }
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
});
let keyer = {
    getKey,
    update_last,
};
exports.Keyer = keyer;
