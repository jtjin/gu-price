const searchMain = document.getElementById('search_main');
const selectMain = document.getElementById('select_main');
const imageSearchIcon = document.getElementById('image_search_icon');
const imageSearchFile = document.getElementById('image_search_file');
const imageSearchSubmit = document.getElementById('image_search_submit');
const imageSearchText = document.getElementById('image_search_text');
const imageMain = document.getElementById('image_main');

function isValid(str) {
  return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?\ ]/g.test(str);
}

function mainSearchBtn() {
  if (searchMain.value) {
    if (!isValid(searchMain.value)) {
      Swal.fire({
        icon: 'warning',
        title: '請勿輸入特殊符號！',
        text: '不接受空格、@、!、$、^、&...等特殊符號',
        confirmButtonColor: '#3085d6',
        confirmButtonText:　'我知道了',
      });
      return;
    }
    switch (selectMain.value) {
      case '關鍵字':
        window.location.href = `/search/${searchMain.value}`;
        break;
      case '商品編號':
        window.location.href = `/products/${searchMain.value}`;
    }
  }
}
function mainSearch() {
  searchMain.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') mainSearchBtn();
  });
}
window.onload = mainSearch();

imageSearchIcon.addEventListener('mouseover', () => {
  imageSearchText.style.display = 'inline-block';
});
imageSearchIcon.addEventListener('mouseout', () => {
  imageSearchText.style.display = 'none';
});
imageSearchIcon.addEventListener('click', () => {
  imageSearchFile.click();
});
imageSearchFile.addEventListener('change', () => {
  if (/\.(jpe?g|png)$/i.test(imageSearchFile.files[0].name) === false) {
    Swal.fire({
      icon: 'error',
      title: '請上傳正確圖片格式！',
      text: '只接受 JPG/JPEG/PNG 圖檔',
      confirmButtonColor: '#3085d6',
      confirmButtonText:　'我知道了',
    });
  } else {
    imageSearchSubmit.click();
    Swal.fire({
      imageUrl: '/static/imgs/spinner.gif',
      title: '圖片上傳中...',
      showConfirmButton: false,
      allowOutsideClick: false,
    });
  }
});

imageMain.addEventListener('dblclick', async () => {
  if (await createTagCloud()) {
    document.getElementById('ctn').style.display = 'none';
    document.getElementById('container').style.display = 'block';
  }
});

async function createTagCloud() {
  const data = await fetch('/api/1.0/tagCloud').then((res) => res.json());
  const ignore = await fetch('/static/data/ignore.json').then((res) => res.json());
  // create a tag (word) cloud chart
  const chart = anychart.tagCloud();
  // set an array of angles at which the words will be laid out
  chart.angles([0]);
  // set the parsing mode and configure parsing settings
  chart.data(data, {
    mode: 'by-word',
    maxItems: 100,
    ignoreItems: ignore.data,
  });
  // set color present type
  const customColorScale = anychart.scales.ordinalColor();
  customColorScale.ranges([
    { less: 200 },
    { from: 200, to: 300 },
    { from: 300, to: 400 },
    { from: 400, to: 500 },
    { from: 500, to: 600 },
    { from: 600, to: 700 },
    { from: 700, to: 800 },
    { from: 800, to: 900 },
    { greater: 900 },
  ]);
  customColorScale.colors(['#707070', '#606060', '#505050', '#404040', '#383838', '#303030', '#282828', '#181818', '#000000']);
  chart.colorScale(customColorScale);
  // Edit tooltip format
  chart.tooltip().format('{%yPercentOfTotal}%');
  chart.hovered().fill('#7dd3f5');
  // set the container id
  chart.container('container');
  // initiate drawing the chart
  chart.draw();
  // add an event listener
  chart.listen('pointClick', (e) => {
    window.location.href = `/search/${e.point.get('x')}`;
  });
  return true;
}
