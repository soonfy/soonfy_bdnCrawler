/**
 * 配置文件
 */
const config = {
  dbUrl: 'mongodb://localhost/baidu_news',
  host: 'http://news.baidu.com',
  headers: {
    'Host': 'news.baidu.com',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
    'Cookie': 'LOCALGX=%u5317%u4EAC%7C%30%7C%u5317%u4EAC%7C%30; BAIDUID=E18B383EFDD1CF72238B3DD26C9E268E:FG=1; PSTM=1477364316; BIDUPSID=C0E93A264CABA0EA0EBABF90F5FC5BA9; Hm_lvt_e9e114d958ea263de46e080563e254c4=1477299022,1477357796,1477371390; BDRCVFR[iL4hrzJ0zlT]=mbxnW11j9Dfmh7GuZR8mvqV; BD_CK_SAM=1; PSINO=6; BDSVRTM=258; H_PS_PSSID=',
    // 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    // 'Accept-Encoding': 'gzip, deflate, sdch',
    // 'Accept-Language': 'zh-CN,zh;q=0.8',
    // 'Referer': 'referer'
  },
  timeout: 1000 * 60 * 2,
  timestop: async function (s) {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000 * s);
    });
  },
  dbInsert: async function (DB, obj) {
    try {
      let _db = new DB(obj);
      await _db.save();
    } catch (error) {
      if(error.errmsg && error.errmsg.includes('E11000 duplicate key error collection')){
        //
      }else{
        console.log(error);
      }
    }
  }
};

export {config as Config};
