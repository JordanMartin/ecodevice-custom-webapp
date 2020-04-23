/*********************************************************************
 * Microchip TCP/IP Stack Javascript Library
 **********************************************************************
 *
 * Software License Agreement
 *
 * Copyright © 2002-2007 Microchip Technology Inc.  All rights 
 * reserved.
 *
 * Microchip licenses to you the right to use, modify, copy, and 
 * distribute: 
 * (i)  the Software when embedded on a Microchip microcontroller or 
 *      digital signal controller product (“Device”) which is 
 *      integrated into Licensee’s product; or
 * (ii) ONLY the Software driver source files ENC28J60.c and 
 *      ENC28J60.h ported to a non-Microchip device used in 
 *      conjunction with a Microchip ethernet controller for the 
 *      sole purpose of interfacing with the ethernet controller. 
 *
 * You should refer to the license agreement accompanying this 
 * Software for additional information regarding your rights and 
 * obligations.
 *
 * THE SOFTWARE AND DOCUMENTATION ARE PROVIDED “AS IS” WITHOUT 
 * WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT 
 * LIMITATION, ANY WARRANTY OF MERCHANTABILITY, FITNESS FOR A 
 * PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT SHALL 
 * MICROCHIP BE LIABLE FOR ANY INCIDENTAL, SPECIAL, INDIRECT OR 
 * CONSEQUENTIAL DAMAGES, LOST PROFITS OR LOST DATA, COST OF 
 * PROCUREMENT OF SUBSTITUTE GOODS, TECHNOLOGY OR SERVICES, ANY CLAIMS 
 * BY THIRD PARTIES (INCLUDING BUT NOT LIMITED TO ANY DEFENSE 
 * THEREOF), ANY CLAIMS FOR INDEMNITY OR CONTRIBUTION, OR OTHER 
 * SIMILAR COSTS, WHETHER ASSERTED ON THE BASIS OF CONTRACT, TORT 
 * (INCLUDING NEGLIGENCE), BREACH OF WARRANTY, OR OTHERWISE.
 *
 *
 * Author               Date        Comment
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Elliott Wood			6/25/07		Original
 * Elliott Wood			12/5/07		Updated newAJAXCommand
 ********************************************************************/

/**
 * Determines when a request is considered "timed out"
 */
var timeOutMS = 100000; //100000ms
 
/**
 * Stores a queue of AJAX events to process
 */
var ajaxList = new Array();

/**
 * Initiates a new AJAX command
 *
 * @param   the url to access
 * @param   the document ID to fill, or a function to call with response XML (optional)
 * @param	true to repeat this call indefinitely (optional)
 * @param   a URL encoded string to be submitted as POST data (optional)
 */
  function format(valeur,decimal,separateur) {
// formate un chiffre avec 'decimal' chiffres après la virgule et un separateur
	var deci=Math.round( Math.pow(10,decimal)*(Math.abs(valeur)-Math.floor(Math.abs(valeur)))) ; 
	var val=Math.floor(Math.abs(valeur));
	if ((decimal==0)||(deci==Math.pow(10,decimal))) {val=Math.floor(Math.abs(valeur)); deci=0;}
	var val_format=val+"";
	var nb=val_format.length;
	for (var i=1;i<4;i++) {
		if (val>=Math.pow(10,(3*i))) {
			val_format=val_format.substring(0,nb-(3*i))+separateur+val_format.substring(nb-(3*i));
		}
	}
	if (decimal>0) {
		var decim=""; 
		for (var j=0;j<(decimal-deci.toString().length);j++) {decim+="0";}
		deci=decim+deci.toString();
		val_format=val_format+"."+deci;
	}
	if (parseFloat(valeur)<0) {val_format="-"+val_format;}
	return val_format;
}

 function zeroPad(num, places) 
 {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
 }

function Tin(Case) {
document.getElementById(Case).style.display='block';
}
function Tout(Case) {
document.getElementById(Case).style.display='none';
}
 
 
 
function newAJAXCommand(url, container, repeat, data)
{
	// Set up our object
	var newAjax = new Object();
	var theTimer = new Date();
	newAjax.url = url;
	newAjax.container = container;
	newAjax.repeat = repeat;
	newAjax.ajaxReq = null;
	
	// Create and send the request
	if(window.XMLHttpRequest) {
        newAjax.ajaxReq = new XMLHttpRequest();
        newAjax.ajaxReq.open((data==null)?"GET":"POST", newAjax.url, true);
        newAjax.ajaxReq.send(data);
    // If we're using IE6 style (maybe 5.5 compatible too)
    } else if(window.ActiveXObject) {
        newAjax.ajaxReq = new ActiveXObject("Microsoft.XMLHTTP");
        if(newAjax.ajaxReq) {
            newAjax.ajaxReq.open((data==null)?"GET":"POST", newAjax.url, true);
            newAjax.ajaxReq.send(data);
        }
    }
    
    newAjax.lastCalled = theTimer.getTime();
    
    // Store in our array
    ajaxList.push(newAjax);
}

/**
 * Loops over all pending AJAX events to determine
 * if any action is required
 */
function pollAJAX() {
	
	var curAjax = new Object();
	var theTimer = new Date();
	var elapsed;
	
	// Read off the ajaxList objects one by one
	for(i = ajaxList.length; i > 0; i--)
	{
		curAjax = ajaxList.shift();
		if(!curAjax)
			continue;
		elapsed = theTimer.getTime() - curAjax.lastCalled;
				
		// If we suceeded
		if(curAjax.ajaxReq.readyState == 4 && curAjax.ajaxReq.status == 200) {
			// If it has a container, write the result
			if(typeof(curAjax.container) == 'function'){
				curAjax.container(curAjax.ajaxReq.responseXML.documentElement);
			} else if(typeof(curAjax.container) == 'string') {
				document.getElementById(curAjax.container).innerHTML = curAjax.ajaxReq.responseText;
			} // (otherwise do nothing for null values)
			
	    	curAjax.ajaxReq.abort();
	    	curAjax.ajaxReq = null;

			// If it's a repeatable request, then do so
			if(curAjax.repeat)
				newAJAXCommand(curAjax.url, curAjax.container, curAjax.repeat);
			continue;
		}
		
		// If we've waited over 1 second, then we timed out
		if(elapsed > timeOutMS) {
			// Invoke the user function with null input
			if(typeof(curAjax.container) == 'function'){
				curAjax.container(null);
			} else {
				// Alert the user
				alert("Command failed.\nConnection to relay board was lost.");
			}

	    	curAjax.ajaxReq.abort();
	    	curAjax.ajaxReq = null;
			
			// If it's a repeatable request, then do so
			if(curAjax.repeat)
				newAJAXCommand(curAjax.url, curAjax.container, curAjax.repeat);
			continue;
		}
		
		// Otherwise, just keep waiting
		ajaxList.push(curAjax);
	}
	
	// Call ourselves again in 100ms
	setTimeout("pollAJAX()",5);
	
}// End pollAjax
			
/**
 * Parses the xmlResponse returned by an XMLHTTPRequest object
 *
 * @param	the xmlData returned
 * @param	the field to search for
 */
function getXMLValue(xmlData, field) {
	try {
		if(xmlData.getElementsByTagName(field)[0].firstChild.nodeValue)
			return xmlData.getElementsByTagName(field)[0].firstChild.nodeValue;
		else
			return null;
	} catch(err) { return null; }
}

//kick off the AJAX Updater
setTimeout("pollAJAX()",500);

function changementDate(a) {
	try {
		var jour = a.substr(0, 1);
		var jour2 = a.substr(1, 2);
		var mois = a.substr(3, 2);
		
		if(jour == "0")
			jour = "Lundi";
		else if(jour == "1")
			jour = "Mardi";
		else if(jour == "2")
			jour = "Mercredi";
		else if(jour == "3")
			jour = "Jeudi";
		else if(jour == "4")
			jour = "Vendredi";
		else if(jour == "5")
			jour = "Samedi";
		else if(jour == "6")
			jour = "Dimanche";
			
		if(mois == "01")
			mois = "Janvier";
		else if(mois == "02")
			mois = "Février";
		else if(mois == "03")
			mois = "Mars";
		else if(mois == "04")
			mois = "Avril";
		else if(mois == "05")
			mois = "Mai";
		else if(mois == "06")
			mois = "Juin";
		else if(mois == "07")
			mois = "Juillet";	
		else if(mois == "08")
			mois = "Août";
		else if(mois == "09")
			mois = "Septembre";
		else if(mois == "10")
			mois = "Octobre";
		else if(mois == "11")
			mois = "Novembre";
		else if(mois == "12")
			mois = "Décembre";
			
		var date = jour + " " + jour2 + " " + mois;
		return date;
	} catch(err) { return null; }
}

//kick off the AJAX Updater
setTimeout("pollAJAX()",500);

