$(document).ready(function() {

  $(".smNav").slideUp();
  
  $(window).on("scroll", function() {
    if($(window).scrollTop() != 0) {
      $("nav").addClass('fixnav');
      $("#icon").addClass('hideOnSmall');
    } else {
      $("nav").removeClass('fixnav');
      $("#icon").removeClass('hideOnSmall');
    }
  })

  $("#icon").on("click", function() {
    $(".smNav").slideToggle();
  })


})