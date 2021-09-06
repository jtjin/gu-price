const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const cron = require('node-cron');
const { query }  = require('../util/mysqlcon');
const { send } = require('../util/util.js');
const types = require('./types.json');

// Create Today Date(ex: 2020-07-01)
function getTodayDate() {
  const fullDate = new Date();
  const yyyy = fullDate.getFullYear();
  const MM = (fullDate.getMonth() + 1) >= 10 ? (fullDate.getMonth() + 1) : (`0${fullDate.getMonth() + 1}`);
  const dd = fullDate.getDate() < 10 ? (`0${fullDate.getDate()}`) : fullDate.getDate();
  const today = `${yyyy}-${MM}-${dd}`;
  return today;
}

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

// Get type links in different category (Use Puppeteer)
// (ex: [ {'正裝系列_男士正裝系列': "https://..."}, {"運動系列_GA運動系列": "https://..."}, ... ])
async function getTypeUrls(category, page) {
  let url;
  switch (category) {
    case ('women'):
      url = 'https://www.gu-global.com/tw/zh_TW/';
      break;
    case ('men'):
      url = 'https://www.gu-global.com/tw/zh_TW/L1_men.html';
      break;
    case ('kids'):
      url = 'https://www.gu-global.com/tw/zh_TW/L1_kids.html';
      break;
    default:
      return;
  }
  await page.goto(url, { waitUntil: 'networkidle0' });
  const html = await page.content();
  const $ = cheerio.load(html, { decodeEntities: false });
  let result = [];
  const list = $('#category_pc_list div dl'); // <div class="list1">
  for (let i = 0; i < list.length; i += 1) {
    const dd = list.eq(i).find('dd > a'); // <dd>
    let productCategory = list.eq(i).find('dt').text(); // <dt> productCategory
    productCategory = productCategory.trim();
    for (let j = 0; j < dd.length; j += 1) {
      let title = dd.eq(j).text();
      title = title.trim();
      title = `${productCategory}_${title}`;
      let href = dd.eq(j).attr('href');
      if (href.substr(0, 2) == '//') {
        href = `https:${href}`;
      }
      result.push({ [title]: href });
    }
  }
  result = [...new Set(result.map((item) => JSON.stringify(item)))];
  result = result.map((item) => JSON.parse(item));
  return result;
}

// Get product links in different type (Use Puppeteer)
// (ex: [ result: [{'男裝防風輕型外套': "https://..."}, {"男裝及膝短褲": "https://..."}, ... ], productList: 'men', prductType: 'sports')
async function getProductUrls(typeUrls, page) {
  let key = Object.keys(typeUrls);
  key = key[0]; // ex: 正裝系列_男士正裝系列
  let value = Object.values(typeUrls);
  value = value[0]; // ex: https://www.gu-global.com/tw/zh_TW/feature_suit_men.html

  value = value.replace('https://www.gu-global.com', '');
  const url = `https://www.gu-global.com${value}`;

  await page.goto(url, { waitUntil: 'networkidle0' });
  const html = await page.content();
  const $ = cheerio.load(html, { decodeEntities: false });
  let result = [];
  const list = $('#hmall-container > div > div.page-wrapper > div.HeaderFooterTemplate > div > div > div.h-product-group-gu.C5'); // <div class="h-product-group-gu C5">
  for (let i = 0; i < list.length; i += 1) {
    const li = list.eq(i).find('.product-li'); // <li class="product-li">
    for (let j = 0; j < li.length; j++) {
      let href = li.eq(j).find('div > a').attr('href');
      href = href.replace('https://www.gu-global.com', '');
      href = `https://www.gu-global.com${href}`;

      let title = li.eq(j).find('.font-p-gu').text();
      const name = title.substring(0, title.lastIndexOf(' '));
      const number = title.substring(title.lastIndexOf(' ') + 1);
      title = `${name}_${number}`;
      result.push({ [title]: href });
    }
  }

  result = [...new Set(result.map((item) => JSON.stringify(item)))];
  result = result.map((item) => JSON.parse(item));

  key = key.split('_');
  const productList = key[0];
  const productType = key[1];
  return { result, productList, productType };
}

let fail = {};

function reviseAbout(about) {
  about = about.replace('※為使顧客方便理解商品，網路商店商品名稱可能與實際吊牌略有不同，建議您前往實體店鋪購買時請用商品編號核對，造成您的不便敬請見諒。', '');
  about = about.replace('※各店鋪商品販賣狀況及庫存數量以店鋪實際狀況為準，商品販賣對象店鋪亦有調整之可能，詳細販售及庫存狀況請與鄰近店鋪洽詢。', '');
  about = about.replace('※請注意：特殊商品或特別尺碼，如：網路商店獨家販售、特殊尺碼(XS、XXL)，或其他特殊活動品項，僅提供網路商店退貨服務，恕無法於實體店鋪退換貨，不便之處敬請見諒。', '');
  about = about.replace('<a href="https://faq-tw.gu-global.com/pkb_Home_GU_TW?id=kA37F000000D4P8SAK&l=zh_TW&fs=Search&pn=1">網路商店退貨須知>></a>', '');
  about = about.replace('<font color="red"><b>※網路商店及大型店限定販售商品。</b></font>', '');
  about = about.replace('<font size="4"><a href="http://www.gu-global.com/tw/store/feature/gu/shop/"><b>店舖資訊一覧>></b></a></font>', '');
  about = about.replace('<font color="red"><b>※依照消保法，本產品屬個人衛生用品，拆封無7天猶豫期，如欲退貨請勿拆封。</b></font>', '');
  about = about.replace('<font color="red"><b>※網路商店及特定店鋪限定販售商品。</b></font>', '');
  about = about.replace('<font color="blue"><b>※此商品僅限網路商店、ATT4FUN店、新竹遠東巨城購物中心店、台中大遠百店  、統一時代百貨高雄店販售。</b></font>', '');
  about = about.replace('<font color="red">本商品為限購商品，每筆訂單最多購買1件，敬請見諒。提醒您，放入購物車不代表搶購成功，請盡速完成結帳才能確保您的購買權益，不便之處請請見諒。</font>', '');
  about = about.replace('<font color="red"><b>※衣背另有印花設計。</b></font>', '');
  about = about.replace('<font color="red"><b>※肩膀到袖口的帶型設計</b></font>', '');
  about = about.replace(/<br>/g, '');
  return about.trim();
}

// Get all details for new products (Use Puppeteer)
// ex: { category: 'men', type: 'jacket', ...}
async function getProductDetails(productUrl, category, productList, productType, page) {
  await page.goto(productUrl, { waitUntil: 'networkidle0' });
  const html = await page.content();
  const $ = cheerio.load(html, { decodeEntities: false });
  const title = $('.gu-product-detail-list-title').text();
  const name = title.substring(0, title.lastIndexOf(' '));
  const number = title.substring(title.lastIndexOf(' ') + 1);
  let price = $('.gu-detail-list-price > div > span').text().substr(3);
  let about = $('.product-desc').html();
  about = reviseAbout(about);
  const texture = $('.desc-content').text();
  const mainImage = $('.picture-viewer-picture > div > img').attr('src');
  let images = [];

  const colors = $('.gu-sku-select-box > div.sku-select.gu-sku-select > ul.h-clearfix.sku-select-colors > li');
  for (let i = 1; i <= colors.length; i += 1) {
    try {
      await page.click(`.gu-sku-select-box > div.sku-select.gu-sku-select > ul.h-clearfix.sku-select-colors > li:nth-child(${i}) > img`);
      const html = await page.content();
      const $ = cheerio.load(html);
      if (!isNumeric(price)) {
        price = $('.gu-detail-list-price > div > span').text().substr(3);
      }
      images.push($('.picture-viewer-picture > div > img').attr('src'));
    } catch (error) {
      fail[number] = error;
    }
  }
  const list_images = $('.picture-viewer-bottom').find('li');
  for (let i = 1; i <= list_images.length; i += 1) {
    try {
      await page.click(`.picture-viewer-bottom > li:nth-child(${i}) > img`);
      const html = await page.content();
      const $ = cheerio.load(html);
      images.push($('.picture-viewer-picture > div > img').attr('src'));
    } catch (error) {
      fail[number] = error;
    }
  }
  images = [...new Set(images)]; // Remove duplicated image
  const updateAt = getTodayDate();
  const type = types[category][0][productType] ? types[category][0][productType] : '';
  return {
    category, chinese_list: productList, type, chinese_type: productType, name, number, price, about, texture, mainImage, images, update_at: updateAt,
  };
}

// Get only price for old products (Use Puppeteer)
// ex: { date: '20200701', price: '290' }
async function getProductPrice(productUrl, page) {
  await page.goto(productUrl, { waitUntil: 'networkidle0' });
  const html = await page.content();
  const $ = cheerio.load(html, { decodeEntities: false });
  let price = $('.gu-detail-list-price > div > span').text().substr(3);
  if (!isNumeric(price)) {
    const colors = $('.gu-sku-select-box > div.sku-select.gu-sku-select > ul.h-clearfix.sku-select-colors > li');
    for (let i = 1; i <= colors.length; i += 1) {
      try {
        await page.click(`.gu-sku-select-box > div.sku-select.gu-sku-select > ul.h-clearfix.sku-select-colors > li:nth-child(${i}) > img`);
        const html = await page.content();
        const $ = cheerio.load(html);
        if (!isNumeric(price)) {
          price = $('.gu-detail-list-price > div > span').text().substr(3);
        }
      } catch (error) {
        fail[number] = error;
      }
    }
  }
  const date = getTodayDate();
  return {
    date, price,
  };
}

// Insert product into mysql
// New product, insert both product & date_price tables
async function createProduct(data) {
  const newData = {
    category: data.category,
    chinese_list: data.chinese_list,
    type: data.type,
    chinese_type: data.chinese_type,
    name: data.name,
    number: data.number,
    about: data.about,
    texture: data.texture,
    main_image: data.mainImage,
    images: JSON.stringify(data.images),
    update_at: data.update_at,
  };
  const duplicated = await query('SELECT * FROM product WHERE number = ?', [data.number]);
  if (duplicated.length != 0) {
    return;
  }
  const result = await query('INSERT INTO product SET ?', newData);
  await createDatePrice(data.update_at, result.insertId, parseInt(data.price.replace(',', '')));
}

async function createDatePrice(date, productId, price) {
  const newData = {
    date,
    price,
    product_id: productId,
  };
  const duplicated = await query('SELECT * FROM date_price WHERE date = ? AND product_id = ?', [date, productId]);
  if (duplicated.length != 0) {
    return;
  }
  await query('INSERT INTO date_price SET ?', newData);
}

async function main(category) {
  const browser = await puppeteer.launch({
    headless: true,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(300000);
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299');

  console.log(`Start ${category} data at ${new Date()}`);
  const typeUrls = await getTypeUrls(category, page);
  for (let i = 0; i < typeUrls.length; i += 1) {
    try {
      const productUrlsResult = await getProductUrls(typeUrls[i], page);
      const productUrls = productUrlsResult.result;
      for (let j = 0; j < productUrls.length; j += 1) {
        let key = Object.keys(productUrls[j]);
        let value = Object.values(productUrls[j]);
        key = key[0]; // ex: (男女適穿)Chef shirt主廚襯衫(5分袖)_332633
        value = value[0]; // ex: https://www.gu-global.com/tw/zh_TW/product-detail.html?productCode=u0000000000032

        key = key.split('_');
        const number = key[1];

        try {
          if (allProductsHashMap[number]) {
            // Product already exists, insert date_price table & Update update_at column at product table
            const productDetails = await getProductPrice(value, page);
            await query('UPDATE product SET update_at = ? WHERE id = ?', [productDetails.date, allProductsHashMap[number]]);
            await createDatePrice(productDetails.date, allProductsHashMap[number], parseInt(productDetails.price.replace(',', '')));
          } else {
            const productDetails = await getProductDetails(value, category, productUrlsResult.productList, productUrlsResult.productType, page);
            await createProduct(productDetails);
          }
        } catch (error) {
          fail[value] = error;
          console.log('Other Error', productUrls[j]);
        }
      }
    } catch (error) {
      fail[typeUrls[i]] = error;
      console.log('typeUrls Error', typeUrls[i]);
    }
  }
  await browser.close();
  console.log(`Finished ${category} data at ${new Date()}`);
}

// Send e-mail to users who track the product (Use Nodemailer)
async function getTrack() {
  console.log(`Start sending track mail at ${new Date()}`);
  const queryStr = `
               SELECT t.id, t.email, p.name, p.number, p.main_image AS mainImage, t.price AS trackPrice, d.price AS currentPrice FROM product AS p
               INNER JOIN track AS t ON p.number = t.number
               INNER JOIN date_price AS d ON p.id = d.product_id
               WHERE d.date = ? AND t.confirmed = 0
               `;
  const result = await query(queryStr, getTodayDate());
  for (let i = 0; i < result.length; i += 1) {
    if (result[i].currentPrice <= result[i].trackPrice) {
      try {
        await sendTrackEmail(result[i].name, result[i].number, result[i].mainImage, result[i].currentPrice, result[i].email);
        await updateTrackStatus(result[i].id);
      } catch (error) {
        console.log(result[i]);
        console.log(error);
      }
    }
  }
  console.log(`Finished sending track mail at ${new Date()}`);
}

const sendTrackEmail = async (name, number, mainImage, currentPrice, email) => {
  const mail = {
    from: 'GU-Price <gu.price.search@gmail.com>',
    subject: `GU-Price 降價通知- ${name}`,
    to: email,
    html: `
             <p>Hi! ${email.split('@')[0]}</p>
             <h2>您在 GU-Price 追蹤的「${name}」商品有降價優惠，請<a href="https://gu-price.jtjin.xyz/products/${number}">點此</a>查看詳情。</h2>
             <h3>目前售價： ${currentPrice} 元</h3>
             <img src="${mainImage}" height="150">
           `,
  };
  await send(mail);
};

const updateTrackStatus = async (id) => {
  try {
    await query('START TRANSACTION');
    const queryStr = 'UPDATE track SET confirmed = ? WHERE id = ?';
    await query(queryStr, [true, id]);
    await query('COMMIT');
    return;
  } catch (error) {
    await query('ROLLBACK');
    return { error };
  }
};

const sendCrawlerReport = async () => {
  console.log(`Start sending crawler report mail at ${new Date()}`);
  const mail = {
    from: 'GU-Price <gu.price.search@gmail.com>',
    subject: 'Crawler Report',
    to: 'wade4515x@gmail.com',
    html: `
             <h2>錯誤 (${Object.keys(fail).length})</h2>
             <p>${JSON.stringify(fail)}</p>
           `,
  };
  await send(mail);
  console.log(`Finished sending crawler report mail at ${new Date()}`);
};

const allProductsHashMap = {};

async function start() {
  fail = {};
  // Create Products HashMap
  // ex: { 317122: '1', 319559: '2', ...}
  const allProducts = await query('SELECT id, number FROM product;');
  for (let i = 0; i < allProducts.length; i += 1) {
    allProductsHashMap[allProducts[i].number] = allProducts[i].id;
  }
  await Promise.all([main('men'), main('women'), main('kids')]);
  await getTrack();
  if (fail.length != 0) {
    await sendCrawlerReport();
  }
  console.log('Everything has done!');
}

// Running at 11 a.m. everyday
cron.schedule('0 0 11 * * *', () => {
  start();
});