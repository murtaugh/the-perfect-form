// Browser detection for when you get desparate. A measure of last resort.
// http://rog.ie/post/9089341529/html5boilerplatejs

var b = document.documentElement;
b.setAttribute('data-useragent',  navigator.userAgent);
b.setAttribute('data-platform', navigator.platform);

// sample CSS: html[data-useragent*='Chrome/13.0'] { ... }

(function($){

$(document).ready(function (){

	// for demo purposes only!
	$("#perfect-form-demo").on("submit", function(e) {
		
		e.preventDefault();
		
	});

	$('textarea[data-autoresize]').on('input propertychange', function() {
		
		autoResize($(this));
		
	});
	
	// set up Ziptastic
	var elements = {
		country: $('#country'),
		state: $('#state'),
		city: $('#city'),
		zip: $('#zip')
	}
	
	// Initialize the ziptastic and bind to the change of zip code
	elements.zip.ziptastic()
	.on('zipChange', function(evt, country, state, city, zip) {
		elements.country.val(country).parent().addClass('auto-populated');
		elements.state.val(state).parent().addClass('auto-populated');
		elements.city.val(city).parent().addClass('auto-populated');
	});
	// end Ziptastic
	
	$('*[data-validate="onblur"]').on('blur', function() {
		
		valType = $(this).attr("data-type");
		value = $(this).val();
		
		if($(this).attr("required")) {
			
			required = true;
			
		} else {
		
			required = false;
		
		};
		
		inputValidation($(this), required, valType, value);
	
	});
	
	$('*[data-validate="live"]').on('input propertychange', function() {
		
		valType = $(this).attr("data-type");
		value = $(this).val();
		
		if($(this).attr("required")) {
			
			required = true;
			
		} else {
		
			required = false;
		
		};
		
		inputValidation($(this), required, valType, value);
	
	});

});


})(window.jQuery);

// master validation

var urlFilter = /^((http|https):\/\/)?(www[.])?([a-zA-Z0-9]|-)+([.][a-zA-Z0-9(-|\/|=|?)?]+)+$/;
var emailFilter = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;

function inputValidation(which, requiredState, valType, value) {

	if ((requiredState == true) && (value == "")) { // if empty and required, don't bother running any other checks
		
		which.parent().removeClass("valid").addClass("invalid");
		
	} else if (value == "") {
		
		which.parent().removeClass("invalid");
		
	} else {
	
		if (valType == "email") {
				
			if (emailFilter.test(which.val())) {
			
				which.parent().removeClass("invalid").addClass("valid");
			
			} else if (which.val().length != 0) {
				
				which.parent().removeClass("valid").addClass("invalid");
			
			};
		
		};
	
	};

};

/*
	Functions for auto-resizing textareas.
	Based almost entirely on John Long's excellent autogrow plugin (except I un-plugin-ifyed it):
	https://gist.github.com/jlong/2127634
	
	For a more consistent user experience you should apply resize: none to auto-resizing textareas in your CSS.
	The plugin needs to apply it on its own, so it's better that it not be there at all. (That said, you probably
	want to apply that style only when JS is avaialble.)
*/

var properties = ['-webkit-appearance','-moz-appearance','-o-appearance','appearance','font-family','font-size','font-weight','font-style','border','border-top','border-right','border-bottom','border-left','box-sizing','padding','padding-top','padding-right','padding-bottom','padding-left','min-height','max-height','line-height'],	escaper = $('<span />');

function escape(string) {
	return escaper.text(string).text().replace(/\n/g, '<br>');
};

function autoResize(which) {
	
	if (!which.data('autogrow-applied')) {
	
		var textarea = which,	 initialHeight = textarea.innerHeight(), expander = $('<div />'), timer = null;

		// Setup expander
		expander.css({'position': 'absolute', 'visibility': 'hidden', 'bottom': '110%'})
		$.each(properties, function(i, p) { expander.css(p, textarea.css(p)); });
		textarea.after(expander);

		// Setup textarea
		textarea.css({'overflow-y': 'hidden', 'resize': 'none', 'box-sizing': 'border-box'});
		
		// Sizer function
		function sizeTextarea() {
			clearTimeout(timer);
			timer = setTimeout(function() {
				var value = escape(textarea.val()) + '<br>z';
				expander.html(value);
				expander.css('width', textarea.innerWidth() + 2 + 'px');
				textarea.css('height', Math.max(expander.innerHeight(), initialHeight) + 2 + 'px');
			}, 100); // throttle by 100ms 
		}

		// Bind sizer to IE 9+'s input event and Safari's propertychange event
		textarea.on('input.autogrow propertychange.autogrow', sizeTextarea);

		// Set the initial size
		sizeTextarea();

		// Record autogrow applied
		textarea.data('autogrow-applied', true);
		
	};
	
};


/* @daspecster's ziptastic-jquery-plugin */

(function( $ ) {
	var requests = {};
	var zipValid = {
		us: /[0-9]{5}(-[0-9]{4})?/
	};

	$.ziptastic = function(zip, callback){
		// Only make unique requests
		if(!requests[zip]) {
			requests[zip] = $.getJSON('http://zip.elevenbasetwo.com/v2/' + zip);
		}

		// Bind to the finished request
		requests[zip].done(function(data) {
			callback(data.country, data.state, data.city, zip);
		});

		// Allow for binding to the deferred object
		return requests[zip];
	};

	$.fn.ziptastic = function( options ) {
		return this.each(function() {
			var ele = $(this);

			ele.on('keyup', function() {
				var zip = ele.val();

				// TODO Non-US zip codes?
				if(zipValid.us.test(zip)) {
					$.ziptastic(zip, function(country, state, city) {
						// Trigger the updated information
						ele.trigger('zipChange', [country, state, city, zip]);
					})
				}
			});
		});
	};
})( jQuery );