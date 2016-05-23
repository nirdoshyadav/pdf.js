/* globals parseQueryString, PDFJS*/
'use strict';

//Nirdosh: Defining a finder, it parses 
//query to get the JSON data for highlighting
var PDFURLFinder = (function PDFFindBarClosure() {
    function PDFURLFinder(page) {
        try {
            var paramname = 'search';

            //search parameter contains search terms- 
            //multiple space (%20) separated words or phrases
            //search term syntax: a b c single words,
            //a=b c=d e=f=g phrases

            //check local window for search terms
            //make sure to check for pound symbol
            var loc = document.location.href.replace('#', '&');
            loc = loc.replace(/\+/ig, '%20');
            // console.log(loc);
            var params = parseQueryString(loc);
            //also check parent window for any search terms
            if (params[paramname] === undefined) {
                loc = parent.document.location.href.replace('#', '&');
                loc = loc.replace(/\+/ig, '%20');
                //masmedios
                params = window.PDFView.parseQueryString(loc);
            }

            if ((params[paramname] !== undefined) && (typeof PDFJS.multiple === 'undefined')) {
                httpGet(params[paramname],function(data){
                    PDFJS.multiple=data;
                    PDFJS.key_page_data=[];
                    //load the first highloighted page
                    if(typeof PDFJS.multiple !== 'undefined' && PDFJS.multiple.length >0){
                      PDFViewerApplication.page = PDFJS.multiple[0].page;
                      //make the previous disabled as this is first highlight
                       document.getElementById('meta-prev').className = 'disabled';
                      //check if it has any key pages, if not disable the key_page button
                      for(var i=0; i<PDFJS.multiple.length; i++){
                         if(PDFJS.multiple[i].key_page === true){
                            PDFJS.key_page_data.push(PDFJS.multiple[i]);
                        }
                      }
                      if(PDFJS.key_page_data.length > 0){
                        document.getElementById('meta-key').className = 'disabled';
                      }
                    }
              });
            }

            var fc = page.textLayer.findController;
            fc.state = {
                query: '',
                caseSensitive: false,
                highlightAll: true,
                findPrevious: false
            };

            //small delay to avoid screen jumps
            window.setTimeout(function () {
                fc.dirtyMatch = true;
                fc.extractText();
                fc.nextMatch(parseInt(page.textLayer.pageIdx));
            }, 250);

        } catch (e) {

        }
    }

    function httpGet(theUrl, callback)
    {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() { 
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              callback(JSON.parse(xmlHttp.responseText));
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous 
      xmlHttp.send(null);
    }

    return PDFURLFinder;
})();