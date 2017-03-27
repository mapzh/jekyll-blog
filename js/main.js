$(document).ready(function() {

  if (window.location.hash && window.location.hash == "#blog") {
    $('.panel-cover').addClass('panel-cover--collapsed');
    $('.main-post-list').removeClass('hidden');
  }

  if (window.location.pathname.substring(0, 5) == "/tag/") {
    $('.panel-cover').addClass('panel-cover--collapsed');
  }

  $('.btn-mobile-menu__icon').click(function() {
    if ($('.navigation-wrapper').css('display') == "block") {
      $('.navigation-wrapper').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
        $('.navigation-wrapper').toggleClass('visible animated bounceOutUp');
        $('.navigation-wrapper').off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
      });
      $('.navigation-wrapper').toggleClass('animated bounceInDown animated bounceOutUp');

    } else {
      $('.navigation-wrapper').toggleClass('visible animated bounceInDown');
    }
    $('.btn-mobile-menu__icon').toggleClass('fa fa-list fa fa-angle-up animated fadeIn');
  });

  $('.navigation-wrapper .blog-button').click(function() {
    if ($('.navigation-wrapper').css('display') == "block") {
      $('.navigation-wrapper').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
        $('.navigation-wrapper').toggleClass('visible animated bounceOutUp');
        $('.navigation-wrapper').off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
      });

      $('.navigation-wrapper').toggleClass('animated bounceInDown animated bounceOutUp');
    }

    $('.btn-mobile-menu__icon').toggleClass('fa fa-list fa fa-angle-up animated fadeIn');
  });
});
