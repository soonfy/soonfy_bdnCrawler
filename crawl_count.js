import {
  Parser
} from './controllers/parser.js';
import {
  ParamsParser
} from './controllers/paramsParser.js';
import {
  Config
} from './config.js';

import * as fs from 'fs';
import * as path from 'path';

import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import * as filer from 'filer_sf';

const starter = async() => {
  try {
    let host = Config.host;
    let filepath = './source/demo.xlsx';
    let resultpath = './source/渠道.xlsx';
    filepath = path.join(__dirname, '../source/demo.xlsx');
    resultpath = path.join(__dirname, '../source/渠道.xlsx');
    let data = filer.read(filepath);
    let results = [];
    // console.log(data);
    let topics = data['监测关键词'];
    let reposts = data['转载关键词'];
    reposts.shift();
    let r_words = [];
    reposts.map(x => {
      x.map(y => r_words.push(y));
    })
    // r_words = r_words.slice(0, 1);
    console.log(r_words);
    let news = data['重大新闻关键词'];
    let head = topics.shift().slice(0, 7);
    console.log(head);
    results.push(head);
    for (let line of topics) {
      console.log(line[2]);
      let cont = line.slice(0, 5);
      let keys = line.slice(5);
      let sum = 0;
      for (let key of keys) {
        let q3 = '';
        r_words.map(y => {
          y = y.replace('XX', key);
          q3 += y;
          q3 += '+'
        })
        q3 = q3.slice(0, -1);
        let keyer = {
          key: {
            q3: q3
          },
          date: {
            begin_date: line[3].replace(/\./g, '-'),
            end_date: line[4].replace(/\./g, '-')
          }
        }
        let params = ParamsParser.parse(keyer);
        let urls = [];
        for (let key in params) {
          urls.push([key, params[key]].join('='))
        }
        let param = urls.join('&');
        param = ['/ns', param].join('?');
        let uri = host + param;
        console.log(uri);
        let options = {
          uri,
          timeout: Config.timeout,
          headers: Config.headers,
          transform: function (body) {
            return cheerio.load(body);
          }
        }
        let $ = await rp(options);
        let data = $('.nums').text();
        console.log(data);
        let num = data.replace(/\D/g, '') - 0;
        console.log(num);
        let icont = cont.slice(0);
        icont.push(q3);
        icont.push(num);
        results.push(icont);
        sum += num;
      }
      console.log('新闻总量', sum);
      cont.push('新闻总量');
      cont.push(sum);
      results.push(cont);
    }
    console.log(results);
    filer.write(resultpath, results);
    console.log(`all over...`);
  } catch (error) {
    console.log(error);
  }
}

starter();
