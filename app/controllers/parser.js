"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const rp = require('request-promise');
const cheerio = require('cheerio');
const config_js_1 = require('../config.js');
const getData = function (param, time = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (time > 10) {
                return {};
            }
            let url = config_js_1.Config.host + param;
            console.log('now is parse', url);
            let options = {
                url: url,
                timeout: config_js_1.Config.timeout,
                transform: function (body) {
                    return cheerio.load(body);
                }
            };
            let $ = yield rp(options);
            return $;
        }
        catch (error) {
            console.log(error);
            console.log(param, '第', time, '次采集出错。');
            console.log('休息', time, 's重新开始。');
            yield config_js_1.Config.timestop(time++);
            yield getData(param, time++);
        }
    });
};
const countParser = function ($, time) {
    try {
        let div = $('.nums').first();
        let str = div.text();
        console.log(str);
        let count = str.replace(/\D/g, '');
        count = parseInt(count);
        if (count !== count) {
            return countParser($, time++);
        }
        return count;
    }
    catch (error) {
        console.log(error);
        console.log('第', time, '次采集出错。');
        console.log('休息', time, 's重新开始。');
        countParser($, time++);
    }
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
            console.log(infos);
            let author;
            if (!infos[0].match(/\d{4}\-\d{2}\-\d{2}/)) {
                author = infos.shift();
            }
            else {
                author = '';
            }
            let publishedAt = new Date([infos[0], infos[1]].join(' ')) || new Date();
            let summary = $(div).find('.c-summary').text().trim() || $(div).find('.c-title-author').text().trim() || '';
            let url = $(div).children('h3').children('a').attr('href').trim() || '';
            results.push({
                title: title,
                author: author,
                publishedAt: publishedAt,
                summary: summary,
                url: url
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
        console.log(error);
        console.log('第', time, '次采集出错。');
        console.log('休息', time, 's重新开始。');
        dataParser($, time++);
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
        console.log(error);
        console.log('第', time, '次采集出错。');
        console.log('休息', time, 's重新开始。');
        dataParser($, time++);
    }
};
const parser = {
    getData: getData,
    countParser: countParser,
    dataParser: dataParser,
    pageParser: pageParser
};
exports.Parser = parser;
