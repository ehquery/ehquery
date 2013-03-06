  EhQuery.benchmarker.tests = [
    // Selectors from:
    // http://ejohn.org/blog/selectors-that-people-actually-use/
    /*
    // For Amazon.com
      "#navAmazonLogo", "#navSwmSkedPop",
    ".navbar", ".navGreeting",
    "div", "table",
    "img.navCrossshopTabCap", "span.navGreeting",
    "#navbar table", "#navidWelcomeMsg span",
    "div#navbar", "ul#navAmazonLogo",
    "#navAmazonLogo .navAmazonLogoGatewayPanel", "#navidWelcomeMsg .navGreeting",
    ".navbar .navAmazonLogoGatewayPanel", ".navbar .navGreeting",
    "*",
    "#navAmazonLogo li.navAmazonLogoGatewayPanel", "#navidWelcomeMsg span.navGreeting",
    "a[name=top]", "form[name=site-search]",
    ".navbar li", ".navbar span",
    "[name=top]", "[name=site-search]",
    "ul li", "a img",
    "#navbar #navidWelcomeMsg", "#navbar #navSwmDWPop",
    "#navbar ul li", "#navbar a img"
    */
    // For Yahoo.com
    "#page", "#masthead", "#mastheadhd",
    ".mastheadbd", ".first", ".on",
    "div", "li", "a",
    "div.mastheadbd", "li.first", "li.on",
    "#page div", "#dtba span",
    "div#page", "div#masthead",
    "#page .mastheadbd", "#page .first",
    ".outer_search_container .search_container", ".searchbox_container .inputtext",
    "*",
    "#page div.mastheadbd", "#page li.first",
    "input[name=p]", "a[name=marketplace]",
    ".outer_search_container div", ".searchbox_container span",
    "[name=p]", "[name=marketplace]",
    "ul li", "form input",
    "#page #e2econtent", "#page #e2e"
  ];

  EhQuery.fn.benchmark = function() {
    this.each(function() {
      try {
        EhQuery(this).parent().children("*:gt(1)").remove();
      } catch(e) { }
    })
    // set # times to run the test in index.html
    var times = parseInt(EhQuery("#times").val());
    EhQuery.benchmarker.startingList = this.get();
    benchmark(this.get(), times, EhQuery.benchmarker.libraries);
  }

  EhQuery(function() {
    for(i = 0; i < EhQuery.benchmarker.tests.length; i++) {
      EhQuery("tbody").append("<tr><td class='test'>" + EhQuery.benchmarker.tests[i] + "</td></tr>");
    }
    EhQuery("tbody tr:first-child").remove();
    EhQuery("td.test").before("<td><input type='checkbox' checked='checked' /></td>");
    EhQuery("button.runTests").bind("click", function() {
      EhQuery('td:has(input:checked) + td.test').benchmark();
    });

    EhQuery("button.retryTies").bind("click", function() { EhQuery("tr:has(td.tie) td.test").benchmark() })

    EhQuery("button.selectAll").bind("click", function() { EhQuery("input[type=checkbox]").each(function() { this.checked = true }) })
    EhQuery("button.deselectAll").bind("click", function() { EhQuery("input[type=checkbox]").each(function() { this.checked = false }) })

    EhQuery("#addTest").bind("click", function() {
      EhQuery("table").append("<tr><td><input type='checkbox' /></td><td><input type='text' /><button>Add</button></td></tr>");
      EhQuery("div#time-test > button").each(function() { this.disabled = true; })
      EhQuery("tbody tr:last button").bind("click", function() {
        var td = EhQuery(this).parent();
        td.html("<button>-</button>" + EhQuery(this).prev().val()).addClass("test");
        EhQuery("div#time-test > button").each(function() { this.disabled = false; })
        EhQuery("button", td).bind("click", function() { EhQuery(this).parents("tr").remove(); })
      })
    })

    var headers = EhQuery.map(EhQuery.benchmarker.libraries, function(i,n) {
      var extra = n == 0 ? "basis - " : "";
      return "<th>" + extra + i + "</th>"
    }).join("");

    EhQuery("thead tr").append(headers);

    var footers = "";
    for(i = 0; i < EhQuery.benchmarker.libraries.length; i++)
      footers += "<th></th>"

    var wlfooters = "";
    for(i = 0; i < EhQuery.benchmarker.libraries.length; i++)
      wlfooters += "<td><span class='wins'>W</span> / <span class='fails'>F</span></th>"

    EhQuery("tfoot tr:first").append(footers);
    EhQuery("tfoot tr:last").append(wlfooters);

  });

   benchmark = function(list, times, libraries) {
     if(list[0]) {
       var times = times || 50;
       var el = list[0];
       var code = EhQuery(el).text().replace(/^-/, "");
         var timeArr = []
         for(i = 0; i < times + 2; i++) {
           var time = new Date()
           try {
             window[libraries[0]](code);
           } catch(e) { }
           timeArr.push(new Date() - time);
         }
         var diff = Math.sum(timeArr) - Math.max.apply( Math, timeArr )
         - Math.min.apply( Math, timeArr );
         try {
           var libRes = window[libraries[0]](code);
           var jqRes = EhQuery(code);
           if(((jqRes.length == 0) && (libRes.length != 0)) ||
             (libRes.length > 0 && (jqRes.length == libRes.length)) ||
             ((libraries[0] == "cssQuery" || libraries[0] == "EhQuery") && code.match(/nth\-child/) && (libRes.length > 0)) ||
             ((libraries[0] == "jQold") && jqRes.length > 0)) {
             EhQuery(el).parent().append("<td>" + Math.round(diff / times * 100) / 100 + "ms</td>");
           } else {
             EhQuery(el).parent().append("<td class='fail'>FAIL</td>");
           }
         } catch(e) {
           EhQuery(el).parent().append("<td class='fail'>FAIL</td>");
         }
       setTimeout(benchmarkList(list, times, libraries), 100);
     } else if(libraries[1]) {
       benchmark(EhQuery.benchmarker.startingList, times, libraries.slice(1));
     } else {
       EhQuery("tbody tr").each(function() {
         var winners = EhQuery("td:gt(1)", this).min(2);
         if(winners.length == 1) winners.addClass("winner");
         else winners.addClass("tie");
       });
       setTimeout(count, 100);
     }
   }

  function benchmarkList(list, times, libraries) {
    return function() {
      benchmark(list.slice(1), times, libraries);
    }
  }

 function count() {
   for(i = 3; i <= EhQuery.benchmarker.libraries.length + 2 ; i++) {
     var fails = EhQuery("td:nth-child(" + i + ").fail").length;
     var wins = EhQuery("td:nth-child(" + i + ").winner").length;
     EhQuery("tfoot tr:first th:eq(" + (i - 1) + ")")
      .html("<span class='wins'>" + wins + "</span> / <span class='fails'>" + fails + "</span>");
   }
 }


 EhQuery.fn.maxmin = function(tolerance, maxmin, percentage) {
   tolerance = tolerance || 0;
   var target = Math[maxmin].apply(Math, EhQuery.map(this, function(i) {
     var parsedNum = parseFloat(i.innerHTML.replace(/[^\.\d]/g, ""));
     if(parsedNum || (parsedNum == 0)) return parsedNum;
   }));
   return this.filter(function() {
     if( withinTolerance(parseFloat(this.innerHTML.replace(/[^\.\d]/g, "")), target, tolerance, percentage) ) return true;
   })
 }

 EhQuery.fn.max = function(tolerance, percentage) { return this.maxmin(tolerance, "max", percentage) }
 EhQuery.fn.min = function(tolerance, percentage) { return this.maxmin(tolerance, "min", percentage) }

 function withinTolerance(number, target, tolerance, percentage) {
   if(percentage) { var high = target + ((tolerance / 100) * target); var low = target - ((tolerance / 100) * target); }
   else { var high = target + tolerance; var low = target - tolerance; }
   if(number >= low && number <= high) return true;
 }

 Math.sum = function(arr) {
   var sum = 0;
   for(i = 0; i < arr.length; i++) sum += arr[i];
   return sum;
 }
