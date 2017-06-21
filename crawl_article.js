import {
  Parser
} from './controllers/parser.js';
import {
  ParamsParser
} from './controllers/paramsParser.js';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as url from 'url';
const URL = require('url').URL;

import * as _ from 'lodash';
import * as moment from 'moment';
import * as filer from 'filer_sf';

import {
  Config
} from './config.js';

const starter = async() => {
  try {
    let filepath = './source/';
    let file = './source/news.csv';
    fs.writeFileSync(file, '项目,新闻标题,新闻链接,新闻来源,新闻摘要,新闻发表时间,新闻采集时间\r\n')
    let lines = fs.readFileSync('./source/dianli.csv', 'utf-8').split('\r');
    console.log(lines);
    lines.shift();
    for (let _line of lines) {
      let infos = _line.split('\t');
      infos.filter(x => x && x.trim());
      let keys = infos.slice(3);
      for (let key of keys) {
        if (key.trim()) {
          let keyer = {
            key: {
              q1: key.split(/\s*\+\s*/).join('+')
            },
            date: {
              begin_date: infos[1].replace(/\./g, '-'),
              end_date: infos[2].replace(/\./g, '-')
            }
          }
          let params = ParamsParser.parse(keyer);
          let urls = [];
          for (let key in params) {
            urls.push([key, params[key]].join('='))
          }
          let param = urls.join('&');
          param = ['/ns', param].join('?');
          let $ = await Parser.getData(param);
          let results = Parser.dataParser($);
          results.map(_res => {
            let str = [infos[0] + '-' + infos[3], _res.title.replace(/,/g, '，'), _res.url.replace(/,/g, '，'), _res.author.replace(/,/g, '，'), _res.summary.replace(/,/g, '，'), _res.publishedAt, new Date()].join(',') + '\r\n';
            fs.appendFileSync(file, str);
          })
          let next = Parser.pageParser($);
          while (next) {
            console.log(next);
            let $ = await Parser.getData(next);
            let results = Parser.dataParser($);
            results.map(_res => {
              let str = [infos[0] + '-' + infos[3], _res.title.replace(/,/g, '，'), _res.url.replace(/,/g, '，'), _res.author.replace(/,/g, '，'), _res.summary.replace(/,/g, '，'), _res.publishedAt, new Date()].join(',') + '\r\n';
              fs.appendFileSync(file, str);
            })
            next = Parser.pageParser($);
          }
        }
      }
      console.log(`${infos[0] + '-' + infos[3]} parse over...`);
    }
    console.log(`all over...`);
  } catch (error) {
    console.log(error);
  }
}

// starter();

let crawl = async(param) => {
  try {
    let $ = await Parser.getData(param);
    let pages = Parser.moreParser($);
    let results = Parser.dataParser($);
    // 相同新闻
    console.log(pages);
    for (let page of pages) {
      let param = page;
      let $ = await Parser.getData(param);
      results = results.concat(Parser.dataParser($));
    }
    console.log(results.length);
    return results;
  } catch (error) {
    console.error(error);
  }
}

/**
 *  不包含重大新闻的转发量
 */
const repost = async() => {
  try {
    let host = Config.host;
    let filepath = path.join(__dirname, '../source/repost.xlsx');
    let uripath = path.join(__dirname, '../source/uri.xlsx');
    let resultpath;
    let articlepath;
    let data = filer.read(filepath);
    let results = [];
    // console.log(data);
    let topics = data['监测关键词'];
    let reposts = data['转载关键词'];

    let uris = filer.read(uripath);
    uris = uris['官网链接'];
    uris.shift();
    let uri_ls = [];
    uris.map(x => {
      x[3] ? uri_ls.push(x[3]) : uri_ls.push('');
    })
    console.log(uri_ls);

    let head = topics.shift().slice(0, 5);
    head.push('渠道');
    head.push('链接');
    head.push('转载量');
    console.log(head);
    results.push(head);

    let index = 0;
    for (let line of topics) {
      console.log(line[2]);
      let keys = line.slice(5);
      let articles = [],
        all_articles = [];
      let sum = 0;
      let hostname = null;
      if (uri_ls[index] && uri_ls[index].includes('http')) {
        hostname = new URL(uri_ls[index]).hostname;
        let names = hostname.split('.');
        hostname = names.slice(-2, -1).pop() + '.';
      }
      console.log(++index);
      console.log('hostname', hostname);
      for (let key of keys) {
        let q1 = key;
        let date = '2017-05-01';
        let k_articles = [];
        while (date.includes('2017-05')) {
          console.log(date);
          let q1 = key;
          // console.log(q1);
          let keyer = {
            key: {
              q1: q1
            },
            date: {
              begin_date: date,
              end_date: date
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
          let _articles = await crawl(param);

          // 下一页
          let $ = await Parser.getData(param);
          let next = Parser.pageParser($);
          while (next) {
            // console.log(next);
            let param = next;
            _articles = _.concat(_articles, await crawl(param));
            let $ = await Parser.getData(param);
            next = Parser.pageParser($);
          }
          let icont = line.slice(0, 3);
          icont.push(date);
          icont.push(date);
          icont.push(q1);
          icont.push(uri);
          icont.push(_articles.length);
          results.push(icont);
          k_articles = _.concat(k_articles, _articles);
          _articles = null;
          date = moment(new Date(date) - 0 + 1000 * 60 * 60 * 24).format('YYYY-MM-DD');
        }
        console.log(k_articles.length);
        all_articles = _.concat(all_articles, k_articles);
        k_articles = _.uniqBy(k_articles, 'url');
        if (hostname) {
          k_articles = k_articles.filter(x => {
            return !x.url.includes(hostname);
          })
        }
        if (q1.includes('央视网')) {
          let len = k_articles.length;
          k_articles = k_articles.slice(0, Math.round(len / 15));
        }
        console.log(k_articles.length);
        articles = _.concat(articles, k_articles);
      }
      console.log(articles.length);
      articles = _.uniqBy(articles, 'url');
      sum = articles.length;
      console.log(sum);
      articlepath = path.join(__dirname, `../source/渠道内容-${index}.xlsx`);
      filer.write(articlepath, all_articles);

      let cont = line.slice(0, 5);
      cont.push('新闻总量');
      cont.push('加和');
      cont.push(sum);
      results.push(cont);
      articles = null;
      cont = null;
      sum = null;
      hostname = null;

      resultpath = path.join(__dirname, `../source/渠道-${index}.xlsx`);
      filer.write(resultpath, results);
      process.exit();
    }
    console.log(results);
    resultpath = path.join(__dirname, `../source/渠道.xlsx`);
    filer.write(resultpath, results);
    console.log(`all over...`);
  } catch (error) {
    console.error(error);
  }
}

repost();

/**
 *  包含重大新闻的转发量
 */
const newer = async() => {
  try {
    let host = Config.host;
    let filepath = path.join(__dirname, '../source/demo.xlsx');
    let uripath = path.join(__dirname, '../source/uri.xlsx');
    let resultpath;
    let articlepath;
    let data = filer.read(filepath);
    let results = [];
    // console.log(data);
    let topics = data['监测关键词'];
    let reposts = data['转载关键词'];

    let news = data['重大新闻关键词'];
    news.shift();
    let new_ls = [];
    news.map(x => {
      x.map(y => new_ls.push(y));
    })
    console.log(new_ls);

    let uris = filer.read(uripath);
    uris = uris['官网链接'];
    uris.shift();
    let uri_ls = [];
    uris.map(x => {
      x[3] ? uri_ls.push(x[3]) : uri_ls.push('');
    })
    console.log(uri_ls);

    let head = topics.shift().slice(0, 5);
    head.push('渠道');
    head.push('链接');
    head.push('转载量');
    console.log(head);
    results.push(head);

    let index = 0;
    for (let line of topics) {
      console.log(line[2]);
      let keys = line.slice(5);
      let articles = [];
      let sum = 0;
      let hostname = null;
      if (uri_ls[index] && uri_ls[index].includes('http')) {
        hostname = new URL(uri_ls[index]).hostname;
        let names = hostname.split('.');
        hostname = names.slice(-2, -1).pop() + '.';
      }
      console.log(++index);
      console.log('hostname', hostname);
      let date = '2017-05-01';
      while (date.includes('2017-05')) {
        console.log(date);

        // 
        // key
        // resultpath = path.join(__dirname, '../source/渠道.xlsx');
        // articlepath = path.join(__dirname, '../source/渠道内容.xlsx');
        // for (let key of keys) {
        //   let q1 = key;
        //   // console.log(q1);
        //   let keyer = {
        //     key: {
        //       q1: q1
        //     },
        //     date: {
        //       begin_date: date,
        //       end_date: date
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
        //   let _articles = await crawl(param);

        //   // 下一页
        //   let $ = await Parser.getData(param);
        //   let next = Parser.pageParser($);
        //   while (next) {
        //     // console.log(next);
        //     let param = next;
        //     _articles = _.concat(_articles, await crawl(param));
        //     let $ = await Parser.getData(param);
        //     next = Parser.pageParser($);
        //   }
        //   // console.log(q1, 'parse over.');
        //   if (q1.includes('央视网')) {
        //     let len = _articles.length;
        //     _articles = _articles.slice(0, Math.round(len / 15));
        //   }
        //   // let icont = cont.slice(0, 3);
        //   // icont.push(date);
        //   // icont.push(date);
        //   // icont.push(q1);
        //   // icont.push(uri);
        //   // icont.push(_articles.length);
        //   // results.push(icont);
        //   articles = _.concat(articles, _articles);
        //   _articles = null;
        // }

        // 
        // key + news
        resultpath = path.join(__dirname, '../source/新闻.xlsx');
        articlepath = path.join(__dirname, '../source/新闻内容.xlsx');
        for (let key of keys) {
          for (let _news of new_ls) {
            let news_l = [key];
            news_l = news_l.concat(_news.split('+'));
            news_l = news_l.filter(x => x && x.trim());
            let q1 = news_l.join(' ');
            // console.log(q1);
            let keyer = {
              key: {
                q1: q1
              },
              date: {
                begin_date: date,
                end_date: date
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
            let _articles = await crawl(param);

            // 下一页
            let $ = await Parser.getData(param);
            let next = Parser.pageParser($);
            while (next) {
              // console.log(next);
              let param = next;
              _articles = _.concat(_articles, await crawl(param));
              let $ = await Parser.getData(param);
              next = Parser.pageParser($);
            }
            // console.log(q1, 'parse over.');
            if (q1.includes('央视网')) {
              let len = _articles.length;
              _articles = _articles.slice(0, Math.round(len / 15));
            }
            // let icont = cont.slice(0, 3);
            // icont.push(date);
            // icont.push(date);
            // icont.push(q1);
            // icont.push(uri);
            // icont.push(_articles.length);
            // results.push(icont);
            articles = _.concat(articles, _articles);
            _articles = null;
          }
        }

        date = moment(new Date(date) - 0 + 1000 * 60 * 60 * 24).format('YYYY-MM-DD');
      }

      console.log(articles.length);
      if (hostname) {
        articles = articles.filter(x => {
          return !x.url.includes(hostname);
        })
        console.log(articles.length);
      }
      articles = _.uniqBy(articles, 'url');
      // filer.write(articlepath, articles);
      sum = articles.length;
      console.log(sum);


      let cont = line.slice(0, 5);
      cont.push('新闻总量');
      cont.push('加和');
      cont.push(sum);
      results.push(cont);
      articles = null;
      cont = null;
      sum = null;
      hostname = null;
      date = null;
    }
    console.log(results);
    filer.write(resultpath, results);
    console.log(`all over...`);
  } catch (error) {
    console.log(error);
  }
}

// newer();