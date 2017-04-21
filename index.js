const mongoose = require('mongoose');

import {
  Config
} from './config.js';
import {
  Crawler
} from './controllers/crawler.js';

console.log(process.argv);
if (process.argv.length < 4) {
  console.error(`缺少参数。`);
  process.exit();
}

console.log('mongodb url', Config.dbUrl);
mongoose.connect(Config.dbUrl, (error) => {
  if (error) {
    console.error(error);
  }
});
mongoose.Promise = global.Promise;
// mongoose.set('debug', true);

Crawler.start();
