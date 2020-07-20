
/* content
 * - Given a Blackboard page containing a content item with  
     HTML generated from Mammoth
 * - Implement a variety of transformations
 */
 
// Wrap arounds for various types of activity 
var READING=`<div class="image"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-reading-48.png" /></div>`;
var ACTIVITY=`<div class="image"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-dancing-48.png" /></div>`;
var NOTE=`<div class="icon"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/Blk-Warning.png"></div>`;

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

    // handle footnotes
    // - find each footnote reference and replace with a tooltipster element
    //   that incldues content from the actual footnote (minus some extra HTML)
    handleFootNotes();

    // handle the integration of any blackboard headings/items into the
    // content interface
    jQuery("h1.blackboard").each( handleBlackboardItem );
    jQuery("h2.blackboard").each( handleBlackboardItem );
    jQuery("span.blackboardContentLink").each( handleBlackboardContentLink );
    jQuery("span.blackboardMenuLink").each( handleBlackboardMenuLink );
    
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
	        // replace blaed links with normal links
            if ( theLink.match(BLAED_LINK)!==null) {
                theLink = theLink.replace( BLAED_LINK, LMS_LINK);
                jQuery(this).attr('href',theLink);
            }
	        // open external links in a new window i.e. links that don't
	        // match the LMS or don't have a host portion at the start
            if ( theLink.match(LMS_LINK) === null && theLink.match(/^\//)===null) {
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
    if ( params.scrollTo===true) {
        jQuery('.accordion_top').slice(start,end).accordion("option","active", 0);
    }

}

//********************************************* */
// handle footnotes
// - find each footnote reference and replace with a tooltipster element
//   that incldues content from the actual footnote (minus some extra HTML)

function handleFootNotes() {
    const footnote_re = /<a href="#footnote-ref-[0-9]*">.<\/a>/g;
    var footnotes = jQuery('#GU_ContentInterface a[id^="footnote-ref-"');
    var firstFootNote = ''

    footnotes.each( function() {
        // get the <sup> item wrapped around footnote
        var supItem = jQuery(this).parent();

        // get the id for the footnote content (at end of doc)
        //  footnote-ref-??  becomes
        //  footnote-??
        var footnoteId = jQuery(this).attr("id");
        var footnote = "li# " + footnoteId.replace('-ref','');
        footnote = footnote.replace(' ', '');
        footnoteContent = jQuery( footnote).html();

        if ( firstFootNote === '') {
            firstFootNote = footnote;
        }

        // need to remove the return link to the footnote in footnoteContent
        var footnoteContent = footnoteContent.replace( footnote_re, '');

        // need to remove the link on the footnote reference
        var refHtml = jQuery(this).html();
        jQuery(this).remove("a");
        jQuery(supItem).html(refHtml);

        // set the attributes for tooltipster to work
        supItem.attr('footNoteId',footnoteId);
        supItem.attr('class', 'ci-tooltip');
        supItem.attr('data-tooltip-content', footnoteContent);
    })

    // if there were footnotes, then
    if (footnotes) {
        // add a <h3>Footnotes</h3> heading just before the list of footnote content
        var footNoteList = jQuery( firstFootNote ).parent();
        jQuery(footNoteList).before("<h1>Footnotes</h1>");
        // remove the return anchor TODO replace it with something that works
        var footNoteListHtml = jQuery(footNoteList).html().replace( footnote_re, '');

        jQuery(footNoteList).html(footNoteListHtml);

        // add tooltipster if there are footnotes
        jQuery("head").append(
            "<link id='tooltipstercss' href='https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/css/tooltipster.bundle.min.css' type='text/css' rel='stylesheet' />");
        jQuery.getScript(
            //"https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/js/tooltipster.bundle.js",
            "https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/js/tooltipster.bundle.min.js",
            function() { 
                docWidth = Math.floor(jQuery(document).width()/2);
                jQuery('.ci-tooltip').tooltipster({ 'maxWidth': docWidth});
            });
    }
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
<li><strong>No changes to this item</strong> - do not edit or remove content from this tweak code item. The tweak code implements the Content interface. Changes may break the Content interface.</li>
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
  
  m = current.match( /^.*course_id=(_[^&]*).*$/ );
  if ( m ) {
      courseId=m[1];
  }

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
  
  // encode path ready for going via URLs
  path="u!" + btoa(path).replace(/\+/g,'-').replace(/\//g,'_').replace(/\=+$/,'');
  
  
  jQuery("#styleSelector").on("change", function() {
        jQuery("#gu_jqueryStyle").attr( "href", this.value );
        jQuery("#gu_stylePath").text(this.value);
   });
   
  //---------------------------------------------------
  // Set up the click event for the submit button
  // get the courseId
  
   
   
   
  jQuery("#guUpdate").click( function( event ) {
        // if href currently includes blaed then add parameter
      
      var link = window.location.href;
      
      // Determine and tell Mammoth if we're using blaed blackboard
      var blaed = '';
      if ( link.match(BLAED_LINK)!==null) {
          blaed="&blaed=1";
      }
      
      // Determine and tell Mammoth if we're just want a particular title section
      var title = '';
      if ( params.hasOwnProperty("titleNum" )) {
          title = "&titleNum=" + params.titleNum;
      }
      if ( params.hasOwnProperty("title")) {
          title = "&title=" + params.title;
      }
        window.location.href="https://djon.es/gu/mammoth.js/browser-demo/oneDriveMammoth.html?course=" + courseId + blaed + title + "&content=" + contentId + "&path=" + path ;
  } );
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
    paramsObj.scrollTo = true;
    
    // Check parameters in the Content Interface item title
    if (contentInterface.length>0) {
        var contentInterfaceTitle = jQuery.trim(contentInterface.text());
        
        var m = contentInterfaceTitle.match(/content interface\s*([^<]+)/i );
        
        if (m) {
            //params = m[1].match(/\S+/g);
            
            params=parse_parameters(m[1]);
            
            if (params) {
                params.forEach( function(element) {
                    if ( element.match( /nofirstscroll/i )) {
                        paramsObj.scrollTo = false;
                    }
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
                    if ( x=element.match(/titleNum=([0-9]*)/i) ) {
                        paramsObj.titleNum=x[1];
                    }
                    if ( x=element.match(/title=(.*)/i) ) {
                        paramsObj.title=x[1];
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

/***************************************************
 * handleBlackboardItem( heading )
 * Given a single heading element as this
 * - find the matching Blackboard element
 * - find the content up until the next heading
 * - find any span.blackboardLink in the HTML and update the link
 * - if the item is hidden don't show the link and attempt to update
 *   the text to show (not currently available)
 * 
 * Footnotes - plan
 * - appear in a section as
 *     <sup><a href="#footnote-2" id="footnote-ref-2" target="_blank">[1]</a></sup>
 * - at the end of the file as
 *     <li id="footnote-3"> 
 *        <p>..footnote content. <a href="#footnote-ref-3" target="_blank">↑</a></p> 
 *     </li> 
 * Need to
 * - add the title to the sup and remove the link, but add the id to the sup
 * - if there is an ordered list with elements with id "footnote-2" e.g.  Add a small
 *   heading just before the foot notes
 */
 
function handleBlackboardItem() {
    
    var hidden_string = " (not currently available)";
    
    // get the title from the Blackboard Item Heading (2)
    title = jQuery(this).text()
    
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
            title = jQuery(this).find("a").first().attr('href', link);
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
    
    /* Find the course menu link that matches */
    var bbItem = jQuery( "#courseMenuPalette_contents > li > a > span[title='"+title+"']" );
    
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