
/* content
 * - Given a Blackboard page containing a content item with  
     HTML generated from Mammoth
 * - Implement a variety of transformations
 */
/*jshint esversion: 6*/

import { calculateTerm, getTermDate, TERM_DATES } from './modules/termDates.js';
import { ciModel } from './modules/ciModel.js';
//import { ciView } from './modules/ciView.js';
import { ciContentView } from './modules/views/ciContentView.js';
import { ciTweakView } from './modules/views/ciTweakView.js';
import { ciInterfaceView } from './modules/views/ciInterfaceView.js';

$.noConflict();

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

    let tweakView = new ciTweakView(model);
    tweakView.view();

    // do nothing if we couldn't find the contentInterface item
    if (model.contentInterface.length === 0) {
        return false;
    }

    let contentView = new ciContentView(model);
    contentView.view();
    let interfaceView = new ciInterfaceView(model);
    interfaceView.view();

}