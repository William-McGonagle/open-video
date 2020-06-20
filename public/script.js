var sidebar = false;

$( document ).ready(function() {

  $.get('/api/v1/video/getAll/', function (data) {

    for (var i = 0; i < data.length; i++) {

      addVideo(data[i].id, data[i].iconPath, data[i].title, "");

    }

  });

});

function addVideo(id, icon, name, poster) {

  var container = $("<div class='item'></div>");
  container.css("background-image", `url("${icon}")`);
  container.on("click", function () {

    window.location.href = "/video/?id=" + id;

  });

  var nameDom = $(`<h1>${name}</h1>`);
  var posterDom = $(`<h3>${poster}</h3>`);

  container.append(nameDom);
  container.append(posterDom);
  $(".main").append(container);

}

function toggleSidebar() {

  if (sidebar) {

    $(".sidebar").hide();
    sidebar = false;

  } else {

    $(".sidebar").show();
    sidebar = true;

  }

}
