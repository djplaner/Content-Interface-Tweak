/* eslint-disable no-prototype-builtins */
/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* content
 * - Given a Blackboard page containing a content item with  
     HTML generated from Mammoth
 * - Implement a variety of transformations
 * esversion: 6
 */

// Default dates
//var TERM = "3211", YEAR = 2021;
var DEFAULT_YEAR = 2021;

const DEFAULT_CARD_LABEL = "Module";

// Default reviewed/mark reviewed labels
var MARK_REVIEWED = "Mark Reviewed";
var REVIEWED = "Reviewed";
var TOOLTIPSTER_ADDED = false;

//var DEFAULT_CSS = "https://djon.es/gu/gu_study.css";
var DEFAULT_CSS =
  "https://s3.amazonaws.com/filebucketdave/banner.js/gu_study.css";
//const DEFAULT_PRINT_CSS = "https://djon.es/gu/com14_print.css";
const DEFAULT_PRINT_CSS =
  "https://s3.amazonaws.com/filebucketdave/banner.js/com14_print.css";

var tweak_bb_active_url_pattern = "listContent.jsp";

// Wrap arounds for various types of activity always required because
// Mammoth isn't able (as I've configured it) to do it all
// - key indicates <div style to be preprended
// - value is what will be prepended
var STYLE_PREPEND = {
  reading: `<div class="readingImage">
    <img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-reading-48.png" alt="Reading icon" />
  </div>`,
  activity: `<div class="activityImage">
    <img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-dancing-48.png" alt="Activity icon" />
  </div>`,
  flashback: `<div class="flashbackImage"><img src="https://s3.amazonaws.com/filebucketdave/banner.js/images/com14/flashback.png" alt="Flashback logo" /></div>`,
  //"canaryExercise" : `<div class="canaryImage"></div>`,
  // COM14
  canaryExercise: `<div class="canaryImage"><img src="https://s3.amazonaws.com/filebucketdave/banner.js/images/com14/Tweety.svg.png"  alt="Tweety bird"  /></div>`,
  //ael-note : `<div class="icon"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/Blk-Warning.png"></div>`,
  "ael-note": `<div class="noteImage"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/Blk-Warning.png"></div>`,
  weeklyWorkout: `<div class="weeklyWorkoutImage"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/com14/weeklyWorkout.png" alt="Female weight lifter" /></div>`,
  comingSoon: `<div class="comingSoonImage"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/com14/comingSoon.jpg"></div>`,
  filmWatchingOptions: `<div class="filmWatchingOptionsImage"><img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-movie-beginning-64.png" alt="Film Watching icon"> </div>`,
  goReading: `<div class="goReadingImage"> <img src="https://app.secure.griffith.edu.au/gois/ultra/icons-regular/reading.svg" /> </div>`,
};

var EMPTY_STYLE_PREPEND = {
  goStartHere: `<div class="goStartHereImage"> <img src="https://app.secure.griffith.edu.au/gois/ultra/icons-regular/start-here.svg" /> </div>`,
  goActivity: `<div class="goActivityImage"> <img src="https://app.secure.griffith.edu.au/gois/ultra/icons-regular/activity.svg" /> </div>`,
  goReflect: `<div class="goReflectImage"> <img src="https://app.secure.griffith.edu.au/gois/ultra/icons-regular/reflection.svg" /> </div>`,
  goWatch: `<div class="goWatchImage"> <img src="https://app.secure.griffith.edu.au/gois/ultra/icons-regular/video.svg" /> </div>`,
  goDownload: `<div class="goDownloadImage"> <img src="https://app.secure.griffith.edu.au/gois/ultra/icons-regular/download.svg" /> </div>`,
  goNumberedList: `<div class="goNumberedListImage"> <img src="https://app.secure.griffith.edu.au/gois/ultra/icons-regular/number-1.svg" /> </div>`,
};

//
var EXPAND_COLLAPSE_BUTTON_HTML = `<div class="accordion-expand-holder">
 <button class="gu_content_open" style="padding:0.3em 1.2em;margin:0 0.3em 0.3em 0;border-radius:2em;border:2px solid;box-sizing: border-box;text-decoration:none;text-align:center">Expand all</button>
 <button class="gu_content_close"  style="padding:0.3em 1.2em;margin:0 0.3em 0.3em 0;border-radius:2em;border:2px solid;box-sizing: border-box;text-decoration:none;text-align:center">Collapse all</button>
 </div>`;

// simple definition for using pure.css tables
// TODO need to replace this.
var TABLE_CLASS = "table stripe-row-odd";

// Define way to insert a checkbox that can be clicked
var CHECKBOX = `<input type="checkbox" name="gu_dummy" />`;

// specify Bb links to ensure external links open in new window
var BLAED_LINK = "bblearn-blaed.griffith.edu.au";
var LMS_LINK = "bblearn.griffith.edu.au";

var PARAMS = {};

// new global kludges for Cards
var LOCATION = location.href.indexOf("listContent.jsp");
var MODULE_NUM;

var ITEM_LINK_PARAMETERS = {
  "Content Document": {
    element: "wordDocElement", // need to end in Element to hide the element
    item: "wordDoc",
  },
  "Film Watching Flow": {
    element: "filmWatchingOptionsElement",
    item: "filmWatchingOptionsFlowURL",
  },
  "Film Watch Options Data": {
    element: "filmWatchOptionsElement",
    item: "filmWatchOptionsDataURL",
  },
  cssURL: {
    element: "cssURLElement",
    item: "cssURL",
  },
  downloadButtonURL: {
    element: "downloadButtonElement",
    item: "downloadButtonURL",
  },
  downloadButtonTip: {
    element: "downloadButtonTipElement",
    item: "downloadButtonTip",
    type: "contentItem",
  },
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
    display_view: location.href.indexOf(tweak_bb_active_url_pattern) > 0,
    page_id: "#content_listContainer",
    row_element: "li",
  };

  // Add to jQuery a function that will be used to find BbItems that
  // match a given title
  jQuery.expr[":"].textEquals =
    jQuery.expr[":"].textEquals ||
    jQuery.expr.createPseudo(function (arg) {
      return function (elem) {
        arg = arg.replace(/\u2013|\u2014/g, "-");
        // Convert emdash type chars to ASCII equivalents
        elemText = elem.textContent.trim();
        elemText = elemText.replace(/\u2013|\u2014/g, "-");
        arg = arg.replace(/[\u201c\u201d]/g, '"');
        elemText = elemText.replace(/[\u201c\u201d]/g, '"');
        //console.log("Compre arg **" + arg + "** with **" + elemText + "**");
        return (
          elemText.localeCompare(arg, undefined, {
            sensitivity: "base",
          }) === 0
        );
      };
    });

  // Find the item in which the content is contained
  var contentInterface = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element)
    .find(".item h3")
    // eslint-disable-next-line no-unused-vars
    .filter(function (x) {
      return this.innerText.toLowerCase().includes("content interface");
    })
    .eq(0);
  // Find any Word Document link that's been added
  var wordDoc = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element)
    .find(".item h3")
    .filter(':contains("Content Document")')
    .eq(0);

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
    for (let paramKey in ITEM_LINK_PARAMETERS) {
      let elem = ITEM_LINK_PARAMETERS[paramKey].element;

      // if we found an item for this param, hide it
      if (elem in params) {
        jQuery(params[elem]).parents("li").hide();
      }
    }
  } else {
    // add the cards for documentation
    addCSS(CARDS_CSS, params.downloadPDFURL);
    addJS(FONT_AWESOME_JS);
  }

  // do nothing if we couldn't find the contentInterface item
  if (contentInterface.length === 0) {
    return false;
  }

  // the if isn't required
  if ("cssURL" in params) {
    addCSS(params.cssURL, params.downloadPDFURL);
  }

  if ("theme" in params) {
    changeJqueryTheme(params.theme);
  } else {
    changeJqueryTheme("smoothness");
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
  handleFAQs();
  // FILM WATCH
  //  jQuery("div.filmWatchingOptions").each(handleFilmWatchingOptions);
  // add the jsonurl attribute to all film-watch-options components

  // if there's a filmWatchOptionsDataURL then add the jsonurl attribute
  // and insert the JS file for the film-watch-options component
  if (
    "filmWatchOptionsDataURL" in PARAMS &&
    PARAMS.filmWatchOptionsDataURL !== ""
  ) {
    addJS(FILM_WATCH_OPTIONS_JS, true);
    let filmWatchComponents = document.querySelectorAll("film-watch-options");
    filmWatchComponents.forEach((component) => {
      component.setAttribute("jsonurl", PARAMS.filmWatchOptionsDataURL);
    });
  }

  // handle the integration of any blackboard headings/items into the
  // content interface
  jQuery("span.blackboardContentLink").each(handleBlackboardContentLink);
  jQuery("span.blackboardMenuLink").each(handleBlackboardMenuLink);

  jQuery("span.universityDate").each(handleUniversityDate);

  // Add a <div> </div> around all the content following H1s
  jQuery("#GU_ContentInterface h1").each(function () {
    // Kludge test for changing colour
    title = jQuery(this).text();

    jQuery(this)
      .nextUntil("h1")
      .addBack()
      .wrapAll('<div class="accordion_top"></div>');
    jQuery(this)
      .nextUntil("h1")
      .wrapAll('<div class="gu-accordion-h1-body"></div>');
  });
  // Add divs around the h2 headings, until h2 or h1
  jQuery("#GU_ContentInterface h2").each(function () {
    // console.log( "Heading text " + jQuery(this).html());
    jQuery(this)
      .nextUntil("h1,h2")
      .addBack()
      .wrapAll('<div class="accordion"></div>');
    jQuery(this)
      .nextUntil("h1,h2")
      .wrapAll('<div class="gu-accordion-h2-body"></div>');
  });

  // move these until after the divs have been added
  jQuery("h1.blackboard").each(handleBlackboardItem);
  jQuery("h2.blackboard").each(handleBlackboardItem);

  // handle footnotes
  // - find each footnote reference and replace with a tooltipster element

  handleBlackboardCards();
  //jQuery("div.bbCard").each( handleBlackboardCards );

  // Update the HTML for various defined styles
  for (const divstyle in STYLE_PREPEND) {
    let query = `div.${divstyle}`;
    jQuery(query).prepend(STYLE_PREPEND[divstyle]);
  }
  // and styles we wish to empty and prepend
  for (const divstyle in EMPTY_STYLE_PREPEND) {
    let query = `div.${divstyle}`;
    jQuery(query).empty().prepend(EMPTY_STYLE_PREPEND[divstyle]);
  }

  //updateReadings(contentInterface);
  // Handle the blackboard items

  // Convert the videos - handled by embed now
  //doVideo();

  // convert the embed code
  let embeds = jQuery(".embed");
  embeds.each(function (idx) {
    let embed = jQuery(this).html();
    let decoded = jQuery("<div/>").html(embed).text();
    // do some special handling for Stream videos
    decoded = updateStream(decoded);
    jQuery(this).html(decoded);
  });

  // Find all the div.picture and add a <p> </p> around
  // text after the image
  jQuery("#GU_ContentInterface div.picture").each(function (idx) {
    jQuery(this).children("img").after("<br />");
    //console.log("Picture found " + jQuery(this).text()) ;
    //console.log("Picture found after text " + jQuery(afterImage));
  });
  jQuery("#GU_ContentInterface div.pictureRight").each(function (idx) {
    jQuery(this).children("img").after("<br />");
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
      jQuery(this).parent().parent().css("text-align", "center");
    }
  });

  jQuery("#GU_ContentInterface span.centered").each(function (idx) {
    if (jQuery(this).parent().parent().is("td")) {
      jQuery(this).parent().parent().css("text-align", "center");
    }
  });

  // replace all <div class="vtbegenerated" with <p
  // *%&^$ Bb change to editor
  jQuery("#GU_ContentInterface")
    .find("div.vtbegenerated_div")
    .replaceWith(function () {
      return jQuery("<p />", { html: jQuery(this).html() });
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

    var theLink = jQuery(this).attr("href");

    if (typeof theLink !== "undefined") {
      // replace blaed links with normal links
      if (theLink.match(BLAED_LINK) !== null) {
        theLink = theLink.replace(BLAED_LINK, LMS_LINK);
        jQuery(this).attr("href", theLink);
      }
      // open external links in a new window i.e. links that don't
      // match the LMS or don't have a host portion at the start
      if (
        theLink.match(LMS_LINK) === null &&
        theLink.match(/^\//) === null &&
        theLink.match(/^javascript:mark/) === null
      ) {
        jQuery(this).attr("target", "_blank");
        // turn off the Blackboard onclick "stuff"
        jQuery(this).prop("onclick", null).off("click");
      }
    }
  });

  // Update the HTML for various defined styles
  /*  for (var divstyle in STYLE_PREPEND) {
    let query = `div.${divstyle}`;
    jQuery(query).prepend(STYLE_PREPEND[divstyle]);
  } */

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
    heightStyle: "content",
    activate: function (event, ui) {
      if (!$.isEmptyObject(ui.newHeader.offset())) {
        $("html:not(:animated), body:not(:animated)").animate(
          { scrollTop: ui.newHeader.offset().top },
          "slow"
        );
        // send resize to ensure that h5p iframe appears correct
        // size
        window.dispatchEvent(new Event("resize"));
      }
    },
  });

  // TODO move this to a string and make it look prettier
  var icons = jQuery(".accordion").accordion("option", "icons");

  // define the click function for the expand all
  jQuery(".gu_content_open").click(function (event) {
    event.preventDefault();
    jQuery(".ui-accordion-header")
      .removeClass("ui-corner-all")
      .addClass("ui-accordion-header-active ui-state-active ui-corner-top")
      .attr({
        "aria-selected": "true",
        tabindex: "0",
      });
    jQuery(".ui-accordion-header-icon")
      .removeClass(icons.header)
      .addClass(icons.headerSelected);
    jQuery(".ui-accordion-content")
      .addClass("ui-accordion-content-active")
      .attr({
        "aria-expanded": "true",
        "aria-hidden": "false",
      })
      .show();
    jQuery(this).attr("disabled", "disabled");
    jQuery(".gu_content_close").removeAttr("disabled");
  });
  // define the click functio for the collapse all
  jQuery(".gu_content_close").click(function () {
    event.preventDefault();
    jQuery(".ui-accordion-header")
      .removeClass("ui-accordion-header-active ui-state-active ui-corner-top")
      .addClass("ui-corner-all")
      .attr({
        "aria-selected": "false",
        tabindex: "-1",
      });
    jQuery(".ui-accordion-header-icon")
      .removeClass(icons.headerSelected)
      .addClass(icons.header);
    jQuery(".ui-accordion-content")
      .removeClass("ui-accordion-content-active")
      .attr({
        "aria-expanded": "false",
        "aria-hidden": "true",
      })
      .hide();
    jQuery(this).attr("disabled", "disabled");
    jQuery(".gu_content_open").removeAttr("disabled");
  });
  jQuery(".ui-accordion-header").click(function () {
    // if active is true, then we're opening an accordion
    // thus save which one it is
    let active = this.classList.contains("ui-state-active");

    if (active) {
      let hrefId = getHrefId(window.location.href);
      window.localStorage.setItem(hrefId, this.id);
    }

    jQuery(".gu_content_open").removeAttr("disabled");
    jQuery(".gu_content_close").removeAttr("disabled");
    //console.log('click header ' + jQuery(this).html());
  });

  // figure out which accordion to open
  // - by default it is the first 0
  // - if an integer is used as a link e.g. #1 or #5
  //   then open accordion matching that number
  // - if paramsObj.collapseAll == true - then none

  var start = window.location.hash.substring(1);
  var end;
  numAccordions = jQuery(".accordion_top").length;
  start = parseInt(start, 10) - 1;
  if (!Number.isInteger(start) || start > numAccordions - 1) {
    start = 0;
    end = 1;

    if (params.scrollTo) {
      openWhereYouLeftOff();
    }
  } else {
    end = start + 1;
  }
  // want all expanded, figure out num accordions and set end appropriately
  if (params.expandAll === true) {
    start = 0;
    end = jQuery("#GU_ContentInterface h1").length;
  } else if (params.collapseAll === true) {
    start = 0;
    end = 0;
  } else if (params.expand > 0) {
    if (params.expand < jQuery("#GU_ContentInterface h1").length) {
      start = params.expand - 1;
      end = start + 1;
    } else {
      console.log(
        "ERROR - expand value (" +
          params.expand +
          ") larger than number of heading 1s "
      );
    }
  }

  //jQuery("#globalNavPageNavArea").scrollTop(0);
  if (params.scrollTo) {
    jQuery(".accordion_top").slice(start, end).accordion("option", "active", 0);
  }
  //if ( start === 0 && end === 1) {
  //}

  // Remove the Content Interface from the vtbegenerated div so that
  // Bb CSS doesn't override embedded Card CSS
  var journey = jQuery(contentInterface)
    .parent()
    .next("div.details")
    .children(".vtbegenerated");
  var child = jQuery(journey).children("#html");
  jQuery(child).unwrap();

  // check if the item icons exists, before trying to remove them
  let checkIcon = setInterval(function () {
    if (jQuery("img.item_icon").length) {
      removeBlackboardIcon(contentInterface);
      clearInterval(checkIcon);
    }
  }, 100);
}

/**
 * function handleFAQs
 * - slavish copy of https://www.w3schools.com/howto/howto_js_accordion.asp
 */

function handleFAQs() {
  let acc = document.getElementsByClassName("faqQuestion");
  let i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function (e) {
      e.preventDefault();
      /* Toggle between adding and removing the "active" class,
     to highlight the button that controls the panel */
      this.classList.toggle("faqActive");

      /* Toggle between hiding and showing the active panel */
      let answer = this.nextElementSibling;
      if (answer.style.maxHeight) {
        answer.style.maxHeight = null;
        answer.style.margin = "0em 0em 0em 0em";
      } else {
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.style.margin = "1em 1em 1em 1em";
      }
    });
  }
}

/**
 *
 * @param {String} html  - html embe
 * - if the html contains a stream embed, add a message above
 *   that provides a direct link to the Stream video
 */

function updateStream(html) {
  let t = document.createElement("tt_template");
  t.innerHTML = html;

  let iframe = t.getElementsByTagName("iframe")[0];
  if (typeof iframe === "undefined") {
    return html;
  }
  let src = iframe.src;

  // is src a URL
  // start analysing src to find the type of service
  let servicePattern = new RegExp("^https://([^/]*)");
  let match = src.match(servicePattern);

  if (!match) {
    return html;
  }

  let service = match[1];

  // Microsoft stream
  if (service.includes("microsoftstream.com")) {
    let pattern = /^https:\/\/[^\/]*\/embed\/video\/([^\/?]*)/;
    match = src.match(pattern);
    if (match) {
      let videoId = match[1];
      let videoUrl = `https://web.microsoftstream.com/video/${videoId}`;
      return `${html}
      <p class="gu_addedAdvice" style="font-size:80%">
      <span class="gu_adviceLabel">Alternative source:</span> <span class="gu_adviceValue"><a href="${videoUrl}" target="_new">visit video's page</a></span><br />
      <span class="gu_adviceLabel">Help:</span> <span class="gu_adviceValue"><a href="https://docs.microsoft.com/en-us/stream/portal-watch">Watch videos on Microsoft Stream</a></span>
      </p>
      `;
    }
  }
  return html;
}

/**
 * @function removeBlackboardIcon
 * @param {Object} contentInterface jQuery object for where the card interface will go
 * @description If exists, update cardInterface to remove Blackboard icon
 */

function removeBlackboardIcon(contentInterface) {
  let container = jQuery(contentInterface).parent().parent();
  // hide the icon
  let icon = jQuery(container).find("img.item_icon").css("display", "none");
  // update the padding on the div
  let div = jQuery(container).find("div.details").css("padding-left", "10px");
}

/************************************************************************
 * getHrefId( href )
 * Given a URL extract the blackboard course and content id and combine
 * them into an id (concatentate with a _)
 * Return that id.
 * Return href
 */

function getHrefId(href) {
  let courseId, contentId;
  // get the courseId
  m = href.match(/^.*course_id=(_[0-9_]+).*$/);
  if (!m) {
    return href;
  }
  courseId = m[1];
  // get the contentId
  m = href.match(/^.*content_id=(_[0-9_]+).*$/);
  if (!m) {
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
  let hrefId = getHrefId(window.location.href);
  let storageStart = window.localStorage.getItem(hrefId);
  if (typeof storageStart !== "undefined") {
    // want to find the H1 or H2 that has the id in m[1]
    let heading = jQuery("h1#" + storageStart + ",h2#" + storageStart);
    // do we need to do something different for h2?
    // Maybe open the h1 element and then the h2 element?
    // but then we want to find the something or other that wraps it
    if (heading.length === 1) {
      let accord;
      let tagName = heading[0].tagName;

      if (tagName === "H1") {
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
  var firstFootNote = "";

  footnotes.each(function () {
    // get the <sup> item wrapped around footnote
    var supItem = jQuery(this).parent();

    // get the id for the footnote content (at end of doc)
    //  footnote-ref-??  becomes
    //  footnote-??
    var footnoteId = jQuery(this).attr("id");
    var footnote = "li# " + footnoteId.replace("-ref", "");
    footnote = footnote.replace(" ", "");
    footnoteContent = jQuery(footnote).html();

    if (firstFootNote === "") {
      firstFootNote = footnote;
    }

    // need to remove the return link to the footnote in footnoteContent
    var footnoteContent = footnoteContent.replace(footnote_re, "");

    // need to remove the link on the footnote reference
    var refHtml = jQuery(this).html();
    jQuery(this).remove("a");
    jQuery(supItem).html(refHtml);

    // set the attributes for tooltipster to work
    supItem.attr("footNoteId", footnoteId);
    supItem.attr("class", "ci-tooltip");
    supItem.attr("data-tooltip-content", footnoteContent);
  });

  // if there were footnotes, then
  if (footnotes.length) {
    // add a <h3>Footnotes</h3> heading just before the list of footnote content
    var footNoteList = jQuery(firstFootNote).parent();
    jQuery(footNoteList).before("<h1>Footnotes</h1>");
    //remove the return anchor TODO replace it with something that works
    var footNoteListHtml = jQuery(footNoteList).html().replace(footnote_re, "");

    jQuery(footNoteList).html(footNoteListHtml);

    addToolTipster();
  }
}

function addToolTipster() {
  if (!TOOLTIPSTER_ADDED) {
    // add tooltipster if there are footnotes
    jQuery("head").append(
      "<link id='tooltipstercss' href='https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/css/tooltipster.bundle.min.css' type='text/css' rel='stylesheet' />"
    );
    jQuery.getScript(
      //"https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/js/tooltipster.bundle.js",
      "https://cdn.jsdelivr.net/npm/tooltipster@4.2.8/dist/js/tooltipster.bundle.min.js",
      function () {
        docWidth = Math.floor(jQuery(document).width() / 2);
        jQuery(".ci-tooltip").tooltipster({ maxWidth: docWidth });
      }
    );
    TOOLTIPSTER_ADDED = true;
  }
}

/***************************************************
 * setUpEdit
 * - Set up the edit/update process
 */

var HOW_TO = "";

const DOCUMENTATION_LINKS = {
  // Getting started
  whatWhy:
    "https://djplaner.github.io/Content-Interface-Tweak/background/whatWhy/",
  setUp: "https://djplaner.github.io/Content-Interface-Tweak/using/setup/",
  authorSetUp: "https://djplaner.github.io/Content-Interface-Tweak/using/authoringSetup/",
  syncSharedFolder: "https://djplaner.github.io/Content-Interface-Tweak/using/syncSharedFolder/",
  createModify:
    "https://djplaner.github.io/Content-Interface-Tweak/using/createAndModify/",
  automateUpdate:
    "https://djplaner.github.io/Content-Interface-Tweak/using/automatingUpdates/",
  // create text
  createText:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/",
  normalText:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#normal-and-the-default-text-style",
  headings:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#headings-and-the-accordion-heading-1-style",
  tables:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#tables",
  quotes:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#quotes",
  referenceLists:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#bibliographyreference-lists",
  footnotes:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/textualContent/#footnotes",

  // create web content
  createWeb:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/webContent/",
  images:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/webContent/#images",
  links:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/webContent/#links",
  embeds:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/webContent/#embedding-youtube-videos-and-beyond",
  transcripts:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/webContent/#generating-and-formatting-video-transcripts",

  // create university content
  createUniversity:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/",
  activities:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#activity",
  notes:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#note",
  asides:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#aside",
  readings:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#reading",
  poem:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#poem",
  faqs:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#faqs",
  universityDates:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#university-dates",
  filmWatching:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/universityContent/#film-watch-options",

  // create/use Blackboard content
  createBlackboard:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/blackboardContent/",
  menuItem:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/blackboardContent/#indirect-link-to-a-menu-item-blackboard-menu-link",
  contentItem:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/blackboardContent/#indirect-link-to-content-item-blackboard-content-link",
  reviewStatus:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/blackboardContent/#integrating-the-blackboard-review-status-feature",
  adaptiveRelease:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/blackboardContent/#hide-sections-using-blackboards-availability-control-mechanisms",
  // -- add cards
  cardsWhat:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/addCards/",
  cardsHow:
    "https://djplaner.github.io/Content-Interface-Tweak/creating/addCards/#how-to-add-cards-to-the-content-interface",

  // customise
  accordionOpen:
    "https://djplaner.github.io/Content-Interface-Tweak/customising/accordionOpening/",
  accordionAppearance:
    "https://djplaner.github.io/Content-Interface-Tweak/customising/accordionAppearance/",
  contentAppearance:
    "https://djplaner.github.io/Content-Interface-Tweak/customising/contentAppearance/",
  providePDF:
    "https://djplaner.github.io/Content-Interface-Tweak/customising/providePDF/",
  downloadButton:
    "https://djplaner.github.io/Content-Interface-Tweak/customising/downloadButton/",
};

var UPDATE_HTML = () => `
<style>
.gu_nopadding{
    padding-left: 1em;
    margin-top: 0;
}
</style>
  <div class="mx-auto border-none box-content px-4 py-2">
    <div class="flex flex-wrap -mx-1 lg:-mx-4 p-0">

        <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
            <article class="overlow-hidden rounded-lg shadow-lg h-full">
                <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                    <h4>
                      How to update the content
                    </h4>
                </header>
                <div class="p-2 md:p-4">
                ${HOW_TO}
                </div>
            </article>
        </div>

        <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
            <article class="overlow-hidden rounded-lg shadow-lg h-full">
                <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                    <h4>
                            <i class="fa fa-exclamation-triangle text-red"></i>
                            No changes to this item
                    </h4>
                </header>
                <div class="p-2 md:p-4">
                    <p>Any changes to this item will stop the Content Interface from working.</p>
                </div>
            </article>
        </div>

        <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
            <article class="overlow-hidden rounded-lg shadow-lg h-full">
                <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                    <h4>
                            <i class="fa fa-exclamation-triangle text-red"></i>
                            Do not hide this item
                    </h4>
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
 <ol style="padding-left:1em; margin-left:0">
   <li> Make any changes to the Content document, either <a id="gu_doc" target="_blank" href="http://griffith.edu.au">online</a> or directly.</li>
   <li>  Click the green button to <button style="background-color: #4CAF50; border: none; color: white; padding: 5px 5px; text-align: center; text-decoration: none; display: inline-block; border-radius: 12px" type="button" id="guUpdate">Update Content Interface</button>  </li>
   </ol>
 `;

var WORD_DOC_NOT_PRESENT = `<ol style="padding-left:1em; margin-left:0">
 <li>Make any change in the matching Word document.</li>
 <li><a href="https://djon.es/gu/mammoth.js/browser-demo/" target="_blank" rel="noreferrer noopener">Convert the Word document into HTML</a>.</li>
 <li>Copy and paste the HTML into {EDIT_CONTENT_ITEM}. <br />
 <p>See this <a href="http://www.bu.edu/tech/services/teaching/lms/blackboard/how-to/copypaste-into-blackboard-learn/">explanation on how to copy and paste HTML</a> into Blackboard content items.</p>
 </li>
 </ol>
 <p>To semi-automate this process, you can:</p>
 <ol style="padding-left:1em; margin-left:0">
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
                <h4>
                        Get started
                </h4>
            </header>
            <div class="p-2 md:p-4">
                <p><a target="_blank" href="${DOCUMENTATION_LINKS.whatWhy}">
                   Content Interface: what and why</a></p>
               <p>How to...</p>
               <ul style="padding-left: 1em; margin-left:0">
                  <li> <a target="_blank" href="${DOCUMENTATION_LINKS.setUp}">
                        set up a single Blackboard page</a> </li>
                  <li> <a target="_blank" href="${DOCUMENTATION_LINKS.createModify}">
                        create and modify content</a> (an overview) </li>
                  <li> <i class="fa fa-plus-square text-green"></i> <a target="_blank" href="${DOCUMENTATION_LINKS.authoringSetUp}">
                        set up a course authoring environment</a> </li>
                  <li> <a target="_blank" href="${DOCUMENTATION_LINKS.automateUpdate}">
                        automate content updates</a> <br />
                        <mark><strong>New:</strong> experimental feature</mark>
                        </li>
                  <li> <i class="fa fa-plus-square text-green"></i>
                  <a target="_blank" href="${DOCUMENTATION_LINKS.syncSharedFolder}">
                        syncing a shared folder</a> </li>
              </ul>

            </div>
        </article>
    </div>

    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h4>
                  Create <a href="${DOCUMENTATION_LINKS.createText}">
                    text content</a>
                </h4>
            </header>
            <div class="p-2 md:p-4">
    <ul style="padding-left: 1em; margin-left:0">
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
                <h4>
                 Create <a href="${DOCUMENTATION_LINKS.createWeb}">web content</a>
                </h4>
            </header>
            <div class="p-2 md:p-4">
     <ul style="padding-left: 1em; margin-left:0">
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
         <li>  <i class="fa fa-plus-square text-green"></i>  
         <a target="_blank" href="${DOCUMENTATION_LINKS.transcripts}">
              Adding online video transcripts </a> 
        </li>
      </ul>
            </div>
        </article>
    </div>

    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h4>
                 Create University content
                </h4>
            </header>
            <div class="p-2 md:p-4">
     <ul style="padding-left: 1em; margin-left:0">
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.activities}">
         Activities
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.notes}">
         Notes
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.asides}"> 
         Asides
            </a>
         </li>
         <li> <a target="_blank" href="${DOCUMENTATION_LINKS.readings}">
         Readings
            </a>
         </li>
         <li> <i class="fa fa-plus-square text-green"></i><a target="_blank" href="${DOCUMENTATION_LINKS.poem}">
         Poems
            </a>
         </li>
         <li> <i class="fa fa-plus-square text-green"></i><a target="_blank" href="${DOCUMENTATION_LINKS.faqs}">
         FAQs
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
                <h4>
                  Use Blackboard items and features
                </h4>
            </header>
            <div class="p-2 md:p-4">
    How do you...   
     <ul style="padding-left: 1em; margin-left:0">
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
         <li> <i class="fa fa-plus-square text-green"></i> 
            use <a target="_blank" href="${DOCUMENTATION_LINKS.adaptiveRelease}"> 
            Blackboard availability features</a> to hide sections<br />
            <mark><strong>Updated</strong>: new method</mark>
         </li>
      </ul>
      How to link to Blackboard content items with cards...
      <ul style="padding-left: 1em; margin-left:0">
        <li> <a target="_blank" href="${DOCUMENTATION_LINKS.cardsWhat}">What and why?</a>
        </li>
        <li> <a target="_blank" href="${DOCUMENTATION_LINKS.cardsHow}">How to add cards</a>
        </li>
        </ul>
            </div>
        </article>
    </div>


    <div class="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
        <article class="overlow-hidden rounded-lg shadow-lg h-full">
            <header class="flex items-center justify-between leading-tight p-2 md:p-4 border-b">
                <h4>
                 Customise the interface
                </h4>
            </header>
            <div class="p-2 md:p-4">
    How do you customise...   
     <ul style="padding-left: 1em; margin-left:0">
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
      <p><i class="fa fa-plus-square text-green"></i> 
          Enable <a target="_blank" href="${DOCUMENTATION_LINKS.providePDF}">download PDF</a><br />
    <mark><strong>Updated</strong>: now dynamic PDF generation you can add yourself</mark>
      </p>
      <p><i class="fa fa-plus-square text-green"></i> 
      Add a <a target="_blank" href="${DOCUMENTATION_LINKS.downloadButton}">"download button"</a> that links to arbitrary web link
  </p>

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
  if (typeof contentId === "undefined") {
    jQuery("#gu_update").html(CONTENT_INTERFACE_NOT_PRESENT);
    return;
  }

  // Has a link  to the word doc been shared
  var path = params.wordDoc;

  if (typeof path === "undefined") {
    // Word document is not defined
    HOW_TO = WORD_DOC_NOT_PRESENT;
    let html = UPDATE_HTML() + INSTRUCTIONS;

    // add in link to edit the content item
    var editContent =
      'into the <a href="https://bblearn-blaed.griffith.edu.au/webapps/blackboard/execute/manageCourseItem?content_id=' +
      contentId +
      "&course_id=" +
      courseId +
      '&dispatch=edit">Content Interface content item</a>';

    html = html.replace("{EDIT_CONTENT_ITEM}", editContent);

    // console.log("edit content item is " + editContent);
    jQuery("#gu_update").html(html);
    return;
  }

  //jQuery(".gu_docNotPresent").hide();
  HOW_TO = WORD_DOC_PRESENT;
  let updateHtml = UPDATE_HTML() + INSTRUCTIONS;

  if (jQuery("#gu_jqueryStyle").length) {
    updateHtml = updateHtml + CHANGE_TEMPLATE;
  }
  jQuery("#gu_update").html(updateHtml);

  jQuery("#gu_doc").attr("href", path);

  // remove #6 type links from end of path (breaks conversion)
  //console.log( "path was " + path );
  path = path.replace(/#[0-9]*$/, "");
  // console.log( "path is " + path );
  // encode path ready for going via URLs
  path =
    "u!" +
    btoa(path).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");

  //---------------------------------------------------
  // Set up the click event for the submit button
  // get the courseId

  jQuery("#guUpdate").click(function (event) {
    // if href currently includes blaed then add parameter
    var blaed = "";
    var link = window.location.href;
    if (link.match(BLAED_LINK) !== null) {
      blaed = "&blaed=1";
    }
    window.location.href =
      "https://djon.es/gu/mammoth.js/browser-demo/oneDriveMammoth.html?course=" +
      courseId +
      blaed +
      "&content=" +
      contentId +
      "&path=" +
      path;
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
  paramsObj.downloadPDF = false;
  paramsObj.downloadPDFURL = DEFAULT_PRINT_CSS;

  // Check parameters in the Content Interface item title
  if (contentInterface.length > 0) {
    var contentInterfaceTitle = jQuery.trim(contentInterface.text());

    var m = contentInterfaceTitle.match(/content interface\s*([^<]+)/i);
    let x;
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
          if (element.match(/hideMissingSections/i)) {
            paramsObj.hideMissingSections = true;
          }
          if (element.match(/collapseall/i)) {
            //console.log("Collapse all");
            paramsObj.collapseAll = true;
          }
          if (element.match(/noaccordion/i)) {
            paramsObj.noAccordion = true;
          }
          if (element.match(/downloadpdf/i)) {
            paramsObj.downloadPDF = true;

            x = element.match(/downloadpdf=(.*)/i);
            if (x && isValidHttpUrl(x[1])) {
              paramsObj.downloadPDFURL = x[1];
            }
          }
          /*if ( x = element.match(/wordDoc=([^ ]*)/i) ) {
                        paramsObj.wordDoc = x[1];
                    }*/
          x = element.match(/expand=([0-9]*)/i);
          if (x) {
            paramsObj.expand = x[1];
          }
          m = element.match(/^reviewed=(.*)/iu);
          if (m) {
            REVIEWED = m[1];
          }
          m = element.match(/^markReviewed=(.*)/i);
          if (m) {
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

  for (let paramKey in ITEM_LINK_PARAMETERS) {
    const obj = ITEM_LINK_PARAMETERS[paramKey];

    /*if ( paramKey in paramsObj ) {
            continue;
        }*/

    // element is the h3 wrapped around the link
    element = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element)
      .find(".item h3")
      .filter(':contains("' + paramKey + '")')
      .eq(0);
    // only if it's found
    if (element.length > 0) {
      paramsObj[obj.element] = element;
      // the type of content, depends on the type
      if (obj.type === "contentItem") {
        // content is element.parent.sibling(div.details)
        // and then remove all the vtbgenertedt_div crap
        let tipContent = jQuery(paramsObj[obj.element])
          .parent()
          .next("div.details")
          .html();
        tipContent = tipContent.replace(/class="vtbegenerated_div"/g, "");
        tipContent = tipContent.replace(/class="vtbegenerated"/g, "");
        tipContent = tipContent.replace(/(?:\r\n|\r|\n)/g, " ");
        paramsObj[obj.item] = tipContent;
      } else {
        // assume a link item
        paramsObj[obj.element] = element;
        paramsObj[obj.item] = jQuery(paramsObj[obj.element])
          .children("a")
          .attr("href");
      }
    }
  }

  //     addCSS( cssURL );
  // Check for a Word doc link
  //var wordDoc = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find(".item h3").filter(':contains("Content Document")').eq(0);

  var wordDocLink = jQuery(wordDoc)
    .find("a:contains('Content Document')")
    .attr("href");

  if (typeof wordDocLink !== "undefined") {
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
  var numCards = cardElements.length,
    currentCard = 0;
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
      if (
        !jQuery(cardElements[currentCard - 1])
          .next()
          .is("div.bbCard")
      ) {
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
  addCardClickHandler();
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
    cardContent[i].addEventListener(
      "click",
      function (e) {
        // aim here is to allow internal links to override the
        // cardmainlink
        e.stopPropagation();
      },
      false
    );
  }
}

/**
 * @function addCardClickHandler()
 * - add the clickable card handlers, once, not per accordion
 */

function addCardClickHandler() {
  /* Make all of the cards clickable by adding an event handler  */
  // Does this unwrap actually do anything???
  //jQuery( ".cardmainlink[href='undefined'" ).contents().unwrap();
  //return true;
  cards = document.querySelectorAll(".clickablecard");
  //var cards = document.querySelectorAll(".cardmainlink");
  for (i = 0; i < cards.length; i++) {
    cards[i].addEventListener(
      "click",
      function (e) {
        var link = this.querySelector(".cardmainlink");

        if (link !== null) {
          // prevent clicking on a undefined blackboard link
          if (link.match(/blackboard\/content\/undefined$/)) {
            console.log("Undefined");
          } else {
            link.click();
          }
        }
      },
      false
    );
  }
}

/*--------------------------------------------------------
 * getCardBbItem( element )
 * - given a HTML element (from the Content Interface) that contains card Details
 * - return a pointer to the BbItem that should be on this web page with a title matching
 * - return undefined if no matching BbItem
 */

function getCardBbItem(element) {
  // get the title from the content document
  let title = jQuery(element).text().trim();
  // replace the smart quotes
  title = title.replace(/\u2013|\u2014/g, "-");
  title = title.replace(/[\u201c\u201d]/g, '"');
  title = title.replace(/[\u201c\u201d]/g, '"');

  // need to escape title to behave for use in regex match
  // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
  let reTitle = title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  // get all the Bb content items
  let selector = `${tweak_bb.page_id} > ${tweak_bb.row_element}`;
  let bbItems = document.querySelectorAll(selector);
  // find those matching the title
  // Because foreach can't be broken out of, need to include
  // all of the matches and then pick the first
  let matches = [];
  bbItems.forEach(function (elem, index, list) {
    // get the first h3
    let heading = elem.querySelector("h3");

    // a match trying to handle card labels and is case insensitive
    const re = new RegExp(`^\s*[^:]*:*\\s*${reTitle}\s*$`, "i");
    // does it match the title, than save them all
    if (heading.innerText.match(re) || heading.innerText === title) {
      matches.push(heading);
    }
  });

  // no matches, undefined
  if (matches.length === 0) {
    return undefined;
  }
  // log that we found a few more
  if (matches.length > 1) {
    console.log(`Found ${matches.length} matches for title "${title}"`);
  }

  // always return the first match
  return jQuery(matches[0]);
}

/**
 * @function handleBlackboardItem
 * @param (this) jQuery object
 * Passed a jQuery object to a h1/h2 styles as Blackboard Item Heading
 * - Check if a matching content item can be found on the page (matches name)
 * - if it's not present and edit mode off, hide the heading and its section
 * - if it is present, show the heading/section and if the item has Bb's review status
 *   turned on, add that to the heading and section appropriately
 */

function handleBlackboardItem() {
  let hidden_string = " (section hidden from some students)";
  // editMode is off if listContent.js is in the doc href
  let editModeOff = location.href.indexOf("listContent.jsp") > 0;

  // get the title from the Blackboard Item Heading (2)
  let title = jQuery(this).text();
  const linkText = jQuery(this).text();

  /* Find the matching Blackboard element heading (h3) */
  // Ignore any within the Content Interface
  let bbItem = jQuery("h3:textEquals(" + title + ")").filter(function () {
    const parent = jQuery(this).parents("#GU_ContentInterface");
    return parent.length === 0;
  });

  // more than one matching item found, add error warning if editModeOn
  if (bbItem.length > 1) {
    console.log(
      `Error found more than 1 (${bbItem.length} content items matching title`
    );
    if (!editModeOff) {
      const warningString = ` <span class="gu-red">(found ${bbItem.length} matching content items)</span>`;
      jQuery(this).html(linkText + warningString);
    }
  } else if (bbItem.length === 0) {
    // hide missing sections lfor students, if no matching item and we want to hide
    if (editModeOff && "hideMissingSections" in PARAMS) {
      // hide from this heading until the next heading of the same level
      jQuery(this).parent().hide();
      //jQuery(this).nextUntil(this.tagName).hide();
      // hide the heading
      ////jQuery(this).hide();
      // hide the bb content item
      jQuery(bbItem).parent().parent().hide();
    } else {
      // teacher viewing gets an error message when no item found
      if (!editModeOff) {
        const warningString = ` (no matching content item found)`;
        jQuery(this).text(linkText + warningString);
      }
    }
  } else if (bbItem.length === 1) {
    // found 1 matching item,

    // check to see if the item is actually hidden
    // i.e it's item contains a certain text
    const hidden =
      jQuery(bbItem)
        .parent()
        .next()
        .find(".contextItemDetailsHeaders")
        .filter(":contains('Item is hidden from students.')").length === 1;
    const staffReview =
      jQuery(bbItem)
        .parent()
        .next()
        .find(".contextItemDetailsHeaders")
        .filter(":contains('Review')").length === 1;

    // add review status if set and content item isn't hidden
    if (!hidden) {
      const reviewLink = getReviewStatusContent(bbItem);
      if (typeof reviewLink !== "undefined") {
        //-- update the title
        addReviewLink(this, reviewLink);
        // hide the content item
        jQuery(bbItem).parent().parent().hide();
      }
      // EditModeOn doesn't give a review button i.e. staffReview, show message
      if (staffReview) {
        jQuery(this).text(linkText + " (Review status on)");
      }
    } else {
      // can only get here if editModeOff
      const warningString = ` (section hidden from some/all students)`;
      jQuery(this).text(linkText + warningString);
    }
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

  var reviewHeadingTemplate = "";
  if (reviewLink.match(/markUnreviewed/)) {
    reviewHeadingTemplate = `
      <span style="float:right" class="gu-ci-review ui-state-disabled ui-corner-all">{TEXT}</span>
      `;
    reviewHeadingTemplate = reviewHeadingTemplate.replace("{TEXT}", REVIEWED);
  } else {
    reviewHeadingTemplate = `
          <span style="float:right" class="gu-ci-review ui-state-active ui-corner-all">{TEXT}</span>
          `;
    reviewHeadingTemplate = reviewHeadingTemplate.replace(
      "{TEXT}",
      MARK_REVIEWED
    );
  }
  jQuery(item).html(linkText + reviewHeadingTemplate);

  // content is now the div with the accordion wrapper
  content = jQuery(item).next();

  reviewBodyTemplate = "";

  if (reviewLink.match(/markUnreviewed/)) {
    reviewBodyTemplate = `
          <!--<div class="p-4 absolute pin-l" style="float:right">-->
 <div class="p-4 gu-ci-review" style="margin:auto; width:100%; text-align:right">
     <a class="gu-bb-review" href="{LINK}"><button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
                     <span class="font-bold rounded-full px-2 py-1 bg-green text-white">&#10003; {TEXT}</span>&nbsp;</button></a>
 </div>
 `;
    reviewBodyTemplate = reviewBodyTemplate.replace("{TEXT}", REVIEWED);
  } else {
    reviewBodyTemplate = `
 <div class="p-4 gu-ci-review" style="margin:auto; width:100%; text-align:right"> 
      <a class="gu-bb-review" href="{LINK}"><button class="bg-transparent hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
      <span class="font-bold rounded-full px-2 py-1 bg-yellow text-black">&#x26a0;</span>&nbsp; {TEXT}</button></a>
 </div>
         `;
    reviewBodyTemplate = reviewBodyTemplate.replace("{TEXT}", MARK_REVIEWED);
  }
  reviewBodyTemplate = reviewBodyTemplate.replace("{LINK}", reviewLink);
  // insert the reviewed button before the first item after the heading
  // insert it as the first child of the accordion div
  jQuery(content).prepend(reviewBodyTemplate);
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
  title = jQuery(this).parent().attr("href");

  if (typeof title === "undefined") {
    title = jQuery(this).find("a").first().attr("href");
    inner = true;
  }

  if (typeof title !== "undefined") {
    title = title.replace(/%20/g, " ");
  }

  // define pseudo function to do comparison to get exact match, but
  // case insensitive
  jQuery.expr[":"].textEquals =
    jQuery.expr[":"].textEquals ||
    jQuery.expr.createPseudo(function (arg) {
      return function (elem) {
        return (
          elem.textContent.trim().localeCompare(arg, undefined, {
            sensitivity: "base",
          }) === 0
        );
      };
    });

  /* Find the matching Blackboard element heading (h3) */
  var bbItem = jQuery(tweak_bb.page_id + " > " + tweak_bb.row_element).find(
    "h3:textEquals(" + title + ")"
  );

  /*console.log("Looking for content link title " + title + " found " + bbItem.length);
    console.log(jQuery(this).html());
    console.log(bbItem);*/

  if (bbItem.length === 0) {
    // not found, so add hidden_string
    spanText = jQuery(this).text();
    jQuery(this).text(spanText + hidden_string);
  } else if (bbItem.length > 1) {
    console.log(
      "Error found more than 1 (" +
        bbItem.length +
        ") entries matching " +
        title
    );
  } else if (bbItem.length === 1) {
    // get the link
    var link = jQuery(bbItem).children("a").attr("href");

    // if there's no link, then check to see if it's TurnitIn
    // (which puts the link in the body)
    if (link == null) {
      // Assume it's a TurnitIn and look for "View Assignment" link
      // Have to go up to the parent and onto the next div
      link = jQuery(bbItem)
        .parent()
        .next()
        .children(".vtbegenerated")
        .children("a");
      var text = link.text();
      if (text === "View Assignment") {
        // we've found a Safe Assignment link
        link = link.attr("href");
      }
    }

    // check to see if the item is actually hidden
    hidden = jQuery(bbItem)
      .parent()
      .next()
      .find(".contextItemDetailsHeaders")
      .filter(":contains('Item is hidden from students.')");
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
      jQuery(this).parent().attr("href", link);
      // Kludge - occasionally Blackboard adds an onclick
      // handler for links
      jQuery(this).parent().attr("onclick", "");
    } else {
      jQuery(this).find("a").first().attr("href", link);
      // Kludge - occasionally Blackboard adds an onclick
      // handler for links
      jQuery(this).find("a").first().attr("onclick", "");
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
  title = jQuery(this).parent().attr("href");
  if (typeof title === "undefined") {
    linkParent = false;
    title = jQuery(this).children("a").first().attr("href");
  }

  if (typeof title !== "undefined") {
    title = title.replace(/%20/g, " ");
  }
  /* Find the course menu link that matches */
  var bbItem = jQuery(
    "#courseMenuPalette_contents > li > a > span[title='" + title + "']"
  );

  // how many did we find?
  if (bbItem.length === 0) {
    // not found, so add hidden_string
    spanText = jQuery(this).text();
    jQuery(this).text(spanText + hidden_string);
  } else if (bbItem.length > 1) {
    console.log(
      "Error found more than 1 (" +
        bbItem.length +
        ") entries matching " +
        title
    );
    spanText = jQuery(this).text();
    jQuery(this).text(spanText + duplicate_menu_string);
  } else if (bbItem.length === 1) {
    // get the link from the menu item
    var link = jQuery(bbItem).parent().attr("href");
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
      jQuery(this).parent().attr("href", link);
    } else {
      jQuery(this).children("a").first().attr("href", link);
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
  s = s.replace(/[\u2018\u2019\u201A]/g, "'");
  // smart double quotes
  s = s.replace(/[\u201C\u201D\u201E]/g, '"');
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
    var id = matches[1],
      width = "640",
      height = "480";

    //console.log('Match 0 ' + matches[0] + " 1 " + matches[1]);
    text =
      '<div class="youtube-article">' +
      '<iframe class="dt-youtube" width="' +
      width +
      '" height="' +
      height +
      '" src="https://www.youtube.com/embed/' +
      id +
      '" frameborder="0" allowfullscreen></iframe></div>';

    //console.log( "Ending with " + text);
    jQuery(this).html(text);
  });
}

//*** Experiements to see if I can open all by function call **

function openAll() {
  //console.log("Open ALL ");
  jQuery(".ui-accordion-header")
    .removeClass("ui-corner-all")
    .addClass("ui-accordion-header-active ui-state-active ui-corner-top")
    .attr({
      "aria-selected": "true",
      tabindex: "0",
    });
  jQuery(".ui-accordion-header-icon")
    .removeClass(icons.header)
    .addClass(icons.headerSelected);
  jQuery(".ui-accordion-content")
    .addClass("ui-accordion-content-active")
    .attr({
      "aria-expanded": "true",
      "aria-hidden": "false",
    })
    .show();
  jQuery(this).attr("disabled", "disabled");
  jQuery(".gu_content_close").removeAttr("disabled");
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
  "card label",
  "card number",
  "card date",
  "card date label",
  "card coming soon",
  "card coming soon label",
  "assessment type",
  "assessment weighting",
  "assessment outcomes",
  "card image",
  "card image iframe",
  "card image size",
  "card image active",
];

function extractCardMetaData(descriptionObject) {
  // define hash to put values into it
  let metaDataValues = {};
  let description = jQuery(descriptionObject).html();
  // remove new lines from description
  if (typeof description === "undefined") {
    return false;
  }
  description = description.replace(/(?:\r\n|\r|\n)/g, " ");

  // break up description into collection of ps and focus
  // use outerHTML to get the surrounding <p> etc so that it can be removed from
  // the description
  // TODO: Does this change screw up the complex shit that other people can
  //  do when they use line breaks, include HTML etc
  let elementHtmlObjects = jQuery(descriptionObject).find("p");
  let elementContent = jQuery(elementHtmlObjects)
    .toArray()
    .map((x) => x.innerHTML);

  let tmpMetaData = [];

  //console.log("----------------------- extractCardMetaData");
  // check and break up the ps into individual bits of meta data
  let maxLength = elementContent.length;
  for (i = 0; i < maxLength; i++) {
    //       console.log(`    _____________ working on para ${i} == ${elementContent[i]}`);
    // work on a temp copy of description
    //let partialDescription = elementContent[i].innerHTML;
    let partialDescription = elementContent[i];
    // get rid of newlines (definitely needed)
    partialDescription = partialDescription.replace(/(?:\r\n|\r|\n)/g, " ");

    CARD_METADATA_FIELDS.forEach(function (element) {
      // search for the element, but initially assume that there is another
      // metadata variable within the current item (i.e. <p> </p>)
      // This happens when a <br> is used, rather than <p> between metadata
      // look for element, followed by a card metadata
      let re = new RegExp(
        "(" +
          element +
          "\\s*:\\s*.*)cards+(?:label|number|date|date label|image size|image active)[^:]*:",
        "mi"
      );
      let m = partialDescription.match(re);
      // if not, check for assessment
      if (!m) {
        re = new RegExp(
          "(" +
            element +
            "\\s*:\\s*.*)assessments+(?:type|weighting|outcomes)[^:]*:",
          "mi"
        );
        m = partialDescription.match(re);
      }

      // if found, then we need extract just the matched element, leaving
      // the rest for a later iteration
      if (m) {
        //              console.log(`     -- found partial Descripiton match ${m[1]}`);
        // remove match from partialDescription, leaving any other potential
        // card stuff there for later (hence why m[1], not m[0])
        partialDescription = partialDescription.replace(m[1], "");
        // remove the match from the broader description
        //description = description.replace(m[1],'');
        // TODO does raise the question of why m[0] okay here
        description = description.replace(m[1], "");
        // added element for later processing - but remove the &nbsp;
        tmpMetaData.push(m[1].replace(/&nbsp;/gi, " "));
      } else {
        // the <p> contains just the one metadata, replace the whole para
        // bad at RE, so check if it's the last one
        //             console.log("     -- bad RE???");
        re = new RegExp("(" + element + "\\s*:\\s*.*)", "mi");
        //                re = new RegExp( "<p.*(" + element + "\\s*:\\s*.*)</p>$", "mi" );
        m = partialDescription.match(re);
        if (m) {
          // remove it from partial description
          //partialDescription = partialDescription.replace(re,'');
          partialDescription = partialDescription.replace(m[1], "");
          // remove the match from the broader description
          // TODO doesn't remove the surrounding <p> </p>
          //                    description = description.replace(m[1],'');
          description = description.replace(m[1], "");
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
  for (i = 0; i < tmpMetaData.length; i++) {
    // extract the metaData label m[1] and value m[2]
    let re = new RegExp("\\s*(card\\s*[^:]*)\\s*:\\s*(.*)", "im");
    let m = tmpMetaData[i].match(re, "im");

    // didn't find a card value, try one of the assessment ones
    if (!m) {
      re = new RegExp("\\s*(assessment\\s*[^:]*)\\s*:\\s*(.*)", "im");
      m = tmpMetaData[i].match(re, "im");
    }

    if (m) {
      // extract label and value
      // ensure label matches METADATA name archetypes
      let label = m[1].trim().replace(/\\s*/, " ").toLowerCase();
      let value = m[2];
      // make sure the HTML in value is valid
      let div = document.createElement("div");
      div.innerHTML = value;
      let newValue = div.innerHTML;

      metaDataValues[label] = newValue;
    }
  }

  // used to edit the description element and ensure that it is correct HTML
  let div = document.createElement("div");
  div.innerHTML = description;
  // not used in inlineImage (yet)

  // handle the inline image
  let inlineImage = jQuery(descriptionObject)
    .find("img")
    .attr("title", "Card Image");

  //   Exclude /images/ci/icon/cmlink_generic.gif from img
  if (inlineImage.length && !inlineImage[0].src.includes(BBIMG)) {
    // we have real image
    // replace the card image value with the inline image
    metaDataValues["card image"] = inlineImage[0].src;
    // remove the inline image content from the description
    let img = jQuery(div).find(`img[src="${inlineImage[0].src}"]`).remove();
  }

  // there may also be other .contextMenuContainer elements that will need to be removed
  // because Bb needs to do more work, but only does it if they are in .vtbgenerated (which cards are not)
  // there may be other Bb additions that need cleaning
  // e.g.
  // - TODO spans with attr data-ally-scoreindicator

  // remove the .contextMenuContainers from description
  let menuContainers = jQuery(div).find(".contextMenuContainer").remove();

  // Make sure that the description is valid HTML (mostly closing tags)
  // jQuery handles this by default
  description = div.innerHTML;
  // remove any empty <p> tags from desciption
  description = description.replace(/<p>\s*<\/p>/g, "");
  // add the description minus metadata to metaDataValues, for later use
  metaDataValues.description = description;

  return metaDataValues;
}

//------------------------------------------------------
// FUNCTIONS to handle card meta data changes

//handleCardImage()
// - given value associated with "card image", could be URL or html

function handleCardImage(param) {
  let picUrl = "",
    cardBGcolour = "black";

  // is it a data URI, just return it
  regex = /^data:((?:\w+\/(?:(?!;).)+)?)((?:;[\w\W]*?[^;])*),(.+)$/;
  if (regex.test(param)) {
    return [param, cardBGcolour];
  }

  // check to see if it's a colour, rather than an image
  // TODO might need to modify identifyPicUrl to remove extraneous
  // lead html if there is a href?? after img src is checked??
  picUrl = identifyPicUrl(param);
  cardBGcolour = identifyCardBackgroundColour(param);

  // TODO/CHECK previously there was a test to remove a trainling </p> from end
  // Maybe this should be handled in the picURL

  return [picUrl.trim(), cardBGcolour];
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
  if (param.includes("contain")) {
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
  let empty1 = { date: "", week: "" };
  let empty2 = { date: "", week: "" };
  let date = { start: empty1, stop: empty2 }; // object to return

  param = param.replace(/<[^>]+>/, "");

  // is it a range (i.e. contain a -)
  let m = param.match(/^(.*)-(.*)$/);

  if (m) {
    // get first date and break it down
    date.start = parseDate(m[1]);
    // get second date and break it down
    // TODO Week 3-5 results in m[2] being just 5 (need to add week)
    // m[2]==int then add week

    date.stop = parseDate(m[2].trim(), true);
    //        if ( /^\+?(0|[1-9]\d*)$/.test(m[2].trim()) ) {
    //           m[2] = "Week ".concat(m[2].trim());
    //      }
    //     date.stop = parseDate(m[2]);
    if (date.stop.time === "") {
      date.stop.time = "23:59";
    }
  } else {
    // not a range
    // get the date and break it down
    date.start = parseDate(param);
  }
  // if no time defined, set the default (midnight)
  if (date.start.time === "") {
    date.start.time = "0:01";
  }
  return date;
}

/**
 * @function parseDate
 * @param {String} param
 * @param {Boolean} endRange is the param at the end of a date range?
 * @returns {Object} date
 * @description Convert string date - (HH:MM) (Week 1) (Mar 25) into date
 *    if endRange and date is a trimester week, then set the date to Friday of that week
 */

function parseDate(param, endRange = false) {
  let date = {}; // object to return
  let time = "";

  // check for a time at the start of the date and save it away
  //  then add it at the end
  // HH:MM 24-hour format, optional leading 0, but with whitespace at end
  const regex = /\s*([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]\s*$/;
  let m = param.match(regex);

  if (m) {
    // save the time
    time = m[0];
    // remove time from param
    param = param.replace(regex, "");
  }
  // a number by itself is the scond part of a week period
  // add week
  if (/^\+?(0|[1-9]\d*)$/.test(param)) {
    param = "Week ".concat(param);
  }

  // is it a week of trimester
  m = param.match(/^\s*week\s*([0-9]*)/i);
  if (m) {
    week = m[1];
    if (!endRange) {
      // just get Monday
      date = getTermDate(week);
    } else {
      // end of range should return friday
      date = getTermDate(week, true, "Fri");
    }
  } else {
    // does it have a day of week
    // start date becomes start of week + number of days in
    m = param.match(
      /^\s*\b(((mon|tues|wed(nes)?|thu|thur(s)?|fri|sat(ur)?|sun)(day)?))\b\s*week *([0-9]*)\s*$/i
    );
    if (m) {
      day = m[1];
      week = m[m.length - 1];
      date = getTermDate(week, true, day);
    } else {
      // is it the an actual date
      m = param.match(/ *([a-z]+) ([0-9]+)/i);
      if (m) {
        date = { month: m[1], date: m[2], year: DEFAULT_YEAR };
      }
      //else {
      // Fall back to check for exam period
      //   m = param.match(/ *exam *(period)*/i);
      //   if (m) {
      //       date.start = getTermDate('exam');
      //       date.stop = getTermDate('exam', false);
      //    }
      // }
    }
  }
  if (time !== "") {
    date.time = time;
  } else {
    date.time = "";
  }

  return date;
}

// Given some HTML, remove all the HTML code, trim and return the text

function cleanTrimHtml(html) {
  const aux = document.createElement("div");
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

function handleCardLabelNumber(label, number) {
  // Handle the cases where label is
  // - empty - we don't want a label
  // - undefined - we want the default label

  // ensure label is empty HTML (incl &nbsp; as empty)
  trimLabel = cleanTrimHtml(label);

  if (trimLabel === "") {
    // return no label or number if the label is empty (but defined)
    return ["", ""];
  } else if (typeof number !== "undefined" && number.match(/none/i)) {
    // if there is a card number and it is the word "none", then
    // return the label and an empty number
    // TODO, should this be label of trimLabel. i.e allow user defined
    // html to be included as part of the label?
    return [label, ""];
  } else if (typeof label === "undefined") {
    // set the label to the DEFAULT if no label specified
    // numbering gets decided below.
    trimLabel = DEFAULT_CARD_LABEL;
    label = DEFAULT_CARD_LABEL;
  }

  // Update the numbering schemes
  // - no existing numbering, set to 1
  // - otherwise increment existing
  if (!(trimLabel in CARD_LABEL_NUMBERING)) {
    CARD_LABEL_NUMBERING[trimLabel] = 1;
  } else {
    // if it does exist increment to next value
    CARD_LABEL_NUMBERING[trimLabel] += 1;
  }

  // if specific number specified, set numbering to that
  if (typeof number !== "undefined") {
    CARD_LABEL_NUMBERING[trimLabel] = parseInt(number);
  }

  return [label, CARD_LABEL_NUMBERING[trimLabel]];
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
  for (let i = 0; i < myCards.length; i++) {
    // oops didn't find that card
    if (typeof myCards[i] === "undefined") {
      // add the missing card thing
      let missingItem = {
        title: "Unable to find card",
        picUrl:
          "https://assets.prestashop2.com/sites/default/files/styles/blog_750x320/public/blog/2019/10/banner_error_404.jpg?itok=eAS4swln",
        bgSize: "",
        cardBGcolour: "",
        description: "<p>The card name does not match any item.</p>",
        date: { start: {}, stop: {} },
        label: "", //"Missing Card",
        link: undefined,
        linkTarget: undefined,
        review: undefined,
        dateLabel: "",
        id: "",
        activePicUrl: "",
        comingSoon: undefined,
        comingSoonLabel: "",
        assessmentWeighting: "",
        assessmentOutcomes: "",
        assessmentType: "",
      };
      items.push(missingItem);
      continue;
    }
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
    jQuery(jthis)
      .children('div.vtbegenerated_div,div:not([class=""])')
      .replaceWith(function () {
        return jQuery("<p />", { html: jQuery(this).html() });
      });
    let description = jQuery(jthis).html();

    if (typeof description !== "undefined") {
      // - get rid of any &nbsp; inserted by Bb
      description = description.replace(/&nbsp;/gi, " ");
      description = description.replace(/\n/gi, "");
    }

    // extract all the possible meta data
    let cardMetaData = extractCardMetaData(jthis);

    // now have cardMetaData with all meta data and the non meta data
    // description. Need to make the necessary changes based on data
    // loop through each of the elements (but not description)

    // tmp variables used to hold results before putting into single card object
    let bgSize = "",
      dateLabel = "Commencing",
      picUrl,
      cardBGcolour;
    let label = DEFAULT_CARD_LABEL,
      activePicUrl = "",
      number = "&nbsp;",
      iframe = "";
    let date,
      comingSoon,
      comingSoonLabel = "Available";
    let assessmentType = "",
      assessmentWeighting = "",
      assessmentOutcomes = "";

    for (let index in cardMetaData) {
      switch (index) {
        case "card image":
          [picUrl, cardBGcolour] = handleCardImage(cardMetaData[index]);
          break;
        case "card image active":
          activePicUrl = handleCardImage(cardMetaData[index]);
          break;
        case "card image iframe":
          iframe = handleCardImageIframe(cardMetaData[index]);
          break;
        case "card image size":
          bgSize = handleCardImageSize(cardMetaData[index]);
          break;
        case "card date":
          date = handleCardDate(cardMetaData[index]);
          break;
        case "card date label":
          dateLabel = cardMetaData[index];
          break;
        case "card coming soon":
          comingSoon = handleCardDate(cardMetaData[index]);
          break;
        case "card coming soon label":
          comingSoonLabel = cardMetaData[index];
          break;
        case "assessment type":
          assessmentType = cardMetaData[index];
          break;
        case "assessment weighting":
          assessmentWeighting = cardMetaData[index];
          break;
        case "assessment outcomes":
          assessmentOutcomes = cardMetaData[index];
          break;
      }
    }
    // handle card label and card number together
    [label, number] = handleCardLabelNumber(
      cardMetaData["card label"],
      cardMetaData["card number"]
    );

    // description changed to remove all the meta data
    description = cardMetaData.description;

    // TODO is this still used?
    // Find any ItemDetailsHeaders that indicate the item is hidden
    // TODO would it even work??
    hidden = jQuery(jthis)
      .parent()
      .find(".contextItemDetailsHeaders")
      .filter(":contains('Item is hidden from students.')");
    //.siblings('contextItemDetailsHeaders')

    // Grab the link that the card is pointing to
    // need to get back to the header which is up one div, a sibling, then span
    var header = jQuery(jthis).parent().siblings(".item").find("span")[2];
    //var header = jQuery(jthis).find("span")[2];
    var title = jQuery(header).html(),
      link,
      linkTarget = "";

    //--------------------------------
    // Three options for link
    // 1. A link on the header (e.g. content folder)
    // 2. No link (e.g. a content item)
    // 3. A link in the attached filed (content item with attached file)
    //    This one is kludgy. e.g. doesn't handle multiple files.
    //    Currently sets the link to the last file
    //    TODO figure out what do with multiple files
    link = jQuery(header).parents("a").attr("href");
    linkTarget = jQuery(header).parents("a").attr("target");

    // if link is empty, must be content item
    if (link === undefined) {
      // check to see if there are attached fileds
      filesThere = jQuery(jthis)
        .parent()
        .find(".contextItemDetailsHeaders")
        .filter(":contains('Attached Files:')");

      if (filesThere !== undefined) {
        // get a list of all attached files
        lis = jQuery(jthis)
          .parent()
          .find(".contextItemDetailsHeaders")
          .children(".detailsValue")
          .children("ul")
          .children("li");

        // loop through the files and get the link
        lis.each(function (idx, li) {
          // get the link
          link = jQuery(li).children("a").attr("href");
        });
      }
      //.siblings('contextItemDetailsHeaders')
    }

    // get the itemId to allow for "edit" link in card
    var itemId = jQuery(jthis).parents(".liItem").attr("id");
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
      title: title,
      picUrl: picUrl,
      bgSize: bgSize,
      cardBGcolour: cardBGcolour,
      description: description,
      date: date,
      label: label,
      link: link,
      linkTarget: linkTarget,
      review: review,
      dateLabel: dateLabel,
      id: itemId,
      activePicUrl: activePicUrl,
      comingSoon: comingSoon,
      comingSoonLabel: comingSoonLabel,
      assessmentWeighting: assessmentWeighting,
      assessmentOutcomes: assessmentOutcomes,
      assessmentType: assessmentType,
    };
    if (number !== "x") {
      item.moduleNum = number;
    }
    if (iframe !== "") {
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
  var month,
    endMonth,
    endDate,
    week = "",
    endWeek = "";
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
      /card date: *\b(((mon|tues|wed(nes)?|thur(s)?|fri|sat(ur)?|sun)(day)?))\b *week *([0-9]*)/i
    );
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
        x = description.match(
          /card date *: *([a-z]+) ([0-9]+)-+([a-z]+) ([0-9]+)/i
        );
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
          date.start = getTermDate("exam");
          date.stop = getTermDate("exam", false);
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
  var div = document.createElement("div"),
    m;
  div.style.color = input;
  // add to DOMTree to work
  document.body.appendChild(div);

  // extract the rgb numbers
  m = getComputedStyle(div).color.match(
    /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i
  );
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

/**
 * @function isValidHttpUrl
 * @param {String} string
 * @returns true if string is a valid HTTP url, false otherwise
 * HT: https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
 */

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

//*********************
// getTermDate( week )
// - given a week of Griffith semester return date for the
//   start of that week
// ** this is a version for cards, works slightly differently

function getTermDate(week, startWeek = true, dayOfWeek = "Monday") {
  if (typeof TERM_DATES[TERM] === "undefined") {
    return { date: undefined, month: undefined, year: undefined };
  }

  dayOfWeek = dayOfWeek.toLowerCase();
  //console.log("TERM is " + TERM + " week is " + week);
  let date = { date: "", month: "", week: week, year: 0 };
  if (week < 0 || week > 15) {
    if (week !== "exam") {
      return date;
    }
  }
  var start;
  if (startWeek === true) {
    // setting start week
    if (typeof TERM_DATES[TERM][week] !== "undefined") {
      start = TERM_DATES[TERM][week].start; //[week].start;
    }
  } else {
    start = TERM_DATES[TERM][week].stop;
  }
  var d = new Date(start);

  // if dayOfWeek is not Monday, add some days
  if (dayOfWeek !== "monday") {
    var dayToNum = {
      tuesday: 1,
      tue: 1,
      wednesday: 2,
      wed: 2,
      thursday: 3,
      thu: 3,
      friday: 4,
      fri: 4,
      saturday: 5,
      sat: 5,
      sunday: 6,
      sun: 6,
    };
    // add in the day abbreviation so it can appear
    date.day = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.substr(1, 2);
    if (dayOfWeek in dayToNum) {
      d.setDate(d.getDate() + dayToNum[dayOfWeek.toLowerCase()]);
    }
  }

  date.month = MONTHS[d.getMonth()];
  date.date = d.getDate();
  date.year = d.getFullYear();

  return date;
}

/* Griffith Calendar Term dates
 * 2021
 * - OUA Study Periods 1-4
 *   2211, 2213 2215 2217
 * - GU T1, T2, T3
 *   3211 3215 3218
 * - QCM T1 T2
 *   3211QCM 3215QCM
 * 2020
 * - OUA Study Periods 1-4
 *   2201 2203 2205 2207
 * - GU T1, T2, T3
 *   3201 3205 3208
 * 2019
 * - OUA SP 3, 4
 *   2195 2197
 * - GU T1, T2, T3
 *   3191 3195 319
 */

var TERM_DATES = {
  // dates for OUA 2022 study periods are the same as GU
  // trimesters, but with different periods. These are set
  // by assignment below.
  3221: {
    0: { start: "2022-03-07", stop: "2022-03-13" },
    1: { start: "2022-03-14", stop: "2022-03-20" },
    2: { start: "2022-03-21", stop: "2022-03-28" },
    3: { start: "2022-03-28", stop: "2022-04-03" },
    4: { start: "2022-04-04", stop: "2022-04-10" },
    5: { start: "2022-04-18", stop: "2022-04-24" },
    6: { start: "2022-04-25", stop: "2022-05-01" },
    7: { start: "2022-05-02", stop: "2022-05-08" },
    8: { start: "2022-05-09", stop: "2022-05-15" },
    9: { start: "2022-05-16", stop: "2022-05-22" },
    10: { start: "2022-05-23", stop: "2022-05-29" },
    11: { start: "2022-05-30", stop: "2022-06-05" },
    12: { start: "2022-06-06", stop: "2022-06-12" },
    13: { start: "2022-06-13", stop: "2022-06-19" },
    14: { start: "2022-06-20", stop: "2022-06-26" },
    15: { start: "2022-06-27", stop: "2022-07-03" },
    exam: { start: "2022-06-13", stop: "2022-06-25" },
  },
  '3221QCM': {
    0: { start: "2022-02-21", stop: "2022-02-27" },
    1: { start: "2022-02-28", stop: "2022-03-06" },
    2: { start: "2022-03-07", stop: "2022-03-13" },
    3: { start: "2022-03-14", stop: "2022-03-20" },
    4: { start: "2022-03-21", stop: "2022-03-27" },
    5: { start: "2022-03-28", stop: "2022-04-03" },
    6: { start: "2022-04-04", stop: "2022-04-10" },
    7: { start: "2022-04-18", stop: "2022-04-24" },
    8: { start: "2022-04-25", stop: "2022-05-01" },
    9: { start: "2022-05-09", stop: "2022-05-15" },
    10: { start: "2022-05-16", stop: "2022-05-22" },
    11: { start: "2022-05-23", stop: "2022-05-29" },
    12: { start: "2022-05-30", stop: "2022-06-05" },
    13: { start: "2022-06-06", stop: "2022-06-12" },
    14: { start: "2022-06-13", stop: "2022-06-19" },
    15: { start: "2022-06-20", stop: "2022-07-26" },
    exam: { start: "2022-06-13", stop: "2022-06-25" },
  },
  3225: {
    0: { start: "2022-07-11", stop: "2022-07-17" },
    1: { start: "2022-07-18", stop: "2022-07-24" },
    2: { start: "2022-07-25", stop: "2022-07-31" },
    3: { start: "2022-08-01", stop: "2022-08-07" },
    4: { start: "2022-08-08", stop: "2022-08-14" },
    5: { start: "2022-08-22", stop: "2022-08-28" },
    6: { start: "2022-08-29", stop: "2022-09-04" },
    7: { start: "2022-09-05", stop: "2022-09-11" },
    8: { start: "2022-09-12", stop: "2022-09-18" },
    9: { start: "2022-09-19", stop: "2022-09-25" },
    10: { start: "2022-09-26", stop: "2022-10-02" },
    11: { start: "2022-10-03", stop: "2022-10-09" },
    12: { start: "2022-10-10", stop: "2022-10-16" },
    13: { start: "2022-10-17", stop: "2022-10-23" },
    14: { start: "2022-10-24", stop: "2022-10-30" },
    15: { start: "2022-10-31", stop: "2022-11-06" },
    exam: { start: "2022-10-20", stop: "2022-10-29" },
  },
  '3225QCM': {
    0: { start: "2022-07-18", stop: "2022-07-24" },
    1: { start: "2022-07-25", stop: "2022-07-31" },
    2: { start: "2022-08-01", stop: "2022-08-07" },
    3: { start: "2022-08-08", stop: "2022-08-14" },
    4: { start: "2022-08-15", stop: "2022-08-21" },
    5: { start: "2022-08-22", stop: "2022-08-28" },
    6: { start: "2022-09-05", stop: "2022-09-11" },
    7: { start: "2022-09-12", stop: "2022-09-18" },
    8: { start: "2022-09-19", stop: "2022-09-25" },
    9: { start: "2022-10-03", stop: "2022-10-09" },
    10: { start: "2022-10-10", stop: "2022-10-16" },
    11: { start: "2022-10-17", stop: "2022-10-23" },
    12: { start: "2022-10-24", stop: "2022-10-30" },
    13: { start: "2022-10-31", stop: "2022-11-06" },
    14: { start: "2022-11-07", stop: "2022-11-13" },
    15: { start: "2022-11-14", stop: "2022-07-20" },
    exam: { start: "2022-11-07", stop: "2022-11-19" },
  },
  3228: {
    0: { start: "2022-10-31", stop: "2022-11-06" },
    1: { start: "2022-11-07", stop: "2022-11-13" },
    2: { start: "2022-11-14", stop: "2022-11-20" },
    3: { start: "2022-11-21", stop: "2022-11-27" },
    4: { start: "2022-11-28", stop: "2022-12-04" },
    5: { start: "2022-12-05", stop: "2022-12-11" },
    6: { start: "2022-12-12", stop: "2022-12-18" },
    7: { start: "2022-12-19", stop: "2022-12-25" },
    8: { start: "2023-01-09", stop: "2023-01-15" },
    9: { start: "2023-01-16", stop: "2023-01-22" },
    10: { start: "2023-01-23", stop: "2023-01-29" },
    11: { start: "2023-01-30", stop: "2023-02-05" },
    12: { start: "2023-02-06", stop: "2023-02-12" },
    13: { start: "2023-02-13", stop: "2023-02-19" },
    14: { start: "2023-02-20", stop: "2023-02-26" },
    15: { start: "2023-02-27", stop: "2023-03-05" },
//    exam: { start: "2023-02-17", stop: "2023-02-26" },
  },
 2211: {
    0: { start: "2021-02-22", stop: "2021-02-28" },
    1: { start: "2021-03-01", stop: "2021-03-07" },
    2: { start: "2021-03-08", stop: "2021-03-14" },
    3: { start: "2021-03-15", stop: "2021-03-21" },
    4: { start: "2021-03-22", stop: "2021-03-28" },
    5: { start: "2021-03-29", stop: "2021-04-04" },
    6: { start: "2021-04-05", stop: "2021-04-11" },
    7: { start: "2021-04-12", stop: "2021-04-18" },
    8: { start: "2021-04-19", stop: "2021-04-25" },
    9: { start: "2021-04-26", stop: "2021-05-02" },
    10: { start: "2021-05-03", stop: "2021-05-09" },
    11: { start: "2021-05-10", stop: "2021-05-16" },
    12: { start: "2021-05-17", stop: "2021-05-23" },
    13: { start: "2021-05-24", stop: "2021-05-30" },
    14: { start: "2021-05-31", stop: "2021-06-06" },
    exam: { start: "2021-05-31", stop: "2021-06-06" },
  },
  2213: {
    1: { start: "2021-05-31", stop: "2021-06-06" },
    2: { start: "2021-06-07", stop: "2021-06-13" },
    3: { start: "2021-06-14", stop: "2021-06-20" },
    4: { start: "2021-06-21", stop: "2021-06-27" },
    5: { start: "2021-06-28", stop: "2021-07-04" },
    6: { start: "2021-07-05", stop: "2021-07-11" },
    7: { start: "2021-07-12", stop: "2021-07-18" },
    8: { start: "2021-07-19", stop: "2021-07-25" },
    9: { start: "2021-07-26", stop: "2021-08-01" },
    10: { start: "2021-08-02", stop: "2021-08-08" },
    11: { start: "2021-08-09", stop: "2021-08-15" },
    12: { start: "2021-08-16", stop: "2021-08-22" },
    13: { start: "2021-08-23", stop: "2021-08-29" },
    exam: { start: "2021-08-30", stop: "2021-09-05" },
  },
  2215: {
    0: { start: "2021-08-23", stop: "2021-08-29" },
    1: { start: "2021-08-30", stop: "2021-09-05" },
    2: { start: "2021-09-06", stop: "2021-09-12" },
    3: { start: "2021-09-13", stop: "2021-09-19" },
    4: { start: "2021-09-20", stop: "2021-09-26" },
    5: { start: "2021-09-27", stop: "2021-10-03" },
    6: { start: "2021-10-04", stop: "2021-10-10" },
    7: { start: "2021-10-11", stop: "2021-10-17" },
    8: { start: "2021-10-18", stop: "2021-10-24" },
    9: { start: "2021-10-25", stop: "2021-10-31" },
    10: { start: "2021-11-01", stop: "2021-11-07" },
    11: { start: "2021-11-08", stop: "2021-11-14" },
    12: { start: "2021-11-15", stop: "2021-11-21" },
    13: { start: "2021-11-22", stop: "2021-11-28" },
    14: { start: "2021-11-29", stop: "2021-12-05" },
    exam: { start: "2021-11-29", stop: "2021-12-05" },
  },
  2217: {
    0: { start: "2021-11-22", stop: "2021-11-28" },
    1: { start: "2021-11-29", stop: "2021-12-05" },
    2: { start: "2021-12-06", stop: "2021-12-12" },
    3: { start: "2021-12-13", stop: "2021-12-19" },
    4: { start: "2021-12-20", stop: "2021-12-26" },
    5: { start: "2021-12-27", stop: "2022-01-02" },
    6: { start: "2022-01-03", stop: "2022-01-09" },
    7: { start: "2022-01-10", stop: "2022-01-16" },
    8: { start: "2022-01-17", stop: "2022-01-23" },
    9: { start: "2022-01-24", stop: "2022-01-30" },
    10: { start: "2022-01-31", stop: "2022-02-06" },
    11: { start: "2022-02-07", stop: "2022-02-13" },
    12: { start: "2022-02-14", stop: "2022-02-20" },
    13: { start: "2022-02-21", stop: "2022-02-27" },
    exam: { start: "2022-02-28", stop: "2022-03-04" },
  },
  3218: {
    0: { start: "2021-11-01", stop: "2021-11-07" },
    1: { start: "2021-11-08", stop: "2021-11-14" },
    2: { start: "2021-11-15", stop: "2021-11-21" },
    3: { start: "2021-11-22", stop: "2021-11-28" },
    4: { start: "2021-11-29", stop: "2021-12-05" },
    5: { start: "2021-12-06", stop: "2021-12-12" },
    6: { start: "2021-12-13", stop: "2021-12-19" },
    7: { start: "2021-12-20", stop: "2021-12-26" },
    8: { start: "2022-01-10", stop: "2022-01-16" },
    9: { start: "2022-01-17", stop: "2022-01-23" },
    10: { start: "2022-01-24", stop: "2022-01-30" },
    11: { start: "2022-01-31", stop: "2022-02-06" },
    12: { start: "2022-02-07", stop: "2022-02-13" },
    13: { start: "2022-02-14", stop: "2022-02-20" },
    14: { start: "2022-02-21", stop: "2022-02-27" },
    15: { start: "2022-02-28", stop: "2022-03-06" },
    exam: { start: "2022-02-17", stop: "2022-02-26" },
  },
  3215: {
    0: { start: "2021-07-12", stop: "2021-07-18" },
    1: { start: "2021-07-19", stop: "2021-07-25" },
    2: { start: "2021-07-26", stop: "2021-08-01" },
    3: { start: "2021-08-02", stop: "2021-08-08" },
    4: { start: "2021-08-16", stop: "2021-08-22" },
    5: { start: "2021-08-23", stop: "2021-08-29" },
    6: { start: "2021-08-30", stop: "2021-09-05" },
    7: { start: "2021-09-06", stop: "2021-09-12" },
    8: { start: "2021-09-13", stop: "2021-09-19" },
    9: { start: "2021-09-20", stop: "2021-09-26" },
    10: { start: "2021-09-27", stop: "2021-10-03" },
    11: { start: "2021-10-04", stop: "2021-10-10" },
    12: { start: "2021-10-11", stop: "2021-10-17" },
    13: { start: "2021-10-18", stop: "2021-10-24" },
    14: { start: "2021-10-25", stop: "2021-10-31" },
    15: { start: "2021-11-01", stop: "2021-11-07" },
    exam: { start: "2021-10-21", stop: "2021-10-31" },
  },
  3211: {
    0: { start: "2021-03-01", stop: "2021-03-07" },
    1: { start: "2021-03-08", stop: "2021-03-14" },
    2: { start: "2021-03-15", stop: "2021-03-21" },
    3: { start: "2021-03-22", stop: "2021-03-28" },
    4: { start: "2021-03-29", stop: "2021-04-04" },
    5: { start: "2021-04-12", stop: "2021-04-18" },
    6: { start: "2021-04-19", stop: "2021-04-25" },
    7: { start: "2021-04-26", stop: "2021-05-02" },
    8: { start: "2021-05-03", stop: "2021-05-09" },
    9: { start: "2021-05-10", stop: "2021-05-16" },
    10: { start: "2021-05-17", stop: "2021-05-23" },
    11: { start: "2021-05-24", stop: "2021-05-30" },
    12: { start: "2021-05-31", stop: "2021-06-06" },
    13: { start: "2021-06-07", stop: "2021-06-13" },
    14: { start: "2021-06-14", stop: "2021-06-20" },
    15: { start: "2021-06-21", stop: "2021-06-27" },
    exam: { start: "2021-06-10", stop: "2021-06-19" },
  },
  "3215QCM": {
    0: { start: "2021-07-12", stop: "2021-07-18" },
    1: { start: "2021-07-19", stop: "2021-07-25" },
    2: { start: "2021-07-26", stop: "2021-08-01" },
    3: { start: "2021-08-02", stop: "2021-08-08" },
    4: { start: "2021-08-09", stop: "2021-08-15" },
    5: { start: "2021-08-16", stop: "2021-08-22" },
    6: { start: "2021-08-30", stop: "2021-09-05" },
    7: { start: "2021-09-06", stop: "2021-09-12" },
    8: { start: "2021-09-13", stop: "2021-09-19" },
    9: { start: "2021-09-20", stop: "2021-09-26" },
    10: { start: "2021-10-04", stop: "2021-10-10" },
    11: { start: "2021-10-11", stop: "2021-10-17" },
    12: { start: "2021-10-18", stop: "2021-10-24" },
    13: { start: "2021-10-25", stop: "2021-10-31" },
    14: { start: "2021-11-01", stop: "2021-11-07" },
    15: { start: "2021-11-08", stop: "2021-11-14" },
    exam: { start: "2021-10-30", stop: "2021-11-13" },
  },
  "3211QCM": {
    0: { start: "2021-02-22", stop: "2021-02-28" },
    1: { start: "2021-03-01", stop: "2021-03-07" },
    2: { start: "2021-03-08", stop: "2021-03-14" },
    3: { start: "2021-03-15", stop: "2021-03-21" },
    4: { start: "2021-03-22", stop: "2021-03-29" },
    5: { start: "2021-03-29", stop: "2021-04-04" },
    6: { start: "2021-04-12", stop: "2021-04-18" },
    7: { start: "2021-04-19", stop: "2021-04-25" },
    8: { start: "2021-04-26", stop: "2021-05-02" },
    9: { start: "2021-05-10", stop: "2021-05-16" },
    10: { start: "2021-05-17", stop: "2021-05-23" },
    11: { start: "2021-05-24", stop: "2021-05-30" },
    12: { start: "2021-05-31", stop: "2021-06-06" },
    13: { start: "2021-06-07", stop: "2021-03-13" },
    14: { start: "2021-06-14", stop: "2021-03-20" },
    15: { start: "2021-06-21", stop: "2021-03-26" },
    exam: { start: "2021-06-12", stop: "2021-06-26" },
  },

  2201: {
    0: { start: "2020-02-24", stop: "2020-03-01" },
    1: { start: "2020-03-02", stop: "2020-03-08" },
    2: { start: "2020-03-09", stop: "2020-03-15" },
    3: { start: "2020-03-16", stCop: "2020-03-22" },
    4: { start: "2020-03-23", stop: "2020-03-29" },
    5: { start: "2020-03-30", stop: "2020-04-05" },
    6: { start: "2020-04-06", stop: "2020-04-12" },
    7: { start: "2020-04-13", stop: "2020-04-19" },
    8: { start: "2020-04-20", stop: "2020-04-26" },
    9: { start: "2020-04-27", stop: "2020-05-03" },
    10: { start: "2020-05-04", stop: "2020-05-10" },
    11: { start: "2020-05-11", stop: "2020-05-17" },
    12: { start: "2020-05-18", stop: "2020-05-24" },
    13: { start: "2020-05-25", stop: "2020-05-31" },
    14: { start: "2020-06-01", stop: "2020-06-05" },
    exam: { start: "2020-06-01", stop: "2020-06-05" },
  },
  2203: {
    0: { start: "2020-05-25", stop: "2020-05-31" },
    1: { start: "2020-06-01", stop: "2020-06-07" },
    2: { start: "2020-06-08", stop: "2020-06-14" },
    3: { start: "2020-06-15", stop: "2020-06-21" },
    4: { start: "2020-06-22", stop: "2020-06-28" },
    5: { start: "2020-06-29", stop: "2020-07-05" },
    6: { start: "2020-07-06", stop: "2020-07-12" },
    7: { start: "2020-07-13", stop: "2020-07-19" },
    8: { start: "2020-07-20", stop: "2020-07-26" },
    9: { start: "2020-07-27", stop: "2020-08-02" },
    10: { start: "2020-08-03", stop: "2020-08-09" },
    11: { start: "2020-08-10", stop: "2020-05-17" },
    12: { start: "2020-08-17", stop: "2020-05-24" },
    13: { start: "2020-08-24", stop: "2020-05-31" },
    14: { start: "2020-08-31", stop: "2020-09-06" },
    exam: { start: "2020-08-31", stop: "2020-09-04" },
  },
  2205: {
    0: { start: "2020-08-24", stop: "2020-09-30" },
    1: { start: "2020-08-31", stop: "2020-09-06" },
    2: { start: "2020-09-07", stop: "2020-09-13" },
    3: { start: "2020-09-14", stop: "2020-09-20" },
    4: { start: "2020-09-21", stop: "2020-09-27" },
    5: { start: "2020-09-28", stop: "2020-10-04" },
    6: { start: "2020-10-05", stop: "2020-10-11" },
    7: { start: "2020-10-12", stop: "2020-10-19" },
    8: { start: "2020-10-19", stop: "2020-10-25" },
    9: { start: "2020-10-26", stop: "2020-11-01" },
    10: { start: "2020-11-02", stop: "2020-11-08" },
    11: { start: "2020-11-09", stop: "2020-11-15" },
    12: { start: "2020-11-16", stop: "2020-11-22" },
    13: { start: "2020-11-23", stop: "2020-11-29" },
    14: { start: "2020-11-30", stop: "2020-12-06" },
    15: { start: "2020-12-07", stop: "2020-12-13" },
    exam: { start: "2020-12-07", stop: "2020-12-13" },
  },
  2207: {
    0: { start: "2020-11-23", stop: "2020-11-29" },
    1: { start: "2020-11-30", stop: "2020-12-06" },
    2: { start: "2020-12-07", stop: "2020-12-13" },
    3: { start: "2020-12-14", stop: "2020-12-20" },
    4: { start: "2020-12-21", stop: "2020-12-27" },
    5: { start: "2020-12-28", stop: "2021-01-03" },
    6: { start: "2021-01-04", stop: "2021-01-10" },
    7: { start: "2021-01-11", stop: "2021-01-17" },
    8: { start: "2021-01-18", stop: "2021-01-24" },
    9: { start: "2021-01-25", stop: "2021-01-31" },
    10: { start: "2021-02-01", stop: "2021-02-07" },
    11: { start: "2021-02-08", stop: "2021-02-14" },
    12: { start: "2021-02-15", stop: "2021-02-21" },
    13: { start: "2021-02-22", stop: "2021-02-28" },
    14: { start: "2021-03-01", stop: "2021-03-07" },
    15: { start: "2021-03-08", stop: "2021-03-14" },
    exam: { start: "2021-03-01", stop: "2021-03-07" },
  },
  3208: {
    0: { start: "2020-10-26", stop: "2020-11-01" },
    1: { start: "2020-11-02", stop: "2020-11-08" },
    2: { start: "2020-11-09", stop: "2020-11-15" },
    3: { start: "2020-11-16", stop: "2020-11-22" },
    4: { start: "2020-11-23", stop: "2020-11-29" },
    5: { start: "2020-11-30", stop: "2020-12-06" },
    6: { start: "2020-12-07", stop: "2020-12-13" },
    7: { start: "2020-12-14", stop: "2020-12-20" },
    8: { start: "2021-01-04", stop: "2021-01-10" },
    9: { start: "2021-01-11", stop: "2021-01-17" },
    10: { start: "2021-01-18", stop: "2021-01-24" },
    11: { start: "2021-01-25", stop: "2021-01-31" },
    12: { start: "2021-02-01", stop: "2021-02-07" },
    13: { start: "2021-02-08", stop: "2021-02-14" },
    exam: { start: "2021-02-08", stop: "2021-02-20" },
  },
  3205: {
    0: { start: "2020-07-06", stop: "2020-07-12" },
    1: { start: "2020-07-13", stop: "2020-07-19" },
    2: { start: "2020-07-20", stop: "2020-08-26" },
    3: { start: "2020-07-27", stop: "2020-08-02" },
    4: { start: "2020-08-03", stop: "2020-08-16" },
    5: { start: "2020-08-17", stop: "2020-08-23" },
    6: { start: "2020-08-24", stop: "2020-08-30" },
    7: { start: "2020-08-31", stop: "2020-09-06" },
    8: { start: "2020-09-07", stop: "2020-09-13" },
    9: { start: "2020-09-14", stop: "2020-09-20" },
    10: { start: "2020-09-21", stop: "2020-09-27" },
    11: { start: "2020-09-28", stop: "2020-10-04" },
    12: { start: "2020-10-05", stop: "2020-10-11" },
    13: { start: "2020-10-12", stop: "2020-10-18" },
    14: { start: "2020-10-19", stop: "2020-10-25" },
    15: { start: "2020-10-27", stop: "2020-11-01" },
    exam: { start: "2020-10-12", stop: "2020-10-18" },
  },
  3201: {
    0: { start: "2020-02-17", stop: "2020-02-23" },
    1: { start: "2020-02-24", stop: "2020-03-01" },
    2: { start: "2020-03-02", stop: "2020-03-08" },
    3: { start: "2020-03-09", stop: "2020-03-15" },
    4: { start: "2020-03-16", stop: "2020-03-22" },
    5: { start: "2020-03-23", stop: "2020-03-29" },
    6: { start: "2020-03-30", stop: "2020-04-05" },
    7: { start: "2020-04-13", stop: "2020-04-19" },
    8: { start: "2020-04-20", stop: "2020-04-26" },
    9: { start: "2020-04-27", stop: "2020-05-03" },
    10: { start: "2020-05-04", stop: "2020-05-10" },
    11: { start: "2020-05-11", stop: "2020-05-17" },
    12: { start: "2020-05-18", stop: "2020-05-24" },
    13: { start: "2020-05-25", stop: "2020-05-31" },
    exam: { start: "2020-06-01", stop: "2020-06-07" },
  },
  3198: {
    0: { start: "2019-10-21", stop: "2019-10-27" },
    1: { start: "2019-10-28", stop: "2019-11-03" },
    2: { start: "2019-11-04", stop: "2019-11-10" },
    3: { start: "2019-11-11", stop: "2019-11-17" },
    4: { start: "2019-11-18", stop: "2019-11-24" },
    5: { start: "2019-11-25", stop: "2019-12-1" },
    6: { start: "2019-12-02", stop: "2019-12-08" },
    7: { start: "2019-12-09", stop: "2019-12-15" },
    8: { start: "2019-12-16", stop: "2019-12-22" },
    9: { start: "2020-01-06", stop: "2020-01-12" },
    10: { start: "2020-01-13", stop: "2020-01-19" },
    11: { start: "2020-01-20", stop: "2020-01-26" },
    12: { start: "2020-01-27", stop: "2020-02-02" },
    13: { start: "2020-02-03", stop: "2020-02-09" },
    exam: { start: "2020-02-06", stop: "2020-02-15" },
  },
  2197: {
    0: { start: "2019-11-18", stop: "2019-11-24" },
    1: { start: "2019-11-25", stop: "2019-12-01" },
    2: { start: "2019-12-02", stop: "2019-12-08" },
    3: { start: "2019-12-09", stop: "2019-12-15" },
    4: { start: "2019-12-16", stop: "2019-12-22" },
    5: { start: "2019-12-23", stop: "2019-09-29" },
    6: { start: "2019-12-30", stop: "2020-01-05" },
    7: { start: "2020-01-06", stop: "2020-01-12" },
    8: { start: "2020-01-13", stop: "2020-01-19" },
    9: { start: "2020-01-20", stop: "2020-01-26" },
    10: { start: "2020-01-27", stop: "2020-02-02" },
    11: { start: "2020-02-03", stop: "2020-02-09" },
    12: { start: "2020-02-10", stop: "2020-02-16" },
    13: { start: "2019-02-17", stop: "2020-02-23" },
    14: { start: "2020-02-24", stop: "2020-03-01" },
    15: { start: "2020-03-02", stop: "2020-03-08" },
  },
  2195: {
    0: { start: "2019-08-19", stop: "2019-09-25" },
    1: { start: "2019-08-26", stop: "2019-09-01" },
    2: { start: "2019-09-02", stop: "2019-09-18" },
    3: { start: "2019-09-09", stop: "2019-09-15" },
    4: { start: "2019-09-16", stop: "2019-09-22" },
    5: { start: "2019-09-23", stop: "2019-09-29" },
    6: { start: "2019-09-30", stop: "2019-10-06" },
    7: { start: "2019-10-07", stop: "2019-10-13" },
    8: { start: "2019-10-14", stop: "2019-08-20" },
    9: { start: "2019-10-21", stop: "2019-10-27" },
    10: { start: "2019-10-28", stop: "2019-11-03" },
    11: { start: "2019-11-04", stop: "2019-11-10" },
    12: { start: "2019-11-11", stop: "2019-11-17" },
    13: { start: "2019-11-18", stop: "2019-11-24" },
    14: { start: "2019-11-25", stop: "2019-12-01" },
    15: { start: "2019-10-07", stop: "2019-10-13" },
  },
  3195: {
    0: { start: "2019-07-01", stop: "2019-07-07" },
    1: { start: "2019-07-08", stop: "2019-07-14" },
    2: { start: "2019-07-15", stop: "2019-07-21" },
    3: { start: "2019-07-22", stop: "2019-07-28" },
    4: { start: "2019-07-29", stop: "2019-08-04" },
    5: { start: "2019-08-05", stop: "2019-08-11" },
    6: { start: "2019-08-19", stop: "2019-08-25" },
    7: { start: "2019-08-26", stop: "2019-09-01" },
    8: { start: "2019-09-02", stop: "2019-09-08" },
    9: { start: "2019-09-09", stop: "2019-09-15" },
    10: { start: "2019-09-16", stop: "2019-09-22" },
    11: { start: "2019-09-23", stop: "2019-09-29" },
    12: { start: "2019-09-30", stop: "2019-10-06" },
    13: { start: "2019-10-07", stop: "2019-10-13" },
    14: { start: "2019-10-14", stop: "2019-10-20" },
    15: { start: "2019-10-21", stop: "2019-10-27" },
    exam: { start: "2019-10-10", stop: "2019-10-19" },
  },
  3191: {
    0: { start: "2019-02-18", stop: "2019-02-24" },
    1: { start: "2019-02-25", stop: "2019-03-03" },
    2: { start: "2019-03-04", stop: "2019-03-10" },
    3: { start: "2019-03-11", stop: "2019-03-17" },
    4: { start: "2019-03-18", stop: "2019-03-24" },
    5: { start: "2019-03-25", stop: "2019-03-31" },
    6: { start: "2019-04-01", stop: "2019-04-07" },
    7: { start: "2019-04-08", stop: "2019-04-14" },
    8: { start: "2019-04-22", stop: "2019-04-28" },
    9: { start: "2019-04-29", stop: "2019-05-05" },
    10: { start: "2019-05-06", stop: "2019-05-12" },
    11: { start: "2019-05-13", stop: "2019-05-19" },
    12: { start: "2019-05-20", stop: "2019-05-26" },
    13: { start: "2019-05-27", stop: "2019-06-02" },
    14: { start: "2019-06-03", stop: "2019-06-09" },
    15: { start: "2019-06-10", stop: "2019-06-17" },
    exam: { start: "2019-05-30", stop: "2019-06-08" },
  },
};

// set 2022 OUA study period dates, same as GU trimesters
TERM_DATES[2222] = TERM_DATES[3221];
TERM_DATES[2224] = TERM_DATES[3225];
TERM_DATES[2226] = TERM_DATES[3228];

var TERM = "3211",
  YEAR = 2021,
  SET_DATE = "";
var MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTHS_HASH = {
  Jan: 0,
  January: 0,
  Feb: 1,
  February: 1,
  Mar: 2,
  March: 2,
  Apr: 3,
  April: 3,
  May: 4,
  Jun: 5,
  June: 5,
  Jul: 6,
  July: 6,
  Aug: 7,
  August: 7,
  Sep: 8,
  September: 8,
  Oct: 9,
  October: 9,
  Nov: 10,
  November: 10,
  Dec: 11,
  December: 11,
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

function addCardInterface(items, place) {
  // Define which template to use
  let template = HORIZONTAL;
  let linkTemplate = HORIZONTAL;
  let engageVerb = "Engage";

  // Define the text for Review Status
  let MARK_REVIEWED = "Mark Reviewed";
  let REVIEWED = "Reviewed";
  let NO_CARD_NUMBER = false;
  let NO_COMING_SOON = false;

  // get the content item with h3 heading containing Card Interface
  // Here this is only used for configuration information
  let cardConfigInterface = jQuery(
    tweak_bb.page_id + " > " + tweak_bb.row_element
  )
    .find(".item h3")
    .filter(function (x) {
      return this.innerText.toLowerCase().includes("card interface");
    })
    .eq(0);
  // hide the configuration item if edit mode off
  if (window.tweak_bb.display_view) {
    jQuery(cardConfigInterface).parent().parent().hide();
  }

  let cardInterface = place;

  if (cardInterface.length === 0) {
    console.log(
      "Card: Can't find item with heading 'Card Interface' in which to insert card interface"
    );
    return false;
  } else {
    // get the title - text only, stripped of whitespace before/after
    var cardInterfaceTitle = jQuery.trim(cardConfigInterface.text());

    //Extract parameters
    var m = cardInterfaceTitle.match(/Card Interface *([^<]*)/i);
    var WIDTH = "md:w-1/3";

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
          } else if (element.match(/nocardnumber/i)) {
            NO_CARD_NUMBER = true;
          } else if (element.match(/nocomingsoon/i)) {
            NO_COMING_SOON = true;
          } else if (element.match(/noimages/i)) {
            HIDE_IMAGES = true;
          } else if ((x = element.match(/template=by([2-6])/i))) {
            WIDTH = "md:w-1/" + x[1];
          } else if ((x = element.match(/by([2-6])/i))) {
            WIDTH = "md:w-1/" + x[1];
          } else if ((x = element.match(/[Bb][yY]1/))) {
            WIDTH = "md:w-full";
          } else if (element.match(/people/i)) {
            template = PEOPLE;
          } else if (element.match(/noengage/i)) {
            linkTemplate = HORIZONTAL_NOENGAGE;
          } else if (element.match(/logging/i)) {
            LOGGING = true;
          } else if ((m = element.match(/engage=([^']*)/))) {
            engageVerb = m[1];
          } else if ((m = element.match(/template=assessment/i))) {
            template = ASSESSMENT;
          } else if ((m = element.match(/set[Dd]ate=([^\s]*)/))) {
            SET_DATE = m[1];
          } else if ((m = element.match(/^reviewed=([^']*)/iu))) {
            REVIEWED = m[1];
          } else if ((m = element.match(/^markReviewed=(.+)/i))) {
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
    let comingSoon = "";
    // TODO need to only display this if outside the date
    if (typeof idx.comingSoon !== "undefined" && !NO_COMING_SOON) {
      if (!inDateRange(idx.comingSoon, false)) {
        // we have coming soon and in the date range
        // generate the html
        comingSoon = generateDateHtml(
          comingSoonHtmlTemplate[template],
          dualComingSoonHtmlTemplate[template],
          idx.comingSoon
        );
        comingSoon = comingSoon.replace(
          "{COMING_SOON_LABEL}",
          idx.comingSoonLabel
        );

        // if students are viewing remove the link stuff
        if (window.tweak_bb.display_view) {
          // don't show an engage button
          linkHtml = "";
          // remove the clickableCard link and hover shadow
          cardHtml = cardHtml
            .replace("clickablecard", "")
            .replace("hover:outline-none hover:shadow-outline ", "");
        }
      }
    }
    cardHtml = cardHtml.replace("{COMING_SOON}", comingSoon);

    // TODO either here, or above in the link section need to remove
    // the link
    cardHtml = cardHtml.replace("{WIDTH}", WIDTH);

    // replace the default background colour if a different one
    // is specific
    if (idx.cardBGcolour) {
      cardHtml = cardHtml.replace(
        /background-color:\s*rgb\(255,255,255\)/i,
        "background-color: " + idx.cardBGcolour
      );
    }

    //<div class="bg-cover h-48" style="background-image: url('{PIC_URL}'); //background-color: rgb(255,255,204)">{IFRAME}
    // replace the Engage verb

    //---------------------------------------------
    // Add in the mark review/reviewed options
    var reviewTemplate = "";
    if (idx.review !== undefined) {
      // only do it if there is a review option found
      // check whether its a mark review or review
      // - if link contains markUnreviewed then it has been
      //   reviewed
      if (idx.review.match(/markUnreviewed/)) {
        reviewTemplate = markUnReviewedLinkHtmlTemplate[template];
        reviewTemplate = reviewTemplate.replace("{REVIEWED}", REVIEWED);
      } else {
        // it's the other one which indicates it has not been reviewed
        reviewTemplate = markReviewLinkHtmlTemplate[template];

        reviewTemplate = reviewTemplate.replace(
          "{MARK_REVIEWED}",
          MARK_REVIEWED
        );
      }
      // set the right link
      reviewTemplate = reviewTemplate.replace("{LINK}", idx.review);
    }
    cardHtml = cardHtml.replace("{REVIEW_ITEM}", reviewTemplate);
    //console.log("template is " + template);
    // Only show module number if there's a label
    if (idx.label !== "") {
      var checkForNum = idx.moduleNum;
      if (NO_CARD_NUMBER) {
        // global setting not to show card numbers
        cardHtml = cardHtml.replace("{MODULE_NUM}", "");
        checkForNum = "";
      } else if (idx.moduleNum) {
        // if there's a hard coded moduleNum use that
        cardHtml = cardHtml.replace("{MODULE_NUM}", idx.moduleNum);
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
      var regex = new RegExp(
        "^" + idx.label.trim() + "\\s*" + checkForNum + "\\s*[-:]*\\s*(.*)",
        "s"
      );
      //const regex = /^Week\s*1\s*[-:]*\s*(.*)/gs;

      if ("title" in idx && typeof idx.title !== "undefined") {
        let m = idx.title.match(regex);
        //var m = regex.test(idx.title);
        if (m) {
          idx.title = m[1];
          // kludge for COM14 which has a <br> after label in title
          idx.title = idx.title.replace(/^<br\s*\/*>/i, "");
        }
      }
    } else {
      cardHtml = cardHtml.replace("{MODULE_NUM}", "");
    }
    cardHtml = cardHtml.replace("{LABEL}", idx.label);

    //------------------ set the card image

    // Two options for BG_SIZE
    // 1. cover (bg-cover)
    //    Default option. Image covers the entire backgroun
    // 2. contain (bg-contain bg-no-repeat)
    //    Entire image must fit within the card

    if (idx.bgSize === "contain") {
      cardHtml = cardHtml.replace(
        /{BG_SIZE}/,
        "bg-contain bg-no-repeat bg-center"
      );
    } else {
      cardHtml = cardHtml.replace(/{BG_SIZE}/, "bg-cover");
    }

    // figure out which image we're going to show
    var picUrl = setImage(idx);

    // replace the {IMAGE_URL} variable if none set
    if (!idx.hasOwnProperty("iframe")) {
      cardHtml = cardHtml.replace(/{IFRAME}/g, "");
    } else {
      cardHtml = cardHtml.replace(/{IFRAME}/g, idx.iframe);
      // set pic URl to empty so non is provided
      picUrl = "";
    }
    cardHtml = cardHtml.replace(/{PIC_URL}/g, picUrl);
    cardHtml = cardHtml.replace("{TITLE}", idx.title);
    cardHtml = cardHtml.replace(/\{ASSESSMENT[_ ]TYPE\}/g, idx.assessmentType);
    cardHtml = cardHtml.replace(/\{WEIGHTING\}/g, idx.assessmentWeighting);
    cardHtml = cardHtml.replace(
      /\{LEARNING_OUTCOMES\}/g,
      idx.assessmentOutcomes
    );

    // Get rid of some crud Bb inserts into the HTML
    description = "";
    if (typeof idx.description !== "undefined") {
      description = idx.description.replace(/<p/g, '<p class="pb-2"');
      description = description.replace(/<a/g, '<a class="underline"');
    }
    cardHtml = cardHtml.replace("{DESCRIPTION}", description);
    // Does the card link to another content item?
    //	    console.log( " template is " + template + " and H_E " + HORIZONTAL_NOENGAGE);
    if (typeof idx.link !== "undefined") {
      // add the link

      linkHtml = linkHtml.replace("{ENGAGE}", engageVerb);
      cardHtml = cardHtml.replace("{LINK_ITEM}", linkHtml);
      // if there is a label and no hard coded moduleNum,
      //  then increment the module number
      // TENTATIVE
      /*          if (idx.label !== "" && !idx.moduleNum) {
                moduleNum++;
            }*/
    } else {
      // if (template!==HORIZONTAL_NOENGAGE) {
      // remove the link, as there isn't one
      cardHtml = cardHtml.replace("{LINK_ITEM}", "");
      cardHtml = cardHtml.replace(/<a href="{LINK}">/g, "");
      cardHtml = cardHtml.replace("</a>", "");
      // remove the shadow/border effect
      cardHtml = cardHtml.replace("hover:outline-none", "");
      cardHtml = cardHtml.replace("hover:shadow-outline", "");
      // don't count it as a module
      //  cardHtml = cardHtml.replace(idx.label + ' ' + moduleNum, '');
      //moduleNum--;
    }

    // If there is a linkTarget in Blackboard
    if (typeof idx.linkTarget !== "undefined") {
      // replace "{LINK}" with "{LINK}" target="linkTarget"
      cardHtml = cardHtml.replace(
        /"{LINK}"/g,
        '"{LINK}" target="' + idx.linkTarget + '"'
      );
    }

    if (typeof idx.link !== "undefined") {
      cardHtml = cardHtml.replace(/{LINK}/g, idx.link);
    } else {
      cardHtml = cardHtml.replace(
        /<a href="{LINK}" class="cardmainlink">/g,
        ""
      );
      cardHtml = cardHtml.replace(/class="clickablecard /, 'class="');
    }

    // Should we add a link to edit/view the original content
    if (location.href.indexOf("listContentEditable.jsp") > 0) {
      editLink = editLinkTemplate.replace("{ID}", idx.id);
      cardHtml = cardHtml.replace(/{EDIT_ITEM}/, editLink);
    } else {
      //cardHtml = cardHtml.replace(/{EDIT_ITEM}/,'');

      //editLink = editLinkTemplate.replace('{ID}', idx.id);
      editLink = '<div><a href="#hello">&nbsp;</a></div>';
      cardHtml = cardHtml.replace(/{EDIT_ITEM}/, editLink);
    }

    // standard date
    let date = "";
    date = generateDateHtml(
      dateHtmlTemplate[template],
      dualDateHtmlTemplate[template],
      idx.date
    );
    date = date.replace("{DATE_LABEL}", idx.dateLabel);
    cardHtml = cardHtml.replace("{DATE}", date);

    // add the individual card html to the collection
    cards = cards.concat(cardHtml);
  });

  // STick the cards into the complete card HTML
  var interfaceHtml = interfaceHtmlTemplate[template];
  interfaceHtml = interfaceHtml.replace("{CARDS}", cards);
  // Insert the HTML to the selected item(s)
  //return false;
  //jQuery(firstItem).append(interfaceHtml);
  jQuery(cardInterface).before(interfaceHtml);
}

/**
 * @function to12
 * @param {String} t 24 hour
 * @returns {String} time converted to 12 hour with am/pm
 */

function to12(t) {
  if (typeof t === "undefined") {
    return "";
  }
  // break home and set hh, m
  const regex = /^\s*([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])\s*/;
  let m = t.match(regex);

  // we have a 24 hour time, convert it
  if (m) {
    let h,
      hh,
      mins,
      dd = "AM";
    hh = parseInt(m[1]);
    mins = parseInt(m[2]);

    h = hh;
    // set PM
    if (h >= 12) {
      h = hh - 12;
      dd = "PM";
    }
    if (h == 0) {
      h = 12;
    }
    if (mins < 10) {
      mins = `0${mins}`;
    }
    return `${h}:${mins} ${dd}`;
  }
  // not a 24 hour time show nothing
  return "";
}

/**
 * @function generateDateHtml
 * @params singleTemplate {String} HTML for a single date
 * @params dualTemplate {String} HTML for a dual date
 * @params date {Object} the date data structure
 * @description parse the date object and use the correct template to
 * construct date html to be added to the card
 */

function generateDateHtml(singleTemplate, dualTemplate, date) {
  // by default no html
  let cardHtml = "";

  if (
    typeof date !== "undefined" &&
    typeof date.start !== "undefined" &&
    "month" in date.start
  ) {
    // Do we have dual dates - both start and stop?
    // TODO is this where we check week?
    if (date.stop.month && date.start.week !== date.stop.week) {
      // start and stop dates
      //cardHtml = cardHtml.replace('{DATE}', dualDateHtmlTemplate[template]);
      cardHtml = dualTemplate;
      cardHtml = cardHtml.replace(/{MONTH_START}/g, date.start.month);
      cardHtml = cardHtml.replace(/{DATE_START}/g, date.start.date);
      cardHtml = cardHtml.replace(/{MONTH_STOP}/g, date.stop.month);
      cardHtml = cardHtml.replace(/{DATE_STOP}/g, date.stop.date);
      cardHtml = cardHtml.replace(/{TIME_STOP}/g, to12(date.stop.time));
      cardHtml = cardHtml.replace(/{TIME_START}/g, to12(date.start.time));
      if (!date.start.hasOwnProperty("week")) {
        cardHtml = cardHtml.replace("{WEEK}", "");
      } else {
        // if exam, use that template
        // other wise construct dual week
        let weekHtml = examPeriodTemplate;
        if (date.start.week !== "exam") {
          // not exam, then set to dualWeekHtml
          if (date.start.week !== date.stop.week) {
            weekHtml = dualWeekHtmlTemplate.replace(
              "{WEEK_START}",
              date.start.week
            );
            weekHtml = weekHtml.replace("{WEEK_STOP}", date.stop.week);
          } else {
            // same week, so using single week template
            weekHtml = weekHtmlTemplate.replace(
              "{WEEK}",
              `Week ${date.start.week}`
            );
          }
        }
        cardHtml = cardHtml.replace("{WEEK}", weekHtml);
      }
    } else {
      // just start date
      //cardHtml = cardHtml.replace('{DATE}', dateHtmlTemplate[template]);
      cardHtml = singleTemplate;
      cardHtml = cardHtml.replace(/{MONTH}/g, date.start.month);
      cardHtml = cardHtml.replace(/{DATE}/g, date.start.date);
      cardHtml = cardHtml.replace(/{TIME}/g, to12(date.start.time));
      //                cardHtml = cardHtml.replace(/{DATE_LABEL}/g, idx.dateLabel);
      if (!date.start.hasOwnProperty("week")) {
        cardHtml = cardHtml.replace("{WEEK}", "");
      } else {
        // SKETCHY TODO change added block around else
        let weekReplace = "Week " + date.start.week;
        if (date.start.hasOwnProperty("day")) {
          weekReplace = date.start.day + " " + weekReplace;
        }
        let weekHtml = weekHtmlTemplate.replace("{WEEK}", weekReplace);
        cardHtml = cardHtml.replace("{WEEK}", weekHtml);
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

function inDateRange(cardDate, assumeStop = true) {
  if (typeof cardDate !== "undefined") {
    let start, stop, now;

    // Set now to current date OR SET_DATE if we want to do testing
    if (SET_DATE === "") {
      now = new Date();
    } else {
      now = new Date(SET_DATE);
    }

    // set the start date
    if (cardDate.start.hasOwnProperty("month") && cardDate.start.month !== "") {
      start = convertToDate(cardDate.start);
    }

    // set the card stop date
    // - to card.date.stop if valid
    // - to the end of the week if using a week
    // - to the end of the day if no stop
    if (cardDate.stop.hasOwnProperty("month") && cardDate.stop.month !== "") {
      if (cardDate.stop.time === "") {
        cardDate.stop.time = "23:59";
      }
      stop = convertToDate(cardDate.stop);
    } else if (
      cardDate.start.hasOwnProperty("week") &&
      cardDate.start.week !== ""
    ) {
      // there's no end date, but there is a start week
      // so set stop to end of that week, but only if inWeek is true
      if (cardDate.start.week in TERM_DATES[TERM]) {
        if (assumeStop) {
          stop = new Date(TERM_DATES[TERM][cardDate.start.week].stop);
          stop.setHours(23, 59, 0);
        }
      } else {
        // problem with week, just set it to end of date
        if (typeof start !== "undefined" && assumeStop) {
          stop = new Date(start.getTime());
          stop.setHours(23, 59, 0);
        }
      }
      /*        } else { // no week for stop, meaning it's just on the day
            stop = new Date(start.getTime());
            stop.setHours(23, 59, 0); */
    }

    // figure out if we're in range
    if (typeof stop !== "undefined") {
      // if stop defined, check in range
      return now >= start && now <= stop;
    } else {
      // check passed start
      return now >= start;
    }
  }
  return false;
}

/**
 * @function convertToDate
 * @param {Object} dateObj
 * @returns {Date} Javascript date object
 * Converts the simple date object into a Javascript date object
 */

function convertToDate(dateObj) {
  // check for valid month??
  let date = new Date(
    dateObj.year,
    MONTHS_HASH[dateObj.month],
    parseInt(dateObj.date)
  );

  // if time set time
  if (dateObj.hasOwnProperty("time") && dateObj.time !== "") {
    // split into hours minutes
    let m = dateObj.time.match(
      /^\s*([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])\s+/
    );

    if (m) {
      date.setHours(m[1], m[2], 0);
    }
  }
  return date;
}

/*function inDateRange( cardDate, assumeStop=true ) {
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
       if ( typeof(cardDate.start)!== "undefined" &&
           cardDate.start.hasOwnProperty('month') &&
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
       if (typeof(cardDate.stop)!=="undefined" &&
           cardDate.stop.hasOwnProperty('month') &&
           cardDate.stop.month !== '') {
           //stop = new Date(DEFAULT_YEAR, MONTHS_HASH[cardDate.stop.month], cardDate.stop.date);
           stop = new Date(cardDate.stop.year, MONTHS_HASH[cardDate.stop.month], cardDate.stop.date);
           stop.setHours(23, 59, 0);
       } else if ( typeof(cardDate.start)!=="undefined" &&
           cardDate.start.hasOwnProperty('week') &&
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
//        } else { // no week for stop, meaning it's just on the day
  //         stop = new Date(start.getTime());
 //          stop.setHours(23, 59, 0); 
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
} */

// Interface design from https://codepen.io/njs/pen/BVdwZB

// TEMPLATES - by 6

// define the template types
const NUM_TEMPLATES = 6,
  HORIZONTAL = 0, // original 3 cards per row
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
var FILM_WATCH_OPTIONS_JS =
  "https://unpkg.com/@djplaner/film-watch-options/film-watch-options.js";

//

interfaceHtmlTemplate[HORIZONTAL] = `
 <link rel="stylesheet" href="{CARDS_CSS}" />
 
 
 <div class="guCardInterface flex flex-wrap -m-3">
  {CARDS}
 </div>
 `;
interfaceHtmlTemplate[HORIZONTAL] = interfaceHtmlTemplate[HORIZONTAL].replace(
  "{CARDS_CSS}",
  CARDS_CSS
);

interfaceHtmlTemplate[VERTICAL] = `
 <link rel="stylesheet" href="{CARDS_CSS}" />
  {CARDS}
 </div>
 `;
interfaceHtmlTemplate[VERTICAL] = interfaceHtmlTemplate[VERTICAL].replace(
  "{CARDS_CSS}",
  CARDS_CSS
);

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
         <a href="{LINK}" class="gu-engage"><div class="hover:bg-blue text-blue-dark font-semibold hover:text-white py-2 px-4 border border-blue hover:border-transparent rounded">
             {ENGAGE}
         </div></a>
         </div>
         `;

linkItemHtmlTemplate[VERTICAL] = "";
linkItemHtmlTemplate[HORIZONTAL_NOENGAGE] = "";
linkItemHtmlTemplate[PEOPLE] = "";
linkItemHtmlTemplate[ASSESSMENT] = "";

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

markReviewLinkHtmlTemplate[VERTICAL] = "";
markUnReviewedLinkHtmlTemplate[VERTICAL] = "";
markReviewLinkHtmlTemplate[HORIZONTAL_NOENGAGE] =
  markReviewLinkHtmlTemplate[HORIZONTAL];
markUnReviewedLinkHtmlTemplate[HORIZONTAL_NOENGAGE] =
  markUnReviewedLinkHtmlTemplate[HORIZONTAL];
markReviewLinkHtmlTemplate[PEOPLE] = "";
markUnReviewedLinkHtmlTemplate[PEOPLE] = "";
markReviewLinkHtmlTemplate[ASSESSMENT] = "";
markUnReviewedLinkHtmlTemplate[ASSESSMENT] = "";

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
dateHtmlTemplate[PEOPLE] = "";
//dateHtmlTemplate[ASSESSMENT] = dateHtmlTemplate[HORIZONTAL];

dualDateHtmlTemplate[VERTICAL] = dualDateHtmlTemplate[HORIZONTAL];
dualDateHtmlTemplate[HORIZONTAL_NOENGAGE] = dualDateHtmlTemplate[HORIZONTAL];
dualDateHtmlTemplate[PEOPLE] = "";
//dualDateHtmlTemplate[ASSESSMENT] = dualDateHtmlTemplate[HORIZONTAL];

var comingSoonHtmlTemplate = Array(NUM_TEMPLATES);

comingSoonHtmlTemplate[HORIZONTAL] = `
<div class="cardComingSoon p-4 flex bg-yellow-light"> 
    <span>🚧</span>&nbsp;
    <span>{COMING_SOON_LABEL} {MONTH} {DATE} ({TIME})</span>
</div>
`;
comingSoonHtmlTemplate[HORIZONTAL_NOENGAGE] =
  comingSoonHtmlTemplate[HORIZONTAL];
comingSoonHtmlTemplate[PEOPLE] = comingSoonHtmlTemplate[HORIZONTAL_NOENGAGE];
comingSoonHtmlTemplate[VERTICAL] = comingSoonHtmlTemplate[HORIZONTAL_NOENGAGE];

var dualComingSoonHtmlTemplate = Array(NUM_TEMPLATES);

dualComingSoonHtmlTemplate[HORIZONTAL] = `
<div class="cardComingSoon p-4 flex bg-yellow-light"> 
    <span>🚧</span>&nbsp;
    <span>{COMING_SOON_LABEL} {MONTH_START} {DATE_START} ({TIME_START})-{MONTH_STOP} {DATE_STOP} ({TIME_STOP})</span>
</div>
`;
dualComingSoonHtmlTemplate[HORIZONTAL_NOENGAGE] =
  dualComingSoonHtmlTemplate[HORIZONTAL];
dualComingSoonHtmlTemplate[PEOPLE] =
  dualComingSoonHtmlTemplate[HORIZONTAL_NOENGAGE];
dualComingSoonHtmlTemplate[VERTICAL] =
  dualComingSoonHtmlTemplate[HORIZONTAL_NOENGAGE];

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
  if (card.activePicUrl !== "" && card.date.start.date !== "") {
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
    if (
      card.date.start.hasOwnProperty("month") &&
      card.date.start.month !== ""
    ) {
      start = new Date(
        parseInt(YEAR),
        MONTHS.indexOf(card.date.start.month),
        parseInt(card.date.start.date)
      );
    }
    if (card.date.stop.hasOwnProperty("month") && card.date.stop.month !== "") {
      stop = new Date(
        YEAR,
        MONTHS.indexOf(card.date.stop.month),
        card.date.stop.date
      );
      stop.setHours(23, 59, 0);
    } else if (card.date.start.hasOwnProperty("week")) {
      // there's no end date, but there is a start week
      // so set stop to end of that week
      stop = new Date(TERM_DATES[TERM][card.date.start.week].stop);
      stop.setHours(23, 59, 0);
    } else {
      // no week for stop, meaning it's just on the day
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
  var next_arg = ["", "", cmdline];
  var args = [];
  while ((next_arg = re_next_arg.exec(next_arg[2]))) {
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
  var day = "",
    week = "",
    date = "";
  m = dateText.match(
    /.*\b((mon|tue(s)?|wed(nes)?|thur|thurs|fri|sat(ur)?|sun)(day)?)[, ]*(of|:|;|\-|\u2013|\u2014| )*week *([0-9]+)/i
  );
  //       /.*\b((mon|tue|wed(nes)?|thur|thurs|fri|sat(ur)?|sun)(day)?)([,]*) *(,|of|:|;|\-|\u2013|\u2014) *week *([0-9]+)/i );
  // old RE didn't handle week of
  //        /.*\b(((mon|tues|wed(nes)?|thur(s)?|fri|sat(ur)?|sun)(day)?))\b[,]*[ ]*week *\b([0-9]*)/i);
  if (m) {
    day = m[1];
    week = m[m.length - 1];
    date = getTermDateContent(week, day);

    if (typeof date === "undefined") {
      return false;
    }
  } else {
    // couldn't match the date, finish up
    return false;
  }

  // update the HTML item
  dateText = dateText + " (" + date + ")";
  //dateText = `${dateText} ${otherDate}`;
  jQuery(this).html(dateText);
}

//*********************
// getTermDateContent( week, day )
// - given a week and a day of Griffith semester return actual
//   date for matching that study period
// - weeks start on Monday
// Special version for the Content Interface

function getTermDateContent(week, dayOfWeek = "Monday") {
  if (typeof TERM_DATES[TERM] === "undefined") {
    return undefined;
  }

  dayOfWeek = dayOfWeek.toLowerCase();
  var start;

  // if the week is not within the term return empty string
  if (typeof TERM_DATES[TERM][week] === "undefined") {
    return "";
  }

  // else calculate the date and generate usable string
  start = TERM_DATES[TERM][week].start;
  var d = new Date(start);

  // if dayOfWeek is not Monday, add some days to the start of the week
  if (dayOfWeek !== "monday") {
    var dayToNum = {
      tuesday: 1,
      wednesday: 2,
      thursday: 3,
      friday: 4,
      saturday: 5,
      sunday: 6,
    };
    if (dayOfWeek in dayToNum) {
      d.setDate(d.getDate() + dayToNum[dayOfWeek.toLowerCase()]);
    }
  }
  // generate string from date with given options
  const options = {
    weekday: undefined,
    year: "numeric",
    month: "long",
    day: "numeric",
  };
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
  courseTitle =
    jQuery("#courseMenu_link").attr("title") ||
    "Collapse COM14 Creative and Professional Writing (COM14_3205_OT)";

  // get the course id which will be in brackets
  m = courseTitle.match(/^.*\((.+)\)/);

  // we found a course Id, get the STRM value
  if (m) {
    id = m[1];
    // break the course Id up into its components
    // This is the RE for COMM10 - OUA course?
    breakIdRe = new RegExp(
      "^([A-Z]+[0-9]+)_([0-9][0-9][0-9][0-9])_([A-Z][A-Z])$"
    );
    m = id.match(breakIdRe);

    // found an actual course site (rather than org site)
    if (m) {
      TERM = m[2];

      // set the year
      mm = TERM.match(/^[0-9]([0-9][0-9])[0-9]$/);
      if (mm) {
        YEAR = 20 + mm[1];
      } else {
        YEAR = DEFAULT_YEAR;
      }
    } else {
      // check for a normal GU course
      breakIdRe = new RegExp(
        "^([0-9]+[A-Z]+)_([0-9][0-9][0-9][0-9])_([A-Z][A-Z])$"
      );
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
          YEAR = DEFAULT_YEAR;
        }
      } else {
        breakIdRe = new RegExp("^([0-9]+[A-Z]+)_([0-9][0-9][0-9][0-9])$");

        m = id.match(breakIdRe);

        // found an actual course site (rather than org site)
        if (m) {
          TERM = m[2];
          // set the year
          mm = TERM.match(/^[0-9]([0-9][0-9])[0-9]$/);
          if (mm) {
            YEAR = 20 + mm[1];
          } else {
            YEAR = DEFAULT_YEAR;
          }
        } else {
          // Match Y1 QCM courses e.g. 3526QCM_Y1_3211_SB
          breakIdRe = new RegExp(
            "^([0-9]+[A-Z]+)_(Y[0-9])_([0-9][0-9][0-9][0-9])_([A-Z][A-Z])$"
          );
          m = id.match(breakIdRe);
          if (m) {
            term = m[3];
            mm = term.match(/^[0-9]([0-9][0-9])[0-9]$/);
            if (mm) {
              year = 20 + mm[1];
            } else {
              year = DEFAULT_YEAR;
            }
          }
        }
      }
    }
    // if this is a QCM course (either offering of joined), then update term
    qcmRe = new RegExp("^([0-9]+QCM)_([0-9][0-9][0-9][0-9])");
    let qcmRe2 = new RegExp("^([0-9]+QCM)_(Y[0-9])_([0-9][0-9][0-9][0-9])");
    //m = qcmRe.match(id);
    m = id.match(qcmRe);
    //let m2 = qcmRe2.match(id);
    let m2 = id.match(qcmRe2);
    if (m || m2) {
      TERM = TERM + "QCM";
    }
  }
}

/**
 * function addCSS
 * @param {String} onlineUrl - for the online CSS file
 * @param {String} printUrl - for the print CSS file
 * - given the URL for a CSS file add it to the document
 *   https://makitweb.com/dynamically-include-script-and-css-file-with-javascript/
 */

function addCSS(onlineUrl, printUrl) {
  let head = document.getElementsByTagName("head")[0];

  // add the online URL CSS file
  let style = document.createElement("link");
  style.href = onlineUrl;
  style.type = "text/css";
  style.rel = "stylesheet";
  head.append(style);

  // add the print URL CSS file
  style = document.createElement("link");
  style.href = printUrl;
  style.type = "text/css";
  style.rel = "stylesheet";
  style.media = "print";
  head.append(style);
}

/*************************************************************
 * addJS( url )
 * - given the URL for a JS file add it to the document
 * https://makitweb.com/dynamically-include-script-and-css-file-with-javascript/
 * (and other places)
 */

function addJS(urlString, module = false) {
  let head = document.getElementsByTagName("head")[0];

  let js = document.createElement("script");
  js.src = urlString;
  js.crossorgin = "anonymous";
  if (module) {
    js.type = "module";
  }
  head.append(js);
}

/******************************************************************
 * changeJqueryTheme( themeName)
 * - given a theme name, remove the old jQuery theme css and replace
 *   it with the new one
 */

var JQUERY_THEMES = [
  "base",
  "start",
  "smoothness",
  "redmond",
  "sunny",
  "overcast",
  "flick",
  "pepper-grinder",
  "ui-lightness",
  "ui-darkness",
  "le-frog",
  "eggplant",
  "dark-hive",
  "cupertino",
  "blitzer",
  "south-street",
  "humanity",
  "hot-sneaks",
  "excite-bike",
  "vader",
  "black-tie",
  "trontastic",
  "swanky-purse",
];

function changeJqueryTheme(themeName) {
  // Convert the themeName to lower case with dash separation
  themeName = themeName.toLowerCase().replace(/\s+/g, "-");

  // does the new theme CSS file actually exist? / is it a valid theme name
  if (!JQUERY_THEMES.includes(themeName)) {
    return false;
  }

  // remove the old theme CSS
  // - proper new style css
  jQuery("#gu_jqueryTheme").attr("disabled", "disabled");
  // - also handle the old style
  let oldCssLink = jQuery(
    'link[href*="code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"]'
  );
  if (oldCssLink) {
    jQuery(
      'link[href*="code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"]'
    ).remove();
  }

  // add the new one
  let urlString = `https://code.jquery.com/ui/1.12.1/themes/${themeName}/jquery-ui.css`;

  var head = document.getElementsByTagName("head")[0];

  var style = document.createElement("link");
  style.href = urlString;
  style.id = "gu_jqueryTheme";
  style.type = "text/css";
  style.rel = "stylesheet";
  head.append(style);
}

// ****************************************************
// addExpandPrintButtons
// - check if URL is set up to provide a print version
// - if so add a print button to

const PRINT_URLS = {
  // documentation test
  id73051159979391:
    "https://griffitheduau-my.sharepoint.com/:b:/g/personal/d_jones6_griffith_edu_au/EVMNSeQAeJtMkbOkgRxusq8B-JyQ2x-_dfC8T_KwDVmXHA?e=cb1WzM",
  // CWR110_2211
  id90727159775401:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/01.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775441:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/02.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775481:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/03.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775531:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/04.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775581:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/05.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775631:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/06.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775681:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/07.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775731:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/08.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775781:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/09.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775831:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/10.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775881:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/11.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775931:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/12.pdf?csf=1&web=1&e=FnVoyC",
  id90727159775981:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/13.pdf?csf=1&web=1&e=FnVoyC",
  id90727159776051:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/14.pdf?csf=1&web=1&e=FnVoyC",
  id90727159776091:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/15.pdf?csf=1&web=1&e=FnVoyC",
  id90727159776141:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/16.pdf?csf=1&web=1&e=FnVoyC",
  id90727159776191:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/17.pdf?csf=1&web=1&e=FnVoyC",
  id90727159776241:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/CWR110/Study%20Guide%20PDFs/CWR110_2211/18.pdf?csf=1&web=1&e=FnVoyC",
  // CWR111_2211
  id90774159779551:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/01.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779631:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/02.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779681:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/03.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779731:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/04.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779781:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/05.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779831:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/06.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779881:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/07.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779941:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/08.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779991:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/09.pdf?csf=1&web=1&e=FnVoyC",
  id90774159780041:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/10.pdf?csf=1&web=1&e=FnVoyC",
  id90774159780091:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/11.pdf?csf=1&web=1&e=FnVoyC",
  id90774159780141:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/12.pdf?csf=1&web=1&e=FnVoyC",
  id90774159780191:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/13.pdf?csf=1&web=1&e=FnVoyC",
  id90774159780241:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/14.pdf?csf=1&web=1&e=FnVoyC",
  id90774159780281:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/15.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779181:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/16.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779261:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/17.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779341:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/18.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779401:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/19.pdf?csf=1&web=1&e=FnVoyC",
  id90774159779481:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP4/CWR111/Study%20Guide%20PDFs/CWR111_2211/20.pdf?csf=1&web=1&e=FnVoyC",
  // COM12_2211
  id90697160027351:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/01.pdf?csf=1&web=1&e=FnVoyC",
  id90697160027491:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/02.pdf?csf=1&web=1&e=FnVoyC",
  id90697160027651:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/03.pdf?csf=1&web=1&e=FnVoyC",
  id90697160027771:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/04.pdf?csf=1&web=1&e=FnVoyC",
  id90697160027891:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/05.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028031:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/06.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028141:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/07.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028261:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/08.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028361:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/09.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028461:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/10.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028541:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/11.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028661:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/12.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028741:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/13.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028821:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/14.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028881:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/15.pdf?csf=1&web=1&e=FnVoyC",
  id90697160028981:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/16.pdf?csf=1&web=1&e=FnVoyC",
  id90697160029041:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/17.pdf?csf=1&web=1&e=FnVoyC",
  id90697160029101:
    "https://griffitheduau.sharepoint.com/:b:/r/sites/HLSSacademic/OUA/Study%20Guides%20%26%20L@G/SP1/COM12/Study%20Guide%20PDFs/COM12_2211/18.pdf?csf=1&web=1&e=FnVoyC",

  "http://127.0.0.1:8080/test/":
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXCSARjB2FJAlxX581K1QPIBRwJF6Jc-7nquPc2IFXfRMw?download=1",
  // --- COM10 **id82017155859681id82017155859681id82017155859681TODO** Need to move the IDs to something based on the title and the course id (to make it study period independent?)
  // Intro
  id82017155859681:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXvTIKSc3S1OvJj-0zdBCt0BfLm32pxEB6j3euLMuaLciA?download=1",
  // 1
  id82017155859821:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EeAq5L5wb41Gns6slW0A-LwB3Yq83TythhGI6ggFcBTndg?download=1",
  // 2
  id82017155859981:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EbAqgkfJIx5Nqvd_jK1U5NIB6CPlm-EXVEQdkJwQiRWLMA?download=1",
  // 3
  id82017155860101:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EWNzglpqvdVEjTgpgmtNNpwB-FAAejeXf2-EfrMbelEBBw?download=1",
  // 4
  id82017155860221:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EQpfz6EuZmVHn8nlehy86u4BCoBPoLCMQbEClzbtTOtA6Q?download=1",
  // 5
  id82017155860361:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ERVcxqM6xI9PnlXJTIqWleABB9vN7i6NMkYZvey6aLmbvw?download=1",
  // 6
  id82017155860471:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EaMscQciQ2pLrFZLcEoOXccB1n24bXe1nLSKOpYkjV2N5w?download=1",
  // 7
  id82017155860591:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EULKp4LeFF1LujF5UFl8OHABeWORvVEkOo_ylQvzvY_40Q?download=1",
  // 8
  id82017155860721:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYiaNSNnTYJNm3VBn4Qe350BFlUIdGhtVov0HEq81RRU5g?download=1",
  // 9
  id82017155860821:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EeWjaWYjEgpHlizwaT0Lf-gBE8eJF8gqSIS6Gdx_-0VAbw?download=1",
  // 10
  id82017155860921:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ES7T_sNVEEJCgTNCCSBvBMgBygkyvthRxCFe0esIQBbjgQ?download=1",
  // 11
  id82017155861001:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ES4-c714D-1Liv7CE0XTNJABhpiF9bJxs3NywdwrZA72Vg?download=1",
  //12
  id82017155861081:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXCSARjB2FJAlxX581K1QPIBRwJF6Jc-7nquPc2IFXfRMw?download=1",
  id82017155861101:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXCSARjB2FJAlxX581K1QPIBRwJF6Jc-7nquPc2IFXfRMw?download=1",
  //13
  id82017155861181:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXO1cl-sEeZEj3H9O9acJikBghpbdwyyoKa3UDOPt4mvSQ?download=1",
  id82017155861161:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXO1cl-sEeZEj3H9O9acJikBghpbdwyyoKa3UDOPt4mvSQ?download=1",
  // assessment
  // 1
  id82017155859351:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EaovQ_phUEVBuUcv6T_-Nq8Beo9pfI5gGLTeXgZor8SteQ?download=1",
  // 2
  id82017155859441:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Ed1VsUZpHT1KlnNenO-MxugBfkzxvGw-ipxMjCZaHqej_Q?download=1",
  // 3
  id82017155859501:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EWqc_YnmVyZCsfInw968XaQBPjPOB4kbToSVYzqnQoiw4g?download=1",
  // Resources
  id82017155859601:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ER3stuIbjQFEi2TFu22qMvgBB_TQPKr3YQqp25RatuxqQA?download=1",
  // --- COM14 SP4, 2020
  id82046152719131:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EX7kjt6DSZlMkRfnMW3lc5UB2RZDJFDqvU5QZSMxSL3wTw?download=1",
  // --- CWR111 SP4, 2020
  // welcome and orientation
  id82172154304321:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EdtbB7EU1-VNiuuWgB6LCB8BvdkFEe4T5YwpboZnSrmz4Q?e=oxqscx",
  // topic 1
  id82172154304341:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXHaMp41xBxJgkUrGBJ05vABvwUpgqGjKb1Vlxv75hdW_Q?e=fCG7XI",
  // topic 2
  id82172154304401:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EfJmQ-jYEM1Cr4lCegZqUUgBY2lNRjd8wA4cloqqSP21sA?e=9YXKfr",
  // topic 3
  id82172154304411:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYh6J3b0Y_lAog8iLcq1OEABtSfQhwv0af0vk_a37KzA-g?e=DAJOW8",
  // topic 4
  id82172154304421:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EUbQutZ32i1EvulV7xSN76kBSyTeFkg_fhk6jbZqF3u5jg?e=5p6rJs",
  // topic 5
  id82172154304431:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ETG-b9QlDaNIqTM6ZdZ_CrMBJ5XUSTWZd1iXzybEiCtzPA?e=hovWdD",
  // topic 6
  id82172154304441:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EZZbKdDg6v5GtMGU0kcYp2IBwGA6aA8WYcARkKWCBo8ryQ?e=K8CZFv",
  // topic 7
  id82172154304461:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EWAR5LNz_2BDtzf9XBA7NjABvoJ5NpqDixMQ8piSLmqhRg?e=MSNQ09",
  // topic 8
  id82172154304471:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ESGdxEcctO9GlhCHbvfir20BS_cLrgcYzwnLC28hJdxK-g?e=6gIpuf",
  // topic 9
  id82172154304481:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXVPj64V4BlPnyyBM8mNg_8BjczIJ1wchsKRoRp4tmZMXA?e=1loFnc",
  // topic 10
  id82172154304501:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EQaHF2tR9oBBvrlszRQMV98BbtWSP6MQnQAzQATKx2IEEg?e=D25Cso",
  // topic 11
  id82172154304511:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EbkQFoUVXWdEo2BJF1TzXBwBBo6gspDleUbrwhpSmp7QYQ?e=ZvgGPI",
  // topic 12
  id82172154304521:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EUhHW-ML-mhGpVbAC7p82c4BUOpF3cfEL8DFJ0hFdoOAcA?e=G2F4KI",
  // On the exegesis
  id82172154304561:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EVkmN8cfHNZInJWK4cQsZ64BGgSBSv-9NhFmdHQhUuNtPQ?e=F7lpRI",
  // On the critical review
  id82172154304611:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EfEwCaXXlr1JrI_UhDD0q1YB6fkHTZKCeVIOf47JLUW2Mw?e=QNdn7J",
  // A1 Online discussion
  id82172154304821:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYg7ai0HybNHmZDJttzTZOMB8zmi6vVZUrP6EeEkTXQv9A?e=8kkhpW",
  // A2 folio 1
  id82172154304861:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EdYRpjiS41RAoHNewugYi2oB2rTeHttgKxzd5Ib7otgcLw?e=atMPA7",
  // A3 Critical review
  id82172154304881:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EZRA0bwPel1Ho0nBf9pYXXABeXoMnGmmPX1_4n0CjBoS1w?e=16TNBt",
  // A4 Folio 2
  id82172154306061:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ESbqa1F3H8tLjA8eSfklAm8BbrGVWg6kYg8oyUaZT6UXhA?e=WDQ9XM",
  // Assessment resources
  id82172156823011:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Edy-fjSBvTBNuIDTLekhmD4BWNkKbO08YSS1jPatjkJiMg?e=Ch0XIA",

  //************************************* COM14 SP4 */
  // Basecamp
  id82046153058251:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXctyASVrPBKlpUFGeAOZ3cBSL3kSTfWM_iOXDLtleogpQ?e=Fac9nI",
  // Week 1
  //  id82046152719131:
  //   "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EX7kjt6DSZlMkRfnMW3lc5UB2RZDJFDqvU5QZSMxSL3wTw?e=D8yTZf",
  id73051157691491:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EX7kjt6DSZlMkRfnMW3lc5UB2RZDJFDqvU5QZSMxSL3wTw?e=D8yTZf",
  // Week 2
  id82046152751351:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Edl0bp_YCUxJt8_v51gCWlUB-iaxdThid_KHY5__CRNDSQ?e=GzVuaf",
  // Week 3
  id82046152751361:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ESeh1-hLRB9Mt0I4OOQVDq4BdaFh-uhOeMtnMlMri3bTeQ?e=EtasCM",
  // Week 4
  id82046152751371:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYbrxc4SZqFIv78lIFZ-KXIBBeQOc6JOOuWgL4nMquK_fw?e=PuRhiZ",
  // Week 5
  id82046152751381:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EQhWuKYitbZFqbwdcw3ck1wBSpYt-r4WBT0uZ7IK9lGvNQ?e=VOjb7W",
  // Week 6
  id82046152751391:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EfGRWAFkzMVEo0Kkr56SwmsBbwluOvh_1zegtzd-1zIzOQ?e=OXjNXf",
  // Week 7
  id82046152751401:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EVtcN20P46RPlwP6u0gd6ZABi4KUKqr7JzNEcZ9a8C_9vA?e=Ceu5T3",
  // Week 8
  id82046155704981:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EURi4tkebBxBmxgrYfnXnsoBsZtkqaDehQcZ8kvXc-Ye6Q?e=PNfibl",
  // Week 9
  id82046155704991:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXPTG6tmjWBKqxKKnDkRyq0BvXzVtr0GNZCsc3VREjdGzw?e=XKX6Ql",
  // Week 10
  id82046155705001:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Ed7ddppaDelCoO2QOmebIFYBvOiRIwar6g7C6Pyheg0_nA?e=fsKnvd",
  // Week 11
  id82046155705011:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ET3kQVtSXV9KvWO7Ov6NddkBQ_pWg2EaoQ6HR267wr4WOA?e=QtpJgY",
  // Week 12
  id82046155705021:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXSx4-dPhrhDuRSp50zvBNABvwV8if2LiLzNpSvYk-sVvA?e=gbuVn2",
  // Week 13
  id82046155852241:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXjBvkyA2CtHpp-gatiBI4ABJ0WdyGqj75br-m88ft3mXA?e=3EuRZP",
  // a1 - writing portfolio
  id82046155644091:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ETUdOwoa0YZFj-JHF3BgOTAB_PVSPtCguOqiaCfPDJ8JOA?e=cAulJI",
  // a2 - weekly workouts
  id82046155644301:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EUyCE4QuMfJDnnso7oFH3L0BLiot9ldWo9wXiO9uwf6-7A?e=tkbvox",
  // a3 - creative writing
  id82046155644381:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ETdcqIGUSnFPkNP8Y3AVelYBr_ZpfDW5_wSCeRhTB1hy2A?e=bgZT5K",

  //****************COM12 SP4 */
  //com12/unitintroduction.pdf'
  id82005156959011:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYqSw3pi_XZAkt6TSX5H9VIBl4ZWtH-iN_OcUMuYmqzWkA?e=yx58Gu",
  //com12/topic01.pdf'
  id82005156959151:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EYo3TzR2mltPn5B-1c5Ryz0BmEH8Q4fxtFwEayF8m2P3Fw?e=aAQGnc",
  //com12/topic02.pdf'
  id82005156959311:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EVXY0k0cHaJFh8_5LiwekdUBRDRi547eV8-1E8TW3LK5RA?e=k6Lkdt",
  //com12/topic03.pdf'
  id82005156959431:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EeLGZteXkqtJog_ui-zzfFIBX63IvT2KTbT8LquDqCskgA?e=yg7aDi",
  //com12/topic04.pdf'
  id82005156959551:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EfPjMPYv1DtCix3B_1jdOGcB3qFGuQsfHp3TXKfSYlMtEw?e=sfwUiA",
  //com12/topic05.pdf'
  id82005156959691:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EUIHPY6KDIZHnnPER5t-RukBjQMQiIxCF0CPcB7rjx-oOw?e=RiCmvn",
  //com12/topic06.pdf'
  id82005156959801:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EZD1-9-LrxVJhgzYRsoNk2QBYH2TWrC_4Opz9RfAfce3ig?e=Q9blat",
  //com12/topic07.pdf'
  id82005156959921:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXA1YRYZOJZLm8B2l2EwaYkBa6KL7xKBcKulmM2y7My90Q?e=enGq1U",
  //com12/topic08.pdf'
  id82005156960151:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ETlkcxLLRXFLnt5SY7A7aG8BkBtRe0q8UGaB4JaLbhbrVQ?e=v6zMeR",
  //com12/topic09.pdf'
  id82005156960051:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EY651SKQvkRAj1XRk21bv-8ByRI7VJWCkZQZhDvp6SYYSQ?e=EvlVOZ",
  //com12/topic10.pdf'
  id82005156960251:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ETU3J3OWgEFAmvQH70i0Zn4Bjx3zcq5gMJ99nC5H74lmDA?e=mrSGcp",
  //com12/topic11.pdf'
  id82005156960331:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EQfMkrydyMVJgUkk1MFDdLYBbdbOTtZ3jBp8poByBbuS3A?e=RPIyOg",
  //com12/topic12.pdf'
  id82005156960411:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/Ea11dlZyONxIrlc43JQS8PcBZCR5Qr9Eg0fwfMrezVVmWQ?e=3a9C1Q",
  //com12/topic013.pdf'
  id82005156960491:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EUbx8xAoWkVFpPKdp4oMB3ABQhJ2TSvSTlI7wDDFwmr4aQ?e=OnimhO",
  //com12/a1ILTs.pdf'
  id82005156960541:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EXtFrytYCjdDnRkgm9Knw_ABLtnRqI0o0f_LutqScndDsw?e=Pthwuv",
  //com12/a2short_essay.pdf'
  id82005156960641:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/ERgrdmBs9_BIj-JSytoDxTMBufe-JLBBezQcmFfTs4gJiQ?e=uGRDg5",
  //com12/a3business_report.pdf'
  id82005156960701:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EaVSj-UdBBBCruHAYa7yuSwBn2pUT7_SfcdGEhb7kxYYnA?e=xgp94w",
  //com12/assessmentresources.pdf'
  id82005156960761:
    "https://griffitheduau.sharepoint.com/:b:/s/HLSSacademic/EfbbHGlX41dKlGvqevLCFwMBJ0Hsbg8w2iJXRGjpy_kFHA?e=4nfk2o",
};

/**
 * @function extractAndCategoriseLinks
 * @param {Element} document
 * @returns dictionary of URLs with categories
 */

function extractAndCategoriseLinks(document) {
  let urls = {};
  const blackboardPattern = new RegExp(".griffith.edu.au/webapps/blackboard");

  // generate a unique list of links
  // key is the href, value is the anchor text
  // - ignore mark review links
  // - transform Blackboard links
  let nodeList = document.querySelectorAll("a");

  for (let i = 0; i < nodeList.length; i++) {
    // skip the review links
    if (nodeList[i].className.includes("gu-bb-review")) {
      continue;
    }
    // skip links without href
    if (!nodeList[i].hasAttribute("href")) {
      continue;
    }

    // distinguish between external and Blackboard links
    let type = "ExternalLink";
    if (blackboardPattern.test(nodeList[i].href)) {
      // remove any mention of -blaed in the hostname
      nodeList[i].href = nodeList[i].href.replace(
        "//bblearn-blaed",
        "//bblearn"
      );
      type = "BlackboardLink";
    }

    urls[nodeList[i].href] = {
      text: nodeList[i].innerText,
      type: type,
    };
  }

  //

  return urls;
}

/**
 * categoriseEmbeds
 * @param {Element} span HTML node for span.embed surrounding the iframe
 * @returns {Object} with attributes videoHtml, videoURL, activity
 */

function categoriseEmbeds(span) {
  //  let iframe = span.firstChild;
  let iframe = span.getElementsByTagName("iframe")[0];
  let src = iframe.src;
  let nextNode = iframe.nextSibling;

  // is src a URL
  // start analysing src to find the type of service
  let servicePattern = new RegExp("^https://([^/]*)");
  let match = src.match(servicePattern);

  if (!match) {
    return {
      videoHtml: `<p>Could not identify a valid source URL from : ${src}`,
      videoUrl: "",
      activity: "error",
    };
  }

  let service = match[1];

  // a Microsoft form?
  if (service.includes("forms.office.com")) {
    return {
      videoHtml: `<p>Please complete <a href="${src}">this form/survey</a></p>`,
      videoUrl: src,
      activity: "Activity",
    };
  }

  // Microsoft stream
  if (service.includes("microsoftstream.com")) {
    let pattern = /^https:\/\/[^\/]*\/embed\/video\/([^\/?]*)/;
    match = src.match(pattern);
    if (match) {
      let videoId = match[1];
      let videoUrl = `https://web.microsoftstream.com/video/${videoId}`;
      return {
        videoHtml: `<p>A Microsoft Stream video can be watched at <a href="${videoUrl}">${videoUrl}</a></p>`,
        videoUrl: videoUrl,
        activity: "filmWatchingOptions",
      };
    } else {
      return {
        videoHtml: `<p>Unable to recognise format of video URL: ${src}</p>`,
        videoUrl: src,
        activity: "error",
      };
    }
  }

  // echo360 embeds
  if (service.includes("echo360.net.au")) {
    let videoUrl = src;
    return {
      videoHtml: `<p>An Echo360 video can be watched at <a href="${videoUrl}">${videoUrl}</a></p>`,
      videoUrl: src,
      activity: "filmWatchingOptions",
    };
  }

  // Padlet
  // the iframe src does point to the padlet live
  if (service.includes("padlet.org")) {
    let videoUrl = src;
    return {
      videoHtml: `<p>A padlet for your contribution is available at <a href="${videoUrl}">${videoUrl}</a></p>`,
      videoUrl: src,
      activity: "Activity",
    };
  }

  // Youtube
  if (service.includes("youtube.com")) {
    let pattern = /^https:\/\/[^\/]*\/embed\/([^\/]*)/;
    match = src.match(pattern);
    if (match) {
      let videoId = match[1];
      let videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      return {
        videoHtml: `<p>A YouTube video can be watched at <a href="${videoUrl}">${videoUrl}</a></p>`,
        videoUrl: src,
        activity: "filmWatchingOptions",
      };
    } else {
      return {
        videoHtml: `<p>An unidentified YouTube video URL wsa found. It points to this resource: ${src}</p>`,
        videoUrl: src,
        activity: "filmWatchingOptions",
      };
    }
  }

  // vimeo
  if (service.includes("vimeo.com")) {
    // https://player.vimeo.com/video/185808340
    // https://vimeo.com/185808340
    let pattern = /^https:\/\/[^\/]*\/video\/([^\/]*)/;
    match = src.match(pattern);
    if (match) {
      let videoId = match[1];
      let videoUrl = `https://vimeo.com/${videoId}`;
      return {
        videoHtml: `<p>A Vimeo video can be watched at <a href="${videoUrl}">${videoUrl}</a></p>`,
        videoUrl: src,
        activity: "filmWatchingOptions",
      };
    } else {
      return {
        videoHtml: `<p>Unable to recognise format of video URL: ${src}</p>`,
        videoUrl: src,
        activity: "error",
      };
    }
  }

  // SoundCloud
  // - iframe can't give URL, but the next div should contain two links,
  //   the second should be the link we want
  if (service.includes("soundcloud.com")) {
    let link = nextNode.childNodes[2];
    if (
      typeof link !== "undefined" &&
      link.nodeName === "A" &&
      link.hasAttribute("href")
    ) {
      return {
        videoHtml: `<p>Play SoundCloud audio at this URL: 
            <a href="${link.href}">${link.href}</a></p>`,
        videoUrl: link.href,
        activity: "Activity",
      };
    } else {
      return {
        videoHtml:
          "<p>Unable to identify proper link for SoundCloud audio.</p>",
        videoUrl: "",
        activity: "error",
      };
    }
  }

  if (service.includes("h5p.com")) {
    src = src.replace("/embed", "");
    return {
      videoHtml: `<p>A H5P resource is available from <a href="${src}">${src}</a>`,
      videoUrl: src,
      activity: "Activity",
    };
  }
  // griffitheduau-my.sharepoint.com/personal/d_jones6_
  // Embed and view dependent upon parameter
  // - https://griffitheduau-my.sharepoint.com/personal/d_jones6_griffith_edu_au/_layouts/15/Doc.aspx?
  //  sourcedoc={10e05189-c015-406a-8c62-0cb57811affc}

  if (src.includes("-my.sharepoint.com")) {
    if (src.includes("embedview")) {
      let embedUrl = new URL(src);
      let params = embedUrl.searchParams;
      let sourceDoc = params.get("sourcedoc");
      if (sourceDoc !== "") {
        let linkUrl = `${embedUrl.hostname}/${
          embedUrl.pathname
        }?${embedUrl.searchParams.get("sourcedoc")}`;

        return {
          videoHtml: `<p>A SharePoint resource can be downloaded from 
           <a href="${linkUrl}">${linkUrl}</a></p>`,
          videoUrl: linkUrl,
          activity: "Activity",
        };
      }
    } else {
      return {
        videoHtml: `<p>Unable to understand sharepoint embed - 
          <a href="${src}">${src}</a></p>`,
        videoUrl: "",
        activity: "error",
      };
    }
  }

  // Didn't match any of the above
  // TODO should probably check for valid src URL
  return {
    videoHtml: `<p>An embedded resource of unrecognised type pointing to <a href="${src}">this resource</a> (${src}).`,
    videoUrl: src,
    activity: "Activity",
  };
}

/**
 * @function extractAndCategoriseEmbeds
 * @param {Element} document
 * @returns dictionary of embed information
 * Each entry is keyed on URL of iframe and will contain
 * - videoHtml - HTML to show instead of video (inside the div of type activity)
 * - videoUrl - the URL of the video (slightly modified from the iframe.src)
 * - activity - type of activity (class name)?
 */

function extractAndCategoriseEmbeds(document) {
  let embeds = {};

  // generate a unique list of embeds
  let nodeList = document.querySelectorAll("span.embed");

  for (let i = 0; i < nodeList.length; i++) {
    //let iframe = nodeList[i].firstChild;
    let iframe = nodeList[i].getElementsByTagName("iframe")[0];
    // skip embeds without src
    //   if (!nodeList[i].hasAttribute("src")) {
    if (typeof iframe === "undefined") {
      continue;
    }
    if (iframe.nodeName !== "IFRAME" || !iframe.hasAttribute("src")) {
      continue;
    }

    // SoundCloud can't calculate player URL from iframe.src,
    // However typically the next div will include two soundcloud links
    // The second is the page, can we get next element from nodeList[i]
    embeds[iframe.src] = categoriseEmbeds(nodeList[i]);
    /*  {
      'text': `some iframe ${nodeList[i].innerText}`
    }*/
  }

  return embeds;
}

/**
 * @function replaceEmbeds
 * @param {Element} document - node containing content interface
 * @param {dictionary} embeds - collection of information about all embeds
 * For each embed, replace the iframe/span.embed in the document with
 * appropriate HTML for print
 */

function replaceEmbeds(document, embeds) {
  // generate a unique list of embeds
  let nodeList = document.querySelectorAll("span.embed");

  // loop through the embeds
  for (let i = 0; i < nodeList.length; i++) {
    //let iframe = nodeList[i].firstChild;
    let iframe = nodeList[i].getElementsByTagName("iframe")[0];
    // skip embeds without src
    //if (!nodeList[i].hasAttribute("src")) {
    if (typeof iframe === "undefined") {
      continue;
    }
    if (iframe.nodeName !== "IFRAME" || !iframe.hasAttribute("src")) {
      continue;
    }
    // does it match any of the embeds
    let src = iframe.src;
    let html = "";

    if (src in embeds) {
      if (embeds[src].activity === "Activity") {
        html = `
          <div class="activityImage">
            <img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-dancing-48.png" alt="Activity icon" />
          </div>
          <div class="instructions">
          ${embeds[src].videoHtml}
          </div>
        `;
      } else if (embeds[src].activity === "filmWatchingOptions") {
        html = `
          <div class="filmWatchingOptionsImage">
            <img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-movie-beginning-64.png" alt="Film Watching icon" \>
          </div>
          <div class="instructions">
            ${embeds[src].videoHtml}
          </div>
        `;
      }

      // replace the node (containing the embed) if html is something
      if (html !== "") {
        // create the new node, which is the div class="activity|filmWatchOptions"
        let newNode = document.createElement("div");
        newNode.className = embeds[src].activity;
        // add in the HTML
        newNode.innerHTML = html;
        nodeList[i].parentNode.replaceChild(newNode, nodeList[i]);
        // is this actually atargetting the right element
      }
    }
  }
}

/**
 * @function addLinksForPrint
 * @param {Element} document
 * @param {Object} urls (dictionary) - details for all links
 * @param {Object} embeds (dictionary) - details for all embeds
 * Add some HTML to the end of the document containing details of the links
 */

function addLinksForPrint(document, urls, embeds) {
  let linkList = "";
  let embedList = "";

  // split the urls into Blackboard and External links
  //  Each link has a type, either "ExternalLink" or "BlackboardLink"
  let blackboardLinks = Object.fromEntries(
    Object.entries(urls).filter(
      ([key, value]) => value.type === "BlackboardLink"
    )
  );

  let externalLinks = Object.fromEntries(
    Object.entries(urls).filter(([key, value]) => value.type === "ExternalLink")
  );

  // Figure out if there are any online materials
  const haveExternalLinks = Object.keys(externalLinks).length > 0;
  const haveBlackboardLinks = Object.keys(blackboardLinks).length > 0;
  const haveEmbeds = Object.keys(embeds).length > 0;

  let html = `
  <h1>Online Exclusive Materials</h1>`;

  if (!haveExternalLinks && !haveBlackboardLinks && !haveEmbeds) {
    html = html.concat(`
    <p>This document includes no references to other online material.</p>
    `);
  } else {
    html = html.concat(`
  <p>This document makes reference to the following online resources.</p>
    `);

    if (haveEmbeds) {
      for (let src in embeds) {
        embedList = embedList.concat(` <li> ${embeds[src].videoHtml} </li>`);
      }

      html = html.concat(`
  <h2>Videos and other embedded materials</h2>

  <ul>
  ${embedList}
  </ul>
    `);
    }

    if (haveExternalLinks) {
      for (let href in externalLinks) {
        linkList = linkList.concat(
          ` <li> ${urls[href].text} - <a href="${href}">${href}</a> </li> `
        );
      }

      html = html.concat(`
    <h2>External Links</h2>
    <ul>
      ${linkList}
    </ul>
    `);
    }

    if (haveBlackboardLinks) {
      linkList = "";
      for (let href in blackboardLinks) {
        linkList = linkList.concat(
          ` <li> ${urls[href].text} - <a href="${href}">${href}</a> </li> `
        );
      }

      html = html.concat(`
    <h2>Blackboard Links</h2>
    <ul>
      ${linkList}
    </ul>
    `);
    }
  }

  let linkDiv = document.createElement("div");
  linkDiv.id = "gu-ci-links";
  linkDiv.innerHTML = html;
  let ci = document.getElementById("GU_ContentInterface");
  ci.appendChild(linkDiv);
}

/**
 * @function prepareForPrint
 * @param {Element} document
 * @param {title} String title of the HTML page being printed
 * @param {courseName} String description of course name
 * Modify the given document to prepare it for printing
 * - remove accordions
 */

function prepareForPrint(document, title, courseName) {
  // remove expand buttons
  document.querySelector(".accordion-expand-holder").style.display = "none";

  // remove the gu_addedAdvice class
  document.querySelectorAll(".gu_addedAdvice").forEach((advice) => {
    advice.style.display = "none";
  });

  // remove mark reviewed buttons
  document.querySelectorAll("div.gu-ci-review").forEach((button) => {
    button.style.display = "none";
  });

  // remove the mark reviewed label in the accordions
  document.querySelectorAll("span.gu-ci-review").forEach((button) => {
    button.style.display = "none";
  });

  // replace the inner text on headings for review status etc _edit mode_ on
  document.querySelectorAll("h1.blackboard").forEach((h1) => {
    h1.innerText = h1.innerText.replace(" (Review status on)", "");
    h1.innerText = h1.innerText.replace(
      " (section hidden from some/all students)",
      ""
    );
  });

  // extract and categorise links
  let urls = extractAndCategoriseLinks(document);
  let embeds = extractAndCategoriseEmbeds(document);
  // Replace all the embeds
  replaceEmbeds(document, embeds);
  // add the "Online exclusive" section to the end of the document
  addLinksForPrint(document, urls, embeds);

  // update the title using the first <div class="invisible" which currently has
  // the title of the chapter (from the Word document)
  let printTitle = document.querySelector("div.invisible");
  if (printTitle !== null) {
    courseName = courseName.replace(/\(.*\)$/, "");
    printTitle.innerHTML = `<div class="printHeader">
  <div class="printCourseName">${courseName}</div> 
  <div class="printPageTitle">${title}</div></div>`;
  }
}

/**
 * @function printPDF
 * @param {Event} e
 * Given an event (on click) open up a window with converted content rady
 * to download a PDF
 */
function printPDF(e) {
  e.stopPropagation();

  // get the content and title of the Content Interface
  // TODO - do we need to expand all?
  let expand = jQuery(".gu_content_open, .open");

  if (expand.length > 0) {
    expand[0].click();
  }

  let divContents = jQuery("#GU_ContentInterface").html();
  let title = document.querySelector("#pageTitleText").innerText;
  let courseName = document.querySelector("#courseMenu_link").innerText;

  let bodyString = `
  <link type="text/css" rel="stylesheet" href="${PARAMS.downloadPDFURL}"> 
  <div id="GU_ContentInterface">
    ${divContents}
  </div>
  `;

  // print it
  let printWindow = window.open("", "", "height=400,width=800");
  let base = printWindow.document.createElement("base");
  base.href = `https://${LMS_LINK}`;
  printWindow.document.title = title;
  printWindow.document.head.appendChild(base);
  printWindow.document.body.innerHTML = bodyString;
  printWindow.document.close();

  prepareForPrint(printWindow.document, title, courseName);

  // kludge to get CSS loaded?
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 1000);

  // prevent the parent window reloading
  return false;
}

function addExpandPrintButtons() {
  // add the expand buttons
  jQuery("#GU_ContentInterface").prepend(EXPAND_COLLAPSE_BUTTON_HTML);

  // show downloadButton for downloadButtonURL and downloadButtonLabel
  if (PARAMS.downloadButtonURL) {
    let label = "Download File";
    if (PARAMS.downloadButtonLabel) {
      label = PARAMS.downloadButtonLabel;
    }
    let tooltip = "";
    let tt_class = "";
    if (PARAMS.downloadButtonTip) {
      tooltip = `data-tooltip-content="${PARAMS.downloadButtonTip}"`;
      tt_class = 'class="ci-tooltip"';
      addToolTipster();
    }
    const download_button = `
    <button href="" type="button" id="gu_download" ${tooltip} ${tt_class} 
        onclick="window.open('${PARAMS.downloadButtonURL}', '_blank'); return false;"
       style="padding:0.3em 1.2em;margin:0 0.3em 0.3em 0;border-radius:2em;border:2px solid;box-sizing: border-box;text-decoration:none;text-align:center"
      >${label}</button>
    `;
    jQuery(".accordion-expand-holder").append(download_button);

    return true;
  }
  // Provide the generic Download PDF button to dynamic printing
  if (PARAMS.downloadPDF) {
    const print_button = `
    <button href="type="button" id="gu_downloadPDF"
       style="padding:0.3em 1.2em;margin:0 0.3em 0.3em 0;border-radius:2em;border:2px solid;box-sizing: border-box;text-decoration:none;text-align:center"
      >Download PDF</button>
    `;
    jQuery(".accordion-expand-holder").append(print_button);
    jQuery("#gu_downloadPDF").on("click", printPDF);

    return true;
  }
  // The early approach was to have a pdfUrl based on hard coded data structures
  // deprecated
  pdfUrl = getPrintButtons();
  if (pdfUrl) {
    const print_button = `
    <button href="type="button" onclick="window.open('${pdfUrl}')"
      >Download PDF</button>
    `;
    jQuery(".accordion-expand-holder").append(print_button);
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
    hrefId = "id" + hrefId.replace(/\//g, "");
    hrefId = hrefId.replace(/_/g, "");
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
  let text = placeholder
    .text()
    .replace(/<br \/>/g, ". ")
    .replace(/:./g, ":");
  placeholder.text(text);
  document.title = text;
}
