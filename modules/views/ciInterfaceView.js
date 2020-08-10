/**************************************************************************
 * ciInterfaceView
 * - finaliseInterface
 *   i.e. add the accordions 
 */
/*jshint esversion: 6*/

var EXPAND_COLLAPSE_BUTTON_HTML = `<div class="accordion-expand-holder">
<button type="button" class="open">Expand all</button>
<button type="button" class="close">Collapse all</button>
</div>`;


// Kludge globals
var TERM = "", TWEAK_BB;

export class ciInterfaceView {
    constructor(model) {

        this.model = model;
    }

    /*******************************************
     * finaliseInterface
     * - set up the navigation interface between pages
     * - jQuery accordion here
     */

    view() {

        // Add a <div> </div> around all the content following H1s
        jQuery('#GU_ContentInterface h1').each(function () {
            jQuery(this).nextUntil('h1').addBack().wrapAll('<div class="accordion_top"></div>');
            jQuery(this).nextUntil('h1').wrapAll('<div></div>');
        });
        // Add divs around the h2 headings, until h2 or h1
        jQuery('#GU_ContentInterface h2').each(function () {
            // console.log( "Heading text " + jQuery(this).html());
            jQuery(this).nextUntil('h1,h2').addBack().wrapAll('<div class="accordion"></div>');
            jQuery(this).nextUntil('h1,h2').wrapAll('<div></div>');
        });

        // unsure how this variable used
        let accordionDisabled = false;


        // add and handle the accordion
        jQuery(".accordion,.accordion_top").accordion({
            collapsible: true,
            active: 1,
            disabled: accordionDisabled,
            navigation: true,
            //autoHeight:true
            heightStyle: 'content',
            activate: function (event, ui) {
                if (!jQuery.isEmptyObject(ui.newHeader.offset())) {
                    jQuery('html:not(:animated), body:not(:animated)').animate(
                        { scrollTop: ui.newHeader.offset().top }, 'slow');
                    // send resize to ensure that h5p iframe appears correct
                    // size
                    window.dispatchEvent(new Event('resize'));
                }
            }
        });
        // TODO move this to a string and make it look prettier
        jQuery("#GU_ContentInterface").prepend(EXPAND_COLLAPSE_BUTTON_HTML);

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

        let start = window.location.hash.substring(1);
        let end;
        let numAccordions = jQuery('.accordion_top').length;
        start = parseInt(start, 10) - 1;
        // if there wasn't a number to open, just open the first one
        if ((!Number.isInteger(start)) || (start > numAccordions - 1)) {
            start = 0;
            end = 1;
            // This is where the local storage thing could happen,
            // just set start/end to the appropriate value
        } else {
            end = start + 1;
        }
        // want all expanded, figure out num accordions and set end appropriately
        if (this.model.params.expandAll === true) {
            start = 0;
            end = jQuery('#GU_ContentInterface h1').length;
        } else if (this.model.params.collapseAll === true) {
            start = 0;
            end = 0;
        } else if (this.model.params.expand > 0) {
            if (params.expand < jQuery('#GU_ContentInterface h1').length) {
                start = params.expand - 1;
                end = start + 1;
            } else {
                console.log("ERROR - expand value (" + this.model.params.expand + 
                                  ") larger than number of heading 1s ");
            }
        }
        if (this.model.params.scrollTo === true) {
            jQuery('.accordion_top').slice(start, end).accordion("option", "active", 0);
        }


    }
}