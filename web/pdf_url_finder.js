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

            if (params[paramname] !== undefined) {
                var parambase = JSON.parse(params[paramname]);
                var pageIndx=parseInt(page.textLayer.pageIdx);
                for(var i=0;i< parambase.length;i++){
                  if(parambase[i].page === pageIndx+1){
                      PDFJS.multiple = parambase[i];
                  }
                  if(parambase[i].page > pageIndx+1){
                    break;
                  }
                }
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

    return PDFURLFinder;
})();