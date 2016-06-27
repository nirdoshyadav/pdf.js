/* globals parseQueryString, PDFJS*/
'use strict';

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('pdfjs-web/pdf_url_finder', ['exports', 'pdfjs-web/ui_utils','pdfjs-web/pdfjs'],
      factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('./ui_utils.js'), require('./pdfjs.js'));
  } else {
    factory((root.pdfjsWebPDFURLFinder = {}), root.pdfjsWebUIUtils, root.pdfjsWebPDFJS);
  }
}(this, function (exports, uiUtils, pdfjsLib) {
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
            var params = uiUtils.parseQueryString(loc);
            //also check parent window for any search terms
            if (params[paramname] === undefined) {
                loc = parent.document.location.href.replace('#', '&');
                loc = loc.replace(/\+/ig, '%20');
                //masmedios
                params = uiUtils.parseQueryString(loc);
            }
            
            var fc = page.textLayer.findController;
            fc.state = {
                query: '',
                caseSensitive: false,
                highlightAll: true,
                findPrevious: false
            };
             if ((params[paramname] !== undefined) && (typeof pdfjsLib.PDFJS.multiple === 'undefined')) {
                httpGet(params[paramname],function(data){
                  //due to asynchronys call there might be additional call before getting the data
                  if(typeof pdfjsLib.PDFJS.multiple === 'undefined'){
                    pdfjsLib.PDFJS.multiple=data;
                    pdfjsLib.PDFJS.key_page_data=[];
                    //load the first highloighted page
                    if(typeof pdfjsLib.PDFJS.multiple !== 'undefined' && pdfjsLib.PDFJS.multiple.length >0){
                      //make the previous disabled as this is first highlight
                       document.getElementById('meta-prev').className = 'disabled';
                      //check if it has any key pages, if not disable the key_page button
                      for(var i=0; i<pdfjsLib.PDFJS.multiple.length; i++){
                         if(pdfjsLib.PDFJS.multiple[i].key_page === true){
                            pdfjsLib.PDFJS.key_page_data.push(pdfjsLib.PDFJS.multiple[i]);
                        }
                      }
                      if(pdfjsLib.PDFJS.key_page_data.length > 0){
                        document.getElementById('meta-key').className = 'disabled';
                      }
                      window.setTimeout(function () {
                      fc.dirtyMatch = true;
                      fc.extractText();
                      PDFViewerApplication.page = pdfjsLib.PDFJS.multiple[0].page;
                      fc.nextMatch(parseInt(pdfjsLib.PDFJS.multiple[0].page)-1);
                      }, 250);
                  }
                }
              });
            }
            else if(params[paramname] !== undefined && (typeof pdfjsLib.PDFJS.multiple !== 'undefined')){
            //small delay to avoid screen jumps
            window.setTimeout(function () {
                fc.dirtyMatch = true;
                fc.extractText();
                fc.nextMatch(parseInt(page.textLayer.pageIdx));
            }, 250);
          }
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
exports.PDFURLFinder = PDFURLFinder;
}));