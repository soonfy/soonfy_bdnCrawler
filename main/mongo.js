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
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
exports.default = (mongo_uri) => __awaiter(this, void 0, void 0, function* () {
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'mongoose connection error:'));
    db.once('open', () => {
        return console.log('[mongo] opened successfully');
    });
    let exit = () => {
        db.close(() => {
            console.log('[mongo] info: mongo is disconnected through app termination');
            process.exit(0);
        });
    };
    process.on('SIGINT', exit).on('SIGTERM', exit);
    try {
        yield mongoose.connect(mongo_uri);
    }
    catch (err) {
        console.log(`[mongo] Error connecting to: ${mongo_uri}. ${err}`);
        return process.exit(1);
    }
});
