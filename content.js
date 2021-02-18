
/* content
 * - Given a Blackboard page containing a content item with  
     HTML generated from Mammoth
 * - Implement a variety of transformations
 * esversion: 6
 */

// Default dates
var TERM = "3191", YEAR = 2019;

const DEFAULT_CARD_LABEL="Module";

// Default reviewed/mark reviewed labels
var MARK_REVIEWED = "Mark Reviewed";
var REVIEWED = "Reviewed";

var DEFAULT_CSS = "https://s3.amazonaws.com/filebucketdave/banner.js/gu_study.css";

var tweak_bb_active_url_pattern = "listContent.jsp";

// Wrap arounds for various types of activity 
// - key indicates <div style to be preprended
// - value is what will be prepended
var STYLE_PREPEND = {
    "reading" : `<div class="readingImage"></div>`,
    "activity": `<div class="activityImage"></div>`, 
    //"flashback" : `<img src="https://djon.es/images/flashback.png" width="25%" height="25%" style="float:right;padding:1em" alt="Flashback logo" />`, 
    "flashback" : `<div class="flashbackImage"><img src="https://s3.amazonaws.com/filebucketdave/banner.js/images/com14/flashback.png" alt="Flashback logo" /></div>`,
    //"canaryExercise" : `<div class="canaryImage"></div>`,
    // COM14
    "canaryExercise" : `<div class="canaryImage"><img src="https://s3.amazonaws.com/filebucketdave/banner.js/images/com14/Tweety.svg.png"  alt="Tweety bird"  /></div>`,
    //"ael-note" : `<div class="icon"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/Blk-Warning.png"></div>`,
    "ael-note" : `<div class="noteImage"></div>`,
    "weeklyWorkout" : `<div class="weeklyWorkoutImage"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/com14/weeklyWorkout.png" alt="Female weight lifter" /></div>`, 
    "comingSoon" : `<div class="comingSoonImage"></div>`,
};

//
var EXPAND_COLLAPSE_BUTTON_HTML = `<div class="accordion-expand-holder">
 <button class="gu_content_open" style="padding:0.3em 1.2em;margin:0 0.3em 0.3em 0;border-radius:2em;border:2px solid;box-sizing: border-box;text-decoration:none;text-align:center">Expand all</button>
 <button class="gu_content_close"  style="padding:0.3em 1.2em;margin:0 0.3em 0.3em 0;border-radius:2em;border:2px solid;box-sizing: border-box;text-decoration:none;text-align:center">Collapse all</button>
 </div>`;

// simple definition for using pure.css tables
// TODO need to replace this.
var TABLE_CLASS = 'table stripe-row-odd';

// Define way to insert a checkbox that can be clicked
var CHECKBOX = `<input type="checkbox" name="gu_dummy" />`;

// specify Bb links to ensure external links open in new window
var BLAED_LINK = 'bblearn-blaed.griffith.edu.au';
var LMS_LINK = 'bblearn.griffith.edu.au';

var PARAMS = {};

// new global kludges for Cards
var LOCATION = location.href.indexOf("listContent.jsp");
var MODULE_NUM;

var ITEM_LINK_PARAMETERS = {
    'Content Document': {
        'element': 'wordDocElement',
        'item': 'wordDoc'
    },
    'Film Watching Flow': {
        'element': 'filmWatchingOptionsElement',
        'item': 'filmWatchingOptionsFlowURL',
    },
    'cssURL': {
        'element': 'cssURLElement',
        'item': 'cssURL'
    }
};

/****************************************************************************/

/* Main function
 * - called from the tweak
 */

function contentInterface($) {

    // redefine contains so that it is case insensitive
    // Used to match the Blackboard headings
    $.expr[":"].contains = $.expr.createPseudo(function (arg) {
        return function (elem) {
            arg = arg.replace(/\u2013|\u2014/g, "-");
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });

    /* define variables based on Bb page type */
    /* used to identify important components in html */
    var tweak_bb_active_url_pattern = "listContent.jsp";
    window.tweak_bb = {
        display_view: (location.href.indexOf(tweak_bb_active_url_pattern) > 0),
        page_id: "#content_listContainer",
        row_element: "li"
    };

    // Add to jQuery a function that will be used to find BbItems that
    // match a given title
    jQuery.expr[':'].textEquals = jQuery.expr[':'].textEquals || jQuery.expr.createPseudo(function (arg) {
        return function (elem) {
            arg = arg.replace(/\u2013|\u2014/g, "-");
            // Convert emdash type chars to ASCII equivalents
            elemText = elem.textContent.trim();
            elemText = elemText.replace(/\u2013|\u2014/g, "-");
            arg = arg.replace(/[\u201c\u201d]/g, "\"");
            elemText = elemText.replace(/[\u201c\u201d]/g, "\"");
            //console.log("Compre arg **" + arg + "** with **" + elemText + "**");
            return elemText.localeCompare(arg, undefined, {
                sensitivity: 'base'
            }) === 0;
        };
    });

    // Find the item in which the content is contained
    var contentInterface = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find(".item h3").filter( function(x) {
            return this.innerText.toLowerCase().includes("content interface");
        }
        ).eq(0);
    // Find any Word Document link that's been added
    var wordDoc = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find(".item h3").filter(':contains("Content Document")').eq(0);

    calculateTerm();

    params = checkParams(contentInterface, wordDoc);
    // kludge for jQuery each functions
    PARAMS = params;
    setUpEdit(contentInterface, params);
    
    // check parameters passed in
    // Hide the tweak if we're not editing
    if (location.href.indexOf("listContent.jsp") > 0) {
        $(".gutweak").parents("li").hide();
        contentInterface.parents("div.item").hide();
        jQuery(wordDoc).hide();
        
        // hide all the items found for ITEM_LINK_PARAMETERS
        for (var paramKey in ITEM_LINK_PARAMETERS) {
            let elem = ITEM_LINK_PARAMETERS[paramKey].element;

            // if we found an item for this param, hide it
            if (elem in params) {
                jQuery(params[elem]).parents("li").hide();
            }
        }
    } else {
         // add the cards for documentation
         addCSS(CARDS_CSS);
         addJS(FONT_AWESOME_JS);
    }

    // do nothing if we couldn't find the contentInterface item
    if (contentInterface.length === 0) {
        return false;
    }

    // the if isn't required
    if ("cssURL" in params) {
        addCSS(params.cssURL);
    }

    
    if ("theme" in params ) {
        changeJqueryTheme( params.theme); 
    } else {
        changeJqueryTheme( "smoothness");
    }
    // kludge for com14
    cleanUpPlaceHolder();

    // remove the vtbegenerated class as it's screwing with CSS in the content
    // PROBLEM if you do this all the normal styles e.g. <LI> revert to
    // an almost empty setting from an earlier Blackboard style sheet.
    /*ci = jQuery("#GU_ContentInterface");
    vtb = jQuery(ci).parent().parent();//".vtbegenerated");
    jQuery(vtb).removeClass("vtbegenerated");*/



    //   that incldues content from the actual footnote (minus some extra HTML)
    handleFootNotes();
    jQuery("div.filmWatchingOptions").each(handleFilmWatchingOptions);

    // handle the integration of any blackboard headings/items into the
    // content interface
    jQuery("h1.blackboard").each(handleBlackboardItem);
    jQuery("h2.blackboard").each(handleBlackboardItem);
    jQuery("span.blackboardContentLink").each(handleBlackboardContentLink);
    jQuery("span.blackboardMenuLink").each(handleBlackboardMenuLink);

    jQuery("span.universityDate").each(handleUniversityDate);

    // Add a <div> </div> around all the content following H1s
    jQuery('#GU_ContentInterface h1').each(function () {
        // Kludge test for changing colour
        title = jQuery(this).text();

        jQuery(this).nextUntil('h1').addBack().wrapAll('<div class="accordion_top"></div>');
        jQuery(this).nextUntil('h1').wrapAll('<div class="gu-accordion-h1-body"></div>');
    });
    // Add divs around the h2 headings, until h2 or h1
    jQuery('#GU_ContentInterface h2').each(function () {
        // console.log( "Heading text " + jQuery(this).html());
        jQuery(this).nextUntil('h1,h2').addBack().wrapAll('<div class="accordion"></div>');
        jQuery(this).nextUntil('h1,h2').wrapAll('<div class="gu-accordion-h2-body"></div>');
    });

    // handle footnotes
    // - find each footnote reference and replace with a tooltipster element

    handleBlackboardCards();
    //jQuery("div.bbCard").each( handleBlackboardCards );

    // Update the HTML for various defined styles
    for (var divstyle in STYLE_PREPEND) {
        let query = `div.${divstyle}`;
        jQuery(query).prepend( STYLE_PREPEND[divstyle]);
    }
   
    //updateReadings(contentInterface);
    // Handle the blackboard items

    // Convert the videos - handled by embed now
    //doVideo();

    // convert the embed code
    var embeds = jQuery(".embed");
    embeds.each(function (idx) {
        var embed = jQuery(this).html();
        var decoded = jQuery("<div/>").html(embed).text();
        jQuery(this).html(decoded);

    });

    // Find all the div.picture and add a <p> </p> around
    // text after the image
    jQuery("#GU_ContentInterface div.picture").each(function (idx) {
        jQuery(this).children('img').after('<br />');
        //console.log("Picture found " + jQuery(this).text()) ;
        //console.log("Picture found after text " + jQuery(afterImage));
    });
    jQuery("#GU_ContentInterface div.pictureRight").each(function (idx) {
        jQuery(this).children('img').after('<br />');
        //console.log("Picture found " + jQuery(this).text()) ;
        //console.log("Picture found after text " + jQuery(afterImage));
    });

    // convert all tables in the content to TABLE_CLASS
    // - TODO only add TABLE_CLASS if it doesn't have and div#tableHeading
    //   or otheers within it
    jQuery("#GU_ContentInterface table").addClass(TABLE_CLASS);

    // center contents of table cells that contain span class strongCentered
    jQuery("#GU_ContentInterface span.strongCentered").each(function (idx) {
        if (jQuery(this).parent().parent().is("td")) {
            jQuery(this).parent().parent().css('text-align', 'center');
        }
    });

    jQuery("#GU_ContentInterface span.centered").each(function (idx) {
        if (jQuery(this).parent().parent().is("td")) {
            jQuery(this).parent().parent().css('text-align', 'center');
        }
    });


    // check for any spans class checkbox and replace with checkbox
    jQuery("#GU_ContentInterface span.checkbox").each(function (idx) {
        //console.log(idx + " found checkbox " + jQuery(this).html());
        jQuery(this).html(CHECKBOX);
    });

    // convert all external links to open in another window
    // Also convert blaed links to normal bblean links
    jQuery("#GU_ContentInterface a").each(function (idx) {
        // check if it's a blackboard link
        // but ignore any with class gu-bb-review, these are added for
        // review status

        linkClass = jQuery(this).attr("class");
        if (linkClass === "gu-bb-review") {
            return;
        }

        var theLink = jQuery(this).attr('href');

        if (typeof theLink !== 'undefined') {
            // replace blaed links with normal links
            if (theLink.match(BLAED_LINK) !== null) {
                theLink = theLink.replace(BLAED_LINK, LMS_LINK);
                jQuery(this).attr('href', theLink);
            }
            // open external links in a new window i.e. links that don't
            // match the LMS or don't have a host portion at the start
            if (theLink.match(LMS_LINK) === null && theLink.match(/^\//) === null && theLink.match(/^javascript:mark/) === null) {
                jQuery(this).attr('target', '_blank');
                // turn off the Blackboard onclick "stuff"
                jQuery(this).prop("onclick", null).off("click");
            }
        }
    });

    addExpandPrintButtons();


    // Apply the jQuery accordion
    accordionDisabled = false;

    if (params.noAccordion === true) {
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
        navigation: true,
        //autoHeight:true
        heightStyle: 'content',
        activate: function (event, ui) {
            if (!$.isEmptyObject(ui.newHeader.offset())) {
                $('html:not(:animated), body:not(:animated)').animate({ scrollTop: ui.newHeader.offset().top }, 'slow');
                // send resize to ensure that h5p iframe appears correct
                // size
                window.dispatchEvent(new Event('resize'));
            }
        }
    });

    // TODO move this to a string and make it look prettier
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
        // if active is true, then we're opening an accordion
        // thus save which one it is
        let active = this.classList.contains("ui-state-active");
        console.log(this);

        if (active) {
            let hrefId = getHrefId( window.location.href );
            window.localStorage.setItem(hrefId, this.id);
        }

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
    start = parseInt(start, 10) - 1;
    if ((!Number.isInteger(start)) || (start > numAccordions - 1)) {
        start = 0;
        end = 1;

        if ( params.scrollTo){ 
            openWhereYouLeftOff();
        }
    } else {
        end = start + 1;
    }
    // want all expanded, figure out num accordions and set end appropriately
    if (params.expandAll === true) {
        start = 0;
        end = jQuery('#GU_ContentInterface h1').length;
    } else if (params.collapseAll === true) {
        start = 0;
        end = 0;
    } else if (params.expand > 0) {
        if (params.expand < jQuery('#GU_ContentInterface h1').length) {
            start = params.expand - 1;
            end = start + 1;
        } else {
            console.log("ERROR - expand value (" + params.expand + ") larger than number of heading 1s ");
        }
    }

    //jQuery("#globalNavPageNavArea").scrollTop(0);
    if (params.scrollTo) {
        jQuery('.accordion_top').slice(start, end).accordion("option", "active", 0);
    }
    //if ( start === 0 && end === 1) {
    //}

    // Remove the Content Interface from the vtbegenerated div so that
    // Bb CSS doesn't override embedded Card CSS
    var journey = jQuery(contentInterface).parent().next('div.details').children('.vtbegenerated');
    var child = jQuery(journey).children("#html");
    jQuery(child).unwrap();
}


/************************************************************************
 * getHrefId( href )
 * Given a URL extract the blackboard course and content id and combine
 * them into an id (concatentate with a _)
 * Return that id.
 * Return href
 */

 function getHrefId( href ) {
    let courseId,contentId;
    // get the courseId
    m = href.match(/^.*course_id=(_[0-9_]+).*$/);
    if ( ! m ){
        return href;
    }
    courseId = m[1];
    // get the contentId
    m = href.match(/^.*content_id=(_[0-9_]+).*$/);
    if ( ! m ){
        return href;
    }
    contentId = m[1];

    return courseId + "/" + contentId;
 }

/*********************************************************
 * openWhereYouLeftOff()
 * - check local storage, if we've been here before open the
 *   accordion that was open last time
 */

function openWhereYouLeftOff() {
    // Check to see if 
    let hrefId = getHrefId( window.location.href );
    let storageStart = window.localStorage.getItem(hrefId);
    if (typeof storageStart !== 'undefined') {
        // want to find the H1 or H2 that has the id in m[1]
        let heading = jQuery("h1#" + storageStart + ",h2#" + storageStart);
        // do we need to do something different for h2?
        // Maybe open the h1 element and then the h2 element?
        // but then we want to find the something or other that wraps it
        if (heading.length === 1) {
            let accord;
            let tagName = heading[0].tagName;

            if (tagName === 'H1') {
                accord = jQuery(heading[0]).parent();
                jQuery(accord).accordion("option", "active", 0);
            } else {
                // if H2, then open the H1 accordion 
                let p1 = jQuery(heading).parents("div.accordion_top"); // the top level DIV for h1
                jQuery(p1).accordion("option", "active", 0);
                // now open the H2 accordion
                let accordP = jQuery(heading).parent();
                jQuery(accordP).accordion("option", "active", 0);
            }
        }
    }
}


//********************************************* */
// handle footnotes
// - find each footnote reference and replace with a tooltipster element
//   that incldues content from the actual footnote (minus some extra HTML)

function handleFootNotes() {
    const footnote_re = /<a href="#footnote-ref-[0-9]*">.<\/a>/g;
    var footnotes = jQuery('#GU_ContentInterface a[id^="footnote-ref-"');
    var firstFootNote = '';

    footnotes.each(function () {
        // get the <sup> item wrapped around footnote
        var supItem = jQuery(this).parent();

        // get the id for the footnote content (at end of doc)
        //  footnote-ref-??  becomes
        //  footnote-??
        var footnoteId = jQuery(this).attr("id");
        var footnote = "li# " + footnoteId.replace('-ref', '');
        footnote = footnote.replace(' ', '');
        footnoteContent = jQuery(footnote).html();

        if (firstFootNote === '') {
            firstFootNote = footnote;
        }

        // need to remove the return link to the footnote in footnoteContent
        var footnoteContent = footnoteContent.replace(footnote_re, '');

        // need to remove the link on the footnote reference
        var refHtml = jQuery(this).html();
        jQuery(this).remove("a");
        jQuery(supItem).html(refHtml);

        // set the attributes for tooltipster to work
        supItem.attr('footNoteId', footnoteId);
        supItem.attr('class', 'ci-tooltip');
        supItem.attr('data-tooltip-content', footnoteContent);
    });

    // if there were footnotes, then
    if (footnotes.length) {
        // add a <h3>Footnotes</h3> heading just before the list of footnote content
        var footNoteList = jQuery(firstFootNote).parent();
        jQuery(footNoteList).before("<h1>Footnotes</h1>");
        //remove the return anchor TODO replace it with something that works
        var footNoteListHtml = jQuery(footNoteList).html().replace(footnote_re, '');

        jQuery(footNoteList).html(footNoteListHtml);

        // add tooltipster if there are footnotes
        jQuery("head").append(
            "<link id='tooltipstercss' href='https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/css/tooltipster.bundle.min.css' type='text/css' rel='stylesheet' />");
        jQuery.getScript(
            //"https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/js/tooltipster.bundle.js",
            "https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/js/tooltipster.bundle.min.js",
            function () {
                docWidth = Math.floor(jQuery(document).width() / 2);
                jQuery('.ci-tooltip').tooltipster({ 'maxWidth': docWidth });
            });
    }
}

/***************************************************
 * setUpEdit
 * - Set up the edit/update process
 */

var HOW_TO = "";

const DOCUMENTATION_LINKS = {
    // Getting started
    'whatWhy': 'https://djplaner.github.io/Content-Interface-Tweak/background/whatWhy/',
    'setUp': 'https://djplaner.github.io/Content-Interface-Tweak/using/setup/',
    'createModify': 'https://djplaner.github.io/Content-Interface-Tweak/using/createAndModify/',
    // create text
    'createText': 'https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/',
    'normalText': 'https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#normal-and-the-default-text-style',
    'headings': 'https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#headings-and-the-accordion-heading-1-style',
    'tables': 'https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#tables',
    'quotes': 'https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#quotes',
    'referenceLists': 'https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#bibliographyreference-lists',
    'footnotes': 'https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#footnotes',

    // create web content
    'createWeb': 'https://djplaner.github.io/Content-Interface-Tweak/creating/webContent/',
    'images': 'https://djplaner.github.io/Content-Interface-Tweak/creating/webContent/#images',
    'links': 'https://djplaner.github.io/Content-Interface-Tweak/creating/webContent/#links',
    'embeds': 'https://djplaner.github.io/Content-Interface-Tweak/creating/webContent/#embedding-youtube-videos-and-beyond',

    // create university content
    'createUniversity': 'https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/',
    'activities': 'https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#activities',
    'notes': 'https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#notes',
    'readings': 'https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#readings',
    'universityDates': 'https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#university-dates',
    'filmWatching': 'https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#film-watch-options',

    // create/use Blackboard content
    'createBlackboard': 'https://djplaner.github.io/Content-Interface-Tweak/creating/blackboardContent/',
    'menuItem': 'https://djplaner.github.io/Content-Interface-Tweak/creating/blackboardContent/#indirect-link-to-a-menu-item-blackboard-menu-link',
    'contentItem': 'https://djplaner.github.io/Content-Interface-Tweak/creating/blackboardContent/#indirect-link-to-content-item-blackboard-content-link',
    'reviewStatus': 'https://djplaner.github.io/Content-Interface-Tweak/creating/blackboardContent/#integrating-the-blackboard-review-status-feature',
    'adaptiveRelease': 'https://djplaner.github.io/Content-Interface-Tweak/creating/blackboardContent/#using-the-adaptive-release-function',

    // customise
    'accordionOpen': 'https://djplaner.github.io/Content-Interface-Tweak/customising/accordionOpening/',
    'accordionAppearance': 'https://djplaner.github.io/Content-Interface-Tweak/customising/accordionAppearance/',
    'contentAppearance': 'https://djplaner.github.io/Content-Interface-Tweak/customising/contentAppearance/'
};

/*const BLACKBOARD_DOCUMENTATION_LINKS = {
    // Getting started
    'whatWhy': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578504_1',
    'setUp': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578507_1',
    'createModify': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578508_1',
    // create text
    'createText': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1',
    'normalText': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#2',
    'headings': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#3',
    'tables': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#4',
    'quotes': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#5',
    'referenceLists': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#6',
    'footnotes': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578509_1#7',

    // create web content
    'createWeb': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578512_1',
    'images': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578512_1#2',
    'links': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578512_1#3',
    'embeds': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578512_1#4',

    // create university content
    'createUniversity': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#2',
    'activities': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#2',
    'notes': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#3',
    'readings': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#4',
    'universityDates': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#5',
    'filmWatching': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578513_1#6',

    // create/use Blackboard content
    'createBlackboard': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578514_1#2',
    'menuItem': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578514_1#2',
    'contentItem': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578514_1&mode=reset#3',
    'reviewStatus': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578514_1&mode=reset#4',
    'adaptiveRelease': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578514_1&mode=reset#5',

    // customise
    'accordionOpen': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?content_id=_5578515_1&course_id=_82534_1',
    'accordionAppearance': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578516_1',
    'contentAppearance': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_82534_1&content_id=_5578519_1'
}*/


var UPDATE_HTML = () => `
<style>
#gu_nopadding{
    padding-left: 1em;
    margin-top: 0;
}
</style>
  <div class="mx-auto border-none box-content px-4 py-2">
    <div class="flex flex-wrap -mx-1 lg:-mx-4 p-0">

        <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
            <article class="overlow-hidden rounded-lg shadow-lg h-full">
                <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                    <h1 class="text-lg">
                      How to update the content
                    </h1>
                </header>
                <div class="p-2 md:p-4">
                ${HOW_TO}
                </div>
            </article>
        </div>

        <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
            <article class="overlow-hidden rounded-lg shadow-lg h-full">
                <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                    <h1 class="text-lg">
                            <i class="fa fa-exclamation-triangle text-red"></i>
                            No changes to this item
                    </h1>
                </header>
                <div class="p-2 md:p-4">
                    <p>Any changes to this item will stop the Content Interface from working.</p>
                </div>
            </article>
        </div>

        <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
            <article class="overlow-hidden rounded-lg shadow-lg h-full">
                <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                    <h1 class="text-lg">
                            <i class="fa fa-exclamation-triangle text-red"></i>
                            Do not hide this item
                    </h1>
                </header>
                <div class="p-2 md:p-4">
                   <p>If you make this item unavailable to students, the Content Interface will not work for them.</p>
                  <p>This item is only visible when <a href="https://elearn.southampton.ac.uk/blackboard/quickedit/">Edit Mode</a> is on. i.e. typically only visible to teaching staff.</p>
                </div>
            </article>
        </div>

    </div>
</div>

`;


var WORD_DOC_PRESENT = `
 <ol>
   <li> Make any changes to the Content document, either <a id="gu_doc" target="_blank" href="http://griffith.edu.au">online</a> or directly.</li>
   <li>  Click the green button to <button style="background-color: #4CAF50; border: none; color: white; padding: 5px 5px; text-align: center; text-decoration: none; display: inline-block; border-radius: 12px" type="button" id="guUpdate">Update Content Interface</button>  </li>
   </ol>
 `;

var WORD_DOC_NOT_PRESENT = `<ol>
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

<div class="box-content mx-auto border-none h-auto py-0 px-4 m-0">
<div class="flex flex-wrap -mx-1 lg:-mx-4">
    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                        Get started
                </h1>
            </header>
            <div class="p-2 md:p-4">
                <p><a target="_blank" href="${DOCUMENTATION_LINKS.whatWhy}">
                   Content Interface: what and why</a></p>
               <p>How to...</p>
               <ul id="gu_nopadding">
                  <li> <a target="_blank" href="${DOCUMENTATION_LINKS.setUp}">
                        set it up in Blackboard</a> </li>
                  <li> <a target="_blank" href="${DOCUMENTATION_LINKS.createModify}">
                        create and modify content</a> (an overview) </li>
              </ul>

            </div>
        </article>
    </div>

    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                  Create <a href="${DOCUMENTATION_LINKS.createText}">
                    text content</a>
                </h1>
            </header>
            <div class="p-2 md:p-4">
    <ul id="gu_nopadding">
       <li> <a target="_blank" href="${DOCUMENTATION_LINKS.normalText}">
            normal text content</a> 
       </li>
       <li> <a target="_blank" href="${DOCUMENTATION_LINKS.headings}">
            headings</a> 
       </li>
       <li> <a target="_blank" href="${DOCUMENTATION_LINKS.tables}">
            tables</a> 
       </li>
       <li> <a target="_blank" href="${DOCUMENTATION_LINKS.quotes}">
            quotes</a> 
       </li>
       <li> <a target="_blank" href="${DOCUMENTATION_LINKS.referenceLists}">
            reference lists</a> 
       </li>
       <li> <a target="_blank" href="${DOCUMENTATION_LINKS.footnotes}">
            footnotes</a> 
       </li>
    </ul>
            </div>
        </article>
    </div>

    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                 Create <a href="${DOCUMENTATION_LINKS.createWeb}">web content</a>
                </h1>
            </header>
            <div class="p-2 md:p-4">
     <ul id="gu_nopadding">
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.images}">
                 Images
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.links}">
               Links
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.embeds}">
                 Embedding videos and more
            </a>
         </li>
         </li>
      </ul>
            </div>
        </article>
    </div>

    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                 Create University content
                </h1>
            </header>
            <div class="p-2 md:p-4">
     <ul id="gu_nopadding">
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.activities}">
         Activities
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.notes}">
         Notes
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.readings}">
         Readings
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.universityDates}">
         Trimester (university) dates
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.filmWatching}">
         Film Watching Options
            </a>
         </li>
      </ul>
            </div>
        </article>
    </div>

    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                  Use Blackboard items and features
                </h1>
            </header>
            <div class="p-2 md:p-4">
    How do you...   
     <ul id="gu_nopadding">
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.menuItem}">
           link to a Blackboard Menu item
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.contentItem}">
           link to a Blackboard content item
            </a>
         </li>
         <li> 
            use <a target="_blank" href="${DOCUMENTATION_LINKS.reviewStatus}"> 
            review status</a>
         </li>
         <li> 
            use <a target="_blank" href="${DOCUMENTATION_LINKS.adaptiveRelease}"> 
            adaptive release</a>
         </li>
      </ul>
            </div>
        </article>
    </div>


    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h1 class="text-lg">
                 Customise the interface
                </h1>
            </header>
            <div class="p-2 md:p-4">
    How do you customise...   
     <ul id="gu_nopadding">
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.accordionOpen}">
              which accordion opens first
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.accordionAppearance}">
             the accordion theme
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.contentAppearance}">
              appearance of the content
            </a>
         </li>

      </ul>
            </div>
        </article>
    </div>

</div>
</div>

</div> <!-- end gu_ci_instructions -->
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

    m = current.match(/^.*course_id=(_[^&#]*).*$/);
    if (m) {
        courseId = m[1];
    }
    //console.log("course id " + courseId);

    // get the content id
    contentId = jQuery(ci).parent().attr("id");

    // if no content id then change display
    if (typeof contentId === 'undefined') {
        jQuery('#gu_update').html(CONTENT_INTERFACE_NOT_PRESENT);
        return;
    }

    // Has a link  to the word doc been shared
    var path = params.wordDoc;

    if (typeof path === 'undefined') {
        // Word document is not defined
        HOW_TO = WORD_DOC_NOT_PRESENT;
        let html = UPDATE_HTML() + INSTRUCTIONS;

        // add in link to edit the content item
        var editContent = 'into the <a href="https://bblearn-blaed.griffith.edu.au/webapps/blackboard/execute/manageCourseItem?content_id=' + contentId + '&course_id=' + courseId + '&dispatch=edit">Content Interface content item</a>';

        html = html.replace("{EDIT_CONTENT_ITEM}", editContent);

        // console.log("edit content item is " + editContent);
        jQuery('#gu_update').html(html);
        return;
    }

    //jQuery(".gu_docNotPresent").hide();
    HOW_TO = WORD_DOC_PRESENT;
    let updateHtml = UPDATE_HTML() + INSTRUCTIONS;

    if (jQuery('#gu_jqueryStyle').length) {
        updateHtml = updateHtml + CHANGE_TEMPLATE;
    }
    jQuery('#gu_update').html(updateHtml);

    jQuery("#gu_doc").attr("href", path);

    // remove #6 type links from end of path (breaks conversion)
    //console.log( "path was " + path );
    path = path.replace(/#[0-9]*$/, '');
    // console.log( "path is " + path );
    // encode path ready for going via URLs
    path = "u!" + btoa(path).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');



    //---------------------------------------------------
    // Set up the click event for the submit button
    // get the courseId


    jQuery("#guUpdate").click(function (event) {

        // if href currently includes blaed then add parameter
        var blaed = '';
        var link = window.location.href;
        if (link.match(BLAED_LINK) !== null) {
            blaed = "&blaed=1";
        }
        window.location.href = "https://djon.es/gu/mammoth.js/browser-demo/oneDriveMammoth.html?course=" + courseId + blaed + "&content=" + contentId + "&path=" + path;
    });

    jQuery("#styleSelector").on("change", function () {
        jQuery("#gu_jqueryStyle").attr("href", this.value);
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

function checkParams(contentInterface, wordDoc) {
    var paramsObj = {};
    paramsObj.expand = -1;

    paramsObj.scrollTo = true;
    paramsObj.cssURL = DEFAULT_CSS;

    // Check parameters in the Content Interface item title
    if (contentInterface.length > 0) {
        var contentInterfaceTitle = jQuery.trim(contentInterface.text());

        var m = contentInterfaceTitle.match(/content interface\s*([^<]+)/i);

        if (m) {
            //params = m[1].match(/\S+/g);
            params = parse_parameters(m[1]);
            if (params) {
                params.forEach(function (element) {
                    if (element.match(/nofirstscroll/i)) {
                        paramsObj.scrollTo = false;
                    }
                    if (element.match(/expandall/i)) {
                        paramsObj.expandAll = true;
                    }
                    if (element.match(/collapseall/i)) {
                        //console.log("Collapse all");
                        paramsObj.collapseAll = true;
                    }
                    if (element.match(/noaccordion/i)) {
                        paramsObj.noAccordion = true;
                    }
                    /*if ( x = element.match(/wordDoc=([^ ]*)/i) ) {
                        paramsObj.wordDoc = x[1];
                    }*/
                    x = element.match(/expand=([0-9]*)/i);
                    if (x) {
                        paramsObj.expand = x[1];
                    }
                    m = element.match(/^reviewed=(.*)/ui);
                    if (m ) {
                        REVIEWED = m[1];
                    }
                    m = element.match(/^markReviewed=(.*)/i);
                    if (m ) {
                        MARK_REVIEWED = m[1];
                    } else {
                        x = element.match(/^([^=]*)=(.*)/);
                        if (x) {
                            paramsObj[x[1]] = x[2];
                        }
                    }
                    /*                     if ( x = element.match(/css=([^ ]*)/ )) {
                                            cssURL=x[1];
                                         }*/
                });
            }
        }
    }

    /********** 
     * * check other content items for other parameters that are Content Items
* - Only look for those defined in global ITEM_LINK_PARAMETERS 
* - Looking for the link associated with item, what they are pointing to
* - ITEM_PARAMS defines
*   - key - is the expected title of the Blackboard item
*   - element - define attribute name to add to paramsObj to contain jQuery element 
*              to find in the Blackboard item
*   - item - define pramsObj attribute name for the actual value 
*/

    for (var paramKey in ITEM_LINK_PARAMETERS) {
        const obj = ITEM_LINK_PARAMETERS[paramKey];
        
        /*if ( paramKey in paramsObj ) {
            continue;
        }*/

        // element is the h3 wrapped around the link
        element = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find(
            ".item h3").filter(':contains("' + paramKey + '")').eq(0);
        // only if it's found
        if (element.length > 0) {
            paramsObj[obj.element] = element;
            paramsObj[obj.item] = jQuery(paramsObj[obj.element]).children("a").attr('href');
        }
    }

    //     addCSS( cssURL );
    // Check for a Word doc link
    //var wordDoc = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find(".item h3").filter(':contains("Content Document")').eq(0);

    var wordDocLink = jQuery(wordDoc).find("a:contains('Content Document')").attr('href');

    if (typeof wordDocLink !== 'undefined') {
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
    var listOfCardBunches = [];

    // Get list of all cards
    var cardElements = jQuery("div.bbCard");
    var numCards = cardElements.length, currentCard = 0;
    if (numCards === 0) {
        return false;
    }

    // Create bunches from cards that are sequential and add them
    // to the list of bunches
    while (currentCard < numCards) {
        // hold the current bunch of cards 
        var currentBunch = [];
        // Create one bunch
        while (currentCard < numCards) {
            // Get data about the card element
            // - originalHTMLElement is from Mammoth output
            // - bbItem is the matching Blackboard Item from which the
            //   card information will be extracted
            var cardObject = {};
            cardObject.originalHTMLElement = cardElements[currentCard];
            // Find the Bb Item matching this cardElement
            cardObject.bbItem = getCardBbItem(cardObject.originalHTMLElement);
            // Add this card to the current bunch and start to move onto the 
            // next card
            currentBunch.push(cardObject);
            currentCard += 1;

            // If the next HTML element for the card that was just added to 
            // the bunch is NOT another card.  Then the bunch has ended
            // get out of the loop and start again
            if (! jQuery(cardElements[currentCard - 1]).next().is("div.bbCard")) {
                //      console.log("  ---- bunch ends");
                break;
            }
        }
        //console.log( "New bunch added - currentCard " + currentCard);
        // save the current bunch
        listOfCardBunches.push(currentBunch);
    }

    //--------------- replace the cardBunch elements with card HTML
    // - Can add a card if cardObject.bbItem != undefined
    // - If undefined, that indicates that couldn't find a matching
    //   bbItem, should display something appropriately

    // In essence, this will be a mini card interface

    // initial  module_num for all cards at the start to have
    // consistent numbering across all bunches
    MODULE_NUM = 1;
    listOfCardBunches.forEach(createBunchesCards);
}

/*-----------------------------------------------------
 * createBunchesCards
 * - iterating through a list of bunches, give a list of
     cardObjects with elements
     - originalHTMLElement - where the card interface will go
       Actually if replaces each of the elements
     - bbItem - the Blackboard item with card information
 */

function createBunchesCards(bunch, index, arr) {

    var bbItems = [];


    // create an array of bBitems for this bunch
    for (i = 0; i < bunch.length; i++) {
        // hide the HTML element
        jQuery(bunch[i].originalHTMLElement).hide();
        // hide those bbItems from display
        // bbItem points to the h3 title for the item. Hide li element
        // that is bbItem's grandparent
        if (location.href.indexOf(tweak_bb_active_url_pattern) > 0) {
            jQuery(bunch[i].bbItem).parent().parent().hide();
        }

        // add the bbItem
        bbItems.push(bunch[i].bbItem);
    }
    /*console.log("bbitems");
    console.log(bbItems);*/

    // extract the card information from the array of bbitems
    // Will have to handle the undefined items

    //console.log("Starting extract cards");
    var cards = extractCardsFromContent(bbItems);

    /*console.log( cards );
    console.log("done extract cards");*/

    // add the cards to the originalHTMLElement
    // Will have to handle the undefine items

    // location to insert the cards, just before the first element in 
    // this bunch (all the elements should be hidden)
    place = jQuery(bunch[0].originalHTMLElement).before();
    addCardInterface(cards, place);

    /** ------ cards should be created by now -- */
    /* But make all the links in carddescription stop propagation */
    var cardContent = jQuery(".carddescription [href]").not(".gu-engage");

    for (var i = 0; i < cardContent.length; i++) {
        cardContent[i].addEventListener('click', function (e) {
            // aim here is to allow internal links to override the 
            // cardmainlink
            e.stopPropagation();
        }, false);
    }

    /* Make all of the cards clickable by adding an event handler  */
    // Does this unwrap actually do anything???
    //jQuery( ".cardmainlink[href='undefined'" ).contents().unwrap();
    //return true;
    cards = document.querySelectorAll(".clickablecard");
    //var cards = document.querySelectorAll(".cardmainlink");
    for (i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function () {
            var link = this.querySelector(".cardmainlink");

            if (link !== null) {
                // prevent clicking on a undefined blackboard link
                if (link.match(/blackboard\/content\/undefined$/)) {
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

function getCardBbItem(element) {

    var title = jQuery(element).text().trim();
    //console.log( "--- element text is " + title );

    /* Find the matching Blackboard element heading (h3) */
    var bbItem = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find("h3:textEquals(" + title + ")");

    if (bbItem.length === 0) {
        //console.log("  -- Didn't find match");
        return undefined;
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
    title = jQuery(this).text();

    // define pseudo function to do comparison to get exact match, but
    // case insensitive


    /* Find the matching Blackboard element heading (h3) */
    // Ignore any within the Content Interface
    var bbItem = jQuery("h3:textEquals(" + title + ")").filter(function () {
        parent = jQuery(this).parents('#GU_ContentInterface');
        return parent.length === 0;
    });

    /*console.log(" -- Looked for **" + title + "** and found " + bbItem.length);
    console.log(bbItem);*/

    if (bbItem.length === 0) {
        // add the hidden_string to the heading
        linkText = jQuery(this).text();
        jQuery(this).text(linkText + hidden_string);

        // add the hidden_string to the link
        jQuery(this).nextUntil(this.tagName).find(".blackboardLink").each(function () {
            linkText = jQuery(this).text();
            jQuery(this).text(linkText + hidden_string);
        });
    } else if (bbItem.length > 1) {
        console.log("Error found more than 1 (" + bbItem.length + ") entries matching " + title);
    } else if (bbItem.length === 1) {

        //**** Handle review status
        /*console.log("Handle review status");
        console.log(bbItem);*/
        reviewLink = getReviewStatusContent(bbItem);
        //console.log("title " + title + " review link is " + reviewLink);
        if (typeof reviewLink !== "undefined") {
            //-- update the title
            addReviewLink(this, reviewLink);

            //-- add the button to the content
            // - need to find content body

        }


        //**** Handle the insertion of the item link where appropriate
        // get the link
        var link = jQuery(bbItem).children("a").attr('href');

        // if there's no link, then check to see if it's TurnitIn
        // (which puts the link in the body)
        if (link == null) {
            // Assume it's a TurnitIn and look for "View Assignment" link
            // Have to go up to the parent and onto the next div
            link = jQuery(bbItem).parent().next().children(".vtbegenerated").children("a");
            var text = link.text();
            if (text === 'View Assignment') {
                // we've found a Safe Assignment link
                link = link.attr('href');
            }
        }

        // check to see if the item is actually hidden
        hidden = jQuery(bbItem).parent().next().find('.contextItemDetailsHeaders').filter(":contains('Item is hidden from students.')");
        loc = location.href.indexOf("listContent.jsp");
        if (hidden.length === 1) {
            // add the hidden_string to the heading
            linkText = jQuery(this).text();
            jQuery(this).text(linkText + hidden_string);
            // add the hidden_string to the end of each .blackboardlink     
            jQuery(this).nextUntil(this.tagName).find(".blackboardLink").each(function () {
                linkText = jQuery(this).text();
                jQuery(this).text(linkText + hidden_string);
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
        jQuery(this).nextUntil(this.tagName).find(".blackboardLink").each(function () {
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

function addReviewLink(item, reviewLink) {

    linkText = jQuery(item).text();

    // Add text to the heading
    //var MARK_REVIEWED = "Mark Reviewed"
    //var REVIEWED = "Reviewed";

    var reviewHeadingTemplate = '';
    if (reviewLink.match(/markUnreviewed/)) {

        reviewHeadingTemplate = `
      <span style="float:right" class="ui-state-disabled ui-corner-all">{TEXT}</span>
      `;
        reviewHeadingTemplate = reviewHeadingTemplate.replace('{TEXT}', REVIEWED);
    } else {
        reviewHeadingTemplate = `
          <span style="float:right" class="ui-state-active ui-corner-all">{TEXT}</span>
          `;
        reviewHeadingTemplate = reviewHeadingTemplate.replace('{TEXT}', MARK_REVIEWED);
    }
    jQuery(item).html(linkText + reviewHeadingTemplate);

    // change the body"
    content = jQuery(item).next();

    reviewBodyTemplate = '';

    if (reviewLink.match(/markUnreviewed/)) {
        reviewBodyTemplate = `
          <!--<div class="p-4 absolute pin-l" style="float:right">-->
 <div class="p-4" style="margin:auto; width:100%; text-align:right">
     <a class="gu-bb-review" href="{LINK}"><button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
                     <span class="font-bold rounded-full px-2 py-1 bg-green text-white">&#10003; {TEXT}</span>&nbsp;</button></a>
 </div>
 `;
        reviewBodyTemplate = reviewBodyTemplate.replace('{TEXT}', REVIEWED);
    } else {

        reviewBodyTemplate = `
 <div class="p-4" style="margin:auto; width:100%; text-align:right"> 
      <a class="gu-bb-review" href="{LINK}"><button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
      <span class="font-bold rounded-full px-2 py-1 bg-yellow text-black">&#x26a0;</span>&nbsp; {TEXT}</button></a>
 </div>
         `;
        reviewBodyTemplate = reviewBodyTemplate.replace('{TEXT}', MARK_REVIEWED);
    }
    reviewBodyTemplate = reviewBodyTemplate.replace('{LINK}', reviewLink);
    // insert the reviewed button before the first item after the heading
    jQuery(content).before(reviewBodyTemplate);

}
//-----------------------------------------------------------------
// getReviewStatusContent
// - given the h3 item (header) from Bb Item, check to see if the
//   parent div contains a review status element (anchor with class
//   button-5)
// - if not return NULL
// - if there is one return the link (which indicates with it's
//   mark reviewed, or reviewed)

function getReviewStatusContent(header) {
    // get the details div for this header that should contain the
    // mark reviewed link
    var details = jQuery(header).parent().parent().find("div.details");
    //console.log(details);

    // check to see if it has the anchor with class button-5
    review = jQuery(details).find("a.button-5");

    if (review.length === 0) {
        return undefined;
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

    if (typeof title === 'undefined') {
        title = jQuery(this).find("a").first().attr('href');
        inner = true;
    }

    if (typeof title !== 'undefined') {
        title = title.replace(/%20/g, " ");
    }

    // define pseudo function to do comparison to get exact match, but
    // case insensitive
    jQuery.expr[':'].textEquals = jQuery.expr[':'].textEquals || jQuery.expr.createPseudo(function (arg) {
        return function (elem) {
            return elem.textContent.trim().localeCompare(arg, undefined, {
                sensitivity: 'base'
            }) === 0;
        };
    });

    /* Find the matching Blackboard element heading (h3) */
    var bbItem = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find("h3:textEquals(" + title + ")");

    /*console.log("Looking for content link title " + title + " found " + bbItem.length);
    console.log(jQuery(this).html());
    console.log(bbItem);*/

    if (bbItem.length === 0) {
        // not found, so add hidden_string
        spanText = jQuery(this).text();
        jQuery(this).text(spanText + hidden_string);
    } else if (bbItem.length > 1) {
        console.log("Error found more than 1 (" + bbItem.length + ") entries matching " + title);
    } else if (bbItem.length === 1) {
        // get the link
        var link = jQuery(bbItem).children("a").attr('href');


        // if there's no link, then check to see if it's TurnitIn
        // (which puts the link in the body)
        if (link == null) {
            // Assume it's a TurnitIn and look for "View Assignment" link
            // Have to go up to the parent and onto the next div
            link = jQuery(bbItem).parent().next().children(".vtbegenerated").children("a");
            var text = link.text();
            if (text === 'View Assignment') {
                // we've found a Safe Assignment link
                link = link.attr('href');
            }
        }

        // check to see if the item is actually hidden
        hidden = jQuery(bbItem).parent().next().find('.contextItemDetailsHeaders').filter(":contains('Item is hidden from students.')");
        loc = location.href.indexOf("listContent.jsp");
        if (hidden.length === 1) {
            // add the hidden_string to the heading
            linkText = jQuery(this).text();
            jQuery(this).text(linkText + hidden_string);
            // add the hidden_string to the end of each .blackboardlink     
            return true;
        } else if (location.href.indexOf("listContent.jsp") > 0) {
            jQuery(bbItem).parent().parent().hide();
        }

        if (!inner) {
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
    var duplicate_menu_string = " (more than 1 menu item with same name) ";

    // the title is the value of the link associated with the item
    // Either parent or child
    var linkParent = true;
    title = jQuery(this).parent().attr('href');
    if (typeof title === 'undefined') {
        linkParent = false;
        title = jQuery(this).children("a").first().attr('href');
    }

    if (typeof title !== 'undefined') {
        title = title.replace(/%20/g, " ");
    }
    /* Find the course menu link that matches */
    var bbItem = jQuery("#courseMenuPalette_contents > li > a > span[title='" + title + "']");

    // how many did we find?
    if (bbItem.length === 0) {
        // not found, so add hidden_string
        spanText = jQuery(this).text();
        jQuery(this).text(spanText + hidden_string);
    } else if (bbItem.length > 1) {
        console.log("Error found more than 1 (" + bbItem.length + ") entries matching " + title);
        spanText = jQuery(this).text();
        jQuery(this).text(spanText + duplicate_menu_string);
    } else if (bbItem.length === 1) {
        // get the link from the menu item
        var link = jQuery(bbItem).parent().attr('href');
        // check to see if the course menu item is actually hidden
        hidden = jQuery(bbItem).next().attr("class");
        if (hidden === "cmLink-hidden") {
            // add the hidden_string to the heading
            linkText = jQuery(this).text();
            jQuery(this).text(linkText + hidden_string);
            // add the hidden_string to the end of each .blackboardlink     
            return true;
        }

        // change the link, depending on if we've a parent or child
        if (linkParent) {
            jQuery(this).parent().attr('href', link);
        } else {
            jQuery(this).children("a").first().attr('href', link);
        }


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

    if (videos.length === 0) {
        return false;
    }

    videos.each(function (idx) {
        var text = jQuery(this).text();
        //  console.log(idx + " -- " + text);

        var matches = text.match(/x/);
        var id = matches[1], width = '640', height = '480';

        //console.log('Match 0 ' + matches[0] + " 1 " + matches[1]);
        text = '<div class="youtube-article">' +
            '<iframe class="dt-youtube" width="' + width +
            '" height="' + height + '" src="https://www.youtube.com/embed/' +
            id + '" frameborder="0" allowfullscreen></iframe></div>';

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


//---******************************************************--


/**
 * @function extractCardMetaData
 * @param {jQuery} descriptionObject contain content of Blackboard content item
 * @returns {Object} Each field has a meta data value extracted from descriptionObject
 * 
 * Assumes description is broken in <p> but checks with.
 */


const CARD_METADATA_FIELDS = [
    "card label", "card number",
    "card date", "card date label",
    "card coming soon", "card coming soon label",
    "assessment type", "assessment weighting", "assessment outcomes",
    "card image", "card image iframe", "card image size", "card image active"
];


function extractCardMetaData( descriptionObject ) {
    // define hash to put values into it
    let metaDataValues = {};
    let description = jQuery(descriptionObject).html();
    // remove new lines from description
    description = description.replace(/(?:\r\n|\r|\n)/g, ' ');

    // break up description into collection of ps and focus
    // use outerHTML to get the surrounding <p> etc so that it can be removed from
    // the description
    // TODO: Does this change screw up the complex shit that other people can
    //  do when they use line breaks, include HTML etc
    let elementHtmlObjects = jQuery(descriptionObject).find("p");
    let elementContent = jQuery(elementHtmlObjects).toArray().map( x => x.innerHTML);

    let tmpMetaData = [];

    //console.log("----------------------- extractCardMetaData");
    // check and break up the ps into individual bits of meta data
    let maxLength = elementContent.length;
    for ( i=0; i<maxLength; i++) {
 //       console.log(`    _____________ working on para ${i} == ${elementContent[i]}`);
        // work on a temp copy of description
        //let partialDescription = elementContent[i].innerHTML;
        let partialDescription = elementContent[i];
        // get rid of newlines (definitely needed)
        partialDescription = partialDescription.replace(/(?:\r\n|\r|\n)/g, ' ');

        CARD_METADATA_FIELDS.forEach( function(element) {
            // search for the element, but initially assume that there is another
            // metadata variable within the current item (i.e. <p> </p>)
            // This happens when a <br> is used, rather than <p> between metadata
            // look for element, followed by a card metadata
            let re = new RegExp( "(" + element + "\\s*:\\s*.*)card\s+(?:label|number|date|date label|image size|image active)[^:]*:", "mi" );
            let m = partialDescription.match(re);
            // if not, check for assessment
            if (!m) {
                re = new RegExp( "(" + element + "\\s*:\\s*.*)assessment\s+(?:type|weighting|outcomes)[^:]*:", "mi" );
                m = partialDescription.match(re);
            }

            // if found, then we need extract just the matched element, leaving
            // the rest for a later iteration
            if (m) {
  //              console.log(`     -- found partial Descripiton match ${m[1]}`);
                // remove match from partialDescription, leaving any other potential
                // card stuff there for later (hence why m[1], not m[0])
                partialDescription = partialDescription.replace(m[1],'');
                // remove the match from the broader description 
                //description = description.replace(m[1],'');
                // TODO does raise the question of why m[0] okay here 
                description = description.replace(m[1],'');
                // added element for later processing - but remove the &nbsp;
                tmpMetaData.push(m[1].replace(/&nbsp;/gi, " "));
            } else {
                // the <p> contains just the one metadata, replace the whole para
                // bad at RE, so check if it's the last one
   //             console.log("     -- bad RE???");
                re = new RegExp( "(" + element + "\\s*:\\s*.*)", "mi" );
//                re = new RegExp( "<p.*(" + element + "\\s*:\\s*.*)</p>$", "mi" );
                m = partialDescription.match(re);
                if (m) {
                    // remove it from partial description
                    //partialDescription = partialDescription.replace(re,'');
                    partialDescription = partialDescription.replace(m[1],'');
                    // remove the match from the broader description 
                    // TODO doesn't remove the surrounding <p> </p>
//                    description = description.replace(m[1],'');
                    description = description.replace(m[1],'');
                    // added element for later processing - but remove any &nbsp;
                    tmpMetaData.push(m[1].replace(/&nbsp;/gi, " "));
                } else {
                    //console.log(`      Search for ${element} no match`);
                }
            }

        });
    }

//    console.log("---------------------- Finished parsing Ps");
 //   console.log(tmpMetaData);
    // At this stage tmpMetaData contains "html" for each card meta data
    // format should be "card label: value"
    // Loop thru each tmpMetaData element and extract value appropriately
    //  place in an object label -> value
    for (i=0; i<tmpMetaData.length; i++) {
        // extract the metaData label m[1] and value m[2]
        let re = new RegExp( "\\s*(card\\s*[^:]*)\\s*:\\s*(.*)", "im" );
        let m = tmpMetaData[i].match( re, "im");

        // didn't find a card value, try one of the assessment ones
        if (!m) { 
            re = new RegExp( "\\s*(assessment\\s*[^:]*)\\s*:\\s*(.*)", "im" );
            m = tmpMetaData[i].match( re, "im");
        }

        if (m) {
            // extract label and value
            // ensure label matches METADATA name archetypes
            let label = m[1].trim().replace(/\\s*/, ' ').toLowerCase();
            let value = m[2];
            // make sure the HTML in value is valid
            let div = document.createElement('div');
            div.innerHTML=value;
            let newValue = div.innerHTML;

            metaDataValues[label] = newValue;
        } else {
        }
    }

    // used to edit the description element and ensure that it is correct HTML
    let div = document.createElement('div');
    div.innerHTML=description;
    // not used in inlineImage (yet)

    // handle the inline image
    let inlineImage = jQuery(descriptionObject).find('img').attr('title', 'Card Image');

    //   Exclude /images/ci/icon/cmlink_generic.gif from img
    if (inlineImage.length && ! inlineImage[0].src.includes(BBIMG)) {
            // we have real image
            // replace the card image value with the inline image
            metaDataValues['card image'] = inlineImage[0].src; 
            // remove the inline image content from the description
            let img = jQuery(div).find(`img[src="${inlineImage[0].src}"]`).remove();
    }

    // there may also be other .contextMenuContainer elements that will need to be removed
    // because Bb needs to do more work, but only does it if they are in .vtbgenerated (which cards are not)
    // there may be other Bb additions that need cleaning
    // e.g. 
    // - TODO spans with attr data-ally-scoreindicator

    // remove the .contextMenuContainers from description
    let menuContainers = jQuery(div).find('.contextMenuContainer').remove(); 

    // Make sure that the description is valid HTML (mostly closing tags)
    // jQuery handles this by default
    description = div.innerHTML;
    // remove any empty <p> tags from desciption
    description = description.replace(/<p>\s*<\/p>/g, '');
    // add the description minus metadata to metaDataValues, for later use
    metaDataValues['description'] = description;

    return metaDataValues;
}

//------------------------------------------------------
// FUNCTIONS to handle card meta data changes

//handleCardImage()
// - given value associated with "card image", could be URL or html

function handleCardImage(param) {
    let picUrl = "", cardBGcolour = "black";
    
    // is it a data URI, just return it
    regex = /^data:((?:\w+\/(?:(?!;).)+)?)((?:;[\w\W]*?[^;])*),(.+)$/;
    if ( regex.test(param)){
        return [ param, cardBGcolour];
    } 
    
    // check to see if it's a colour, rather than an image
    // TODO might need to modify identifyPicUrl to remove extraneous
    // lead html if there is a href?? after img src is checked??
    picUrl = identifyPicUrl(param);
    cardBGcolour = identifyCardBackgroundColour(param);
                
    // TODO/CHECK previously there was a test to remove a trainling </p> from end
    // Maybe this should be handled in the picURL
    
   return [ picUrl.trim(), cardBGcolour];
}

// handleCardImageIframe
// - given the HTML for an iframe, modify any height/width params
//   to be more responsive

function handleCardImageIframe(param) {
    // replace the width and height
    x = param.match(/width="[^"]+"/i);
    if (x) {
        param = param.replace(x[0], 'width="100%"');
    }
    x = param.match(/height="[^"]+"/i);
    if (x) {
        param = param.replace(x[0], 'height="auto"');
    }
    return param;
}

// handleCardImageSize
// - return contain if set

function handleCardImageSize(param) {
    if ( param.includes("contain")  ) {
        return "contain";
    }
    return "";
}
    
//**************************************************
// handleCardDate( description )
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
// - specify a day of the week
//          Card Date: Monday Week 5
//          Card Date: Mon Week 5
// TODO it needs to set year

function handleCardDate(param) {
    let month, endMonth, endDate, week = "", endWeek = "";
    let empty1 = { date: "", week: "" };
    let empty2 = { date: "", week: "" };
    let date = { start: empty1, stop: empty2 }; // object to return 
    // date by griffith week    

    // try to extract week number first
    //m = param.match(/^\s*week\s*([0-9]*)\s*$/i);
    m = param.match(/^\s*week\s*([0-9]*)/i);
    if (m) {
        // check to see if a range was specified
        x = param.match(/\s*week\s*([0-9]*)-([0-9]*)\s*$/i);
        if (x) {
            week = x[1];
            endWeek = x[2];
            date.stop = getTermDate(endWeek, false);
        } else {
            week = m[1];
        }
        date.start = getTermDate(week);
    } else {
        // Handle the day of a semester week 
        // start date becomes start of week + number of days in
        m = param.match(
            /^\s*\b(((mon|tues|wed(nes)?|thur(s)?|fri|sat(ur)?|sun)(day)?))\b\s*week *([0-9]*)\s*$/i);
        if (m) {
            day = m[1];
            week = m[m.length - 1];
            date.start = getTermDate(week, true, day);
        } else {
            // TODO need to handle range here 
            m = param.match(/ *([a-z]+) ([0-9]+)/i);
            if (m) {
                x = param.match(/ *([a-z]+) ([0-9]+)-+([a-z]+) ([0-9]+)/i);
                // TODO is this where DEFAULT_YEAR might need to be incremented??
                // Or do that originally 
                if (x) {
                    date.start = { month: x[1], date: x[2], year: DEFAULT_YEAR };
                    date.stop = { month: x[3], date: x[4], year: DEFAULT_YEAR };
                } else {
                    date.start = { month: m[1], date: m[2], year: DEFAULT_YEAR };
                }
            } else {
                // Fall back to check for exam period
                m = param.match(/ *exam *(period)*/i);
                if (m) {
                    date.start = getTermDate('exam');
                    date.stop = getTermDate('exam', false);
                }
            }
        }
    }
    return date;
}                

// Given some HTML, remove all the HTML code, trim and return the text

function cleanTrimHtml(html) {
    const aux = document.createElement('div');
    aux.innerHTML = html;
    return aux.innerText.trim();
}
// handleCardLabelNumber
// - given hash with last number for each label type and label and number
//   return the appropriate [ label, number] to use for the card
// - label is the label specified for the card, 
//   - if nothing, default to module
// - number specify card number, 
//   - if nothing & nothing in numbering element set to 1, 
//   - else set to the next value from numbering element
// Labels can only ever be text


// storage for the multiple label numberings used across all cards
var CARD_LABEL_NUMBERING = {};
   
function handleCardLabelNumber(label,number) {
    // Handle the cases where label is
    // - empty - we don't want a label
    // - undefined - we want the default label
    
    // ensure label is empty HTML (incl &nbsp; as empty)
    trimLabel = cleanTrimHtml(label);    
    
    if (trimLabel==="") {
        // return no label or number if the label is empty (but defined)
        return [ "", ""];
    } else if (typeof(number)!=="undefined" && number.match( /none/i )) { 
        // if there is a card number and it is the word "none", then
        // return the label and an empty number
        // TODO, should this be label of trimLabel. i.e allow user defined
        // html to be included as part of the label?
        return [ label, ""];
    } else if ( typeof(label)==="undefined") {
        // set the label to the DEFAULT if no label specified
        // numbering gets decided below. 
        trimLabel=DEFAULT_CARD_LABEL;
        label=DEFAULT_CARD_LABEL;
    }
    
    // Update the numbering schemes
    // - no existing numbering, set to 1
    // - otherwise increment existing
    if ( !(trimLabel in CARD_LABEL_NUMBERING) ) {
        CARD_LABEL_NUMBERING[trimLabel]=1;
    }
    else { // if it does exist increment to next value 
        CARD_LABEL_NUMBERING[trimLabel]+=1;
    }
    
    // if specific number specified, set numbering to that
    if ( typeof(number)!=="undefined") {
        CARD_LABEL_NUMBERING[trimLabel]=parseInt(number);
    }
    
    return [label,CARD_LABEL_NUMBERING[trimLabel]];
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

function extractCardsFromContent(myCards) {

    let items = [];
    // reset card numbering
    //CARD_LABEL_NUMBERING={};
        
    // Loop through each card and construct the items array with card data
    //myCards.each(function (idx) {
    for (let i=0; i<myCards.length; i++) {
        
        jthis = myCards[i]; // cards, h3 of item
        // actually find the div.details item for the h3
        //jthis = jQuery(jthis).parent().parent().find("div.details");
        jthis = jQuery(jthis).parent().parent().find("div.vtbegenerated");
        
        // jQuery(this) - is the vtbgenerated div for a BbItem
        //------- check for any review status element
        // TODO this ain't right.  This is the wrong element, but jthis?
        // What does this actually do?
        review = getReviewStatus(jthis);

        // Parse the description and remove the Card Image data	  
        // vtbegenerated_div is specific to Blackboard.
        // But it also appears to change all <p> with a class to div with 
        // the match class, hence the not[class] selector
        jQuery(jthis).children('div.vtbegenerated_div,div:not([class=""])'
                  ).replaceWith( function(){
                return jQuery("<p />", {html: jQuery(this).html()});
            }
        );
        var description = jQuery(jthis).html();

        // - get rid of any &nbsp; inserted by Bb
        description = description.replace(/&nbsp;/gi, ' ');
        description = description.replace(/\n/gi, '');

        // extract all the possible meta data
        let cardMetaData = extractCardMetaData(jthis);
        
        // now have cardMetaData with all meta data and the non meta data 
        // description. Need to make the necessary changes based on data
        // loop through each of the elements (but not description)
        
        // tmp variables used to hold results before putting into single card object
        let bgSize = "", dateLabel="Commencing", picUrl, cardBGcolour;
        let label = DEFAULT_CARD_LABEL, activePicUrl = "", number="&nbsp;", iframe="";
        let date, comingSoon, comingSoonLabel="Available";
        let assessmentType = "", assessmentWeighting = "", assessmentOutcomes = "";
        
        for ( let index in cardMetaData) {
            switch (index) {
                case "card image": 
                    [picUrl,cardBGcolour]=handleCardImage(cardMetaData[index]);
                    break;
                case "card image active": 
                    activePicUrl=handleCardImage(cardMetaData[index]); 
                    break;
                case "card image iframe": 
                    iframe=handleCardImageIframe(cardMetaData[index]); 
                    break;
                case "card image size": 
                    bgSize=handleCardImageSize(cardMetaData[index]); 
                    break; 
                case "card date": 
                    date=handleCardDate(cardMetaData[index]); 
                    break; 
                case "card date label": 
                    dateLabel=cardMetaData[index]; 
                    break;
                case "card coming soon": 
                    comingSoon=handleCardDate(cardMetaData[index]); 
                    break; 
                case "card coming soon label": 
                    comingSoonLabel=cardMetaData[index]; 
                    break;
                case "assessment type": 
                    assessmentType=cardMetaData[index]; 
                    break; 
                case "assessment weighting": 
                    assessmentWeighting=cardMetaData[index]; 
                    break;
                case "assessment outcomes": 
                    assessmentOutcomes=cardMetaData[index]; 
                    break;
            }
        }
        // handle card label and card number together
        [ label, number ] = handleCardLabelNumber(
                cardMetaData['card label'], cardMetaData['card number']);
                                    
        // description changed to remove all the meta data 
        description = cardMetaData["description"];
       
        // TODO is this still used?
        // Find any ItemDetailsHeaders that indicate the item is hidden
        // TODO would it even work??
        hidden = jQuery(jthis).parent().find('.contextItemDetailsHeaders').filter(":contains('Item is hidden from students.')");
        //.siblings('contextItemDetailsHeaders')

        // Grab the link that the card is pointing to
        // need to get back to the header which is up one div, a sibling, then span
        var header = jQuery(jthis).parent().siblings(".item").find("span")[2];
        //var header = jQuery(jthis).find("span")[2];
        var title = jQuery(header).html(), link, linkTarget = '';
        
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
        if (link === undefined) {
            // check to see if there are attached fileds
            filesThere = jQuery(jthis).parent().find('.contextItemDetailsHeaders').filter(":contains('Attached Files:')");

            if (filesThere !== undefined) {
                // get a list of all attached files
                lis = jQuery(jthis).parent().find('.contextItemDetailsHeaders').children('.detailsValue').children("ul").children("li");

                // loop through the files and get the link
                lis.each(function (idx, li) {
                    // get the link
                    link = jQuery(li).children("a").attr("href");
                });
            }
            //.siblings('contextItemDetailsHeaders')
        }


        // get the itemId to allow for "edit" link in card
        var itemId = jQuery(jthis).parents('.liItem').attr('id');
        //console.log("Item id " + itemId + " for link " + link );
        // Hide the contentItem  TODO Only do this if display page
        var tweak_bb_active_url_pattern = "listContent.jsp";
        if (location.href.indexOf(tweak_bb_active_url_pattern) > 0) {
            // TODO un comment this Reviewed
            jQuery(jthis).parent().parent().hide();
            //console.log( "content item " + contentItem.html());
        }
        // save the item for later
        var item = {
            title: title, picUrl: picUrl, bgSize: bgSize,
            cardBGcolour: cardBGcolour,
            description: description, date: date, label: label,
            link: link, linkTarget: linkTarget,
            review: review,
            dateLabel: dateLabel, id: itemId, activePicUrl: activePicUrl,
            comingSoon: comingSoon, comingSoonLabel: comingSoonLabel,
            assessmentWeighting: assessmentWeighting,
            assessmentOutcomes: assessmentOutcomes,
            assessmentType: assessmentType
        };
        if (number !== 'x') {
            item.moduleNum = number;
        }
        if (iframe !== '') {
            item.iframe = iframe;
        }

        // only add the card to display if
        // - VIEW MODE is on and it's not hidden
        // - EDIT MODE is on 
        if (hidden.length === 0 || LOCATION < 0) {
            // add message that item is hidden to students when EDIT mode on
            if (hidden.length === 1) {
                item.description = item.description.concat(HIDDEN_FROM_STUDENTS);
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

function getReviewStatus(vtbgen) {
    // get parent    
    var parent = jQuery(vtbgen).parent();

    // check to see if it has the anchor with class button-5
    review = jQuery(parent).find("a.button-5");

    if (review.length === 0) {
        return undefined;
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

function handleDate(description) {
    var month, endMonth, endDate, week = "", endWeek = "";
    var empty1 = { date: "", week: "" };
    var empty2 = { date: "", week: "" };
    var date = { start: empty1, stop: empty2 }; // object to return 
    // date by griffith week    

    m = description.match(/card date *: *week ([0-9]*)/i);
    if (m) {
        // check to see if a range was specified
        x = description.match(/card date *: *week ([0-9]*)-([0-9]*)/i);
        if (x) {
            week = x[1];
            endWeek = x[2];
            date.stop = getTermDate(endWeek, false);

            description = description.replace("<p>" + x[0] + "</p>", "");
            description = description.replace(x[0], "");
        } else {
            week = m[1];

            description = description.replace("<p>" + m[0] + "</p>", "");
            description = description.replace(m[0], "");
        }
        date.start = getTermDate(week);
    } else {
        // Handle the day of a semester week 
        // start date becomes start of week + number of days in
        m = description.match(
            /card date: *\b(((mon|tues|wed(nes)?|thur(s)?|fri|sat(ur)?|sun)(day)?))\b *week *([0-9]*)/i);
        if (m) {
            day = m[1];
            week = m[m.length - 1];
            description = description.replace("<p>" + m[0] + "</p>", "");
            description = description.replace(m[0], "");
            date.start = getTermDate(week, true, day);
        } else {
            // TODO need to handle range here 
            m = description.match(/card date *: *([a-z]+) ([0-9]+)/i);
            if (m) {
                x = description.match(/card date *: *([a-z]+) ([0-9]+)-+([a-z]+) ([0-9]+)/i);
                if (x) {

                    date.start = { month: x[1], date: x[2] };
                    date.stop = { month: x[3], date: x[4] };

                    description = description.replace("<p>" + x[0] + "</p>", "");
                    description = description.replace(x[0], "");
                } else {

                    date.start = { month: m[1], date: m[2] };
                    description = description.replace("<p>" + m[0] + "</p>", "");
                    description = description.replace(m[0], "");
                }
            } else {
                // Fall back to check for exam period
                m = description.match(/card date *: *exam *(period)*/i);
                if (m) {
                    date.start = getTermDate('exam');
                    date.stop = getTermDate('exam', false);
                    description = description.replace("<p>" + m[0] + "</p>", "");
                    description = description.replace(m[0], "");
                }
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

function identifyCardBackgroundColour(input) {

    // don't both if it's an empty string or a URL
    url = input.match(/^\s*http/i);
    if (input === "" || url) {
        return undefined;
    }
    var div = document.createElement('div'), m;
    div.style.color = input;
    // add to DOMTree to work
    document.body.appendChild(div);

    // extract the rgb numbers
    m = getComputedStyle(div).color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (m) {
        return "rgb(" + m[1] + "," + m[2] + "," + m[3] + ")";
    }
    return undefined;
}


//**************************************************************
// picUrl = identifyPicUrl( value )
// TODO - return "" if value is not a valid URI
//   Otherwise return the value

function identifyPicUrl(value) {

    return value;
}

//*********************
// getTermDate( week )
// - given a week of Griffith semester return date for the 
//   start of that week
// ** this is a version for cards, works slightly differently

function getTermDate(week, startWeek = true) {
    //console.log("TERM is " + TERM + " week is " + week);
    var date = { date: "", month: "", week: week };
    if ((week < 0) || (week > 15)) {
        if (week !== 'exam') {
            return date;
        }
    }
    var start;
    if (startWeek === true) {
        // setting start week
        if (typeof TERM_DATES[TERM][week] !== 'undefined') {
            start = TERM_DATES[TERM][week].start;//[week].start;
        }
    } else {
        start = TERM_DATES[TERM][week].stop;
    }
    //console.log(" Starting date " + start);
    var d = new Date(start);
    date.month = MONTHS[d.getMonth()];
    date.date = d.getDate();

    return date;
}


var TERM_DATES = {
    
    // OUA 2021 Study Period 1
    "2211": {
        "0": { "start": "2021-02-22", "stop": "2021-02-28" },
        "1": { "start": "2021-03-01", "stop": "2021-03-07" },
        "2": { "start": "2021-03-08", "stop": "2021-03-14" },
        "3": { "start": "2021-03-15", "stCop": "2021-03-21" },
        "4": { "start": "2021-03-22", "stop": "2021-03-28" },
        "5": { "start": "2021-03-29", "stop": "2021-04-04" },
        "6": { "start": "2021-04-05", "stop": "2021-04-11" },
        "7": { "start": "2021-04-12", "stop": "2021-04-18" },
        "8": { "start": "2021-04-19", "stop": "2021-04-25" },
        "9": { "start": "2021-04-26", "stop": "2021-05-02" },
        "10": { "start": "2021-05-03", "stop": "2021-05-09" },
        "11": { "start": "2021-05-10", "stop": "2021-05-16" },
        "12": { "start": "2021-05-17", "stop": "2021-05-23" },
        "13": { "start": "2021-05-24", "stop": "2021-05-30" },
        "14": { "start": "2021-05-31", "stop": "2021-06-06" },
        /* End of study period 4 */
        "exam": { "start": "2021-05-31", "stop": "2021-06-06" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2021 Study Period 2
    "2213": {
        "0": { "start": "2021-05-31", "stop": "2021-06-06" },
        "1": { "start": "2021-06-07", "stop": "2021-06-13" },
        "2": { "start": "2021-06-14", "stop": "2021-06-20" },
        "3": { "start": "2021-06-21", "stop": "2021-06-27" },
        "4": { "start": "2021-06-28", "stop": "2021-07-04" },
        "5": { "start": "2021-07-05", "stop": "2021-07-11" },
        "6": { "start": "2021-07-12", "stop": "2021-07-18" },
        "7": { "start": "2021-07-19", "stop": "2021-07-25" },
        "8": { "start": "2021-07-26", "stop": "2021-08-01" },
        "9": { "start": "2021-08-02", "stop": "2021-08-08" },
        "10": { "start": "2021-08-09", "stop": "2021-08-15" },
        "11": { "start": "2021-08-16", "stop": "2021-08-22" },
        "12": { "start": "2021-08-23", "stop": "2021-08-29" },
        "13": { "start": "2021-08-30", "stop": "2021-09-05" },
        /* End of study period 4 */
        "exam": { "start": "2021-08-30", "stop": "2021-09-05" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2021 Study Period 3
    "2215": {
        "0": { "start": "2021-08-23", "stop": "2021-08-29" },
        "1": { "start": "2021-08-30", "stop": "2021-09-05" },
        "2": { "start": "2021-09-06", "stop": "2021-09-12" },
        "3": { "start": "2021-09-13", "stop": "2021-09-19" },
        "4": { "start": "2021-09-20", "stop": "2021-09-26" },
        "5": { "start": "2021-09-27", "stop": "2021-10-03" },
        "6": { "start": "2021-10-04", "stop": "2021-10-10" },
        "7": { "start": "2021-10-11", "stop": "2021-10-17" },
        "8": { "start": "2021-10-18", "stop": "2021-10-24" },
        "9": { "start": "2021-10-25", "stop": "2021-10-31" },
        "10": { "start": "2021-11-01", "stop": "2021-11-07" },
        "11": { "start": "2021-11-08", "stop": "2021-11-14" },
        "12": { "start": "2021-11-15", "stop": "2021-11-21" },
        "13": { "start": "2021-11-22", "stop": "2021-11-28" },
        "14": { "start": "2021-11-29", "stop": "2021-12-05" },
        /* End of study period 4 */
        "exam": { "start": "2021-11-29", "stop": "2021-12-05" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2021 Study Period 4 
    // TODO Yet to be added
        // Griffith 2021 Trimester 3
        "3218": {
            "0": { "start": "2021-11-01", "stop": "2021-11-07" },
            "1": { "start": "2021-11-08", "stop": "2021-11-14" },
            "2": { "start": "2021-11-15", "stop": "2021-11-21" },
            "3": { "start": "2021-11-22", "stop": "2021-11-28" },
            "4": { "start": "2021-11-29", "stop": "2021-12-05" },
            "5": { "start": "2021-12-06", "stop": "2021-12-12" },
            "6": { "start": "2021-12-13", "stop": "2021-12-19" },
            "7": { "start": "2021-12-20", "stop": "2021-12-26" },
            "8": { "start": "2022-01-10", "stop": "2022-01-16" },
            "9": { "start": "2022-01-17", "stop": "2022-01-23" },
            "10": { "start": "2022-01-24", "stop": "2022-01-30" },
            "11": { "start": "2022-01-31", "stop": "2022-01-06" },
            "12": { "start": "2022-02-07", "stop": "2022-02-13" },
            "13": { "start": "2022-02-14", "stop": "2022-02-20" },
            "exam": { "start": "2022-02-17", "stop": "2022-02-26" }
        },
        // Griffith 2021 Trimester 2
        "3215": {
            "0": { "start": "2021-07-12", "stop": "2021-07-18" },
            "1": { "start": "2021-07-19", "stop": "2021-07-25" },
            "2": { "start": "2021-07-26", "stop": "2021-08-01" },
            "3": { "start": "2021-08-02", "stop": "2021-08-08" },
            "4": { "start": "2021-08-16", "stop": "2021-08-22" },
            "5": { "start": "2021-08-23", "stop": "2021-08-29" },
            "6": { "start": "2021-08-30", "stop": "2021-09-05" },
            "7": { "start": "2021-09-06", "stop": "2021-09-12" },
            "8": { "start": "2021-09-13", "stop": "2021-09-19" },
            "9": { "start": "2021-09-20", "stop": "2021-09-26" },
            "10": { "start": "2021-09-27", "stop": "2021-10-03" },
            "11": { "start": "2021-10-04", "stop": "2021-10-10" },
            "12": { "start": "2021-10-11", "stop": "2021-10-17" },
            "13": { "start": "2021-10-18", "stop": "2021-10-24" },
            "14": { "start": "2021-10-25", "stop": "2021-10-31" },
            "exam": { "start": "2021-10-21", "stop": "2021-10-31" }
        },
        // Griffith 2021 Trimester 1
        "3211": {
            "0": { "start": "2021-03-01", "stop": "2021-03-07" },
            "1": { "start": "2021-03-08", "stop": "2021-03-14" },
            "2": { "start": "2021-03-15", "stop": "2021-03-21" },
            "3": { "start": "2021-03-22", "stop": "2021-03-29" },
            "4": { "start": "2021-03-29", "stop": "2021-04-04" },
            "5": { "start": "2021-04-12", "stop": "2021-03-18" },
            "6": { "start": "2021-04-19", "stop": "2021-04-25" },
            "7": { "start": "2021-04-26", "stop": "2021-05-02" },
            "8": { "start": "2021-05-03", "stop": "2021-05-09" },
            "9": { "start": "2021-05-10", "stop": "2021-05-16" },
            "10": { "start": "2021-05-17", "stop": "2021-05-23" },
            "11": { "start": "2021-05-24", "stop": "2021-05-30" },
            "12": { "start": "2021-05-31", "stop": "2021-06-06" },
            "13": { "start": "2021-06-07", "stop": "2021-03-13" },
            "exam": { "start": "2021-06-10", "stop": "2021-06-19" }
        },
                        // QCM 2021 Trimester 2
                        "3215QCM": {
                            "0": { "start": "2021-07-12", "stop": "2021-07-18" },
                            "1": { "start": "2021-07-19", "stop": "2021-07-25" },
                            "2": { "start": "2021-07-26", "stop": "2021-08-01" },
                            "3": { "start": "2021-08-02", "stop": "2021-08-08" },
                            "4": { "start": "2021-08-09", "stop": "2021-08-15" },
                            "5": { "start": "2021-08-16", "stop": "2021-08-22" },
                            "6": { "start": "2021-08-30", "stop": "2021-09-05" },
                            "7": { "start": "2021-09-06", "stop": "2021-09-12" },
                            "8": { "start": "2021-09-13", "stop": "2021-09-19" },
                            "9": { "start": "2021-09-20", "stop": "2021-09-26" },
                            "10": { "start": "2021-10-04", "stop": "2021-10-10" },
                            "11": { "start": "2021-10-11", "stop": "2021-10-17" },
                            "12": { "start": "2021-10-18", "stop": "2021-10-24" },
                            "13": { "start": "2021-10-25", "stop": "2021-10-31" },
                            "14": { "start": "2021-11-01", "stop": "2021-11-07" },
                            "15": { "start": "2021-11-08", "stop": "2021-11-14" },
                            "exam": { "start": "2021-10-30", "stop": "2021-11-13" }
                        },
                        // QCM 2021 Trimester 1
                        "3211QCM": {
                            "0": { "start": "2021-02-22", "stop": "2021-02-28" },
                            "1": { "start": "2021-03-01", "stop": "2021-03-07" },
                            "2": { "start": "2021-03-08", "stop": "2021-03-14" },
                            "3": { "start": "2021-03-15", "stop": "2021-03-21" },
                            "4": { "start": "2021-03-22", "stop": "2021-03-29" },
                            "5": { "start": "2021-03-29", "stop": "2021-04-04" },
                            "6": { "start": "2021-04-12", "stop": "2021-03-18" },
                            "7": { "start": "2021-04-19", "stop": "2021-04-25" },
                            "8": { "start": "2021-04-26", "stop": "2021-05-02" },
                            "9": { "start": "2021-05-10", "stop": "2021-05-16" },
                            "10": { "start": "2021-05-17", "stop": "2021-05-23" },
                            "11": { "start": "2021-05-24", "stop": "2021-05-30" },
                            "12": { "start": "2021-05-31", "stop": "2021-06-06" },
                            "13": { "start": "2021-06-07", "stop": "2021-03-13" },
                            "14": { "start": "2021-06-14", "stop": "2021-03-20" },
                            "15": { "start": "2021-06-21", "stop": "2021-03-26" },
                            "exam": { "start": "2021-06-12", "stop": "2021-06-26" }
                        },



    // OUA 2020 Study Period 1
    "2201": {
        "0": { "start": "2020-02-24", "stop": "2020-03-01" },
        "1": { "start": "2020-03-02", "stop": "2020-03-08" },
        "2": { "start": "2020-03-09", "stop": "2020-03-15" },
        "3": { "start": "2020-03-16", "stCop": "2020-03-22" },
        "4": { "start": "2020-03-23", "stop": "2020-03-29" },
        "5": { "start": "2020-03-30", "stop": "2020-04-05" },
        "6": { "start": "2020-04-06", "stop": "2020-04-12" },
        "7": { "start": "2020-04-13", "stop": "2020-04-19" },
        "8": { "start": "2020-04-20", "stop": "2020-04-26" },
        "9": { "start": "2020-04-27", "stop": "2020-05-03" },
        "10": { "start": "2020-05-04", "stop": "2020-05-10" },
        "11": { "start": "2020-05-11", "stop": "2020-05-17" },
        "12": { "start": "2020-05-18", "stop": "2020-05-24" },
        "13": { "start": "2020-05-25", "stop": "2020-05-31" },
        "14": { "start": "2020-06-01", "stop": "2020-06-05" },
        /* End of study period 4 */
        "exam": { "start": "2020-06-01", "stop": "2020-06-05" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2020 Study Period 2
    "2203": {
        "0": { "start": "2020-05-25", "stop": "2020-05-31" },
        "1": { "start": "2020-06-01", "stop": "2020-06-07" },
        "2": { "start": "2020-06-08", "stop": "2020-06-14" },
        "3": { "start": "2020-06-15", "stop": "2020-06-21" },
        "4": { "start": "2020-06-22", "stop": "2020-06-28" },
        "5": { "start": "2020-06-29", "stop": "2020-07-05" },
        "6": { "start": "2020-07-06", "stop": "2020-07-12" },
        "7": { "start": "2020-07-13", "stop": "2020-07-19" },
        "8": { "start": "2020-07-20", "stop": "2020-07-26" },
        "9": { "start": "2020-07-27", "stop": "2020-08-02" },
        "10": { "start": "2020-08-03", "stop": "2020-08-09" },
        "11": { "start": "2020-08-10", "stop": "2020-05-17" },
        "12": { "start": "2020-08-17", "stop": "2020-05-24" },
        "13": { "start": "2020-08-24", "stop": "2020-05-31" },
        "14": { "start": "2020-08-31", "stop": "2020-09-06" },
        /* End of study period 4 */
        "exam": { "start": "2020-08-31", "stop": "2020-09-04" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2020 Study Period 3
    "2205": {
        "0": { "start": "2020-08-24", "stop": "2020-09-30" },
        "1": { "start": "2020-08-31", "stop": "2020-09-06" },
        "2": { "start": "2020-09-07", "stop": "2020-09-13" },
        "3": { "start": "2020-09-14", "stop": "2020-09-20" },
        "4": { "start": "2020-09-21", "stop": "2020-09-27" },
        "5": { "start": "2020-09-28", "stop": "2020-10-04" },
        "6": { "start": "2020-10-05", "stop": "2020-10-11" },
        "7": { "start": "2020-10-12", "stop": "2020-10-19" },
        "8": { "start": "2020-10-19", "stop": "2020-10-25" },
        "9": { "start": "2020-10-26", "stop": "2020-11-01" },
        "10": { "start": "2020-11-02", "stop": "2020-11-08" },
        "11": { "start": "2020-11-09", "stop": "2020-11-15" },
        "12": { "start": "2020-11-16", "stop": "2020-11-22" },
        "13": { "start": "2020-11-23", "stop": "2020-11-29" },
        "14": { "start": "2020-11-30", "stop": "2020-12-06" },
        "15": { "start": "2020-12-07", "stop": "2020-12-13" },
        /* End of study period 4 */
        "exam": { "start": "2020-12-07", "stop": "2020-12-13" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA 2020 Study Period 4
    "2207": {
        "0": { "start": "2020-11-23", "stop": "2020-11-29" },
        "1": { "start": "2020-11-30", "stop": "2020-12-06" },
        "2": { "start": "2020-12-07", "stop": "2020-12-13" },
        "3": { "start": "2020-12-14", "stop": "2020-12-20" },
        "4": { "start": "2020-12-21", "stop": "2020-12-27" },
        "5": { "start": "2020-12-28", "stop": "2021-01-03" },
        "6": { "start": "2021-01-04", "stop": "2021-01-10" },
        "7": { "start": "2021-01-11", "stop": "2021-01-17" },
        "8": { "start": "2021-01-18", "stop": "2021-01-24" },
        "9": { "start": "2021-01-25", "stop": "2021-01-31" },
        "10": { "start": "2021-02-01", "stop": "2021-02-07" },
        "11": { "start": "2021-02-08", "stop": "2021-02-14" },
        "12": { "start": "2021-02-15", "stop": "2021-02-21" },
        "13": { "start": "2021-02-22", "stop": "2021-02-28" },
        "14": { "start": "2021-03-01", "stop": "2021-03-07" },
        "15": { "start": "2021-03-08", "stop": "2021-03-14" },
        /* End of study period 4 */
        "exam": { "start": "2021-03-01", "stop": "2021-03-07" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // Griffith 2020 Trimester 3
    "3208": {
        "0": { "start": "2020-10-26", "stop": "2020-11-01" },
        "1": { "start": "2020-11-02", "stop": "2020-11-08" },
        "2": { "start": "2020-11-09", "stop": "2020-11-15" },
        "3": { "start": "2020-11-16", "stop": "2020-11-22" },
        "4": { "start": "2020-11-23", "stop": "2020-11-29" },
        "5": { "start": "2020-11-30", "stop": "2020-12-06" },
        "6": { "start": "2020-12-07", "stop": "2020-12-13" },
        "7": { "start": "2020-12-14", "stop": "2020-12-20" },
        "8": { "start": "2021-01-04", "stop": "2021-01-10" },
        "9": { "start": "2021-01-11", "stop": "2021-01-17" },
        "10": { "start": "2021-01-18", "stop": "2021-01-24" },
        "11": { "start": "2021-01-25", "stop": "2021-01-31" },
        "12": { "start": "2021-02-01", "stop": "2021-02-07" },
        "13": { "start": "2021-02-08", "stop": "2021-02-14" },
        "exam": { "start": "2021-02-08", "stop": "2021-02-20" }
    },
    // Griffith 2020 Trimester 2
    "3205": {
        "0": { "start": "2020-07-06", "stop": "2020-07-12" },
        "1": { "start": "2020-07-13", "stop": "2020-07-19" },
        "2": { "start": "2020-07-20", "stop": "2020-08-26" },
        "3": { "start": "2020-07-27", "stop": "2020-08-02" },
        "4": { "start": "2020-08-03", "stop": "2020-08-16" },
        "5": { "start": "2020-08-17", "stop": "2020-08-23" },
        "6": { "start": "2020-08-24", "stop": "2020-08-30" },
        "7": { "start": "2020-08-31", "stop": "2020-09-06" },
        "8": { "start": "2020-09-07", "stop": "2020-09-13" },
        "9": { "start": "2020-09-14", "stop": "2020-09-20" },
        "10": { "start": "2020-09-21", "stop": "2020-09-27" },
        "11": { "start": "2020-09-28", "stop": "2020-10-04" },
        "12": { "start": "2020-10-05", "stop": "2020-10-11" },
        "13": { "start": "2020-10-12", "stop": "2020-10-18" },
        "14": { "start": "2020-10-19", "stop": "2020-10-25" },
        "15": { "start": "2020-10-27", "stop": "2020-11-01" },
        "exam": { "start": "2020-10-12", "stop": "2020-10-18" }
    },
    // Griffith 2020 Trimester 1
    "3201": {
        "0": { "start": "2020-02-17", "stop": "2020-02-23" },
        "1": { "start": "2020-02-24", "stop": "2020-03-01" },
        "2": { "start": "2020-03-02", "stop": "2020-03-08" },
        "3": { "start": "2020-03-09", "stop": "2020-03-15" },
        "4": { "start": "2020-03-16", "stop": "2020-03-22" },
        "5": { "start": "2020-03-23", "stop": "2020-03-29" },
        "6": { "start": "2020-03-30", "stop": "2020-04-05" },
        "7": { "start": "2020-04-13", "stop": "2020-04-19" },
        "8": { "start": "2020-04-20", "stop": "2020-04-26" },
        "9": { "start": "2020-04-27", "stop": "2020-05-03" },
        "10": { "start": "2020-05-04", "stop": "2020-05-10" },
        "11": { "start": "2020-05-11", "stop": "2020-05-17" },
        "12": { "start": "2020-05-18", "stop": "2020-05-24" },
        "13": { "start": "2020-05-25", "stop": "2020-05-31" },
        "exam": { "start": "2020-06-01", "stop": "2020-06-07" }
    },
    // Griffith 2019 Trimester 3
    "3198": {
        "0": { "start": "2019-10-21", "stop": "2019-10-27" },
        "1": { "start": "2019-10-28", "stop": "2019-11-03" },
        "2": { "start": "2019-11-04", "stop": "2019-11-10" },
        "3": { "start": "2019-11-11", "stop": "2019-11-17" },
        "4": { "start": "2019-11-18", "stop": "2019-11-24" },
        "5": { "start": "2019-11-25", "stop": "2019-12-1" },
        "6": { "start": "2019-12-02", "stop": "2019-12-08" },
        "7": { "start": "2019-12-09", "stop": "2019-12-15" },
        "8": { "start": "2019-12-16", "stop": "2019-12-22" },
        "9": { "start": "2020-01-06", "stop": "2020-01-12" },
        "10": { "start": "2020-01-13", "stop": "2020-01-19" },
        "11": { "start": "2020-01-20", "stop": "2020-01-26" },
        "12": { "start": "2020-01-27", "stop": "2020-02-02" },
        "13": { "start": "2020-02-03", "stop": "2020-02-09" },
        "exam": { "start": "2020-02-06", "stop": "2020-02-15" }
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA Study Period 4 2019
    "2197": {
        "0": { "start": "2019-11-18", "stop": "2019-11-24" },
        "1": { "start": "2019-11-25", "stop": "2019-12-01" },
        "2": { "start": "2019-12-02", "stop": "2019-12-08" },
        "3": { "start": "2019-12-09", "stop": "2019-12-15" },
        "4": { "start": "2019-12-16", "stop": "2019-12-22" },
        "5": { "start": "2019-12-23", "stop": "2019-09-29" },
        "6": { "start": "2019-12-30", "stop": "2020-01-05" },
        "7": { "start": "2020-01-06", "stop": "2020-01-12" },
        "8": { "start": "2020-01-13", "stop": "2020-01-19" },
        "9": { "start": "2020-01-20", "stop": "2020-01-26" },
        "10": { "start": "2020-01-27", "stop": "2020-02-02" },
        "11": { "start": "2020-02-03", "stop": "2020-02-09" },
        "12": { "start": "2020-02-10", "stop": "2020-02-16" },
        "13": { "start": "2019-02-17", "stop": "2020-02-23" },
        /* End of study period 4 */
        "14": { "start": "2020-02-24", "stop": "2020-03-01" },
        "15": { "start": "2020-03-02", "stop": "2020-03-08" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // OUA Study Period 3 2019
    "2195": {
        "0": { "start": "2019-08-19", "stop": "2019-09-25" },
        "1": { "start": "2019-08-26", "stop": "2019-09-01" },
        "2": { "start": "2019-09-02", "stop": "2019-09-18" },
        "3": { "start": "2019-09-09", "stop": "2019-09-15" },
        "4": { "start": "2019-09-16", "stop": "2019-09-22" },
        "5": { "start": "2019-09-23", "stop": "2019-09-29" },
        "6": { "start": "2019-09-30", "stop": "2019-10-06" },
        "7": { "start": "2019-10-07", "stop": "2019-10-13" },
        "8": { "start": "2019-10-14", "stop": "2019-08-20" },
        "9": { "start": "2019-10-21", "stop": "2019-10-27" },
        "10": { "start": "2019-10-28", "stop": "2019-11-03" },
        "11": { "start": "2019-11-04", "stop": "2019-11-10" },
        "12": { "start": "2019-11-11", "stop": "2019-11-17" },
        "13": { "start": "2019-11-18", "stop": "2019-11-24" },
        /* End of study period 3 */
        "14": { "start": "2019-11-25", "stop": "2019-12-01" },
        "15": { "start": "2019-10-07", "stop": "2019-10-13" },
        // No exam ?? "exam" : { "start": "2019-10-10", "stop" : "2019-10-19" }
    },
    // Griffith 2019 Trimester 2
    "3195": {
        "0": { "start": "2019-07-01", "stop": "2019-07-07" },
        "1": { "start": "2019-07-08", "stop": "2019-07-14" },
        "2": { "start": "2019-07-15", "stop": "2019-07-21" },
        "3": { "start": "2019-07-22", "stop": "2019-07-28" },
        "4": { "start": "2019-07-29", "stop": "2019-08-04" },
        "5": { "start": "2019-08-05", "stop": "2019-08-11" },
        "6": { "start": "2019-08-19", "stop": "2019-08-25" },
        "7": { "start": "2019-08-26", "stop": "2019-09-01" },
        "8": { "start": "2019-09-02", "stop": "2019-09-08" },
        "9": { "start": "2019-09-09", "stop": "2019-09-15" },
        "10": { "start": "2019-09-16", "stop": "2019-09-22" },
        "11": { "start": "2019-09-23", "stop": "2019-09-29" },
        "12": { "start": "2019-09-30", "stop": "2019-10-06" },
        "13": { "start": "2019-10-07", "stop": "2019-10-13" },
        "14": { "start": "2019-10-14", "stop": "2019-10-20" },
        "15": { "start": "2019-10-21", "stop": "2019-10-27" },
        "exam": { "start": "2019-10-10", "stop": "2019-10-19" }
    },
    "3191": {
        "0": { "start": "2019-02-18", "stop": "2019-02-24" },
        "1": { "start": "2019-02-25", "stop": "2019-03-03" },
        "2": { "start": "2019-03-04", "stop": "2019-03-10" },
        "3": { "start": "2019-03-11", "stop": "2019-03-17" },
        "4": { "start": "2019-03-18", "stop": "2019-03-24" },
        "5": { "start": "2019-03-25", "stop": "2019-03-31" },
        "6": { "start": "2019-04-01", "stop": "2019-04-07" },
        "7": { "start": "2019-04-08", "stop": "2019-04-14" },
        "8": { "start": "2019-04-22", "stop": "2019-04-28" },
        "9": { "start": "2019-04-29", "stop": "2019-05-05" },
        "10": { "start": "2019-05-06", "stop": "2019-05-12" },
        "11": { "start": "2019-05-13", "stop": "2019-05-19" },
        "12": { "start": "2019-05-20", "stop": "2019-05-26" },
        "13": { "start": "2019-05-27", "stop": "2019-06-02" },
        "14": { "start": "2019-06-03", "stop": "2019-06-09" },
        "15": { "start": "2019-06-10", "stop": "2019-06-17" },
        "exam": { "start": "2019-05-30", "stop": "2019-06-08" }
    }

};

var TERM = "3191", YEAR = 2019, SET_DATE = "";
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MONTHS_HASH = {
    "Jan" : 0, "January": 0,
    "Feb" : 1, "February": 1,
    "Mar" : 2, "March":2,
    "Apr" : 3, "April":3,
    "May" : 4, 
    "Jun" : 5, "June":5,
    "Jul" : 6, "July":6,
    "Aug" : 7, "August":7,
    "Sep" : 8, "September":8,
    "Oct" : 9, "October":9,
    "Nov" : 10, "November":10,
    "Dec" : 11, "December":11
};

// kludge to parse card image when Blackboard inserts one of its icons
const BBIMG = "/images/ci/icons/cmlink_generic.gif";


/****
 * addCardInterface( items, place )
 * - Given an array of items to translate into cards add the HTML etc
 *   to generate the card interface
 * - Add the card interface to any item that has a title including
 *     "Card Interface:" with an optional title
 * 
 * Changes made from cards.js to content.js
 * - definition of cardInterface 
 *   let cardInterface = place; /*jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find(".item h3").filter( function(x) {
 * - change how the card HTML is inserted into DOM
 *   replace firstItem usage with
 *      jQuery(cardInterface).before(interfaceHtml) 
 */

function addCardInterface(items,place) {

    
    // Define which template to use 
    let template = HORIZONTAL;
    let linkTemplate = HORIZONTAL;
    let engageVerb = 'Engage';

    // Define the text for Review Status
    let MARK_REVIEWED = "Mark Reviewed";
    let REVIEWED = "Reviewed";
    let NO_CARD_NUMBER = false;
    let NO_COMING_SOON = false;

    // get the content item with h3 heading containing Card Interface
/*    var cardInterface = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find(".item h3").filter( function(x) {
            return this.innerText.toLowerCase().includes("card interface");
        }
        ).eq(0);*/
    let cardInterface = place; 

    if (cardInterface.length === 0) {
        console.log("Card: Can't find item with heading 'Card Interface' in which to insert card interface");
        return false;
    } else {
        // get the title - text only, stripped of whitespace before/after
        var cardInterfaceTitle = jQuery.trim(cardInterface.text());


        //Extract parameters
        var m = cardInterfaceTitle.match(/Card Interface *([^<]*)/i);
        var WIDTH = 'md:w-1/3';

        if (m) {
            newParams = parse_parameters(m[1]);

            if (newParams) {
                newParams.forEach(function (element) {
                    m = element.match(/template=["']vertical['"]/i);
                    m1 = element.match(/template=vertical/i);
                    if (m || m1) {
                        template = VERTICAL;
                    } else if (element.match(/template=['"]horizontal['"]/i)) {
                        template = HORIZONTAL;
                    } else if ( element.match(/nocardnumber/i)) {
                        NO_CARD_NUMBER = true;
                    } else if ( element.match(/nocomingsoon/i)) {
                        NO_COMING_SOON = true;
                    } else if (element.match(/noimages/i)) {
                        HIDE_IMAGES = true;
                    } else if (x = element.match(/template=by([2-6])/i)) {
                        WIDTH = "md:w-1/" + x[1];
                    } else if (x = element.match(/by([2-6])/i)) {
                        WIDTH = "md:w-1/" + x[1];
                    } else if (x = element.match(/[Bb][yY]1/)) {
                        WIDTH = "md:w-full";
                    } else if (element.match(/people/i)) {
                        template = PEOPLE;
                    } else if (element.match(/noengage/i)) {
                        linkTemplate = HORIZONTAL_NOENGAGE;
                    } else if (element.match(/logging/i)) {
                        LOGGING = true;
                    } else if (m = element.match(/engage=([^']*)/)) {
                        engageVerb = m[1];
                    } else if (m = element.match(/template=assessment/i)) {
                        template = ASSESSMENT;
                    } else if (m = element.match(/set[Dd]ate=([^\s]*)/)) {
                        SET_DATE = m[1];
                    } else if (m = element.match(/^reviewed=([^']*)/ui)) {
                        REVIEWED = m[1];
                    } else if (m = element.match(/^markReviewed=(.+)/i)) {
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
    var firstItem = cardInterface.parent().siblings(".details");

    // Use the card HTML template and the data in items to generate
    // HTML for each card
    var cards = "";
    var moduleNum = 1;
    items.forEach(function (idx) {
        let cardHtml = cardHtmlTemplate[template];
        let linkHtml = linkItemHtmlTemplate[linkTemplate];

        // coming soon
        // By default comingSoon is empty
        let comingSoon = '';
        // TODO need to only display this if outside the date
        if ( typeof(idx.comingSoon)!=="undefined" && ! NO_COMING_SOON ) {
            if ( ! inDateRange( idx.comingSoon, false)) {
                // we have coming soon and in the date range
                // generate the html
                comingSoon = generateDateHtml( comingSoonHtmlTemplate[template],
                                dualComingSoonHtmlTemplate[template], 
                                idx.comingSoon);
                comingSoon = comingSoon.replace('{COMING_SOON_LABEL}', idx.comingSoonLabel);

                // if students are viewing remove the link stuff
                if ( window.tweak_bb.display_view) { 
                    // don't show an engage button 
                    linkHtml='';
                    // remove the clickableCard link and hover shadow 
                    cardHtml = cardHtml.replace('clickablecard','').replace(
                "hover:outline-none hover:shadow-outline ", ''
                    );
                }
            } 
        }
        cardHtml = cardHtml.replace('{COMING_SOON}', comingSoon);


        // TODO either here, or above in the link section need to remove
        // the link
        cardHtml = cardHtml.replace('{WIDTH}', WIDTH);

        // replace the default background colour if a different one
        // is specific
        if (idx.cardBGcolour) {
            cardHtml = cardHtml.replace(/background-color:\s*rgb\(255,255,255\)/i, 'background-color: ' + idx.cardBGcolour);
        }

        //<div class="bg-cover h-48" style="background-image: url('{PIC_URL}'); //background-color: rgb(255,255,204)">{IFRAME}
        // replace the Engage verb

        //---------------------------------------------
        // Add in the mark review/reviewed options
        var reviewTemplate = '';
        if (idx.review !== undefined) {
            // only do it if there is a review option found
            // check whether its a mark review or review
            // - if link contains markUnreviewed then it has been
            //   reviewed
            if (idx.review.match(/markUnreviewed/)) {
                reviewTemplate = markUnReviewedLinkHtmlTemplate[template];
                reviewTemplate = reviewTemplate.replace('{REVIEWED}', REVIEWED);
            } else {
                // it's the other one which indicates it has not been reviewed
                reviewTemplate = markReviewLinkHtmlTemplate[template];

                reviewTemplate = reviewTemplate.replace('{MARK_REVIEWED}', MARK_REVIEWED);
            }
            // set the right link
            reviewTemplate = reviewTemplate.replace('{LINK}', idx.review);
        }
        cardHtml = cardHtml.replace('{REVIEW_ITEM}', reviewTemplate);
        //console.log("template is " + template);
        // Only show module number if there's a label
        if (idx.label !== '') {
            var checkForNum = idx.moduleNum;
            if ( NO_CARD_NUMBER) {
                // global setting not to show card numbers
                cardHtml = cardHtml.replace('{MODULE_NUM}', '');
                checkForNum = '';
            } else if (idx.moduleNum) {
                // if there's a hard coded moduleNum use that
                cardHtml = cardHtml.replace('{MODULE_NUM}', idx.moduleNum);
            } else {
                // use the one we're calculating
                //cardHtml = cardHtml.replace('{MODULE_NUM}',moduleNum);
                cardHtml = cardHtml.replace(/\{MODULE_NUM\}/g, idx.moduleNum);
                // checkForNum probably not required
                checkForNum = idx.moduleNum;
            }

            // Update the title, check to see if it starts with label and 
            // moduleNum.  If it does, remove them from the title
            // So that the card doesn't duplicate it, but the information is 
            // still there in Blackboard
            var regex = new RegExp('^' + idx.label.trim() + '\\s*' + checkForNum +
                '\\s*[-:]*\\s*(.*)', "s");
            //const regex = /^Week\s*1\s*[-:]*\s*(.*)/gs;
            
            var m = idx.title.match(regex);
            //var m = regex.test(idx.title);
            if (m) {
                idx.title = m[1];
                // kludge for COM14 which has a <br> after label in title
                idx.title = idx.title.replace( /^<br\s*\/*>/i, '');
            }
        } else {
            cardHtml = cardHtml.replace('{MODULE_NUM}', '');
        }
        cardHtml = cardHtml.replace('{LABEL}', idx.label);

        //------------------ set the card image

        // Two options for BG_SIZE
        // 1. cover (bg-cover)
        //    Default option. Image covers the entire backgroun
        // 2. contain (bg-contain bg-no-repeat) 
        //    Entire image must fit within the card

        if (idx.bgSize === 'contain') {
            cardHtml = cardHtml.replace(/{BG_SIZE}/,
                'bg-contain bg-no-repeat bg-center');
        } else {
            cardHtml = cardHtml.replace(/{BG_SIZE}/, 'bg-cover');
        }

        // figure out which image we're going to show
        var picUrl = setImage(idx);

        // replace the {IMAGE_URL} variable if none set
        if (!idx.hasOwnProperty('iframe')) {
            cardHtml = cardHtml.replace(/{IFRAME}/g, '');
        } else {
            cardHtml = cardHtml.replace(/{IFRAME}/g, idx.iframe);
            // set pic URl to empty so non is provided
            picUrl = '';
        }
        cardHtml = cardHtml.replace(/{PIC_URL}/g, picUrl);
        cardHtml = cardHtml.replace('{TITLE}', idx.title);
        cardHtml = cardHtml.replace(/\{ASSESSMENT[_ ]TYPE\}/g, idx.assessmentType);
        cardHtml = cardHtml.replace(/\{WEIGHTING\}/g, idx.assessmentWeighting);
        cardHtml = cardHtml.replace(/\{LEARNING_OUTCOMES\}/g, idx.assessmentOutcomes);

        // Get rid of some crud Bb inserts into the HTML
        description = idx.description.replace(/<p/g, '<p class="pb-2"');
        description = description.replace(/<a/g, '<a class="underline"');
        cardHtml = cardHtml.replace('{DESCRIPTION}', description);
        // Does the card link to another content item?
        //	    console.log( " template is " + template + " and H_E " + HORIZONTAL_NOENGAGE);
        if (idx.link) {
            // add the link

            linkHtml = linkHtml.replace('{ENGAGE}', engageVerb);
            cardHtml = cardHtml.replace('{LINK_ITEM}', linkHtml);
            // if there is a label and no hard coded moduleNum, 
            //  then increment the module number
            // TENTATIVE
  /*          if (idx.label !== "" && !idx.moduleNum) {
                moduleNum++;
            }*/
        } else {// if (template!==HORIZONTAL_NOENGAGE) {
            // remove the link, as there isn't one
            cardHtml = cardHtml.replace('{LINK_ITEM}', '');
            cardHtml = cardHtml.replace(/<a href="{LINK}">/g, '');
            cardHtml = cardHtml.replace('</a>', '');
            // remove the shadow/border effect
            cardHtml = cardHtml.replace('hover:outline-none', '');
            cardHtml = cardHtml.replace('hover:shadow-outline', '');
            // don't count it as a module
          //  cardHtml = cardHtml.replace(idx.label + ' ' + moduleNum, '');
            //moduleNum--;
        }

        // If there is a linkTarget in Blackboard
        if (typeof idx.linkTarget !== 'undefined') {
            // replace "{LINK}" with "{LINK}" target="linkTarget"
            cardHtml = cardHtml.replace(/"{LINK}"/g, '"{LINK}" target="' +
                idx.linkTarget + '"');
        }

        if (typeof idx.link !== 'undefined') {
            cardHtml = cardHtml.replace(/{LINK}/g, idx.link);
        } else {
            cardHtml = cardHtml.replace(/<a href="{LINK}" class="cardmainlink">/g, '');
            cardHtml = cardHtml.replace(/class="clickablecard /, 'class="');
        }

        // Should we add a link to edit/view the original content
        if (location.href.indexOf("listContentEditable.jsp") > 0) {
            editLink = editLinkTemplate.replace('{ID}', idx.id);
            cardHtml = cardHtml.replace(/{EDIT_ITEM}/, editLink);
        } else {
            //cardHtml = cardHtml.replace(/{EDIT_ITEM}/,'');

            //editLink = editLinkTemplate.replace('{ID}', idx.id);
            editLink = '<div><a href="#hello">&nbsp;</a></div>';
            cardHtml = cardHtml.replace(/{EDIT_ITEM}/, editLink);
        }

        // standard date
        let date = '';
        date = generateDateHtml( dateHtmlTemplate[template], 
                                dualDateHtmlTemplate[template], idx.date);
        date = date.replace('{DATE_LABEL}', idx.dateLabel);
        cardHtml = cardHtml.replace('{DATE}', date);


        // add the individual card html to the collection
        cards = cards.concat(cardHtml);
    });

    // STick the cards into the complete card HTML
    var interfaceHtml = interfaceHtmlTemplate[template];
    interfaceHtml = interfaceHtml.replace('{CARDS}', cards);
    // Insert the HTML to the selected item(s)
    //return false;
    jQuery(cardInterface).before(interfaceHtml);

}

/** 
 * @function generateDateHtml
 * @params singleTemplate {String} HTML for a single date
 * @params dualTemplate {String} HTML for a dual date
 * @params date {Object} the date data structure
 * @description parse the date object and use the correct template to 
 * construct date html to be added to the card
 */

function generateDateHtml( singleTemplate, dualTemplate, date) { 
         // by default no html
         let cardHtml = '';

         if (typeof(date)!=="undefined" && 
                typeof(date.start)!=='undefined' && 'month' in date.start) { 
                // Do we have dual dates - both start and stop? 
                if (date.stop.month) {
                    // start and stop dates
                    //cardHtml = cardHtml.replace('{DATE}', dualDateHtmlTemplate[template]);
                    cardHtml = dualTemplate;
                    cardHtml = cardHtml.replace(/{MONTH_START}/g,
                        date.start.month);
                    cardHtml = cardHtml.replace(/{DATE_START}/g,
                        date.start.date);
                    cardHtml = cardHtml.replace(/{MONTH_STOP}/g,
                        date.stop.month);
                    cardHtml = cardHtml.replace(/{DATE_STOP}/g,
                        date.stop.date);
     //               cardHtml = cardHtml.replace(/{DATE_LABEL}/g, idx.dateLabel);
                    //           console.log(idx.date);
                    if (!date.start.hasOwnProperty('week')) {
                        cardHtml = cardHtml.replace('{WEEK}', '');
                    } else {
                        // if exam, use that template
                        // other wise construct dual week
                        let weekHtml = examPeriodTemplate;
                        if (date.start.week !== 'exam') {
                            weekHtml = dualWeekHtmlTemplate.replace('{WEEK_START}',
                                date.start.week);
                            weekHtml = weekHtml.replace('{WEEK_STOP}',
                                date.stop.week);
                        }
                        cardHtml = cardHtml.replace('{WEEK}', weekHtml);
                    }
                } else {
                    // just start date
                    //cardHtml = cardHtml.replace('{DATE}', dateHtmlTemplate[template]);
                    cardHtml = singleTemplate;
                    cardHtml = cardHtml.replace(/{MONTH}/g, date.start.month);
                    cardHtml = cardHtml.replace(/{DATE}/g, date.start.date);
    //                cardHtml = cardHtml.replace(/{DATE_LABEL}/g, idx.dateLabel);
                    if (!date.start.hasOwnProperty('week')) {
                        cardHtml = cardHtml.replace('{WEEK}', '');
                    } else { // SKETCHY TODO change added block around else
                        let weekReplace = "Week " + date.start.week;
                        if ( date.start.hasOwnProperty('day')) {
                            weekReplace = date.start.day + " " + weekReplace;
                        }
                        let weekHtml = weekHtmlTemplate.replace('{WEEK}', weekReplace); 
                        cardHtml = cardHtml.replace('{WEEK}', weekHtml);
                    }
                }
            } 
            return cardHtml;
   }

/**
* @function inDateRange
* @param cardDate {Object} card.date object
* @param assumeStop {Boolean} true if assuming a stop date if one not specified
* @returns {Boolean} true if the current time (or SET_DATE) is within the
*                  date range
*/

function inDateRange( cardDate, assumeStop=true ) {
    let month, year;

   if ( typeof(cardDate) !== "undefined") {
       let start, stop, now;
       
       // Set now to current date OR SET_DATE if we want to do testing
       if (SET_DATE === "") {
           now = new Date();
       } else {
           now = new Date(SET_DATE);
       }

       // set the start date
       if (cardDate.start.hasOwnProperty('month') &&
           cardDate.start.month !== "") {

           start = new Date( //parseInt(DEFAULT_YEAR), 
                   cardDate.start.year,
                   //MONTHS.indexOf(card.date.start.month), 
                   MONTHS_HASH[cardDate.start.month],
                   parseInt(cardDate.start.date));
       }
       
       // set the card stop date
       // - to card.date.stop if valid
       // - to the end of the week if using a week
       // - to the end of the day if no stop
       // TODO where using DEFAULT_YEAR, need to do a check if the month is
       //  past the current month.  If it is, then use DEFAULT_YEAR+1
       if (cardDate.stop.hasOwnProperty('month') &&
           cardDate.stop.month !== '') {
           //stop = new Date(DEFAULT_YEAR, MONTHS_HASH[cardDate.stop.month], cardDate.stop.date);
           stop = new Date(cardDate.stop.year, MONTHS_HASH[cardDate.stop.month], cardDate.stop.date);
           stop.setHours(23, 59, 0);
       } else if (cardDate.start.hasOwnProperty('week') &&
               cardDate.start.week !=='') {
           // there's no end date, but there is a start week
           // so set stop to end of that week, but only if inWeek is true
           if ( cardDate.start.week in TERM_DATES[TERM]) {
               if (assumeStop) {
                   stop = new Date(TERM_DATES[TERM][cardDate.start.week].stop);
                   stop.setHours(23, 59, 0);
               }
           } else {
             // problem with week, just set it to end of date
             if (typeof(start)!=="undefined" && assumeStop) {
               stop = new Date(start.getTime());
               stop.setHours(23, 59, 0);
             }
           }
/*        } else { // no week for stop, meaning it's just on the day
           stop = new Date(start.getTime());
           stop.setHours(23, 59, 0); */
       }

       // figure out if we're in range
       if (typeof(stop)!=="undefined") {
           // if stop defined, check in range
           return (now >= start && now <= stop);
       } else {
           // check passed start
           return ( now>=start );
       }        
   }
   return false;
}


// Interface design from https://codepen.io/njs/pen/BVdwZB


// TEMPLATES - by 6

// define the template types
const NUM_TEMPLATES = 6, HORIZONTAL = 0, // original 3 cards per row
    VERTICAL = 1, // 1 card per row 
    HORIZONTAL_NOENGAGE = 2, // original, but no engage
    PEOPLE = 5,
    ASSESSMENT = 6; // horizontal but show off people (BCI) version

// Whether or not xAPI logging is turned on
// - turned on by adding "logging" to Card Interface
var LOGGING = false;

// Define the wrapper around the card interface

var interfaceHtmlTemplate = Array(NUM_TEMPLATES);

// Kludge - hard code CSS path to enable shifting from
//          dev to live
//var CARDS_CSS="https://djon.es/gu/cards.css";
var CARDS_CSS = "https://s3.amazonaws.com/filebucketdave/banner.js/cards.css";
var FONT_AWESOME_JS = "https://kit.fontawesome.com/3bd759c8f5.js";

// 



interfaceHtmlTemplate[HORIZONTAL] = `
 <link rel="stylesheet" href="{CARDS_CSS}" />
 
 
 <div class="guCardInterface flex flex-wrap -m-3">
  {CARDS}
 </div>
 `;
interfaceHtmlTemplate[HORIZONTAL] = interfaceHtmlTemplate[HORIZONTAL].replace('{CARDS_CSS}', CARDS_CSS);

interfaceHtmlTemplate[VERTICAL] = `
 <link rel="stylesheet" href="{CARDS_CSS}" />
  {CARDS}
 </div>
 `;
interfaceHtmlTemplate[VERTICAL] = interfaceHtmlTemplate[VERTICAL].replace('{CARDS_CSS}', CARDS_CSS);

interfaceHtmlTemplate[HORIZONTAL_NOENGAGE] = interfaceHtmlTemplate[HORIZONTAL];
interfaceHtmlTemplate[PEOPLE] = interfaceHtmlTemplate[HORIZONTAL];
interfaceHtmlTemplate[ASSESSMENT] = interfaceHtmlTemplate[HORIZONTAL];

// template for each individual card

var cardHtmlTemplate = Array(NUM_TEMPLATES);

cardHtmlTemplate[HORIZONTAL] = `
   <div class="clickablecard w-full sm:w-1/2 {WIDTH} flex flex-col p-3">
     <div class="hover:outline-none hover:shadow-outline bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col relative"> <!-- Relative could go -->
       <a href="{LINK}" class="cardmainlink"></a>
       <div class="{BG_SIZE} h-48" style="background-image: url('{PIC_URL}');
       background-color: rgb(255,255,255)">{IFRAME}
       </div>
       {COMING_SOON}
       <div class="carddescription p-4 flex-1 flex flex-col">
         <span class="cardLabel">
         {LABEL} {MODULE_NUM}
         </span>
         <h3 class="mb-4 text-2xl">{TITLE}</h3>
         <div class="mb-4 flex-1">
           {DESCRIPTION}
           
         </div>
          
          {LINK_ITEM}
          {REVIEW_ITEM}
        <!--  {EDIT_ITEM} -->
          {DATE} 
       </div>
     </div>
   </div>
 `;

cardHtmlTemplate[VERTICAL] = `
 <a href="{LINK}">
 <div class="lg:flex xl:flex md:flex mb-4 rounded-lg shadow-lg hover:shadow-outline">
   <div class="lg:w-1/4 md:w-1/4 sm:w-full h-auto lg:flex-none bg-cover bg-center rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden" style="background-image: url('{PIC_URL}')">
         <img src="{PIC_URL}" style="opacity:0;width:50%" />
         {IFRAME}
   </div>
     <div class="p-2 m-2 lg:flex md:w-1/5 lg:w-1/5 sm:w-full">
         <h3>{TITLE}</h3>
     </div>
     {COMING_SOON}
     <div class="carddescription m-2 p-2 lg:flex-initial md:w-1/2 lg:w-1/2 sm:w-full">
       <p class="text-grey-darker text-base">
         {DESCRIPTION} 
       </p>
       {LINK_ITEM}
    <!--   {EDIT_ITEM} -->
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

cardHtmlTemplate[HORIZONTAL_NOENGAGE] = `
<div class="clickablecard w-full sm:w-1/2 {WIDTH} flex flex-col p-3">
<div class="hover:outline-none hover:shadow-outline bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col relative"> <!-- Relative could go -->
<a href="{LINK}" class="cardmainlink"></a>
  <div class="{BG_SIZE} h-48" style="background-image: url('{PIC_URL}');">
      {IFRAME}
  </div>
  {COMING_SOON}
  <div class="p-4 flex-1 flex flex-col">
    <span class="cardLabel"> 
    {LABEL} {MODULE_NUM}
    </span>
    <h3 class="mb-4 text-2xl">{TITLE}</h3>
    <div class="carddescription mb-4 flex-1">
      {DESCRIPTION}
    </div>
     {DATE} 
     {LINK_ITEM}
     {REVIEW_ITEM}
     <!-- {EDIT_ITEM} -->
  </div>
</div>
</div>
 `;

// TODO - this might not be a better fit as something not a template?

cardHtmlTemplate[PEOPLE] = `
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
  <!--        {EDIT_ITEM} -->
          {DATE} 
       </div>
     </div>
   </div>
 `;

// Implement the assessment template

cardHtmlTemplate[ASSESSMENT] = `
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
     {COMING_SOON}
     <div class="carddescription m-2">
           <div class="mb-4">
             <h3 class="font-bold">{TITLE}</h3>
             <p class="text-sm">{ASSESSMENT_TYPE}</p>
             <p class="text-sm">Learning outcomes: {LEARNING_OUTCOMES}</p>
           </div>
           
           {DESCRIPTION}
           
           {LINK_ITEM}
       <!--    {EDIT_ITEM} -->
           
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

linkItemHtmlTemplate[VERTICAL] = '';
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

markReviewLinkHtmlTemplate[VERTICAL] = '';
markUnReviewedLinkHtmlTemplate[VERTICAL] = '';
markReviewLinkHtmlTemplate[HORIZONTAL_NOENGAGE] = markReviewLinkHtmlTemplate[HORIZONTAL];
markUnReviewedLinkHtmlTemplate[HORIZONTAL_NOENGAGE] = markUnReviewedLinkHtmlTemplate[HORIZONTAL];
markReviewLinkHtmlTemplate[PEOPLE] = '';
markUnReviewedLinkHtmlTemplate[PEOPLE] = '';
markReviewLinkHtmlTemplate[ASSESSMENT] = '';
markUnReviewedLinkHtmlTemplate[ASSESSMENT] = '';

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
       {WEEK}
     </div>
     `;

dualWeekHtmlTemplate = `
     <div class="bg-yellow-lighter text-black py-1 border-l border-r border-black">
       Week {WEEK_START} to {WEEK_STOP}
     </div>
     `;

examPeriodTemplate = `
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

var comingSoonHtmlTemplate = Array(NUM_TEMPLATES);

comingSoonHtmlTemplate[HORIZONTAL]=`
<div class="cardComingSoon p-4 flex bg-yellow-light"> 
    <span>🚧</span>&nbsp;
    <span>{COMING_SOON_LABEL} {MONTH} {DATE}</span>
</div>
`;
comingSoonHtmlTemplate[HORIZONTAL_NOENGAGE] = comingSoonHtmlTemplate[HORIZONTAL];
comingSoonHtmlTemplate[PEOPLE] = comingSoonHtmlTemplate[HORIZONTAL_NOENGAGE];
comingSoonHtmlTemplate[VERTICAL] = comingSoonHtmlTemplate[HORIZONTAL_NOENGAGE];

var dualComingSoonHtmlTemplate = Array(NUM_TEMPLATES);

dualComingSoonHtmlTemplate[HORIZONTAL]=`
<div class="cardComingSoon p-4 flex bg-yellow-light"> 
    <span>🚧</span>&nbsp;
    <span>{COMING_SOON_LABEL} {MONTH_START} {DATE_START}-{MONTH_STOP} {DATE_STOP}</span>
</div>
`;
dualComingSoonHtmlTemplate[HORIZONTAL_NOENGAGE] = dualComingSoonHtmlTemplate[HORIZONTAL];
dualComingSoonHtmlTemplate[PEOPLE] = dualComingSoonHtmlTemplate[HORIZONTAL_NOENGAGE];
dualComingSoonHtmlTemplate[VERTICAL] = dualComingSoonHtmlTemplate[HORIZONTAL_NOENGAGE];



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
function setImage(card) {
    // only use activePicURL if it is set and there are dates on
    // the card
    if (card.activePicUrl !== '' &&
        card.date.start.date !== "") {
        // there is an activePicUrl, check if it should be active

        // active means that the current date falls within the start/stop
        // dates for the card
        var start, stop, now;
        if (SET_DATE === "") {
            now = new Date();
        } else {
            now = new Date(SET_DATE);
        }

        //console.log(card.date);
        if (card.date.start.hasOwnProperty('month') &&
            card.date.start.month !== "") {

            start = new Date(parseInt(YEAR), MONTHS.indexOf(card.date.start.month), parseInt(card.date.start.date));
        }
        if (card.date.stop.hasOwnProperty('month') &&
            card.date.stop.month !== '') {
            stop = new Date(YEAR, MONTHS.indexOf(card.date.stop.month), card.date.stop.date);
            stop.setHours(23, 59, 0);
        } else if (card.date.start.hasOwnProperty('week')) {
            // there's no end date, but there is a start week
            // so set stop to end of that week
            stop = new Date(TERM_DATES[TERM][card.date.start.week].stop);
            stop.setHours(23, 59, 0);
        } else { // no week for stop, meaning it's just on the day
            stop = new Date(start.getTime());
            stop.setHours(23, 59, 0);
        }

        if (now >= start && now <= stop) {
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
                let quoted_part = /^"((?:\\.|[^"])*)"(.*)$/.exec(quoted_arg);
                unquoted_arg += quoted_part[1].replace(/\\(.)/g, "$1");
                quoted_arg = quoted_part[2];
            } else if (/^'/.test(quoted_arg)) {
                let quoted_part = /^'([^']*)'(.*)$/.exec(quoted_arg);
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

NO_CARD_DEFINED = `
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


/*****************************************************************
 * handleUniversityDate( this )
 * - given a span with a university date in the form
 *         _day_ Week _num_
 *   e.g.   Wednesday Week 5
 * - update the element to add the actual date based on the
 *   trimester/study period associated with the course site
 *   e.g.    Wednesday Week 5 (25th April 2020)
 */

function handleUniversityDate() {
    dateText = jQuery(this).text();

    // extract the day and week
    // Wednesday Week 5 becomes
    // - day = Wednesday
    // - week = 5
    // and convert it to a date string
    //  date = March 12, 2019
    var day = '', week = '', date = '';
    m = dateText.match(
          /.*\b((mon|tue|wed(nes)?|thur|thurs|fri|sat(ur)?|sun)(day)?)[, ]*(of|:|;|\-|\u2013|\u2014| )*week *([0-9]+)/i );
 //       /.*\b((mon|tue|wed(nes)?|thur|thurs|fri|sat(ur)?|sun)(day)?)([,]*) *(,|of|:|;|\-|\u2013|\u2014) *week *([0-9]+)/i );
// old RE didn't handle week of
//        /.*\b(((mon|tues|wed(nes)?|thur(s)?|fri|sat(ur)?|sun)(day)?))\b[,]*[ ]*week *\b([0-9]*)/i);
    if (m) {
        day = m[1];
        week = m[m.length - 1];
        date = getTermDate(week, day);

        if (typeof date === "undefined"){
            return false;
        }
    } else {
        // couldn't match the date, finish up
        return false;
    }

    // update the HTML item
    dateText = dateText + " (" + date + ")";
    jQuery(this).html(dateText);
}

//*********************
// getTermDateContent( week, day )
// - given a week and a day of Griffith semester return actual
//   date for matching that study period
// - weeks start on Monday
// Special version for the Content Interface

function getTermDateContent(week, dayOfWeek = 'Monday') {
    if ( typeof TERM_DATES[TERM]==='undefined') {
        return undefined;
    }

    dayOfWeek = dayOfWeek.toLowerCase();
    var start;

    // if the week is not within the term return empty string
    if (typeof TERM_DATES[TERM][week] === 'undefined') {
        return "";
    }

    // else calculate the date and generate usable string
    start = TERM_DATES[TERM][week].start;
    var d = new Date(start);

    // if dayOfWeek is not Monday, add some days to the start of the week
    if (dayOfWeek !== 'monday') {
        var dayToNum = { 'tuesday': 1, 'wednesday': 2, 'thursday': 3, 'friday': 4, 'saturday': 5, 'sunday': 6 };
        if (dayOfWeek in dayToNum) {
            d.setDate(d.getDate() + dayToNum[dayOfWeek.toLowerCase()]);
        }
    }
    // generate string from date with given options
    const options = { weekday: undefined, year: 'numeric', month: 'long', day: 'numeric' };
    dateString = d.toLocaleDateString(undefined, options);

    return dateString;
}

/*********************************************************************
 * calculateTerm()
 * - check the location and other bits of Blackboard to calculate
 *   the trimester etc
 */

function calculateTerm() {
    // get the right bit of the Blackboard breadcrumbs
    courseTitle = jQuery("#courseMenu_link").attr('title') ||
        "Collapse COM14 Creative and Professional Writing (COM14_3205_OT)";

    // get the course id which will be in brackets
    m = courseTitle.match(/^.*\((.+)\)/);

    // we found a course Id, get the STRM value
    if (m) {
        id = m[1];
        // break the course Id up into its components
        // This is the RE for COMM10 - OUA course?
        breakIdRe = new RegExp('^([A-Z]+[0-9]+)_([0-9][0-9][0-9][0-9])_([A-Z][A-Z])$');
        m = id.match(breakIdRe);

        // found an actual course site (rather than org site)	    
        if (m) {
            TERM = m[2];

            // set the year
            mm = TERM.match(/^[0-9]([0-9][0-9])[0-9]$/);
            if (mm) {
                YEAR = 20 + mm[1];
            } else {
                YEAR = 2019;
            }
        } else {
            // check for a normal GU course
            breakIdRe = new RegExp('^([0-9]+[A-Z]+)_([0-9][0-9][0-9][0-9])_([A-Z][A-Z])$');
            // Following is broken

            m = id.match(breakIdRe);

            // found an actual course site (rather than org site)	    
            if (m) {
                TERM = m[2];
                // set the year
                mm = TERM.match(/^[0-9]([0-9][0-9])[0-9]$/);
                if (mm) {
                    YEAR = 20 + mm[1];
                } else {
                    YEAR = 2019;
                }
            } else {
                breakIdRe = new RegExp('^([0-9]+[A-Z]+)_([0-9][0-9][0-9][0-9])$');

                m = id.match(breakIdRe);

                // found an actual course site (rather than org site)	    
                if (m) {
                    TERM = m[2];
                    // set the year
                    mm = TERM.match(/^[0-9]([0-9][0-9])[0-9]$/);
                    if (mm) {
                        YEAR = 20 + mm[1];
                    } else {
                        YEAR = 2019;
                    }
                }
            }
        }
        // if this is a QCM course (either offering of joined), then update term
        qcmRe = new RegExp('^([0-9]+QCM)_([0-9][0-9][0-9][0-9])');
        m = qcmRe.match(id);
        if (m) {
            TERM = TERM+ "QCM";
        }
    }
}

/*************************************************************
* addCSS( url )
* - given the URL for a CSS file add it to the document
* https://makitweb.com/dynamically-include-script-and-css-file-with-javascript/
* (and other places)
*/

function addCSS(urlString) {
    var head = document.getElementsByTagName('head')[0];

    var style = document.createElement('link');
    style.href = urlString;
    style.type = 'text/css';
    style.rel = 'stylesheet';
    head.append(style);
}

/*************************************************************
 * addJS( url )
 * - given the URL for a JS file add it to the document
 * https://makitweb.com/dynamically-include-script-and-css-file-with-javascript/
 * (and other places)
 */

function addJS(urlString) {
    let head = document.getElementsByTagName('head')[0];

    let js = document.createElement('script');
    js.src = urlString;
    js.crossorgin = 'anonymous';
    head.append(js);
}


/******************************************************************
 * changeJqueryTheme( themeName)
 * - given a theme name, remove the old jQuery theme css and replace
 *   it with the new one
 */

var JQUERY_THEMES = [ 'base', 'start', 'smoothness', 'redmond', 'sunny',
'overcast', 'flick', 'pepper-grinder', 'ui-lightness', 'ui-darkness', 
'le-frog', 'eggplant', 'dark-hive', 'cupertino', 'blitzer', 'south-street', 
'humanity', 'hot-sneaks', 'excite-bike', 'vader', 'black-tie', 'trontastic',
'swanky-purse'
];

 function changeJqueryTheme( themeName) {
    // Convert the themeName to lower case with dash separation
    themeName = themeName.toLowerCase().replace( /\s+/g, '-');

    // does the new theme CSS file actually exist? / is it a valid theme name
    if ( ! JQUERY_THEMES.includes(themeName)) {
        return false;
    }

    // remove the old theme CSS
    // - proper new style css
    jQuery( "#gu_jqueryTheme").attr("disabled","disabled");
    // - also handle the old style 
    let oldCssLink = jQuery('link[href*="code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"]');
    if ( oldCssLink ) {
        jQuery('link[href*="code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"]').remove();
    }

    // add the new one
    let urlString = `https://code.jquery.com/ui/1.12.1/themes/${themeName}/jquery-ui.css`;

    var head = document.getElementsByTagName('head')[0];

    var style = document.createElement('link');
    style.href = urlString;
    style.id = "gu_jqueryTheme";
    style.type = 'text/css';
    style.rel = 'stylesheet';
    head.append(style);
 }



/*****************************************************************
* handleFilmWatchingOptions
* - given a span with the name of a film convert it into text
*    We've been unable to provide a copy of this fil..
*/


/**** 
 * fetchFilmUrl
 * Given name of a film and a flow URL generate an async JSON request
 * to get the available URL for the film
 */

async function fetchFilmURL(filmName, flowUrl) {
    let data = {};
    data.filmTitle = filmName;

    //        'item': 'filmWatchingOptionsFlowURL',
    //    console.log("body is " + JSON.stringify(data));
    //    console.log(" sending off to " + FILM_WATCHING_FLOW);
    const response = await fetch(flowUrl, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}


function handleFilmWatchingOptions() {
    let filmName = jQuery(this).text().trim();
    let filmNameEsc = encodeURIComponent(filmName);

    let filmUrl;
    let flowUrl = PARAMS.filmWatchingOptionsFlowURL;

    // stop if flowUrl isn't defined
    if ( typeof flowUrl === 'undefined') {
        console.log("Error: no flow URL defined");
        return false;
    }
    
    // Get the film's URL
    fetchFilmURL(filmName, flowUrl).then(data => {
        var html = '';
        
        // Flow returned a URL
        if ('url' in data && data.url !== '') {
            // Found a URL for the film
            filmUrl = data.url;

            // convert it into an embeddable player (if possible)
            html = convertMedia(data.url, filmName);
            
            
            // if it wasn't converted, just do the URL
            if ( html === '') {
                html = `
                <div class="filmWatchingOptions">
      <div class="filmWatchingOptionsImage"></div>
      <div class="instructions">
         <p>Access a copy of <a href="${data.url}"><em>${filmName}</em> here</a></p>
       </div>
    </div>
                `;
            }
        } 
        
        // if still no HTML, then point to JustWatch
        if ( html === '' ) {
            // didn't find film do the default justWatch search
            html = `
    <div class="filmWatchingOptions">
      <div class="filmWatchingOptionsImage"></div>
      <div class="instructions">
         <p>We've been unable to provide a copy <em>${filmName}</em>.</p>
         <p><a href="https://www.justwatch.com/au/search?q=${filmNameEsc}" target="_blank">This search on JustWatch</a> may provide pointers to where you can find it online.</p>
       </div>
    </div>`;
        } 
        
        jQuery(this).replaceWith(html);
    });

}

/************************************
 * html = convertMedia(link)
 * - given a link to a video return the iframe embed player
 * - support: Stream, YouTube, Vimeo, Kanopy
 */


function convertMedia(html, filmName) {
    // based on: http://jsfiddle.net/oriadam/v7b5edo8/   http://jsfiddle.net/88Ms2/378/   https://stackoverflow.com/a/22667308/3356679
    var cls = 'class="embedded-media"';
    var frm = '<iframe width="640" height="480" ' + cls + ' src="//_URL_" frameborder="0" allowfullscreen></iframe>';

    // Haven't figured out how to generate an embeddable player for Kanopy yet
    if (html.match(/griffith.kanopy.com/)) {
        return `
    <div class="filmWatchingOptions">
      <div class="filmWatchingOptionsImage"></div>
      <div class="instructions">
         <p>You can watch <em>${filmName}</em> on <a href="${html}">Kanopy</a></p>
       </div>
    </div>`;
    }


    var converts = [
        {
            rx: /^.*archive.org\/details\/([^\/]+)$/g,
            tmpl: frm.replace('_URL_', "archive.org/embed/$1")
        },
        {
            rx: /^.*microsoftstream.com\/video\/([^\/]+)$/g,
            tmpl: frm.replace('_URL_', "web.microsoftstream.com/embed/video/$1")
        },
        {
            rx: /^(?:https?:)?\/\/(?:www\.)?vimeo\.com\/([^\?&"]+).*$/g,
            tmpl: frm.replace('_URL_', "player.vimeo.com/video/$1")
        },
        {
            rx: /^.*(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|user\/.+\/)?([^\?&"]+).*$/g,
            tmpl: frm.replace('_URL_', "www.youtube.com/embed/$1")
        },
        {
            rx: /^.*(?:https?:\/\/)?(?:www\.)?(?:youtube-nocookie\.com)\/(?:watch\?v=|embed\/|v\/|user\/.+\/)?([^\?&"]+).*$/g,
            tmpl: frm.replace('_URL_', "www.youtube-nocookie.com/embed/$1")
        },
        {
            rx: /(^[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?\.(?:jpe?g|gif|png|svg)\b.*$)/gi,
            tmpl: '<a ' + cls + ' href="$1" target="_blank"><img src="$1" /></a>'
        },
    ];
    
    let returning = '';
    converts.forEach( function(elem) {
      m = elem.rx.match( html.trim() );
        if (m) {
            returning = html.trim().replace(elem.rx, elem.tmpl);
        }
    });
    return returning;
}

// ****************************************************
// addExpandPrintButtons
// - check if URL is set up to provide a print version
// - if so add a print button to 

const PRINT_URLS = {
    'http://127.0.0.1:8080/test/': 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXCSARjB2FJAlxX581K1QPIBRwJF6Jc-7nquPc2IFXfRMw?download=1',
    // --- COM10 **id82017155859681id82017155859681id82017155859681TODO** Need to move the IDs to something based on the title and the course id (to make it study period independent?)
    // Intro
    "id82017155859681" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXvTIKSc3S1OvJj-0zdBCt0BfLm32pxEB6j3euLMuaLciA?download=1',
    // 1
    "id82017155859821" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EeAq5L5wb41Gns6slW0A-LwB3Yq83TythhGI6ggFcBTndg?download=1',
    // 2
    "id82017155859981" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EbAqgkfJIx5Nqvd_jK1U5NIB6CPlm-EXVEQdkJwQiRWLMA?download=1',
    // 3 
    "id82017155860101" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EWNzglpqvdVEjTgpgmtNNpwB-FAAejeXf2-EfrMbelEBBw?download=1',
    // 4
    "id82017155860221" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EQpfz6EuZmVHn8nlehy86u4BCoBPoLCMQbEClzbtTOtA6Q?download=1',
    // 5 
    "id82017155860361" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ERVcxqM6xI9PnlXJTIqWleABB9vN7i6NMkYZvey6aLmbvw?download=1',
    // 6
    "id82017155860471" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EaMscQciQ2pLrFZLcEoOXccB1n24bXe1nLSKOpYkjV2N5w?download=1',
    // 7 
    "id82017155860591" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EULKp4LeFF1LujF5UFl8OHABeWORvVEkOo_ylQvzvY_40Q?download=1',
    // 8
    "id82017155860721" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYiaNSNnTYJNm3VBn4Qe350BFlUIdGhtVov0HEq81RRU5g?download=1',
    // 9
    "id82017155860821" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EeWjaWYjEgpHlizwaT0Lf-gBE8eJF8gqSIS6Gdx_-0VAbw?download=1',
    // 10
    "id82017155860921" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ES7T_sNVEEJCgTNCCSBvBMgBygkyvthRxCFe0esIQBbjgQ?download=1',
    // 11
    "id82017155861001" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ES4-c714D-1Liv7CE0XTNJABhpiF9bJxs3NywdwrZA72Vg?download=1',
    //12
    "id82017155861081" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXCSARjB2FJAlxX581K1QPIBRwJF6Jc-7nquPc2IFXfRMw?download=1',
    "id82017155861101" : 'https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXCSARjB2FJAlxX581K1QPIBRwJF6Jc-7nquPc2IFXfRMw?download=1',
    //13
    "id82017155861181" :"https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXO1cl-sEeZEj3H9O9acJikBghpbdwyyoKa3UDOPt4mvSQ?download=1",
    "id82017155861161" :"https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXO1cl-sEeZEj3H9O9acJikBghpbdwyyoKa3UDOPt4mvSQ?download=1",
    // assessment
    // 1
    "id82017155859351" : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EaovQ_phUEVBuUcv6T_-Nq8Beo9pfI5gGLTeXgZor8SteQ?download=1",
    // 2
    "id82017155859441" : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Ed1VsUZpHT1KlnNenO-MxugBfkzxvGw-ipxMjCZaHqej_Q?download=1",
    // 3
    "id82017155859501" : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EWqc_YnmVyZCsfInw968XaQBPjPOB4kbToSVYzqnQoiw4g?download=1",
    // Resources
    "id82017155859601" : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ER3stuIbjQFEi2TFu22qMvgBB_TQPKr3YQqp25RatuxqQA?download=1",
    // --- COM14 SP4, 2020
    "id82046152719131" : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ESqR--AbSgdFt7qK_Nl8OTEB07buAy3WIuZznYcYQPgCcw?download=1",
    // --- CWR111 SP4, 2020
// welcome and orientation
'id82172154304321': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EdtbB7EU1-VNiuuWgB6LCB8BvdkFEe4T5YwpboZnSrmz4Q?e=oxqscx",
// topic 1
'id82172154304341': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXHaMp41xBxJgkUrGBJ05vABvwUpgqGjKb1Vlxv75hdW_Q?e=fCG7XI",
// topic 2
'id82172154304401': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EfJmQ-jYEM1Cr4lCegZqUUgBY2lNRjd8wA4cloqqSP21sA?e=9YXKfr",
// topic 3
'id82172154304411': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYh6J3b0Y_lAog8iLcq1OEABtSfQhwv0af0vk_a37KzA-g?e=DAJOW8",
// topic 4
'id82172154304421': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EUbQutZ32i1EvulV7xSN76kBSyTeFkg_fhk6jbZqF3u5jg?e=5p6rJs",
// topic 5
'id82172154304431': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ETG-b9QlDaNIqTM6ZdZ_CrMBJ5XUSTWZd1iXzybEiCtzPA?e=hovWdD",
// topic 6
'id82172154304441': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EZZbKdDg6v5GtMGU0kcYp2IBwGA6aA8WYcARkKWCBo8ryQ?e=K8CZFv",
// topic 7
'id82172154304461': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EWAR5LNz_2BDtzf9XBA7NjABvoJ5NpqDixMQ8piSLmqhRg?e=MSNQ09",
// topic 8
'id82172154304471': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ESGdxEcctO9GlhCHbvfir20BS_cLrgcYzwnLC28hJdxK-g?e=6gIpuf",
// topic 9
'id82172154304481': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXVPj64V4BlPnyyBM8mNg_8BjczIJ1wchsKRoRp4tmZMXA?e=1loFnc",
// topic 10
'id82172154304501': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EQaHF2tR9oBBvrlszRQMV98BbtWSP6MQnQAzQATKx2IEEg?e=D25Cso",
// topic 11
'id82172154304511': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EbkQFoUVXWdEo2BJF1TzXBwBBo6gspDleUbrwhpSmp7QYQ?e=ZvgGPI",
// topic 12
'id82172154304521': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EUhHW-ML-mhGpVbAC7p82c4BUOpF3cfEL8DFJ0hFdoOAcA?e=G2F4KI",
// On the exegesis
'id82172154304561': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EVkmN8cfHNZInJWK4cQsZ64BGgSBSv-9NhFmdHQhUuNtPQ?e=F7lpRI",
// On the critical review
'id82172154304611': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EfEwCaXXlr1JrI_UhDD0q1YB6fkHTZKCeVIOf47JLUW2Mw?e=QNdn7J",
// A1 Online discussion
'id82172154304821' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYg7ai0HybNHmZDJttzTZOMB8zmi6vVZUrP6EeEkTXQv9A?e=8kkhpW",
// A2 folio 1
'id82172154304861': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EdYRpjiS41RAoHNewugYi2oB2rTeHttgKxzd5Ib7otgcLw?e=atMPA7",
// A3 Critical review
'id82172154304881': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EZRA0bwPel1Ho0nBf9pYXXABeXoMnGmmPX1_4n0CjBoS1w?e=16TNBt",
// A4 Folio 2
'id82172154306061': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ESbqa1F3H8tLjA8eSfklAm8BbrGVWg6kYg8oyUaZT6UXhA?e=WDQ9XM",
// Assessment resources
'id82172156823011': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Edy-fjSBvTBNuIDTLekhmD4BWNkKbO08YSS1jPatjkJiMg?e=Ch0XIA",    

//************************************* COM14 SP4 */
// Basecamp
'id82046153058251': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXctyASVrPBKlpUFGeAOZ3cBSL3kSTfWM_iOXDLtleogpQ?e=Fac9nI",
// Week 1        
'id82046152719131': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EX7kjt6DSZlMkRfnMW3lc5UB2RZDJFDqvU5QZSMxSL3wTw?e=D8yTZf",
'id73051157691491': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EX7kjt6DSZlMkRfnMW3lc5UB2RZDJFDqvU5QZSMxSL3wTw?e=D8yTZf",
// Week 2        
'id82046152751351': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Edl0bp_YCUxJt8_v51gCWlUB-iaxdThid_KHY5__CRNDSQ?e=GzVuaf",
// Week 3
'id82046152751361': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ESeh1-hLRB9Mt0I4OOQVDq4BdaFh-uhOeMtnMlMri3bTeQ?e=EtasCM",
// Week 4
'id82046152751371': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYbrxc4SZqFIv78lIFZ-KXIBBeQOc6JOOuWgL4nMquK_fw?e=PuRhiZ",
// Week 5
'id82046152751381': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EQhWuKYitbZFqbwdcw3ck1wBSpYt-r4WBT0uZ7IK9lGvNQ?e=VOjb7W",
// Week 6
'id82046152751391': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EfGRWAFkzMVEo0Kkr56SwmsBbwluOvh_1zegtzd-1zIzOQ?e=OXjNXf",
// Week 7
'id82046152751401': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EVtcN20P46RPlwP6u0gd6ZABi4KUKqr7JzNEcZ9a8C_9vA?e=Ceu5T3",
// Week 8
'id82046155704981': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EURi4tkebBxBmxgrYfnXnsoBsZtkqaDehQcZ8kvXc-Ye6Q?e=PNfibl",
// Week 9
'id82046155704991': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXPTG6tmjWBKqxKKnDkRyq0BvXzVtr0GNZCsc3VREjdGzw?e=XKX6Ql",
// Week 10
'id82046155705001': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Ed7ddppaDelCoO2QOmebIFYBvOiRIwar6g7C6Pyheg0_nA?e=fsKnvd",
// Week 11
'id82046155705011': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ET3kQVtSXV9KvWO7Ov6NddkBQ_pWg2EaoQ6HR267wr4WOA?e=QtpJgY",
// Week 12
'id82046155705021': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXSx4-dPhrhDuRSp50zvBNABvwV8if2LiLzNpSvYk-sVvA?e=gbuVn2",
// Week 13
'id82046155852241': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXjBvkyA2CtHpp-gatiBI4ABJ0WdyGqj75br-m88ft3mXA?e=3EuRZP",
// a1 - writing portfolio
'id82046155644091': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ETUdOwoa0YZFj-JHF3BgOTAB_PVSPtCguOqiaCfPDJ8JOA?e=cAulJI",
// a2 - weekly workouts
'id82046155644301': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EUyCE4QuMfJDnnso7oFH3L0BLiot9ldWo9wXiO9uwf6-7A?e=tkbvox",
// a3 - creative writing
'id82046155644381': "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ETdcqIGUSnFPkNP8Y3AVelYBr_ZpfDW5_wSCeRhTB1hy2A?e=bgZT5K",

//****************COM12 SP4 */
//com12/unitintroduction.pdf'
'id82005156959011' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYqSw3pi_XZAkt6TSX5H9VIBl4ZWtH-iN_OcUMuYmqzWkA?e=yx58Gu",
//com12/topic01.pdf'
'id82005156959151' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYo3TzR2mltPn5B-1c5Ryz0BmEH8Q4fxtFwEayF8m2P3Fw?e=aAQGnc",
//com12/topic02.pdf'
'id82005156959311' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EVXY0k0cHaJFh8_5LiwekdUBRDRi547eV8-1E8TW3LK5RA?e=k6Lkdt",
//com12/topic03.pdf'
'id82005156959431' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EeLGZteXkqtJog_ui-zzfFIBX63IvT2KTbT8LquDqCskgA?e=yg7aDi",
//com12/topic04.pdf'
'id82005156959551' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EfPjMPYv1DtCix3B_1jdOGcB3qFGuQsfHp3TXKfSYlMtEw?e=sfwUiA",
//com12/topic05.pdf'
'id82005156959691' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EUIHPY6KDIZHnnPER5t-RukBjQMQiIxCF0CPcB7rjx-oOw?e=RiCmvn",
//com12/topic06.pdf'
'id82005156959801' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EZD1-9-LrxVJhgzYRsoNk2QBYH2TWrC_4Opz9RfAfce3ig?e=Q9blat",
//com12/topic07.pdf'
'id82005156959921' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXA1YRYZOJZLm8B2l2EwaYkBa6KL7xKBcKulmM2y7My90Q?e=enGq1U",
//com12/topic08.pdf'
'id82005156960151' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ETlkcxLLRXFLnt5SY7A7aG8BkBtRe0q8UGaB4JaLbhbrVQ?e=v6zMeR",
//com12/topic09.pdf'
'id82005156960051' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EY651SKQvkRAj1XRk21bv-8ByRI7VJWCkZQZhDvp6SYYSQ?e=EvlVOZ",
//com12/topic10.pdf'
'id82005156960251' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ETU3J3OWgEFAmvQH70i0Zn4Bjx3zcq5gMJ99nC5H74lmDA?e=mrSGcp",
//com12/topic11.pdf'
'id82005156960331' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EQfMkrydyMVJgUkk1MFDdLYBbdbOTtZ3jBp8poByBbuS3A?e=RPIyOg",
//com12/topic12.pdf'
'id82005156960411' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Ea11dlZyONxIrlc43JQS8PcBZCR5Qr9Eg0fwfMrezVVmWQ?e=3a9C1Q",
//com12/topic013.pdf'
'id82005156960491' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EUbx8xAoWkVFpPKdp4oMB3ABQhJ2TSvSTlI7wDDFwmr4aQ?e=OnimhO",
//com12/a1ILTs.pdf'
'id82005156960541' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXtFrytYCjdDnRkgm9Knw_ABLtnRqI0o0f_LutqScndDsw?e=Pthwuv",
//com12/a2short_essay.pdf'
'id82005156960641' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ERgrdmBs9_BIj-JSytoDxTMBufe-JLBBezQcmFfTs4gJiQ?e=uGRDg5",
//com12/a3business_report.pdf'
'id82005156960701' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EaVSj-UdBBBCruHAYa7yuSwBn2pUT7_SfcdGEhb7kxYYnA?e=xgp94w",
//com12/assessmentresources.pdf'
'id82005156960761' : "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EfbbHGlX41dKlGvqevLCFwMBJ0Hsbg8w2iJXRGjpy_kFHA?e=4nfk2o"

};

function addExpandPrintButtons() {

    // add the expand buttons
    jQuery("#GU_ContentInterface").prepend(EXPAND_COLLAPSE_BUTTON_HTML);

    // should we add a print button?
    pdfUrl = getPrintButtons();
    if (pdfUrl) {
        const print_button = `
    <button href="type="button" onclick="window.open('${pdfUrl}')"
      >Download PDF</button>
    `;
        jQuery('.accordion-expand-holder').append(print_button);
    }
}

function getPrintButtons() {
    const x = window.location.href;

    // handle the simple test case
    if (x in PRINT_URLS) {
        return PRINT_URLS[x];
    }
    // break the Bb URL into script (listContent.jsp) courseId contentId
    let hrefId = getHrefId(x);
    // able to extract hrefId
    if (hrefId !== x) {
       // hrefId = "id" + hrefId.replaceAll('/','');
        hrefId = "id" + hrefId.replace(/\//g,'');
        hrefId = hrefId.replace(/_/g,'');
        if (hrefId in PRINT_URLS) {
            return PRINT_URLS[hrefId];
        }
    }

    return false;
}

//**********************************************************
// cleanUpPlaceHolder()
// - COM14 has cards with <br /> tags that disrupt the Blackboard
//   breadcrumbs
// - this fixes that issue

function cleanUpPlaceHolder() {
    let placeholder = jQuery(".placeholder");
    let text = placeholder.text().replace(/<br \/>/g, ". ").replace(/:./g, ":");
    placeholder.text(text);
    document.title = text;
}