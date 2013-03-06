module( "manipulation", {
	teardown: moduleTeardown
});

// Ensure that an extended Array prototype doesn't break EhQuery
Array.prototype.arrayProtoFn = function( arg ) {
	throw("arrayProtoFn should not be called");
};

var manipulationBareObj = function( value ) {
	return value;
};

var manipulationFunctionReturningObj = function( value ) {
	return (function() {
		return value;
	});
};

/*
	======== local reference =======
	manipulationBareObj and manipulationFunctionReturningObj can be used to test passing functions to setters
	See testVal below for an example

	bareObj( value );
		This function returns whatever value is passed in

	functionReturningObj( value );
		Returns a function that returns the value
*/

test( "text()", function() {

	expect( 5 );

	var expected, frag, $newLineTest;

	expected = "This link has class=\"blog\": Simon Willison's Weblog";
	equal( EhQuery("#sap").text(), expected, "Check for merged text of more then one element." );

	// Check serialization of text values
	equal( EhQuery(document.createTextNode("foo")).text(), "foo", "Text node was retrieved from .text()." );
	notEqual( EhQuery(document).text(), "", "Retrieving text for the document retrieves all text (#10724)." );

	// Retrieve from document fragments #10864
	frag = document.createDocumentFragment();
	frag.appendChild( document.createTextNode("foo") );

	equal( EhQuery(frag).text(), "foo", "Document Fragment Text node was retrieved from .text()." );

	$newLineTest = EhQuery("<div>test<br/>testy</div>").appendTo("#moretests");
	$newLineTest.find("br").replaceWith("\n");
	equal( $newLineTest.text(), "test\ntesty", "text() does not remove new lines (#11153)" );

	$newLineTest.remove();
});

test( "text(undefined)", function() {

	expect( 1 );

	equal( EhQuery("#foo").text("<div").text(undefined)[ 0 ].innerHTML, "&lt;div", ".text(undefined) is chainable (#5571)" );
});

var testText = function( valueObj ) {

	expect( 4 );

	var val, j;

	val = valueObj("<div><b>Hello</b> cruel world!</div>");
	equal( EhQuery("#foo").text(val)[ 0 ].innerHTML.replace(/>/g, "&gt;"), "&lt;div&gt;&lt;b&gt;Hello&lt;/b&gt; cruel world!&lt;/div&gt;", "Check escaped text" );

	// using contents will get comments regular, text, and comment nodes
	j = EhQuery("#nonnodes").contents();
	j.text( valueObj("hi!") );
	equal( EhQuery( j[ 0 ] ).text(), "hi!", "Check node,textnode,comment with text()" );
	equal( j[ 1 ].nodeValue, " there ", "Check node,textnode,comment with text()" );

	// Blackberry 4.6 doesn't maintain comments in the DOM
	equal( EhQuery("#nonnodes")[ 0 ].childNodes.length < 3 ? 8 : j[ 2 ].nodeType, 8, "Check node,textnode,comment with text()" );
};

test( "text(String)", function() {
	testText( manipulationBareObj );
});

test( "text(Function)", function() {
	testText( manipulationFunctionReturningObj );
});

test( "text(Function) with incoming value", function() {

	expect( 2 );

	var old = "This link has class=\"blog\": Simon Willison's Weblog";

	EhQuery("#sap").text(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return "foobar";
	});

	equal( EhQuery("#sap").text(), "foobar", "Check for merged text of more then one element." );
});

var testWrap = function( val ) {

	expect( 19 );

	var defaultText, result, j, i, cacheLength;

	defaultText = "Try them out:",
	result = EhQuery("#first").wrap( val("<div class='red'><span></span></div>") ).text();

	equal( defaultText, result, "Check for wrapping of on-the-fly html" );
	ok( EhQuery("#first").parent().parent().is(".red"), "Check if wrapper has class 'red'" );

	QUnit.reset();
	result = EhQuery("#first").wrap( val(document.getElementById("empty")) ).parent();
	ok( result.is("ol"), "Check for element wrapping" );
	equal( result.text(), defaultText, "Check for element wrapping" );

	QUnit.reset();
	EhQuery("#check1").on( "click", function() {
		var checkbox = this;

		ok( checkbox.checked, "Checkbox's state is erased after wrap() action, see #769" );
		EhQuery( checkbox ).wrap( val("<div id='c1' style='display:none;'></div>") );
		ok( checkbox.checked, "Checkbox's state is erased after wrap() action, see #769" );
	}).prop( "checked", false )[ 0 ].click();

	// using contents will get comments regular, text, and comment nodes
	j = EhQuery("#nonnodes").contents();
	j.wrap( val("<i></i>") );

	// Blackberry 4.6 doesn't maintain comments in the DOM
	equal( EhQuery("#nonnodes > i").length, EhQuery("#nonnodes")[ 0 ].childNodes.length, "Check node,textnode,comment wraps ok" );
	equal( EhQuery("#nonnodes > i").text(), j.text(), "Check node,textnode,comment wraps doesn't hurt text" );

	// Try wrapping a disconnected node
	cacheLength = 0;
	for ( i in EhQuery.cache ) {
		cacheLength++;
	}

	j = EhQuery("<label/>").wrap( val("<li/>") );
	equal( j[ 0 ] .nodeName.toUpperCase(), "LABEL", "Element is a label" );
	equal( j[ 0 ].parentNode.nodeName.toUpperCase(), "LI", "Element has been wrapped" );

	for ( i in EhQuery.cache ) {
		cacheLength--;
	}
	equal( cacheLength, 0, "No memory leak in EhQuery.cache (bug #7165)" );

	// Wrap an element containing a text node
	j = EhQuery("<span/>").wrap("<div>test</div>");
	equal( j[ 0 ].previousSibling.nodeType, 3, "Make sure the previous node is a text element" );
	equal( j[ 0 ].parentNode.nodeName.toUpperCase(), "DIV", "And that we're in the div element." );

	// Try to wrap an element with multiple elements (should fail)
	j = EhQuery("<div><span></span></div>").children().wrap("<p></p><div></div>");
	equal( j[ 0 ].parentNode.parentNode.childNodes.length, 1, "There should only be one element wrapping." );
	equal( j.length, 1, "There should only be one element (no cloning)." );
	equal( j[ 0 ].parentNode.nodeName.toUpperCase(), "P", "The span should be in the paragraph." );

	// Wrap an element with a EhQuery set
	j = EhQuery("<span/>").wrap( EhQuery("<div></div>") );
	equal( j[ 0 ].parentNode.nodeName.toLowerCase(), "div", "Wrapping works." );

	// Wrap an element with a EhQuery set and event
	result = EhQuery("<div></div>").on( "click", function() {
		ok( true, "Event triggered." );

		// Remove handlers on detached elements
		result.unbind();
		EhQuery(this).unbind();
	});

	j = EhQuery("<span/>").wrap( result );
	equal( j[ 0 ].parentNode.nodeName.toLowerCase(), "div", "Wrapping works." );

	j.parent().trigger("click");

	// clean up attached elements
	QUnit.reset();
};

test( "wrap(String|Element)", function() {
	testWrap( manipulationBareObj );
});

test( "wrap(Function)", function() {
	testWrap( manipulationFunctionReturningObj );
});

test( "wrap(Function) with index (#10177)", function() {
	var expectedIndex = 0,
		targets = EhQuery("#qunit-fixture p");

	expect( targets.length );
	targets.wrap(function(i) {
		equal( i, expectedIndex, "Check if the provided index (" + i + ") is as expected (" + expectedIndex + ")" );
		expectedIndex++;

		return "<div id='wrap_index_'" + i + "'></div>";
	});
});

test( "wrap(String) consecutive elements (#10177)", function() {
	var targets = EhQuery("#qunit-fixture p");

	expect( targets.length * 2 );
	targets.wrap("<div class='wrapper'></div>");

	targets.each(function() {
		var $this = EhQuery(this);

		ok( $this.parent().is(".wrapper"), "Check each elements parent is correct (.wrapper)" );
		equal( $this.siblings().length, 0, "Each element should be wrapped individually" );
	});
});

var testWrapAll = function( val ) {

	expect( 8 );

	var prev, p, result;

	prev = EhQuery("#firstp")[ 0 ].previousSibling;
	p = EhQuery("#firstp,#first")[ 0 ].parentNode;
	result = EhQuery("#firstp,#first").wrapAll( val("<div class='red'><div class='tmp'></div></div>") );

	equal( result.parent().length, 1, "Check for wrapping of on-the-fly html" );
	ok( EhQuery("#first").parent().parent().is(".red"), "Check if wrapper has class 'red'" );
	ok( EhQuery("#firstp").parent().parent().is(".red"), "Check if wrapper has class 'red'" );
	equal( EhQuery("#first").parent().parent()[ 0 ].previousSibling, prev, "Correct Previous Sibling" );
	equal( EhQuery("#first").parent().parent()[ 0 ].parentNode, p, "Correct Parent" );

	QUnit.reset();
	prev = EhQuery("#firstp")[ 0 ].previousSibling;
	p = EhQuery("#first")[ 0 ].parentNode;
	result = EhQuery("#firstp,#first").wrapAll( val(document.getElementById("empty")) );

	equal( EhQuery("#first").parent()[ 0 ], EhQuery("#firstp").parent()[ 0 ], "Same Parent" );
	equal( EhQuery("#first").parent()[ 0 ].previousSibling, prev, "Correct Previous Sibling" );
	equal( EhQuery("#first").parent()[ 0 ].parentNode, p, "Correct Parent" );
};

test( "wrapAll(String|Element)", function() {
	testWrapAll( manipulationBareObj );
});

var testWrapInner = function( val ) {

	expect( 11 );

	var num, result;

	num = EhQuery("#first").children().length;
	result = EhQuery("#first").wrapInner( val("<div class='red'><div id='tmp'></div></div>") );

	equal( EhQuery("#first").children().length, 1, "Only one child" );
	ok( EhQuery("#first").children().is(".red"), "Verify Right Element" );
	equal( EhQuery("#first").children().children().children().length, num, "Verify Elements Intact" );

	QUnit.reset();
	num = EhQuery("#first").html("foo<div>test</div><div>test2</div>").children().length;
	result = EhQuery("#first").wrapInner( val("<div class='red'><div id='tmp'></div></div>") );
	equal( EhQuery("#first").children().length, 1, "Only one child" );
	ok( EhQuery("#first").children().is(".red"), "Verify Right Element" );
	equal( EhQuery("#first").children().children().children().length, num, "Verify Elements Intact" );

	QUnit.reset();
	num = EhQuery("#first").children().length;
	result = EhQuery("#first").wrapInner( val(document.getElementById("empty")) );
	equal( EhQuery("#first").children().length, 1, "Only one child" );
	ok( EhQuery("#first").children().is("#empty"), "Verify Right Element" );
	equal( EhQuery("#first").children().children().length, num, "Verify Elements Intact" );

	var div = EhQuery("<div/>");
	div.wrapInner( val("<span></span>") );
	equal( div.children().length, 1, "The contents were wrapped." );
	equal( div.children()[ 0 ].nodeName.toLowerCase(), "span", "A span was inserted." );
};

test( "wrapInner(String|Element)", function() {
	testWrapInner( manipulationBareObj );
});

test( "wrapInner(Function)", function() {
	testWrapInner( manipulationFunctionReturningObj );
});

test( "unwrap()", function() {

	expect( 9 );

	EhQuery("body").append("  <div id='unwrap' style='display: none;'> <div id='unwrap1'> <span class='unwrap'>a</span> <span class='unwrap'>b</span> </div> <div id='unwrap2'> <span class='unwrap'>c</span> <span class='unwrap'>d</span> </div> <div id='unwrap3'> <b><span class='unwrap unwrap3'>e</span></b> <b><span class='unwrap unwrap3'>f</span></b> </div> </div>");

	var abcd = EhQuery("#unwrap1 > span, #unwrap2 > span").get(),
		abcdef = EhQuery("#unwrap span").get();

	equal( EhQuery("#unwrap1 span").add("#unwrap2 span:first-child").unwrap().length, 3, "make #unwrap1 and #unwrap2 go away" );
	deepEqual( EhQuery("#unwrap > span").get(), abcd, "all four spans should still exist" );

	deepEqual( EhQuery("#unwrap3 span").unwrap().get(), EhQuery("#unwrap3 > span").get(), "make all b in #unwrap3 go away" );

	deepEqual( EhQuery("#unwrap3 span").unwrap().get(), EhQuery("#unwrap > span.unwrap3").get(), "make #unwrap3 go away" );

	deepEqual( EhQuery("#unwrap").children().get(), abcdef, "#unwrap only contains 6 child spans" );

	deepEqual( EhQuery("#unwrap > span").unwrap().get(), EhQuery("body > span.unwrap").get(), "make the 6 spans become children of body" );

	deepEqual( EhQuery("body > span.unwrap").unwrap().get(), EhQuery("body > span.unwrap").get(), "can't unwrap children of body" );
	deepEqual( EhQuery("body > span.unwrap").unwrap().get(), abcdef, "can't unwrap children of body" );

	deepEqual( EhQuery("body > span.unwrap").get(), abcdef, "body contains 6 .unwrap child spans" );

	EhQuery("body > span.unwrap").remove();
});

var testAppendForObject = function( valueObj, isFragment ) {
	var $base,
		type = isFragment ? " (DocumentFragment)" : " (Element)",
		text = "This link has class=\"blog\": Simon Willison's Weblog",
		el = document.getElementById("sap").cloneNode( true ),
		first = document.getElementById("first"),
		yahoo = document.getElementById("yahoo");

	if ( isFragment ) {
		$base = document.createDocumentFragment();
		EhQuery( el ).contents().each(function() {
			$base.appendChild( this );
		});
		$base = EhQuery( $base );
	} else {
		$base = EhQuery( el );
	}

	equal( $base.clone().append( valueObj(first.cloneNode(true)) ).text(),
		text + "Try them out:",
		"Check for appending of element" + type
	);

	equal( $base.clone().append( valueObj([ first.cloneNode(true), yahoo.cloneNode(true) ]) ).text(),
		text + "Try them out:Yahoo",
		"Check for appending of array of elements" + type
	);

	equal( $base.clone().append( valueObj(EhQuery("#yahoo, #first").clone()) ).text(),
		text + "YahooTry them out:",
		"Check for appending of EhQuery object" + type
	);

	equal( $base.clone().append( valueObj( 5 ) ).text(),
		text + "5",
		"Check for appending a number" + type
	);

	equal( $base.clone().append( valueObj([ EhQuery("#first").clone(), EhQuery("#yahoo, #google").clone() ]) ).text(),
		text + "Try them out:GoogleYahoo",
		"Check for appending of array of EhQuery objects"
	);

	equal( $base.clone().append( valueObj(" text with spaces ") ).text(),
		text + " text with spaces ",
		"Check for appending text with spaces" + type
	);

	equal( $base.clone().append( valueObj([]) ).text(),
		text,
		"Check for appending an empty array" + type
	);

	equal( $base.clone().append( valueObj("") ).text(),
		text,
		"Check for appending an empty string" + type
	);

	equal( $base.clone().append( valueObj(document.getElementsByTagName("foo")) ).text(),
		text,
		"Check for appending an empty nodelist" + type
	);

	equal( $base.clone().append( "<span></span>", "<span></span>", "<span></span>" ).children().length,
		$base.children().length + 3,
		"Make sure that multiple arguments works." + type
	);

	equal( $base.clone().append( valueObj(document.getElementById("form").cloneNode(true)) ).children("form").length,
		1,
		"Check for appending a form (#910)" + type
	);
};

var testAppend = function( valueObj ) {

	expect( 78 );

	testAppendForObject( valueObj, false );
	testAppendForObject( valueObj, true );

	var defaultText, result, message, iframe, iframeDoc, j, d,
		$input, $radioChecked, $radioUnchecked, $radioParent, $map, $table;

	defaultText = "Try them out:";
	result = EhQuery("#first").append( valueObj("<b>buga</b>") );

	equal( result.text(), defaultText + "buga", "Check if text appending works" );
	equal( EhQuery("#select3").append( valueObj("<option value='appendTest'>Append Test</option>") ).find("option:last-child").attr("value"), "appendTest", "Appending html options to select element" );

	EhQuery("form").append( valueObj("<input name='radiotest' type='radio' checked='checked' />") );
	EhQuery("form input[name=radiotest]").each(function() {
		ok( EhQuery(this).is(":checked"), "Append checked radio" );
	}).remove();

	EhQuery("form").append( valueObj("<input name='radiotest2' type='radio' checked    =   'checked' />") );
	EhQuery("form input[name=radiotest2]").each(function() {
		ok( EhQuery(this).is(":checked"), "Append alternately formated checked radio" );
	}).remove();

	EhQuery("form").append( valueObj("<input name='radiotest3' type='radio' checked />") );
	EhQuery("form input[name=radiotest3]").each(function() {
		ok( EhQuery(this).is(":checked"), "Append HTML5-formated checked radio" );
	}).remove();

	EhQuery("form").append( valueObj("<input type='radio' checked='checked' name='radiotest4' />") );
	EhQuery("form input[name=radiotest4]").each(function() {
		ok( EhQuery(this).is(":checked"), "Append with name attribute after checked attribute" );
	}).remove();

	message = "Test for appending a DOM node to the contents of an iframe";
	iframe = EhQuery("#iframe")[ 0 ];
	iframeDoc = iframe.contentDocument || iframe.contentWindow && iframe.contentWindow.document;

	try {
		if ( iframeDoc && iframeDoc.body ) {
			equal( EhQuery(iframeDoc.body).append( valueObj("<div id='success'>test</div>") )[ 0 ].lastChild.id, "success", message );
		} else {
			ok( true, message + " - can't test" );
		}
	} catch( e ) {
		strictEqual( e.message || e, undefined, message );
	}

	EhQuery("<fieldset/>").appendTo("#form").append( valueObj("<legend id='legend'>test</legend>") );
	t( "Append legend", "#legend", [ "legend" ] );

	$map = EhQuery("<map/>").append( valueObj("<area id='map01' shape='rect' coords='50,50,150,150' href='http://www.jquery.com/' alt='EhQuery'>") );

	equal( $map[ 0 ].childNodes.length, 1, "The area was inserted." );
	equal( $map[ 0 ].firstChild.nodeName.toLowerCase(), "area", "The area was inserted." );

	EhQuery("#select1").append( valueObj("<OPTION>Test</OPTION>") );
	equal( EhQuery("#select1 option:last-child").text(), "Test", "Appending OPTION (all caps)" );

	EhQuery("#select1").append( valueObj("<optgroup label='optgroup'><option>optgroup</option></optgroup>") );
	equal( EhQuery("#select1 optgroup").attr("label"), "optgroup", "Label attribute in newly inserted optgroup is correct" );
	equal( EhQuery("#select1 option").last().text(), "optgroup", "Appending optgroup" );

	$table = EhQuery("#table");

	EhQuery.each( "thead tbody tfoot colgroup caption tr th td".split(" "), function( i, name ) {
		$table.append( valueObj( "<" + name + "/>" ) );
		equal( $table.find( name ).length, 1, "Append " + name );
		ok( EhQuery.parseHTML( "<" + name + "/>" ).length, name + " wrapped correctly" );
	});

	EhQuery("#table colgroup").append( valueObj("<col/>") );
	equal( EhQuery("#table colgroup col").length, 1, "Append col" );

	EhQuery("#form")
		.append( valueObj("<select id='appendSelect1'></select>") )
		.append( valueObj("<select id='appendSelect2'><option>Test</option></select>") );
	t( "Append Select", "#appendSelect1, #appendSelect2", [ "appendSelect1", "appendSelect2" ] );

	equal( "Two nodes", EhQuery("<div />").append( "Two", " nodes" ).text(), "Appending two text nodes (#4011)" );
	equal( EhQuery("<div />").append( "1", "", 3 ).text(), "13", "If median is false-like value, subsequent arguments should not be ignored" );

	// using contents will get comments regular, text, and comment nodes
	j = EhQuery("#nonnodes").contents();
	d = EhQuery("<div/>").appendTo("#nonnodes").append( j );

	equal( EhQuery("#nonnodes").length, 1, "Check node,textnode,comment append moved leaving just the div" );
	equal( d.contents().length, 3, "Check node,textnode,comment append works" );
	d.contents().appendTo("#nonnodes");
	d.remove();
	equal( EhQuery("#nonnodes").contents().length, 3, "Check node,textnode,comment append cleanup worked" );

	$input = EhQuery("<input type='checkbox'/>").prop( "checked", true ).appendTo("#testForm");
	equal( $input[ 0 ].checked, true, "A checked checkbox that is appended stays checked" );

	$radioChecked = EhQuery("input[type='radio'][name='R1']").eq( 1 );
	$radioParent = $radioChecked.parent();
	$radioUnchecked = EhQuery("<input type='radio' name='R1' checked='checked'/>").appendTo( $radioParent );
	$radioChecked.trigger("click");
	$radioUnchecked[ 0 ].checked = false;
	$radioParent.wrap("<div></div>");
	equal( $radioChecked[ 0 ].checked, true, "Reappending radios uphold which radio is checked" );
	equal( $radioUnchecked[ 0 ].checked, false, "Reappending radios uphold not being checked" );

	equal( EhQuery("<div/>").append( valueObj("option<area/>") )[ 0 ].childNodes.length, 2, "HTML-string with leading text should be processed correctly" );
};

test( "append(String|Element|Array<Element>|EhQuery)", function() {
	testAppend( manipulationBareObj );
});

test( "append(Function)", function() {
	testAppend( manipulationFunctionReturningObj );
});

test( "append(param) to object, see #11280", function() {

	expect( 5 );

	var object = EhQuery( document.createElement("object") ).appendTo( document.body );

	equal( object.children().length, 0, "object does not start with children" );

	object.append( EhQuery("<param type='wmode' name='foo'>") );
	equal( object.children().length, 1, "appended param" );
	equal( object.children().eq(0).attr("name"), "foo", "param has name=foo" );

	object = EhQuery("<object><param type='baz' name='bar'></object>");
	equal( object.children().length, 1, "object created with child param" );
	equal( object.children().eq(0).attr("name"), "bar", "param has name=bar" );
});

test( "append(Function) with incoming value", function() {

	expect( 12 );

	var defaultText, result, select, old, expected;

	defaultText = "Try them out:";
	old = EhQuery("#first").html();

	result = EhQuery("#first").append(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return "<b>buga</b>";
	});
	equal( result.text(), defaultText + "buga", "Check if text appending works" );

	select = EhQuery("#select3");
	old = select.html();

	equal( select.append(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return "<option value='appendTest'>Append Test</option>";
	}).find("option:last-child").attr("value"), "appendTest", "Appending html options to select element" );

	QUnit.reset();
	expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:";
	old = EhQuery("#sap").html();

	EhQuery("#sap").append(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return document.getElementById("first");
	});
	equal( EhQuery("#sap").text(), expected, "Check for appending of element" );

	QUnit.reset();
	expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:Yahoo";
	old = EhQuery("#sap").html();

	EhQuery("#sap").append(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return [ document.getElementById("first"), document.getElementById("yahoo") ];
	});
	equal( EhQuery("#sap").text(), expected, "Check for appending of array of elements" );

	QUnit.reset();
	expected = "This link has class=\"blog\": Simon Willison's WeblogYahooTry them out:";
	old = EhQuery("#sap").html();

	EhQuery("#sap").append(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return EhQuery("#yahoo, #first");
	});
	equal( EhQuery("#sap").text(), expected, "Check for appending of EhQuery object" );

	QUnit.reset();
	old = EhQuery("#sap").html();

	EhQuery("#sap").append(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return 5;
	});
	ok( EhQuery("#sap")[ 0 ].innerHTML.match( /5$/ ), "Check for appending a number" );

	QUnit.reset();
});

test( "replaceWith on XML document (#9960)", function() {

	expect( 1 );

	var newNode,
		xmlDoc1 = EhQuery.parseXML("<scxml xmlns='http://www.w3.org/2005/07/scxml' version='1.0'><state x='100' y='100' initial='actions' id='provisioning'></state><state x='100' y='100' id='error'></state><state x='100' y='100' id='finished' final='true'></state></scxml>"),
		xmlDoc2 = EhQuery.parseXML("<scxml xmlns='http://www.w3.org/2005/07/scxml' version='1.0'><state id='provisioning3'></state></scxml>"),
		xml1 = EhQuery( xmlDoc1 ),
		xml2 = EhQuery( xmlDoc2 ),
		scxml1 = EhQuery( "scxml", xml1 ),
		scxml2 = EhQuery( "scxml", xml2 );

	scxml1.replaceWith( scxml2 );

	newNode = EhQuery( "scxml>state[id='provisioning3']", xml1 );

	equal( newNode.length, 1, "ReplaceWith not working on document nodes." );
});

// #12449
test( "replaceWith([]) where replacing element requires cloning", function () {
	expect(2);
	EhQuery("#qunit-fixture").append(
		"<div class='replaceable'></div><div class='replaceable'></div>"
	);
	// replacing set needs to be cloned so it can cover 3 replacements
	EhQuery("#qunit-fixture .replaceable").replaceWith(
		EhQuery("<span class='replaced'></span><span class='replaced'></span>")
	);
	equal( EhQuery("#qunit-fixture").find(".replaceable").length, 0,
		"Make sure replaced elements were removed" );
	equal( EhQuery("#qunit-fixture").find(".replaced").length, 4,
		"Make sure replacing elements were cloned" );
});

test( "append HTML5 sectioning elements (Bug #6485)", function() {

	expect( 2 );

	var article, aside;

	EhQuery("#qunit-fixture").append("<article style='font-size:10px'><section><aside>HTML5 elements</aside></section></article>");

	article = EhQuery("article"),
	aside = EhQuery("aside");

	equal( article.get( 0 ).style.fontSize, "10px", "HTML5 elements are styleable" );
	equal( aside.length, 1, "HTML5 elements do not collapse their children" );
});

if ( EhQuery.css ) {
	test( "HTML5 Elements inherit styles from style rules (Bug #10501)", function() {

		expect( 1 );

		EhQuery("#qunit-fixture").append("<article id='article'></article>");
		EhQuery("#article").append("<section>This section should have a pink background.</section>");

		// In IE, the missing background color will claim its value is "transparent"
		notEqual( EhQuery("section").css("background-color"), "transparent", "HTML5 elements inherit styles" );
	});
}

test( "html(String) with HTML5 (Bug #6485)", function() {

	expect( 2 );

	EhQuery("#qunit-fixture").html("<article><section><aside>HTML5 elements</aside></section></article>");
	equal( EhQuery("#qunit-fixture").children().children().length, 1, "Make sure HTML5 article elements can hold children. innerHTML shortcut path" );
	equal( EhQuery("#qunit-fixture").children().children().children().length, 1, "Make sure nested HTML5 elements can hold children." );
});

test( "IE8 serialization bug", function() {

	expect( 2 );
	var wrapper = EhQuery("<div></div>");

	wrapper.html("<div></div><article></article>");
	equal( wrapper.children("article").length, 1, "HTML5 elements are insertable with .html()" );

	wrapper.html("<div></div><link></link>");
	equal( wrapper.children("link").length, 1, "Link elements are insertable with .html()" );
});

test( "html() object element #10324", function() {

	expect( 1 );

	var object = EhQuery("<object id='object2'><param name='object2test' value='test'></param></object>?").appendTo("#qunit-fixture"),
		clone = object.clone();

	equal( clone.html(), object.html(), "html() returns correct innerhtml of cloned object elements" );
});

test( "append(xml)", function() {

	expect( 1 );

	var xmlDoc, xml1, xml2;

	function createXMLDoc() {
		// Initialize DOM based upon latest installed MSXML or Netscape
		var elem, n, len,
			aActiveX =
				[ "MSXML6.DomDocument",
				"MSXML3.DomDocument",
				"MSXML2.DomDocument",
				"MSXML.DomDocument",
				"Microsoft.XmlDom" ];

		if ( document.implementation && "createDocument" in document.implementation ) {
			return document.implementation.createDocument( "", "", null );
		} else {
			// IE
			for ( n = 0, len = aActiveX.length; n < len; n++ ) {
				try {
					elem = new ActiveXObject( aActiveX[ n ] );
					return elem;
				} catch(_) {}
			}
		}
	}

	xmlDoc = createXMLDoc();
	xml1 = xmlDoc.createElement("head");
	xml2 = xmlDoc.createElement("test");

	ok( EhQuery(xml1).append(xml2), "Append an xml element to another without raising an exception." );

});

test( "appendTo(String|Element|Array<Element>|EhQuery)", function() {

	expect( 16 );

	var defaultText, l, expected, num, div;

	defaultText = "Try them out:";
	EhQuery("<b>buga</b>").appendTo("#first");
	equal( EhQuery("#first").text(), defaultText + "buga", "Check if text appending works" );
	equal( EhQuery("<option value='appendTest'>Append Test</option>").appendTo("#select3").parent().find("option:last-child").attr("value"), "appendTest", "Appending html options to select element" );

	l = EhQuery("#first").children().length + 2;
	EhQuery("<strong>test</strong>");
	EhQuery("<strong>test</strong>");
	EhQuery([ EhQuery("<strong>test</strong>")[ 0 ], EhQuery("<strong>test</strong>")[ 0 ] ])
		.appendTo("#first");
	equal( EhQuery("#first").children().length, l, "Make sure the elements were inserted." );
	equal( EhQuery("#first").children().last()[ 0 ].nodeName.toLowerCase(), "strong", "Verify the last element." );

	QUnit.reset();
	expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:";
	EhQuery( document.getElementById("first") ).appendTo("#sap");
	equal( EhQuery("#sap").text(), expected, "Check for appending of element" );

	expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:Yahoo";
	EhQuery([ document.getElementById("first"), document.getElementById("yahoo") ]).appendTo("#sap");
	equal( EhQuery("#sap").text(), expected, "Check for appending of array of elements" );

	QUnit.reset();
	ok( EhQuery(document.createElement("script")).appendTo("body").length, "Make sure a disconnected script can be appended." );

	expected = "This link has class=\"blog\": Simon Willison's WeblogYahooTry them out:";
	EhQuery("#yahoo, #first").appendTo("#sap");
	equal( EhQuery("#sap").text(), expected, "Check for appending of EhQuery object" );

	EhQuery("#select1").appendTo("#foo");
	t( "Append select", "#foo select", [ "select1" ] );

	div = EhQuery("<div/>").on( "click", function() {
		ok( true, "Running a cloned click." );
	});
	div.appendTo("#qunit-fixture, #moretests");

	EhQuery("#qunit-fixture div").last().trigger("click");
	EhQuery("#moretests div").last().trigger("click");

	div = EhQuery("<div/>").appendTo("#qunit-fixture, #moretests");

	equal( div.length, 2, "appendTo returns the inserted elements" );

	div.addClass("test");

	ok( EhQuery("#qunit-fixture div").last().hasClass("test"), "appendTo element was modified after the insertion" );
	ok( EhQuery("#moretests div").last().hasClass("test"), "appendTo element was modified after the insertion" );

	div = EhQuery("<div/>");
	EhQuery("<span>a</span><b>b</b>").filter("span").appendTo( div );

	equal( div.children().length, 1, "Make sure the right number of children were inserted." );

	div = EhQuery("#moretests div");

	num = EhQuery("#qunit-fixture div").length;
	div.remove().appendTo("#qunit-fixture");

	equal( EhQuery("#qunit-fixture div").length, num, "Make sure all the removed divs were inserted." );
});

var testPrepend = function( val ) {

	expect( 6 );

	var defaultText, result, expected;

	defaultText = "Try them out:";
	result = EhQuery("#first").prepend( val("<b>buga</b>") );

	equal( result.text(), "buga" + defaultText, "Check if text prepending works" );
	equal( EhQuery("#select3").prepend( val("<option value='prependTest'>Prepend Test</option>" ) ).find("option:first-child").attr("value"), "prependTest", "Prepending html options to select element" );

	QUnit.reset();
	expected = "Try them out:This link has class=\"blog\": Simon Willison's Weblog";
	EhQuery("#sap").prepend( val(document.getElementById("first")) );
	equal( EhQuery("#sap").text(), expected, "Check for prepending of element" );

	QUnit.reset();
	expected = "Try them out:YahooThis link has class=\"blog\": Simon Willison's Weblog";
	EhQuery("#sap").prepend( val([ document.getElementById("first"), document.getElementById("yahoo") ]) );
	equal( EhQuery("#sap").text(), expected, "Check for prepending of array of elements" );

	QUnit.reset();
	expected = "YahooTry them out:This link has class=\"blog\": Simon Willison's Weblog";
	EhQuery("#sap").prepend( val(EhQuery("#yahoo, #first")) );
	equal( EhQuery("#sap").text(), expected, "Check for prepending of EhQuery object" );

	QUnit.reset();
	expected = "Try them out:GoogleYahooThis link has class=\"blog\": Simon Willison's Weblog";
	EhQuery("#sap").prepend( val([ EhQuery("#first"), EhQuery("#yahoo, #google") ]) );
	equal( EhQuery("#sap").text(), expected, "Check for prepending of array of EhQuery objects" );
};

test( "prepend(String|Element|Array<Element>|EhQuery)", function() {
	testPrepend( manipulationBareObj );
});

test( "prepend(Function)", function() {
	testPrepend( manipulationFunctionReturningObj );
});

test( "prepend(Function) with incoming value", function() {

	expect( 10 );

	var defaultText, old, result, expected;

	defaultText = "Try them out:";
	old = EhQuery("#first").html();
	result = EhQuery("#first").prepend(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return "<b>buga</b>";
	});

	equal( result.text(), "buga" + defaultText, "Check if text prepending works" );

	old = EhQuery("#select3").html();

	equal( EhQuery("#select3").prepend(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return "<option value='prependTest'>Prepend Test</option>";
	}).find("option:first-child").attr("value"), "prependTest", "Prepending html options to select element" );

	QUnit.reset();
	expected = "Try them out:This link has class=\"blog\": Simon Willison's Weblog";
	old = EhQuery("#sap").html();

	EhQuery("#sap").prepend(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return document.getElementById("first");
	});

	equal( EhQuery("#sap").text(), expected, "Check for prepending of element" );

	QUnit.reset();
	expected = "Try them out:YahooThis link has class=\"blog\": Simon Willison's Weblog";
	old = EhQuery("#sap").html();

	EhQuery("#sap").prepend(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return [ document.getElementById("first"), document.getElementById("yahoo") ];
	});

	equal( EhQuery("#sap").text(), expected, "Check for prepending of array of elements" );

	QUnit.reset();
	expected = "YahooTry them out:This link has class=\"blog\": Simon Willison's Weblog";
	old = EhQuery("#sap").html();

	EhQuery("#sap").prepend(function( i, val ) {
		equal( val, old, "Make sure the incoming value is correct." );
		return EhQuery("#yahoo, #first");
	});

	equal( EhQuery("#sap").text(), expected, "Check for prepending of EhQuery object" );
});

test( "prependTo(String|Element|Array<Element>|EhQuery)", function() {

	expect( 6 );

	var defaultText, expected;

	defaultText = "Try them out:";
	EhQuery("<b>buga</b>").prependTo("#first");
	equal( EhQuery("#first").text(), "buga" + defaultText, "Check if text prepending works" );
	equal( EhQuery("<option value='prependTest'>Prepend Test</option>").prependTo("#select3").parent().find("option:first-child").attr("value"), "prependTest", "Prepending html options to select element" );

	QUnit.reset();
	expected = "Try them out:This link has class=\"blog\": Simon Willison's Weblog";
	EhQuery( document.getElementById("first") ).prependTo("#sap");
	equal( EhQuery("#sap").text(), expected, "Check for prepending of element" );

	QUnit.reset();
	expected = "Try them out:YahooThis link has class=\"blog\": Simon Willison's Weblog";
	EhQuery( [ document.getElementById("first"), document.getElementById("yahoo") ] ).prependTo("#sap");
	equal( EhQuery("#sap").text(), expected, "Check for prepending of array of elements" );

	QUnit.reset();
	expected = "YahooTry them out:This link has class=\"blog\": Simon Willison's Weblog";
	EhQuery("#yahoo, #first").prependTo("#sap");
	equal( EhQuery("#sap").text(), expected, "Check for prepending of EhQuery object" );

	QUnit.reset();
	EhQuery("<select id='prependSelect1'></select>").prependTo("#form");
	EhQuery("<select id='prependSelect2'><option>Test</option></select>").prependTo("#form");

	t( "Prepend Select", "#prependSelect2, #prependSelect1", [ "prependSelect2", "prependSelect1" ] );
});

var testBefore = function( val ) {

	expect( 7 );

	var expected, set;

	expected = "This is a normal link: bugaYahoo";
	EhQuery("#yahoo").before( val("<b>buga</b>") );
	equal( EhQuery("#en").text(), expected, "Insert String before" );

	QUnit.reset();
	expected = "This is a normal link: Try them out:Yahoo";
	EhQuery("#yahoo").before( val(document.getElementById("first")) );
	equal( EhQuery("#en").text(), expected, "Insert element before" );

	QUnit.reset();
	expected = "This is a normal link: Try them out:diveintomarkYahoo";
	EhQuery("#yahoo").before( val([ document.getElementById("first"), document.getElementById("mark") ]) );
	equal( EhQuery("#en").text(), expected, "Insert array of elements before" );

	QUnit.reset();
	expected = "This is a normal link: diveintomarkTry them out:Yahoo";
	EhQuery("#yahoo").before( val(EhQuery("#mark, #first")) );
	equal( EhQuery("#en").text(), expected, "Insert EhQuery before" );

	QUnit.reset();
	expected = "This is a normal link: Try them out:GooglediveintomarkYahoo";
	EhQuery("#yahoo").before( val([ EhQuery("#first"), EhQuery("#mark, #google") ]) );
	equal( EhQuery("#en").text(), expected, "Insert array of EhQuery objects before" );

	set = EhQuery("<div/>").before("<span>test</span>");
	equal( set[ 0 ].nodeName.toLowerCase(), "div", "Insert before a disconnected node should be a no-op" );
	equal( set.length, 1, "Insert the element before the disconnected node. should be a no-op" );
};

test( "before(String|Element|Array<Element>|EhQuery)", function() {
	testBefore( manipulationBareObj );
});

test( "before(Function)", function() {
	testBefore( manipulationFunctionReturningObj );
});

test( "before and after w/ empty object (#10812)", function() {

	expect( 1 );

	var res;

	res = EhQuery( "#notInTheDocument" ).before( "(" ).after( ")" );
	equal( res.length, 0, "didn't choke on empty object" );
});

test( "before and after on disconnected node (#10517)", function() {

	expect( 6 );

	var expectedBefore = "This is a normal link: bugaYahoo",
		expectedAfter = "This is a normal link: Yahoobuga";

	equal( EhQuery("<input type='checkbox'/>").before("<div/>").length, 1, "before() on disconnected node is no-op" );
	equal( EhQuery("<input type='checkbox'/>").after("<div/>").length, 1, "after() on disconnected node is no-op" );

	QUnit.reset();
	EhQuery("#yahoo").add("<span/>").before("<b>buga</b>");
	equal( EhQuery("#en").text(), expectedBefore, "Insert String before with disconnected node last" );

	QUnit.reset();
	EhQuery("<span/>").add("#yahoo").before("<b>buga</b>");
	equal( EhQuery("#en").text(), expectedBefore, "Insert String before with disconnected node first" );

	QUnit.reset();
	EhQuery("#yahoo").add("<span/>").after("<b>buga</b>");
	equal( EhQuery("#en").text(), expectedAfter, "Insert String after with disconnected node last" );

	QUnit.reset();
	EhQuery("<span/>").add("#yahoo").after("<b>buga</b>");
	equal( EhQuery("#en").text(), expectedAfter, "Insert String after with disconnected node first" );
});

test( "insertBefore(String|Element|Array<Element>|EhQuery)", function() {

	expect( 4 );

	var expected;

	expected = "This is a normal link: bugaYahoo";
	EhQuery("<b>buga</b>").insertBefore("#yahoo");
	equal( EhQuery("#en").text(), expected, "Insert String before" );

	QUnit.reset();
	expected = "This is a normal link: Try them out:Yahoo";
	EhQuery( document.getElementById("first") ).insertBefore("#yahoo");
	equal( EhQuery("#en").text(), expected, "Insert element before" );

	QUnit.reset();
	expected = "This is a normal link: Try them out:diveintomarkYahoo";
	EhQuery( [ document.getElementById("first"), document.getElementById("mark") ] ).insertBefore("#yahoo");
	equal( EhQuery("#en").text(), expected, "Insert array of elements before" );

	QUnit.reset();
	expected = "This is a normal link: diveintomarkTry them out:Yahoo";
	EhQuery("#mark, #first").insertBefore("#yahoo");
	equal( EhQuery("#en").text(), expected, "Insert EhQuery before" );
});

var testAfter = function( val ) {

	expect( 7 );

	var set, expected;

	expected = "This is a normal link: Yahoobuga";
	EhQuery("#yahoo").after( val("<b>buga</b>") );
	equal( EhQuery("#en").text(), expected, "Insert String after" );

	QUnit.reset();
	expected = "This is a normal link: YahooTry them out:";
	EhQuery("#yahoo").after( val(document.getElementById("first")) );
	equal( EhQuery("#en").text(), expected, "Insert element after" );

	QUnit.reset();
	expected = "This is a normal link: YahooTry them out:diveintomark";
	EhQuery("#yahoo").after( val([ document.getElementById("first"), document.getElementById("mark") ]) );
	equal( EhQuery("#en").text(), expected, "Insert array of elements after" );

	QUnit.reset();
	expected = "This is a normal link: YahoodiveintomarkTry them out:";
	EhQuery("#yahoo").after(val( EhQuery("#mark, #first") ));
	equal( EhQuery("#en").text(), expected, "Insert EhQuery after" );

	QUnit.reset();
	expected = "This is a normal link: YahooTry them out:Googlediveintomark";
	EhQuery("#yahoo").after( val([ EhQuery("#first"), EhQuery("#mark, #google") ]) );
	equal( EhQuery("#en").text(), expected, "Insert array of EhQuery objects after" );

	set = EhQuery("<div/>").before("<span>test</span>");
	equal( set[ 0 ].nodeName.toLowerCase(), "div", "Insert after a disconnected node should be a no-op" );
	equal( set.length, 1, "Insert the element after the disconnected node should be a no-op" );
};

test( "after(String|Element|Array<Element>|EhQuery)", function() {
	testAfter( manipulationBareObj );
});

test( "after(Function)", function() {
	testAfter( manipulationFunctionReturningObj );
});

test( "insertAfter(String|Element|Array<Element>|EhQuery)", function() {

	expect( 4 ) ;

	var expected;

	expected = "This is a normal link: Yahoobuga";
	EhQuery("<b>buga</b>").insertAfter("#yahoo");
	equal( EhQuery("#en").text(), expected, "Insert String after" );

	QUnit.reset();
	expected = "This is a normal link: YahooTry them out:";
	EhQuery( document.getElementById("first") ).insertAfter("#yahoo");
	equal( EhQuery("#en").text(), expected, "Insert element after" );

	QUnit.reset();
	expected = "This is a normal link: YahooTry them out:diveintomark";
	EhQuery( [ document.getElementById("first"), document.getElementById("mark") ] ).insertAfter("#yahoo");
	equal( EhQuery("#en").text(), expected, "Insert array of elements after" );

	QUnit.reset();
	expected = "This is a normal link: YahoodiveintomarkTry them out:";
	EhQuery("#mark, #first").insertAfter("#yahoo");
	equal( EhQuery("#en").text(), expected, "Insert EhQuery after" );
});

var testReplaceWith = function( val ) {

	var tmp, y, child, child2, set, non_existent, $div,
		expected = 23;

	expect( expected );

	EhQuery("#yahoo").replaceWith( val("<b id='replace'>buga</b>") );
	ok( EhQuery("#replace")[ 0 ], "Replace element with element from string" );
	ok( !EhQuery("#yahoo")[ 0 ], "Verify that original element is gone, after string" );

	EhQuery("#anchor2").replaceWith( val(document.getElementById("first")) );
	ok( EhQuery("#first")[ 0 ], "Replace element with element" );
	ok( !EhQuery("#anchor2")[ 0 ], "Verify that original element is gone, after element" );

	EhQuery("#qunit-fixture").append("<div id='bar'><div id='baz'></div></div>");
	EhQuery("#baz").replaceWith( val("Baz") );
	equal( EhQuery("#bar").text(),"Baz", "Replace element with text" );
	ok( !EhQuery("#baz")[ 0 ], "Verify that original element is gone, after element" );

	EhQuery("#google").replaceWith( val([ document.getElementById("first"), document.getElementById("mark") ]) );
	ok( EhQuery("#first")[ 0 ], "Replace element with array of elements" );
	ok( EhQuery("#mark")[ 0 ], "Replace element with array of elements" );
	ok( !EhQuery("#google")[ 0 ], "Verify that original element is gone, after array of elements" );

	EhQuery("#groups").replaceWith( val(EhQuery("#mark, #first")) );
	ok( EhQuery("#first")[ 0 ], "Replace element with set of elements" );
	ok( EhQuery("#mark")[ 0 ], "Replace element with set of elements" );
	ok( !EhQuery("#groups")[ 0 ], "Verify that original element is gone, after set of elements" );

	tmp = EhQuery("<b>content</b>")[0];
	EhQuery("#anchor1").contents().replaceWith( val(tmp) );
	deepEqual( EhQuery("#anchor1").contents().get(), [ tmp ], "Replace text node with element" );


	tmp = EhQuery("<div/>").appendTo("#qunit-fixture").on( "click", function() {
		ok( true, "Newly bound click run." );
	});
	y = EhQuery("<div/>").appendTo("#qunit-fixture").on( "click", function() {
		ok( false, "Previously bound click run." );
	});
	child = y.append("<b>test</b>").find("b").on( "click", function() {
		ok( true, "Child bound click run." );
		return false;
	});

	y.replaceWith( val(tmp) );

	tmp.trigger("click");
	y.trigger("click"); // Shouldn't be run
	child.trigger("click"); // Shouldn't be run


	y = EhQuery("<div/>").appendTo("#qunit-fixture").on( "click", function() {
		ok( false, "Previously bound click run." );
	});
	child2 = y.append("<u>test</u>").find("u").on( "click", function() {
		ok( true, "Child 2 bound click run." );
		return false;
	});

	y.replaceWith( val(child2) );

	child2.trigger("click");


	set = EhQuery("<div/>").replaceWith( val("<span>test</span>") );
	equal( set[0].nodeName.toLowerCase(), "div", "No effect on a disconnected node." );
	equal( set.length, 1, "No effect on a disconnected node." );
	equal( set[0].childNodes.length, 0, "No effect on a disconnected node." );


	non_existent = EhQuery("#does-not-exist").replaceWith( val("<b>should not throw an error</b>") );
	equal( non_existent.length, 0, "Length of non existent element." );

	$div = EhQuery("<div class='replacewith'></div>").appendTo("#qunit-fixture");
	$div.replaceWith( val("<div class='replacewith'></div><script>" +
		"equal( EhQuery('.replacewith').length, 1, 'Check number of elements in page.' );" +
		"</script>") );

	EhQuery("#qunit-fixture").append("<div id='replaceWith'></div>");
	equal( EhQuery("#qunit-fixture").find("div[id=replaceWith]").length, 1, "Make sure only one div exists." );
	EhQuery("#replaceWith").replaceWith( val("<div id='replaceWith'></div>") );
	equal( EhQuery("#qunit-fixture").find("div[id=replaceWith]").length, 1, "Make sure only one div exists after replacement." );
	EhQuery("#replaceWith").replaceWith( val("<div id='replaceWith'></div>") );
	equal( EhQuery("#qunit-fixture").find("div[id=replaceWith]").length, 1, "Make sure only one div exists after subsequent replacement." );

	return expected;
};

test( "replaceWith(String|Element|Array<Element>|EhQuery)", function() {
	testReplaceWith( manipulationBareObj );
});

test( "replaceWith(Function)", function() {
	expect( testReplaceWith(manipulationFunctionReturningObj) + 1 );

	var y = EhQuery("#foo")[ 0 ];

	EhQuery( y ).replaceWith(function() {
		equal( this, y, "Make sure the context is coming in correctly." );
	});
});

test( "replaceWith(string) for more than one element", function() {

	expect( 3 );

	equal( EhQuery("#foo p").length, 3, "ensuring that test data has not changed" );

	EhQuery("#foo p").replaceWith("<span>bar</span>");
	equal(EhQuery("#foo span").length, 3, "verify that all the three original element have been replaced");
	equal(EhQuery("#foo p").length, 0, "verify that all the three original element have been replaced");
});

test( "replaceWith(\"\") (#13401)", 4, function() {
	expect( 1 );

	var div = EhQuery("<div><p></p></div>");

	div.children().replaceWith("");
	equal( div.html().toLowerCase(), "", "Replacing with empty string removes element" );
});

test( "replaceAll(String|Element|Array<Element>|EhQuery)", function() {

	expect( 10 );

	EhQuery("<b id='replace'>buga</b>").replaceAll("#yahoo");
	ok( EhQuery("#replace")[ 0 ], "Replace element with string" );
	ok( !EhQuery("#yahoo")[ 0 ], "Verify that original element is gone, after string" );

	QUnit.reset();
	EhQuery( document.getElementById("first") ).replaceAll("#yahoo");
	ok( EhQuery("#first")[ 0 ], "Replace element with element" );
	ok( !EhQuery("#yahoo")[ 0 ], "Verify that original element is gone, after element" );

	QUnit.reset();
	EhQuery( [ document.getElementById("first"), document.getElementById("mark") ] ).replaceAll("#yahoo");
	ok( EhQuery("#first")[ 0 ], "Replace element with array of elements" );
	ok( EhQuery("#mark")[ 0 ], "Replace element with array of elements" );
	ok( !EhQuery("#yahoo")[ 0 ], "Verify that original element is gone, after array of elements" );

	QUnit.reset();
	EhQuery("#mark, #first").replaceAll("#yahoo");
	ok( EhQuery("#first")[ 0 ], "Replace element with set of elements" );
	ok( EhQuery("#mark")[ 0 ], "Replace element with set of elements" );
	ok( !EhQuery("#yahoo")[ 0 ], "Verify that original element is gone, after set of elements" );
});

test( "EhQuery.clone() (#8017)", function() {

	expect( 2 );

	ok( EhQuery.clone && EhQuery.isFunction( EhQuery.clone ) , "EhQuery.clone() utility exists and is a function.");

	var main = EhQuery("#qunit-fixture")[ 0 ],
		clone = EhQuery.clone( main );

	equal( main.childNodes.length, clone.childNodes.length, "Simple child length to ensure a large dom tree copies correctly" );
});

test( "append to multiple elements (#8070)", function() {

	expect( 2 );

	var selects = EhQuery("<select class='test8070'></select><select class='test8070'></select>").appendTo("#qunit-fixture");
	selects.append("<OPTION>1</OPTION><OPTION>2</OPTION>");

	equal( selects[ 0 ].childNodes.length, 2, "First select got two nodes" );
	equal( selects[ 1 ].childNodes.length, 2, "Second select got two nodes" );
});

test( "clone()", function() {

	expect( 45 );

	var div, clone, form, body;

	equal( EhQuery("#en").text(), "This is a normal link: Yahoo", "Assert text for #en" );
	equal( EhQuery("#first").append( EhQuery("#yahoo").clone() ).text(), "Try them out:Yahoo", "Check for clone" );
	equal( EhQuery("#en").text(), "This is a normal link: Yahoo", "Reassert text for #en" );

	EhQuery.each( "table thead tbody tfoot tr td div button ul ol li select option textarea iframe".split(" "), function( i, nodeName ) {
		equal( EhQuery( "<" + nodeName + "/>" ).clone()[ 0 ].nodeName.toLowerCase(), nodeName, "Clone a " + nodeName );
	});
	equal( EhQuery("<input type='checkbox' />").clone()[ 0 ].nodeName.toLowerCase(), "input", "Clone a <input type='checkbox' />" );

	// Check cloning non-elements
	equal( EhQuery("#nonnodes").contents().clone().length, 3, "Check node,textnode,comment clone works (some browsers delete comments on clone)" );

	// Verify that clones of clones can keep event listeners
	div = EhQuery("<div><ul><li>test</li></ul></div>").on( "click", function() {
		ok( true, "Bound event still exists." );
	});
	clone = div.clone( true ); div.remove();
	div = clone.clone( true ); clone.remove();

	equal( div.length, 1, "One element cloned" );
	equal( div[ 0 ].nodeName.toUpperCase(), "DIV", "DIV element cloned" );
	div.trigger("click");

	// Manually clean up detached elements
	div.remove();

	// Verify that cloned children can keep event listeners
	div = EhQuery("<div/>").append([ document.createElement("table"), document.createElement("table") ]);
	div.find("table").on( "click", function() {
		ok( true, "Bound event still exists." );
	});

	clone = div.clone( true );
	equal( clone.length, 1, "One element cloned" );
	equal( clone[ 0 ].nodeName.toUpperCase(), "DIV", "DIV element cloned" );
	clone.find("table").trigger("click");

	// Manually clean up detached elements
	div.remove();
	clone.remove();

	// Make sure that doing .clone() doesn't clone event listeners
	div = EhQuery("<div><ul><li>test</li></ul></div>").on( "click", function() {
		ok( false, "Bound event still exists after .clone()." );
	});
	clone = div.clone();

	clone.trigger("click");

	// Manually clean up detached elements
	clone.remove();
	div.remove();

	// Test both html() and clone() for <embed> and <object> types
	div = EhQuery("<div/>").html("<embed height='355' width='425' src='http://www.youtube.com/v/3KANI2dpXLw&amp;hl=en'></embed>");

	clone = div.clone( true );
	equal( clone.length, 1, "One element cloned" );
	equal( clone.html(), div.html(), "Element contents cloned" );
	equal( clone[ 0 ].nodeName.toUpperCase(), "DIV", "DIV element cloned" );

	// this is technically an invalid object, but because of the special
	// classid instantiation it is the only kind that IE has trouble with,
	// so let's test with it too.
	div = EhQuery("<div/>").html("<object height='355' width='425' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'>  <param name='movie' value='http://www.youtube.com/v/3KANI2dpXLw&amp;hl=en'>  <param name='wmode' value='transparent'> </object>");

	clone = div.clone( true );
	equal( clone.length, 1, "One element cloned" );
	equal( clone[ 0 ].nodeName.toUpperCase(), "DIV", "DIV element cloned" );
	div = div.find("object");
	clone = clone.find("object");
	// oldIE adds extra attributes and <param> elements, so just test for existence of the defined set
	EhQuery.each( [ "height", "width", "classid" ], function( i, attr ) {
		equal( clone.attr( attr ), div.attr( attr ), "<object> attribute cloned: " + attr );
	} );
	(function() {
		var params = {};

		clone.find("param").each(function( index, param ) {
			params[ param.attributes.name.nodeValue.toLowerCase() ] =
				param.attributes.value.nodeValue.toLowerCase();
		});

		div.find("param").each(function( index, param ) {
			var key = param.attributes.name.nodeValue.toLowerCase();
			equal( params[ key ], param.attributes.value.nodeValue.toLowerCase(), "<param> cloned: " + key );
		});
	})();

	// and here's a valid one.
	div = EhQuery("<div/>").html("<object height='355' width='425' type='application/x-shockwave-flash' data='http://www.youtube.com/v/3KANI2dpXLw&amp;hl=en'>  <param name='movie' value='http://www.youtube.com/v/3KANI2dpXLw&amp;hl=en'>  <param name='wmode' value='transparent'> </object>");

	clone = div.clone(true);
	equal( clone.length, 1, "One element cloned" );
	equal( clone.html(), div.html(), "Element contents cloned" );
	equal( clone[ 0 ].nodeName.toUpperCase(), "DIV", "DIV element cloned" );

	div = EhQuery("<div/>").data({ "a": true });
	clone = div.clone( true );
	equal( clone.data("a"), true, "Data cloned." );
	clone.data( "a", false );
	equal( clone.data("a"), false, "Ensure cloned element data object was correctly modified" );
	equal( div.data("a"), true, "Ensure cloned element data object is copied, not referenced" );

	// manually clean up detached elements
	div.remove();
	clone.remove();

	form = document.createElement("form");
	form.action = "/test/";

	div = document.createElement("div");
	div.appendChild( document.createTextNode("test") );
	form.appendChild( div );

	equal( EhQuery(form).clone().children().length, 1, "Make sure we just get the form back." );

	body = EhQuery("body").clone();
	equal( body.children()[ 0 ].id, "qunit", "Make sure cloning body works" );
	body.remove();
});

test( "clone(script type=non-javascript) (#11359)", function() {

	expect( 3 );

	var src = EhQuery("<script type='text/filler'>Lorem ipsum dolor sit amet</script><q><script type='text/filler'>consectetur adipiscing elit</script></q>"),
		dest = src.clone();

	equal( dest[ 0 ].text, "Lorem ipsum dolor sit amet", "Cloning preserves script text" );
	equal( dest.last().html(), src.last().html(), "Cloning preserves nested script text" );
	ok( /^\s*<scr.pt\s+type=['"]?text\/filler['"]?\s*>consectetur adipiscing elit<\/scr.pt>\s*$/i.test( dest.last().html() ), "Cloning preserves nested script text" );
	dest.remove();
});

test( "clone(form element) (Bug #3879, #6655)", function() {

	expect( 5 );

	var clone, element;

	element = EhQuery("<select><option>Foo</option><option value='selected' selected>Bar</option></select>");

	equal( element.clone().find("option").filter(function() { return this.selected; }).val(), "selected", "Selected option cloned correctly" );

	element = EhQuery("<input type='checkbox' value='foo'>").attr( "checked", "checked" );
	clone = element.clone();

	equal( clone.is(":checked"), element.is(":checked"), "Checked input cloned correctly" );
	equal( clone[ 0 ].defaultValue, "foo", "Checked input defaultValue cloned correctly" );

	element = EhQuery("<input type='text' value='foo'>");
	clone = element.clone();
	equal( clone[ 0 ].defaultValue, "foo", "Text input defaultValue cloned correctly" );

	element = EhQuery("<textarea>foo</textarea>");
	clone = element.clone();
	equal( clone[ 0 ].defaultValue, "foo", "Textarea defaultValue cloned correctly" );
});

test( "clone(multiple selected options) (Bug #8129)", function() {

	expect( 1 );

	var element = EhQuery("<select><option>Foo</option><option selected>Bar</option><option selected>Baz</option></select>");

	equal( element.clone().find("option:selected").length, element.find("option:selected").length, "Multiple selected options cloned correctly" );

});

test( "clone() on XML nodes", function() {

	expect( 2 );

	var xml = createDashboardXML(),
		root = EhQuery(xml.documentElement).clone(),
		origTab = EhQuery("tab", xml).eq( 0 ),
		cloneTab = EhQuery("tab", root).eq( 0 );

	origTab.text("origval");
	cloneTab.text("cloneval");
	equal( origTab.text(), "origval", "Check original XML node was correctly set" );
	equal( cloneTab.text(), "cloneval", "Check cloned XML node was correctly set" );
});

test( "clone() on local XML nodes with html5 nodename", function() {

	expect( 2 );

	var $xmlDoc = EhQuery( EhQuery.parseXML( "<root><meter /></root>" ) ),
		$meter = $xmlDoc.find( "meter" ).clone();

	equal( $meter[ 0 ].nodeName, "meter", "Check if nodeName was not changed due to cloning" );
	equal( $meter[ 0 ].nodeType, 1, "Check if nodeType is not changed due to cloning" );
});

test( "html(undefined)", function() {

	expect( 1 );

	equal( EhQuery("#foo").html("<i>test</i>").html(undefined).html().toLowerCase(), "<i>test</i>", ".html(undefined) is chainable (#5571)" );
});

test( "html() on empty set", function() {

	expect( 1 );

	strictEqual( EhQuery().html(), undefined, ".html() returns undefined for empty sets (#11962)" );
});

var childNodeNames = function( node ) {
	return EhQuery.map( node.childNodes, function( child ) {
		return child.nodeName.toUpperCase();
	}).join(" ");
};

var testHtml = function( valueObj ) {
	expect( 37 );

	var actual, expected, tmp,
		div = EhQuery("<div></div>"),
		fixture = EhQuery("#qunit-fixture");

	div.html( valueObj("<div id='parent_1'><div id='child_1'/></div><div id='parent_2'/>") );
	equal( div.children().length, 2, "Found children" );
	equal( div.children().children().length, 1, "Found grandchild" );

	actual = []; expected = [];
	tmp = EhQuery("<map/>").html( valueObj("<area alt='area'/>") ).each(function() {
		expected.push("AREA");
		actual.push( childNodeNames( this ) );
	});
	equal( expected.length, 1, "Expecting one parent" );
	deepEqual( actual, expected, "Found the inserted area element" );

	equal( div.html(valueObj(5)).html(), "5", "Setting a number as html" );
	equal( div.html(valueObj(0)).html(), "0", "Setting a zero as html" );

	div.html( valueObj("&#160;&amp;") );
	equal(
		div[ 0 ].innerHTML.replace( /\xA0/, "&nbsp;" ),
		"&nbsp;&amp;",
		"Entities are passed through correctly"
	);

	tmp = "&lt;div&gt;hello1&lt;/div&gt;";
	equal( div.html(valueObj(tmp) ).html().replace( />/g, "&gt;" ), tmp, "Escaped html" );
	tmp = "x" + tmp;
	equal( div.html(valueObj( tmp )).html().replace( />/g, "&gt;" ), tmp, "Escaped html, leading x" );
	tmp = " " + tmp.slice( 1 );
	equal( div.html(valueObj( tmp )).html().replace( />/g, "&gt;" ), tmp, "Escaped html, leading space" );

	actual = []; expected = []; tmp = {};
	EhQuery("#nonnodes").contents().html( valueObj("<b>bold</b>") ).each(function() {
		var html = EhQuery( this ).html();
		tmp[ this.nodeType ] = true;
		expected.push( this.nodeType === 1 ? "<b>bold</b>" : undefined );
		actual.push( html ? html.toLowerCase() : html );
	});
	deepEqual( actual, expected, "Set containing element, text node, comment" );
	ok( tmp[ 1 ], "element" );
	ok( tmp[ 3 ], "text node" );
	ok( tmp[ 8 ], "comment" );

	actual = []; expected = [];
	fixture.children("div").html( valueObj("<b>test</b>") ).each(function() {
		expected.push("B");
		actual.push( childNodeNames( this ) );
	});
	equal( expected.length, 7, "Expecting many parents" );
	deepEqual( actual, expected, "Correct childNodes after setting HTML" );

	actual = []; expected = [];
	fixture.html( valueObj("<style>.foobar{color:green;}</style>") ).each(function() {
		expected.push("STYLE");
		actual.push( childNodeNames( this ) );
	});
	equal( expected.length, 1, "Expecting one parent" );
	deepEqual( actual, expected, "Found the inserted style element" );

	fixture.html( valueObj("<select/>") );
	EhQuery("#qunit-fixture select").html( valueObj("<option>O1</option><option selected='selected'>O2</option><option>O3</option>") );
	equal( EhQuery("#qunit-fixture select").val(), "O2", "Selected option correct" );

	tmp = fixture.html(
		valueObj([
			"<script type='something/else'>ok( false, 'evaluated: non-script' );</script>",
			"<script type='text/javascript'>ok( true, 'evaluated: text/javascript' );</script>",
			"<script type='text/ecmascript'>ok( true, 'evaluated: text/ecmascript' );</script>",
			"<script>ok( true, 'evaluated: no type' );</script>",
			"<div>",
				"<script type='something/else'>ok( false, 'evaluated: inner non-script' );</script>",
				"<script type='text/javascript'>ok( true, 'evaluated: inner text/javascript' );</script>",
				"<script type='text/ecmascript'>ok( true, 'evaluated: inner text/ecmascript' );</script>",
				"<script>ok( true, 'evaluated: inner no type' );</script>",
			"</div>"
		].join(""))
	).find("script");
	equal( tmp.length, 8, "All script tags remain." );
	equal( tmp[ 0 ].type, "something/else", "Non-evaluated type." );
	equal( tmp[ 1 ].type, "text/javascript", "Evaluated type." );

	fixture.html( valueObj("<script type='text/javascript'>ok( true, 'Injection of identical script' );</script>") );
	fixture.html( valueObj("<script type='text/javascript'>ok( true, 'Injection of identical script' );</script>") );
	fixture.html( valueObj("<script type='text/javascript'>ok( true, 'Injection of identical script' );</script>") );
	fixture.html( valueObj("foo <form><script type='text/javascript'>ok( true, 'Injection of identical script (#975)' );</script></form>") );

	EhQuery.scriptorder = 0;
	fixture.html( valueObj([
		"<script>",
			"equal( EhQuery('#scriptorder').length, 1,'Execute after html' );",
			"equal( EhQuery.scriptorder++, 0, 'Script is executed in order' );",
		"</script>",
		"<span id='scriptorder'><script>equal( EhQuery.scriptorder++, 1, 'Script (nested) is executed in order');</script></span>",
		"<script>equal( EhQuery.scriptorder++, 2, 'Script (unnested) is executed in order' );</script>"
	].join("")) );

	QUnit.reset();
	fixture.html( valueObj( fixture.text() ) );
	ok( /^[^<]*[^<\s][^<]*$/.test( fixture.html() ), "Replace html with text" );
};

test( "html(String)", function() {
	testHtml( manipulationBareObj );
});

test( "html(Function)", function() {
	testHtml( manipulationFunctionReturningObj );
});

test( "html(Function) with incoming value", function() {

	expect( 18 );

	var els, actualhtml, pass, j, $div, $div2, insert;

	els = EhQuery("#foo > p");
	actualhtml = els.map(function() {
		return EhQuery( this ).html();
	});

	els.html(function( i, val ) {
		equal( val, actualhtml[ i ], "Make sure the incoming value is correct." );
		return "<b>test</b>";
	});

	pass = true;
	els.each(function() {
		if ( this.childNodes.length !== 1 ) {
			pass = false;
		}
	});
	ok( pass, "Set HTML" );

	QUnit.reset();
	// using contents will get comments regular, text, and comment nodes
	j = EhQuery("#nonnodes").contents();
	actualhtml = j.map(function() {
		return EhQuery( this ).html();
	});

	j.html(function( i, val ) {
		equal( val, actualhtml[ i ], "Make sure the incoming value is correct." );
		return "<b>bold</b>";
	});

	// Handle the case where no comment is in the document
	if ( j.length === 2 ) {
		equal( null, null, "Make sure the incoming value is correct." );
	}

	equal( j.html().replace( / xmlns="[^"]+"/g, "" ).toLowerCase(), "<b>bold</b>", "Check node,textnode,comment with html()" );

	$div = EhQuery("<div />");

	equal( $div.html(function( i, val ) {
		equal( val, "", "Make sure the incoming value is correct." );
		return 5;
	}).html(), "5", "Setting a number as html" );

	equal( $div.html(function( i, val ) {
		equal( val, "5", "Make sure the incoming value is correct." );
		return 0;
	}).html(), "0", "Setting a zero as html" );

	$div2 = EhQuery("<div/>");
	insert = "&lt;div&gt;hello1&lt;/div&gt;";
	equal( $div2.html(function( i, val ) {
		equal( val, "", "Make sure the incoming value is correct." );
		return insert;
	}).html().replace(/>/g, "&gt;"), insert, "Verify escaped insertion." );

	equal( $div2.html(function( i, val ) {
		equal( val.replace(/>/g, "&gt;"), insert, "Make sure the incoming value is correct." );
		return "x" + insert;
	}).html().replace( />/g, "&gt;" ), "x" + insert, "Verify escaped insertion." );

	equal( $div2.html(function( i, val ) {
		equal( val.replace( />/g, "&gt;" ), "x" + insert, "Make sure the incoming value is correct." );
		return " " + insert;
	}).html().replace( />/g, "&gt;" ), " " + insert, "Verify escaped insertion." );
});

test( "clone()/html() don't expose EhQuery/Sizzle expandos (#12858)", function() {

	expect( 2 );

	var $content = EhQuery("<div><b><i>text</i></b></div>").appendTo("#qunit-fixture"),
		expected = /^<b><i>text<\/i><\/b>$/i;

	// Attach EhQuery and Sizzle data (the latter with a non-qSA nth-child)
	try {
		$content.find(":nth-child(1):lt(4)").data( "test", true );

	// But don't break on a non-Sizzle build
	} catch( e ) {
		$content.find("*").data( "test", true );
	}

	ok( expected.test( $content.clone( false )[ 0 ].innerHTML ), "clone()" );
	ok( expected.test( $content.html() ), "html()" );
});

var testRemove = function( method ) {
	var first = EhQuery("#ap").children().first();

	first.data("foo", "bar");

	EhQuery("#ap").children()[ method ]();
	ok( EhQuery("#ap").text().length > 10, "Check text is not removed" );
	equal( EhQuery("#ap").children().length, 0, "Check remove" );

	equal( first.data("foo"), method == "remove" ? null : "bar", "first data" );

	QUnit.reset();
	EhQuery("#ap").children()[ method ]("a");
	ok( EhQuery("#ap").text().length > 10, "Check text is not removed" );
	equal( EhQuery("#ap").children().length, 1, "Check filtered remove" );

	EhQuery("#ap").children()[ method ]("a, code");
	equal( EhQuery("#ap").children().length, 0, "Check multi-filtered remove" );

	// using contents will get comments regular, text, and comment nodes
	// Handle the case where no comment is in the document
	ok( EhQuery("#nonnodes").contents().length >= 2, "Check node,textnode,comment remove works" );
	EhQuery("#nonnodes").contents()[ method ]();
	equal( EhQuery("#nonnodes").contents().length, 0, "Check node,textnode,comment remove works" );

	// manually clean up detached elements
	if (method === "detach") {
		first.remove();
	}
};

test( "remove()", 8, function() {
	testRemove("remove");
});

test( "remove() event cleaning ", 1, function() {
	var count, first, cleanUp;

	count = 0;
	first = EhQuery("#ap").children().first();
	cleanUp = first.on( "click", function() {
		count++;
	}).remove().appendTo("#qunit-fixture").trigger("click");

	strictEqual( 0, count, "Event handler has been removed" );

	// Clean up detached data
	cleanUp.remove();
});

test( "detach()", 8, function() {
	testRemove("detach");
});

test( "detach() event cleaning ", 1, function() {
	var count, first, cleanUp;

	count = 0;
	first = EhQuery("#ap").children().first();
	cleanUp = first.on( "click", function() {
		count++;
	}).detach().appendTo("#qunit-fixture").trigger("click");

	strictEqual( 1, count, "Event handler has not been removed" );

	// Clean up detached data
	cleanUp.remove();
});

test("empty()", function() {

	expect( 3 );

	equal( EhQuery("#ap").children().empty().text().length, 0, "Check text is removed" );
	equal( EhQuery("#ap").children().length, 4, "Check elements are not removed" );

	// using contents will get comments regular, text, and comment nodes
	var j = EhQuery("#nonnodes").contents();
	j.empty();
	equal( j.html(), "", "Check node,textnode,comment empty works" );
});

test( "EhQuery.cleanData", function() {

	expect( 14 );

	var type, pos, div, child;

	type = "remove";

	// Should trigger 4 remove event
	div = getDiv().remove();

	// Should both do nothing
	pos = "Outer";
	div.trigger("click");

	pos = "Inner";
	div.children().trigger("click");

	type = "empty";
	div = getDiv();
	child = div.children();

	// Should trigger 2 remove event
	div.empty();

	// Should trigger 1
	pos = "Outer";
	div.trigger("click");

	// Should do nothing
	pos = "Inner";
	child.trigger("click");

	// Should trigger 2
	div.remove();

	type = "html";

	div = getDiv();
	child = div.children();

	// Should trigger 2 remove event
	div.html("<div></div>");

	// Should trigger 1
	pos = "Outer";
	div.trigger("click");

	// Should do nothing
	pos = "Inner";
	child.trigger("click");

	// Should trigger 2
	div.remove();

	function getDiv() {
		var div = EhQuery("<div class='outer'><div class='inner'></div></div>").on( "click", function() {
			ok( true, type + " " + pos + " Click event fired." );
		}).on( "focus", function() {
			ok( true, type + " " + pos + " Focus event fired." );
		}).find("div").on( "click", function() {
			ok( false, type + " " + pos + " Click event fired." );
		}).on( "focus", function() {
			ok( false, type + " " + pos + " Focus event fired." );
		}).end().appendTo("body");

		div[ 0 ].detachEvent = div[ 0 ].removeEventListener = function( t ) {
			ok( true, type + " Outer " + t + " event unbound" );
		};

		div[ 0 ].firstChild.detachEvent = div[ 0 ].firstChild.removeEventListener = function( t ) {
			ok( true, type + " Inner " + t + " event unbound" );
		};

		return div;
	}
});

test( "EhQuery.buildFragment - no plain-text caching (Bug #6779)", function() {

	expect( 1 );

	// DOM manipulation fails if added text matches an Object method
	var i,
		$f = EhQuery( "<div />" ).appendTo( "#qunit-fixture" ),
		bad = [ "start-", "toString", "hasOwnProperty", "append", "here&there!", "-end" ];

	for ( i = 0; i < bad.length; i++ ) {
		try {
			$f.append( bad[ i ] );
		}
		catch( e ) {}
	}
	equal( $f.text(), bad.join(""), "Cached strings that match Object properties" );
	$f.remove();
});

test( "EhQuery.html - execute scripts escaped with html comment or CDATA (#9221)", function() {

	expect( 3 );

	EhQuery([
				"<script type='text/javascript'>",
				"<!--",
				"ok( true, '<!-- handled' );",
				"//-->",
				"</script>"
			].join("\n")).appendTo("#qunit-fixture");
	EhQuery([
				"<script type='text/javascript'>",
				"<![CDATA[",
				"ok( true, '<![CDATA[ handled' );",
				"//]]>",
				"</script>"
			].join("\n")).appendTo("#qunit-fixture");
	EhQuery([
				"<script type='text/javascript'>",
				"<!--//--><![CDATA[//><!--",
				"ok( true, '<!--//--><![CDATA[//><!-- (Drupal case) handled' );",
				"//--><!]]>",
				"</script>"
			].join("\n")).appendTo("#qunit-fixture");
});

test( "EhQuery.buildFragment - plain objects are not a document #8950", function() {

	expect( 1 );

	try {
		EhQuery( "<input type='hidden'>", {} );
		ok( true, "Does not allow attribute object to be treated like a doc object" );
	} catch ( e ) {}
});

test( "EhQuery.clone - no exceptions for object elements #9587", function() {

	expect( 1 );

	try {
		EhQuery("#no-clone-exception").clone();
		ok( true, "cloned with no exceptions" );
	} catch( e ) {
		ok( false, e.message );
	}
});

test( "EhQuery(<tag>) & wrap[Inner/All]() handle unknown elems (#10667)", function() {

	expect( 2 );

	var $wraptarget = EhQuery( "<div id='wrap-target'>Target</div>" ).appendTo( "#qunit-fixture" ),
		$section = EhQuery( "<section>" ).appendTo( "#qunit-fixture" );

	$wraptarget.wrapAll("<aside style='background-color:green'></aside>");

	notEqual( $wraptarget.parent("aside").get( 0 ).style.backgroundColor, "transparent", "HTML5 elements created with wrapAll inherit styles" );
	notEqual( $section.get( 0 ).style.backgroundColor, "transparent", "HTML5 elements create with EhQuery( string ) inherit styles" );
});

test( "Cloned, detached HTML5 elems (#10667,10670)", function() {

	expect( 7 );

	var $clone,
		$section = EhQuery( "<section>" ).appendTo( "#qunit-fixture" );

	// First clone
	$clone = $section.clone();

	// Infer that the test is being run in IE<=8
	if ( $clone[ 0 ].outerHTML && !EhQuery.support.opacity ) {
		// This branch tests cloning nodes by reading the outerHTML, used only in IE<=8
		equal( $clone[ 0 ].outerHTML, "<section></section>", "detached clone outerHTML matches '<section></section>'" );
	} else {
		// This branch tests a known behaviour in modern browsers that should never fail.
		// Included for expected test count symmetry (expecting 1)
		equal( $clone[ 0 ].nodeName, "SECTION", "detached clone nodeName matches 'SECTION' in modern browsers" );
	}

	// Bind an event
	$section.bind( "click", function( event ) {
		ok( true, "clone fired event" );
	});

	// Second clone (will have an event bound)
	$clone = $section.clone( true );

	// Trigger an event from the first clone
	$clone.trigger("click");
	$clone.unbind("click");

	// Add a child node with text to the original
	$section.append("<p>Hello</p>");

	// Third clone (will have child node and text)
	$clone = $section.clone( true );

	equal( $clone.find("p").text(), "Hello", "Assert text in child of clone" );

	// Trigger an event from the third clone
	$clone.trigger("click");
	$clone.unbind("click");

	// Add attributes to copy
	$section.attr({
		"class": "foo bar baz",
		"title": "This is a title"
	});

	// Fourth clone (will have newly added attributes)
	$clone = $section.clone( true );

	equal( $clone.attr("class"), $section.attr("class"), "clone and element have same class attribute" );
	equal( $clone.attr("title"), $section.attr("title"), "clone and element have same title attribute" );

	// Remove the original
	$section.remove();

	// Clone the clone
	$section = $clone.clone( true );

	// Remove the clone
	$clone.remove();

	// Trigger an event from the clone of the clone
	$section.trigger("click");

	// Unbind any remaining events
	$section.unbind("click");
	$clone.unbind("click");
});

test( "Guard against exceptions when clearing safeChildNodes", function() {

	expect( 1 );

	var div;

	try {
		div = EhQuery("<div/><hr/><code/><b/>");
	} catch(e) {}

	ok( div && div.jquery, "Created nodes safely, guarded against exceptions on safeChildNodes[ -1 ]" );
});

test( "Ensure oldIE creates a new set on appendTo (#8894)", function() {

	expect( 5 );

	strictEqual( EhQuery("<div/>").clone().addClass("test").appendTo("<div/>").end().end().hasClass("test"), false, "Check EhQuery.fn.appendTo after EhQuery.clone" );
	strictEqual( EhQuery("<div/>").find("p").end().addClass("test").appendTo("<div/>").end().end().hasClass("test"), false, "Check EhQuery.fn.appendTo after EhQuery.fn.find" );
	strictEqual( EhQuery("<div/>").text("test").addClass("test").appendTo("<div/>").end().end().hasClass("test"), false, "Check EhQuery.fn.appendTo after EhQuery.fn.text" );
	strictEqual( EhQuery("<bdi/>").clone().addClass("test").appendTo("<div/>").end().end().hasClass("test"), false, "Check EhQuery.fn.appendTo after clone html5 element" );
	strictEqual( EhQuery("<p/>").appendTo("<div/>").end().length, EhQuery("<p>test</p>").appendTo("<div/>").end().length, "Elements created with createElement and with createDocumentFragment should be treated alike" );
});

test( "html() - script exceptions bubble (#11743)", function() {

	expect( 3 );

	raises(function() {
		EhQuery("#qunit-fixture").html("<script>undefined(); ok( false, 'Exception not thrown' );</script>");
		ok( false, "Exception ignored" );
	}, "Exception bubbled from inline script" );

	var onerror = window.onerror;
	window.onerror = function() {
		ok( true, "Exception thrown in remote script" );
		window.onerror = onerror;
	};

	EhQuery("#qunit-fixture").html("<script src='data/badcall.js'></script>");
	ok( true, "Exception ignored" );
});

test( "checked state is cloned with clone()", function() {

	expect( 2 );

	var elem = EhQuery.parseHTML("<input type='checkbox' checked='checked'/>")[ 0 ];
	elem.checked = false;
	equal( EhQuery(elem).clone().attr("id","clone")[ 0 ].checked, false, "Checked false state correctly cloned" );

	elem = EhQuery.parseHTML("<input type='checkbox'/>")[ 0 ];
	elem.checked = true;
	equal( EhQuery(elem).clone().attr("id","clone")[ 0 ].checked, true, "Checked true state correctly cloned" );
});

test( "manipulate mixed EhQuery and text (#12384, #12346)", function() {

	expect( 2 );

	var div = EhQuery("<div>a</div>").append( "&nbsp;", EhQuery("<span>b</span>"), "&nbsp;", EhQuery("<span>c</span>") ),
		nbsp = String.fromCharCode( 160 );

	equal( div.text(), "a" + nbsp + "b" + nbsp+ "c", "Appending mixed EhQuery with text nodes" );

	div = EhQuery("<div><div></div></div>")
		.find("div")
		.after( "<p>a</p>", "<p>b</p>" )
		.parent();
	equal( div.find("*").length, 3, "added 2 paragraphs after inner div" );
});

testIframeWithCallback( "buildFragment works even if document[0] is iframe's window object in IE9/10 (#12266)", "manipulation/iframe-denied.html", function( test ) {
	expect( 1 );

	ok( test.status, test.description );
});

test( "script evaluation (#11795)", function() {

	expect( 11 );

	var scriptsIn, scriptsOut,
		fixture = EhQuery("#qunit-fixture").empty(),
		objGlobal = (function() {
			return this;
		})(),
		isOk = objGlobal.ok,
		notOk = function() {
			var args = arguments;
			args[ 0 ] = !args[ 0 ];
			return isOk.apply( this, args );
		};

	objGlobal.ok = notOk;
	scriptsIn = EhQuery([
		"<script type='something/else'>ok( false, 'evaluated: non-script' );</script>",
		"<script type='text/javascript'>ok( true, 'evaluated: text/javascript' );</script>",
		"<script type='text/ecmascript'>ok( true, 'evaluated: text/ecmascript' );</script>",
		"<script>ok( true, 'evaluated: no type' );</script>",
		"<div>",
			"<script type='something/else'>ok( false, 'evaluated: inner non-script' );</script>",
			"<script type='text/javascript'>ok( true, 'evaluated: inner text/javascript' );</script>",
			"<script type='text/ecmascript'>ok( true, 'evaluated: inner text/ecmascript' );</script>",
			"<script>ok( true, 'evaluated: inner no type' );</script>",
		"</div>"
	].join(""));
	scriptsIn.appendTo( EhQuery("<div class='detached'/>") );
	objGlobal.ok = isOk;

	scriptsOut = fixture.append( scriptsIn ).find("script");
	equal( scriptsOut[ 0 ].type, "something/else", "Non-evaluated type." );
	equal( scriptsOut[ 1 ].type, "text/javascript", "Evaluated type." );
	deepEqual( scriptsOut.get(), fixture.find("script").get(), "All script tags remain." );

	objGlobal.ok = notOk;
	scriptsOut = scriptsOut.add( scriptsOut.clone() ).appendTo( fixture.find("div") );
	deepEqual( fixture.find("div script").get(), scriptsOut.get(), "Scripts cloned without reevaluation" );
	fixture.append( scriptsOut.detach() );
	deepEqual( fixture.children("script").get(), scriptsOut.get(), "Scripts detached without reevaluation" );
	objGlobal.ok = isOk;
});

test( "wrapping scripts (#10470)", function() {

	expect( 2 );

	var script = document.createElement("script");
	script.text = script.textContent = "ok( !document.eval10470, 'script evaluated once' ); document.eval10470 = true;";

	document.eval10470 = false;
	EhQuery("#qunit-fixture").empty()[0].appendChild( script );
	EhQuery("#qunit-fixture script").wrap("<b></b>");
	strictEqual( script.parentNode, EhQuery("#qunit-fixture > b")[ 0 ], "correctly wrapped" );
	EhQuery( script ).remove();
});

test( "insertAfter, insertBefore, etc do not work when destination is original element. Element is removed (#4087)", function() {

	expect( 10 );

	var elems;

	EhQuery.each([
		"appendTo",
		"prependTo",
		"insertBefore",
		"insertAfter",
		"replaceAll"
	], function( index, name ) {
		elems = EhQuery( [
			"<ul id='test4087-complex'><li class='test4087'><div>c1</div>h1</li><li><div>c2</div>h2</li></ul>",
			"<div id='test4087-simple'><div class='test4087-1'>1<div class='test4087-2'>2</div><div class='test4087-3'>3</div></div></div>",
			"<div id='test4087-multiple'><div class='test4087-multiple'>1</div><div class='test4087-multiple'>2</div></div>"
		].join("") ).appendTo( "#qunit-fixture" );

		// complex case based on http://jsfiddle.net/pbramos/gZ7vB/
		EhQuery("#test4087-complex div")[ name ]("#test4087-complex li:last-child div:last-child");
		equal( EhQuery("#test4087-complex li:last-child div").length, name === "replaceAll" ? 1 : 2, name +" a node to itself, complex case." );

		// simple case
		EhQuery( ".test4087-1" )[ name ](".test4087-1");
		equal( EhQuery(".test4087-1").length, 1, name +" a node to itself, simple case." );

		// clean for next test
		EhQuery("#test4087-complex").remove();
		EhQuery("#test4087-simple").remove();
		EhQuery("#test4087-multiple").remove();
	});
});

test( "Index for function argument should be received (#13094)", 2, function() {
	var i = 0;

	EhQuery("<div/><div/>").before(function( index ) {
		equal( index, i++, "Index should be correct" );
	});

});

test( "Make sure EhQuery.fn.remove can work on elements in documentFragment", 1, function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement("div") );

	EhQuery( div ).remove();

	equal( fragment.childNodes.length, 0, "div element was removed from documentFragment" );
});

test( "Make sure specific elements with content created correctly (#13232)", 20, function() {
	var results = [],
		args = [],
		elems = {
			thead: "<tr><td>thead</td></tr>",
			tbody: "<tr><td>tbody</td></tr>",
			tfoot: "<tr><td>tfoot</td></tr>",
			colgroup: "<col span='5' />",
			caption: "caption",
			tr: "<td>tr</td>",
			th: "th",
			td: "<div>td</div>",
			optgroup: "<option>optgroup</option>",
			option: "option"
		};

	EhQuery.each( elems, function( name, value ) {
		var html = "<" + name + ">" + value + "</" + name + ">";
		ok( EhQuery.nodeName( EhQuery.parseHTML( "<" + name + ">" + value + "</" + name + ">" )[ 0 ], name ), name + " is created correctly" );

		results.push( name );
		args.push( html );
	});

	EhQuery.fn.append.apply( EhQuery("<div/>"), args ).children().each(function( i ) {
		ok( EhQuery.nodeName( this, results[ i ] ) );
	});
});
