/**************************************************************************
 * ciTweakView
 * - modify the tweak element to include some instructions
 */
/*jshint esversion: 6*/

/*var EXPAND_COLLAPSE_BUTTON_HTML = `<div class="accordion-expand-holder">
<button type="button" class="open">Expand all</button>
<button type="button" class="close">Collapse all</button>
</div>`; */


// Kludge globals
var TERM = "", TWEAK_BB;

export class ciTweakView {
    constructor(model) {

        this.model = model;
    }

    /*********************
     * view
     * - modify the tweak item to show instructions
     * Check to see if the Content Interface item contains details about the Word document
     * - NO - show a message without update button
     * - YES - add the update button
     */

    view() {
        // does ci contain a path
        // -- currently implemented as a span with id gu_WordDocument that
        //    will contain a simple path (probably only works for me)
        // -- eventually should be a link that works for all with access

        let ci = this.model.contentInterface;
        let params = this.model.params;

        let current = window.location.href;
        let courseId;
        let contentId;

        // if we're in edit mode off, then hide editing interface
        if (this.model.tweak_bb.display_view) {
            jQuery(".gutweak").parents("li").hide();
            ci.parents("div.item").hide();
            jQuery(this.model.wordDoc).hide();
        }

        // get the courseId
        let m = current.match(/^.*course_id=(_[^&]*).*$/);
        if (m) {
            courseId = m[1];
        }

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
            var html = UPDATE_HTML + WORD_DOC_NOT_PRESENT;

            // add in link to edit the content item
            var editContent = 'into the <a href="https://bblearn-blaed.griffith.edu.au/webapps/blackboard/execute/manageCourseItem?content_id=' + contentId + '&course_id=' + courseId + '&dispatch=edit">Content Interface content item</a>';

            html = html.replace("{EDIT_CONTENT_ITEM}", editContent);

            // console.log("edit content item is " + editContent);
            jQuery('#gu_update').html(html);
            return;
        }

        //jQuery(".gu_docNotPresent").hide();
        var updateHtml = UPDATE_HTML + WORD_DOC_PRESENT + INSTRUCTIONS;

        if (jQuery('#gu_jqueryStyle').length) {
            updateHtml = updateHtml + CHANGE_TEMPLATE;
        }
        jQuery('#gu_update').html(updateHtml);

        jQuery("#gu_doc").attr("href", path);

        // encode path ready for going via URLs
        path = "u!" + btoa(path).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');


        jQuery("#styleSelector").on("change", function () {
            jQuery("#gu_jqueryStyle").attr("href", this.value);
            jQuery("#gu_stylePath").text(this.value);
        });

        //---------------------------------------------------
        // Set up the click event for the submit button
        // get the courseId
        jQuery("#guUpdate").click(function (event) {
            // if href currently includes blaed then add parameter

            var link = window.location.href;

            // Determine and tell Mammoth if we're using blaed blackboard
            var blaed = '';
            if (link.match(BLAED_LINK) !== null) {
                blaed = "&blaed=1";
            }

            // Determine and tell Mammoth if we're just want a particular title section
            var title = '';
            if (params.hasOwnProperty("titleNum")) {
                title = "&titleNum=" + params.titleNum;
            }
            if (params.hasOwnProperty("title")) {
                title = "&title=" + params.title;
            }
            window.location.href = "https://djon.es/gu/mammoth.js/browser-demo/oneDriveMammoth.html?course=" + courseId + blaed + title + "&content=" + contentId + "&path=" + path;
        });
    }



}

var UPDATE_HTML = `
<h3>Important</h3>
<ol>
<li><strong>No changes to this item</strong> - do not edit or remove content from this tweak code item. The tweak code implements the Content interface. Changes may break the Content interface.</li>
<li><strong>Do not hide this item from students.</strong> - the tweak in this item will hide the item from students. They will not see it. If you use Blackboard to hide this tweak from students, it will NOT work and students won't see the accordion interface.</li>
</ol>
<p>For some help on using this feature, please peruse <a href="https://github.com/djplaner/Content-Interface-Tweak/blob/master/README.md">the README page</a></p>

 <h3>Updating and editing</h3>

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

<p>More information can be found in <a href="https://griffitheduau-my.sharepoint.com/:w:/g/personal/d_jones6_griffith_edu_au/EUbAQvhxLW1MicRKf9Hof3sBIoS2EyJP_SfkYbqZ7c3qhw?e=2S9k3Y" target="_blank">this Word document</a>, or in the links in the following table.</p>

<table style="width:100%;padding:2px">
  <tr>
    <td bgcolor="#edebf0"> Get started </td>
    <td bgcolor="#ebeef0"> Adding & editing content </td>
    <td bgcolor="#f0ebeb"> Changing how it works </td>
  </tr>
  <tr>
    <td bgcolor="#edebf0">
<ul style="padding-left:1.2em">
  <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#2">Content Interface - why?</a>
       </li>
  <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#4">How to set it up</a> </li>
  <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#5">How to update content</a> </li>
  
  
</ul>
    </td>
    <td bgcolor="#ebeef0">
          <ul>
            <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#6">text, headings, tables and quotes</a> </li>
            <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#7">web content: images, links, videos & embeddable content</a> </li>
            <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#8">study guide content: readings, activitites & notes</a> </li>
            <li> <a href="/webapps/blackboard/content/listContent.jsp?content_id=_5110116_1&course_id=_82534_1#9">Links to Blackboard activities</a> </li>
         </ul>
    </td>
    <td bgcolor="#f0ebeb">
        
    </td>
    </table>
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
