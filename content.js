/* content
 * - Given a Blackboard page containing a content item with  
     HTML generated from Mammoth
 * - Implement a variety of transformations
 */
 
// Wrap arounds for various types of activity 
var READING=`<div class="image"><img src="https://djon.es/gu/icons/icons8-reading-48.png" /></div>`;
var ACTIVITY=`<div class="image"><img src="https://djon.es/gu/icons/icons8-dancing-48.png" /></div>`;
var NOTE=`<div class="icon"><img src="http://uimagine.edu.au/interact2-theme/fa/Blk-Warning.png"></div>`;

var EXPAND_COLLAPSE_BUTTON_HTML = `<div class="accordion-expand-holder">
<button type="button" class="open">Expand all</button>
<button type="button" class="close">Collapse all</button>
</div>`;

// simple definition for using pure.css tables
// TODO need to replace this.
var TABLE_CLASS='table stripe-row-odd'; 

// Define way to insert a checkbox that can be clicked
var CHECKBOX=`<input type="checkbox" name="gu_dummy" />`;

// specify Bb links to ensure external links open in new window
var BLAED_LINK = 'bblearn-blaed.griffith.edu.au';
var LMS_LINK = 'bblearn.griffith.edu.au';

/****************************************************************************/

/* Main function
 * - called from the tweak
 */
 
function contentInterface($){
    
    // redefine contains so that it is case insensitive
    // Used to match the Blackboard headings
    $.expr[":"].contains = $.expr.createPseudo(function(arg) {
        return function( elem ) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });
    
	/* define variables based on Bb page type */
	/* used to identify important components in html */
	var tweak_bb_active_url_pattern = "listContent.jsp";
	window.tweak_bb = { display_view: (location.href.indexOf(tweak_bb_active_url_pattern) > 0 ), 
          page_id: "#content_listContainer",
	      row_element: "li" };   
	
	// Find the item in which the content is contained
    var contentInterface = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find(".item h3").filter(':contains("Content Interface")').eq(0);
    
    // check parameters passed in
    params = checkParams( contentInterface);
    
 	 // Hide the tweak if we're not editing
	 if (location.href.indexOf("listContent.jsp") > 0) {
         $(".gutweak").parents("li").hide(); 
         contentInterface.parents("div.item").hide();
	 }

    // do nothing if we couldn't find the contentInterface item
    if ( contentInterface.length === 0){
 	    return false;
 	}

    // handle the integration of any blackboard headings/items into the
    // content interface
    jQuery("h1.blackboard").each( handleBlackboardItem );
    jQuery("h2.blackboard").each( handleBlackboardItem );
    
 	// Add a <div> </div> around all the content following H1s
 	jQuery('#GU_ContentInterface h1').each(function() {
 	    jQuery(this).nextUntil('h1').addBack().wrapAll('<div class="accordion_top"></div>');
 	    jQuery(this).nextUntil('h1').wrapAll('<div></div>');
 	});
 	// Add divs around the h2 headings, until h2 or h1
 	jQuery('#GU_ContentInterface h2').each(function() {
 	   // console.log( "Heading text " + jQuery(this).html());
 	    jQuery(this).nextUntil('h1,h2').addBack().wrapAll('<div class="accordion"></div>');
 	    jQuery(this).nextUntil('h1,h2').wrapAll('<div></div>');
 	});
 	
    // Update all the readings and activities
    jQuery("div.activity").prepend(ACTIVITY);
    jQuery("div.reading").prepend(READING);
    jQuery("div.ael-note").prepend(NOTE);
	//updateReadings(contentInterface);
	// Handle the blackboard items
	
	// Convert the videos - handled by embed now
	//doVideo();
	
	// convert the embed code
	var embeds = jQuery(".embed");
	embeds.each( function(idx){
	    var embed = jQuery(this).html();
	    var decoded = jQuery("<div/>").html(embed).text();
	    jQuery(this).html(decoded);
	    
	});
	
	// Find all the div.picture and add a <p> </p> around
	// text after the image
	jQuery("#GU_ContentInterface div.picture").each( function(idx) {
	    jQuery(this).children('img').after('<br />');
	   //console.log("Picture found " + jQuery(this).text()) ;
	   //console.log("Picture found after text " + jQuery(afterImage));
	});
	jQuery("#GU_ContentInterface div.pictureRight").each( function(idx) {
	    jQuery(this).children('img').after('<br />');
	   //console.log("Picture found " + jQuery(this).text()) ;
	   //console.log("Picture found after text " + jQuery(afterImage));
	});
	
	// convert all tables in the content to TABLE_CLASS
	// - TODO only add TABLE_CLASS if it doesn't have and div#tableHeading
	//   or otheers within it
	jQuery("#GU_ContentInterface table").addClass(TABLE_CLASS);
	
	// center contents of table cells that contain span class strongCentered
	jQuery("#GU_ContentInterface span.strongCentered").each( function(idx){
	        if (jQuery(this).parent().parent().is("td")) {
	            jQuery(this).parent().parent().css('text-align','center');
	        }
	    });
	    
	jQuery("#GU_ContentInterface span.centered").each( function(idx){
	        if (jQuery(this).parent().parent().is("td")) {
	            jQuery(this).parent().parent().css('text-align','center');
	        }
	    });
	
	
	// check for any spans class checkbox and replace with checkbox
	jQuery("#GU_ContentInterface span.checkbox").each( function(idx) {
	    //console.log(idx + " found checkbox " + jQuery(this).html());
	    jQuery(this).html(CHECKBOX);
	});
	
	// convert all external links to open in another window
	// Also convert blaed links to normal bblean links
	jQuery("#GU_ContentInterface a").each( function(idx) {
	    // check if it's a blackboard link
	    var theLink = jQuery(this).attr('href');
	    
	    if ( typeof theLink !== 'undefined'){
	        // replace blaed links
            if ( theLink.match(BLAED_LINK)!==null) {
                theLink = theLink.replace( BLAED_LINK, LMS_LINK);
                jQuery(this).attr('href',theLink);
            }
	        // open external links in a new window
            if ( theLink.match(LMS_LINK) === null) {
	            jQuery(this).attr('target','_blank');
	            // turn off the Blackboard onclick "stuff"
	            jQuery(this).prop("onclick",null).off("click");
            }
	    }
	});
	
	// Apply the jQuery accordion
    accordionDisabled = false;
    if ( params.noAccordion===true){
        // This actually greys out the accordion, rather than not
        // using it
        //accordionDisabled = true;
    }
    jQuery(".accordion,.accordion_top").accordion({
        collapsible: true,
        active: 1,
        disabled: accordionDisabled,
        navigation:true,
        //autoHeight:true
        heightStyle: 'content',
        activate : function( event, ui ) {
			if(!$.isEmptyObject(ui.newHeader.offset())) {
				$('html:not(:animated), body:not(:animated)').animate({ scrollTop: ui.newHeader.offset().top }, 'slow');
				// send resize to ensure that h5p iframe appears correct
				// size
				window.dispatchEvent(new Event('resize'));
			}
        }
    });
    
    // TODO move this to a string and make it look prettier
    jQuery( "#GU_ContentInterface").prepend(EXPAND_COLLAPSE_BUTTON_HTML);
    var icons = jQuery(".accordion").accordion("option", "icons");
    // define the click function for the expand all
    jQuery('.open').click(function () {
        console.log("Open click");
        jQuery('.ui-accordion-header').removeClass('ui-corner-all').addClass('ui-accordion-header-active ui-state-active ui-corner-top').attr({
            'aria-selected': 'true',
                'tabindex': '0'
        });
        jQuery('.ui-accordion-header-icon').removeClass(icons.header).addClass(icons.headerSelected);
        jQuery('.ui-accordion-content').addClass('ui-accordion-content-active').attr({
            'aria-expanded': 'true',
                'aria-hidden': 'false'
        }).show();
        jQuery(this).attr("disabled", "disabled");
        jQuery('.close').removeAttr("disabled");
    });
    // define the click functio for the collapse all
    jQuery('.close').click(function () {
        jQuery('.ui-accordion-header').removeClass('ui-accordion-header-active ui-state-active ui-corner-top').addClass('ui-corner-all').attr({
            'aria-selected': 'false',
                'tabindex': '-1'
        });
        jQuery('.ui-accordion-header-icon').removeClass(icons.headerSelected).addClass(icons.header);
        jQuery('.ui-accordion-content').removeClass('ui-accordion-content-active').attr({
            'aria-expanded': 'false',
                'aria-hidden': 'true'
        }).hide();
        jQuery(this).attr("disabled", "disabled");
        jQuery('.open').removeAttr("disabled");
    });
    jQuery('.ui-accordion-header').click(function () {
        jQuery('.open').removeAttr("disabled");
        jQuery('.close').removeAttr("disabled");
        //console.log('click header ' + jQuery(this).html());
    });
    
    // figure out which accordion to open
    // - by default it is the first 0
    // - if an integer is used as a link e.g. #1 or #5
    //   then open accordion matching that number
    
    var start = window.location.hash.substring(1);
    
    numAccordions = jQuery('.accordion_top').length;
    start = parseInt( start, 10 ) - 1;
    if ( ( ! Number.isInteger(start) ) || ( start > numAccordions-1 ) ) {
        start=0;
        end=1;
    } else  {
        end=start+1;
    }
    // want all expanded, figure out num accordions and set end appropriately
    if ( params.expandAll===true){
        start = 0;
        end = jQuery('#GU_ContentInterface h1').length;
    }
    jQuery('.accordion_top').slice(start,end).accordion("option","active", 0);
    
    
    
}

/************************************************
 * checkParams
 * - given the content interface element check to see if anya
 *   parameters passed in 
 * - set object attributes and return it
 * 
 */

function checkParams( contentInterface) {
    var paramsObj = {};
    
    if (contentInterface.length>0) {
        var contentInterfaceTitle = jQuery.trim(contentInterface.text());
        
        var m = contentInterfaceTitle.match(/content interface\s*([^<]+)/i );
        
        if (m) {
            params = m[1].match(/\S+/g);
            
            if (params) {
                params.forEach( function(element) {
                    if ( element.match(/expandall/i)) {
                        paramsObj.expandAll = true;
                    }
                    if ( element.match(/collapseall/i)) {
                        paramsObj.collapseAll = true;
                    }
                    if ( element.match(/noaccordion/i)) {
                        paramsObj.noAccordion = true;
                    }
                });
            }
        }
    }
    return paramsObj;
}

/***************************************************
 * handleBlackboardItem
 * Given a single heading element as this
 * - find the matching Blackboard element
 * - find the content up until the next heading
 * - find any span.blackboardLink in the HTML and update the link
 */
 
function handleBlackboardItem() {
    // make sure we're doing upper case 
    title = replaceWordChars( jQuery(this).text() ).toUpperCase();
    //console.log("Handling blackboard item " + title );
    /* Find the matching Blackboard element heading (h3) */
    var bbItem = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find(
        ".item h3").filter(":contains( " + title +")"); //.eq(0);
    
    if ( bbItem.length===0) {
        console.log("ERROR didn't find a match for " + title );
    } else if ( bbItem.length > 1 ) {
        console.log("Error found more than 1 (" + bbItem.length + ") entries matching " + title);
    } else if ( bbItem.length===1 ) {
        // get the link
        var link = jQuery(bbItem).children("a").attr('href');
        
        // if there's no link, then check to see if it's TurnitIn
        if ( link == null ) {
            // Assume it's a TurnitIn and look for "View Assignment" link
            // Have to go up to the parent and onto the next div
            link = jQuery(bbItem).parent().next().children(".vtbegenerated").children("a");
            var text = link.text();
            if ( text === 'View Assignment') {
                // we've found a Safe Assignment link
                link = link.attr('href');
            }
        }
        
        // Hide the bbitem li
        if (location.href.indexOf("listContent.jsp") > 0) {
            jQuery(bbItem).parent().parent().hide();
        }
        // wrap any span class="blackboardLink" with a link
        var string = '<a href="' + link + '"></a>';
        // Try to replace just the Blackboard links for the current heading
        jQuery(this).nextUntil('h1').find(".blackboardLink").each( function() {
            jQuery(this).wrapAll(string);
        });
        
    }
    
}

/*********************************************************************
 * Replaces commonly-used Windows 1252 encoded chars that do not exist 
 * in ASCII or ISO-8859-1 with ISO-8859-1 cognates.
 * https://www.andornot.com/blog/post/Replace-MS-Word-special-characters-in-javascript-and-C.aspx
 */
 
function replaceWordChars(text) {

    var s = text;
    // smart single quotes and apostrophe
    s = s.replace(/[\u2018\u2019\u201A]/g, "\'");
    // smart double quotes
    s = s.replace(/[\u201C\u201D\u201E]/g, "\"");
    // ellipsis
    s = s.replace(/\u2026/g, "...");
    // dashes
    s = s.replace(/[\u2013\u2014]/g, "-");
    // circumflex
    s = s.replace(/\u02C6/g, "^");
    // open angle bracket
    s = s.replace(/\u2039/g, "<");
    // close angle bracket
    s = s.replace(/\u203A/g, ">");
    // spaces
    s = s.replace(/[\u02DC\u00A0]/g, " ");
    
    return s;
}

/**
 * Final all the embedded video styles and embed them
 * NOT WORKING
 */
 
function doVideo() {
    console.log(" Started videos");
    
    var videos = jQuery("div.video");
    console.log(" Got " + videos.length + " videos");
    
    if ( videos.length===0) {
        return false;
    }
    
    videos.each( function(idx){
        var text = jQuery(this).text();
        console.log(idx + " -- " + text);
        
        var matches = text.match( /x/ );
        var id = matches[1],width='640',height='480';
        
        console.log('Match 0 ' + matches[0] + " 1 " + matches[1]);
        text = '<div class="youtube-article">' +
                  '<iframe class="dt-youtube" width="' + width +
                  '" height="'+height+'" src="https://www.youtube.com/embed/'+
                  id+'" frameborder="0" allowfullscreen></iframe></div>';
        
        console.log( "Ending with " + text);
        jQuery(this).html(text);
    });
    
    
} 


//*** Experiements to see if I can open all by function call **

function openAll() {
        console.log("Open ALL ");
        jQuery('.ui-accordion-header').removeClass('ui-corner-all').addClass('ui-accordion-header-active ui-state-active ui-corner-top').attr({
            'aria-selected': 'true',
                'tabindex': '0'
        });
        jQuery('.ui-accordion-header-icon').removeClass(icons.header).addClass(icons.headerSelected);
        jQuery('.ui-accordion-content').addClass('ui-accordion-content-active').attr({
            'aria-expanded': 'true',
                'aria-hidden': 'false'
        }).show();
        jQuery(this).attr("disabled", "disabled");
        jQuery('.close').removeAttr("disabled");
}
