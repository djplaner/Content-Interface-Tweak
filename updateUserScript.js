// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automate updating Blackboard item using the Content Interface
// @author       David Jones
// @match        https://bblearn-blaed.griffith.edu.au/webapps/blackboard/execute/manageCourseItem
// @match        https://bblearn.griffith.edu.au/webapps/blackboard/execute/manageCourseItem
// @match        https://*.griffith.edu.au/webapps/blackboard/execute/manageCourseItem*
// @match        https://djon.es/gu/mammoth.js/browser-demo/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

'use strict';

var tmp=0;
var url_string = window.location.href;
var url = new URL(url_string);


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
if (el) {resolve(el);}
new MutationObserver((mutationRecords, observer) => {
  // Query for elements matching the specified selector
  Array.from(document.querySelectorAll(selector)).forEach((element) => {
    resolve(element);
    //Once we have resolved we don't need the observer anymore.
    observer.disconnect();
  });
})
  .observe(document.documentElement, {
    childList: true,
    subtree: true
  });
});
}

function isCiUpdate() {        
    let c = url.searchParams.get("CI_update");
    console.log(`location is ${url_string} and CI_update is ${c}`);
    return c === "true";
}

/*function changeContent( change, append=false ) {
var tinymce = document.querySelector('#tinymce');
console.log(tinymce);
console.log(`tinymce contains **${tinymce.innerHTML}`);
//tinymce.innerHTML = tinymce.innerHTML.concate("<p>From tampermonkey</p>");

if ( ! append ) {
    tinymce.innerHTML= change;
} else {
    tinymce.innerHTML = tinymce.innerHTML.concat( change );
}
console.log(`After change tinymce contains **${tinymce.innerHTML}`);

}

function updateContent() {
console.log("Hello, world!!! - Blackboard is editing");
changeContent("<p>Made one (abcd) change</p>");
changeContent("<p>And second change</p>", true );
}

function tinymceExists(tiny) {
console.log('------------- weeeee' );
console.log("TinyMCE now exists" );
console.log(tiny);
}

function submitPage() {
// Submit button details: id=bottom_Submit class="submit button-1"
console.log('------------------ submitting content');

//let submitButton = document.getElementById("bottom_Submit");
let submitButton = document.querySelector("#bottom_Submit");
console.log(document);
console.log(submitButton);
//submitButton.click();
console.log('------------------ submitting content after clicking');

}*/

console.log("111111");
console.log(`Url string is ${url_string}`);

if ( url_string.includes("djon.es/gu/mammoth.js/browser-demo") ) {

elementReady('#html').then( (element) => {
    const html = document.getElementById('html');
    const courseId = url.searchParams.get("course");
    const contentId = url.searchParams.get('content');

    console.log(`html is ${html.innerHTML}`);
    //window.localStorage.setItem(`ci-update-${courseId}-${contentId}`, html.innerHTML );
    GM_setValue(`ci-update`, html.innerHTML );

    console.log(`storing html in ci-update-${courseId}-${contentId}` );
    const autoClick = document.getElementById('autoclick');
    let newUrl = autoClick.getAttribute('href');
    console.log(`new url is ${newUrl}&CI_update=true`);

    location.replace(`${newUrl}&CI_update=true`);

});
} else if ( isCiUpdate() ) {

/*let submit = document.getElementById("#bottom_Submit");
console.log(`Before with submit ${submit}`);*/

/*elementReady('#bottom_Submit').then((someWidget)=>{
    console.log("bottom submit is there??" );
    console.log(someWidget);
});*/

 elementReady('.tox-tinymce').then((someWidget)=>{
     const courseId = url.searchParams.get("course_id");
     const contentId = url.searchParams.get("content_id");
     //const html = window.localStorage.getItem(`ci-update-${courseId}-${contentId}`);
     const html = GM_getValue(`ci-update`);
    console.log(`getting html from ci-update-${courseId}-${contentId}` );
     console.log(`html is ${html}`);

     let editor = tinymce.get("htmlData_text");
     editor.setContent(html);
     let dirty = editor.isDirty();
     console.log(`Ditry is `);
     console.log(dirty);
     editor.save();

     let submitButton = document.getElementById('bottom_Submit');
     //submitButton.scrollIntoView(true);
     setTimeout( () => {
	 console.log("Going to click submit");
	 submitButton.click();
     }, 2000);
});
}

//waitForKeyElements( "#tinymce", (element) => {
/*waitForKeyElements( "#htmlData_text_ifr", (element) => {
    console.log("iframe waiting for??");
    console.log(element);

    // Maybe don't even need this, wait for keys appears to be working
    // could just go below??
    let tiny = document.getElementById("#tinymce");
    console.log("Tinmyce");
    console.log(tiny);

    tinymce.innerHTML = "<p>I made this..and then some more-</p>";
*/
    /*let p = $("#bottom_Submit");
    console.log(p);
    $(p).trigger("click");
    console.log(`Inside with submit ${submit}`);

    let b = document.getElementById("#breadcrumbs");
    console.log('---- breadcrumbs');
    console.log(b);*/

    //let form = d.getElementById("#the_form");
    /*console.log(` is ${form}`);
    console.log(document);
    console.log(d);*/
    //data.scrollIntoView();

      /*  let submitButton = document.getElementById("#bottom_Submit");
	console.log(submitButton);
	submitButton.click();*/
     //submitPage();
/* });
}*/


/*waitForKeyElements( "#bottom_Submit", (element) => {
	    console.log("now bottom submit fucker");
	    console.log(element);
	    element.click();
	});*/

//const $ = (s, x = document ) => x.querySelector(s);
/*let submitButton = document.querySelector("#bottom_Submit");
console.log("submit");
console.log(submitButton);

let title = document.querySelector("#user_title");
console.log(title);
title.value="content interface HELLO WORLDS";*/

//   submitButton.click();
// does the URL contain

