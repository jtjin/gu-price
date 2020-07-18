const pages = {};
let lastPageId = 0;
socket.on('pageviewConnect', (msg) => {
  $('#connections').html(msg.connections);
  if (msg.url) {
    // Limit Real Time Activity Rows
    if ($('#visitsTable tr').length > 10) {
      $('#visitsTable tr:last').remove();
    }
    // Create Real Time Activity
    const timestamp = new Date().toString().substr(0, 24);
    $('#visitsTable tbody').prepend(`
                                       <tr id='${msg.id}'>
                                          <td>${msg.url}</td>
                                          <td>${msg.ip}</td>
                                          <td>${timestamp}</td>
                                       </tr>
                                    `);
    // Create Page Views
    if (pages[msg.url]) {
      // Page Url exists
      pages[msg.url].views = pages[msg.url].views + 1;
      $(`#page${pages[msg.url].pageId}`).html(pages[msg.url].views);
    } else {
      pages[msg.url] = { views: 1, pageId: ++lastPageId };
      $('#pageViewsTable tbody').append(`
                                             <tr>
                                                <td>${msg.url}</td>
                                                <td id='page${lastPageId}'>1</td>
                                             </tr>
                                          `);
    }
  }
});

socket.on('pageviewDisconnect', (msg) => {
  $('#connections').html(msg.connections);
  if ($(`#${msg.id}`)) {
    $(`#${msg.id}`).remove();
  }
});
