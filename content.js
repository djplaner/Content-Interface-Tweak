/* content
 * - Given a Blackboard page containing a content item with  
     HTML generated from Mammoth
 * - Implement a variety of transformations
 */
 
// Wrap arounds for various types of activity 
var READING=`<div class="image"><img src="https://djon.es/gu/icons/icons8-reading-48.png" /></div>`;
var ACTIVITY=`<div class="image"><img src="https://djon.es/gu/icons/icons8-dancing-48.png" /></div>`;
var NOTE=`<div class="icon"><img src="http://uimagine.edu.au/interact2-theme/fa/Blk-Warning.png"></div>`;

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
    
 	// Add a <div> </div> around all the content following H1s
 	jQuery('#GU_ContentInterface h1').each(function() {
 	    jQuery(this).nextUntil('h1').wrapAll('<div></div>');
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
	
	// convert all tables in the content to TABLE_CLASS
	jQuery("#GU_ContentInterface table").addClass(TABLE_CLASS);
	
	// check for any spans class checkbox and replace with checkbox
	jQuery("#GU_ContentInterface span.checkbox").each( function(idx) {
	    console.log(idx + " found checkbox " + jQuery(this).html());
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
	jQuery("#GU_ContentInterface").accordion( {header:"h1",
	    collapsible:true, heightStyle: 'content',
	    navigation: true,
	    activate : function( event, ui ) {
			if(!$.isEmptyObject(ui.newHeader.offset())) {
				$('html:not(:animated), body:not(:animated)').animate({ scrollTop: ui.newHeader.offset().top }, 'slow');
			}
		}
	});
	//console.log("after accordion");
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
        
        // Hide the bbitem li
        if (location.href.indexOf("listContent.jsp") > 0) {
            jQuery(bbItem).parent().parent().hide();
        }
        // wrap any span class="blackboardLink" with a link
        var string = '<a href="' + link + '"></a>';
        // Try to replace just the Blackboard links for the current heading
        jQuery(this).nextUntil('h1').find(".blackboardLink").wrapAll(string);
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


