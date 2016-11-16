"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const mongoose = require('mongoose');
const config_js_1 = require('./config.js');
mongoose.connect(config_js_1.Config.dbUrl);
mongoose.Promise = global.Promise;
const key_js_1 = require('./models/key.js');
let main = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('keyer init...');
            let res = yield key_js_1.Key.update({ isCrawled: 3 }, { isCrawled: 0 }, { multi: true });
            console.log('==================================keyer modify success=====================');
            console.log('==================================keyer modify success=====================');
            console.log('==================================keyer modify success=====================');
            console.log(res);
            yield mongoose.disconnect();
        }
        catch (error) {
            console.log(error);
            console.log('==================================keyer modify error=====================');
            console.log('==================================keyer modify error=====================');
            console.log('==================================keyer modify error=====================');
            yield main();
        }
    });
};
main();
