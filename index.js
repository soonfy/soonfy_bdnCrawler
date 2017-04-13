const mongoose = require('mongoose');

import {Config} from './config.js';
import {Crawler} from './controllers/crawler.js';

console.log('mongodb url', Config.dburl);
mongoose.connect(Config.dbUrl);
mongoose.Promise = global.Promise;
mongoose.set('debug', true);

Crawler.start();
