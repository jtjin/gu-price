const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mysql = require('../util/mysqlcon');

// Create Today Date(ex: 20200701)
function getTodayDate() {
  const fullDate = new Date();
  const yyyy = fullDate.getFullYear();
  const MM = (fullDate.getMonth() + 1) >= 10 ? (fullDate.getMonth() + 1) : (`0${fullDate.getMonth() + 1}`);
  const dd = fullDate.getDate() < 10 ? (`0${fullDate.getDate()}`) : fullDate.getDate();
  const today = `${yyyy}-${MM}-${dd}`;
  return today;
}

// Get type links in different category
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
  const browser = await puppeteer.launch({
    headless: true,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299');
  await page.goto(url);
  const html = await page.content();
  const $ = cheerio.load(html);
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
  await browser.close();
  return result;
}

// Get product links in different type
// (ex: [ {'320727': "https://..."}, {"320728": "https://..."}, ... ])
async function getProductUrls(typeUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299');
  await page.goto(typeUrl);
  const html = await page.content();
  const $ = cheerio.load(html);
  let result = [];
  const list = $('#blkMainItemList div'); // <div class="unit">
  for (let i = 0; i < list.length; i += 1) {
    const href = list.eq(i).find('.thumb > a').attr('href');
    const title = list.eq(i).find('.thumb > a').attr('title');
    result.push({ [title]: href });
  }
  result = [...new Set(result.map((item) => JSON.stringify(item)))];
  result = result.map((item) => JSON.parse(item));
  const productUrl = typeUrl.split('/');
  const productCategory = productUrl[productUrl.length - 3];
  const productType = productUrl[productUrl.length - 2];
  await browser.close();
  return { result, productCategory, productType };
}

// Get product details
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
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299');
  await page.goto(productUrl);
  const html = await page.content();
  const $ = cheerio.load(html, { decodeEntities: false });
  const name = $('#goodsNmArea').text();
  const price = $('#price').text().substr(3);
  const number = $('#basic > li.number').text().substr(4);
  const about = $('#prodDetail > div > p').html();
  const texture = $('#prodDetail > div > dl > dd:nth-child(2)').text();
  const style = $('#prodDetail > div > dl > dd:nth-child(4)').text();
  const wash = $('#prodDetail > div > dl > dd:nth-child(6)').html();
  const mainImage = $('#prodImgDefault > img').attr('src');
  const images = [];
  const colors = $('#listChipColor').find('.chipCover');
  for (let i = 1; i <= colors.length; i += 1) {
    await page.click(`#listChipColor > li:nth-child(${i}) > a`);
    const html = await page.content();
    const $ = cheerio.load(html);
    images.push($('#prodImgDefault > img').attr('src'));
  }
  const list_images = $('#prodThumbImgs').find('li');
  for (let i = 1; i <= list_images.length; i += 1) {
    await page.click(`#prodThumbImgs > li:nth-child(${i}) > a`);
    const html = await page.content();
    const $ = cheerio.load(html);
    images.push($('#prodImgDefault > img').attr('src'));
  }
  const date = getTodayDate();
  const category = productCategory;
  const type = productType;
  await browser.close();
  return {
    date, category, type, name, number, price, about, texture, style, wash, mainImage, images,
  };
}

// Insert product in mysql
async function createProduct(data) {
  const product = await mysql.query('SELECT * FROM product WHERE category =? and type = ? and name = ? and number = ?', [data.category, data.type, data.name, data.number]);
  if (product.length !== 0) {
    // Product already exists, insert date_price table only
    await CreateDatePrice(data.date, product[0].id, parseInt(data.price.replace(',', '')));
  } else {
    // New product, insert both product & date_price tables
    const newData = {
      category: data.category,
      type: data.type,
      name: data.name,
      number: data.number,
      about: data.about,
      texture: data.texture,
      style: data.style,
      wash: data.wash,
      main_image: data.mainImage,
      images: JSON.stringify(data.images),
    };
    const result = await mysql.query('INSERT INTO product SET ?', newData);
    await CreateDatePrice(data.date, result.insertId, parseInt(data.price.replace(',', '')));
  }
}

async function CreateDatePrice(date, productId, price) {
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
      try {
        const productDetails = await getProductDetails(productUrls[j], productUrlsResult.productCategory, productUrlsResult.productType);
        await createProduct(productDetails);
      } catch (error) {
        console.log(productUrls[j]);
        console.log(error);
      }
    }
  }
  console.log(`Finished ${category} data at ${new Date()}`);
}
async function start() {
  await main('men');
  await main('women');
  await main('kids');
  console.log('Everything has done!');
  mysql.end();
}

start();
