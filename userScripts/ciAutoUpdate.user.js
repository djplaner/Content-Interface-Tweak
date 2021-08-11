// ==UserScript==
// @name         ciAutoUpdate
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Automate updating Blackboard content from a Word document using the Content Interface https://djplaner.github.io/Content-Interface-Tweak/
// @author       David Jones
// @match        https://*.griffith.edu.au/webapps/blackboard/execute/manageCourseItem*
// @match        https://djon.es/gu/mammoth.js/browser-demo/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

"use strict";

var url_string = window.location.href;
var url = new URL(url_string);

/*  @match        https://bblearn-blaed.griffith.edu.au/webapps/blackboard/execute/manageCourseItem
   @match        https://bblearn.griffith.edu.au/webapps/blackboard/execute/manageCourseItem
*/


/**
 * Waits for an element satisfying selector to exist, then resolves promise with the element.
 * Useful for resolving race conditions.
 *
 * @param selector
 * @returns {Promise}
 */
function elementReady(selector) {
  return new Promise((resolve, reject) => {
    let el = document.querySelector(selector);
    if (el) {
      resolve(el);
    }
    new MutationObserver((mutationRecords, observer) => {
      // Query for elements matching the specified selector
      Array.from(document.querySelectorAll(selector)).forEach((element) => {
        resolve(element);
        //Once we have resolved we don't need the observer anymore.
        observer.disconnect();
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function isCiUpdate() {
  let c = url.searchParams.get("CI_update");
  return c === "true";
}

if (url_string.includes("djon.es/gu/mammoth.js/browser-demo")) {
  // Converting Word doc to HTML
  // Wait until the html is converted
  elementReady("#html").then((element) => {
    // grab the html and other parameters
    const html = document.getElementById("html");
    if (html === null) {
      alert("Unable to find the converted html");
      return false;
    }
    const courseId = url.searchParams.get("course");
    const contentId = url.searchParams.get("content");

    // Save the HTML in GM
    GM_setValue(`ci-update-${courseId}-${contentId}`, html.innerHTML);

    // Update the blackboard edit URL to indicate we're automating this
    const autoClick = document.getElementById("autoclick");
    if (autoClick !== null) {
      let newUrl = autoClick.getAttribute("href");
      location.replace(`${newUrl}&CI_update=true`);
    } else {
      alert("Unable to find link back to Blackboard");
    }
  });
} else if (isCiUpdate()) {
  // In Blackboard want to update the page with the new html

  // Wait until tinymce is there
  elementReady(".tox-tinymce").then((someWidget) => {
    // get parameters for course/content
    const courseId = url.searchParams.get("course_id");
    const contentId = url.searchParams.get("content_id");
    //const html = window.localStorage.getItem(`ci-update-${courseId}-${contentId}`);
    // grab the html
    const html = GM_getValue(`ci-update-${courseId}-${contentId}`);

    // update the content in tinyMCE and save it
    let editor = tinymce.get("htmlData_text");
    editor.setContent(html);
    editor.save();

    // wait a bit before clicking submit
    // Seems to be required for some reason
    let submitButton = document.getElementById("bottom_Submit");

    if (submitButton !== null) {
      setTimeout(() => {
        console.log("Going to click submit");
        submitButton.click();
      }, 500);
    } else {
      alert("Unable to find submit button to save changes");
    }
  });
}
