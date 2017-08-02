import * as filer from 'filer_sf';
import * as path from 'path';
const mongoose = require('mongoose');

import {
  Config
} from './config.js';
import {
  Key
} from './models/key.js';

console.log('mongodb url', Config.dbUrl.trim());
mongoose.connect(Config.dbUrl.trim());
mongoose.Promise = global.Promise;

const start = async() => {
  try {
    let file = Config.esUrl.trim() || 'daily-20170802',
      source = `../source/${file}.xlsx`,
      result = `../result/${file}-key-ids.xlsx`,
      keys = [];
    source = path.join(__dirname, source);
    let lines = filer.read(source);
    // console.log(lines);
    let citys = lines['分区'];
    lines = lines['关键词'];
    // console.log(lines);
    // console.log(citys);
    lines.shift();
    let index = 0;
    for (let line of lines) {
      ++index;
      if (index >= 2) {
        break;
      }
      for (let city of citys) {
        city = city[0];
        let pre = city + '-' + line.slice(0, 2).join('-'),
          start = new Date(line[2]),
          words = line.slice(4);
        for (let word of words) {
          word = word.replace('东城区', city);
          word = word.split('+').join(' ');
          console.log(word);
          let _key = {
            key: `[${word}] + - `,
            updatedAt: start,
            start: start,
            createdAt: new Date(),
            title: `${[pre]}-${word}`,
            isCrawled: 0,
            q1: word,
            tn: 'newsdy',
            s: 2,
            q3: '',
            q4: '',
            q6: '',
          }
          // console.log(_key);
          let key = await Key.findOneAndUpdate({
            key: _key.key
          }, {
            $set: _key
          }, {
            upsert: true,
            new: true
          });
          keys.push({
            '需求名称': pre,
            '关键词 名称': key.title,
            '关键词 词包': key.q1,
            '关键词 id': key._id
          })
        }
      }
    }
    filer.write(path.join(__dirname, result), keys);
    console.log(keys);
    console.log(`all keys insert over.`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

start();