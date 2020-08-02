const puppeteer = require('puppeteer');
const rp = require('request-promise');
const cheerio = require('cheerio');
const cron = require('node-cron');
const mysql = require('../util/mysqlcon');
const { send } = require('../util/util.js');

// Create Today Date(ex: 2020-07-01)
function getTodayDate() {
  const fullDate = new Date();
  const yyyy = fullDate.getFullYear();
  const MM = (fullDate.getMonth() + 1) >= 10 ? (fullDate.getMonth() + 1) : (`0${fullDate.getMonth() + 1}`);
  const dd = fullDate.getDate() < 10 ? (`0${fullDate.getDate()}`) : fullDate.getDate();
  const today = `${yyyy}-${MM}-${dd}`;
  return today;
}

// Get type links in different category (Use Request Promise)
// (ex: [ {'jacket': "https://..."}, {"shirt": "https://..."}, ... ])
async function getTypeUrls(category) {
  let url;
  switch (category) {
    case ('women'):
      url = 'https://www.gu-global.com/tw/';
      break;
    case ('men'):
      url = 'https://www.gu-global.com/tw/men/';
      break;
    case ('kids'):
      url = 'https://www.gu-global.com/tw/kids/';
      break;
    default:
      return;
  }
  const options = {
    uri: url,
    transform: (body) => cheerio.load(body),
  };
  return await rp(options).then(($) => {
    let result = [];
    const list = $('#category_pc_list div'); // <div class="list1">
    for (let i = 0; i < list.length; i += 1) {
      const dd = list.eq(i).find('dd > a'); // <dd>
      for (let j = 0; j < dd.length; j += 1) {
        const title = dd.eq(j).text();
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
  })
    .catch((err) => console.log(err));
}

// Get product links in different type (Use Request Promise)
// (ex: [ result: [{'男裝防風輕型外套': "https://..."}, {"男裝及膝短褲": "https://..."}, ... ], productCategory: 'men', prductType: 'sports')
async function getProductUrls(typeUrls) {
  const options = {
    uri: typeUrls,
    transform: (body) => cheerio.load(body),
  };
  return await rp(options).then(($) => {
    let result = [];
    const list = $('#blkMainItemList div'); // <div class="unit">
    for (let i = 0; i < list.length; i += 1) {
      const href = list.eq(i).find('.thumb > a').attr('href');
      const title = list.eq(i).find('.thumb > a').attr('title');
      result.push({ [title]: href });
    }
    result = [...new Set(result.map((item) => JSON.stringify(item)))];
    result = result.map((item) => JSON.parse(item));
    const productUrl = typeUrls.split('/');
    const productCategory = productUrl[productUrl.length - 3];
    const productType = productUrl[productUrl.length - 2];
    return { result, productCategory, productType };
  })
    .catch((err) => console.log(err));
}

const fail = {};

// Get all details for new products (Use Puppeteer)
// ex: { date: '20200701', category: 'men', ...}
async function getProductDetails(productUrl, productCategory, productType) {
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
  await page.goto(productUrl);
  const html = await page.content();
  const $ = cheerio.load(html, { decodeEntities: false });
  const name = $('#goodsNmArea').text();
  const price = $('#price').text().substr(3);
  const number = $('#basic > li.number').text().substr(4);
  const about = $('#prodDetail > div > p').html();
  const texture = $('#prodDetail > div > dl > dd:nth-child(2)').text();
  const mainImage = $('#prodImgDefault > img').attr('src');
  let images = [];
  const colors = $('#listChipColor').find('.chipCover');
  for (let i = 1; i <= colors.length; i += 1) {
    try {
      await page.waitForSelector(`#listChipColor > li:nth-child(${i}) > a`, { timeout: 10000 });
      await page.click(`#listChipColor > li:nth-child(${i}) > a`);
      const html = await page.content();
      const $ = cheerio.load(html);
      images.push($('#prodImgDefault > img').attr('src'));
    } catch (error) {
      console.log('Click listChipColor Error', number);
      fail[number] = error;
    }
  }
  const list_images = $('#prodThumbImgs').find('li');
  for (let i = 1; i <= list_images.length; i += 1) {
    try {
      await page.waitForSelector(`#prodThumbImgs > li:nth-child(${i}) > a`, { timeout: 10000 });
      await page.click(`#prodThumbImgs > li:nth-child(${i}) > a`);
      const html = await page.content();
      const $ = cheerio.load(html);
      images.push($('#prodImgDefault > img').attr('src'));
    } catch (error) {
      console.log('Click prodThumbImgs Error', number);
      fail[number] = error;
    }
  }
  images = [...new Set(images)]; // Remove duplicated image
  const update_at = getTodayDate();
  const category = productCategory;
  const type = productType;
  await browser.close();
  return {
    category, type, name, number, price, about, texture, mainImage, images, update_at,
  };
}

// Get only price for old products (Use Puppeteer)
// ex: { date: '20200701', price: '290' }
async function getProductPrice(productUrl) {
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
  await page.goto(productUrl);
  const html = await page.content();
  const $ = cheerio.load(html, { decodeEntities: false });
  const price = $('#price').text().substr(3);
  const date = getTodayDate();
  await browser.close();
  return {
    date, price,
  };
}

// Insert product into mysql
// New product, insert both product & date_price tables
async function createProduct(data) {
  const newData = {
    category: data.category,
    type: data.type,
    name: data.name,
    number: data.number,
    about: data.about,
    texture: data.texture,
    main_image: data.mainImage,
    images: JSON.stringify(data.images),
    update_at: data.update_at,
  };
  const duplicated = await mysql.query('SELECT * FROM product WHERE number = ?', [data.number]);
  if (duplicated.length != 0) {
    return;
  }
  const result = await mysql.query('INSERT INTO product SET ?', newData);
  await createDatePrice(data.update_at, result.insertId, parseInt(data.price.replace(',', '')));
}

async function createDatePrice(date, productId, price) {
  const newData = {
    date,
    price,
    product_id: productId,
  };
  const duplicated = await mysql.query('SELECT * FROM date_price WHERE date = ? AND product_id = ?', [date, productId]);
  if (duplicated.length != 0) {
    return;
  }
  await mysql.query('INSERT INTO date_price SET ?', newData);
}

async function main(category) {
  console.log(`Start ${category} data at ${new Date()}`);
  let typeUrls = await getTypeUrls(category);
  typeUrls = typeUrls.flatMap((url) => Object.values(url));
  for (let i = 0; i < typeUrls.length; i += 1) {
    const productUrlsResult = await getProductUrls(typeUrls[i]);
    const productUrls = productUrlsResult.result.flatMap((url) => Object.values(url));
    for (let j = 0; j < productUrls.length; j += 1) {
      let number = productUrls[j].split('/');
      number = number[number.length - 1];
      try {
        if (allProductsHashMap[number]) {
          // Product already exists, insert date_price table & Update update_at column at product table
          const productDetails = await getProductPrice(productUrls[j]);
          await mysql.query('UPDATE product SET update_at = ? WHERE id = ?', [productDetails.date, allProductsHashMap[number]]);
          await createDatePrice(productDetails.date, allProductsHashMap[number], parseInt(productDetails.price.replace(',', '')));
        } else {
          const productDetails = await getProductDetails(productUrls[j], productUrlsResult.productCategory, productUrlsResult.productType);
          await createProduct(productDetails);
        }
      } catch (error) {
        console.log(error);
        fail[productUrls[j]] = error;
        console.log('Other Error', productUrls[j]);
      }
    }
  }
  console.log(`Finished ${category} data at ${new Date()}`);
}

// Send e-mail to users who track the product (Use Nodemailer)
async function sendTrack() {
  console.log(`Start sending track mail at ${new Date()}`);
  const queryStr = `
              SELECT t.id, t.email, p.name, p.number, p.main_image AS mainImage, t.price AS trackPrice, d.price AS currentPrice FROM product AS p
              INNER JOIN track AS t ON p.number = t.number
              INNER JOIN date_price AS d ON p.id = d.product_id
              WHERE d.date = ? AND t.confirmed = 0
              `;
  const result = await mysql.query(queryStr, getTodayDate());
  for (let i = 0; i < result.length; i += 1) {
    if (result[i].currentPrice <= result[i].trackPrice) {
      try {
        await trackEmail(result[i].name, result[i].number, result[i].mainImage, result[i].currentPrice, result[i].email);
        await updateTrackStatus(result[i].id);
      } catch (error) {
        console.log(result[i]);
        console.log(error);
      }
    }
  }
  console.log(`Finished sending track mail at ${new Date()}`);
}

const trackEmail = async (name, number, mainImage, currentPrice, email) => {
  const mail = {
    from: 'GU-Price <gu.price.search@gmail.com>',
    subject: `GU-Price 降價通知- ${name}`,
    to: email,
    html: `
            <p>Hi! ${email.split('@')[0]}</p>
            <h2>您在 GU-Price 追蹤的「${name}」商品有降價優惠，請<a href="https://gu-price.com/products/${number}">點此</a>查看詳情。</h2>
            <h3>目前售價： ${currentPrice} 元</h3>
            <img src="${mainImage}" height="150">
          `,
  };
  await send(mail);
};

const updateTrackStatus = async (id) => {
  try {
    const queryStr = 'UPDATE track SET confirmed = ? WHERE id = ?';
    await mysql.query(queryStr, [true, id]);
    return;
  } catch (error) {
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
            <h2>錯誤</h2>
            <p>${JSON.stringify(fail)}</p>
          `,
  };
  await send(mail);
  console.log(`Finished sending crawler report mail at ${new Date()}`);
};

const allProductsHashMap = {};

async function start() {
  // Create Products HashMap
  // ex: { 317122: '1', 319559: '2', ...}
  const allProducts = await mysql.query('SELECT id, number FROM product;');
  for (let i = 0; i < allProducts.length; i += 1) {
    allProductsHashMap[allProducts[i].number] = allProducts[i].id;
  }
  await main('men');
  await main('women');
  await main('kids');
  await sendTrack();
  await sendCrawlerReport();
  console.log('Everything has done!');
}

// Running at 11 a.m. everyday
cron.schedule('0 0 11 * * *', () => {
  start();
});
