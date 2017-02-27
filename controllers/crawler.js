const moment = require('moment');

import {Config} from '../config.js';

import {News} from '../models/news.js';
import {Key} from '../models/key.js';
import {Count} from '../models/count.js';

import {Parser} from './parser.js';
import {ParamsParser} from './paramsParser.js';
import {Keyer} from './keyer.js';


/**
 * crawl news from url param, and crawl pages, update by _id
 * @method crawl
 * @param {any} params - contains _id and url param
 * @return 
 */
let crawlAndInsert = async function (params) {
  try {
    let {_id, param} = params
    let $ = await Parser.getData(param);
    let results = Parser.dataParser($);
    let count = Parser.countParser($);
    if(param.includes('begin_date=')){
      let date = param.split('begin_date=')[1].slice(0, 10);
      let publishedAt = new Date(date) || new Date;
      console.log('新闻显示总量', count);
      let _count = {
        _id: [_id, date].join('#@#'),
        keyId: _id,
        publishedAt,
        count,
        createdAt: new Date
      }
      await Config.dbInsert(Count, _count);
    }
    let promises = results.map(result => {
      result.createdAt = new Date();
      result.keyId = _id;
      result._id = [_id, result.url].join('#@#');
      return Config.dbInsert(News, result);
    })
    await Promise.all(promises);
    let next = Parser.pageParser($);
    if (next) {
      console.log(next);
      let param = next;
      await crawlAndInsert({_id, param});
    } else {
      console.log(_id, param, 'parse over.');
    }
  } catch (error) {
    console.log(error);
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
    let keyer = await Keyer.getKey();
    if (keyer) {
      let params = ParamsParser.parse(keyer);
      let urls = [];
      for (let key in params) {
        urls.push([key, params[key]].join('='))
      }
      let param = urls.join('&');
      param = ['/ns', param].join('?');
      let _id = keyer.key._id
      let dated = keyer.date.end_date
      await crawlAndInsert({ _id, param });
      await Key.findOneAndUpdate({ _id: _id, isCrawled: 1 }, { isCrawled: 0, updatedAt: new Date(dated) }, {});
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
    await Key.findOneAndUpdate({ _id: _id, isCrawled: 1 }, { isCrawled: 2, updatedAt: new Date(dated) }, {});
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

export {crawler as Crawler};