/*
 * qunit-example
 * https://github.com/leobalter/qunit-example
 *
 * Copyright (c) 2014 Leonardo Balter
 * Licensed under the MIT license.
 */

(function($) {

  // Collection method.
  $.fn.qunit_example = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.qunit_example = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.qunit_example.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.qunit_example.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].qunit_example = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
