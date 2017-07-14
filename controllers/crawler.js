const moment = require('moment');
// const elasticsearch = require('elasticsearch');
const http = require('http');

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
  Keyer
} from './keyer.js';

// const client = new elasticsearch.Client({
//   hosts: [
//     Config.esUrl
//   ]
// });


/**
 * crawl news from url param, and crawl pages, update by _id
 * @method crawl
 * @param {any} params - contains _id and url param
 * @return 
 */
let crawlAndInsert = async function (params, options) {
  try {
    let {
      _id,
      param
    } = params;
    let {
      key
    } = options;
    let $ = await Parser.getData(param);
    let count = await Parser.countParser($);
    while (count === -1) {
      $ = await Parser.getData(param);
      count = await Parser.countParser($);
    }
    if (options.date) {
      await Count.findOneAndUpdate({
        key_id: _id,
        date: new Date(options.date)
      }, {
        $set: {
          key_id: _id,
          date: new Date(options.date),
          count,
          createdAt: new Date()
        }
      }, {
        upsert: true,
        new: true
      })
    }
    let pages = Parser.moreParser($);
    let results = Parser.dataParser($);

    console.log('储存 es 数据数量', results.length);
    // let promises = results.map(result => {
    //   let id = [_id, result.url].join('').replace(/[^\w\d]/g, '');
    //   result.createdAt = new Date();
    //   result.keyId = _id;
    //   // console.log(id);
    //   // console.log(result);
    //   return Config.esInsert(client, id, result)
    // })
    // await Promise.all(promises);
    results = results.map(result => {
      result.id = [_id, result.url].join('').replace(/[^\w\d]/g, '');
      result.keyId = _id;
      result.index_name = 'baidunews_news';
      result.type_name = 'baidunews_news';
      result.createdAt = new Date();
      return result
    })
    console.log(results);
    results = JSON.stringify(results);
    const opts = {
      hostname: Config.esUrl.trim(),
      path: '/stq/api/v1/pa/baidu/add',
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        'Content-Length': Buffer.byteLength(results)
      }
    };
    const req = http.request(opts, (res) => {
      console.log(res.statusCode);
    });
    req.write(results);
    // 相同新闻
    console.log(pages);
    for (let page of pages) {
      let param = page;
      await crawlAndInsert({
        _id,
        param
      }, {
        key
      });
    }
    // 下一页
    let next = Parser.pageParser($);
    if (next) {
      console.log(next);
      let param = next;
      await crawlAndInsert({
        _id,
        param
      }, {
        key
      });
    } else {
      console.log(_id, param, 'parse over.');
    }
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
      for (let date of keyer.dates) {
        keyer.date = date;
        console.log(keyer.date);
        let params = ParamsParser.parse(keyer);
        let urls = [];
        for (let key in params) {
          urls.push([key, params[key]].join('='))
        }
        let param = urls.join('&');
        param = ['/ns', param].join('?');
        let _id = keyer.key._id + ''
        let options = {
          key: keyer.key.key,
          date: keyer.date.end_date,
        }
        await crawlAndInsert({
          _id,
          param,
        }, options);
      }
      let dated = keyer.date.end_date
      await Key.findOneAndUpdate({
        _id: keyer.key._id,
        isCrawled: 1
      }, {
        isCrawled: 0,
        updatedAt: new Date(moment(dated).add(1, 'days'))
      }, {});
      console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
      console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
      console.log('==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==> ==>');
      console.log('开始下一次采集...');
      await start();
    } else {
      console.log('==============stop===============');
      console.log('==============stop===============');
      console.log('==============stop===============');
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
      console.log('所有关键词都已更新，10分钟后重新开始更新....');
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