# gsdata_crawler

  1. start  
  npm start  ||  node app/index.js  
  
  2. init  
  npm test  ||  node app/init.js  

  3. login and crawl
  node app/login.js  

  4. deploy  
  ```
  mkdir soonfy && cd soonfy

  git clone git@github.com:soonfy/soonfy_gsdata.git

  mv soonfy_gsdata/ gsdata && cd gsdata/

  npm install

  pm2 start app/index.js --name weixiner_sf

  pm2 restart weixiner_sf

  pm2 logs weixiner_sf

  pm2 start app/login.js --name weixiner_sf_login

  pm2 restart weixiner_sf_login

  pm2 logs weixiner_sf_login
  ```
