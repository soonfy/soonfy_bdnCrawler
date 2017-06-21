import * as filer from 'filer_sf';
import * as path from 'path';
const mongoose = require('mongoose');

import {
  Config
} from './config.js';
import {
  Key
} from './models/key.js';

console.log('mongodb url', Config.dbUrl);
mongoose.connect(Config.dbUrl);
mongoose.Promise = global.Promise;

/**
 *
 *  质检项目
 *
 */
const start_nhj = async() => {
  try {
    let nhj = '../source/nhj.xlsx';
    let nhj_id = '../source/nhj-ids.xlsx';
    nhj = filer.read(path.join(__dirname, nhj));
    // console.log(nhj);
    let resp = [];
    for (let name in nhj) {
      // console.log(name);
      let lines = nhj[name];
      lines.shift();
      let promises = lines.map(async(line) => {
        let words = line.slice(1);
        let keys = words.map(_word => {
          let words = _word.split(/\s*\+\s*/);
          return {
            key: `[${words.join(' ')}] + - `,
            updatedAt: new Date('2016.11.31'),
            start: new Date('2016.11.31'),
            createdAt: new Date(),
            title: `${name}-${line[0]}`,
            isCrawled: 0,
            q1: words.join(' '),
            tn: 'newsdy',
            s: 2,
            q3: '',
            q4: '',
            q6: '',
          }
        })
        keys = await Key.create(keys);
        keys.map(x => {
          resp.push({
            title: x.title,
            key: x.q1,
            id: x._id
          })
        })
        return keys;
      })
      await Promise.all(promises);
    }
    filer.write(path.join(__dirname, nhj_id), resp);
    console.log(resp);
    process.exit();
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 *  城乡指标
 *
 */
const start_yyh = async() => {
  try {
    let yyh = '../source/yyh.xlsx';
    let yyh_id = '../source/yyh-ids.xlsx';
    yyh = filer.read(path.join(__dirname, yyh));
    // console.log(yyh);
    let resp = [];
    for (let name in yyh) {
      console.log(name);
      if (name.includes('Sheet')) {
        continue;
      }
      let lines = yyh[name];
      lines.shift();
      let promises = lines.map(async(line) => {
        let words = line.slice(1);
        let keys = words.map(_word => {
          let words = _word.split(/\s*\+\s*/);
          return {
            key: `[${words.join(' ')}] + - `,
            updatedAt: new Date('2016.12.31'),
            start: new Date('2016.12.31'),
            createdAt: new Date(),
            title: `${name}-${line[0]}`,
            isCrawled: 0,
            q1: words.join(' '),
            tn: 'newsdy',
            s: 2,
            q3: '',
            q4: '',
            q6: '',
          }
        })
        keys = await Key.create(keys);
        keys.map(x => {
          resp.push({
            title: x.title,
            key: x.q1,
            id: x._id
          })
        })
        return keys;
      })
      await Promise.all(promises);
    }
    filer.write(path.join(__dirname, yyh_id), resp);
    console.log(resp);
    process.exit();
  } catch (error) {
    console.error(error);
  }
}

start_nhj();
// start_yyh();