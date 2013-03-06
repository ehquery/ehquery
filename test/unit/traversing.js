module("traversing", { teardown: moduleTeardown });

test( "find(String)", function() {
	expect( 1 );
	equal( EhQuery("#foo").find(".blogTest").text(), "Yahoo", "Basic selector" );
});

test( "find(String) under non-elements", function() {
	expect( 2 );

	var j = EhQuery("#nonnodes").contents();
	equal( j.find("div").length, 0, "Check node,textnode,comment to find zero divs" );
	equal( j.find("div").addBack().length, 3, "Check node,textnode,comment to find zero divs, but preserves pushStack" );
});

test( "find(leading combinator)", function() {
	expect( 4 );

	deepEqual( EhQuery("#qunit-fixture").find("> div").get(), q( "foo", "nothiddendiv", "moretests", "tabindex-tests", "liveHandlerOrder", "siblingTest", "fx-test-group" ), "find child elements" );
	deepEqual( EhQuery("#qunit-fixture").find("> #foo, > #moretests").get(), q( "foo", "moretests" ), "find child elements" );
	deepEqual( EhQuery("#qunit-fixture").find("> #foo > p").get(), q( "sndp", "en", "sap" ), "find child elements" );

	deepEqual( EhQuery("#siblingTest, #siblingfirst").find("+ *").get(), q( "siblingnext", "fx-test-group" ), "ensure document order" );
});

test( "find(node|EhQuery object)", function() {
	expect( 12 );

	var $foo = EhQuery("#foo"),
		$blog = EhQuery(".blogTest"),
		$first = EhQuery("#first"),
		$two = $blog.add( $first ),
		$fooTwo = $foo.add( $blog );

	equal( $foo.find( $blog ).text(), "Yahoo", "Find with blog EhQuery object" );
	equal( $foo.find( $blog[ 0 ] ).text(), "Yahoo", "Find with blog node" );
	equal( $foo.find( $first ).length, 0, "#first is not in #foo" );
	equal( $foo.find( $first[ 0 ]).length, 0, "#first not in #foo (node)" );
	ok( $foo.find( $two ).is(".blogTest"), "Find returns only nodes within #foo" );
	ok( $fooTwo.find( $blog ).is(".blogTest"), "Blog is part of the collection, but also within foo" );
	ok( $fooTwo.find( $blog[ 0 ] ).is(".blogTest"), "Blog is part of the collection, but also within foo(node)" );

	equal( $two.find( $foo ).length, 0, "Foo is not in two elements" );
	equal( $two.find( $foo[ 0 ] ).length, 0, "Foo is not in two elements(node)" );
	equal( $two.find( $first ).length, 0, "first is in the collection and not within two" );
	equal( $two.find( $first ).length, 0, "first is in the collection and not within two(node)" );

	equal( $two.find( $foo[ 0 ] ).addBack().length, 2, "find preserves the pushStack, see #12009" );
});

test("is(String|undefined)", function() {
	expect(23);
	ok( EhQuery("#form").is("form"), "Check for element: A form must be a form" );
	ok( !EhQuery("#form").is("div"), "Check for element: A form is not a div" );
	ok( EhQuery("#mark").is(".blog"), "Check for class: Expected class 'blog'" );
	ok( !EhQuery("#mark").is(".link"), "Check for class: Did not expect class 'link'" );
	ok( EhQuery("#simon").is(".blog.link"), "Check for multiple classes: Expected classes 'blog' and 'link'" );
	ok( !EhQuery("#simon").is(".blogTest"), "Check for multiple classes: Expected classes 'blog' and 'link', but not 'blogTest'" );
	ok( EhQuery("#en").is("[lang=\"en\"]"), "Check for attribute: Expected attribute lang to be 'en'" );
	ok( !EhQuery("#en").is("[lang=\"de\"]"), "Check for attribute: Expected attribute lang to be 'en', not 'de'" );
	ok( EhQuery("#text1").is("[type=\"text\"]"), "Check for attribute: Expected attribute type to be 'text'" );
	ok( !EhQuery("#text1").is("[type=\"radio\"]"), "Check for attribute: Expected attribute type to be 'text', not 'radio'" );
	ok( EhQuery("#text2").is(":disabled"), "Check for pseudoclass: Expected to be disabled" );
	ok( !EhQuery("#text1").is(":disabled"), "Check for pseudoclass: Expected not disabled" );
	ok( EhQuery("#radio2").is(":checked"), "Check for pseudoclass: Expected to be checked" );
	ok( !EhQuery("#radio1").is(":checked"), "Check for pseudoclass: Expected not checked" );

	ok( !EhQuery("#foo").is(0), "Expected false for an invalid expression - 0" );
	ok( !EhQuery("#foo").is(null), "Expected false for an invalid expression - null" );
	ok( !EhQuery("#foo").is(""), "Expected false for an invalid expression - \"\"" );
	ok( !EhQuery("#foo").is(undefined), "Expected false for an invalid expression - undefined" );
	ok( !EhQuery("#foo").is({ plain: "object" }), "Check passing invalid object" );

	// test is() with comma-separated expressions
	ok( EhQuery("#en").is("[lang=\"en\"],[lang=\"de\"]"), "Comma-separated; Check for lang attribute: Expect en or de" );
	ok( EhQuery("#en").is("[lang=\"de\"],[lang=\"en\"]"), "Comma-separated; Check for lang attribute: Expect en or de" );
	ok( EhQuery("#en").is("[lang=\"en\"] , [lang=\"de\"]"), "Comma-separated; Check for lang attribute: Expect en or de" );
	ok( EhQuery("#en").is("[lang=\"de\"] , [lang=\"en\"]"), "Comma-separated; Check for lang attribute: Expect en or de" );
});

test("is() against window|document (#10178)", function() {
	expect(2);
	ok( !EhQuery(window).is("a"), "Checking is on a window does not throw an exception" );
	ok( !EhQuery(document).is("a"), "Checking is on a document does not throw an exception" );
});

test("is(EhQuery)", function() {
	expect(19);
	ok( EhQuery("#form").is( EhQuery("form") ), "Check for element: A form is a form" );
	ok( !EhQuery("#form").is( EhQuery("div") ), "Check for element: A form is not a div" );
	ok( EhQuery("#mark").is( EhQuery(".blog") ), "Check for class: Expected class 'blog'" );
	ok( !EhQuery("#mark").is( EhQuery(".link") ), "Check for class: Did not expect class 'link'" );
	ok( EhQuery("#simon").is( EhQuery(".blog.link") ), "Check for multiple classes: Expected classes 'blog' and 'link'" );
	ok( !EhQuery("#simon").is( EhQuery(".blogTest") ), "Check for multiple classes: Expected classes 'blog' and 'link', but not 'blogTest'" );
	ok( EhQuery("#en").is( EhQuery("[lang=\"en\"]") ), "Check for attribute: Expected attribute lang to be 'en'" );
	ok( !EhQuery("#en").is( EhQuery("[lang=\"de\"]") ), "Check for attribute: Expected attribute lang to be 'en', not 'de'" );
	ok( EhQuery("#text1").is( EhQuery("[type=\"text\"]") ), "Check for attribute: Expected attribute type to be 'text'" );
	ok( !EhQuery("#text1").is( EhQuery("[type=\"radio\"]") ), "Check for attribute: Expected attribute type to be 'text', not 'radio'" );
	ok( !EhQuery("#text1").is( EhQuery("input:disabled") ), "Check for pseudoclass: Expected not disabled" );
	ok( EhQuery("#radio2").is( EhQuery("input:checked") ), "Check for pseudoclass: Expected to be checked" );
	ok( !EhQuery("#radio1").is( EhQuery("input:checked") ), "Check for pseudoclass: Expected not checked" );

	// Some raw elements
	ok( EhQuery("#form").is( EhQuery("form")[0] ), "Check for element: A form is a form" );
	ok( !EhQuery("#form").is( EhQuery("div")[0] ), "Check for element: A form is not a div" );
	ok( EhQuery("#mark").is( EhQuery(".blog")[0] ), "Check for class: Expected class 'blog'" );
	ok( !EhQuery("#mark").is( EhQuery(".link")[0] ), "Check for class: Did not expect class 'link'" );
	ok( EhQuery("#simon").is( EhQuery(".blog.link")[0] ), "Check for multiple classes: Expected classes 'blog' and 'link'" );
	ok( !EhQuery("#simon").is( EhQuery(".blogTest")[0] ), "Check for multiple classes: Expected classes 'blog' and 'link', but not 'blogTest'" );
});

test("is() with :has() selectors", function() {
	expect(6);

	ok( EhQuery("#foo").is(":has(p)"), "Check for child: Expected a child 'p' element" );
	ok( !EhQuery("#foo").is(":has(ul)"), "Check for child: Did not expect 'ul' element" );
	ok( EhQuery("#foo").is(":has(p):has(a):has(code)"), "Check for childs: Expected 'p', 'a' and 'code' child elements" );
	ok( !EhQuery("#foo").is(":has(p):has(a):has(code):has(ol)"), "Check for childs: Expected 'p', 'a' and 'code' child elements, but no 'ol'" );

	ok( EhQuery("#foo").is( EhQuery("div:has(p)") ), "Check for child: Expected a child 'p' element" );
	ok( !EhQuery("#foo").is( EhQuery("div:has(ul)") ), "Check for child: Did not expect 'ul' element" );
});

test("is() with positional selectors", function() {
	expect(24);

	var html = EhQuery(
				"<p id='posp'><a class='firsta' href='#'><em>first</em></a><a class='seconda' href='#'><b>test</b></a><em></em></p>"
			).appendTo( "#qunit-fixture" ),
		isit = function(sel, match, expect) {
			equal( EhQuery( sel ).is( match ), expect, "EhQuery('" + sel + "').is('" + match + "')" );
		};

	isit( "#posp", "#posp:first", true );
	isit( "#posp", "#posp:eq(2)", false );
	isit( "#posp", "#posp a:first", false );

	isit( "#posp .firsta", "#posp a:first", true );
	isit( "#posp .firsta", "#posp a:last", false );
	isit( "#posp .firsta", "#posp a:even", true );
	isit( "#posp .firsta", "#posp a:odd", false );
	isit( "#posp .firsta", "#posp a:eq(0)", true );
	isit( "#posp .firsta", "#posp a:eq(9)", false );
	isit( "#posp .firsta", "#posp em:eq(0)", false );
	isit( "#posp .firsta", "#posp em:first", false );
	isit( "#posp .firsta", "#posp:first", false );

	isit( "#posp .seconda", "#posp a:first", false );
	isit( "#posp .seconda", "#posp a:last", true );
	isit( "#posp .seconda", "#posp a:gt(0)", true );
	isit( "#posp .seconda", "#posp a:lt(5)", true );
	isit( "#posp .seconda", "#posp a:lt(1)", false );

	isit( "#posp em", "#posp a:eq(0) em", true );
	isit( "#posp em", "#posp a:lt(1) em", true );
	isit( "#posp em", "#posp a:gt(1) em", false );
	isit( "#posp em", "#posp a:first em", true );
	isit( "#posp em", "#posp a em:last", true );
	isit( "#posp em", "#posp a em:eq(2)", false );

	ok( EhQuery("#option1b").is("#select1 option:not(:first)"), "POS inside of :not() (#10970)" );
});

test("index()", function() {
	expect( 2 );

	equal( EhQuery("#text2").index(), 2, "Returns the index of a child amongst its siblings" );

	equal( EhQuery("<div/>").index(), -1, "Node without parent returns -1" );
});

test("index(Object|String|undefined)", function() {
	expect(16);

	var elements = EhQuery([window, document]),
		inputElements = EhQuery("#radio1,#radio2,#check1,#check2");

	// Passing a node
	equal( elements.index(window), 0, "Check for index of elements" );
	equal( elements.index(document), 1, "Check for index of elements" );
	equal( inputElements.index(document.getElementById("radio1")), 0, "Check for index of elements" );
	equal( inputElements.index(document.getElementById("radio2")), 1, "Check for index of elements" );
	equal( inputElements.index(document.getElementById("check1")), 2, "Check for index of elements" );
	equal( inputElements.index(document.getElementById("check2")), 3, "Check for index of elements" );
	equal( inputElements.index(window), -1, "Check for not found index" );
	equal( inputElements.index(document), -1, "Check for not found index" );

	// Passing a EhQuery object
	// enabled since [5500]
	equal( elements.index( elements ), 0, "Pass in a EhQuery object" );
	equal( elements.index( elements.eq(1) ), 1, "Pass in a EhQuery object" );
	equal( EhQuery("#form input[type='radio']").index( EhQuery("#radio2") ), 1, "Pass in a EhQuery object" );

	// Passing a selector or nothing
	// enabled since [6330]
	equal( EhQuery("#text2").index(), 2, "Check for index amongst siblings" );
	equal( EhQuery("#form").children().eq(4).index(), 4, "Check for index amongst siblings" );
	equal( EhQuery("#radio2").index("#form input[type='radio']") , 1, "Check for index within a selector" );
	equal( EhQuery("#form input[type='radio']").index( EhQuery("#radio2") ), 1, "Check for index within a selector" );
	equal( EhQuery("#radio2").index("#form input[type='text']") , -1, "Check for index not found within a selector" );
});

test("filter(Selector|undefined)", function() {
	expect(9);
	deepEqual( EhQuery("#form input").filter(":checked").get(), q("radio2", "check1"), "filter(String)" );
	deepEqual( EhQuery("p").filter("#ap, #sndp").get(), q("ap", "sndp"), "filter('String, String')" );
	deepEqual( EhQuery("p").filter("#ap,#sndp").get(), q("ap", "sndp"), "filter('String,String')" );

	deepEqual( EhQuery("p").filter(null).get(),      [], "filter(null) should return an empty EhQuery object");
	deepEqual( EhQuery("p").filter(undefined).get(), [], "filter(undefined) should return an empty EhQuery object");
	deepEqual( EhQuery("p").filter(0).get(),         [], "filter(0) should return an empty EhQuery object");
	deepEqual( EhQuery("p").filter("").get(),        [], "filter('') should return an empty EhQuery object");

	// using contents will get comments regular, text, and comment nodes
	var j = EhQuery("#nonnodes").contents();
	equal( j.filter("span").length, 1, "Check node,textnode,comment to filter the one span" );
	equal( j.filter("[name]").length, 0, "Check node,textnode,comment to filter the one span" );
});

test("filter(Function)", function() {
	expect(2);

	deepEqual( EhQuery("#qunit-fixture p").filter(function() {
		return !EhQuery("a", this).length;
	}).get(), q("sndp", "first"), "filter(Function)" );

	deepEqual( EhQuery("#qunit-fixture p").filter(function(i, elem) { return !EhQuery("a", elem).length; }).get(), q("sndp", "first"), "filter(Function) using arg" );
});

test("filter(Element)", function() {
	expect(1);

	var element = document.getElementById("text1");
	deepEqual( EhQuery("#form input").filter(element).get(), q("text1"), "filter(Element)" );
});

test("filter(Array)", function() {
	expect(1);

	var elements = [ document.getElementById("text1") ];
	deepEqual( EhQuery("#form input").filter(elements).get(), q("text1"), "filter(Element)" );
});

test("filter(EhQuery)", function() {
	expect(1);

	var elements = EhQuery("#text1");
	deepEqual( EhQuery("#form input").filter(elements).get(), q("text1"), "filter(Element)" );
});


test("filter() with positional selectors", function() {
	expect(19);

	var html = EhQuery( "" +
		"<p id='posp'>" +
			"<a class='firsta' href='#'>" +
				"<em>first</em>" +
			"</a>" +
			"<a class='seconda' href='#'>" +
				"<b>test</b>" +
			"</a>" +
			"<em></em>" +
		"</p>" ).appendTo( "#qunit-fixture" ),
		filterit = function(sel, filter, length) {
			equal( EhQuery( sel ).filter( filter ).length, length, "EhQuery( " + sel + " ).filter( " + filter + " )" );
		};

	filterit( "#posp", "#posp:first", 1);
	filterit( "#posp", "#posp:eq(2)", 0 );
	filterit( "#posp", "#posp a:first", 0 );

	// Keep in mind this is within the selection and
	// not in relation to other elements (.is() is a different story)
	filterit( "#posp .firsta", "#posp a:first", 1 );
	filterit( "#posp .firsta", "#posp a:last", 1 );
	filterit( "#posp .firsta", "#posp a:last-child", 0 );
	filterit( "#posp .firsta", "#posp a:even", 1 );
	filterit( "#posp .firsta", "#posp a:odd", 0 );
	filterit( "#posp .firsta", "#posp a:eq(0)", 1 );
	filterit( "#posp .firsta", "#posp a:eq(9)", 0 );
	filterit( "#posp .firsta", "#posp em:eq(0)", 0 );
	filterit( "#posp .firsta", "#posp em:first", 0 );
	filterit( "#posp .firsta", "#posp:first", 0 );

	filterit( "#posp .seconda", "#posp a:first", 1 );
	filterit( "#posp .seconda", "#posp em:first", 0 );
	filterit( "#posp .seconda", "#posp a:last", 1 );
	filterit( "#posp .seconda", "#posp a:gt(0)", 0 );
	filterit( "#posp .seconda", "#posp a:lt(5)", 1 );
	filterit( "#posp .seconda", "#posp a:lt(1)", 1 );
});

test("closest()", function() {
	expect( 13 );

	var jq;

	deepEqual( EhQuery("body").closest("body").get(), q("body"), "closest(body)" );
	deepEqual( EhQuery("body").closest("html").get(), q("html"), "closest(html)" );
	deepEqual( EhQuery("body").closest("div").get(), [], "closest(div)" );
	deepEqual( EhQuery("#qunit-fixture").closest("span,#html").get(), q("html"), "closest(span,#html)" );

	// Test .closest() limited by the context
	jq = EhQuery("#nothiddendivchild");
	deepEqual( jq.closest("html", document.body).get(), [], "Context limited." );
	deepEqual( jq.closest("body", document.body).get(), [], "Context limited." );
	deepEqual( jq.closest("#nothiddendiv", document.body).get(), q("nothiddendiv"), "Context not reached." );

	//Test that .closest() returns unique'd set
	equal( EhQuery("#qunit-fixture p").closest("#qunit-fixture").length, 1, "Closest should return a unique set" );

	// Test on disconnected node
	equal( EhQuery("<div><p></p></div>").find("p").closest("table").length, 0, "Make sure disconnected closest work." );

	// Bug #7369
	equal( EhQuery("<div foo='bar'></div>").closest("[foo]").length, 1, "Disconnected nodes with attribute selector" );
	equal( EhQuery("<div>text</div>").closest("[lang]").length, 0, "Disconnected nodes with text and non-existent attribute selector" );

	ok( !EhQuery(document).closest("#foo").length, "Calling closest on a document fails silently" );

	jq = EhQuery("<div>text</div>");
	deepEqual( jq.contents().closest("*").get(), jq.get(), "Text node input (#13332)" );
});

test("closest() with positional selectors", function() {
	expect( 2 );

	deepEqual( EhQuery("#qunit-fixture").closest("div:first").get(), [], "closest(div:first)" );
	deepEqual( EhQuery("#qunit-fixture div").closest("body:first div:last").get(), q("fx-tests"), "closest(body:first div:last)" );
});

test("closest(EhQuery)", function() {
	expect(8);
	var $child = EhQuery("#nothiddendivchild"),
		$parent = EhQuery("#nothiddendiv"),
		$sibling = EhQuery("#foo"),
		$body = EhQuery("body");
	ok( $child.closest( $parent ).is("#nothiddendiv"), "closest( EhQuery('#nothiddendiv') )" );
	ok( $child.closest( $parent[0] ).is("#nothiddendiv"), "closest( EhQuery('#nothiddendiv') ) :: node" );
	ok( $child.closest( $child ).is("#nothiddendivchild"), "child is included" );
	ok( $child.closest( $child[0] ).is("#nothiddendivchild"), "child is included  :: node" );
	equal( $child.closest( document.createElement("div") ).length, 0, "created element is not related" );
	equal( $child.closest( $sibling ).length, 0, "Sibling not a parent of child" );
	equal( $child.closest( $sibling[0] ).length, 0, "Sibling not a parent of child :: node" );
	ok( $child.closest( $body.add($parent) ).is("#nothiddendiv"), "Closest ancestor retrieved." );
});

test("not(Selector|undefined)", function() {
	expect(11);
	equal( EhQuery("#qunit-fixture > p#ap > a").not("#google").length, 2, "not('selector')" );
	deepEqual( EhQuery("p").not(".result").get(), q("firstp", "ap", "sndp", "en", "sap", "first"), "not('.class')" );
	deepEqual( EhQuery("p").not("#ap, #sndp, .result").get(), q("firstp", "en", "sap", "first"), "not('selector, selector')" );

	deepEqual( EhQuery("#ap *").not("code").get(), q("google", "groups", "anchor1", "mark"), "not('tag selector')" );
	deepEqual( EhQuery("#ap *").not("code, #mark").get(), q("google", "groups", "anchor1"), "not('tag, ID selector')" );
	deepEqual( EhQuery("#ap *").not("#mark, code").get(), q("google", "groups", "anchor1"), "not('ID, tag selector')");

	var all = EhQuery("p").get();
	deepEqual( EhQuery("p").not(null).get(),      all, "not(null) should have no effect");
	deepEqual( EhQuery("p").not(undefined).get(), all, "not(undefined) should have no effect");
	deepEqual( EhQuery("p").not(0).get(),         all, "not(0) should have no effect");
	deepEqual( EhQuery("p").not("").get(),        all, "not('') should have no effect");

	deepEqual(
		EhQuery("#form option").not("option.emptyopt:contains('Nothing'),optgroup *,[value='1']").get(),
		q("option1c", "option1d", "option2c", "option2d", "option3c", "option3d", "option3e", "option4d", "option4e", "option5a", "option5b"),
		"not('complex selector')"
	);
});

test("not(Element)", function() {
	expect(1);

	var selects = EhQuery("#form select");
	deepEqual( selects.not( selects[1] ).get(), q("select1", "select3", "select4", "select5"), "filter out DOM element");
});

test("not(Function)", function() {
	expect(1);

	deepEqual( EhQuery("#qunit-fixture p").not(function() { return EhQuery("a", this).length; }).get(), q("sndp", "first"), "not(Function)" );
});

test("not(Array)", function() {
	expect(2);

	equal( EhQuery("#qunit-fixture > p#ap > a").not(document.getElementById("google")).length, 2, "not(DOMElement)" );
	equal( EhQuery("p").not(document.getElementsByTagName("p")).length, 0, "not(Array-like DOM collection)" );
});

test("not(EhQuery)", function() {
	expect( 1 );

	deepEqual( EhQuery("p").not(EhQuery("#ap, #sndp, .result")).get(), q("firstp", "en", "sap", "first"), "not(EhQuery)" );
});

test("has(Element)", function() {
	expect(3);

	var obj = EhQuery("#qunit-fixture").has(EhQuery("#sndp")[0]);
	deepEqual( obj.get(), q("qunit-fixture"), "Keeps elements that have the element as a descendant" );

	var detached = EhQuery("<a><b><i/></b></a>");
	deepEqual( detached.has( detached.find("i")[0] ).get(), detached.get(), "...Even when detached" );

	var multipleParent = EhQuery("#qunit-fixture, #header").has(EhQuery("#sndp")[0]);
	deepEqual( obj.get(), q("qunit-fixture"), "Does not include elements that do not have the element as a descendant" );
});

test("has(Selector)", function() {
	expect( 5 );

	var obj = EhQuery("#qunit-fixture").has("#sndp");
	deepEqual( obj.get(), q("qunit-fixture"), "Keeps elements that have any element matching the selector as a descendant" );

	var detached = EhQuery("<a><b><i/></b></a>");
	deepEqual( detached.has("i").get(), detached.get(), "...Even when detached" );

	var multipleParent = EhQuery("#qunit-fixture, #header").has("#sndp");
	deepEqual( multipleParent.get(), q("qunit-fixture"), "Does not include elements that do not have the element as a descendant" );

	multipleParent = EhQuery("#select1, #select2, #select3").has("#option1a, #option3a");
	deepEqual( multipleParent.get(), q("select1", "select3"), "Multiple contexts are checks correctly" );

	var multipleHas = EhQuery("#qunit-fixture").has("#sndp, #first");
	deepEqual( multipleHas.get(), q("qunit-fixture"), "Only adds elements once" );
});

test("has(Arrayish)", function() {
	expect(4);

	var simple = EhQuery("#qunit-fixture").has(EhQuery("#sndp"));
	deepEqual( simple.get(), q("qunit-fixture"), "Keeps elements that have any element in the EhQuery list as a descendant" );

	var detached = EhQuery("<a><b><i/></b></a>");
	deepEqual( detached.has( detached.find("i") ).get(), detached.get(), "...Even when detached" );

	var multipleParent = EhQuery("#qunit-fixture, #header").has(EhQuery("#sndp"));
	deepEqual( multipleParent.get(), q("qunit-fixture"), "Does not include elements that do not have an element in the EhQuery list as a descendant" );

	var multipleHas = EhQuery("#qunit-fixture").has(EhQuery("#sndp, #first"));
	deepEqual( simple.get(), q("qunit-fixture"), "Only adds elements once" );
});

test("addBack()", function() {
	expect(5);
	deepEqual( EhQuery("#en").siblings().addBack().get(), q("sndp", "en", "sap"), "Check for siblings and self" );
	deepEqual( EhQuery("#foo").children().addBack().get(), q("foo", "sndp", "en", "sap"), "Check for children and self" );
	deepEqual( EhQuery("#sndp, #en").parent().addBack().get(), q("foo","sndp","en"), "Check for parent and self" );
	deepEqual( EhQuery("#groups").parents("p, div").addBack().get(), q("qunit-fixture", "ap", "groups"), "Check for parents and self" );
	deepEqual( EhQuery("#select1 > option").filter(":first-child").addBack(":last-child").get(), q("option1a", "option1d"), "Should contain the last elems plus the *filtered* prior set elements" );
});

test("siblings([String])", function() {
	expect(6);
	deepEqual( EhQuery("#en").siblings().get(), q("sndp", "sap"), "Check for siblings" );
	deepEqual( EhQuery("#nonnodes").contents().eq(1).siblings().get(), q("nonnodesElement"), "Check for text node siblings" );
	deepEqual( EhQuery("#foo").siblings("form, b").get(), q("form", "floatTest", "lengthtest", "name-tests", "testForm"), "Check for multiple filters" );
	var set = q("sndp", "en", "sap");
	deepEqual( EhQuery("#en, #sndp").siblings().get(), set, "Check for unique results from siblings" );
	deepEqual( EhQuery("#option5a").siblings("option[data-attr]").get(), q("option5c"), "Has attribute selector in siblings (#9261)" );
	equal( EhQuery("<a/>").siblings().length, 0, "Detached elements have no siblings (#11370)" );
});

test("siblings([String]) - EhQuery only", function() {
	expect(2);
	deepEqual( EhQuery("#sndp").siblings(":has(code)").get(), q("sap"), "Check for filtered siblings (has code child element)" );
	deepEqual( EhQuery("#sndp").siblings(":has(a)").get(), q("en", "sap"), "Check for filtered siblings (has anchor child element)" );
});

test("children([String])", function() {
	expect(2);
	deepEqual( EhQuery("#foo").children().get(), q("sndp", "en", "sap"), "Check for children" );
	deepEqual( EhQuery("#foo").children("#en, #sap").get(), q("en", "sap"), "Check for multiple filters" );
});

test("children([String]) - EhQuery only", function() {
	expect(1);
	deepEqual( EhQuery("#foo").children(":has(code)").get(), q("sndp", "sap"), "Check for filtered children" );
});

test("parent([String])", function() {
	expect(6);

	var $el;

	equal( EhQuery("#groups").parent()[0].id, "ap", "Simple parent check" );
	equal( EhQuery("#groups").parent("p")[0].id, "ap", "Filtered parent check" );
	equal( EhQuery("#groups").parent("div").length, 0, "Filtered parent check, no match" );
	equal( EhQuery("#groups").parent("div, p")[0].id, "ap", "Check for multiple filters" );
	deepEqual( EhQuery("#en, #sndp").parent().get(), q("foo"), "Check for unique results from parent" );

	$el = EhQuery("<div>text</div>");
	deepEqual( $el.contents().parent().get(), $el.get(), "Check for parent of text node (#13265)" );
});

test("parents([String])", function() {
	expect(6);
	equal( EhQuery("#groups").parents()[0].id, "ap", "Simple parents check" );
	deepEqual( EhQuery("#nonnodes").contents().eq(1).parents().eq(0).get(), q("nonnodes"), "Text node parents check" );
	equal( EhQuery("#groups").parents("p")[0].id, "ap", "Filtered parents check" );
	equal( EhQuery("#groups").parents("div")[0].id, "qunit-fixture", "Filtered parents check2" );
	deepEqual( EhQuery("#groups").parents("p, div").get(), q("ap", "qunit-fixture"), "Check for multiple filters" );
	deepEqual( EhQuery("#en, #sndp").parents().get(), q("foo", "qunit-fixture", "dl", "body", "html"), "Check for unique results from parents" );
});

test("parentsUntil([String])", function() {
	expect(10);

	var parents = EhQuery("#groups").parents();

	deepEqual( EhQuery("#groups").parentsUntil().get(), parents.get(), "parentsUntil with no selector (nextAll)" );
	deepEqual( EhQuery("#groups").parentsUntil(".foo").get(), parents.get(), "parentsUntil with invalid selector (nextAll)" );
	deepEqual( EhQuery("#groups").parentsUntil("#html").get(), parents.slice(0, -1).get(), "Simple parentsUntil check" );
	equal( EhQuery("#groups").parentsUntil("#ap").length, 0, "Simple parentsUntil check" );
	deepEqual( EhQuery("#nonnodes").contents().eq(1).parentsUntil("#html").eq(0).get(), q("nonnodes"), "Text node parentsUntil check" );
	deepEqual( EhQuery("#groups").parentsUntil("#html, #body").get(), parents.slice( 0, 3 ).get(), "Less simple parentsUntil check" );
	deepEqual( EhQuery("#groups").parentsUntil("#html", "div").get(), EhQuery("#qunit-fixture").get(), "Filtered parentsUntil check" );
	deepEqual( EhQuery("#groups").parentsUntil("#html", "p,div,dl").get(), parents.slice( 0, 3 ).get(), "Multiple-filtered parentsUntil check" );
	equal( EhQuery("#groups").parentsUntil("#html", "span").length, 0, "Filtered parentsUntil check, no match" );
	deepEqual( EhQuery("#groups, #ap").parentsUntil("#html", "p,div,dl").get(), parents.slice( 0, 3 ).get(), "Multi-source, multiple-filtered parentsUntil check" );
});

test("next([String])", function() {
	expect(6);
	equal( EhQuery("#ap").next()[0].id, "foo", "Simple next check" );
	equal( EhQuery("<div>text<a id='element'></a></div>").contents().eq(0).next().attr("id"), "element", "Text node next check" );
	equal( EhQuery("#ap").next("div")[0].id, "foo", "Filtered next check" );
	equal( EhQuery("#ap").next("p").length, 0, "Filtered next check, no match" );
	equal( EhQuery("#ap").next("div, p")[0].id, "foo", "Multiple filters" );
	equal( EhQuery("body").next().length, 0, "Simple next check, no match" );
});

test("prev([String])", function() {
	expect(5);
	equal( EhQuery("#foo").prev()[0].id, "ap", "Simple prev check" );
	deepEqual( EhQuery("#nonnodes").contents().eq(1).prev().get(), q("nonnodesElement"), "Text node prev check" );
	equal( EhQuery("#foo").prev("p")[0].id, "ap", "Filtered prev check" );
	equal( EhQuery("#foo").prev("div").length, 0, "Filtered prev check, no match" );
	equal( EhQuery("#foo").prev("p, div")[0].id, "ap", "Multiple filters" );
});

test("nextAll([String])", function() {
	expect(5);

	var elems = EhQuery("#form").children();

	deepEqual( EhQuery("#label-for").nextAll().get(), elems.slice(1).get(), "Simple nextAll check" );
	equal( EhQuery("<div>text<a id='element'></a></div>").contents().eq(0).nextAll().attr("id"), "element", "Text node nextAll check" );
	deepEqual( EhQuery("#label-for").nextAll("input").get(), elems.slice(1).filter("input").get(), "Filtered nextAll check" );
	deepEqual( EhQuery("#label-for").nextAll("input,select").get(), elems.slice(1).filter("input,select").get(), "Multiple-filtered nextAll check" );
	deepEqual( EhQuery("#label-for, #hidden1").nextAll("input,select").get(), elems.slice(1).filter("input,select").get(), "Multi-source, multiple-filtered nextAll check" );
});

test("prevAll([String])", function() {
	expect(5);

	var elems = EhQuery( EhQuery("#form").children().slice(0, 12).get().reverse() );

	deepEqual( EhQuery("#area1").prevAll().get(), elems.get(), "Simple prevAll check" );
	deepEqual( EhQuery("#nonnodes").contents().eq(1).prevAll().get(), q("nonnodesElement"), "Text node prevAll check" );
	deepEqual( EhQuery("#area1").prevAll("input").get(), elems.filter("input").get(), "Filtered prevAll check" );
	deepEqual( EhQuery("#area1").prevAll("input,select").get(), elems.filter("input,select").get(), "Multiple-filtered prevAll check" );
	deepEqual( EhQuery("#area1, #hidden1").prevAll("input,select").get(), elems.filter("input,select").get(), "Multi-source, multiple-filtered prevAll check" );
});

test("nextUntil([String])", function() {
	expect(12);

	var elems = EhQuery("#form").children().slice( 2, 12 );

	deepEqual( EhQuery("#text1").nextUntil().get(), EhQuery("#text1").nextAll().get(), "nextUntil with no selector (nextAll)" );
	equal( EhQuery("<div>text<a id='element'></a></div>").contents().eq(0).nextUntil().attr("id"), "element", "Text node nextUntil with no selector (nextAll)" );
	deepEqual( EhQuery("#text1").nextUntil(".foo").get(), EhQuery("#text1").nextAll().get(), "nextUntil with invalid selector (nextAll)" );
	deepEqual( EhQuery("#text1").nextUntil("#area1").get(), elems.get(), "Simple nextUntil check" );
	equal( EhQuery("#text1").nextUntil("#text2").length, 0, "Simple nextUntil check" );
	deepEqual( EhQuery("#text1").nextUntil("#area1, #radio1").get(), EhQuery("#text1").next().get(), "Less simple nextUntil check" );
	deepEqual( EhQuery("#text1").nextUntil("#area1", "input").get(), elems.not("button").get(), "Filtered nextUntil check" );
	deepEqual( EhQuery("#text1").nextUntil("#area1", "button").get(), elems.not("input").get(), "Filtered nextUntil check" );
	deepEqual( EhQuery("#text1").nextUntil("#area1", "button,input").get(), elems.get(), "Multiple-filtered nextUntil check" );
	equal( EhQuery("#text1").nextUntil("#area1", "div").length, 0, "Filtered nextUntil check, no match" );
	deepEqual( EhQuery("#text1, #hidden1").nextUntil("#area1", "button,input").get(), elems.get(), "Multi-source, multiple-filtered nextUntil check" );

	deepEqual( EhQuery("#text1").nextUntil("[class=foo]").get(), EhQuery("#text1").nextAll().get(), "Non-element nodes must be skipped, since they have no attributes" );
});

test("prevUntil([String])", function() {
	expect(11);

	var elems = EhQuery("#area1").prevAll();

	deepEqual( EhQuery("#area1").prevUntil().get(), elems.get(), "prevUntil with no selector (prevAll)" );
	deepEqual( EhQuery("#nonnodes").contents().eq(1).prevUntil().get(), q("nonnodesElement"), "Text node prevUntil with no selector (prevAll)" );
	deepEqual( EhQuery("#area1").prevUntil(".foo").get(), elems.get(), "prevUntil with invalid selector (prevAll)" );
	deepEqual( EhQuery("#area1").prevUntil("label").get(), elems.slice(0, -1).get(), "Simple prevUntil check" );
	equal( EhQuery("#area1").prevUntil("#button").length, 0, "Simple prevUntil check" );
	deepEqual( EhQuery("#area1").prevUntil("label, #search").get(), EhQuery("#area1").prev().get(), "Less simple prevUntil check" );
	deepEqual( EhQuery("#area1").prevUntil("label", "input").get(), elems.slice(0, -1).not("button").get(), "Filtered prevUntil check" );
	deepEqual( EhQuery("#area1").prevUntil("label", "button").get(), elems.slice(0, -1).not("input").get(), "Filtered prevUntil check" );
	deepEqual( EhQuery("#area1").prevUntil("label", "button,input").get(), elems.slice(0, -1).get(), "Multiple-filtered prevUntil check" );
	equal( EhQuery("#area1").prevUntil("label", "div").length, 0, "Filtered prevUntil check, no match" );
	deepEqual( EhQuery("#area1, #hidden1").prevUntil("label", "button,input").get(), elems.slice(0, -1).get(), "Multi-source, multiple-filtered prevUntil check" );
});

test("contents()", function() {
	expect(12);
	equal( EhQuery("#ap").contents().length, 9, "Check element contents" );
	ok( EhQuery("#iframe").contents()[0], "Check existence of IFrame document" );
	var ibody = EhQuery("#loadediframe").contents()[0].body;
	ok( ibody, "Check existence of IFrame body" );

	equal( EhQuery("span", ibody).text(), "span text", "Find span in IFrame and check its text" );

	EhQuery(ibody).append("<div>init text</div>");
	equal( EhQuery("div", ibody).length, 2, "Check the original div and the new div are in IFrame" );

	equal( EhQuery("div", ibody).last().text(), "init text", "Add text to div in IFrame" );

	EhQuery("div", ibody).last().text("div text");
	equal( EhQuery("div", ibody).last().text(), "div text", "Add text to div in IFrame" );

	EhQuery("div", ibody).last().remove();
	equal( EhQuery("div", ibody).length, 1, "Delete the div and check only one div left in IFrame" );

	equal( EhQuery("div", ibody).text(), "span text", "Make sure the correct div is still left after deletion in IFrame" );

	EhQuery("<table/>", ibody).append("<tr><td>cell</td></tr>").appendTo(ibody);
	EhQuery("table", ibody).remove();
	equal( EhQuery("div", ibody).length, 1, "Check for JS error on add and delete of a table in IFrame" );

	// using contents will get comments regular, text, and comment nodes
	var c = EhQuery("#nonnodes").contents().contents();
	equal( c.length, 1, "Check node,textnode,comment contents is just one" );
	equal( c[0].nodeValue, "hi", "Check node,textnode,comment contents is just the one from span" );
});

test("add(String|Element|Array|undefined)", function() {
	expect( 15 );
	deepEqual( EhQuery("#sndp").add("#en").add("#sap").get(), q("sndp", "en", "sap"), "Check elements from document" );
	deepEqual( EhQuery("#sndp").add( EhQuery("#en")[0] ).add( EhQuery("#sap") ).get(), q("sndp", "en", "sap"), "Check elements from document" );

	// We no longer support .add(form.elements), unfortunately.
	// There is no way, in browsers, to reliably determine the difference
	// between form.elements and form - and doing .add(form) and having it
	// add the form elements is way to unexpected, so this gets the boot.
	// ok( EhQuery([]).add(EhQuery("#form")[0].elements).length >= 13, "Check elements from array" );

	// For the time being, we're discontinuing support for EhQuery(form.elements) since it's ambiguous in IE
	// use EhQuery([]).add(form.elements) instead.
	//equal( EhQuery([]).add(EhQuery("#form")[0].elements).length, EhQuery(EhQuery("#form")[0].elements).length, "Array in constructor must equals array in add()" );

	var divs = EhQuery("<div/>").add("#sndp");
	ok( divs[0].parentNode, "Sort with the disconnected node last (started with disconnected first)." );

	divs = EhQuery("#sndp").add("<div/>");
	ok( !divs[1].parentNode, "Sort with the disconnected node last." );

	var tmp = EhQuery("<div/>");

	var x = EhQuery([]).add(EhQuery("<p id='x1'>xxx</p>").appendTo(tmp)).add(EhQuery("<p id='x2'>xxx</p>").appendTo(tmp));
	equal( x[0].id, "x1", "Check on-the-fly element1" );
	equal( x[1].id, "x2", "Check on-the-fly element2" );

	x = EhQuery([]).add(EhQuery("<p id='x1'>xxx</p>").appendTo(tmp)[0]).add(EhQuery("<p id='x2'>xxx</p>").appendTo(tmp)[0]);
	equal( x[0].id, "x1", "Check on-the-fly element1" );
	equal( x[1].id, "x2", "Check on-the-fly element2" );

	x = EhQuery([]).add(EhQuery("<p id='x1'>xxx</p>")).add(EhQuery("<p id='x2'>xxx</p>"));
	equal( x[0].id, "x1", "Check on-the-fly element1" );
	equal( x[1].id, "x2", "Check on-the-fly element2" );

	x = EhQuery([]).add("<p id='x1'>xxx</p>").add("<p id='x2'>xxx</p>");
	equal( x[0].id, "x1", "Check on-the-fly element1" );
	equal( x[1].id, "x2", "Check on-the-fly element2" );

	var notDefined;
	equal( EhQuery([]).add(notDefined).length, 0, "Check that undefined adds nothing" );

	equal( EhQuery([]).add( document.getElementById("form") ).length, 1, "Add a form" );
	equal( EhQuery([]).add( document.getElementById("select1") ).length, 1, "Add a select" );
});

test("add(String, Context)", function() {
	expect(6);

	deepEqual( EhQuery( "#firstp" ).add( "#ap" ).get(), q( "firstp", "ap" ), "Add selector to selector " );
	deepEqual( EhQuery( document.getElementById("firstp") ).add( "#ap" ).get(), q( "firstp", "ap" ), "Add gEBId to selector" );
	deepEqual( EhQuery( document.getElementById("firstp") ).add( document.getElementById("ap") ).get(), q( "firstp", "ap" ), "Add gEBId to gEBId" );

	var ctx = document.getElementById("firstp");
	deepEqual( EhQuery( "#firstp" ).add( "#ap", ctx ).get(), q( "firstp" ), "Add selector to selector " );
	deepEqual( EhQuery( document.getElementById("firstp") ).add( "#ap", ctx ).get(), q( "firstp" ), "Add gEBId to selector, not in context" );
	deepEqual( EhQuery( document.getElementById("firstp") ).add( "#ap", document.getElementsByTagName("body")[0] ).get(), q( "firstp", "ap" ), "Add gEBId to selector, in context" );
});

test("eq('-1') #10616", function() {
	expect(3);
	var $divs = EhQuery( "div" );

	equal( $divs.eq( -1 ).length, 1, "The number -1 returns a selection that has length 1" );
	equal( $divs.eq( "-1" ).length, 1, "The string '-1' returns a selection that has length 1" );
	deepEqual( $divs.eq( "-1" ), $divs.eq( -1 ), "String and number -1 match" );
});

test("index(no arg) #10977", function() {
	expect(2);

	var $list = EhQuery("<ul id='indextest'><li class='zero'>THIS ONE</li><li class='one'>a</li><li class='two'>b</li><li class='three'>c</li></ul>");
	EhQuery("#qunit-fixture").append( $list );
	strictEqual ( EhQuery( "#indextest li.zero" ).first().index() , 0, "No Argument Index Check" );
	$list.remove();

	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement("div") );

	equal( EhQuery( div ).index(), 0, "If EhQuery#index called on element whose parent is fragment, it still should work correctly" );
});
