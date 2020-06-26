
/* content
 * - Given a Blackboard page containing a content item with  
     HTML generated from Mammoth
 * - Implement a variety of transformations
 */
 
var tweak_bb_active_url_pattern = "listContent.jsp";

// Wrap arounds for various types of activity 
var READING=`<div class="image"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-reading-48.png" /></div>`;
var ACTIVITY=`<div class="image"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-dancing-48.png" /></div>`;
var NOTE=`<div class="icon"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/Blk-Warning.png"></div>`;

//
var EXPAND_COLLAPSE_BUTTON_HTML = `<div class="accordion-expand-holder">
<button class="gu_content_open" style="padding:0.3em 1.2em;margin:0 0.3em 0.3em 0;border-radius:2em;border:2px solid;box-sizing: border-box;text-decoration:none;text-align:center">Expand all</button>
<button class="gu_content_close"  style="padding:0.3em 1.2em;margin:0 0.3em 0.3em 0;border-radius:2em;border:2px solid;box-sizing: border-box;text-decoration:none;text-align:center">Collapse all</button>
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
            arg = arg.replace(/\u2013|\u2014/g, "-");
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });
    
	/* define variables based on Bb page type */
	/* used to identify important components in html */
	var tweak_bb_active_url_pattern = "listContent.jsp";
	window.tweak_bb = { display_view: (location.href.indexOf(tweak_bb_active_url_pattern) > 0 ), 
          page_id: "#content_listContainer",
	      row_element: "li" };   
	
	// Add to jQuery a function that will be used to find BbItems that
	// match a given title
	jQuery.expr[':'].textEquals = jQuery.expr[':'].textEquals || jQuery.expr.createPseudo(function(arg) {
            return function( elem ) {
                arg = arg.replace(/\u2013|\u2014/g, "-");
                // Convert emdash type chars to ASCII equivalents
                elemText = elem.textContent.trim();
                elemText = elemText.replace(/\u2013|\u2014/g, "-");
                arg = arg.replace(/[\u201c\u201d]/g, "\"");
                elemText = elemText.replace(/[\u201c\u201d]/g, "\"");
                //console.log("Compre arg **" + arg + "** with **" + elemText + "**");
                return elemText.localeCompare( arg, undefined, {
                    sensitivity: 'base'
                }) === 0;
            };
        });
        
        
	// Find the item in which the content is contained
    var contentInterface = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find(".item h3").filter(':contains("Content Interface")').eq(0);
    // Find any Word Document link that's been added
    var wordDoc = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find(".item h3").filter(':contains("Content Document")').eq(0);
    
    params = checkParams( contentInterface,wordDoc);
    setUpEdit(contentInterface, params);
    
    // check parameters passed in
 	 // Hide the tweak if we're not editing
	 if (location.href.indexOf("listContent.jsp") > 0) {
         $(".gutweak").parents("li").hide(); 
         contentInterface.parents("div.item").hide();
         jQuery(wordDoc).hide();
	 }

    // do nothing if we couldn't find the contentInterface item
    if ( contentInterface.length === 0){
 	    return false;
 	}

    // remove the vtbegenerated class as it's screwing with CSS in the content
    // PROBLEM if you do this all the normal styles e.g. <LI> revert to
    // an almost empty setting from an earlier Blackboard style sheet.
    /*ci = jQuery("#GU_ContentInterface");
    vtb = jQuery(ci).parent().parent();//".vtbegenerated");
    jQuery(vtb).removeClass("vtbegenerated");*/
    
    
    
    // Add a <div> </div> around all the content following H1s
 	jQuery('#GU_ContentInterface h1').each(function() {
 	    // Kludge test for changing colour
 	    title = jQuery(this).text();
 	    
        jQuery(this).nextUntil('h1').addBack().wrapAll('<div class="accordion_top"></div>');
 	    jQuery(this).nextUntil('h1').wrapAll('<div class="gu-accordion-h1-body"></div>');
 	});
 	// Add divs around the h2 headings, until h2 or h1
 	jQuery('#GU_ContentInterface h2').each(function() {
 	   // console.log( "Heading text " + jQuery(this).html());
 	    jQuery(this).nextUntil('h1,h2').addBack().wrapAll('<div class="accordion"></div>');
 	    jQuery(this).nextUntil('h1,h2').wrapAll('<div class="gu-accordion-h2-body"></div>');
 	});
 	
 	// handle the integration of any blackboard headings/items into the
    // content interface
    
    jQuery("h1.blackboard").each( handleBlackboardItem );
    jQuery("h2.blackboard").each( handleBlackboardItem );
    jQuery("span.blackboardContentLink").each( handleBlackboardContentLink );
    jQuery("span.blackboardMenuLink").each( handleBlackboardMenuLink );
    
    handleBlackboardCards();
    //jQuery("div.bbCard").each( handleBlackboardCards );
 	
 	
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
	    // but ignore any with class gu-bb-review, these are added for
	    // review status
	    
	    linkClass = jQuery(this).attr("class");
	    if ( linkClass === "gu-bb-review") {
	        return;
	    }
	    
	    var theLink = jQuery(this).attr('href');
	    
	    if ( typeof theLink !== 'undefined'){
	        // replace blaed links with normal links
            if ( theLink.match(BLAED_LINK)!==null) {
                theLink = theLink.replace( BLAED_LINK, LMS_LINK);
                jQuery(this).attr('href',theLink);
            }
	        // open external links in a new window i.e. links that don't
	        // match the LMS or don't have a host portion at the start
            if ( theLink.match(LMS_LINK) === null && theLink.match(/^\//)===null && theLink.match(/^javascript:mark/)===null) {
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
    // check if there is actually an accordion, if not don't go any further
    
    // add and handle the accordion
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
    jQuery('.gu_content_open').click(function (event) {
        event.preventDefault();
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
        jQuery('.gu_content_close').removeAttr("disabled");
    });
    // define the click functio for the collapse all
    jQuery('.gu_content_close').click(function () {
        event.preventDefault();
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
        jQuery('.gu_content_open').removeAttr("disabled");
    });
    jQuery('.ui-accordion-header').click(function () {
        jQuery('.gu_content_open').removeAttr("disabled");
        jQuery('.gu_content_close').removeAttr("disabled");
        //console.log('click header ' + jQuery(this).html());
    });
    
    // figure out which accordion to open
    // - by default it is the first 0
    // - if an integer is used as a link e.g. #1 or #5
    //   then open accordion matching that number
    // - if paramsObj.collapseAll == true - then none
    
    var start = window.location.hash.substring(1);
    var end;
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
    } else if ( params.collapseAll===true ){
        start = 0;
        end =0;
    } else if ( params.expand>0 ) {
        if ( params.expand < jQuery('#GU_ContentInterface h1').length ) {
            start = params.expand-1;
            end = start+1;
        } else {
            console.log("ERROR - expand value (" + params.expand +") larger than number of heading 1s ");
        }
    }
    
    //jQuery("#globalNavPageNavArea").scrollTop(0);
    jQuery('.accordion_top').slice(start,end).accordion("option","active", 0);
    //if ( start === 0 && end === 1) {
    //}
    
	// Remove the Content Interface from the vtbegenerated div so that
	// Bb CSS doesn't override embedded Card CSS
    var journey = jQuery(contentInterface).parent().next('div.details').children('.vtbegenerated');    
    var child = jQuery(journey).children("#html");    
    jQuery(child).unwrap();
}

/***************************************************
 * setUpEdit
 * - Set up the edit/update process
 * 
 * 
 */
 

var UPDATE_HTML = `
<h3>Important</h3>
<ol>
<li><strong>No changes to this item</strong> - do not edit or remove content from this tweak code item. The tweak code implements the Card interface. Changes may break the Card interface.</li>
<li><strong>Do not hide this item from students.</strong> - the tweak in this item will hide the item from students. They will not see it. If you use Blackboard to hide this tweak from students, it will NOT work and students won't see the accordion interface.</li>
</ol>
<p>For some help on using this feature, please peruse <a href="https://github.com/djplaner/Content-Interface-Tweak/blob/master/README.md">the README page</a></p>

 <h3>Updating and editing</h3>

`;

var WORD_DOC_PRESENT = `
<ol>
  <li> Make any changes to the Content document, either <a id="gu_doc" target="_blank" href="http://griffith.edu.au">online</a> or directly.</li>
  <li>  Click the green button to <button style="background-color: #4CAF50; border: none; color: white; padding: 5px 5px; text-align: center; text-decoration: none; display: inline-block; border-radius: 12px" type="button" id="guUpdate">Update Content Interface</button>  </li>
  </ol>
`;

var WORD_DOC_NOT_PRESENT =`<ol>
<li>Make any change in the matching Word document.</li>
<li><a href="https://djon.es/gu/mammoth.js/browser-demo/" target="_blank" rel="noreferrer noopener">Convert the Word document into HTML</a>.</li>
<li>Copy and paste the HTML into {EDIT_CONTENT_ITEM}. <br />
<p>See this <a href="http://www.bu.edu/tech/services/teaching/lms/blackboard/how-to/copypaste-into-blackboard-learn/">explanation on how to copy and paste HTML</a> into Blackboard content items.</p>
</li>
</ol>
<p>To semi-automate this process, you can:</p>
<ol>
  <li> Share the Word document via OneDrive or Sharepoint and copy the share URL.<br />(<a href="https://support.office.com/en-us/article/share-a-document-using-sharepoint-or-onedrive-807de6cf-1ece-41b9-a2b3-250d9a48f1e8">How to share a document using SharePoint or OneDrive</a>) </li>
  <li> Create a <em>Web Link</em> item on this page using the name <em>Content Document</em> and the URL as the shared URL created in the first step.<br />(<a href="https://help.blackboard.com/Learn/Instructor/Course_Content/Create_Content/Create_Course_Materials/Link_to_Websites">How to create a Web Link item in Blackboard</a>) </li>
</ol>

`;

var CONTENT_INTERFACE_NOT_PRESENT = `
<h3>Missing Content Interface item</h3>

<p>Unable to find a content item on this page with <strong>Content Interface</strong> in the title.</p>
<p>Such a content item is required before the Content Interface tweak can function.</p>
`;

var OLD_INSTRUCTIONS = `
<h3>Detailed documentation</h3>
<p>See <a href="https://griffitheduau-my.sharepoint.com/:w:/g/personal/d_jones6_griffith_edu_au/EUbAQvhxLW1MicRKf9Hof3sBIoS2EyJP_SfkYbqZ7c3qhw?e=2S9k3Y" target="_blank" rel="noreferrer noopener">this Word document</a> for more detailed documentation on creating and changing content.</p>
`;

var INSTRUCTIONS = `
<h3>How do I...</h3>

<p>More information can be found in <a href="https://griffitheduau-my.sharepoint.com/:w:/g/personal/d_jones6_griffith_edu_au/EUbAQvhxLW1MicRKf9Hof3sBIoS2EyJP_SfkYbqZ7c3qhw?e=2S9k3Y" target="_blank">this Word document</a>, or in the links in the following table.</p>

<table style="width:100%;padding:2px">
  <tr>
    <td bgcolor="#edebf0"> Get started </td>
    <td bgcolor="#ebeef0"> Adding & editing content </td>
    <td bgcolor="#f0ebeb"> Changing how it works </td>
  </tr>
  <tr>
    <td bgcolor="#edebf0">
<ul style="padding-left:1.2em">
  <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#2">Content Interface - why?</a>
       </li>
  <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#4">How to set it up</a> </li>
  <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#5">How to update content</a> </li>
  
  
</ul>
    </td>
    <td bgcolor="#ebeef0">
          <ul>
            <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#6">text, headings, tables and quotes</a> </li>
            <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#7">web content: images, links, videos & embeddable content</a> </li>
            <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#8">study guide content: readings, activitites & notes</a> </li>
            <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#9">Links to Blackboard activities</a> </li>
         </ul>
    </td>
    <td bgcolor="#f0ebeb">
        
    </td>
    </table>
`;
  
  var CHANGE_TEMPLATE = `
<h3>Choosing a different template</h3>
  
  <p>Different templates are available to change the look and feel of the Content Interface.</p>
  <p>There is a two step process:</p>
  <ol>
    <li> Select one of the available style templates from the following list.</p>
<select name="styleSelector" id="styleSelector">
<option value="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">Base</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/start/jquery-ui.css">Start</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css" selected="selected">Smoothness</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/redmond/jquery-ui.css">Redmond</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/sunny/jquery-ui.css">Sunny</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/overcast/jquery-ui.css">Overcast</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/flick/jquery-ui.css">Flick</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/pepper-grinder/jquery-ui.css">Pepper Grinder</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/ui-lightness/jquery-ui.css">UI Lightness</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/ui-darkness/jquery-ui.css">UI Darkness</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/le-frog/jquery-ui.css">Le Frog</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/eggplant/jquery-ui.css">Eggplant</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/dark-hive/jquery-ui.css">Dark Hive</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/cupertino/jquery-ui.css">Cupertino</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/blitzer/jquery-ui.css">Blitzer</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/south-street/jquery-ui.css">South Street</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/humanity/jquery-ui.css">Humanity</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/hot-sneaks/jquery-ui.css">Hot Sneaks</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/excite-bike/jquery-ui.css">Excite Bike</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/vader/jquery-ui.css">Vader</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/black-tie/jquery-ui.css">Black Tie</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/trontastic/jquery-ui.css">Trontastic</option>
<option value="https://code.jquery.com/ui/1.12.1/themes/swanky-purse/jquery-ui.css">Swanky Purse</option>
</select>
  </li>
  
  <li> Modify the tweak code to use the selected template.
      <p>To do this you need to:</p>
      <ol>
        <li> Edit this item. </li>
        <li> Hit the HTML button on the Blackboard editor.</li>
        <li>Find the following line (bold added)
            <p><link rel="&lt;span class=" mceitemhiddenspellword="" />&lt;p&gt;&lt;link rel="stylesheet" id="gu_jqueryStyle" href="<strong>//code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css</strong>" /&gt;&lt;/p&gt;</p>
        </li>
        <li>Replace the bold string with <strong><span id="gu_stylePath">https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css</span></strong></li>
        <li> Save the changes. </li>
</ol>
`;

 
function setUpEdit(ci, params) {
  //------------------------------------------------
  // Check to see if the Content Interface item contains details
  // about the Word document
  // - NO - show a message without update button
  // - YES - add the update button
  
  // does ci contain a path
  // -- currently implemented as a span with id gu_WordDocument that
  //    will contain a simple path (probably only works for me)
  // -- eventually should be a link that works for all with access
  
  
  current = window.location.href;
  var courseId;
  var contentId;
  
  m = current.match( /^.*course_id=(_[^&#]*).*$/ );
  if ( m ) {
      courseId=m[1];
  }
  //console.log("course id " + courseId);

  // get the content id
  contentId = jQuery(ci).parent().attr("id");
  
  // if no content id then change display
  if ( typeof contentId === 'undefined'){
      jQuery('#gu_update').html(CONTENT_INTERFACE_NOT_PRESENT);
      return ;
  }
  
  // Has a link  to the word doc been shared
  var path = params.wordDoc;
  
  if ( typeof path === 'undefined'){
    // Word document is not defined
    var html = UPDATE_HTML + WORD_DOC_NOT_PRESENT

    // add in link to edit the content item
    var editContent = 'into the <a href="https://bblearn-blaed.griffith.edu.au/webapps/blackboard/execute/manageCourseItem?content_id=' + contentId + '&course_id=' + courseId + '&dispatch=edit">Content Interface content item</a>';
    
    html = html.replace( "{EDIT_CONTENT_ITEM}", editContent);
    
   // console.log("edit content item is " + editContent);
    jQuery('#gu_update').html(html);
    return ;
  }
  
  //jQuery(".gu_docNotPresent").hide();
  var updateHtml = UPDATE_HTML + WORD_DOC_PRESENT + INSTRUCTIONS;
  
  if ( jQuery('#gu_jqueryStyle').length ) {
      updateHtml = updateHtml + CHANGE_TEMPLATE; 
  }
  jQuery('#gu_update').html(updateHtml);
  
  jQuery("#gu_doc").attr("href", path);
  
  // remove #6 type links from end of path (breaks conversion)
  //console.log( "path was " + path );
  path = path.replace(/#[0-9]*$/, '');
 // console.log( "path is " + path );
  // encode path ready for going via URLs
  path="u!" + btoa(path).replace(/\+/g,'-').replace(/\//g,'_').replace(/\=+$/,'');
  
  
  
  //---------------------------------------------------
  // Set up the click event for the submit button
  // get the courseId
  
  
  jQuery("#guUpdate").click( function( event ) {
      
      // if href currently includes blaed then add parameter
      var blaed = '';
      var link = window.location.href;
      if ( link.match(BLAED_LINK)!==null) {
          blaed="&blaed=1";
      }
        window.location.href="https://djon.es/gu/mammoth.js/browser-demo/oneDriveMammoth.html?course=" + courseId + blaed + "&content=" + contentId + "&path=" + path ;
  } );
  
  jQuery("#styleSelector").on("change", function() {
        jQuery("#gu_jqueryStyle").attr( "href", this.value );
        jQuery("#gu_stylePath").text(this.value);
   });
}
    
/************************************************
 * checkParams
 * - given the content interface element check to see if anya
 *   parameters passed in 
 * - set object attributes and return it
 * - parameters come from both 
 *   - the title of the Content Interface content item
 *   - a Web Link content item that has Content Document in the title
 */

function checkParams( contentInterface,wordDoc) {
    var paramsObj = {};
    paramsObj.expand = -1;
    
    // Check parameters in the Content Interface item title
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
                        //console.log("Collapse all");
                        paramsObj.collapseAll = true;
                    }
                    if ( element.match(/noaccordion/i)) {
                        paramsObj.noAccordion = true;
                    }
                    /*if ( x = element.match(/wordDoc=([^ ]*)/i) ) {
                        paramsObj.wordDoc = x[1];
                    }*/
                    if ( x = element.match(/expand=([0-9]*)/i)) {
                        paramsObj.expand = x[1];
                    }
                });
            }
        }
    }
    // Check for a Word doc link
    //var wordDoc = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find(".item h3").filter(':contains("Content Document")').eq(0);
    
    var wordDocLink = jQuery(wordDoc).find("a:contains('Content Document')").attr('href');
    
    if ( typeof wordDocLink !== 'undefined' ) {
        paramsObj.wordDoc = wordDocLink;
    }
    
    //console.log(paramsObj);
    return paramsObj;
}

/*********************************************
 * handleBlackboardCards( div)
 * - Identify each collection of sequential cards in the entire content
 * - Convert those into HTML
 */
 
function handleBlackboardCards() {
    
    //----------------- organise card elements into bunches for conversion
    var listOfCardBunches = []
    
    // Get list of all cards
    var cardElements = jQuery("div.bbCard");
    var numCards = cardElements.length, currentCard =0;
    
    if ( numCards === 0 ) {
        return false;
    }
    //console.log("Found numCards " + numCards);
    
    // Create bunches from cards that are sequential and add them
    // to the list of bunches
    while ( currentCard < numCards) {
        // hold the current bunch of cards 
        var currentBunch = [];
        // Create one bunch
        while (currentCard < numCards ) {
            // Get data about the card element
            // - originalHTMLElement is from Mammoth output
            // - bbItem is the matching Blackboard Item from which the
            //   card information will be extracted
            var cardObject = new Object();
            cardObject.originalHTMLElement = cardElements[currentCard];
            // Find the Bb Item matching this cardElement
            cardObject.bbItem = getCardBbItem( cardObject.originalHTMLElement);
            // Add this card to the current bunch and start to move onto the 
            // next card
            currentBunch.push( cardObject );
            currentCard+=1;
            
            // If the next HTML element for the card that was just added to 
            // the bunch is NOT another card.  Then the bunch has ended
            // get out of the loop and start again
            if ( ! jQuery(cardElements[currentCard-1].next()).is("div.bbCard")) {
          //      console.log("  ---- bunch ends");
                break;
            }
        }
        //console.log( "New bunch added - currentCard " + currentCard);
        // save the current bunch
        listOfCardBunches.push( currentBunch );
    }
    
    //--------------- replace the cardBunch elements with card HTML
    // - Can add a card if cardObject.bbItem != undefined
    // - If undefined, that indicates that couldn't find a matching
    //   bbItem, should display something appropriately
    
    // In essence, this will be a mini card interface
    
    listOfCardBunches.forEach( createBunchesCards );
}

/*-----------------------------------------------------
 * createBunchesCards
 * - iterating through a list of bunches, give a list of
     cardObjects with elements
     - originalHTMLElement - where the card interface will go
       Actually if replaces each of the elements
     - bbItem - the Blackboard item with card information
 */
 
function createBunchesCards( bunch, index, arr) {
    
    var bbItems = [];
    
    
    // create an array of bBitems for this bunch
    for ( i=0; i<bunch.length; i++ ) {
        // hide the HTML element
        jQuery(bunch[i].originalHTMLElement).hide();   
        // hide those bbItems from display
        // bbItem points to the h3 title for the item. Hide li element
        // that is bbItem's grandparent
        if (location.href.indexOf(tweak_bb_active_url_pattern) > 0 ) { 
            jQuery(bunch[i].bbItem).parent().parent().hide();
        }
        
        // add the bbItem
        bbItems.push( bunch[i].bbItem );
    }
    /*console.log("bbitems");
    console.log(bbItems);*/
        
    // extract the card information from the array of bbitems
    // Will have to handle the undefined items
    
    //console.log("Starting extract cards");
    var cards = extractCardsFromContent( bbItems);
    
    /*console.log( cards );
    console.log("done extract cards");*/
    
    // add the cards to the originalHTMLElement
    // Will have to handle the undefine items
    
    // location to insert the cards, just before the first element in 
    // this bunch (all the elements should be hidden)
    place = jQuery(bunch[0].originalHTMLElement).before();
    addCardInterface( cards,place);
    
    /** ------ cards should be created by now -- */
	/* But make all the links in carddescription stop propagation */
    var cardContent = jQuery(".carddescription [href]").not(".gu-engage");

    for (var i=0; i<cardContent.length; i++) {
        cardContent[i].addEventListener('click', function(e) {
            // aim here is to allow internal links to override the 
            // cardmainlink
            e.stopPropagation();
        }, false);
    }
    
	/* Make all of the cards clickable by adding an event handler  */
	// Does this unwrap actually do anything???
	//jQuery( ".cardmainlink[href='undefined'" ).contents().unwrap();
	//return true;
	var cards = document.querySelectorAll(".clickablecard");
	//var cards = document.querySelectorAll(".cardmainlink");
    for (i=0; i<cards.length; i++) {
    cards[i].addEventListener('click', function() {
            var link = this.querySelector(".cardmainlink");
            
            if ( link!==null ) {
                // prevent clicking on a undefined blackboard link
                if ( link.match(/blackboard\/content\/undefined$/)) {
                    console.log("Undefined");
                } else {
                    link.click();
                }
            }
        }, false);
    }
    
    
}

/*--------------------------------------------------------
 * getCardBbItem( element )
 * - given a HTML element that contains card Details return a pointer to the BbItem that should be on this web page with a title matching
 * - return undefined if no matching BbItem
 */
 
function getCardBbItem( element ) {
    
    var title = jQuery(element).text().trim();
    //console.log( "--- element text is " + title );
    
    /* Find the matching Blackboard element heading (h3) */
    var bbItem = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find("h3:textEquals(" + title +")");
    
    if ( bbItem.length===0) {
        //console.log("  -- Didn't find match");
        return undefined
    } 
    
    /*console.log("Get Card Bb Item found");
    console.log(bbItem);*/
    
    return bbItem;
    
    
}

/***************************************************
 * handleBlackboardItem( heading )
 * Given a single heading element as this
 * - find the matching Blackboard element
 * - find the content up until the next heading
 * - find any span.blackboardLink in the HTML and update the link
 * - if the item is hidden don't show the link and attempt to update
 *   the text to show (not currently available)
 * 
 * Review status
 * - check to see if review status has been turned on for the item
 * - if it has, then
 *   - update accordion header with review status
 *   - update accordion content with button to change review status
 */
 
function handleBlackboardItem() {
    
    var hidden_string = " (not currently available)";
    
    // get the title from the Blackboard Item Heading (2)
    title = jQuery(this).text()
    
    // define pseudo function to do comparison to get exact match, but
    // case insensitive
    
    
    /* Find the matching Blackboard element heading (h3) */
    var bbItem = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find("h3:textEquals(" + title +")");
    
    //console.log(" -- Looked for **" + title + "** and found " + bbItem.length);
    //console.log(bbItem);
    
    if ( bbItem.length===0) {
        // add the hidden_string to the heading
        linkText = jQuery(this).text();
        jQuery(this).text( linkText + hidden_string);
        
        // add the hidden_string to the link
        jQuery(this).nextUntil(this.tagName).find(".blackboardLink").each( function() {
                    linkText = jQuery(this).text();
                    jQuery(this).text( linkText + hidden_string);
            });
    } else if ( bbItem.length > 1 ) {
        console.log("Error found more than 1 (" + bbItem.length + ") entries matching " + title);
    } else if ( bbItem.length===1 ) {
        
        //**** Handle review status
        /*console.log("Handle review status");
        console.log(bbItem);*/
        reviewLink = getReviewStatusContent(bbItem);
        //console.log("title " + title + " review link is " + reviewLink);
        if ( typeof reviewLink !== "undefined" ) {
            //-- update the title
            addReviewLink( this, reviewLink);
            
            //-- add the button to the content
            // - need to find content body
            
        }
        
        
        //**** Handle the insertion of the item link where appropriate
        // get the link
        var link = jQuery(bbItem).children("a").attr('href');
        
        // if there's no link, then check to see if it's TurnitIn
        // (which puts the link in the body)
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
        
        // check to see if the item is actually hidden
        hidden = jQuery(bbItem).parent().next().find('.contextItemDetailsHeaders').filter(":contains('Item is hidden from students.')");
        loc = location.href.indexOf("listContent.jsp");
        if ( hidden.length===1 ) {
            // add the hidden_string to the heading
            linkText = jQuery(this).text();
            jQuery(this).text( linkText + hidden_string);
            // add the hidden_string to the end of each .blackboardlink     
            jQuery(this).nextUntil(this.tagName).find(".blackboardLink").each( function() {
                    linkText = jQuery(this).text();
                    jQuery(this).text( linkText + hidden_string);
            });
            return true;
        }
        
        // Hide the bbitem li
        if (location.href.indexOf("listContent.jsp") > 0) {
            jQuery(bbItem).parent().parent().hide();
        }
        // wrap any span class="blackboardLink" with a link
        var string = '<a href="' + link + '"></a>';
        // Try to replace just the Blackboard links for the current heading
        jQuery(this).nextUntil(this.tagName).find(".blackboardLink").each( function() {
            jQuery(this).wrapAll(string);
        });
        
    }
    
}

//----------------------------------------------------------------
// addReviewLink
// - given the jQuery element for the heading of an accordion (item).
// - and the reviewLink taken from a matching Blackboard item
// - Modify the title of the accordion item
// - Modify the content

function addReviewLink( item, reviewLink) {
    
    linkText = jQuery(item).text();
    
    // Add text to the heading
 	var MARK_REVIEWED = "Mark Reviewed"
 	var REVIEWED = "Reviewed";
 	
 	var reviewHeadingTemplate = ''
 	if ( reviewLink.match(/markUnreviewed/)) {
 	    
 	    reviewHeadingTemplate = `
 	<span style="float:right" class="ui-state-disabled ui-corner-all">Reviewed</span>
 	`;
 	} else {
 	    reviewHeadingTemplate = `
 	    <span style="float:right" class="ui-state-active ui-corner-all">Not Reviewed</span>
 	    `;
 	}
 	jQuery(item).html( linkText + reviewHeadingTemplate);
 	
 	// change the body
 	content = jQuery(item).next();
 	
 	reviewBodyTemplate = '';
 	
 	if ( reviewLink.match(/markUnreviewed/)) {
 	    reviewBodyTemplate = `
 	    <!--<div class="p-4 absolute pin-l" style="float:right">-->
<div class="p-4" style="float:right">
    <a class="gu-bb-review" href="{LINK}"><button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
                    <span class="font-bold rounded-full px-2 py-1 bg-green text-white">&#10003; {TEXT}</span>&nbsp;</button></a>
</div>
`;
        reviewBodyTemplate = reviewBodyTemplate.replace('{TEXT}',REVIEWED)
 	} else {
  
 	    reviewBodyTemplate = `
<div class="p-4" style="float:right">
     <a class="gu-bb-review" href="{LINK}"><button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
     <span class="font-bold rounded-full px-2 py-1 bg-yellow text-black">&#x26a0;</span>&nbsp; {TEXT}</button></a>
</div>
        `;      
        reviewBodyTemplate = reviewBodyTemplate.replace('{TEXT}',MARK_REVIEWED)
 	}
 	reviewBodyTemplate = reviewBodyTemplate.replace('{LINK}', reviewLink);
 	jQuery(content).append( reviewBodyTemplate);
    
}
//-----------------------------------------------------------------
// getReviewStatusContent
// - given the h3 item (header) from Bb Item, check to see if the
//   parent div contains a review status element (anchor with class
//   button-5)
// - if not return NULL
// - if there is one return the link (which indicates with it's
//   mark reviewed, or reviewed)

function getReviewStatusContent( header ) {
    // get the details div for this header that should contain the
    // mark reviewed link
    var details = jQuery(header).parent().parent().find("div.details");
    //console.log(details);
    
    // check to see if it has the anchor with class button-5
    review = jQuery(details).find("a.button-5");
    
    if ( review.length === 0) {
        return undefined
    } else {
        return jQuery(review).attr("href");
    }
}


/***************************************************
 * handleBlackboardContentLink( element )
 * Given a <span class="blackboardContentLink"> item
 * - find parent link and extract the href
 * - find the content item link on this page that matches the href
 * - if found - replace the href with the contentItem link
 * - if not found remove the link and maybe do a javascript popup
 */
 
function handleBlackboardContentLink() {
    var hidden_string = " (not currently available)";
    var inner = false; // indicates whether the link is insider or outer
   // return false;
    // get the title from the Blackboard Item Heading (2)
    // This should be getting the parent of the spane, which is a link
    // Not heading 2.
    title = jQuery(this).parent().attr('href');
    
    if ( typeof title === 'undefined') {
        title = jQuery(this).find("a").first().attr('href');
        inner = true;
    }
    
    if ( typeof title !== 'undefined'){
        title = title.replace(/%20/g," ");
    }
    
    // define pseudo function to do comparison to get exact match, but
    // case insensitive
    jQuery.expr[':'].textEquals = jQuery.expr[':'].textEquals || jQuery.expr.createPseudo(function(arg) {
            return function( elem ) {
                return elem.textContent.trim().localeCompare( arg, undefined, {
                    sensitivity: 'base'
                }) === 0;
            };
        });
        
    /* Find the matching Blackboard element heading (h3) */
    var bbItem = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find("h3:textEquals(" + title +")");
    
    /*console.log("Looking for content link title " + title + " found " + bbItem.length);
    console.log(jQuery(this).html());
    console.log(bbItem);*/
    
    if ( bbItem.length===0) {
        // not found, so add hidden_string
        spanText = jQuery(this).text();
        jQuery(this).text( spanText + hidden_string);
    } else if ( bbItem.length > 1 ) {
        console.log("Error found more than 1 (" + bbItem.length + ") entries matching " + title);
    } else if ( bbItem.length===1 ) {
        // get the link
        var link = jQuery(bbItem).children("a").attr('href');
        
        
        // if there's no link, then check to see if it's TurnitIn
        // (which puts the link in the body)
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
        
        // check to see if the item is actually hidden
        hidden = jQuery(bbItem).parent().next().find('.contextItemDetailsHeaders').filter(":contains('Item is hidden from students.')");
        loc = location.href.indexOf("listContent.jsp");
        if ( hidden.length===1 ) {
            // add the hidden_string to the heading
            linkText = jQuery(this).text();
            jQuery(this).text( linkText + hidden_string);
            // add the hidden_string to the end of each .blackboardlink     
            return true;
        } else if (location.href.indexOf("listContent.jsp") > 0) {
            jQuery(bbItem).parent().parent().hide();
        }
        
        if ( ! inner ) {
            jQuery(this).parent().attr('href', link);
            // Kludge - occasionally Blackboard adds an onclick
            // handler for links
            jQuery(this).parent().attr('onclick', '');
        } else {
            jQuery(this).find("a").first().attr('href', link);
            // Kludge - occasionally Blackboard adds an onclick
            // handler for links
            jQuery(this).find("a").first().attr('onclick', '');
            
        }
    }
}

/***************************************************
 * handleBlackboardMenuLink( element )
 * Given a <span class="blackboardMenuLink"> item
 * - find parent link and extract the href
 * - find the menu item link on this page that matches the href
 * - if found - replace the href with the contentItem link
 * - if not found remove the link and maybe do a javascript popup
 */
 
function handleBlackboardMenuLink() {
    var hidden_string = " (not currently available)";
    
    // get the title from the Blackboard Item Heading (2)
    title = jQuery(this).parent().attr('href');
    if ( typeof title !== 'undefined'){
        title = title.replace(/%20/g," ");
    }
    
    //console.log("MenuLink: looking for " + title);
    //console.log(jQuery(this).html());
    
    /* Find the course menu link that matches */
    var bbItem = jQuery( "#courseMenuPalette_contents > li > a > span[title='"+title+"']" );
    
   // console.log("Looking for title " + title + " found " + bbItem.length);
    //var items = jQuery("#courseMenuPalette_contents > li > a");//.attr('title');
    //console.log(items);
    
    if ( bbItem.length===0) {
        // not found, so add hidden_string
        spanText = jQuery(this).text();
        jQuery(this).text( spanText + hidden_string);
    } else if ( bbItem.length > 1 ) {
        console.log("Error found more than 1 (" + bbItem.length + ") entries matching " + title);
    } else if ( bbItem.length===1 ) {
        // get the link
        var link = jQuery(bbItem).parent().attr('href');
        
        // if there's no link, then check to see if it's TurnitIn
        // (which puts the link in the body)
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
        
        // check to see if the course menu item is actually hidden
        hidden = jQuery(bbItem).next().attr("class" );
        
        if ( hidden==="cmLink-hidden" ) {
            // add the hidden_string to the heading
            linkText = jQuery(this).text();
            jQuery(this).text( linkText + hidden_string);
            // add the hidden_string to the end of each .blackboardlink     
            return true;
        }
        
        jQuery(this).parent().attr('href', link);
        // Hide the bbitem li
        /*if (location.href.indexOf("listContent.jsp") > 0) {
            jQuery(bbItem).parent().parent().hide();
        }*/
        // wrap any span class="blackboardLink" with a link
        //var string = '<a href="' + link + '"></a>';
        // Try to replace just the Blackboard links for the current heading
        /*jQuery(this).nextUntil(this.tagName).find(".blackboardLink").each( function() {
            jQuery(this).wrapAll(string);
        });*/
        
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
    //console.log(" Started videos");
    
    var videos = jQuery("div.video");
    //console.log(" Got " + videos.length + " videos");
    
    if ( videos.length===0) {
        return false;
    }
    
    videos.each( function(idx){
        var text = jQuery(this).text();
      //  console.log(idx + " -- " + text);
        
        var matches = text.match( /x/ );
        var id = matches[1],width='640',height='480';
        
        //console.log('Match 0 ' + matches[0] + " 1 " + matches[1]);
        text = '<div class="youtube-article">' +
                  '<iframe class="dt-youtube" width="' + width +
                  '" height="'+height+'" src="https://www.youtube.com/embed/'+
                  id+'" frameborder="0" allowfullscreen></iframe></div>';
        
        //console.log( "Ending with " + text);
        jQuery(this).html(text);
    });
    
    
} 


//*** Experiements to see if I can open all by function call **

function openAll() {
        //console.log("Open ALL ");
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
        jQuery('.gu_content_close').removeAttr("disabled");
}


/************************************************************
 * extractCardsFromContent( myCards)
 * - given a list of bbItems, extract the content and return
 *   an array of objects containing card information
 * ***** THIS IS A COPY of function from cards.js
 * 
 * It requires other functions
 * - getReviewStatus (copied in)
 * - handleDate (copied in)
 * - identifyCardBackgroundCOlour
 * - identifyPicUrl
 * - getTermDate
 * 
 * Changes made
 * - move from jQUery each to for loop
 * - create a jthis variable to replace this
 * - add in check for element being undefined
 * - change how the right html element (jthis) is calculated
 */
 
function extractCardsFromContent( myCards) {
    
    var items = [];
    var picUrl,cardBGcolour;
    
    //console.log("Starting to extract from " + myCards.length);
    // Loop through each card and construct the items array with card data
	//myCards.each( function(idx){
	for ( i=0; i<myCards.length; i++) {
	    
	    if ( typeof myCards[i] === "undefined") {
	        items.push( undefined );
	        continue;
	    }
	    //jthis = myCards[i];
	    jthis = jQuery(myCards[i]).parent().next().find('.vtbegenerated');
	    /*console.log("Card " + i);
	    console.log(jthis);
	    console.log(" THIS HTML IS *****************");
	    console.log(jQuery(jthis).html());*/
	    //** MODIFICATION NOT in ORIGINAL
	    
	    
	    // jQuery(this) - is the vtbgenerated div for a BbItem
	    
	    //------- check for any review status element
	    review = getReviewStatus( jthis );
	    
        // Parse the description and remove the Card Image data	    
	    var description = jQuery(jthis).html(),picUrl;
	    
	    //console.log(description)
	    
		// - get rid of any &nbsp; inserted by Bb
		if ( typeof description === "undefined") {
		    console.log("NO DESCRIPTION");
		    return;
		}
	    description = description.replace(/&nbsp;/gi, ' ');
	    
	    var re = new RegExp("card image\s*:\s*([^<]*)", "i");
	    //m = description.match(/[Cc]ard [Ii]mage\s*: *([^\s<]*)/ );
	    m = description.match( re );
	    if (m) {
	        // TODO need to parse the m[1] to see if it's a URL
	        // OR a colour to be set
	        
	        // Return a three element list of rgb colours
	        // if the Card Image: value is a valid colour
	        // Otherwise undefined
	        
	        cardBGcolour = identifyCardBackgroundColour( m[1]);
	        picUrl = identifyPicUrl( m[1]);
	        
    	    //picUrl=m[1];
    	    description = description.replace( "<p>"+m[0]+"</p>","");
	        description = description.replace( m[0], "");
	    }
	    // Find any ItemDetailsHeaders that indicate the item is hidden
	    hidden = jQuery(jthis).parent().find('.contextItemDetailsHeaders').filter(":contains('Item is hidden from students.')");
	    //.siblings('contextItemDetailsHeaders')
	
	    // Check to see if an image with title "Card Image" has been inserted
	    var inlineImage = jQuery(jthis).find('img').attr('title', 'Card Image');
	    if (inlineImage.length) {
	        picUrl=inlineImage[0].src;
	        //console.log("item html" + inlineImage[0].outerHTML);
	        description = description.replace(inlineImage[0].outerHTML,"");
	        // Bb also adds stuff when images inserted, remove it from 
	        // description to be placed into card
	        var bb = jQuery.parseHTML(description);
	        // This will find the class
	        stringToRemove = jQuery(description).find('.contextMenuContainer').parent().clone().html();
	        description = description.replace( stringToRemove, '');
	    }
	    
	    //---------------- card Image Size
	    // Looking for contain
	    m = description.match(/card image size *: contain/i);
	    var bgSize = "";
	    if (m) {
	        bgSize = "contain";
	        description = description.replace( "<p>"+m[0]+"</p>","");
	        description = description.replace( m[0], "");
	    }
	    
	    // Parse the date for commencing
	    // date will be in object with start and end members
	    var date = handleDate( description );
	    // kludge to modify the local description based on changes
	    // done in handleDate
	    description = date.descrip;
	    
	    // See if there's a different label for date
	    m = description.match(/card date label *: ([^<]*)/i);
	    var dateLabel='Commencing';
	    if (m) {
	        dateLabel=m[1];
	        description = description.replace( "<p>"+m[0]+"</p>","");
	        description = description.replace( m[0], "");
	    }
	    
	    // See if the Course Label should be changed
	    var label="Module";
	    
	    m = description.match(/card label *: *([^<]*)/i );
	    if (m) {
	        label=m[1];
	        description = description.replace( "<p>"+m[0]+"</p>","");
	        description = description.replace( m[0], "");
	    }
	    // get active image
	    var activePicUrl = '';
	    var regex = new RegExp("card image active\s*:\s*([^<]*)", "i");
	    m = description.match( regex );
	    if (m) {
	        activePicUrl=m[1];
	        description = description.replace( "<p>"+m[0]+"</p>","");
	        description = description.replace( m[0], "");
	    }
	    // Get course number
	    var number='x';
	    m = description.match(/card number *: *([^<]*)/i );
	    if (m) {
	        number=m[1];
	        description = description.replace( "<p>"+m[0]+"</p>","");
	        description = description.replace( m[0], "");
	        if (number.match(/none/i)) {
	            number='&nbsp;'
	        }
	    }
	    // Get Image IFrame
	    var iframe='';
	    m = description.match(/card image iframe *: *(<iframe.*<\/iframe>)/i );
	    if (m) {
	        iframe=m[1];
	        // replace the width and height
	        x = iframe.match(/width="[^"]+"/i);
	        if (x) {
	            iframe = iframe.replace(x[0], 'width="100%"');
	        }
	        x = iframe.match(/height="[^"]+"/i);
	        if (x){
	            iframe=iframe.replace(x[0], 'height="auto"');
	        }
	        description = description.replace( "<p>"+m[0]+"</p>","");
	        description = description.replace( m[0], "");
	    }
	    
	    // Get assessment related information
	    var assessmentType="",assessmentWeighting="",assessmentOutcomes="";
	    
	    m = description.match(/assessment type *: *([^<]*)/i );
	    if (m) {
	        assessmentType=m[1];
	        description = description.replace( "<p>"+m[0]+"</p>","");
	        description = description.replace( m[0], "");
	    }
	    m = description.match(/assessment weighting *: *([^<]*)/i );
	    if (m) {
	        assessmentWeighting=m[1];
	        description = description.replace( "<p>"+m[0]+"</p>","");
	        description = description.replace( m[0], "");
	    }
	    m = description.match(/assessment outcomes *: *([^<]*)/i );
	    if (m) {
	        assessmentOutcomes=m[1];
	        description = description.replace( "<p>"+m[0]+"</p>","");
	        description = description.replace( m[0], "");
	    }
	    
	    
	    // need to get back to the header which is up one div, a sibling, then span
	    /*console.log(jthis);
	    console.log(jQuery(jthis).html());
	    console.log(jQuery(jthis).parent().html());*/
	    // Modify xpath to find header
	    //var header = jQuery(jthis).parent().find("span")[2];
	    var header = jQuery(jthis).parent().siblings(".item").find("span")[2];
	    /*console.log("--------------- header start");
	    console.log(header);
	    console.log(jQuery(header).text());
	    console.log("----------- header end");*/
	    var title = jQuery(header).html(),link,linkTarget='';
	    
	    //--------------------------------
	    // Three options for link
	    // 1. A link on the header (e.g. content folder)
	    // 2. No link (e.g. a content item)
	    // 3. A link in the attached filed (content item with attached file)
	    //    This one is kludgy. e.g. doesn't handle multiple files. 
	    //    Currently sets the link to the last file
	    //    TODO figure out what do with multiple files
	    link = jQuery(header).parents('a').attr('href');
	    linkTarget = jQuery(header).parents("a").attr("target");
	    
	    // if link is empty, must be content item
	    if ( link === undefined ) {
	        // check to see if there are attached files
	        filesThere = jQuery(jthis).parent().find('.contextItemDetailsHeaders').filter(":contains('Attached Files:')");
	        
	        if ( filesThere !== undefined) {
	            // get a list of all attached files
	            lis = jQuery(jthis).parent().find('.contextItemDetailsHeaders').children('.detailsValue').children("ul").children("li"); 
	            
	            // loop through the files and get the link
	            lis.each( function(idx, li){
	                // get the link
	                link = jQuery(li).children("a").attr("href");
	            });
	        }
	        //.siblings('contextItemDetailsHeaders')
	    }
	    
	    
	    // get the itemId to allow for "edit" link in card
	    var itemId = jQuery(this).parents('.liItem').attr('id');
	    //console.log("Item id " + itemId + " for link " + link );
	    // Hide the contentItem  TODO Only do this if display page
	    
	    if (location.href.indexOf(tweak_bb_active_url_pattern) > 0 ) { 
	        // TODO un comment this Reviewed
	        jQuery(this).parent().parent().hide();
	        //console.log( "content item " + contentItem.html());
	    }
	    // save the item for later
	    var item = {title:title, picUrl:picUrl, bgSize: bgSize,
	        cardBGcolour:cardBGcolour,
	        description:description, date:date, label:label,
	        link:link, linkTarget:linkTarget,
	        review:review,
	        dateLabel:dateLabel,id:itemId,activePicUrl:activePicUrl,
	        assessmentWeighting:assessmentWeighting,
	        assessmentOutcomes:assessmentOutcomes,
	        assessmentType:assessmentType
	    };
	    if (number!=='x' ) {
	        item.moduleNum=number;
	    }
	    if (iframe!=='') {
	        item.iframe=iframe;
	    }
	    
	    // only add the card to display if
	    // - VIEW MODE is on and it's not hidden
	    // - EDIT MODE is on 
	    if ( hidden.length===0 || LOCATION < 0) {
	        // add message that item is hidden to students when EDIT mode on
	        if ( hidden.length===1) {
	            item.description = item.description.concat( HIDDEN_FROM_STUDENTS);
	        }
	        items.push(item);
	    } 
	}
	
	//console.log(items);
	return items;
}

//-----------------------------------------------------------------
// getReviewStatus
// - given a vtbgenerated item from Bb Item, check to see if the
//   parent div contains a review status element (anchor with class
//   button-5)
// - if not return NULL
// - if there is one return the link (which indicates with it's
//   mark reviewed, or reviewed)

function getReviewStatus( vtbgen ) {
    // get parent    
    var parent = jQuery(vtbgen).parent();
    
    // check to see if it has the anchor with class button-5
    review = jQuery(parent).find("a.button-5");
    
    if ( review.length === 0) {
        return undefined
    } else {
        return jQuery(review).attr("href");
    }
}

//**************************************************
// handleDate( description )
// - given a description for an item find and parse Card Date
// - return an object that has two members
//   - start - start or only date {date:??,month:??}
//   - stop  - end date
// Options include
// - specify specific date by text
//          Card Date: Mar 5     
// - specify date by week of Griffith term (monday)
//          Card Date: Week 1
// - specify a date range
//          Card Date: Mar 5-Mar 10
//          Card Date: Week 3-5

function handleDate( description ) {
    var month,endMonth,date,endDate,week="",endWeek="";
    var empty1 = { date:"",week:""};
    var empty2 = { date:"",week:""};
	var date = { start: empty1, stop: empty2 } ; // object to return 
	// date by griffith week    
	
    m = description.match(/card date *: *week ([0-9]*)/i);
	if (m) {
	    // check to see if a range was specified
	    x = description.match(/card date *: *week ([0-9]*)-([0-9]*)/i);
	    if (x) {
	//        console.log('ZZZZZZZZZZZZZZZZZZZZZZ handling a range');
	        week = x[1];
	        endWeek = x[2];
	        date.stop = getTermDate( endWeek, false);
	        //console.log(date.stop);
	            
	        description = description.replace( "<p>"+x[0]+"</p>","");
            description = description.replace(x[0],"");
        } else {
      //      console.log('ZZZZ week date, but not a range');
            week = m[1];
	           
            description = description.replace( "<p>"+m[0]+"</p>","");
            description = description.replace(m[0],"");
        }
        
        date.start = getTermDate( week )
        //console.log( date);
	        
	         
	} else {
	    // TODO need to handle range here
	    m = description.match(/card date *: *([a-z]+) ([0-9]+)/i);
	    if (m) {
	        
	        x = description.match(/card date *: *([a-z]+) ([0-9]+)-+([a-z]+) ([0-9]+)/i);
	        if (x) {
	            
	            date.start = { month: x[1],date: x[2] }
	            date.stop = { month: x[3], date: x[4] }

	            description = description.replace( "<p>"+x[0]+"</p>","");
                description = description.replace(x[0],"");
            } else {
            
                date.start = { month:m[1],date:m[2]};
    	        description = description.replace( "<p>"+m[0]+"</p>","");
    	        description = description.replace(m[0],"");
	        } 
	    } else {
	        // Fall back to check for exam period
	        m = description.match(/card date *: *exam *(period)*/i );
	        if (m) {
	            //console.log("match exam period");
	            date.start = getTermDate( 'exam');
	            date.stop = getTermDate('exam', false);
	            description = description.replace( "<p>"+m[0]+"</p>","");
    	        description = description.replace(m[0],"");
	            //console.log('Exam date is ' );
	            //console.log(date.start);
	            //console.log(date.stop);
	        }
	    }
	}
	date.descrip = description;
	return date;
} 

//**************************************************************
// cardBGcolour = identifyCardBackgroundColour( value );
// return undefined if value is not a valid CSS colour
// Otherwise return rgb(X,Y,Z)

function identifyCardBackgroundColour( input ) {
    
    // don't both if it's an empty string or a URL
    url = input.match(/^\s*http/i);
    if ( input === "" || url ) {
        return undefined;
    }
    var div = document.createElement('div'), m;
    div.style.color = input;
    // add to DOMTree to work
    document.body.appendChild( div );
    
    // extract the rgb numbers
    m = getComputedStyle(div).color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if( m) {
        return "rgb("+m[1]+","+m[2]+","+m[3]+")";
    } 
    return undefined;
}


//**************************************************************
// picUrl = identifyPicUrl( value )
// TODO - return "" if value is not a valid URI
//   Otherwise return the value
	        
function identifyPicUrl( value ) {
    
    return value;
}

//*********************
// getTermDate( week )
// - given a week of Griffith semester return date for the 
//   start of that week

function getTermDate( week, startWeek=true ) {
    //console.log("TERM is " + TERM + " week is " + week);
    var date = { date: "", month: "", week: week };
    if (( week<0) || (week>15) ) {
        if (week!=='exam') {
            return date;
        }
    }
    var start;
    if ( startWeek===true ) {
        // setting start week
         if ( typeof TERM_DATES[TERM][week] !== 'undefined') {
            start = TERM_DATES[TERM][week].start;//[week].start;
         }
    } else {
        start = TERM_DATES[TERM][week].stop;
    }
	//console.log(" Starting date " + start);
	var d = new Date(start);
	date.month=MONTHS[d.getMonth()];
	date.date=d.getDate();
	
	return date;
}
	
	
var TERM_DATES = {
    // OUA 2020 Study Period 1
    "2201" :  {
         "0" : { "start" : "2020-02-24", "stop":"2020-03-01" } ,
         "1" : { "start" : "2020-03-02", "stop":"2020-03-08" } ,
         "2" : { "start" : "2020-03-09", "stop":"2020-03-15" } ,
         "3" : { "start" : "2020-03-16", "stop":"2020-03-22" } ,
         "4" : { "start" : "2020-03-23", "stop":"2020-03-29" } ,
         "5" : { "start" : "2020-03-30", "stop":"2020-04-05" } ,
         "6" : { "start" : "2020-04-06", "stop":"2020-04-12" } ,
         "7" : { "start" : "2020-04-13", "stop":"2020-04-19" } ,
         "8" : { "start" : "2020-04-20", "stop":"2020-04-26" } ,
         "9" : { "start" : "2020-04-27", "stop":"2020-05-03" } ,
         "10" : { "start" : "2020-05-04", "stop":"2020-05-10" } ,
         "11" : { "start" : "2020-05-11", "stop":"2020-05-17" } ,
         "12" : { "start" : "2020-05-18", "stop":"2020-05-24" } ,
         "13" : { "start" : "2020-05-25", "stop":"2020-05-31" },
         /* End of study period 4 */
         "exam" : { "start" : "2020-06-01", "stop":"2020-06-05" },
         // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2020 Study Period 2
    "2203" :  {
         "0" : { "start" : "2020-05-25", "stop":"2020-05-31" } ,
         "1" : { "start" : "2020-06-01", "stop":"2020-06-07" } ,
         "2" : { "start" : "2020-06-08", "stop":"2020-06-14" } ,
         "3" : { "start" : "2020-06-15", "stop":"2020-06-21" } ,
         "4" : { "start" : "2020-06-22", "stop":"2020-06-28" } ,
         "5" : { "start" : "2020-06-29", "stop":"2020-07-05" } ,
         "6" : { "start" : "2020-07-06", "stop":"2020-07-12" } ,
         "7" : { "start" : "2020-07-13", "stop":"2020-07-19" } ,
         "8" : { "start" : "2020-07-20", "stop":"2020-07-26" } ,
         "9" : { "start" : "2020-07-27", "stop":"2020-08-02" } ,
         "10" : { "start" : "2020-08-03", "stop":"2020-08-09" } ,
         "11" : { "start" : "2020-08-10", "stop":"2020-05-17" } ,
         "12" : { "start" : "2020-08-17", "stop":"2020-05-24" } ,
         "13" : { "start" : "2020-08-24", "stop":"2020-05-31" },
         "14" : { "start" : "2020-08-31", "stop":"2020-09-06" },
         /* End of study period 4 */
         "exam" : { "start" : "2020-08-31", "stop":"2020-09-04" },
         // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2020 Study Period 3
    "2205" :  {
         "0" : { "start" : "2020-08-31", "stop":"2020-09-06" } ,
         "1" : { "start" : "2020-09-07", "stop":"2020-09-13" } ,
         "2" : { "start" : "2020-09-14", "stop":"2020-09-20" } ,
         "3" : { "start" : "2020-09-21", "stop":"2020-09-27" } ,
         "4" : { "start" : "2020-09-28", "stop":"2020-10-04" } ,
         "5" : { "start" : "2020-10-05", "stop":"2020-10-11" } ,
         "6" : { "start" : "2020-10-12", "stop":"2020-10-19" } ,
         "7" : { "start" : "2020-10-19", "stop":"2020-10-25" } ,
         "8" : { "start" : "2020-10-26", "stop":"2020-11-01" } ,
         "9" : { "start" : "2020-11-02", "stop":"2020-11-08" } ,
         "10" : { "start" : "2020-11-09", "stop":"2020-11-15" } ,
         "11" : { "start" : "2020-11-16", "stop":"2020-11-22" } ,
         "12" : { "start" : "2020-11-23", "stop":"2020-11-29" } ,
         "13" : { "start" : "2020-11-30", "stop":"2020-12-06" },
         "14" : { "start" : "2020-12-07", "stop":"2020-12-13" },
         /* End of study period 4 */
         "exam" : { "start" : "2020-12-07", "stop":"2020-12-13" },
         // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2020 Study Period 4
    "2207" :  {
         "0" : { "start" : "2020-11-30", "stop":"2020-12-06" } ,
         "1" : { "start" : "2020-12-07", "stop":"2020-12-13" } ,
         "2" : { "start" : "2020-12-14", "stop":"2020-12-20" } ,
         "3" : { "start" : "2020-12-21", "stop":"2020-12-27" } ,
         "4" : { "start" : "2020-12-28", "stop":"2021-01-03" } ,
         "5" : { "start" : "2021-01-04", "stop":"2021-01-10" } ,
         "6" : { "start" : "2021-01-11", "stop":"2021-01-17" } ,
         "7" : { "start" : "2021-01-18", "stop":"2021-01-24" } ,
         "8" : { "start" : "2021-01-25", "stop":"2021-01-31" } ,
         "9" : { "start" : "2021-02-01", "stop":"2021-02-07" } ,
         "10" : { "start" : "2021-02-08", "stop":"2021-02-14" } ,
         "11" : { "start" : "2021-02-15", "stop":"2021-02-21" } ,
         "12" : { "start" : "2021-02-22", "stop":"2021-02-28" } ,
         "13" : { "start" : "2021-03-01", "stop":"2021-03-07" },
         "14" : { "start" : "2021-03-08", "stop":"2021-03-14" },
         /* End of study period 4 */
         "exam" : { "start" : "2021-03-08", "stop":"2021-03-14" },
         // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // Griffith 2020 Trimester 1
    "3201" : {
         "0" : { "start" : "2020-02-17", "stop":"2020-02-23" } ,
         "1" : { "start" : "2020-02-24", "stop":"2020-03-01" } ,
         "2" : { "start" : "2020-03-02", "stop":"2020-03-08" } ,
         "3" : { "start" : "2020-03-09", "stop":"2020-03-15" } ,
         "4" : { "start" : "2020-03-16", "stop":"2020-03-22" } ,
         "5" : { "start" : "2020-03-23", "stop":"2020-03-29" } ,
         "6" : { "start" : "2020-03-30", "stop":"2020-04-05" } ,
         "7" : { "start" : "2020-04-13", "stop":"2020-04-19" } ,
         "8" : { "start" : "2020-04-20", "stop":"2020-04-26" } ,
         "9" : { "start" : "2020-04-27", "stop":"2020-05-03" } ,
         "10" : { "start" : "2020-05-04", "stop":"2020-05-10" } ,
         "11" : { "start" : "2020-05-11", "stop":"2020-05-17" } ,
         "12" : { "start" : "2020-05-18", "stop":"2020-05-24" } ,
         "13" : { "start" : "2020-05-25", "stop":"2020-05-31" } ,
         "exam" : { "start": "2020-06-01", "stop": "2020-06-07" }
    },
    // Griffith 2020 Trimester 2
    "3205" : {
         "0" : { "start" : "2020-07-06", "stop":"2020-07-12" } ,
         "1" : { "start" : "2020-07-13", "stop":"2020-07-19" } ,
         "2" : { "start" : "2020-07-20", "stop":"2020-08-26" } ,
         "3" : { "start" : "2020-07-27", "stop":"2020-08-02" } ,
         "4" : { "start" : "2020-08-03", "stop":"2020-08-16" } ,
         "5" : { "start" : "2020-08-17", "stop":"2020-08-23" } ,
         "6" : { "start" : "2020-08-24", "stop":"2020-08-30" } ,
         "7" : { "start" : "2020-08-31", "stop":"2020-09-06" } ,
         "8" : { "start" : "2020-09-07", "stop":"2020-09-13" } ,
         "9" : { "start" : "2020-09-14", "stop":"2020-09-20" } ,
         "10" : { "start" : "2020-09-21", "stop":"2020-09-27" } ,
         "11" : { "start" : "2020-09-28", "stop":"2020-10-04" } ,
         "12" : { "start" : "2020-10-05", "stop":"2020-10-11" } ,
         "13" : { "start" : "2020-10-12", "stop":"2020-10-18" } ,
         "14" : { "start" : "2020-10-19", "stop":"2020-10-25" } ,
         "15" : { "start" : "2020-10-27", "stop":"2020-11-01" },
         "exam" : { "start": "2020-10-12", "stop": "2020-10-18" }
    },
    // Griffith 2019 Trimester 3
    "3198" : {
         "0" : { "start" : "2019-10-21", "stop":"2019-10-27" } ,
         "1" : { "start" : "2019-10-28", "stop":"2019-11-03" } ,
         "2" : { "start" : "2019-11-04", "stop":"2019-11-10" } ,
         "3" : { "start" : "2019-11-11", "stop":"2019-11-17" } ,
         "4" : { "start" : "2019-11-18", "stop":"2019-11-24" } ,
         "5" : { "start" : "2019-11-25", "stop":"2019-12-1" } ,
         "6" : { "start" : "2019-12-02", "stop":"2019-12-08" } ,
         "7" : { "start" : "2019-12-09", "stop":"2019-12-15" } ,
         "8" : { "start" : "2019-12-16", "stop":"2019-12-22" } ,
         "9" : { "start" : "2020-01-06", "stop":"2020-01-12" } ,
         "10" : { "start" : "2020-01-13", "stop":"2020-01-19" } ,
         "11" : { "start" : "2020-01-20", "stop":"2020-01-26" } ,
         "12" : { "start" : "2020-01-27", "stop":"2020-02-02" },
         "13" : { "start" : "2020-02-03", "stop":"2020-02-09" } ,
         "exam" : { "start": "2020-02-06", "stop": "2020-02-15" }
         // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA Study Period 4 2019
    "2197" : {
         "0" : { "start" : "2019-11-18", "stop":"2019-11-24" } ,
         "1" : { "start" : "2019-11-25", "stop":"2019-12-01" } ,
         "2" : { "start" : "2019-12-02", "stop":"2019-12-08" } ,
         "3" : { "start" : "2019-12-09", "stop":"2019-12-15" } ,
         "4" : { "start" : "2019-12-16", "stop":"2019-12-22" } ,
         "5" : { "start" : "2019-12-23", "stop":"2019-09-29" } ,
         "6" : { "start" : "2019-12-30", "stop":"2020-01-05" } ,
         "7" : { "start" : "2020-01-06", "stop":"2020-01-12" } ,
         "8" : { "start" : "2020-01-13", "stop":"2020-01-19" } ,
         "9" : { "start" : "2020-01-20", "stop":"2020-01-26" } ,
         "10" : { "start" : "2020-01-27", "stop":"2020-02-02" } ,
         "11" : { "start" : "2020-02-03", "stop":"2020-02-09" } ,
         "12" : { "start" : "2020-02-10", "stop":"2020-02-16" },
         "13" : { "start" : "2019-02-17", "stop":"2020-02-23" } ,
         /* End of study period 4 */
         "14" : { "start" : "2020-02-24", "stop":"2020-03-01" },
         "15" : { "start" : "2020-03-02", "stop":"2020-03-08" },
         // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA Study Period 3 2019
    "2195" : {
         "0" : { "start" : "2019-08-19", "stop":"2019-09-25" } ,
         "1" : { "start" : "2019-08-26", "stop":"2019-09-01" } ,
         "2" : { "start" : "2019-09-02", "stop":"2019-09-18" } ,
         "3" : { "start" : "2019-09-09", "stop":"2019-09-15" } ,
         "4" : { "start" : "2019-09-16", "stop":"2019-09-22" } ,
         "5" : { "start" : "2019-09-23", "stop":"2019-09-29" } ,
         "6" : { "start" : "2019-09-30", "stop":"2019-10-06" } ,
         "7" : { "start" : "2019-10-07", "stop":"2019-10-13" } ,
         "8" : { "start" : "2019-10-14", "stop":"2019-08-20" } ,
         "9" : { "start" : "2019-10-21", "stop":"2019-10-27" } ,
         "10" : { "start" : "2019-10-28", "stop":"2019-11-03" } ,
         "11" : { "start" : "2019-11-04", "stop":"2019-11-10" } ,
         "12" : { "start" : "2019-11-11", "stop":"2019-11-17" },
         "13" : { "start" : "2019-11-18", "stop":"2019-11-24" } ,
         /* End of study period 3 */
         "14" : { "start" : "2019-11-25", "stop":"2019-12-01" },
         "15" : { "start" : "2019-10-07", "stop":"2019-10-13" },
         // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // Griffith 2019 Trimester 2
    "3195" : {
         "0" : { "start" : "2019-07-01", "stop":"2019-07-07" } ,
         "1" : { "start" : "2019-07-08", "stop":"2019-07-14" } ,
         "2" : { "start" : "2019-07-15", "stop":"2019-07-21" } ,
         "3" : { "start" : "2019-07-22", "stop":"2019-07-28" } ,
         "4" : { "start" : "2019-07-29", "stop":"2019-08-04" } ,
         "5" : { "start" : "2019-08-05", "stop":"2019-08-11" } ,
         "6" : { "start" : "2019-08-19", "stop":"2019-08-25" } ,
         "7" : { "start" : "2019-08-26", "stop":"2019-09-01" } ,
         "8" : { "start" : "2019-09-02", "stop":"2019-09-08" } ,
         "9" : { "start" : "2019-09-09", "stop":"2019-09-15" } ,
         "10" : { "start" : "2019-09-16", "stop":"2019-09-22" },
         "11" : { "start" : "2019-09-23", "stop":"2019-09-29" } ,
         "12" : { "start" : "2019-09-30", "stop":"2019-10-06" },
         "13" : { "start" : "2019-10-07", "stop":"2019-10-13" },
         "14" : { "start" : "2019-10-14", "stop":"2019-10-20" },
         "15" : { "start" : "2019-10-21", "stop":"2019-10-27" },
         "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    "3191" : {
         "0" : { "start" : "2019-02-18", "stop":"2019-02-24" },
         "1" : { "start" : "2019-02-25", "stop":"2019-03-03" } ,
         "2" : { "start" : "2019-03-04", "stop":"2019-03-10" } ,
         "3" : { "start" : "2019-03-11", "stop":"2019-03-17" } ,
         "4" : { "start" : "2019-03-18", "stop":"2019-03-24" } ,
         "5" : { "start" : "2019-03-25", "stop":"2019-03-31" } ,
         "6" : { "start" : "2019-04-01", "stop":"2019-04-07" } ,
         "7" : { "start" : "2019-04-08", "stop":"2019-04-14" } ,
         "8" : { "start" : "2019-04-22", "stop":"2019-04-28" } ,
         "9" : { "start" : "2019-04-29", "stop":"2019-05-05" } ,
         "10" : { "start" : "2019-05-06", "stop":"2019-05-12" },
         "11" : { "start" : "2019-05-13", "stop":"2019-05-19" } ,
         "12" : { "start" : "2019-05-20", "stop":"2019-05-26" },
         "13" : { "start" : "2019-05-27", "stop":"2019-06-02" },
         "14" : { "start" : "2019-06-03", "stop":"2019-06-09" },
         "15" : { "start" : "2019-06-10", "stop":"2019-06-17" },
         "exam": { "start" : "2019-05-30", "stop": "2019-06-08" }
         }
    
    };
var TERM="3191",YEAR=2019, SET_DATE="";
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	
	
	
/****
 * addCardInterface( items )
 * - Given an array of items to translate into cards add the HTML etc
 *   to generate the card interface
 * - Add the card interface to any item that has a title including
 *     "Card Interface:" with an optional title
 * 
 * ----- COPIED from cards.js and then
 * - add parameter location that tells it where the cards go
 * - 
 * 
 */
 
 function addCardInterface( items, place ) {
   
   /*console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
   console.log("ITEMS");
   console.log(items);
   console.log("PLACE");
   console.log(place);*/
   
   if ( typeof items === "undefined") {
       console.log("MAJOR ERROR - no items");
       return;
   }
    // Define which template to use 
    // REVERSE what works in card. DEFAULT is no engage
    var template = HORIZONTAL_NOENGAGE;
 	var engageVerb = 'Engage';
 	
 	// Define the text for Review Status
 	var MARK_REVIEWED = "Mark Reviewed"
 	var REVIEWED = "Reviewed";
 	
 	// get the content item with h3 heading containing Card Interface
 	var cardInterface = place;//jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find(".item h3").filter(':contains("Card Interface")').eq(0);
 	// Support the idea of having a Bb item on the page that is the normal
 	// Card Interface item. It's used to pass 
 	var paramsCardInterface = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find(".item h3").filter(':contains("Card Interface")').eq(0);
 	if (location.href.indexOf("listContent.jsp") > 0) {
         jQuery(paramsCardInterface).parents("li").hide(); 
 	}
 	//console.log( paramsCarddCard Interface");
 	//console.log( cardInterface);
 	
 	WIDTH="md:w-1/3";
 	HIDE_IMAGES=false;
 	template = HORIZONTAL;
 	
 	//if ( cardInterface.length === 0){
 	if ( paramsCardInterface.length===0) {
       // console.log("Card: Can't find item with heading 'Card Interface' in //which to insert card interface");
        
        //return false;
    } else {
        // get the title - text only, stripped of whitespace before/after
        // **** CHECK PARAMETERS
        // - replace this with something passed in from CI
        //var cardInterfaceTitle= jQuery.trim(cardInterface.text());
        var cardInterfaceTitle= jQuery.trim(paramsCardInterface.text());
        
        //Extract parameters
        var m = cardInterfaceTitle.match(/Card Interface *([^<]*)/i );
        
	    if (m) {
	        newParams = parse_parameters( m[1]);
	        
	        if ( newParams ) {
	            newParams.forEach( function(element) {
	                m = element.match(/template=["']vertical['"]/i );
	                m1 = element.match(/template=vertical/i );
	                if (m || m1) {
	                    template = VERTICAL;
	                } else if (element.match(/template=['"]horizontal['"]/i )) {
	                    template = HORIZONTAL;
	                } else if ( element.match(/noimages/)) {
	                    HIDE_IMAGES = true;
	                } else if ( x = element.match(/template=by([2-6])/i ) ) {
	                    WIDTH = "md:w-1/" + x[1];
	                } else if (x = element.match(/by([2-6])/i ) ) {
	                    WIDTH = "md:w-1/" + x[1];
	                } else if ( x = element.match(/[Bb][yY]1/ )) {     
	                    WIDTH = "md:w-full";
	                } else if ( element.match(/people/i)) {
	                    template = PEOPLE;
	                /*} else if (element.match(/engage/i )) {
	                    template = HORIZONTAL;*/
	                } else if ( element.match(/logging/i)) {
	                    LOGGING = true;
	                /*} else if ( m = element.match(/engage=([^']*)/)) {
	                    engageVerb = m[1];*/
	                } else if (m=element.match(/template=assessment/i)){
	                    template = ASSESSMENT;
	                } else if ( m=element.match(/set[Dd]ate=([^\s]*)/ )){
	                    SET_DATE = m[1];
	                } else if ( m=element.match(/^reviewed=([^']*)/ui)) {
	                    REVIEWED = m[1];
	                } else if ( m=element.match(/^markReviewed=(.+)/i)) {
	                    MARK_REVIEWED = m[1];
	                }
	            });
	        }
	    } // if no match, stay with default
    }
  //  console.log("LOGGING IS " + LOGGING);
    // make the h3 for the Card Interface item disappear
    // (Can't hide the parent as then you can't edit via Bb)
    // Need to have the span in order to be able to reorder
    
    cardInterface.html('<span class="reorder editmode"></span>');
 	// Get the content area in which to insert the HTML
 	//var firstItem = jQuery(cardInterface).prev();// CHANGED.parent().siblings(".details");
    
 	// Use the card HTML template and the data in items to generate
 	// HTML for each card
    var cards = "" ;
    var moduleNum = 1;
    
    items.forEach( function(idx) {
      //  console.log("------------------ NEW CARD ---- " );
        //************* added
        if ( typeof idx === "undefined") {
        //    console.log("undefined");
            //console.log("PPPPPPPPPPPPPPPPPPPPPPP ROBLEM");
            var text = NO_CARD_DEFINED.replace('{WIDTH}',WIDTH);
            
            cards = cards.concat(text);
            return;
        }
        //console.log("title " + idx.title)  ;
        
	    var cardHtml=cardHtmlTemplate[template];
	    cardHtml = cardHtml.replace( '{WIDTH}', WIDTH);
	    // replace the default background colour if a different one
	    // is specific
	    if ( idx.cardBGcolour ) {
	        cardHtml = cardHtml.replace(/background-color:\s*rgb\(255,255,255\)/i, 'background-color: '+idx.cardBGcolour );
	    }
	    
	    //<div class="bg-cover h-48" style="background-image: url('{PIC_URL}'); //background-color: rgb(255,255,204)">{IFRAME}
	    // replace the Engage verb
	    
	    //---------------------------------------------
	    // Add in the mark review/reviewed options
	    var reviewTemplate = '';
	    if ( idx.review !== undefined) {
	        // only do it if there is a review option found
	        // check whether its a mark review or review
	        // - if link contains markUnreviewed then it has been
	        //   reviewed
	        if ( idx.review.match(/markUnreviewed/)) {
	            reviewTemplate = markUnReviewedLinkHtmlTemplate[template];
	            reviewTemplate = reviewTemplate.replace('{REVIEWED}', REVIEWED)
	        } else {
	            // it's the other one which indicates it has not been reviewed
	            reviewTemplate = markReviewLinkHtmlTemplate[template];
	            
	            reviewTemplate = reviewTemplate.replace('{MARK_REVIEWED}', MARK_REVIEWED)
	        }
	        // set the right link
	        reviewTemplate = reviewTemplate.replace('{LINK}',idx.review);
	    }
	    cardHtml = cardHtml.replace('{REVIEW_ITEM}',reviewTemplate);
	    //console.log("template is " + template);
	    // Only show module number if there's a label
	    if ( idx.label!=='') {
	        var checkForNum = idx.moduleNum;
	        if (idx.moduleNum) {
	            // if there's a hard coded moduleNum use that
	            cardHtml = cardHtml.replace('{MODULE_NUM}',idx.moduleNum);
	        } else {
	            // use the one we're calculating
	            //cardHtml = cardHtml.replace('{MODULE_NUM}',moduleNum);
	            cardHtml = cardHtml.replace(/\{MODULE_NUM\}/g,moduleNum);
	            checkForNum = moduleNum;
	 	    }
	 	    
	 	    // Update the title, check to see if it starts with label and 
	        // moduleNum.  If it does, remove them from the title
	        // So that the card doesn't duplicate it, but the information is 
	        // still there in Blackboard
	        var regex = new RegExp( '^' + idx.label + '\\s*' + checkForNum +
	                             '\\s*[-:]*\\s*(.*)')
	        var m = idx.title.match(regex );
	        if (m) {
	            idx.title = m[1];
	        }
	    } else { 
	       cardHtml = cardHtml.replace('{MODULE_NUM}','');
	    }
	    cardHtml = cardHtml.replace('{LABEL}',idx.label);
	    
	    //------------------ set the card image
	    
	    // Two options for BG_SIZE
	    // 1. cover (bg-cover)
	    //    Default option. Image covers the entire backgroun
	    // 2. contain (bg-contain bg-no-repeat) 
	    //    Entire image must fit within the card
	    
	    if ( idx.bgSize === 'contain' ) {
	        cardHtml = cardHtml.replace(/{BG_SIZE}/, 
	            'bg-contain bg-no-repeat bg-center');
	    } else { // if ( idx.bgSize === 'contain') 
	        cardHtml = cardHtml.replace(/{BG_SIZE}/, 'bg-cover');
	    }
	    
	    var picUrl = setImage( idx);
	    
	    // replace the {IMAGE_URL} variable if none set
	    if ( ! idx.hasOwnProperty('iframe')) {
	        cardHtml = cardHtml.replace(/{IFRAME}/g, '');
	    } else {
	        cardHtml = cardHtml.replace(/{IFRAME}/g, idx.iframe);
	        // set pic URl to empty so non is provided
	        picUrl = ''
	    }
	    cardHtml = cardHtml.replace(/{PIC_URL}/g, picUrl);
	    cardHtml = cardHtml.replace('{TITLE}', idx.title);
	    cardHtml = cardHtml.replace( /\{ASSESSMENT[_ ]TYPE\}/g, idx.assessmentType);
	    cardHtml = cardHtml.replace( /\{WEIGHTING\}/g, idx.assessmentWeighting);
	    cardHtml = cardHtml.replace( /\{LEARNING_OUTCOMES\}/g, idx.assessmentOutcomes);
	    
	    // Get rid of some crud Bb inserts into the HTML
	    description = idx.description.replace(/<p/, '<p class="pb-2"');
	    description = description.replace(/<a/g, '<a class="underline"');
	    cardHtml = cardHtml.replace('{DESCRIPTION}', description);
	    // Does the card link to another content item?
//	    console.log( " template is " + template + " and H_E " + HORIZONTAL_NOENGAGE);
       // console.log("title is " + idx.title + " LINK IS " + idx.link);
	    
	    if ( idx.link ) {
	        // add the link
	        
	        linkHtml = linkItemHtmlTemplate[template];
	        linkHtml = linkHtml.replace( '{ENGAGE}',engageVerb);
	        cardHtml = cardHtml.replace('{LINK_ITEM}',linkHtml);
	        // if there is a label and no hard coded moduleNum, 
	        //  then increment the module number
	        if ( idx.label!=="" && ! idx.moduleNum) {
	          moduleNum++;
	        } 
	    } else {// if (template!==HORIZONTAL_NOENGAGE) {
	        // remove the link, as there isn't one
	        cardHtml = cardHtml.replace('{LINK_ITEM}', '');
	        cardHtml = cardHtml.replace(/<a href="{LINK}">/g,'');
	        cardHtml = cardHtml.replace('</a>','');
	        // remove the shadow/border effect
	        cardHtml = cardHtml.replace('hover:outline-none','');
	        cardHtml = cardHtml.replace('hover:shadow-outline', '');
	        // don't count it as a module
	        cardHtml = cardHtml.replace(idx.label + ' ' + moduleNum, '');
	        //moduleNum--;
	    }
	    /* OLD STUFF if ( typeof idx.link !== "undefined" ) {
	        // add the link
	        //console.log("ADDING LINKE to " + title);
	        linkHtml = linkItemHtmlTemplate[template];
	        linkHtml = linkHtml.replace( '{ENGAGE}',engageVerb);
	        cardHtml = cardHtml.replace('{LINK_ITEM}',linkHtml);
	        // if there is a label and no hard coded moduleNum, 
	        //  then increment the module number
	        if ( idx.label!=="" && ! idx.moduleNum) {
	          moduleNum++;
	        } 
	    } else {
	        //console.log(" REMOVING LINK ");
	        // remove the link, as there isn't one
	        cardHtml = cardHtml.replace('{LINK_ITEM}', '');
	        cardHtml = cardHtml.replace(/<a[^>]*href="[^"]*"[^>]*>/g,'');
	        cardHtml = cardHtml.replace('</a>','');
	        // remove the shadow/border effect
	        cardHtml = cardHtml.replace('hover:outline-none','');
	        cardHtml = cardHtml.replace('hover:shadow-outline', '');
	        // don't count it as a module
	        cardHtml = cardHtml.replace(idx.label + ' ' + moduleNum, '');
	        //moduleNum--;
	    } */
	    
	    // If there is a linkTarget in Blackboard
	    if ( typeof idx.linkTarget!=='undefined' ) {
	        // replace "{LINK}" with "{LINK}" target="linkTarget"
	        cardHtml = cardHtml.replace( /"{LINK}"/g, '"{LINK}" target="' +
	                    idx.linkTarget + '"');
	    }
	    cardHtml = cardHtml.replace(/{LINK}/g, idx.link);
	    
	    // Should we add a link to edit/view the original content
	    // But only if we were able to find the id
	    //console.log("Location is " + location);
	    
	    if (location.href.indexOf("listContentEditable.jsp") > 0 &&
	    typeof idx.id !== "undefined") {
	        editLink = editLinkTemplate.replace('{ID}', idx.id);
	        cardHtml = cardHtml.replace(/{EDIT_ITEM}/, editLink );
	    } else {
	        //cardHtml = cardHtml.replace(/{EDIT_ITEM}/,'');
	        
	        //editLink = editLinkTemplate.replace('{ID}', idx.id);
	        /*editLink = '<div><a href="#hello">&nbsp;</a></div>';
	        cardHtml = cardHtml.replace(/{EDIT_ITEM}/, editLink );*/
	        cardHtml = cardHtml.replace(/{EDIT_ITEM}/, '&nbsp;');
	    }
	    
	    // If need add the date visualisation
	    if ( idx.date.start.month ) {
	        // Do we have dual dates - both start and stop?
	        if ( idx.date.stop.month ) {
	            // start and stop dates
	            cardHtml = cardHtml.replace('{DATE}', dualDateHtmlTemplate[template] );
	            cardHtml = cardHtml.replace(/{MONTH_START}/g, 
	                            idx.date.start.month);
	            cardHtml = cardHtml.replace(/{DATE_START}/g, 
	                            idx.date.start.date);
	            cardHtml = cardHtml.replace(/{MONTH_STOP}/g, 
	                            idx.date.stop.month);
	            cardHtml = cardHtml.replace(/{DATE_STOP}/g, 
	                            idx.date.stop.date);
	            cardHtml = cardHtml.replace(/{DATE_LABEL}/g, idx.dateLabel);
	 //           console.log(idx.date);
	            if ( ! idx.date.start.hasOwnProperty('week')) {
	                cardHtml = cardHtml.replace('{WEEK}','');
	            } else {
	                // if exam, use that template
	                // other wise construct dual week
	                var weekHtml = examPeriodTemplate;
	                if (idx.date.start.week!=='exam') {
	                    weekHtml = dualWeekHtmlTemplate.replace('{WEEK_START}', 
	                            idx.date.start.week);
	                    weekHtml = weekHtml.replace('{WEEK_STOP}',
	                        idx.date.stop.week);
	                }
	                cardHtml = cardHtml.replace('{WEEK}',weekHtml);
	            }
	        } else {
	            // just start date
	            cardHtml = cardHtml.replace('{DATE}', dateHtmlTemplate[template] );
	            cardHtml = cardHtml.replace(/{MONTH}/g, idx.date.start.month);
	            cardHtml = cardHtml.replace(/{DATE}/g, idx.date.start.date);
	            cardHtml = cardHtml.replace(/{DATE_LABEL}/g, idx.dateLabel);
	            if ( !idx.date.start.hasOwnProperty('week')) {
	                cardHtml = cardHtml.replace('{WEEK}','');
	            } else
	                var weekHtml = weekHtmlTemplate.replace('{WEEK}', idx.date.start.week);
	                cardHtml = cardHtml.replace('{WEEK}',weekHtml);
	        }
	    } else {
	        // no dates at all
	        cardHtml = cardHtml.replace('{DATE}', '');
	    }
	    cards = cards.concat(cardHtml);
	});
	
	//console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ");
	//console.log(cards);
	// STick the cards into the complete card HTML
	var interfaceHtml = interfaceHtmlTemplate[template];
	interfaceHtml = interfaceHtml.replace('{CARDS}',cards);
	
	// Insert the HTML to the selected item(s)
	//return false;
	jQuery(cardInterface).before( interfaceHtml);
	// remove the vtbegenerated stuff to clean up card css??
	//console.log(cardInterface);
	//console.log(firstItem);
}
	
	
// Interface design from https://codepen.io/njs/pen/BVdwZB


// TEMPLATES - by 6

// define the template types
const NUM_TEMPLATES=6, HORIZONTAL=0, // original 3 cards per row
      VERTICAL=1, // 1 card per row 
      HORIZONTAL_NOENGAGE=2, // original, but no engage
      PEOPLE = 5,
      ASSESSMENT = 6; // horizontal but show off people (BCI) version

// Whether or not xAPI logging is turned on
// - turned on by adding "logging" to Card Interface
var LOGGING=false;

// Define the wrapper around the card interface

var interfaceHtmlTemplate = Array(NUM_TEMPLATES);

// Kludge - hard code CSS path to enable shifting from
//          dev to live
//var CARDS_CSS="https://djon.es/gu/cards.css";
var CARDS_CSS="https://s3.amazonaws.com/filebucketdave/banner.js/cards.css";
// 



interfaceHtmlTemplate[HORIZONTAL] = `
<link rel="stylesheet" href="{CARDS_CSS}" />


<div class="guCardInterface flex flex-wrap -m-3">
 {CARDS}
</div>
`;
interfaceHtmlTemplate[HORIZONTAL] = interfaceHtmlTemplate[HORIZONTAL].replace('{CARDS_CSS}',CARDS_CSS);

interfaceHtmlTemplate[VERTICAL] = `
<link rel="stylesheet" href="{CARDS_CSS}" />
 {CARDS}
</div>
`;
interfaceHtmlTemplate[VERTICAL] = interfaceHtmlTemplate[VERTICAL].replace('{CARDS_CSS}',CARDS_CSS);

interfaceHtmlTemplate[HORIZONTAL_NOENGAGE]=interfaceHtmlTemplate[HORIZONTAL];
interfaceHtmlTemplate[PEOPLE]= interfaceHtmlTemplate[HORIZONTAL];
interfaceHtmlTemplate[ASSESSMENT]= interfaceHtmlTemplate[HORIZONTAL];

// template for each individual card

var cardHtmlTemplate = Array(NUM_TEMPLATES);

cardHtmlTemplate[HORIZONTAL]=`
  <div class="clickablecard w-full sm:w-1/2 {WIDTH} flex flex-col p-3">
    <div class="hover:outline-none hover:shadow-outline bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col relative"> <!-- Relative could go -->
      <a href="{LINK}" class="cardmainlink"></a>
      <div class="{BG_SIZE} h-48" style="background-image: url('{PIC_URL}');
      background-color: rgb(255,255,255)">{IFRAME}
      </div>
      <div class="carddescription p-4 flex-1 flex flex-col text-black">
        {LABEL} {MODULE_NUM}
        <h3 class="mb-4 text-2xl">{TITLE}</h3>
        <div class="mb-4 flex-1 text-black">
          {DESCRIPTION}
          
        </div>
         
         {LINK_ITEM}
         {REVIEW_ITEM}
         {EDIT_ITEM}
         {DATE} 
      </div>
    </div>
  </div>
`;

cardHtmlTemplate[VERTICAL]=`
<a href="{LINK}">
<div class="lg:flex xl:flex md:flex mb-4 rounded-lg shadow-lg hover:shadow-outline">
  <div class="lg:w-1/4 md:w-1/4 sm:w-full h-auto lg:flex-none bg-cover bg-center rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden" style="background-image: url('{PIC_URL}')">
        <img src="{PIC_URL}" style="opacity:0;width:50%" />
        {IFRAME}
  </div>
    <div class="p-2 m-2 lg:flex md:w-1/5 lg:w-1/5 sm:w-full">
        <h3>{TITLE}</h3>
    </div>
    <div class="carddescription m-2 p-2 lg:flex-initial md:w-1/2 lg:w-1/2 sm:w-full">
      <p class="text-grey-darker text-base">
        {DESCRIPTION} 
      </p>
      {LINK_ITEM}
      {EDIT_ITEM}
    </div>
</div>
</a>
`;

/*cardHtmlTemplate[HORIZONTAL_NOENGAGE]=`
  <div class="w-full sm:w-1/2 {WIDTH} flex flex-col p-3">
    <div class="hover:outline-none hover:shadow-outline bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col relative"> <!-- Relative could go -->
      <a href="{LINK}"><div class="bg-cover bg-yellow-lightest h-48" style="background-image: url('{PIC_URL}');">{IFRAME}</div></a>
      <div class="p-4 flex-1 flex flex-col">
       <a href="{LINK}">
        {LABEL} {MODULE_NUM}
        <h3 class="mb-4 text-2xl">{TITLE}</h3>
        <div class="carddescription mb-4 flex-1">
          {DESCRIPTION}
        </div>
        </a>
         {DATE} 
         {LINK_ITEM}
         {REVIEW_ITEM}
         {EDIT_ITEM}
      </div>
    </div>
  </div>
`;*/

 cardHtmlTemplate[HORIZONTAL_NOENGAGE]=`
  <div class="w-full sm:w-1/2 {WIDTH} flex flex-col p-3">
    <div class="hover:outline-none hover:shadow-outline bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col relative"> <!-- Relative could go -->
      <a href="{LINK}" class="no-underline" style="text-decoration:none"><div class="bg-cover bg-yellow-lightest h-48" style="background-image: url('{PIC_URL}');">{IFRAME}</div></a>
      <div class="p-4 flex-1 flex flex-col">
       <a href="{LINK}" class="no-underline" style="text-decoration:none; color: #000000 !important">
        {LABEL} {MODULE_NUM}
        <h3 class="mb-4 text-2xl text-black">{TITLE}</h3>
        <div class="carddescription mb-4 flex-1 text-black">
          {DESCRIPTION}
        </div>
        </a>
         {DATE} 
         {LINK_ITEM}
         {REVIEW_ITEM}
         {EDIT_ITEM}
      </div>
    </div>
  </div>
`;

// TODO - this might not be a better fit as something not a template?

cardHtmlTemplate[PEOPLE]=`
<!-- <style>
  .codegena{position:relative;width:100%;height:0;padding-bottom:56.27198%;
  .codegena iframe{position:absolute;top:0;left:0;width:100%;height:100%;}
</style>-->
  
  
  <div class="clickablecard w-full sm:w-1/2 md:w-1/2 flex flex-col p-3">
    <div class="hover:outline-none hover:shadow-outline bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col relative"> <!-- Relative could go -->
      <a href="{LINK}" class="cardmainlink"></a>
      <div class="w-full"><iframe src='https://player.vimeo.com/video/226525600?&title=0&byline=0'></iframe></div></a>
      <div class="p-4 flex-1 flex flex-col">
       <a href="{LINK}">
        {LABEL} {MODULE_NUM}
        <h3 class="mb-4 text-2xl">{TITLE}</h3>
        <div class="carddescription mb-4 flex-1">
          {DESCRIPTION}
          
        </div>
        </a>
         {LINK_ITEM}
         {EDIT_ITEM}
         {DATE} 
      </div>
    </div>
  </div>
`;

// Implement the assessment template

cardHtmlTemplate[ASSESSMENT]=`
<div class="clickablecard lg:max-w-full w-full lg:flex xl:flex md:flex mb-6 rounded-lg shadow-lg hover:shadow-outline"> 
    <!-- padding kludge -->
    <!-- <div>&nbsp;</div> -->
    <div class="h-auto">
          <a href="{LINK}" class="cardmainlink"></a>
          <h1 class="mt-2 ml-2 font-extrabold rounded-full h-16 w-16 flex items-center justify-center border-2 border-black bg-red text-white ">{MODULE_NUM}</h1>
          <p class="text-xs p-2 pr-6">Weight: <span class="font-bold">{WEIGHTING}</p>
        
        <!-- date -->
        {DATE}
        
    </div>
	<div class="m-2">&nbsp;</div>
	<div class="carddescription m-2">
          <div class="mb-4">
			<h3 class="font-bold">{TITLE}</h3>
			<p class="text-sm">{ASSESSMENT_TYPE}</p>
			<p class="text-sm">Learning outcomes: {LEARNING_OUTCOMES}</p>
		  </div>
		  
		  {DESCRIPTION}
		  
		  {LINK_ITEM}
		  {EDIT_ITEM}
		  
	</div>
</div>
`;
	
// template to add the "ENGAGE" link to (more strongly) indicate that the card links somewhere

var linkItemHtmlTemplate = Array(NUM_TEMPLATES);

linkItemHtmlTemplate[HORIZONTAL] = `
        <p>&nbsp;<br /> &nbsp;</p>
        <div class="p-4 absolute pin-r pin-b">
           <a class="XXX" href="{LINK}"><div class="XXX hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded no-underline">
            {ENGAGE}
        </div></a>
        </div>
        `;

linkItemHtmlTemplate[VERTICAL] ='';
linkItemHtmlTemplate[HORIZONTAL_NOENGAGE] = '';
linkItemHtmlTemplate[PEOPLE] = '';
linkItemHtmlTemplate[ASSESSMENT] = '';

// TODO: need to decide how and what this will look like
//linkItemHtmlTemplate[1] = '<p><strong>Engage</strong></p>';
linkItemHtmlTemplate[VERTICAL] = '';
/*`
<div class="relative pin-r pin-b m-18"> <button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded"> Engage </button> 
        </div>`;*/
        
//*****************************************************************
// Templates for the "Mark Review" and "Reviewed" features

var markReviewLinkHtmlTemplate = Array(NUM_TEMPLATES);
var markUnReviewedLinkHtmlTemplate = Array(NUM_TEMPLATES);

markReviewLinkHtmlTemplate[HORIZONTAL] = `
<div class="p-4 absolute pin-l pin-b">
     <a href="{LINK}"><button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
     <span class="font-bold rounded-full px-2 py-1 bg-yellow text-black">&#x26a0;</span>&nbsp; {MARK_REVIEWED}</button></a>
</div>
        `;
        
markUnReviewedLinkHtmlTemplate[HORIZONTAL] = `
<div class="p-4 absolute pin-l pin-b">
    <a href="{LINK}"><button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
                    <span class="font-bold rounded-full px-2 py-1 bg-green text-white">&#10003;</span>&nbsp;{REVIEWED}</button></a>
</div>
`;

markReviewLinkHtmlTemplate[VERTICAL] ='';
markUnReviewedLinkHtmlTemplate[VERTICAL] ='';
markReviewLinkHtmlTemplate[HORIZONTAL_NOENGAGE] = markReviewLinkHtmlTemplate[HORIZONTAL];
markUnReviewedLinkHtmlTemplate[HORIZONTAL_NOENGAGE] =markUnReviewedLinkHtmlTemplate[HORIZONTAL];
markReviewLinkHtmlTemplate[PEOPLE] = '';
markUnReviewedLinkHtmlTemplate[PEOPLE] ='';
markReviewLinkHtmlTemplate[ASSESSMENT] = '';
markUnReviewedLinkHtmlTemplate[ASSESSMENT] ='';
        
// Template for the calendar/date tab

var dateHtmlTemplate = Array(NUM_TEMPLATES);
var dualDateHtmlTemplate = Array(NUM_TEMPLATES);

dateHtmlTemplate[HORIZONTAL] = `
<div class="block rounded-t rounded-b overflow-hidden bg-white text-center w-24 absolute pin-t pin-r">
          <div class="bg-black text-white py-1 text-xs border-l border-r border-t border-black">
             {DATE_LABEL}
          </div>
          {WEEK}
          <div class="bg-red text-white py-1 border-l border-r border-black">
      	     {MONTH}
          </div>
          <div class="pt-1 border-l border-r border-b border-black rounded-b">
      	     <span class="text-2xl font-bold">{DATE}</span>
          </div>
        </div>
`;

dateHtmlTemplate[ASSESSMENT] = `
<div class="block rounded-t rounded-b overflow-hidden bg-white text-center w-24  pin-b pin-l"> 
          <div class="bg-black text-white py-1 text-xs">
             {DATE_LABEL}
          </div>
          {WEEK}
          <div class="bg-red text-white py-1">
      	     {MONTH}
          </div>
          <div class="pt-1 border-l border-r border-b rounded-b">
      	     <span class="text-2xl font-bold">{DATE}</span>
          </div>
        </div>
`;

dualDateHtmlTemplate[HORIZONTAL] = `
<div class="block rounded-t rounded-b overflow-hidden bg-white text-center w-24 absolute pin-t pin-r">
          <div class="bg-black text-white py-1 text-xs border-l border-r border-black">
             {DATE_LABEL}
          </div>
          {WEEK}
          <div class="bg-red text-white flex items-stretch py-1 border-l border-r border-black">
              <div class="w-1/2 flex-grow">{MONTH_START}</div>
              <div class="flex items-stretch border-l border-black flex-grow  -mt-1 -mb-1"></div>
              <div class="w-1/2">{MONTH_STOP}</div>
          </div>
          <div class="border-l border-r border-b text-center flex border-black items-stretch pt-1">
      	     <div class="w-1/2 text-2xl flex-grow font-bold">{DATE_START}</div>
      	     <div class="flex font-bolditems-stretch border-l border-black flex-grow -mt-1"></div>
              <div class="w-1/2 text-2xl font-bold">{DATE_STOP}</div>
          </div>
         </div> 
`;

dualDateHtmlTemplate[ASSESSMENT] = `
<div class="block rounded-t rounded-b overflow-hidden bg-white text-center w-24  pin-b pin-l">
          <div class="bg-black text-white py-1 text-xs border-l border-r border-t border-black">
             {DATE_LABEL}
          </div>
          {WEEK}
          <div class="bg-red text-white flex items-stretch py-1 border-l border-r border-black">
              <div class="w-1/2 flex-grow">{MONTH_START}</div>
              <div class="flex items-stretch border-l border-black flex-grow  -mt-1 -mb-1"></div>
              <div class="w-1/2">{MONTH_STOP}</div>
          </div>
          <div class="border-l border-r border-b text-center flex border-black items-stretch pt-1 rounded-b">
      	     <div class="w-1/2 text-2xl flex-grow font-bold">{DATE_START}</div>
      	     <div class="flex font-bolditems-stretch border-l border-black flex-grow -mt-1"></div>
              <div class="w-1/2 text-2xl font-bold">{DATE_STOP}</div>
          </div>
         </div> 
`;

weekHtmlTemplate = `
    <div class="bg-yellow-lighter text-black py-1">
      Week {WEEK}
    </div>
    `;
    
dualWeekHtmlTemplate = `
    <div class="bg-yellow-lighter text-black py-1 border-l border-r border-black">
      Week {WEEK_START} to {WEEK_STOP}
    </div>
    `;    
    
examPeriodTemplate =`
<div class="bg-yellow-lighter text-black py-1 border-l border-r border-black">
      Exam Period
    </div>
`;

dateHtmlTemplate[VERTICAL] = dateHtmlTemplate[HORIZONTAL];
dateHtmlTemplate[HORIZONTAL_NOENGAGE] = dateHtmlTemplate[HORIZONTAL];
dateHtmlTemplate[PEOPLE] = '';
//dateHtmlTemplate[ASSESSMENT] = dateHtmlTemplate[HORIZONTAL];

dualDateHtmlTemplate[VERTICAL] = dualDateHtmlTemplate[HORIZONTAL];
dualDateHtmlTemplate[HORIZONTAL_NOENGAGE] = dualDateHtmlTemplate[HORIZONTAL];
dualDateHtmlTemplate[PEOPLE] = '';
//dualDateHtmlTemplate[ASSESSMENT] = dualDateHtmlTemplate[HORIZONTAL];

// Template to allow editors to view the original Bb content item
// Same for all templates
var editLinkTemplate = `
	        <div class="text-xs grey-light">
	           [<a href="#{ID}">View origin</a>]
	        </div>`;

// Message to display on a card if EDIT mode on and the item is hidden
HIDDEN_FROM_STUDENTS = `<div class="inline-block bg-yellow text-black text-xs rounded-t rounded-b">This item is <strong>hidden from students</strong></div>`;
	
	
//*************************************************************
// picUrl = setImage( card )
// - given card object containing information about a card
// - return picUrl if no active card image
// - return picUrl if there is an active card image, but it's
//   not the date
// - return activePicUrl if there is one and it's not the date
function setImage( card) {
    // only use activePicURL if it is set and there are dates on
    // the card
    if ( card.activePicUrl!=='' &&
             card.date.start.date!=="" ){
        // there is an activePicUrl, check if it should be active
        
        // active means that the current date falls within the start/stop
        // dates for the card
        var start,stop, now;
        if ( SET_DATE==="") {
            now = new Date();
        } else {
            now = new Date( SET_DATE);
        }
        
        //console.log(card.date);
        if ( card.date.start.hasOwnProperty( 'month') &&
               card.date.start.month!==""){
        
            start = new Date( parseInt(YEAR), MONTHS.indexOf(card.date.start.month), parseInt(card.date.start.date));
        } 
        if ( card.date.stop.hasOwnProperty('month') &&
                  card.date.stop.month!=='') {
            stop = new Date( YEAR, MONTHS.indexOf(card.date.stop.month), card.date.stop.date);
            stop.setHours(23,59,0);
        } else if ( card.date.start.hasOwnProperty('week')){
            // there's no end date, but there is a start week
            // so set stop to end of that week
            stop = new Date( TERM_DATES[TERM][card.date.start.week].stop);  
            stop.setHours(23,59,0);
        } else { // no week for stop, meaning it's just on the day
            stop = new Date(start.getTime());
            stop.setHours(23,59,0);
        }
        
        if ( now>=start && now<=stop) {
            return card.activePicUrl;
        }
    }
    return card.picUrl;
}    	


//---------------------------------------------------------------------
// Given a string of parameters use some Stack Overflow provided
// regular expression magic to split it up into its component parts

function parse_parameters(cmdline) {
//    var re_next_arg = /^\s*((?:(?:"(?:\\.|[^"])*")|(?:'[^']*')|\\.|\S)+)\s*(.*)$/;
    var re_next_arg = /^\s*((?:(?:"(?:\\.|[^"])*")|(?:'[^']*')|\\.|\S)+)\s*(.*)$/;
    var next_arg = ['', '', cmdline];
    var args = [];
    while (next_arg = re_next_arg.exec(next_arg[2])) {
        var quoted_arg = next_arg[1];
        var unquoted_arg = "";
        while (quoted_arg.length > 0) {
            if (/^"/.test(quoted_arg)) {
                var quoted_part = /^"((?:\\.|[^"])*)"(.*)$/.exec(quoted_arg);
                unquoted_arg += quoted_part[1].replace(/\\(.)/g, "$1");
                quoted_arg = quoted_part[2];
            } else if (/^'/.test(quoted_arg)) {
                var quoted_part = /^'([^']*)'(.*)$/.exec(quoted_arg);
                unquoted_arg += quoted_part[1];
                quoted_arg = quoted_part[2];
            } else if (/^\\/.test(quoted_arg)) {
                unquoted_arg += quoted_arg[1];
                quoted_arg = quoted_arg.substring(2);
            } else {
                unquoted_arg += quoted_arg[0];
                quoted_arg = quoted_arg.substring(1);
            }
        }
        args[args.length] = unquoted_arg;
    }
    return args;
}

NO_CARD_DEFINED=`
  <div class="clickablecard w-full sm:w-1/2 {WIDTH} flex flex-col p-3">
    <div class="hover:outline-none hover:shadow-outline bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col relative"> <!-- Relative could go -->
      
      <div class="bg-cover h-48" style="background-image: url('https://media.giphy.com/media/13ywPzPJdfhmBG/giphy.gif'); background-color: rgb(255,255,204)">
      </div>
      <div class="carddescription p-4 flex-1 flex flex-col">
        
        <h3 class="mb-4 text-2xl">No matching card</h3>
        <div class="mb-4 flex-1">
          <p>Couldn't find a Blackboard Content Item with a title that exactly matched </p>
          
        </div>
      </div>
    </div>
  </div>
`;