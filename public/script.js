var sidebar = false;

$( document ).ready(function() {



});

function toggleSidebar() {

  if (sidebar) {

    $(".sidebar").hide();
    sidebar = false;

  } else {

    $(".sidebar").show();
    sidebar = true;

  }

}
