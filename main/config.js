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
const config = {
    dbUrl: process.argv[2] || require('../config.json').db.uris,
    esUrl: process.argv[3] || require('../config.json').es.hosts,
    host: 'http://news.baidu.com',
    headers: {
        'Host': 'news.baidu.com',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
        'Cookie': 'BAIDUID=807B21B748ACF41D96950682FEEB5EED:FG=1; FP_UID=6382e4346a683ef88dcb0dd7f7f35e48; BDUSS=2EyYzllTTFtMjZ1bmlpNjVYbm5sd1dPRkpSSmdYMjFXNHBWYzNvUGxWaWpBQVJhSVFBQUFBJCQAAAAAAAAAAAEAAACcBEoURGVpdHlfeGlhb2RpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKNz3Fmjc9xZM; pgv_pvi=1500606464; PSTM=1510305890; OUTFOX_SEARCH_USER_ID_NCOO=992422097.6914252; Hm_lvt_e9e114d958ea263de46e080563e254c4=1511772041; BIDUPSID=7B5DF5C4C7038E1F36D96D0644175447; MCITY=-%3A; BDRCVFR[iL4hrzJ0zlT]=mbxnW11j9Dfmh7GuZR8mvqV; BD_CK_SAM=1; PSINO=3; BDSVRTM=435; H_PS_PSSID=',
    },
    timeout: 1000 * 60 * 2,
    timestop(s) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(resolve, 1000 * s);
            });
        });
    },
    dbInsert(DB, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield DB.findOneAndUpdate({
                    _id: obj._id
                }, {
                    $set: obj
                }, {
                    upsert: true,
                    new: true
                });
            }
            catch (error) {
                console.error(`update error.`);
                console.error(error);
            }
        });
    },
    parseTime(str) {
        let time, match, hour = /(\d+)小时前/g, minute = /(\d+)分钟前/g;
        if (match = hour.exec(str)) {
            time = Date.now() - match[1] * 1000 * 60 * 60;
            time = new Date(time);
        }
        else if (match = minute.exec(str)) {
            time = Date.now() - match[1] * 1000 * 60;
            time = new Date(time);
        }
        else {
        }
        return time;
    },
    esInsert(client, id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let resp = yield client.index({
                    index: 'baidunews_news',
                    type: 'baidunews_news',
                    id: id,
                    body: body
                });
                return resp;
            }
            catch (error) {
                console.error(`es index error.`);
                console.error(error);
                console.error(`sleep 10s to index.`);
                yield this.timestop(10);
                return yield this.esInsert(client, id, body);
            }
        });
    }
};
exports.Config = config;
