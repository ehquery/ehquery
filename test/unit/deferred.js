module( "deferred", {
	teardown: moduleTeardown
});

EhQuery.each( [ "", " - new operator" ], function( _, withNew ) {

	function createDeferred( fn ) {
		return withNew ? new EhQuery.Deferred( fn ) : EhQuery.Deferred( fn );
	}

	test( "EhQuery.Deferred" + withNew, function() {

		expect( 23 );

		var defer = createDeferred();

		strictEqual( defer.pipe, defer.then, "pipe is an alias of then" );

		createDeferred().resolve().done(function() {
			ok( true, "Success on resolve" );
			strictEqual( this.state(), "resolved", "Deferred is resolved (state)" );
		}).fail(function() {
			ok( false, "Error on resolve" );
		}).always(function() {
			ok( true, "Always callback on resolve" );
		});

		createDeferred().reject().done(function() {
			ok( false, "Success on reject" );
		}).fail(function() {
			ok( true, "Error on reject" );
			strictEqual( this.state(), "rejected", "Deferred is rejected (state)" );
		}).always(function() {
			ok( true, "Always callback on reject" );
		});

		createDeferred(function( defer ) {
			ok( this === defer, "Defer passed as this & first argument" );
			this.resolve("done");
		}).done(function( value ) {
			strictEqual( value, "done", "Passed function executed" );
		});

		createDeferred(function( defer ) {
			var promise = defer.promise(),
				func = function() {},
				funcPromise = defer.promise( func );
			strictEqual( defer.promise(), promise, "promise is always the same" );
			strictEqual( funcPromise, func, "non objects get extended" );
			EhQuery.each( promise, function( key, value ) {
				if ( !EhQuery.isFunction( promise[ key ] ) ) {
					ok( false, key + " is a function (" + EhQuery.type( promise[ key ] ) + ")" );
				}
				if ( promise[ key ] !== func[ key ] ) {
					strictEqual( func[ key ], promise[ key ], key + " is the same" );
				}
			});
		});

		EhQuery.expandedEach = EhQuery.each;
		EhQuery.expandedEach( "resolve reject".split(" "), function( _, change ) {
			createDeferred(function( defer ) {
				strictEqual( defer.state(), "pending", "pending after creation" );
				var checked = 0;
				defer.progress(function( value ) {
					strictEqual( value, checked, "Progress: right value (" + value + ") received" );
				});
				for ( checked = 0; checked < 3; checked++ ) {
					defer.notify( checked );
				}
				strictEqual( defer.state(), "pending", "pending after notification" );
				defer[ change ]();
				notStrictEqual( defer.state(), "pending", "not pending after " + change );
				defer.notify();
			});
		});
	});
});


test( "EhQuery.Deferred - chainability", function() {

	var defer = EhQuery.Deferred();

	expect( 10 );

	EhQuery.expandedEach = EhQuery.each;
	EhQuery.expandedEach( "resolve reject notify resolveWith rejectWith notifyWith done fail progress always".split(" "), function( _, method ) {
		var object = {
			m: defer[ method ]
		};
		strictEqual( object.m(), object, method + " is chainable" );
	});
});

test( "EhQuery.Deferred.then - filtering (done)", function() {

	expect( 4 );

	var value1, value2, value3,
		defer = EhQuery.Deferred(),
		piped = defer.then(function( a, b ) {
			return a * b;
		});

	piped.done(function( result ) {
		value3 = result;
	});

	defer.done(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.resolve( 2, 3 );

	strictEqual( value1, 2, "first resolve value ok" );
	strictEqual( value2, 3, "second resolve value ok" );
	strictEqual( value3, 6, "result of filter ok" );

	EhQuery.Deferred().reject().then(function() {
		ok( false, "then should not be called on reject" );
	});

	EhQuery.Deferred().resolve().then( EhQuery.noop ).done(function( value ) {
		strictEqual( value, undefined, "then done callback can return undefined/null" );
	});
});

test( "EhQuery.Deferred.then - filtering (fail)", function() {

	expect( 4 );

	var value1, value2, value3,
		defer = EhQuery.Deferred(),
		piped = defer.then( null, function( a, b ) {
			return a * b;
		});

	piped.fail(function( result ) {
		value3 = result;
	});

	defer.fail(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.reject( 2, 3 );

	strictEqual( value1, 2, "first reject value ok" );
	strictEqual( value2, 3, "second reject value ok" );
	strictEqual( value3, 6, "result of filter ok" );

	EhQuery.Deferred().resolve().then( null, function() {
		ok( false, "then should not be called on resolve" );
	});

	EhQuery.Deferred().reject().then( null, EhQuery.noop ).fail(function( value ) {
		strictEqual( value, undefined, "then fail callback can return undefined/null" );
	});
});

test( "EhQuery.Deferred.then - filtering (progress)", function() {

	expect( 3 );

	var value1, value2, value3,
		defer = EhQuery.Deferred(),
		piped = defer.then( null, null, function( a, b ) {
			return a * b;
		});

	piped.progress(function( result ) {
		value3 = result;
	});

	defer.progress(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.notify( 2, 3 );

	strictEqual( value1, 2, "first progress value ok" );
	strictEqual( value2, 3, "second progress value ok" );
	strictEqual( value3, 6, "result of filter ok" );
});

test( "EhQuery.Deferred.then - deferred (done)", function() {

	expect( 3 );

	var value1, value2, value3,
		defer = EhQuery.Deferred(),
		piped = defer.then(function( a, b ) {
			return EhQuery.Deferred(function( defer ) {
				defer.reject( a * b );
			});
		});

	piped.fail(function( result ) {
		value3 = result;
	});

	defer.done(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.resolve( 2, 3 );

	strictEqual( value1, 2, "first resolve value ok" );
	strictEqual( value2, 3, "second resolve value ok" );
	strictEqual( value3, 6, "result of filter ok" );
});

test( "EhQuery.Deferred.then - deferred (fail)", function() {

	expect( 3 );

	var value1, value2, value3,
		defer = EhQuery.Deferred(),
		piped = defer.then( null, function( a, b ) {
			return EhQuery.Deferred(function( defer ) {
				defer.resolve( a * b );
			});
		});

	piped.done(function( result ) {
		value3 = result;
	});

	defer.fail(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.reject( 2, 3 );

	strictEqual( value1, 2, "first reject value ok" );
	strictEqual( value2, 3, "second reject value ok" );
	strictEqual( value3, 6, "result of filter ok" );
});

test( "EhQuery.Deferred.then - deferred (progress)", function() {

	expect( 3 );

	var value1, value2, value3,
		defer = EhQuery.Deferred(),
		piped = defer.then( null, null, function( a, b ) {
			return EhQuery.Deferred(function( defer ) {
				defer.resolve( a * b );
			});
		});

	piped.done(function( result ) {
		value3 = result;
	});

	defer.progress(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.notify( 2, 3 );

	strictEqual( value1, 2, "first progress value ok" );
	strictEqual( value2, 3, "second progress value ok" );
	strictEqual( value3, 6, "result of filter ok" );
});

test( "EhQuery.Deferred.then - context", function() {

	expect( 7 );

	var context = {};

	EhQuery.Deferred().resolveWith( context, [ 2 ] ).then(function( value ) {
		return value * 3;
	}).done(function( value ) {
		strictEqual( this, context, "custom context correctly propagated" );
		strictEqual( value, 6, "proper value received" );
	});

	EhQuery.Deferred().resolve().then(function() {
		return EhQuery.Deferred().resolveWith(context);
	}).done(function() {
		strictEqual( this, context, "custom context of returned deferred correctly propagated" );
	});

	var defer = EhQuery.Deferred(),
		piped = defer.then(function( value ) {
			return value * 3;
		});

	defer.resolve( 2 );

	piped.done(function( value ) {
		strictEqual( this, piped, "default context gets updated to latest promise in the chain" );
		strictEqual( value, 6, "proper value received" );
	});

	var defer2 = EhQuery.Deferred(),
		piped2 = defer2.then();

	defer2.resolve( 2 );

	piped2.done(function( value ) {
		strictEqual( this, piped2, "default context gets updated to latest promise in the chain (without passing function)" );
		strictEqual( value, 2, "proper value received (without passing function)" );
	});
});

test( "EhQuery.when", function() {

	expect( 34 );

	// Some other objects
	EhQuery.each({

		"an empty string": "",
		"a non-empty string": "some string",
		"zero": 0,
		"a number other than zero": 1,
		"true": true,
		"false": false,
		"null": null,
		"undefined": undefined,
		"a plain object": {}

	}, function( message, value ) {

		ok(
			EhQuery.isFunction(
				EhQuery.when( value ).done(function( resolveValue ) {
					strictEqual( this, window, "Context is the global object with " + message );
					strictEqual( resolveValue, value, "Test the promise was resolved with " + message );
				}).promise
			),
			"Test " + message + " triggers the creation of a new Promise"
		);

	} );

	ok(
		EhQuery.isFunction(
			EhQuery.when().done(function( resolveValue ) {
				strictEqual( this, window, "Test the promise was resolved with window as its context" );
				strictEqual( resolveValue, undefined, "Test the promise was resolved with no parameter" );
			}).promise
		),
		"Test calling when with no parameter triggers the creation of a new Promise"
	);

	var context = {};

	EhQuery.when( EhQuery.Deferred().resolveWith( context ) ).done(function() {
		strictEqual( this, context, "when( promise ) propagates context" );
	});

	var cache;

	EhQuery.each([ 1, 2, 3 ], function( k, i ) {

		EhQuery.when( cache || EhQuery.Deferred(function() {
				this.resolve( i );
			})
		).done(function( value ) {

			strictEqual( value, 1, "Function executed" + ( i > 1 ? " only once" : "" ) );
			cache = value;
		});

	});
});

test( "EhQuery.when - joined", function() {

	expect( 119 );

	var deferreds = {
			value: 1,
			success: EhQuery.Deferred().resolve( 1 ),
			error: EhQuery.Deferred().reject( 0 ),
			futureSuccess: EhQuery.Deferred().notify( true ),
			futureError: EhQuery.Deferred().notify( true ),
			notify: EhQuery.Deferred().notify( true )
		},
		willSucceed = {
			value: true,
			success: true,
			futureSuccess: true
		},
		willError = {
			error: true,
			futureError: true
		},
		willNotify = {
			futureSuccess: true,
			futureError: true,
			notify: true
		};

	EhQuery.each( deferreds, function( id1, defer1 ) {
		EhQuery.each( deferreds, function( id2, defer2 ) {
			var shouldResolve = willSucceed[ id1 ] && willSucceed[ id2 ],
				shouldError = willError[ id1 ] || willError[ id2 ],
				shouldNotify = willNotify[ id1 ] || willNotify[ id2 ],
				expected = shouldResolve ? [ 1, 1 ] : [ 0, undefined ],
				expectedNotify = shouldNotify && [ willNotify[ id1 ], willNotify[ id2 ] ],
				code = id1 + "/" + id2,
				context1 = defer1 && EhQuery.isFunction( defer1.promise ) ? defer1.promise() : undefined,
				context2 = defer2 && EhQuery.isFunction( defer2.promise ) ? defer2.promise() : undefined;

			EhQuery.when( defer1, defer2 ).done(function( a, b ) {
				if ( shouldResolve ) {
					deepEqual( [ a, b ], expected, code + " => resolve" );
					strictEqual( this[ 0 ], context1, code + " => first context OK" );
					strictEqual( this[ 1 ], context2, code + " => second context OK" );
				} else {
					ok( false,  code + " => resolve" );
				}
			}).fail(function( a, b ) {
				if ( shouldError ) {
					deepEqual( [ a, b ], expected, code + " => reject" );
				} else {
					ok( false, code + " => reject" );
				}
			}).progress(function( a, b ) {
				deepEqual( [ a, b ], expectedNotify, code + " => progress" );
				strictEqual( this[ 0 ], expectedNotify[ 0 ] ? context1 : undefined, code + " => first context OK" );
				strictEqual( this[ 1 ], expectedNotify[ 1 ] ? context2 : undefined, code + " => second context OK" );
			});
		});
	});
	deferreds.futureSuccess.resolve( 1 );
	deferreds.futureError.reject( 0 );
});
