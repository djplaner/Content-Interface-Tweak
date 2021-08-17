// ==UserScript==
// @name         ciAddReviewStatus
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Detect a Blackboard page with Content Interface and reviewStatus items missing. Offer to add them.
// @author       David Jones
// @match        https://*.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?*
// @match        https://*.griffith.edu.au/webapps/blackboard/execute/manageCourseItem?*
// @match        https://*.griffith.edu.au/webapps/blackboard/content/manageReview.jsp?*
// @icon         https://www.google.com/s2/favicons?domain=griffith.edu.au
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

console.log("################################################################");

const NO_MATCHING_CONTENT="(no matching content item found)";
const URL_PARAMS = new URLSearchParams(window.location.search);
const COURSE_ID = URL_PARAMS.get("course_id");
const CONTENT_ID = URL_PARAMS.get("content_id");
const LOCATION = window.location.toString();

const NEW_ITEM = GM_getValue(`ci-addReviewStatus-${COURSE_ID}-newItem`) || '';
const SET_REVIEW = GM_getValue(`ci-addReviewStatus-${COURSE_ID}-setReview`) || '';
var NUM_MISSING_ITEMS = GM_getValue(`ci-addReviewStatus-${COURSE_ID}-numMissingItems`) || 0;

/**
 * add an update button to the page
 */

function addUpdateButton(){
    console.log("-------------------------- addUpdateButton -------------");
    // create the button
    let updateButton = document.createElement('button');
    updateButton.id = "ciAddReviewStatus"
    updateButton.innerHTML = "Add Review Status Items";
    updateButton.style = "padding:0.3em 1.2em;margin:0 0.3em 0.3em 0;border-radius:2em;border:2px solid;box-sizing: border-box;text-decoration:none;text-align:center";
    document.querySelector("#GU_ContentInterface>.accordion-expand-holder").appendChild(updateButton);
    document.getElementById("ciAddReviewStatus").addEventListener(
        "click", addReviewStatusItems, true
        );
}

/**
 * Start the process of adding each of the missing review status items
 * - probably can't just loop through because adding requires changing URLs and scraping
 */

function addReviewStatusItems(zEvent){
    console.log("-------------------------- addReviewStatusItems -------------");
    zEvent.stopPropagation();
    zEvent.preventDefault();
    startAddPage();
}

// Find missing elements, if there are any, starting adding

function startAddPage(){

    // get the headings
    const headings = document.evaluate(`//div[@id="GU_ContentInterface"]/div/h1[contains(text(),"${NO_MATCHING_CONTENT}")]`,
                                           document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
    console.log(`headings type is ${typeof(headings)} with length ${headings.snapshotLength}`);
    /*for ( let i=0; i < headings.snapshotLength; i++ ){
        console.log(`heading ${i} is ${headings.snapshotItem(i)}`);
    }*/
    console.log(headings.snapshotItem(0));

    GM_setValue(`ci-addReviewStatus-${COURSE_ID}-numMissingItems`, NUM_MISSING_ITEMS);
    // get the heading (minus missing content) of the first item

    // if we found a heading with missing content
    if ( headings.snapshotLength>0) {
        let newItemName = headings.snapshotItem(0).innerText.replace(` ${NO_MATCHING_CONTENT}`, '');
        console.log(`first heading with content ${headings.snapshotItem(0).innerText} but really ${newItemName}`);

        // add the item for it
        GM_setValue(`ci-addReviewStatus-${COURSE_ID}-newItem`,newItemName);
        let addPageURL = `https://${window.location.hostname}/webapps/blackboard/execute/manageCourseItem?content_id=${CONTENT_ID}&course_id=${COURSE_ID}&do=add&dispatch=add`;
        window.location = addPageURL;
        //setReviewStatus();
        // and set the review status for it
    }
}

/**
 * Load up the page to add a content item, use the newItemName and submit, ready for review status
 **/

function addPage(){
    console.log("-------------------------- addPage -------------");
    // go to the add content item page
    console.log(`---- startAddPage trying to add new item called ${NEW_ITEM}`);
    // set the title for the item
    const nameElement = document.querySelector("input#user_title");
    nameElement.value = NEW_ITEM;

    // set the GM value so ready to et review TODO
    GM_setValue(`ci-addReviewStatus-${COURSE_ID}-setReview`,NEW_ITEM);
    GM_setValue(`ci-addReviewStatus-${COURSE_ID}-newItem`, '');
    // hit the submit button
    const button = document.querySelector("input#bottom_Submit");
    button.click();
}

/**
 * Set the review status
 **/

function setReview(){
    console.log("-------------------------- setReview -------------");
    // go to the add content item page
    console.log(`---- setReview trying to add new item called ${SET_REVIEW}`);
    // set the title for the item
    const enableReviewElement = document.querySelector("input#enableReview_true");
    enableReviewElement.checked=true;

    // set the GM value so ready to et review TODO
    GM_setValue(`ci-addReviewStatus-${COURSE_ID}-setReview`, '');
    GM_setValue(`ci-addReviewStatus-${COURSE_ID}-numMissingItems`,'');
    GM_setValue(`ci-addReviewStatus-${COURSE_ID}-newItem`,'');
    // hit the submit button
    const button = document.querySelector("input#bottom_Submit");
    button.click();
}



/**
 * Look for div#GU_ContentInterface and
 * for any h1/h2 within that have (not matching content item found) in the innerText
 */

function detectMissingReviewStatus(){
    console.log("-------------------------- detectMissingReviewstatus -------------");
    console.log(`Trying to detect ci and missing review status`);
    const ci = document.querySelector('#GU_ContentInterface');

    if ( ci!==null ){
        //const headings = document.querySelectorAll('#GU_ContentInterface>.accordion_top>h1');
        const headings = document.evaluate('//div[@id="GU_ContentInterface"]/div/h1[contains(text(),"(no matching content item found)")]',
                                           ci, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
                                     //XPathResult.ANY_TYPE, null );
        if ( headings.snapshotLength>0 ){
            NUM_MISSING_ITEMS = headings.snapshotLength;            
            addUpdateButton();
        }
    }
}

/**
 * Testing if we can actually call setReviewStatus
 * - find and mouse over the item heading
 * - maybe not mouse over - click on the anchor that follows it
 * - which opens up menu including a <li id=review_status...."><a id="review-status" click that a
 *
 * Rather than do all the above clicking, just use courseid and contentId to call the review status page
 * URL is /webapps/blackboard/content/manageReview.jsp?course_id=_90723_1&amp;content_id=_6353036_1
 * - course_id comes from the documentURl
 * - content_id comes from the id of div#item i.e. parent
 */

function startSetReview(){
    console.log("-------------------------- startSetReview -------------");
    console.log(`Startign setReview for item ${SET_REVIEW}`);
    const itemTitle = SET_REVIEW;

    // is there a heading with that title?
    const headings = document.evaluate(`//ul[@id="content_listContainer"]/li/div/h3/span[2][contains(text(),"${itemTitle}")]`,
                                           document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
    if ( headings.snapshoLength===0){
        console.error(`ciAddReviewStatus: unable to find item with title ${itemTitle}`);
        return false;
    }

    // get the parent, so we can get the id
    let titleElement = headings.snapshotItem(0);
    const parent = titleElement.parentElement.parentElement;
    console.log("Where are we");
    console.log("parent");
    console.log(parent);
    console.log(`the id is ${parent.id}`);

    const contentId = parent.id;
    const urlParams = new URLSearchParams(window.location.search);

    let reviewStatusURL = `https://${window.location.hostname}/webapps/blackboard/content/manageReview.jsp?course_id=${urlParams.get('course_id')}&content_id=${contentId}`;
    console.log(`URL is ${reviewStatusURL}`);
    // set gm variable to start for addReviewStatus
    //GM_setValue(`ci-addReviewStatus-${COURSE_ID}-${contentId}`,'start');
    window.location = reviewStatusURL;
}

(function() {
    'use strict';

    /*console.log("----------------------------------------------------");
    console.log("----------------------------------------------------");
    // courseId and contetnId of the current page
    console.log(`window location is ${LOCATION}`);

    // set if we're managing the seting of review status
    
    console.log(`-------------------- NUM_ITEMS ${NUM_MISSING_ITEMS}`);*/

    // 1. listContentEditable - nothing else
    //    - if missing review status - add the button
    //    - button click - adds item - calls #2
    //    - ci-addReviewStatus-courseId-newItem == name of item
    // 2. manageCourseItem
    //    - get item name and add it
    //    - add set review status variable
    //       ci-addReviewStatus-courseId-setReview == name of item
    // 3. listCOntentEditable - but with set review status
    //    - set review status
    //    - clear all variables
    //    - submit page
    //
    // if the document.URL includes manageCourseItem?dispatch=add
    // - need to check a GM variable for a name to add
    // - set another GM variable so we set review status
    // - fill in some info and hit submit

    // if the document.URL is the normal listContentEditable
    // - check for setReviewStatus if found
    // - set another varibale
/*     - click the review status */

    // if we're editing a Blackboard content page
    if ( LOCATION.includes("listContentEditable.jsp") ) {
        // if we're not in the process of adding a new item
        console.log(`--- listContentEditable.jsp NEW_ITEM=${NEW_ITEM} SET_REVIEW=${SET_REVIEW} NUM_MISSING_ITEMS=${NUM_MISSING_ITEMS}`);
        if ( NEW_ITEM==="") {
            //console.log("--- new_item==='' ");
            // if we're not in the process of setting review
            if ( SET_REVIEW==="") {
              //  console.log("--- set_review==='' ");
                // first time here, check to see if any CI headings are
                // missing review status (add the button) to start
                // if the button is clicked, it will start addItem
                if ( NUM_MISSING_ITEMS===0 ) {
                //    console.log("--- num_missing_items===0 ");
                    detectMissingReviewStatus();
                } else {
                    startAddPage();
                }
            } else {
                // we've just added an item, time to set the review
                startSetReview();
            }
        } /*else {
            // we're one one of the other pages, either adding an item
            // or setting the review status
            if ( NEW_ITEM!=="") {
                // actually add the item
                finishAddPage();
            }
        }*/
    }
    if ( LOCATION.includes("manageCourseItem")) {
        //console.log(`--- manageCourseItem.jsp NEW_ITEM=${NEW_ITEM} SET_REVIEW=${SET_REVIEW}`);
        if ( NEW_ITEM!=="" ) {
          addPage();
        }
    }
    if ( LOCATION.includes("manageReview.jsp") ){
        console.log(`--- manageReview.jsp NEW_ITEM=${NEW_ITEM} SET_REVIEW=${SET_REVIEW}`);
        // Looks like we're trying to set the review status
        if ( SET_REVIEW!=="" ) {
                // set the review
                setReview();
        }
    }
})();