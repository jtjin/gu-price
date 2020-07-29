let lists = document.getElementById('lists').innerHTML;
let listMap = document.getElementById('listMap').innerHTML;
lists = lists.split(',');
listMap = JSON.parse(listMap);

async function getAllTypes() {
  const category = window.location.pathname.substr(1);
  switch (category) {
    case 'men':
      document.title = '男裝 | GU 比價 | GU 搜尋';
      break;
    case 'women':
      document.title = '女裝 | GU 比價 | GU 搜尋';
      break;
    case 'kids':
      document.title = '童裝 | GU 比價 | GU 搜尋';
      break;
  }
  for (let i = 0; i < lists.length; i += 1) {
    createTypes(lists[i], category);
  }
}

function createTypes(list, category) {
  const view = document.getElementById('view');
  // Create <div class='view_box'>
  const viewBox = document.createElement('div');
  viewBox.setAttribute('class', 'view_box');
  // Create <h2>、<a> inside view_box
  const h2 = document.createElement('h2');
  h2.innerHTML = list;
  viewBox.appendChild(h2);
  // Create <div class='types'>
  const types = document.createElement('div');
  types.setAttribute('class', 'types');
  view.appendChild(viewBox);
  view.appendChild(types);
  for (let i = 0; i < listMap[list].length; i += 1) {
    // Create <div class='type'>
    const div = document.createElement('div');
    div.setAttribute('class', 'type');
    // Create <a> inside <div class='type'>
    const a = document.createElement('a');
    a.innerHTML = `${listMap[list][i][0]}`;
    a.setAttribute('href', `/${category}/${listMap[list][i][1]}`);
    div.appendChild(a);
    types.appendChild(div);
  }
}

window.onload = getAllTypes();
