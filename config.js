/**
 * 配置文件
 */
const elasticsearch = require('elasticsearch');

const config = {
  dbUrl: process.argv[2] || '',
  esUrl: process.argv[3] || '',
  host: 'http://news.baidu.com',
  headers: {
    'Host': 'news.baidu.com',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
    'Cookie': 'BDUSS=kp1VFA2QU5Hc0VqaEFRQjRuRmo0c1FIdGQ5SXlacEwxcnNCSVJPVUZhLXNvSzlZSVFBQUFBJCQAAAAAAAAAAAEAAACcBEoURGVpdHlfeGlhb2RpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKwTiFisE4hYb; BAIDUID=FDFF3008D9037881CFE34DB9F189A185:FG=1; MCITY=-131%3A; BIDUPSID=FDFF3008D9037881CFE34DB9F189A185; PSTM=1490167033; BDRCVFR[iL4hrzJ0zlT]=mbxnW11j9Dfmh7GuZR8mvqV; BD_CK_SAM=1; PSINO=2; BDSVRTM=505; H_PS_PSSID=',
  },
  timeout: 1000 * 60 * 2,
  async timestop(s) {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000 * s);
    });
  },
  async dbInsert(DB, obj) {
    try {
      return await DB.findOneAndUpdate({
        _id: obj._id
      }, {
        $set: obj
      }, {
        upsert: true,
        new: true
      });
    } catch (error) {
      console.error(`update error.`);
      console.error(error);
    }
  },
  parseTime(str) {
    let time,
      match,
      hour = /(\d+)小时前/g,
      minute = /(\d+)分钟前/g;
    if (match = hour.exec(str)) {
      time = Date.now() - match[1] * 1000 * 60 * 60;
      time = new Date(time);
    } else if (match = minute.exec(str)) {
      time = Date.now() - match[1] * 1000 * 60;
      time = new Date(time);
    } else {
      // console.log(str);
    }
    return time;
  },
  async esInsert(client, id, body) {
    try {
      let resp = await client.index({
        index: 'baidunews_news',
        type: 'baidunews_news',
        id: id,
        body: body
      })
      console.log(resp && resp.result);
      return resp;
    } catch (error) {
      console.error(`es index error.`);
      console.error(error);
    }
  }
};

export {
  config as Config
};