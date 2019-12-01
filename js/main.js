// projects overlay on hover
$(document).ready(function() {
	$('div.project-container').on('mouseenter mouseleave', function(event) {
		var $this = $(this);
		var $details = $this.find('.overlay');
		if (event.type == 'mouseenter') {
			$details.fadeTo('fast', 0.9);
		} else {
			$details.fadeOut('fast');
		}
	});

    // dropdown nav 
    $('#projects-dropdown').click(function(event) {
    	event.preventDefault();
    	$('.sub-menu').slideToggle();
    })

    $('ul.sub-menu > li').click(function(e) {
    	e.stopPropagation();
    });

    $('article').on('click', function() {
    	$('ul.sub-menu').hide();
        if( $('.fa-angle-down').hasClass('active') ) {
            $('.fa-angle-down').removeClass('active');
        }
    });

	$('#projects-dropdown').click(function(event) {
		$('.fa-angle-down').toggleClass('active');
	});


    // Scroll to top
    $(window).scroll(function() {
        var $this = $(this);
        if ($this.scrollTop() >= 50) {        // If page is scrolled more than 50px
            $('#return-to-top').fadeIn(200);    // Fade in the arrow
        } else {
            $('#return-to-top').fadeOut(200);   // Else fade out the arrow
        }
    });
    $('#return-to-top').click(function() {      // When arrow is clicked
        $('body,html').animate({
            scrollTop : 0                       // Scroll to top of body
        }, 500);
    });


});

