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
const config_js_1 = require("../config.js");
const news_js_1 = require("../models/news.js");
const key_js_1 = require("../models/key.js");
const count_js_1 = require("../models/count.js");
const parser_js_1 = require("./parser.js");
const paramsParser_js_1 = require("./paramsParser.js");
const keyer_js_1 = require("./keyer.js");
let crawlAndInsert = function (params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { _id, param } = params;
            let $ = yield parser_js_1.Parser.getData(param);
            let count = parser_js_1.Parser.countParser($);
            let pages = parser_js_1.Parser.moreParser($);
            let results = parser_js_1.Parser.dataParser($);
            let promises = results.map(result => {
                result.createdAt = new Date();
                result.keyId = _id;
                result._id = [result.date, _id, result.url].join('#@#');
                return config_js_1.Config.dbInsert(news_js_1.News, result);
            });
            yield Promise.all(promises);
            console.log(pages);
            for (let page of pages) {
                let param = page;
                yield crawlAndInsert({ _id, param });
            }
            let next = parser_js_1.Parser.pageParser($);
            if (next) {
                console.log(next);
                let param = next;
                yield crawlAndInsert({ _id, param });
            }
            else {
                console.log(_id, param, 'parse over.');
            }
        }
        catch (error) {
            console.log(error);
        }
    });
};
let start = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let keyer = yield keyer_js_1.Keyer.getKey();
            if (keyer) {
                let params = paramsParser_js_1.ParamsParser.parse(keyer);
                let urls = [];
                for (let key in params) {
                    urls.push([key, params[key]].join('='));
                }
                let param = urls.join('&');
                param = ['/ns', param].join('?');
                let _id = keyer.key._id;
                let dated = keyer.date.end_date;
                yield crawlAndInsert({ _id, param });
                yield key_js_1.Key.findOneAndUpdate({ _id: _id, isCrawled: 1 }, { isCrawled: 0, updatedAt: new Date(dated) }, {});
                console.log(keyer.date);
                let dates = yield news_js_1.News.distinct('date', { publishedAt: { $gte: new Date(keyer.date.begin_date), $lte: new Date(keyer.date.end_date) } });
                console.log(dates);
                let promises = dates.map((date) => __awaiter(this, void 0, void 0, function* () {
                    let agg = yield news_js_1.News.count({ keyId: _id, date: date });
                    let _count = {
                        _id: [date, _id].join('#@#'),
                        keyId: '' + _id,
                        date: date,
                        count: agg,
                        publishedAt: new Date(date),
                        createdAt: new Date
                    };
                    return yield config_js_1.Config.dbInsert(count_js_1.Count, _count);
                }));
                yield Promise.all(promises);
                console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
                console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
                console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
                console.log('开始下一次采集...');
                yield start();
            }
            else {
                console.log('==============stop===============');
                console.log('==============stop===============');
                console.log('==============stop===============');
                console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
                console.log('所有关键词都已更新，10分钟后重新开始更新....');
                yield config_js_1.Config.timestop(60 * 10);
                yield start();
            }
        }
        catch (error) {
            yield key_js_1.Key.findOneAndUpdate({ _id: _id, isCrawled: 1 }, { isCrawled: 2, updatedAt: new Date(dated) }, {});
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!! error!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!! error!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!! error!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.log(error);
            console.log('出错，休息10秒再来吧');
            yield config_js_1.Config.timestop(10);
            yield start();
        }
    });
};
let crawler = {
    start
};
exports.Crawler = crawler;
