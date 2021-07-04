/*
 * onedrive.js
 * - Code to grab content of a Word doc from OneDrive
 * - Used in conjunction with Mammoth
 */

// Config variables
// TODO - update the clientId to proper final id

function loggerCallback(logLevel, message, containsPii) {
  /*console.log(" HELLO LOGGER");
       console.log(message);*/
}

var msalConfig = {
  auth: {
    //clientId: "cd3eae92-4f64-457e-9bfc-a2a441920144",
    clientId: "4e260176-5f5d-4a11-b419-8920aff4b13f",
    authority: "https://login.microsoftonline.com/common",
  },
  cache: {
    cacheLocation: "localStorage",
    //cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
  system: {
    /*logger: new Msal.Logger(
		loggerCallback, {
		level: Msal.LogLevel.Verbose,
		piiLoggingEnabled: false,
		correlationId: '1234' }
		)*/
  },
};

// Version that works with a path
//var graphMeEndpoint = "https://graph.microsoft.com/v1.0/me/drive/root:";
// Works with a shared URL (id)
// BUT - also need to append /driveItem to the end after the share URL is added
var graphMeEndpoint = "https://graph.microsoft.com/v1.0/shares/";

// this can be used for login or token request, however in more complex situations
// this can have diverging options
var requestObj = {
  scopes: ["user.read", "Files.Read.All"],
};
//console.log("-------------------------------------");
//console.log("About to create userAgentApplication");
var myMSALObj = new Msal.UserAgentApplication(msalConfig);
// Register Callbacks for redirect flow
myMSALObj.handleRedirectCallback(authRedirectCallBack);

//console.log(myMSALObj);

function signIn(myMSALObj, path) {
  myMSALObj
    .loginPopup(requestObj)
    .then(function (loginResponse) {
      //Login Success
      //console.log("ADD EVENT authenticated");
      acquireTokenPopupAndCallMSGraph(path);
    })
    .catch(function (error) {
      console.log(error);
    });
}

//------------------------------------------------------------------------------------
// Main driver function to load a file from onedrive given the provided path

function loadOneDriveFile(path) {
  // update the path to add the API and etc
  // - for shared URLs
  path = graphMeEndpoint + path + "/driveItem";

  // Browser check variables
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  var msie11 = ua.indexOf("Trident/");
  var msedge = ua.indexOf("Edge/");
  var isIE = msie > 0 || msie11 > 0;
  var isEdge = msedge > 0;

  //If you support IE, our recommendation is that you sign-in using Redirect APIs
  //If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check
  // can change this to default an experience outside browser use
  var loginType = isIE ? "REDIRECT" : "POPUP";

  // check to see if there's a cached account
  if (myMSALObj.getAccount()) {
    addEvent("Got cached token");
    acquireTokenPopupAndCallMSGraph(path);
  } else {
    addEvent("Authenticating");
    myMSALObj
      .loginPopup(requestObj)
      .then(function (loginResponse) {
        //Login Success
        //    showWelcomeMessage();

        //console.log("ADD EVENT authenticated");
        acquireTokenPopupAndCallMSGraph(path);
      })
      .catch(function (error) {
        console.log(error);
        return false;
      });
  }

  return false;

  //console.log(myMSALObj);
  if (loginType === "POPUP") {
    if (myMSALObj.getAccount()) {
      // avoid duplicate code execution on page load in case of iframe and popup window.
      //		console.log("acount got popup");
      //showWelcomeMessage();
      acquireTokenPopupAndCallMSGraph(path);
    } else {
      console.log("Couldn't myMSALObj.getAccount");
    }
  } else if (loginType === "REDIRECT") {
    /*document.getElementById("btnCopy").onclick = function () {			
			    myMSALObj.loginRedirect(requestObj);
		    };*/
    if (myMSALObj.getAccount() && !myMSALObj.isCallback(window.location.hash)) {
      // avoid duplicate code execution on page load in case of iframe and popup window.
      //	console.log("about to show welcome message");
      acquireTokenRedirectAndCallMSGraph(path);
    } else {
      console.log("Redirect didn't work");
    }
  } else {
    console.error("Please set a valid login type");
  }
}

// Make sure we have the necessary Javascript code from Microsoft
function dynamicallyLoadScript() {
  var script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.4/bluebird.min.js";
  document.head.appendChild(script);
  //script.src = "https://secure.aadcdn.microsoftonline-p.com/lib/1.0.0/js/msal.js";
  script.src = "https://alcdn.msauth.net/lib/1.1.3/js/msal.js";
  document.head.appendChild(script);
}

// CORS request

var createCORSRequest = function (method, url, accessToken) {
  var xhr = new XMLHttpRequest();

  if ("withCredentials" in xhr) {
    // Most browsers.
    xhr.open(method, url, true);
    xhr.responseType = "arraybuffer";
    //xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  } else if (typeof XDomainRequest != "undefined") {
    // IE8 & IE9
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
};

function acquireTokenPopupAndCallMSGraph(path) {
  //console.log("POPUP");
  //Always start with acquireTokenSilent to obtain a token in the signed in user from cache
  myMSALObj
    .acquireTokenSilent(requestObj)
    .then(function (tokenResponse) {
      //console.log("ADD EVENT - request access to shared Word doc");
      addEvent("Obtained token");
      callMSGraph(path, tokenResponse.accessToken, graphAPICallback);
    })
    .catch(function (error) {
      //console.log("ADD EVENT - error requesting token - " + error);
      addEvent("Error accessing Word document " + error, true);
      // Call acquireTokenPopup(popup window)
      if (requiresInteraction(error.errorCode)) {
        myMSALObj
          .acquireTokenPopup(requestObj)
          .then(function (tokenResponse) {
            addEvent("Obtained access to token");
            callMSGraph(path, tokenResponse.accessToken, graphAPICallback);
            //graphMeEndpoint.concat(path), tokenResponse.accessToken, graphAPICallback);
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    });
}

function graphAPICallback(data) {
  //console.log("Hello call back");
  document.getElementById("json").innerHTML = JSON.stringify(data, null, 2);
  //console.log( JSON.stringify(data));
}

function showWelcomeMessage() {
  var divWelcome = document.getElementById("WelcomeMessage");
  divWelcome.innerHTML =
    "Welcome " + myMSALObj.getAccount().userName + "to Microsoft Graph API";
  var loginbutton = document.getElementById("SignIn");
  loginbutton.innerHTML = "Sign Out";
  loginbutton.setAttribute("onclick", "signOut();");
}

//This function can be removed if you do not need to support IE
function acquireTokenRedirectAndCallMSGraph(path) {
  //Always start with acquireTokenSilent to obtain a token in the signed in user from cache
  myMSALObj
    .acquireTokenSilent(requestObj)
    .then(function (tokenResponse) {
      addEvent("Obtained access to token");
      callMSGraph(path, tokenResponse.accessToken, graphAPICallback);
    })
    .catch(function (error) {
      addEvent("Error accessing Word document " + error, true);
      // Upon acquireTokenSilent failure (due to consent or interaction or login required ONLY)
      // Call acquireTokenRedirect
      if (requiresInteraction(error.errorCode)) {
        myMSALObj.acquireTokenRedirect(requestObj);
      }
    });
}

function authRedirectCallBack(error, response) {
  if (error) {
    console.log(error);
  } else {
    if (response.tokenType === "access_token") {
      callMSGraph(
        graphConfig.graphEndpoint,
        response.accessToken,
        graphAPICallback
      );
    } else {
      console.log("token type is:" + response.tokenType);
    }
  }
}

function requiresInteraction(errorCode) {
  if (!errorCode || !errorCode.length) {
    return false;
  }
  return (
    errorCode === "consent_required" ||
    errorCode === "interaction_required" ||
    errorCode === "login_required"
  );
}

//*******************************************************************************
// Call the graph

function callMSGraph(theUrl, accessToken, callback) {
  // Get the microsoft.graph.downloadUrl object

  addEvent("Requesting Word doc info");
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.responseType = "json";
  xmlHttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      // Success means that we information about the shared file
      // Including the downloadUrl
      if (this.status == 200) {
        let size = this.response["size"] / 1024;
        let n = size.toFixed(0);
        addEvent(`Obtained Word doc info`);

        if (size > 1024) {
          addEvent(`Word doc size ${n}Kb > 1024Kb`, false, true);
          addEvent("Large size can slow copy/paste", false, true);
          addEvent("May not work with Chrome", false, true);
          addEvent("Firefox works better", false, true);
        }
        //
        //callback(JSON.parse(this.responseText));
        r = this.response; //JSON.parse(this.responseText);
        downloadUrl = r["@microsoft.graph.downloadUrl"];

        getTheFileCORS(downloadUrl, accessToken, graphAPICallback);
      } else {
        //console.log("readyState " + this.readyState);
        addEvent("Error obtaining Word doc info", true);
      }
    }
  };
  // request the information about the file
  //console.log("going to get " + theUrl + "access token " + accessToken);
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.setRequestHeader("Authorization", "Bearer " + accessToken);
  xmlHttp.send();
}

// now get the content of the file

function getTheFileCORS(theUrl, accessToken, callback) {
  addEvent("Requesting contents of Word doc");

  var xhr = createCORSRequest("GET", theUrl, accessToken);

  xhr.onload = function () {
    var contentType = this.getResponseHeader("Content-Type");

    //callback( contentType );
    addEvent("Obtained Word doc contents");

    // pass the array buffer to mammoth
    doMammoth(xhr.response);
  };

  xhr.onerror = function () {
    addEvent("Error obtaing Word doc contents");
  };

  // xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  xhr.send();
}

//------------------------------------------------------------
// doMammoth

function doMammoth(wordContent) {
  var options = {
    styleMap: [
      "p[style-name='Section Title'] => h1:fresh",
      "p[style-name='Quote'] => blockquote:fresh",
      "p[style-name='Quotations'] => blockquote:fresh",
      "p[style-name='Quotation'] => blockquote:fresh",
      "p[style-name='Body Text'] => p:fresh",
      "p[style-name='Text'] => p:fresh",
      "p[style-name='Default'] => p:fresh",
      "p[style-name='Normal (Web)'] => p:fresh",
      "p[style-name='Normal'] => p:fresh",
      "p[style-name='Text body'] => p:fresh",
      "p[style-name='Textbody1'] => p:fresh",
      "p[style-name='Picture'] => div.ci_container > div.picture",
      "p[style-name='Picture Right'] => div.pictureRight",
      "p[style-name='PictureRight'] => div.pictureRight",
      "r[style-name='University Date'] => span.universityDate",
      "p[style-name='Video'] => div.video",
      "p[style-name='Aside'] => aside",
      "p[style-name='Film Watching Options'] => div.filmWatchingOptions",
      "r[style-name='Checkbox Char'] => span.checkbox",
      "p[style-name='Checkbox'] => span.checkbox",
      "r[style-name='Blue'] => span.blue",
      "r[style-name='Red'] => span.red",
      "p[style-name='Example'] => div.example > p:fresh",
      "p[style-name='Example Centered'] => div.exampleCentered > p:fresh",
      "p[style-name='Flashback']:ordered-list(1) => div.flashback > ol > li:fresh",
      "p[style-name='Flashback']:unordered-list(1) => div.flashback > ul > li:fresh",
      "p[style-name='Flashback'] => div.flashback > p:fresh",

      "p[style-name='Weekly Workout']:ordered-list(1) => div.weeklyWorkout > ol > li:fresh",
      "p[style-name='Weekly Workout']:unordered-list(1) => div.weeklyWorkout > ul > li:fresh",
      "p[style-name='Weekly Workout'] => div.weeklyWorkout > p:fresh",

      "p[style-name='Poem'] => div.poem > p:fresh",
      "r[style-name='Poem Right'] => div.poemRight > p:fresh",

      "p[style-name='Canary Exercise']:ordered-list(1) => div.canaryExercise > div.instructions > ol > li:fresh",
      "p[style-name='Canary Exercise']:unordered-list(1) => div.canaryExercise > div.instructions > ul > li:fresh",
      "p[style-name='Canary Exercise'] => div.canaryExercise > div.instructions > p:fresh",
      "p[style-name='Coming Soon'] => div.comingSoon > div.instructions > p:fresh",
      "p[style-name='ActivityTitle'] => div.activity > h2:fresh",
      "p[style-name='Activity Title'] => div.activity > h2:fresh",
      "p[style-name='ActivityText'] => div.activity > div.instructions > p:fresh",
      "p[style-name='Activity Text'] => div.activity > div.instructions > p:fresh",
      //"r[style-name='Activity'] => div.activity > div.instructions > p:fresh",
      "p[style-name='Activity']:ordered-list(1) => div.activity > div.instructions > ol > li:fresh",
      "p[style-name='Activity']:unordered-list(1) => div.activity > div.instructions > ul > li:fresh",
      "p[style-name='Activity'] => div.activity > div.instructions > p:fresh",
      /*"p[style-name='Activity'] => span.activity",*/
      "p[style-name='Bibliography'] => div.apa > p:fresh",
      "p[style-name='Reading']:ordered-list(1) => div.reading > div.instructions > ol > li:fresh",
      "p[style-name='Reading']:unordered-list(1) => div.reading > div.instructions > ul > li:fresh",
      "p[style-name='Reading'] => div.reading > div.instructions > p:fresh",
      "p[style-name='Title'] => div.invisible",
      "p[style-name='Card'] => div.gu_card",
      "r[style-name='Emphasis'] => em:fresh",
      "p[style-name='Timeout'] => span.timeout",
      "p[style-name='Embed'] => span.embed",
      "p[style-name='Note']:ordered-list(1) => div.ael-note > div.instructions > ol > li:fresh",
      "p[style-name='Note']:unordered-list(1) => div.ael-note > div.instructions > ul > li:fresh",
      "p[style-name='Note'] => div.ael-note > div.instructions > p:fresh",
      /* Adding cards */
      "p[style-name='Blackboard Card'] => div.bbCard:fresh",
      /* Blackboard item conversion */
      "p[style-name='Blackboard Item Heading'] => h1.blackboard",
      "p[style-name='Blackboard Item Heading 2'] => h2.blackboard",
      "r[style-name='Blackboard Item Link'] => span.blackboardLink",
      "p[style-name='Blackboard Item Link'] => span.blackboardlink",
      "r[style-name='Blackboard Item Link Char'] => span.blackboardLink",
      "r[style-name='Blackboard Content Link'] => span.blackboardContentLink",
      "r[style-name='Blackboard Menu Link'] => span.blackboardMenuLink",
      /* tables?? */
      "r[style-name='small'] => span.smallText",
      "r[style-name='StrongCentered'] => span.strongCentered",
      "r[style-name='Centered'] => span.centered",
      // Underline
      "u => u",

      // GO style
      "p[style-name='GO Start Here'] => div.goStartHere",
      "p[style-name='GOStartHere'] => div.goStartHere",
      "p[style-name='GO Reflect'] => div.goStartHere",
      "p[style-name='GO Watch'] => div.goStartHere",
      "p[style-name='GO Download'] => div.goStartHere",
      // TODO numbered list, need to detect the original image or order???
      "p[style-name='GO Numbered List'] => div.goStartHere",
      "p[style-name='GO Activity'] => div.goStartHere",
    ],
  };

  addEvent("Starting conversion to HTML");
  mammoth
    .convertToHtml({ arrayBuffer: wordContent }, options)
    .then(displayResult)
    .done();
}

//---------------
// display the result

function displayResult(result) {
  addEvent("HTML conversion complete");

  // add HTML for the content interface
  result.value = '<div id="GU_ContentInterface">' + result.value + "</div>";
  document.getElementById("output").innerHTML =
    "<div id='html'>" + result.value + "</div>";

  if (result.messages.length > 0) {
    addEvent(result.messages.length + " messages from conversion", false, true);
  } else {
    jQuery("#gu_messages").hide();
    return;
  }

  // create and display the messages
  var messageHtml = result.messages
    .map(function (message) {
      return (
        '<li class="' +
        message.type +
        '">' +
        escapeHtml(message.message) +
        "</li>"
      );
    })
    .join("");

  messageHtml = "<ul>" + messageHtml + "</ul>";

  document.getElementById("json").innerHTML = messageHtml;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(
    function () {
      console.log("CLIPBOARD UPDATED");
    },
    function () {
      console.log("CLIPBOARD FAIL");
    }
  );
}

//***************************************
// If title and titleNum are defined then
// 1. Select the section confined by that title
// 2. Replace the entire DOM with just that section

function updateDomForTitle(title, titleNum) {
  var element;

  if (title === null && titleNum === null) {
    return;
  }

  // will need to add GU_Interface div around the outside
  // of the title/titleNum elements
  if (title !== null) {
    // TODO
    //console.log("Get title " + title);
  } else if (titleNum !== null) {
    var titles = jQuery("#GU_ContentInterface").find("div.invisible");

    addEvent("Focusing on section with title number " + titleNum);

    // Get the start chapter (if we can TODO handle if we can't)
    var start = jQuery("#GU_ContentInterface")
      .find("div.invisible")
      .eq(titleNum - 1);

    if (start.length === 0) {
      addEvent("Unable to find title number " + titleNum, true);
      addEvent("Found " + titles.length + " titles ", true);
      addEvent("Showing the entire document");
      return;
    }

    // Get the next start chapter && all the components in between
    var end;

    // Check if titleNum is at the end

    if (parseInt(titleNum) === titles.length) {
      // last title, so go until the last item in GU_ContentInterface
      end = jQuery("#GU_ContentInterface").last();
    } else {
      // not the last title, so go until the next title
      end = jQuery("#GU_ContentInterface").find("div.invisible").eq(titleNum);
    }

    if (end.length === 0) {
      addEvent("Unable to find title finish", true);

      addEvent("Found " + titles.length + " titles ", true);
      addEvent("Showing the entire document");
      return;
    }

    element = jQuery(start).nextUntil(end);

    // Update the GU_ContentInterface
    jQuery("#GU_ContentInterface").html("");
    jQuery("#GU_ContentInterface").append(element);

    addEvent("Showing content from title number " + titleNum);
  }
}
//

function copyToClipboard(elem) {
  //console.log("copy to clipboard starting for " + elem);

  //var copyText = document.getElementById("htmlContent");
  //console.log(copyText);
  //console.log("finished");
  //copyText.select();
  //document.execCommand("copy");

  /*console.log("starting copy to clipboard");
	console.log(elem);*/
  var targetId = "_hiddenCopyText_";
  var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
  var origSelectionStart, origSelectionEnd;
  if (isInput) {
    target = elem;
    origSelectionStart = elem.selectionStart;
    origSelectionEnd = elem.selectionEnd;
  } else {
    target = document.getElementById(targetId);
    if (!target) {
      var target = document.createElement("textarea");
      target.style.position = "absolute";
      target.style.left = "-9999px";
      target.style.top = "0";
      target.id = targetId;
      document.body.appendChild(target);
    }
    target.textContent = elem.innerHTML;
  }
  var currentFocus = document.activeElement;
  target.focus();
  target.setSelectionRange(0, target.value.length);
  var succeed;
  try {
    succeed = document.execCommand("copy");
  } catch (e) {
    succeed = false;
  }
  if (currentFocus && typeof currentFocus.focus === "function") {
    currentFocus.focus();
  }

  if (isInput) {
    elem.setSelectionRange(origSelectionStart, origSelectionEnd);
  } else {
    target.textContent = "";
  }
  return succeed;
}

/**
 * Sign out the user
 */
function signOut() {
  myMSALObj.logout();
}
