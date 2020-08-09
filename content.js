
/* content
 * - Given a Blackboard page containing a content item with  
     HTML generated from Mammoth
 * - Implement a variety of transformations
 */
/*jshint esversion: 6*/

import { calculateTerm, getTermDate, TERM_DATES } from './modules/termDates.js';
import { ciModel } from './modules/ciModel.js';
import { ciView } from './modules/ciView.js';

jQuery( document ).ready(function( $ ) { 
    contentInterface($);
});

// Default dates
//var TERM = "3191", YEAR = 2019;

//var DEFAULT_CSS="https://s3.amazonaws.com/filebucketdave/banner.js/gu_study.css";

/****************************************************************************/

function contentInterface($) {

    let model = new ciModel();
    console.log(model);

    let view = new ciView( model);
    view.setUpEdit();
    view.transformContent();
    view.finaliseInterface();

    // do nothing if we couldn't find the contentInterface item
    if (model.contentInterface.length === 0) {
        return false;
    }
}