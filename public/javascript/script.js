/*
$.fn.getTab = function () {
    this.keydown(function (e) {
        if (e.keyCode === 9) {
            var val = this.value,
                start = this.selectionStart,
                end = this.selectionEnd;
            this.value = val.substring(0, start) + '\t' + val.substring(end);
            this.selectionStart = this.selectionEnd = start + 1;
            return false;

        }
        return true;
    });
    return this;
};

$.fn.md = function() {

  this.keydown(function(e) {

    // unindent
    if(e.keyCode === 9 && e.shiftKey) {
      var val = this.value,
          start = this.selectionStart,
          end = this.selectionEnd;
      this.value = val.substring(0, start) + '\t' + val.substring(end);
      this.selectionStart = this.selectionEnd = start + 1;
      return false;
    }

    // indent
    if(e.keyCode === 9 && e.shiftKey == false) {
      // tab

      // check if there is a selection
      // if not just indent that line

      var val = this.value,
          start = this.selectionStart,
          end = this.selectionEnd;
      this.value = val.substring(0, start) + '\t' + val.substring(end);
      this.selectionStart = this.selectionEnd = start + 1;
      return false;
    }

    // Insert Link
    // CTRL + SHIFT + L
    if(e.keyCode === 76 && e.ctrlKey && e.shiftKey) {
      alert('Insert Link');
    }

    // Insert Image
    // CTRL + SHIFT + I
    if(e.keyCode === 73 && e.ctrlKey && e.shiftKey) {
      alert('Insert Image');
    }

    // Insert X
    // CTRL + SHIFT + L
    if(e.keyCode === 76 && e.ctrlKey && e.shiftKey) {
      alert('works');
    }


    return true;
  });



};
*/

$(function() {
  // hide flash messages
  setTimeout(function() {
    $('.messages').animate({
      opacity: 0,
      top: '-50px'
    });
  }, 5000);
  $('.messages').hover(function() {
    $(this).animate({
      opacity: 0,
      top: '-50px'
    });
  });
  
  var $handle = $('.document-detail');  
  $('#handle a').click(function() {
    if($handle.hasClass('open')) {
      $('header #content').slideUp(function() {
        $handle.removeClass('open');
      });
    } else {
      $handle.addClass('open');
      $('header #content').slideDown();
    }
    return false;
  });
});
