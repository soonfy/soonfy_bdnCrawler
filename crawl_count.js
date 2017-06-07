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
    news.shift();
    let new_ls = [];
    news.map(x => {
      x.map(y => new_ls.push(y));
    })
    console.log(new_ls);
    let head = topics.shift().slice(0, 5);
    head.push('渠道');
    head.push('链接');
    head.push('转载量');
    console.log(head);
    results.push(head);
    for (let line of topics) {
      console.log(line[2]);
      let cont = line.slice(0, 5);
      let keys = line.slice(5);
      let sum = 0;

      // repost + key
      // for (let key of keys) {
      //   for (let repost of r_words) {
      //     let q1 = repost.replace('XX', key);
      //     console.log(q1);
      //     let keyer = {
      //       key: {
      //         q1: q1
      //       },
      //       date: {
      //         begin_date: line[3].replace(/\./g, '-'),
      //         end_date: line[4].replace(/\./g, '-')
      //       }
      //     }
      //     let params = ParamsParser.parse(keyer);
      //     let urls = [];
      //     for (let key in params) {
      //       urls.push([key, params[key]].join('='))
      //     }
      //     let param = urls.join('&');
      //     param = ['/ns', param].join('?');
      //     let uri = host + param;
      //     console.log(uri);
      //     let options = {
      //       uri,
      //       timeout: Config.timeout,
      //       headers: Config.headers,
      //       transform: function (body) {
      //         return cheerio.load(body);
      //       }
      //     }
      //     let $ = await rp(options);
      //     let data = $('.nums').text();
      //     console.log(data);
      //     let num = data.replace(/\D/g, '') - 0;
      //     console.log(num);
      //     let icont = cont.slice(0);
      //     icont.push(q1);
      //     icont.push(uri);
      //     icont.push(num);
      //     results.push(icont);
      //     sum += num;
      //   }
      // }

      // http://news.baidu.com/ns?from=news&cl=2&bt=1493568000&y0=2017&m0=5&d0=1&y1=2017&m1=5&d1=31&et=1496246399&q1=&submit=%B0%D9%B6%C8%D2%BB%CF%C2&q3=%C0%B4%D4%B4%D6%D0%D1%EB%B5%E7%CA%D3%CC%A8%D7%DB%BA%CF%C6%B5%B5%C0+%C0%B4%D4%B4CCTV1+%C0%B4%D4%B4CCTV%D7%DB%BA%CF%C6%B5%B5%C0+%C0%B4%D4%B4%D1%EB%CA%D3%CD%F8&q4=&mt=0&lm=&s=2&begin_date=2017-5-1&end_date=2017-5-31&tn=newsdy&ct1=1&ct=1&rn=20&q6=
      // http://news.baidu.com/ns?from=news&cl=2&bt=1493568000&y0=2017&m0=5&d0=1&y1=2017&m1=5&d1=31&et=1496246399&q1=&submit=%B0%D9%B6%C8%D2%BB%CF%C2&q3=%E6%9D%A5%E6%BA%90%E4%B8%AD%E5%A4%AE%E7%94%B5%E8%A7%86%E5%8F%B0%E7%BB%BC%E5%90%88%E9%A2%91%E9%81%93%2B%E6%9D%A5%E6%BA%90CCTV1%2B%E6%9D%A5%E6%BA%90CCTV%E7%BB%BC%E5%90%88%E9%A2%91%E9%81%93%2B%E6%9D%A5%E6%BA%90%E5%A4%AE%E8%A7%86%E7%BD%91&q4=&mt=0&lm=&s=2&begin_date=2017-05-01&end_date=2017-05-31&tn=newsdy&ct=1&ct1=1&rn=50&q6

      // repost + keys
      // for (let repost of r_words) {
      //   let q3 = '';
      //   keys.map(y => {
      //     let temp = repost.replace('XX', y);
      //     q3 += temp;
      //     q3 += ' '
      //   })
      //   q3 = q3.slice(0, -1);
      //   console.log(q3);
      //   let keyer = {
      //     key: {
      //       q3: q3
      //     },
      //     date: {
      //       begin_date: line[3].replace(/\./g, '-'),
      //       end_date: line[4].replace(/\./g, '-')
      //     }
      //   }
      //   let params = ParamsParser.parse(keyer);
      //   let urls = [];
      //   for (let key in params) {
      //     urls.push([key, params[key]].join('='))
      //   }
      //   let param = urls.join('&');
      //   param = ['/ns', param].join('?');
      //   let uri = host + param;
      //   console.log(uri);
      //   let options = {
      //     uri,
      //     timeout: Config.timeout,
      //     headers: Config.headers,
      //     transform: function (body) {
      //       return cheerio.load(body);
      //     }
      //   }
      //   let $ = await rp(options);
      //   let data = $('.nums').text();
      //   console.log(data);
      //   let num = data.replace(/\D/g, '') - 0;
      //   console.log(num);
      //   let icont = cont.slice(0);
      //   icont.push(q3);
      //   icont.push(uri);
      //   icont.push(num);
      //   results.push(icont);
      //   sum += num;
      // }

      // repost + key + news
      for (let _news of new_ls) {
        for (let repost of r_words) {
          for (let key of keys) {
            let news_l = [repost.replace('XX', key)];
            news_l = news_l.concat(_news.split('+'));
            news_l = news_l.filter(x => x && x.trim());
            let q1 = news_l.join(' ');
            console.log(q1);
            let keyer = {
              key: {
                q1: q1
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
            icont.push(q1);
            icont.push(uri);
            icont.push(num);
            results.push(icont);
            sum += num;
          }
        }
      }

      console.log('新闻总量', sum);
      cont.push('新闻总量');
      cont.push('加和');
      cont.push(sum);
      results.push(cont);

      filer.write(resultpath, results);
      process.exit();
    }
    console.log(results);
    filer.write(resultpath, results);
    console.log(`all over...`);
  } catch (error) {
    console.log(error);
  }
}

starter();