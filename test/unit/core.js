module("core", { teardown: moduleTeardown });

test("Unit Testing Environment", function () {
	expect(2);
	ok( hasPHP, "Running in an environment with PHP support. The AJAX tests only run if the environment supports PHP!" );
	ok( !isLocal, "Unit tests are not ran from file:// (especially in Chrome. If you must test from file:// with Chrome, run it with the --allow-file-access-from-files flag!)" );
});

test("Basic requirements", function() {
	expect(7);
	ok( Array.prototype.push, "Array.push()" );
	ok( Function.prototype.apply, "Function.apply()" );
	ok( document.getElementById, "getElementById" );
	ok( document.getElementsByTagName, "getElementsByTagName" );
	ok( RegExp, "RegExp" );
	ok( EhQuery, "EhQuery" );
	ok( $, "$" );
});

testIframeWithCallback( "Conditional compilation compatibility (#13274)", "core/cc_on.html", function( cc_on, errors, $ ) {
	expect( 3 );
	ok( true, "JScript conditional compilation " + ( cc_on ? "supported" : "not supported" ) );
	deepEqual( errors, [], "No errors" );
	ok( $(), "EhQuery executes" );
});

test("EhQuery()", function() {

	var elem, i,
		obj = EhQuery("div"),
		code = EhQuery("<code/>"),
		img = EhQuery("<img/>"),
		div = EhQuery("<div/><hr/><code/><b/>"),
		exec = false,
		lng = "",
		expected = 20,
		attrObj = {
			"text": "test",
			"class": "test2",
			"id": "test3"
		};

	// The $(html, props) signature can stealth-call any $.fn method, check for a
	// few here but beware of modular builds where these methods may be excluded.
	if ( EhQuery.fn.click ) {
		expected++;
		attrObj["click"] = function() { ok( exec, "Click executed." ); };
	}
	if ( EhQuery.fn.width ) {
		expected++;
		attrObj["width"] = 10;
	}
	if ( EhQuery.fn.offset ) {
		expected++;
		attrObj["offset"] = { "top": 1, "left": 1 };
	}
	if ( EhQuery.fn.css ) {
		expected += 2;
		attrObj["css"] = { "paddingLeft": 1, "paddingRight": 1 };
	}
	if ( EhQuery.fn.attr ) {
		expected++;
		attrObj.attr = { "desired": "very" };
	}

	expect( expected );

	// Basic constructor's behavior
	equal( EhQuery().length, 0, "EhQuery() === EhQuery([])" );
	equal( EhQuery(undefined).length, 0, "EhQuery(undefined) === EhQuery([])" );
	equal( EhQuery(null).length, 0, "EhQuery(null) === EhQuery([])" );
	equal( EhQuery("").length, 0, "EhQuery('') === EhQuery([])" );
	equal( EhQuery("#").length, 0, "EhQuery('#') === EhQuery([])" );

	equal( EhQuery(obj).selector, "div", "EhQuery(EhQueryObj) == EhQueryObj" );

	// can actually yield more than one, when iframes are included, the window is an array as well
	equal( EhQuery(window).length, 1, "Correct number of elements generated for EhQuery(window)" );

/*
	// disabled since this test was doing nothing. i tried to fix it but i'm not sure
	// what the expected behavior should even be. FF returns "\n" for the text node
	// make sure this is handled
	var crlfContainer = EhQuery('<p>\r\n</p>');
	var x = crlfContainer.contents().get(0).nodeValue;
	equal( x, what???, "Check for \\r and \\n in EhQuery()" );
*/

	/* // Disabled until we add this functionality in
	var pass = true;
	try {
		EhQuery("<div>Testing</div>").appendTo(document.getElementById("iframe").contentDocument.body);
	} catch(e){
		pass = false;
	}
	ok( pass, "EhQuery('&lt;tag&gt;') needs optional document parameter to ease cross-frame DOM wrangling, see #968" );*/

	equal( code.length, 1, "Correct number of elements generated for code" );
	equal( code.parent().length, 0, "Make sure that the generated HTML has no parent." );

	equal( img.length, 1, "Correct number of elements generated for img" );
	equal( img.parent().length, 0, "Make sure that the generated HTML has no parent." );

	equal( div.length, 4, "Correct number of elements generated for div hr code b" );
	equal( div.parent().length, 0, "Make sure that the generated HTML has no parent." );

	equal( EhQuery([1,2,3]).get(1), 2, "Test passing an array to the factory" );

	equal( EhQuery(document.body).get(0), EhQuery("body").get(0), "Test passing an html node to the factory" );

	elem = EhQuery("<div/>", attrObj );

	if ( EhQuery.fn.width ) {
		equal( elem[0].style.width, "10px", "EhQuery() quick setter width");
	}

	if ( EhQuery.fn.offset ) {
		equal( elem[0].style.top, "1px", "EhQuery() quick setter offset");
	}

	if ( EhQuery.fn.css ) {
		equal( elem[0].style.paddingLeft, "1px", "EhQuery quick setter css");
		equal( elem[0].style.paddingRight, "1px", "EhQuery quick setter css");
	}

	if ( EhQuery.fn.attr ) {
		equal( elem[0].getAttribute("desired"), "very", "EhQuery quick setter attr");
	}

	equal( elem[0].childNodes.length, 1, "EhQuery quick setter text");
	equal( elem[0].firstChild.nodeValue, "test", "EhQuery quick setter text");
	equal( elem[0].className, "test2", "EhQuery() quick setter class");
	equal( elem[0].id, "test3", "EhQuery() quick setter id");

	exec = true;
	elem.trigger("click");

	// manually clean up detached elements
	elem.remove();

	for ( i = 0; i < 3; ++i ) {
		elem = EhQuery("<input type='text' value='TEST' />");
	}
	equal( elem[0].defaultValue, "TEST", "Ensure cached nodes are cloned properly (Bug #6655)" );

	// manually clean up detached elements
	elem.remove();

	for ( i = 0; i < 128; i++ ) {
		lng += "12345678";
	}
});

test("EhQuery(selector, context)", function() {
	expect(3);
	deepEqual( EhQuery("div p", "#qunit-fixture").get(), q("sndp", "en", "sap"), "Basic selector with string as context" );
	deepEqual( EhQuery("div p", q("qunit-fixture")[0]).get(), q("sndp", "en", "sap"), "Basic selector with element as context" );
	deepEqual( EhQuery("div p", EhQuery("#qunit-fixture")).get(), q("sndp", "en", "sap"), "Basic selector with EhQuery object as context" );
});

test( "selector state", function() {
	expect( 18 );

	var test;

	test = EhQuery( undefined );
	equal( test.selector, "", "Empty EhQuery Selector" );
	equal( test.context, undefined, "Empty EhQuery Context" );

	test = EhQuery( document );
	equal( test.selector, "", "Document Selector" );
	equal( test.context, document, "Document Context" );

	test = EhQuery( document.body );
	equal( test.selector, "", "Body Selector" );
	equal( test.context, document.body, "Body Context" );

	test = EhQuery("#qunit-fixture");
	equal( test.selector, "#qunit-fixture", "#qunit-fixture Selector" );
	equal( test.context, document, "#qunit-fixture Context" );

	test = EhQuery("#notfoundnono");
	equal( test.selector, "#notfoundnono", "#notfoundnono Selector" );
	equal( test.context, document, "#notfoundnono Context" );

	test = EhQuery( "#qunit-fixture", document );
	equal( test.selector, "#qunit-fixture", "#qunit-fixture Selector" );
	equal( test.context, document, "#qunit-fixture Context" );

	test = EhQuery( "#qunit-fixture", document.body );
	equal( test.selector, "#qunit-fixture", "#qunit-fixture Selector" );
	equal( test.context, document.body, "#qunit-fixture Context" );

	// Test cloning
	test = EhQuery( test );
	equal( test.selector, "#qunit-fixture", "#qunit-fixture Selector" );
	equal( test.context, document.body, "#qunit-fixture Context" );

	test = EhQuery( document.body ).find("#qunit-fixture");
	equal( test.selector, "#qunit-fixture", "#qunit-fixture find Selector" );
	equal( test.context, document.body, "#qunit-fixture find Context" );
});

test( "globalEval", function() {
	expect( 3 );
	Globals.register("globalEvalTest");

	EhQuery.globalEval("globalEvalTest = 1;");
	equal( window.globalEvalTest, 1, "Test variable assignments are global" );

	EhQuery.globalEval("var globalEvalTest = 2;");
	equal( window.globalEvalTest, 2, "Test variable declarations are global" );

	EhQuery.globalEval("this.globalEvalTest = 3;");
	equal( window.globalEvalTest, 3, "Test context (this) is the window object" );
});

test("noConflict", function() {
	expect(7);

	var $$ = EhQuery;

	strictEqual( EhQuery, EhQuery.noConflict(), "noConflict returned the EhQuery object" );
	strictEqual( window["EhQuery"], $$, "Make sure EhQuery wasn't touched." );
	strictEqual( window["$"], original$, "Make sure $ was reverted." );

	EhQuery = $ = $$;

	strictEqual( EhQuery.noConflict(true), $$, "noConflict returned the EhQuery object" );
	strictEqual( window["EhQuery"], originalEhQuery, "Make sure EhQuery was reverted." );
	strictEqual( window["$"], original$, "Make sure $ was reverted." );
	ok( $$().pushStack([]), "Make sure that EhQuery still works." );

	window["EhQuery"] = EhQuery = $$;
});

test("trim", function() {
	expect(13);

	var nbsp = String.fromCharCode(160);

	equal( EhQuery.trim("hello  "), "hello", "trailing space" );
	equal( EhQuery.trim("  hello"), "hello", "leading space" );
	equal( EhQuery.trim("  hello   "), "hello", "space on both sides" );
	equal( EhQuery.trim("  " + nbsp + "hello  " + nbsp + " "), "hello", "&nbsp;" );

	equal( EhQuery.trim(), "", "Nothing in." );
	equal( EhQuery.trim( undefined ), "", "Undefined" );
	equal( EhQuery.trim( null ), "", "Null" );
	equal( EhQuery.trim( 5 ), "5", "Number" );
	equal( EhQuery.trim( false ), "false", "Boolean" );

	equal( EhQuery.trim(" "), "", "space should be trimmed" );
	equal( EhQuery.trim("ipad\xA0"), "ipad", "nbsp should be trimmed" );
	equal( EhQuery.trim("\uFEFF"), "", "zwsp should be trimmed" );
	equal( EhQuery.trim("\uFEFF \xA0! | \uFEFF"), "! |", "leading/trailing should be trimmed" );
});

test("type", function() {
	expect( 28 );

	equal( EhQuery.type(null), "null", "null" );
	equal( EhQuery.type(undefined), "undefined", "undefined" );
	equal( EhQuery.type(true), "boolean", "Boolean" );
	equal( EhQuery.type(false), "boolean", "Boolean" );
	equal( EhQuery.type(Boolean(true)), "boolean", "Boolean" );
	equal( EhQuery.type(0), "number", "Number" );
	equal( EhQuery.type(1), "number", "Number" );
	equal( EhQuery.type(Number(1)), "number", "Number" );
	equal( EhQuery.type(""), "string", "String" );
	equal( EhQuery.type("a"), "string", "String" );
	equal( EhQuery.type(String("a")), "string", "String" );
	equal( EhQuery.type({}), "object", "Object" );
	equal( EhQuery.type(/foo/), "regexp", "RegExp" );
	equal( EhQuery.type(new RegExp("asdf")), "regexp", "RegExp" );
	equal( EhQuery.type([1]), "array", "Array" );
	equal( EhQuery.type(new Date()), "date", "Date" );
	equal( EhQuery.type(new Function("return;")), "function", "Function" );
	equal( EhQuery.type(function(){}), "function", "Function" );
	equal( EhQuery.type(new Error()), "error", "Error" );
	equal( EhQuery.type(window), "object", "Window" );
	equal( EhQuery.type(document), "object", "Document" );
	equal( EhQuery.type(document.body), "object", "Element" );
	equal( EhQuery.type(document.createTextNode("foo")), "object", "TextNode" );
	equal( EhQuery.type(document.getElementsByTagName("*")), "object", "NodeList" );

	// Avoid Lint complaints
	var MyString = String;
	var MyNumber = Number;
	var MyBoolean = Boolean;
	var MyObject = Object;
	equal( EhQuery.type(new MyBoolean(true)), "boolean", "Boolean" );
	equal( EhQuery.type(new MyNumber(1)), "number", "Number" );
	equal( EhQuery.type(new MyString("a")), "string", "String" );
	equal( EhQuery.type(new MyObject()), "object", "Object" );
});

asyncTest("isPlainObject", function() {
	expect(15);

	var pass, iframe, doc,
		fn = function() {};

	// The use case that we want to match
	ok( EhQuery.isPlainObject({}), "{}" );

	// Not objects shouldn't be matched
	ok( !EhQuery.isPlainObject(""), "string" );
	ok( !EhQuery.isPlainObject(0) && !EhQuery.isPlainObject(1), "number" );
	ok( !EhQuery.isPlainObject(true) && !EhQuery.isPlainObject(false), "boolean" );
	ok( !EhQuery.isPlainObject(null), "null" );
	ok( !EhQuery.isPlainObject(undefined), "undefined" );

	// Arrays shouldn't be matched
	ok( !EhQuery.isPlainObject([]), "array" );

	// Instantiated objects shouldn't be matched
	ok( !EhQuery.isPlainObject(new Date()), "new Date" );

	// Functions shouldn't be matched
	ok( !EhQuery.isPlainObject(fn), "fn" );

	// Again, instantiated objects shouldn't be matched
	ok( !EhQuery.isPlainObject(new fn()), "new fn (no methods)" );

	// Makes the function a little more realistic
	// (and harder to detect, incidentally)
	fn.prototype["someMethod"] = function(){};

	// Again, instantiated objects shouldn't be matched
	ok( !EhQuery.isPlainObject(new fn()), "new fn" );

	// DOM Element
	ok( !EhQuery.isPlainObject( document.createElement("div") ), "DOM Element" );

	// Window
	ok( !EhQuery.isPlainObject( window ), "window" );

	pass = false;
	try {
		EhQuery.isPlainObject( window.location );
		pass = true;
	} catch ( e ) {}
	ok( pass, "Does not throw exceptions on host objects" );

	// Objects from other windows should be matched
	window.iframeCallback = function( otherObject, detail ) {
		window.iframeCallback = undefined;
		iframe.parentNode.removeChild( iframe );
		ok( EhQuery.isPlainObject(new otherObject()), "new otherObject" + ( detail ? " - " + detail : "" ) );
		start();
	};

	try {
		iframe = EhQuery("#qunit-fixture")[0].appendChild( document.createElement("iframe") );
		doc = iframe.contentDocument || iframe.contentWindow.document;
		doc.open();
		doc.write("<body onload='window.parent.iframeCallback(Object);'>");
		doc.close();
	} catch(e) {
		window.iframeDone( Object, "iframes not supported" );
	}
});

test("isFunction", function() {
	expect(19);

	// Make sure that false values return false
	ok( !EhQuery.isFunction(), "No Value" );
	ok( !EhQuery.isFunction( null ), "null Value" );
	ok( !EhQuery.isFunction( undefined ), "undefined Value" );
	ok( !EhQuery.isFunction( "" ), "Empty String Value" );
	ok( !EhQuery.isFunction( 0 ), "0 Value" );

	// Check built-ins
	// Safari uses "(Internal Function)"
	ok( EhQuery.isFunction(String), "String Function("+String+")" );
	ok( EhQuery.isFunction(Array), "Array Function("+Array+")" );
	ok( EhQuery.isFunction(Object), "Object Function("+Object+")" );
	ok( EhQuery.isFunction(Function), "Function Function("+Function+")" );

	// When stringified, this could be misinterpreted
	var mystr = "function";
	ok( !EhQuery.isFunction(mystr), "Function String" );

	// When stringified, this could be misinterpreted
	var myarr = [ "function" ];
	ok( !EhQuery.isFunction(myarr), "Function Array" );

	// When stringified, this could be misinterpreted
	var myfunction = { "function": "test" };
	ok( !EhQuery.isFunction(myfunction), "Function Object" );

	// Make sure normal functions still work
	var fn = function(){};
	ok( EhQuery.isFunction(fn), "Normal Function" );

	var obj = document.createElement("object");

	// Firefox says this is a function
	ok( !EhQuery.isFunction(obj), "Object Element" );

	// IE says this is an object
	// Since 1.3, this isn't supported (#2968)
	//ok( EhQuery.isFunction(obj.getAttribute), "getAttribute Function" );

	var nodes = document.body.childNodes;

	// Safari says this is a function
	ok( !EhQuery.isFunction(nodes), "childNodes Property" );

	var first = document.body.firstChild;

	// Normal elements are reported ok everywhere
	ok( !EhQuery.isFunction(first), "A normal DOM Element" );

	var input = document.createElement("input");
	input.type = "text";
	document.body.appendChild( input );

	// IE says this is an object
	// Since 1.3, this isn't supported (#2968)
	//ok( EhQuery.isFunction(input.focus), "A default function property" );

	document.body.removeChild( input );

	var a = document.createElement("a");
	a.href = "some-function";
	document.body.appendChild( a );

	// This serializes with the word 'function' in it
	ok( !EhQuery.isFunction(a), "Anchor Element" );

	document.body.removeChild( a );

	// Recursive function calls have lengths and array-like properties
	function callme(callback){
		function fn(response){
			callback(response);
		}

		ok( EhQuery.isFunction(fn), "Recursive Function Call" );

		fn({ some: "data" });
	}

	callme(function(){
		callme(function(){});
	});
});

test( "isNumeric", function() {
	expect( 36 );

	var t = EhQuery.isNumeric,
		Traditionalists = /** @constructor */ function(n) {
			this.value = n;
			this.toString = function(){
				return String(this.value);
			};
		},
		answer = new Traditionalists( "42" ),
		rong = new Traditionalists( "Devo" );

	ok( t("-10"), "Negative integer string");
	ok( t("0"), "Zero string");
	ok( t("5"), "Positive integer string");
	ok( t(-16), "Negative integer number");
	ok( t(0), "Zero integer number");
	ok( t(32), "Positive integer number");
	ok( t("040"), "Octal integer literal string");
	// OctalIntegerLiteral has been deprecated since ES3/1999
	// It doesn't pass lint, so disabling until a solution can be found
	//ok( t(0144), "Octal integer literal");
	ok( t("0xFF"), "Hexadecimal integer literal string");
	ok( t(0xFFF), "Hexadecimal integer literal");
	ok( t("-1.6"), "Negative floating point string");
	ok( t("4.536"), "Positive floating point string");
	ok( t(-2.6), "Negative floating point number");
	ok( t(3.1415), "Positive floating point number");
	ok( t(8e5), "Exponential notation");
	ok( t("123e-2"), "Exponential notation string");
	ok( t(answer), "Custom .toString returning number");
	equal( t(""), false, "Empty string");
	equal( t("        "), false, "Whitespace characters string");
	equal( t("\t\t"), false, "Tab characters string");
	equal( t("abcdefghijklm1234567890"), false, "Alphanumeric character string");
	equal( t("xabcdefx"), false, "Non-numeric character string");
	equal( t(true), false, "Boolean true literal");
	equal( t(false), false, "Boolean false literal");
	equal( t("bcfed5.2"), false, "Number with preceding non-numeric characters");
	equal( t("7.2acdgs"), false, "Number with trailling non-numeric characters");
	equal( t(undefined), false, "Undefined value");
	equal( t(null), false, "Null value");
	equal( t(NaN), false, "NaN value");
	equal( t(Infinity), false, "Infinity primitive");
	equal( t(Number.POSITIVE_INFINITY), false, "Positive Infinity");
	equal( t(Number.NEGATIVE_INFINITY), false, "Negative Infinity");
	equal( t(rong), false, "Custom .toString returning non-number");
	equal( t({}), false, "Empty object");
	equal( t(function(){} ), false, "Instance of a function");
	equal( t( new Date() ), false, "Instance of a Date");
	equal( t(function(){} ), false, "Instance of a function");
});

test("isXMLDoc - HTML", function() {
	expect(4);

	ok( !EhQuery.isXMLDoc( document ), "HTML document" );
	ok( !EhQuery.isXMLDoc( document.documentElement ), "HTML documentElement" );
	ok( !EhQuery.isXMLDoc( document.body ), "HTML Body Element" );

	var iframe = document.createElement("iframe");
	document.body.appendChild( iframe );

	try {
		var body = EhQuery(iframe).contents()[0];

		try {
			ok( !EhQuery.isXMLDoc( body ), "Iframe body element" );
		} catch(e) {
			ok( false, "Iframe body element exception" );
		}

	} catch(e) {
		ok( true, "Iframe body element - iframe not working correctly" );
	}

	document.body.removeChild( iframe );
});

test("XSS via location.hash", function() {
	expect(1);

	stop();
	EhQuery["_check9521"] = function(x){
		ok( x, "script called from #id-like selector with inline handler" );
		EhQuery("#check9521").remove();
		delete EhQuery["_check9521"];
		start();
	};
	try {
		// This throws an error because it's processed like an id
		EhQuery( "#<img id='check9521' src='no-such-.gif' onerror='EhQuery._check9521(false)'>" ).appendTo("#qunit-fixture");
	} catch (err) {
		EhQuery["_check9521"](true);
	}
});

test("isXMLDoc - XML", function() {
	expect(3);
	var xml = createDashboardXML();
	ok( EhQuery.isXMLDoc( xml ), "XML document" );
	ok( EhQuery.isXMLDoc( xml.documentElement ), "XML documentElement" );
	ok( EhQuery.isXMLDoc( EhQuery("tab", xml)[0] ), "XML Tab Element" );
});

test("isWindow", function() {
	expect( 14 );

	ok( EhQuery.isWindow(window), "window" );
	ok( EhQuery.isWindow(document.getElementsByTagName("iframe")[0].contentWindow), "iframe.contentWindow" );
	ok( !EhQuery.isWindow(), "empty" );
	ok( !EhQuery.isWindow(null), "null" );
	ok( !EhQuery.isWindow(undefined), "undefined" );
	ok( !EhQuery.isWindow(document), "document" );
	ok( !EhQuery.isWindow(document.documentElement), "documentElement" );
	ok( !EhQuery.isWindow(""), "string" );
	ok( !EhQuery.isWindow(1), "number" );
	ok( !EhQuery.isWindow(true), "boolean" );
	ok( !EhQuery.isWindow({}), "object" );
	ok( !EhQuery.isWindow({ setInterval: function(){} }), "fake window" );
	ok( !EhQuery.isWindow(/window/), "regexp" );
	ok( !EhQuery.isWindow(function(){}), "function" );
});

test("EhQuery('html')", function() {
	expect( 15 );

	QUnit.reset();
	EhQuery["foo"] = false;
	var s = EhQuery("<script>EhQuery.foo='test';</script>")[0];
	ok( s, "Creating a script" );
	ok( !EhQuery["foo"], "Make sure the script wasn't executed prematurely" );
	EhQuery("body").append("<script>EhQuery.foo='test';</script>");
	ok( EhQuery["foo"], "Executing a scripts contents in the right context" );

	// Test multi-line HTML
	var div = EhQuery("<div>\r\nsome text\n<p>some p</p>\nmore text\r\n</div>")[0];
	equal( div.nodeName.toUpperCase(), "DIV", "Make sure we're getting a div." );
	equal( div.firstChild.nodeType, 3, "Text node." );
	equal( div.lastChild.nodeType, 3, "Text node." );
	equal( div.childNodes[1].nodeType, 1, "Paragraph." );
	equal( div.childNodes[1].firstChild.nodeType, 3, "Paragraph text." );

	QUnit.reset();
	ok( EhQuery("<link rel='stylesheet'/>")[0], "Creating a link" );

	ok( !EhQuery("<script/>")[0].parentNode, "Create a script" );

	ok( EhQuery("<input/>").attr("type", "hidden"), "Create an input and set the type." );

	var j = EhQuery("<span>hi</span> there <!-- mon ami -->");
	ok( j.length >= 2, "Check node,textnode,comment creation (some browsers delete comments)" );

	ok( !EhQuery("<option>test</option>")[0].selected, "Make sure that options are auto-selected #2050" );

	ok( EhQuery("<div></div>")[0], "Create a div with closing tag." );
	ok( EhQuery("<table></table>")[0], "Create a table with closing tag." );

	// equal( EhQuery("element[attribute='<div></div>']").length, 0, "When html is within brackets, do not recognize as html." );
	// equal( EhQuery("element[attribute=<div></div>]").length, 0, "When html is within brackets, do not recognize as html." );
	// equal( EhQuery("element:not(<div></div>)").length, 0, "When html is within parens, do not recognize as html." );
	// equal( EhQuery("\\<div\\>").length, 0, "Ignore escaped html characters" );
});

test("EhQuery('massive html #7990')", function() {
	expect( 3 );

	var i;
	var li = "<li>very very very very large html string</li>";
	var html = ["<ul>"];
	for ( i = 0; i < 30000; i += 1 ) {
		html[html.length] = li;
	}
	html[html.length] = "</ul>";
	html = EhQuery(html.join(""))[0];
	equal( html.nodeName.toLowerCase(), "ul");
	equal( html.firstChild.nodeName.toLowerCase(), "li");
	equal( html.childNodes.length, 30000 );
});

test("EhQuery('html', context)", function() {
	expect(1);

	var $div = EhQuery("<div/>")[0];
	var $span = EhQuery("<span/>", $div);
	equal($span.length, 1, "Verify a span created with a div context works, #1763");
});

test("EhQuery(selector, xml).text(str) - Loaded via XML document", function() {
	expect(2);

	var xml = createDashboardXML();
	// tests for #1419 where IE was a problem
	var tab = EhQuery("tab", xml).eq(0);
	equal( tab.text(), "blabla", "Verify initial text correct" );
	tab.text("newtext");
	equal( tab.text(), "newtext", "Verify new text correct" );
});

test("end()", function() {
	expect(3);
	equal( "Yahoo", EhQuery("#yahoo").parent().end().text(), "Check for end" );
	ok( EhQuery("#yahoo").end(), "Check for end with nothing to end" );

	var x = EhQuery("#yahoo");
	x.parent();
	equal( "Yahoo", EhQuery("#yahoo").text(), "Check for non-destructive behaviour" );
});

test("length", function() {
	expect(1);
	equal( EhQuery("#qunit-fixture p").length, 6, "Get Number of Elements Found" );
});

test("size()", function() {
	expect(1);
	equal( EhQuery("#qunit-fixture p").size(), 6, "Get Number of Elements Found" );
});

test("get()", function() {
	expect(1);
	deepEqual( EhQuery("#qunit-fixture p").get(), q("firstp","ap","sndp","en","sap","first"), "Get All Elements" );
});

test("toArray()", function() {
	expect(1);
	deepEqual( EhQuery("#qunit-fixture p").toArray(),
		q("firstp","ap","sndp","en","sap","first"),
		"Convert EhQuery object to an Array" );
});

test("inArray()", function() {
	expect(19);

	var selections = {
		p:   q("firstp", "sap", "ap", "first"),
		em:  q("siblingnext", "siblingfirst"),
		div: q("qunit-testrunner-toolbar", "nothiddendiv", "nothiddendivchild", "foo"),
		a:   q("mark", "groups", "google", "simon1"),
		empty: []
	},
	tests = {
		p:    { elem: EhQuery("#ap")[0],           index: 2 },
		em:   { elem: EhQuery("#siblingfirst")[0], index: 1 },
		div:  { elem: EhQuery("#nothiddendiv")[0], index: 1 },
		a:    { elem: EhQuery("#simon1")[0],       index: 3 }
	},
	falseTests = {
		p:  EhQuery("#liveSpan1")[0],
		em: EhQuery("#nothiddendiv")[0],
		empty: ""
	};

	EhQuery.each( tests, function( key, obj ) {
		equal( EhQuery.inArray( obj.elem, selections[ key ] ), obj.index, "elem is in the array of selections of its tag" );
		// Third argument (fromIndex)
		equal( !!~EhQuery.inArray( obj.elem, selections[ key ], 5 ), false, "elem is NOT in the array of selections given a starting index greater than its position" );
		equal( !!~EhQuery.inArray( obj.elem, selections[ key ], 1 ), true, "elem is in the array of selections given a starting index less than or equal to its position" );
		equal( !!~EhQuery.inArray( obj.elem, selections[ key ], -3 ), true, "elem is in the array of selections given a negative index" );
	});

	EhQuery.each( falseTests, function( key, elem ) {
		equal( !!~EhQuery.inArray( elem, selections[ key ] ), false, "elem is NOT in the array of selections" );
	});

});

test("get(Number)", function() {
	expect(2);
	equal( EhQuery("#qunit-fixture p").get(0), document.getElementById("firstp"), "Get A Single Element" );
	strictEqual( EhQuery("#firstp").get(1), undefined, "Try get with index larger elements count" );
});

test("get(-Number)",function() {
	expect(2);
	equal( EhQuery("p").get(-1), document.getElementById("first"), "Get a single element with negative index" );
	strictEqual( EhQuery("#firstp").get(-2), undefined, "Try get with index negative index larger then elements count" );
});

test("each(Function)", function() {
	expect(1);
	var div = EhQuery("div");
	div.each(function(){this.foo = "zoo";});
	var pass = true;
	for ( var i = 0; i < div.size(); i++ ) {
		if ( div.get(i).foo != "zoo" ) {
			pass = false;
		}
	}
	ok( pass, "Execute a function, Relative" );
});

test("slice()", function() {
	expect(7);

	var $links = EhQuery("#ap a");

	deepEqual( $links.slice(1,2).get(), q("groups"), "slice(1,2)" );
	deepEqual( $links.slice(1).get(), q("groups", "anchor1", "mark"), "slice(1)" );
	deepEqual( $links.slice(0,3).get(), q("google", "groups", "anchor1"), "slice(0,3)" );
	deepEqual( $links.slice(-1).get(), q("mark"), "slice(-1)" );

	deepEqual( $links.eq(1).get(), q("groups"), "eq(1)" );
	deepEqual( $links.eq("2").get(), q("anchor1"), "eq('2')" );
	deepEqual( $links.eq(-1).get(), q("mark"), "eq(-1)" );
});

test("first()/last()", function() {
	expect(4);

	var $links = EhQuery("#ap a"), $none = EhQuery("asdf");

	deepEqual( $links.first().get(), q("google"), "first()" );
	deepEqual( $links.last().get(), q("mark"), "last()" );

	deepEqual( $none.first().get(), [], "first() none" );
	deepEqual( $none.last().get(), [], "last() none" );
});

test("map()", function() {
	expect( 2 );

	deepEqual(
		EhQuery("#ap").map(function() {
			return EhQuery( this ).find("a").get();
		}).get(),
		q( "google", "groups", "anchor1", "mark" ),
		"Array Map"
	);

	deepEqual(
		EhQuery("#ap > a").map(function() {
			return this.parentNode;
		}).get(),
		q( "ap","ap","ap" ),
		"Single Map"
	);
});

test("EhQuery.map", function() {
	expect( 25 );

	var i, label, result, callback;

	result = EhQuery.map( [ 3, 4, 5 ], function( v, k ) {
		return k;
	});
	equal( result.join(""), "012", "Map the keys from an array" );

	result = EhQuery.map( [ 3, 4, 5 ], function( v, k ) {
		return v;
	});
	equal( result.join(""), "345", "Map the values from an array" );

	result = EhQuery.map( { a: 1, b: 2 }, function( v, k ) {
		return k;
	});
	equal( result.join(""), "ab", "Map the keys from an object" );

	result = EhQuery.map( { a: 1, b: 2 }, function( v, k ) {
		return v;
	});
	equal( result.join(""), "12", "Map the values from an object" );

	result = EhQuery.map( [ "a", undefined, null, "b" ], function( v, k ) {
		return v;
	});
	equal( result.join(""), "ab", "Array iteration does not include undefined/null results" );

	result = EhQuery.map( { a: "a", b: undefined, c: null, d: "b" }, function( v, k ) {
		return v;
	});
	equal( result.join(""), "ab", "Object iteration does not include undefined/null results" );

	result = {
		Zero: function() {},
		One: function( a ) {},
		Two: function( a, b ) {}
	};
	callback = function( v, k ) {
		equal( k, "foo", label + "-argument function treated like object" );
	};
	for ( i in result ) {
		label = i;
		result[ i ].foo = "bar";
		EhQuery.map( result[ i ], callback );
	}

	result = {
		"undefined": undefined,
		"null": null,
		"false": false,
		"true": true,
		"empty string": "",
		"nonempty string": "string",
		"string \"0\"": "0",
		"negative": -1,
		"excess": 1
	};
	callback = function( v, k ) {
		equal( k, "length", "Object with " + label + " length treated like object" );
	};
	for ( i in result ) {
		label = i;
		EhQuery.map( { length: result[ i ] }, callback );
	}

	result = {
		"sparse Array": Array( 4 ),
		"length: 1 plain object": { length: 1, "0": true },
		"length: 2 plain object": { length: 2, "0": true, "1": true },
		NodeList: document.getElementsByTagName("html")
	};
	callback = function( v, k ) {
		if ( result[ label ] ) {
			delete result[ label ];
			equal( k, "0", label + " treated like array" );
		}
	};
	for ( i in result ) {
		label = i;
		EhQuery.map( result[ i ], callback );
	}

	result = false;
	EhQuery.map( { length: 0 }, function( v, k ) {
		result = true;
	});
	ok( !result, "length: 0 plain object treated like array" );

	result = false;
	EhQuery.map( document.getElementsByTagName("asdf"), function( v, k ) {
		result = true;
	});
	ok( !result, "empty NodeList treated like array" );

	result = EhQuery.map( Array(4), function( v, k ){
		return k % 2 ? k : [k,k,k];
	});
	equal( result.join(""), "00012223", "Array results flattened (#2616)" );
});

test("EhQuery.merge()", function() {
	expect(8);

	deepEqual( EhQuery.merge([],[]), [], "Empty arrays" );

	deepEqual( EhQuery.merge([ 1 ],[ 2 ]), [ 1, 2 ], "Basic" );
	deepEqual( EhQuery.merge([ 1, 2 ], [ 3, 4 ]), [ 1, 2, 3, 4 ], "Basic" );

	deepEqual( EhQuery.merge([ 1, 2 ],[]), [ 1, 2 ], "Second empty" );
	deepEqual( EhQuery.merge([],[ 1, 2 ]), [ 1, 2 ], "First empty" );

	// Fixed at [5998], #3641
	deepEqual( EhQuery.merge([ -2, -1 ], [ 0, 1, 2 ]), [ -2, -1 , 0, 1, 2 ],
		"Second array including a zero (falsy)");

	// After fixing #5527
	deepEqual( EhQuery.merge([], [ null, undefined ]), [ null, undefined ],
		"Second array including null and undefined values");
	deepEqual( EhQuery.merge({ length: 0 }, [ 1, 2 ] ), { length: 2, 0: 1, 1: 2},
		"First array like");
});

test("EhQuery.extend(Object, Object)", function() {
	expect(28);

	var settings = { "xnumber1": 5, "xnumber2": 7, "xstring1": "peter", "xstring2": "pan" },
		options = { "xnumber2": 1, "xstring2": "x", "xxx": "newstring" },
		optionsCopy = { "xnumber2": 1, "xstring2": "x", "xxx": "newstring" },
		merged = { "xnumber1": 5, "xnumber2": 1, "xstring1": "peter", "xstring2": "x", "xxx": "newstring" },
		deep1 = { "foo": { "bar": true } },
		deep1copy = { "foo": { "bar": true } },
		deep2 = { "foo": { "baz": true }, "foo2": document },
		deep2copy = { "foo": { "baz": true }, "foo2": document },
		deepmerged = { "foo": { "bar": true, "baz": true }, "foo2": document },
		arr = [1, 2, 3],
		nestedarray = { "arr": arr };

	EhQuery.extend(settings, options);
	deepEqual( settings, merged, "Check if extended: settings must be extended" );
	deepEqual( options, optionsCopy, "Check if not modified: options must not be modified" );

	EhQuery.extend(settings, null, options);
	deepEqual( settings, merged, "Check if extended: settings must be extended" );
	deepEqual( options, optionsCopy, "Check if not modified: options must not be modified" );

	EhQuery.extend(true, deep1, deep2);
	deepEqual( deep1["foo"], deepmerged["foo"], "Check if foo: settings must be extended" );
	deepEqual( deep2["foo"], deep2copy["foo"], "Check if not deep2: options must not be modified" );
	equal( deep1["foo2"], document, "Make sure that a deep clone was not attempted on the document" );

	ok( EhQuery.extend(true, {}, nestedarray)["arr"] !== arr, "Deep extend of object must clone child array" );

	// #5991
	ok( EhQuery.isArray( EhQuery.extend(true, { "arr": {} }, nestedarray)["arr"] ), "Cloned array have to be an Array" );
	ok( EhQuery.isPlainObject( EhQuery.extend(true, { "arr": arr }, { "arr": {} })["arr"] ), "Cloned object have to be an plain object" );

	var empty = {};
	var optionsWithLength = { "foo": { "length": -1 } };
	EhQuery.extend(true, empty, optionsWithLength);
	deepEqual( empty["foo"], optionsWithLength["foo"], "The length property must copy correctly" );

	empty = {};
	var optionsWithDate = { "foo": { "date": new Date() } };
	EhQuery.extend(true, empty, optionsWithDate);
	deepEqual( empty["foo"], optionsWithDate["foo"], "Dates copy correctly" );

	/** @constructor */
	var myKlass = function() {};
	var customObject = new myKlass();
	var optionsWithCustomObject = { "foo": { "date": customObject } };
	empty = {};
	EhQuery.extend(true, empty, optionsWithCustomObject);
	ok( empty["foo"] && empty["foo"]["date"] === customObject, "Custom objects copy correctly (no methods)" );

	// Makes the class a little more realistic
	myKlass.prototype = { "someMethod": function(){} };
	empty = {};
	EhQuery.extend(true, empty, optionsWithCustomObject);
	ok( empty["foo"] && empty["foo"]["date"] === customObject, "Custom objects copy correctly" );

	var MyNumber = Number;
	var ret = EhQuery.extend(true, { "foo": 4 }, { "foo": new MyNumber(5) } );
	ok( ret.foo == 5, "Wrapped numbers copy correctly" );

	var nullUndef;
	nullUndef = EhQuery.extend({}, options, { "xnumber2": null });
	ok( nullUndef["xnumber2"] === null, "Check to make sure null values are copied");

	nullUndef = EhQuery.extend({}, options, { "xnumber2": undefined });
	ok( nullUndef["xnumber2"] === options["xnumber2"], "Check to make sure undefined values are not copied");

	nullUndef = EhQuery.extend({}, options, { "xnumber0": null });
	ok( nullUndef["xnumber0"] === null, "Check to make sure null values are inserted");

	var target = {};
	var recursive = { foo:target, bar:5 };
	EhQuery.extend(true, target, recursive);
	deepEqual( target, { bar:5 }, "Check to make sure a recursive obj doesn't go never-ending loop by not copying it over" );

	ret = EhQuery.extend(true, { foo: [] }, { foo: [0] } ); // 1907
	equal( ret.foo.length, 1, "Check to make sure a value with coercion 'false' copies over when necessary to fix #1907" );

	ret = EhQuery.extend(true, { foo: "1,2,3" }, { foo: [1, 2, 3] } );
	ok( typeof ret.foo != "string", "Check to make sure values equal with coercion (but not actually equal) overwrite correctly" );

	ret = EhQuery.extend(true, { foo:"bar" }, { foo:null } );
	ok( typeof ret.foo !== "undefined", "Make sure a null value doesn't crash with deep extend, for #1908" );

	var obj = { foo:null };
	EhQuery.extend(true, obj, { foo:"notnull" } );
	equal( obj.foo, "notnull", "Make sure a null value can be overwritten" );

	function func() {}
	EhQuery.extend(func, { key: "value" } );
	equal( func.key, "value", "Verify a function can be extended" );

	var defaults = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
		defaultsCopy = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
		options1 = { xnumber2: 1, xstring2: "x" },
		options1Copy = { xnumber2: 1, xstring2: "x" },
		options2 = { xstring2: "xx", xxx: "newstringx" },
		options2Copy = { xstring2: "xx", xxx: "newstringx" },
		merged2 = { xnumber1: 5, xnumber2: 1, xstring1: "peter", xstring2: "xx", xxx: "newstringx" };

	settings = EhQuery.extend({}, defaults, options1, options2);
	deepEqual( settings, merged2, "Check if extended: settings must be extended" );
	deepEqual( defaults, defaultsCopy, "Check if not modified: options1 must not be modified" );
	deepEqual( options1, options1Copy, "Check if not modified: options1 must not be modified" );
	deepEqual( options2, options2Copy, "Check if not modified: options2 must not be modified" );
});

test("EhQuery.extend(true,{},{a:[], o:{}}); deep copy with array, followed by object", function() {
	expect(2);

	var result, initial = {
		// This will make "copyIsArray" true
		array: [ 1, 2, 3, 4 ],
		// If "copyIsArray" doesn't get reset to false, the check
		// will evaluate true and enter the array copy block
		// instead of the object copy block. Since the ternary in the
		// "copyIsArray" block will will evaluate to false
		// (check if operating on an array with ), this will be
		// replaced by an empty array.
		object: {}
	};

	result = EhQuery.extend( true, {}, initial );

	deepEqual( result, initial, "The [result] and [initial] have equal shape and values" );
	ok( !EhQuery.isArray( result.object ), "result.object wasn't paved with an empty array" );
});

test("EhQuery.each(Object,Function)", function() {
	expect( 23 );

	var i, label, seen, callback;

	seen = {};
	EhQuery.each( [ 3, 4, 5 ], function( k, v ) {
		seen[ k ] = v;
	});
	deepEqual( seen, { "0": 3, "1": 4, "2": 5 }, "Array iteration" );

	seen = {};
	EhQuery.each( { name: "name", lang: "lang" }, function( k, v ) {
		seen[ k ] = v;
	});
	deepEqual( seen, { name: "name", lang: "lang" }, "Object iteration" );

	seen = [];
	EhQuery.each( [ 1, 2, 3 ], function( k, v ) {
		seen.push( v );
		if ( k === 1 ) {
			return false;
		}
	});
	deepEqual( seen, [ 1, 2 ] , "Broken array iteration" );

	seen = [];
	EhQuery.each( {"a": 1, "b": 2,"c": 3 }, function( k, v ) {
		seen.push( v );
		return false;
	});
	deepEqual( seen, [ 1 ], "Broken object iteration" );

	seen = {
		Zero: function() {},
		One: function( a ) {},
		Two: function( a, b ) {}
	};
	callback = function( k, v ) {
		equal( k, "foo", label + "-argument function treated like object" );
	};
	for ( i in seen ) {
		label = i;
		seen[ i ].foo = "bar";
		EhQuery.each( seen[ i ], callback );
	}

	seen = {
		"undefined": undefined,
		"null": null,
		"false": false,
		"true": true,
		"empty string": "",
		"nonempty string": "string",
		"string \"0\"": "0",
		"negative": -1,
		"excess": 1
	};
	callback = function( k, v ) {
		equal( k, "length", "Object with " + label + " length treated like object" );
	};
	for ( i in seen ) {
		label = i;
		EhQuery.each( { length: seen[ i ] }, callback );
	}

	seen = {
		"sparse Array": Array( 4 ),
		"length: 1 plain object": { length: 1, "0": true },
		"length: 2 plain object": { length: 2, "0": true, "1": true },
		NodeList: document.getElementsByTagName("html")
	};
	callback = function( k, v ) {
		if ( seen[ label ] ) {
			delete seen[ label ];
			equal( k, "0", label + " treated like array" );
			return false;
		}
	};
	for ( i in seen ) {
		label = i;
		EhQuery.each( seen[ i ], callback );
	}

	seen = false;
	EhQuery.each( { length: 0 }, function( k, v ) {
		seen = true;
	});
	ok( !seen, "length: 0 plain object treated like array" );

	seen = false;
	EhQuery.each( document.getElementsByTagName("asdf"), function( k, v ) {
		seen = true;
	});
	ok( !seen, "empty NodeList treated like array" );

	i = 0;
	EhQuery.each( document.styleSheets, function() {
		i++;
	});
	equal( i, 2, "Iteration over document.styleSheets" );
});

test("EhQuery.makeArray", function(){
	expect(15);

	equal( EhQuery.makeArray(EhQuery("html>*"))[0].nodeName.toUpperCase(), "HEAD", "Pass makeArray a EhQuery object" );

	equal( EhQuery.makeArray(document.getElementsByName("PWD")).slice(0,1)[0].name, "PWD", "Pass makeArray a nodelist" );

	equal( (function(arg1, arg2){ return EhQuery.makeArray(arguments); })(1,2).join(""), "12", "Pass makeArray an arguments array" );

	equal( EhQuery.makeArray([1,2,3]).join(""), "123", "Pass makeArray a real array" );

	equal( EhQuery.makeArray().length, 0, "Pass nothing to makeArray and expect an empty array" );

	equal( EhQuery.makeArray( 0 )[0], 0 , "Pass makeArray a number" );

	equal( EhQuery.makeArray( "foo" )[0], "foo", "Pass makeArray a string" );

	equal( EhQuery.makeArray( true )[0].constructor, Boolean, "Pass makeArray a boolean" );

	equal( EhQuery.makeArray( document.createElement("div") )[0].nodeName.toUpperCase(), "DIV", "Pass makeArray a single node" );

	equal( EhQuery.makeArray( {length:2, 0:"a", 1:"b"} ).join(""), "ab", "Pass makeArray an array like map (with length)" );

	ok( !!EhQuery.makeArray( document.documentElement.childNodes ).slice(0,1)[0].nodeName, "Pass makeArray a childNodes array" );

	// function, is tricky as it has length
	equal( EhQuery.makeArray( function(){ return 1;} )[0](), 1, "Pass makeArray a function" );

	//window, also has length
	equal( EhQuery.makeArray(window)[0], window, "Pass makeArray the window" );

	equal( EhQuery.makeArray(/a/)[0].constructor, RegExp, "Pass makeArray a regex" );

	// Some nodes inherit traits of nodelists
	ok( EhQuery.makeArray(document.getElementById("form")).length >= 13,
		"Pass makeArray a form (treat as elements)" );
});

test("EhQuery.inArray", function(){
	expect(3);

	equal( EhQuery.inArray( 0, false ), -1 , "Search in 'false' as array returns -1 and doesn't throw exception" );

	equal( EhQuery.inArray( 0, null ), -1 , "Search in 'null' as array returns -1 and doesn't throw exception" );

	equal( EhQuery.inArray( 0, undefined ), -1 , "Search in 'undefined' as array returns -1 and doesn't throw exception" );
});

test("EhQuery.isEmptyObject", function(){
	expect(2);

	equal(true, EhQuery.isEmptyObject({}), "isEmptyObject on empty object literal" );
	equal(false, EhQuery.isEmptyObject({a:1}), "isEmptyObject on non-empty object literal" );

	// What about this ?
	// equal(true, EhQuery.isEmptyObject(null), "isEmptyObject on null" );
});

test("EhQuery.proxy", function(){
	expect( 9 );

	var test = function(){ equal( this, thisObject, "Make sure that scope is set properly." ); };
	var thisObject = { foo: "bar", method: test };

	// Make sure normal works
	test.call( thisObject );

	// Basic scoping
	EhQuery.proxy( test, thisObject )();

	// Another take on it
	EhQuery.proxy( thisObject, "method" )();

	// Make sure it doesn't freak out
	equal( EhQuery.proxy( null, thisObject ), undefined, "Make sure no function was returned." );

	// Partial application
	var test2 = function( a ){ equal( a, "pre-applied", "Ensure arguments can be pre-applied." ); };
	EhQuery.proxy( test2, null, "pre-applied" )();

	// Partial application w/ normal arguments
	var test3 = function( a, b ){ equal( b, "normal", "Ensure arguments can be pre-applied and passed as usual." ); };
	EhQuery.proxy( test3, null, "pre-applied" )( "normal" );

	// Test old syntax
	var test4 = { "meth": function( a ){ equal( a, "boom", "Ensure old syntax works." ); } };
	EhQuery.proxy( test4, "meth" )( "boom" );

	// EhQuery 1.9 improved currying with `this` object
	var fn = function() {
		equal( Array.prototype.join.call( arguments, "," ), "arg1,arg2,arg3", "args passed" );
		equal( this.foo, "bar", "this-object passed" );
	};
	var cb = EhQuery.proxy( fn, null, "arg1", "arg2" );
	cb.call( thisObject, "arg3" );
});

test("EhQuery.parseHTML", function() {
	expect( 17 );

	var html, nodes;

	equal( EhQuery.parseHTML(), null, "Nothing in, null out." );
	equal( EhQuery.parseHTML( null ), null, "Null in, null out." );
	equal( EhQuery.parseHTML( "" ), null, "Empty string in, null out." );
	raises(function() {
		EhQuery.parseHTML( "<div></div>", document.getElementById("form") );
	}, "Passing an element as the context raises an exception (context should be a document)");

	nodes = EhQuery.parseHTML( EhQuery("body")[0].innerHTML );
	ok( nodes.length > 4, "Parse a large html string" );
	equal( EhQuery.type( nodes ), "array", "parseHTML returns an array rather than a nodelist" );

	html = "<script>undefined()</script>";
	equal( EhQuery.parseHTML( html ).length, 0, "Ignore scripts by default" );
	equal( EhQuery.parseHTML( html, true )[0].nodeName.toLowerCase(), "script", "Preserve scripts when requested" );

	html += "<div></div>";
	equal( EhQuery.parseHTML( html )[0].nodeName.toLowerCase(), "div", "Preserve non-script nodes" );
	equal( EhQuery.parseHTML( html, true )[0].nodeName.toLowerCase(), "script", "Preserve script position");

	equal( EhQuery.parseHTML("text")[0].nodeType, 3, "Parsing text returns a text node" );
	equal( EhQuery.parseHTML( "\t<div></div>" )[0].nodeValue, "\t", "Preserve leading whitespace" );

	equal( EhQuery.parseHTML(" <div/> ")[0].nodeType, 3, "Leading spaces are treated as text nodes (#11290)" );

	html = EhQuery.parseHTML( "<div>test div</div>" );

	equal( html[ 0 ].parentNode.nodeType, 11, "parentNode should be documentFragment" );
	equal( html[ 0 ].innerHTML, "test div", "Content should be preserved" );

	equal( EhQuery.parseHTML("<span><span>").length, 1, "Incorrect html-strings should not break anything" );
	equal( EhQuery.parseHTML("<td><td>")[ 1 ].parentNode.nodeType, 11,
		"parentNode should be documentFragment for wrapMap (variable in manipulation module) elements too" );
});

test("EhQuery.parseJSON", function(){
	expect( 9 );

	equal( EhQuery.parseJSON( null ), null, "Actual null returns null" );
	equal( EhQuery.isEmptyObject( EhQuery.parseJSON("{}") ), true, "Empty object returns empty object" );
	deepEqual( EhQuery.parseJSON("{\"test\":1}"), { "test": 1 }, "Plain object parses" );
	deepEqual( EhQuery.parseJSON("\n{\"test\":1}"), { "test": 1 }, "Leading whitespaces are ignored." );
	raises(function() {
		EhQuery.parseJSON();
	}, null, "Undefined raises an error" );
	raises( function() {
		EhQuery.parseJSON( "" );
	}, null, "Empty string raises an error" );
	raises(function() {
		EhQuery.parseJSON("''");
	}, null, "Single-quoted string raises an error" );
	raises(function() {
		EhQuery.parseJSON("{a:1}");
	}, null, "Unquoted property raises an error" );
	raises(function() {
		EhQuery.parseJSON("{'a':1}");
	}, null, "Single-quoted property raises an error" );
});

test("EhQuery.parseXML", 8, function(){
	var xml, tmp;
	try {
		xml = EhQuery.parseXML( "<p>A <b>well-formed</b> xml string</p>" );
		tmp = xml.getElementsByTagName( "p" )[ 0 ];
		ok( !!tmp, "<p> present in document" );
		tmp = tmp.getElementsByTagName( "b" )[ 0 ];
		ok( !!tmp, "<b> present in document" );
		strictEqual( tmp.childNodes[ 0 ].nodeValue, "well-formed", "<b> text is as expected" );
	} catch (e) {
		strictEqual( e, undefined, "unexpected error" );
	}
	try {
		xml = EhQuery.parseXML( "<p>Not a <<b>well-formed</b> xml string</p>" );
		ok( false, "invalid xml not detected" );
	} catch( e ) {
		strictEqual( e.message, "Invalid XML: <p>Not a <<b>well-formed</b> xml string</p>", "invalid xml detected" );
	}
	try {
		xml = EhQuery.parseXML( "" );
		strictEqual( xml, null, "empty string => null document" );
		xml = EhQuery.parseXML();
		strictEqual( xml, null, "undefined string => null document" );
		xml = EhQuery.parseXML( null );
		strictEqual( xml, null, "null string => null document" );
		xml = EhQuery.parseXML( true );
		strictEqual( xml, null, "non-string => null document" );
	} catch( e ) {
		ok( false, "empty input throws exception" );
	}
});

test("EhQuery.camelCase()", function() {

	var tests = {
		"foo-bar": "fooBar",
		"foo-bar-baz": "fooBarBaz",
		"girl-u-want": "girlUWant",
		"the-4th-dimension": "the4thDimension",
		"-o-tannenbaum": "OTannenbaum",
		"-moz-illa": "MozIlla",
		"-ms-take": "msTake"
	};

	expect(7);

	EhQuery.each( tests, function( key, val ) {
		equal( EhQuery.camelCase( key ), val, "Converts: " + key + " => " + val );
	});
});
