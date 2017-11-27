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
const rp = require('request-promise');
const config_js_1 = require("../config.js");
const count_js_1 = require("../models/count.js");
const parser_js_1 = require("./parser.js");
const paramsParser_js_1 = require("./paramsParser.js");
const keyer_js_1 = require("./keyer.js");
let crawl = function (param) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let $ = yield parser_js_1.Parser.getData(param);
            let count = yield parser_js_1.Parser.countParser($);
            while (count === -1) {
                $ = yield parser_js_1.Parser.getData(param);
                count = yield parser_js_1.Parser.countParser($);
            }
            let pages = parser_js_1.Parser.moreParser($) || [];
            let docs = parser_js_1.Parser.dataParser($) || [];
            for (let page of pages) {
                let param = page;
                docs = docs.concat((yield crawl(param)).docs);
            }
            let next = parser_js_1.Parser.pageParser($);
            if (next) {
                let param = next;
                docs = docs.concat((yield crawl(param)).docs);
            }
            else {
                console.log(param, 'parse over.');
            }
            return { count, docs };
        }
        catch (error) {
            console.error(error);
        }
    });
};
let start = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('start crawl baidu news.');
            let keyer = yield keyer_js_1.Keyer.getKey();
            if (keyer) {
                console.log('关键词');
                console.log(keyer);
                let { key_id, keys, word, date } = keyer;
                for (let _date of keyer.dates) {
                    let c_date = _date.end_date, c_count = 0, c_docs = [];
                    for (let _keyer of keys) {
                        _keyer.date = _date;
                        let params = paramsParser_js_1.ParamsParser.parse(_keyer);
                        let urls = [];
                        for (let key in params) {
                            urls.push([key, params[key]].join('='));
                        }
                        let param = urls.join('&');
                        param = ['/ns', param].join('?');
                        let { count, docs } = yield crawl(param);
                        c_count += count;
                        c_docs = c_docs.concat(docs);
                    }
                    let _count = yield count_js_1.Count.findOneAndUpdate({ keyword: word, date: c_date }, { $set: { keyword: word, date: c_date, count: c_count, create_at: new Date() } }, { new: true, upsert: true });
                    console.log('储存 mongo db 数值', _count);
                    c_docs = c_docs.map(result => {
                        result.id = [word, result.url.replace(/[^\w\d]/g, '')].join(':');
                        result.keyword = word;
                        result.index_name = 'baidunews_news';
                        result.type_name = 'baidunews_news';
                        result.createdAt = new Date();
                        return result;
                    });
                    console.log('储存 es 数据数量', c_docs.length);
                    var options = {
                        method: 'POST',
                        uri: 'http://' + config_js_1.Config.esUrl.trim() + '/stq/api/v1/pa/baidu/add',
                        body: c_docs,
                        json: true
                    };
                    let res = yield rp(options);
                    console.log('es 返回结果', res);
                }
                console.log(`${word} from ${date.begin_date} to ${date.end_date} crawl over...`);
                console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
                console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
                console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
                console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
                let status = yield keyer_js_1.Keyer.update_last(key_id, moment(date.end_date).endOf('day'));
                if (status) {
                    console.log('关键词状态更新成功。');
                }
                else {
                    console.log('关键词状态更新失败。');
                }
                yield start();
            }
            else {
                console.log('==============stop===============');
                console.log('==============stop===============');
                console.log('==============stop===============');
                console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
                console.log('所有关键词都已更新，10分钟后重新开始更新...');
                yield config_js_1.Config.timestop(60 * 10);
                yield start();
            }
        }
        catch (error) {
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
