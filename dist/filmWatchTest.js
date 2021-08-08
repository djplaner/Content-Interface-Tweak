
/**
 * filmWatchTest.js
 * - fetch json file from Google spreadsheet
 * - parse json file
 * - create filmWatch object
 **/

/*fetch('https://spreadsheets.google.com/feeds/cells/1xJvMG27jFzemmiJlzPGvLjOR0k_2soOadUDGMTCv0II/1/public/values?alt=json-in-script')
.then( response => {
  return response.json()
}).then(data => console.log(data));
*/

//const SHEET_JSON='https://spreadsheets.google.com/feeds/cells/1xJvMG27jFzemmiJlzPGvLjOR0k_2soOadUDGMTCv0II/1/public/values?alt=json-in-script';
const SHEET_JSON='https://spreadsheets.google.com/feeds/list/1xJvMG27jFzemmiJlzPGvLjOR0k_2soOadUDGMTCv0II/1/public/values?alt=json';

//export default filmWatchOptions = {};

fetch( SHEET_JSON )
  .then(res => res.json())
  .then(json => {
    const data = [] /* this array will eventually be populated with the contents of the spreadsheet's rows */

    const rows = json.feed.entry

    for(const row of rows) {
      const formattedRow = {}

      for(const key in row) {
        if(key.startsWith("gsx$")) {

          /* The actual row names from your spreadsheet
           * are formatted like "gsx$title".
           * Therefore, we need to find keys in this object
           * that start with "gsx$", and then strip that
           * out to get the actual row name
           */

          formattedRow[key.replace("gsx$", "")] = row[key].$t

        }
      }

      data.push(formattedRow)
    }

    console.log(data) /* do anything you want with the reformatted data here */
    // convert data array of objects to dictionary
    filmWatchOptions = Object.assign({}, ...data.map((x) => ({[x.filmtitle]: x})));
    console.log(filmWatchOptions);
  })

