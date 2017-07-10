const mongoose = require('mongoose');

import {
  Config
} from '../config.js';
import {
  Key
} from '../models/key.js';

console.log('mongodb url', Config.dbUrl);
mongoose.connect(Config.dbUrl);
mongoose.Promise = global.Promise;

const start = async(filmid, filmname, keys, date) => {
  try {
    let baidu_ids = [];
    let temp_date = typeof date === 'string' ? new Date(date) : date;
    for (let words of keys) {
      let _key = {
        key: '',
        updatedAt: temp_date - 1000 * 60 * 60 * 24,
        start: temp_date - 1000 * 60 * 60 * 24,
        createdAt: new Date(),
        title: `${filmid}-${filmname}`,
        isCrawled: 0,
        q1: '',
        tn: 'newsdy',
        s: 2,
        q3: '',
        q4: '',
        q6: '',
      }
      words.map(x => {
        x = x.trim();
        _key.key += x + ' ';
        if (x.startsWith('-')) {
          _key.q4 += x.slice(1) + ' ';
        } else {
          _key.q1 += x + ' ';
        }
      })
      _key.key = _key.key.trim();
      _key.q1 = _key.q1.trim();
      _key.q4 = _key.q4.trim();
      // console.log(_key);
      _key = await Key.findOneAndUpdate({
        key: _key.key
      }, {
        $set: _key
      }, {
        upsert: true,
        new: true
      });
      console.log(_key);
      baidu_ids.push(_key._id);
    }
    console.log(`all keys insert over.`);
    console.log(baidu_ids);
    return baidu_ids;
  } catch (error) {
    console.error(error);
  }
}

start('123', 'ceshi', [
  ['1', '2'],
  ['3', '-4']
], '2017-08-01')