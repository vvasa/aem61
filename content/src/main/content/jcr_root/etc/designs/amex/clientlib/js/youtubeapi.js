// Load Youtube API
  	var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		// window.onerror = function(message, url, lineNumber) {
		// 	// console.log('An error occurred:', e);
		// 	alert('Message: ' + message + '\nURL: ' + url + '\nLine Number: ' + lineNumber);
		// }

		Amex.Settings = Amex.Settings || {};
		Amex.Settings.logLevel = -1;
		Amex.Settings.pageRoot = ".";
		Amex.Settings.assetsRoot = "https://4ea8dc00e37ec33660d4-5ca2d92f73123ec0f1c4905a63dfd3bf.ssl.cf1.rackcdn.com";
		Amex.Settings.pageArtist = "home";
		Amex.Settings.pageArtistType = "";
		Amex.Settings.pageTrackingId = "17971";
		Amex.Settings.pageRmaction = "UnstagedHomePage";
		Amex.Settings.pageTrackingLinknav = "homepage";
		Amex.Settings.pageTrackingLayertrack = "";

		$(function() {
			Amex.init("November 11 2015 19:25:00 EST,November 11 2015 01:00:00 EST,November 11 2015 04:00:00 EST");
		});

		// Disclosure iframe
		if( $('#masks_disclosure').length){
			var iframe = $('#masks_disclosure'),
				max_w = iframe.css('max-width').replace('px', '') * 1;
			/**
			* explicity set pixel width on iframe
			*/
			function fitIframe() {
				var w = $(window).width();
				w = w >= max_w ? max_w : w;
				iframe.css({width : w + 'px'});
			}
			fitIframe();
			$(window).on('resize', function(){
				fitIframe();
			});
		}