"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const config_js_1 = require("./config.js");
const crawler_js_1 = require("./controllers/crawler.js");
console.log(process.argv);
if (process.argv.length < 3) {
    console.error(`缺少参数。mongo, es 参数，使用配置文件`);
}
const mongo_1 = require("./mongo");
console.log(config_js_1.Config);
mongo_1.default(config_js_1.Config.dbUrl);
crawler_js_1.Crawler.start();
