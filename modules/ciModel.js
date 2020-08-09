/**************************************************************************
 * ciModel
 * Implement the model for the contentInterface. Create a new object containing
 * data extracted from the current web page
 * 
 * Attributes
 * - term
 * - year
 * - tweak_bb_active_url_pattern (name of normal view page URL in Bb)
 * - tweak_bb - object
 *   - display_view - boolean
 *   - page_id  **not used??**
 *   - row_element  **not used??**
 * - contentInterface - jQuery element for content
 * - wordDoc - jQuery element for the item containing URL for Word doc
 * - params - parameters taken from Content Interface title
 */
/*jshint esversion: 6*/

import { calculateTerm } from './termDates.js'

var DEFAULT_CSS="https://s3.amazonaws.com/filebucketdave/banner.js/gu_study.css";

export class ciModel {
    constructor() {

        // get the term and year
        [this.term,this.year] = calculateTerm();

        // define method for case insensitve search for elements
        $.expr[":"].contains = $.expr.createPseudo(function (arg) {
            return function (elem) {
                return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
            };
        });

        // define some Blackboard attributes 
        this.tweak_bb_active_url_pattern = "listContent.jsp";
        this.tweak_bb = {
            display_view: (location.href.indexOf(this.tweak_bb_active_url_pattern) > 0),
            page_id: "#content_listContainer",
            row_element: "li"
        };

        // Find elements for the content interface and content document
        this.contentInterface = jQuery(this.tweak_bb.page_id + " > " + 
                                  this.tweak_bb.row_element).find(
                                      ".item h3").filter(
                                          ':contains("Content Interface")').eq(0);
        // Find any Word Document link that's been added
        this.wordDoc = jQuery(this.tweak_bb.page_id + " > " + 
                             this.tweak_bb.row_element).find(
                                 ".item h3").filter(
                                     ':contains("Content Document")').eq(0); 

        // check the parameters passed in the Content Interface 
        this.params = checkParams(this.contentInterface, this.wordDoc );
    }
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

    var cssURL = DEFAULT_CSS;

    // Check parameters in the Content Interface item title
    if (contentInterface.length > 0) {
        var contentInterfaceTitle = jQuery.trim(contentInterface.text());

        var m = contentInterfaceTitle.match(/content interface\s*([^<]+)/i);

        if (m) {
            //params = m[1].match(/\S+/g);

            let params = parse_parameters(m[1]);

            if (params) {
                params.forEach(function (element) {
                    console.log("param " + element);
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
                    m = element.match(/css=([^ ]*)/ );
                    if ( m ) {
                        cssURL=m[1];
                    }
                    m = element.match(/expand=([0-9]*)/i);
                    if ( m ) {
                        paramsObj.expand = m[1];
                    }
                    m = element.match(/titleNum=([0-9]*)/i);
                    if ( m ) {
                        paramsObj.titleNum = m[1];
                    }
                    m = element.match(/title=(.*)/i);
                    if ( m ) {
                        paramsObj.title = m[1];
                    }
                });
            }
        }
    }

    addCSS( cssURL);

    // Check for a Word doc link
    //var wordDoc = jQuery(tweak_bb.page_id +" > "+tweak_bb.row_element).find(".item h3").filter(':contains("Content Document")').eq(0);

    var wordDocLink = jQuery(wordDoc).find("a:contains('Content Document')").attr('href');

    if (typeof wordDocLink !== 'undefined') {
        paramsObj.wordDoc = wordDocLink;
    }

    //console.log(paramsObj);
    return paramsObj;
}

//---------------------------------------------------------------------
// Given a string of parameters use some Stack Overflow provided
// regular expression magic to split it up into its component parts

function parse_parameters(cmdline) {
    //    var re_next_arg = /^\s*((?:(?:"(?:\\.|[^"])*")|(?:'[^']*')|\\.|\S)+)\s*(.*)$/;
    let re_next_arg = /^\s*((?:(?:"(?:\\.|[^"])*")|(?:'[^']*')|\\.|\S)+)\s*(.*)$/;
    let next_arg = ['', '', cmdline];
    let args = [];
    while (next_arg = re_next_arg.exec(next_arg[2])) {
        let quoted_arg = next_arg[1];
        let quoted_part;
        let unquoted_arg = "";
        while (quoted_arg.length > 0) {
            if (/^"/.test(quoted_arg)) {
                quoted_part = /^"((?:\\.|[^"])*)"(.*)$/.exec(quoted_arg);
                unquoted_arg += quoted_part[1].replace(/\\(.)/g, "$1");
                quoted_arg = quoted_part[2];
            } else if (/^'/.test(quoted_arg)) {
                quoted_part = /^'([^']*)'(.*)$/.exec(quoted_arg);
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


/*************************************************************
 * addCSS( url )
 * - given the URL for a CSS file add it to the document
 * https://makitweb.com/dynamically-include-script-and-css-file-with-javascript/
 * (and other places)
 */

function addCSS( urlString ) {
    var head = document.getElementsByTagName('head')[0];

    var style = document.createElement('link');
    style.href = urlString;
    style.type = 'text/css';
    style.rel = 'stylesheet';
    head.append(style);
 }