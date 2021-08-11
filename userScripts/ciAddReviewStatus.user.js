// ==UserScript==
// @name         ciAddReviewStatus
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Detect a Blackboard page with Content Interface and reviewStatus items missing. Offer to add them.
// @author       David Jones
// @match        https://*.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?*
// @icon         https://www.google.com/s2/favicons?domain=griffith.edu.au
// @grant        none
// ==/UserScript==

/**
 * add an update button to the page
 */

 function addUpdateButton(){
	// create the button
	let updateButton = document.createElement('button');
	updateButton.id = "ciAddReviewStatus"
	updateButton.innerHTML = "Add Review Status Items";
	updateButton.style = "padding:0.3em 1.2em;margin:0 0.3em 0.3em 0;border-radius:2em;border:2px solid;box-sizing: border-box;text-decoration:none;text-align:center";
	document.querySelector("#GU_ContentInterface>.accordion-expand-holder").appendChild(updateButton);
	document.getElementById("ciAddReviewStatus").addEventListener(
	    "click", addReviewStatusItems, false
	    );
    }
    
    function addReviewStatusItems(zEvent){
	console.log("----- updateButton pressed");
    }
    
    /**
     * Look for div#GU_ContentInterface and
     * for any h1/h2 within that have (not matching content item found) in the innerText
     */
    
    function detectMissingReviewStatus(){
	console.log(`Trying to detect ci and missing review status`);
	const ci = document.querySelector('#GU_ContentInterface');
    
	if ( ci!==null ){
	    //const headings = document.querySelectorAll('#GU_ContentInterface>.accordion_top>h1');
	    const headings = document.evaluate('//div[@id="GU_ContentInterface"]/div/h1[contains(text(),"(no matching content item found)")]',
					       ci, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
					 //XPathResult.ANY_TYPE, null );
	    if ( headings.snapshotLength>0 ){
		addUpdateButton();
	    }
	}
    }
    
    (function() {
	'use strict';
    
	detectMissingReviewStatus();
    
    })();