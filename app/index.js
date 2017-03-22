"use strict";
const mongoose = require('mongoose');
const config_js_1 = require("./config.js");
const crawler_js_1 = require("./controllers/crawler.js");
mongoose.connect(config_js_1.Config.dbUrl);
mongoose.Promise = global.Promise;
crawler_js_1.Crawler.start();
