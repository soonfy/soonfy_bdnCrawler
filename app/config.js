"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const config = {
    dbUrl: 'mongodb://localhost/baidu_news',
    host: 'http://news.baidu.com',
    headers: {
        'Host': 'news.baidu.com',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
        'Cookie': 'LOCALGX=%u5317%u4EAC%7C%30%7C%u5317%u4EAC%7C%30; BAIDUID=E18B383EFDD1CF72238B3DD26C9E268E:FG=1; PSTM=1477364316; BIDUPSID=C0E93A264CABA0EA0EBABF90F5FC5BA9; Hm_lvt_e9e114d958ea263de46e080563e254c4=1477299022,1477357796,1477371390; BDRCVFR[iL4hrzJ0zlT]=mbxnW11j9Dfmh7GuZR8mvqV; BD_CK_SAM=1; PSINO=6; BDSVRTM=258; H_PS_PSSID=',
    },
    timeout: 1000 * 60 * 2,
    timestop: function (s) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(resolve, 1000 * s);
            });
        });
    },
    dbInsert: function (DB, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let _db = new DB(obj);
                yield _db.save();
            }
            catch (error) {
                if (error.errmsg && error.errmsg.includes('E11000 duplicate key error collection')) {
                }
                else {
                    console.log(error);
                }
            }
        });
    }
};
exports.Config = config;
