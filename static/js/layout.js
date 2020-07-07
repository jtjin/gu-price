const search_header = document.getElementById('search_header');
const menu_img = document.getElementById('menu_img');
const menu_list = document.getElementById('menu_list');

menu_img.addEventListener('click', () => {
  if (menu_list.className == 'show') {
    menu_list.classList.remove('show');
  } else {
    menu_list.classList.add('show');
  }
});
function headerSearchBtn() {
  if (search_header.value) {
    window.location.href = `/search/${search_header.value}`;
  }
}
function headerSearch() {
  search_header.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') headerSearchBtn();
  });
}
window.onload = headerSearch();

function postData(url, data, cb) {
  return fetch(url, {
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })
    .then((res) => res.json())
    .then((result) => cb(result))
    .catch((err) => console.log(err));
}
function loginRender(obj) {
  if (obj.error) {
    alert(obj.error);
  } else if (obj.data.access_token) {
    localStorage.setItem('token', obj.data.access_token);
    alert('登入成功!');
    location.reload();
    // window.location.href = './profile.html';
  } else {
    alert('Oops, something went wrong!');
  }
}
/* Integrate Facebook Login */
// Initialization
window.fbAsyncInit = function () {
  FB.init({
    appId: '606485106744129',
    cookie: true,
    xfbml: true,
    version: 'v7.0',
  });
  // Record data
  FB.AppEvents.logPageView();
};
// Load the Facebook Javascript SDK asynchronously
(function (d, s, id) {
  let js; const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function FB_login() {
  FB.login((response) => {
    if (response.status === 'connected') {
      const result = {
        id: response.authResponse.userID,
        provider: response.authResponse.graphDomain,
        access_token: response.authResponse.accessToken,
      };
      postData('/api/1.0/user/signin', result, loginRender);
    } else {
      alert('Please try again');
    }
  }, { scope: 'public_profile, email' });
}

// Member Modal
const member_modal = document.getElementById('member_modal');
const member_btn = document.getElementById('member_btn');

// When the user clicks the button, open the modal
member_btn.onclick = function () {
  member_modal.style.display = 'block';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == member_modal) {
    member_modal.style.display = 'none';
  }
};

/* Integrate Google Login */
function Google_login() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signIn()
    .then((GoogleUser) => {
      const profile = GoogleUser.getBasicProfile();
      const result = {
        id: profile.getId(),
        provider: GoogleUser.getAuthResponse().idpId,
        access_token: GoogleUser.getAuthResponse().id_token,
      };
      postData('/api/1.0/user/signin', result, loginRender);
    })
    .catch((error) => {
      alert('Please try again');
      console.log(error);
    });
}
