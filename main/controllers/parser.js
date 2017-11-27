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
const rp = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');
const config_js_1 = require("../config.js");
const getData = function (param, time = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (time > 10) {
                return {};
            }
            let url = config_js_1.Config.host + param;
            let options = {
                url,
                timeout: config_js_1.Config.timeout,
                headers: config_js_1.Config.headers,
                transform: function (body) {
                    return cheerio.load(body);
                }
            };
            let $ = yield rp(options);
            return $;
        }
        catch (error) {
            console.error(error);
            console.error(param, '第', time, '次采集出错。');
            console.error('休息', time, 's重新开始。');
            yield config_js_1.Config.timestop(time++);
            return yield getData(param, time++);
        }
    });
};
const countParser = function ($, time = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let div = $('.nums').first();
            let str = div.text();
            let count = str.replace(/\D/g, '');
            count = parseInt(count);
            if (time >= 20) {
                return 0;
            }
            if (count !== count) {
                console.error('--------------------error count---------------------------');
                console.error(count);
                console.error('页面抓取错误，需要重新抓取。');
                console.error('休息', 60, 's重新抓取。');
                yield config_js_1.Config.timestop(60);
                return -1;
            }
            return count;
        }
        catch (error) {
            console.error(error);
            console.error('第', time, '次采集出错。');
            console.error('休息', 60, 's重新开始。');
            yield config_js_1.Config.timestop(60);
            return countParser($, time);
        }
    });
};
const dataParser = function ($, time) {
    try {
        let divs = $('div.result');
        let len = divs.length;
        console.log('本页总共', len, '条数据。');
        let results = [];
        divs.map((ind, div) => {
            let title = $(div).children('h3').text().trim();
            let info = $(div).find('.c-author').text().trim() || $(div).find('.c-title-author').text().trim() || '';
            info = info.trim().replace(/[年|月]/g, '-').replace(/日/g, '');
            let infos = info.split(/\s+/);
            let author;
            if (!infos[0].match(/\d{4}\-\d{2}\-\d{2}/)) {
                author = infos.shift();
            }
            else {
                author = '';
            }
            let times = [infos[0], infos[1]].join(' ');
            let publishedAt = config_js_1.Config.parseTime(times) || new Date([infos[0], infos[1]].join(' ')) || new Date();
            let date = moment(publishedAt).format('YYYY-MM-DD');
            $(div).find('.c-author').text('');
            $(div).find('.c-title-author').text('');
            $(div).find('.c-info').text('');
            let summary = $(div).find('.c-summary').text().trim() || $(div).find('.c-title-author').text().trim() || '';
            summary = summary.endsWith('...') ? summary.slice(0, -3) : summary;
            let url = $(div).children('h3').children('a').attr('href').trim() || '';
            results.push({
                title,
                author,
                publishedAt,
                summary,
                url,
                date
            });
        });
        let count = results.length;
        console.log('总共采集到', count, '条数据。');
        if (len !== count) {
            throw new Error('结果采集数量不正确。');
        }
        return results;
    }
    catch (error) {
        console.error(error);
        console.error('第', time, '次采集出错。');
        console.error('休息', time, 's重新开始。');
        return dataParser($, time++);
    }
};
const moreParser = ($, time) => {
    try {
        let aes = $('.c-more_link');
        let pages = [];
        aes.map((ind, a) => {
            if ($(a).attr('href')) {
                pages.push($(a).attr('href'));
            }
        });
        return pages;
    }
    catch (error) {
        console.error(error);
        console.error('第', time, '次采集出错。');
        console.error('休息', time, 's重新开始。');
        return moreParser($, time++);
    }
};
const pageParser = function ($, time) {
    try {
        let pages = $('#page').find('a.n');
        let next;
        pages.map((ind, page) => {
            if ($(page).text().includes('下一页')) {
                next = $(page).attr('href');
                return;
            }
        });
        return next;
    }
    catch (error) {
        console.error(error);
        console.error('第', time, '次采集出错。');
        console.error('休息', time, 's重新开始。');
        return dataParser($, time++);
    }
};
const parser = {
    getData,
    countParser,
    dataParser,
    pageParser,
    moreParser
};
exports.Parser = parser;
