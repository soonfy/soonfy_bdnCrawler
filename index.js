const mongoose = require('mongoose');

import {
  Config
} from './config.js';
import {
  Crawler
} from './controllers/crawler.js';

console.log(process.argv);
if (process.argv.length < 3) {
  console.error(`缺少参数。mongo, es 参数，使用配置文件`);
}

import mongo from './mongo';

console.log(Config);

mongo(Config.dbUrl);
// mongo('mongodb://localhost/baidu');
Crawler.start();
