const moment = require('moment');
const rp = require('request-promise');

import {
  Config
} from '../config.js';

import {
  Key
} from '../models/key.js';
import {
  Count
} from '../models/count.js';

import {
  Parser
} from './parser.js';
import {
  ParamsParser
} from './paramsParser.js';
import {
  Keyer,
} from './keyer.js';

let crawl = async function (param) {
  try {
    let $ = await Parser.getData(param);
    let count = await Parser.countParser($);
    // console.log(count);
    while (count === -1) {
      $ = await Parser.getData(param);
      count = await Parser.countParser($);
      // console.log(count);
    }
    let pages = Parser.moreParser($) || [];
    let docs = Parser.dataParser($) || [];
    // console.log(docs.length);
    for (let page of pages) {
      // console.log(page);
      let param = page;
      docs = docs.concat((await crawl(param)).docs);
    }
    // 下一页
    let next = Parser.pageParser($);
    if (next) {
      // console.log(next);
      let param = next;
      docs = docs.concat((await crawl(param)).docs);
    } else {
      console.log(param, 'parse over.');
    }
    return { count, docs };
  } catch (error) {
    console.error(error);
  }
}

/**
 * the start entry
 * @method start
 * @param 
 * @return 
 */
let start = async function () {
  try {
    console.log('start crawl baidu news.');
    let keyer = await Keyer.getKey();
    if (keyer) {
      console.log('关键词');
      console.log(keyer);
      let { key_id, keys, word, date } = keyer;
      for (let _date of keyer.dates) {
        let c_date = _date.end_date, c_count = 0, c_docs = [];
        for (let _keyer of keys) {
          _keyer.date = _date;
          let params = ParamsParser.parse(_keyer);
          let urls = [];
          for (let key in params) {
            urls.push([key, params[key]].join('='))
          }
          let param = urls.join('&');
          param = ['/ns', param].join('?');
          let { count, docs } = await crawl(param);
          c_count += count;
          c_docs = c_docs.concat(docs);
        }
        let _count = await Count.findOneAndUpdate({ keyword: word, date: c_date }, { $set: { keyword: word, date: c_date, count: c_count, create_at: new Date() } }, { new: true, upsert: true });
        console.log('储存 mongo db 数值', _count);
        c_docs = c_docs.map(result => {
          result.id = [word, result.url.replace(/[^\w\d]/g, '')].join(':');
          result.keyword = word;
          result.index_name = 'baidunews_news';
          result.type_name = 'baidunews_news';
          result.createdAt = new Date();
          return result
        })
        console.log('储存 es 数据数量', c_docs.length);
        var options = {
          method: 'POST',
          uri: 'http://' + Config.esUrl.trim() + '/stq/api/v1/pa/baidu/add',
          body: c_docs,
          json: true
        };
        let res = await rp(options);
        console.log('es 返回结果', res);
      }

      console.log(`${word} from ${date.begin_date} to ${date.end_date} crawl over...`);
      console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
      console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
      console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
      let status = await Keyer.update_last(key_id, moment(date.end_date).endOf('day'));
      if (status) {
        console.log('关键词状态更新成功。');
      } else {
        console.log('关键词状态更新失败。');
      }
      await start();
    } else {
      console.log('==============stop===============');
      console.log('==============stop===============');
      console.log('==============stop===============');
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
      console.log('所有关键词都已更新，10分钟后重新开始更新...');
      await Config.timestop(60 * 10);
      await start();
    }
  } catch (error) {
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!! error!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!! error!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!! error!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log(error);
    console.log('出错，休息10秒再来吧');
    await Config.timestop(10);
    await start();
  }
}

let crawler = {
  start
}

export {
  crawler as Crawler
};