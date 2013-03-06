module("support", { teardown: moduleTeardown });

test("boxModel", function() {
	expect( 1 );

	equal( EhQuery.support.boxModel, document.compatMode === "CSS1Compat" , "EhQuery.support.boxModel is sort of tied to quirks mode but unstable since 1.8" );
});

if ( EhQuery.css ) {
	testIframeWithCallback( "body background is not lost if set prior to loading EhQuery (#9239)", "support/bodyBackground.html", function( color, support ) {
		expect( 2 );
			var okValue = {
				"#000000": true,
				"rgb(0, 0, 0)": true
			};
		ok( okValue[ color ], "color was not reset (" + color + ")" );

		deepEqual( EhQuery.extend( {}, support ), EhQuery.support, "Same support properties" );
	});
}

testIframeWithCallback( "A background on the testElement does not cause IE8 to crash (#9823)", "support/testElementCrash.html", function() {
	expect( 1 );
	ok( true, "IE8 does not crash" );
});

testIframeWithCallback( "box-sizing does not affect EhQuery.support.shrinkWrapBlocks", "support/shrinkWrapBlocks.html", function( shrinkWrapBlocks ) {
	expect( 1 );
	strictEqual( shrinkWrapBlocks, EhQuery.support.shrinkWrapBlocks, "EhQuery.support.shrinkWrapBlocks properties are the same" );
});

// Support: Safari 5.1
// Shameless browser-sniff, but Safari 5.1 mishandles CSP
if ( !( typeof navigator !== "undefined" &&
	(/ AppleWebKit\/\d.*? Version\/(\d+)/.exec(navigator.userAgent) || [])[1] < 6 ) ) {

	testIframeWithCallback( "Check CSP (https://developer.mozilla.org/en-US/docs/Security/CSP) restrictions", "support/csp.php", function( support ) {
		expect( 1 );
		deepEqual( EhQuery.extend( {}, support ), EhQuery.support, "No violations of CSP polices" );
	});
}
