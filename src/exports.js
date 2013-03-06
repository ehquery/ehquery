if ( typeof module === "object" && typeof module.exports === "object" ) {
	// Expose EhQuery as module.exports in loaders that implement the Node
	// module pattern (including browserify). Do not create the global, since
	// the user will be storing it themselves locally, and globals are frowned
	// upon in the Node module world.
	module.exports = EhQuery;
} else {
	// Otherwise expose EhQuery to the global object as usual
	window.EhQuery = window.$ = EhQuery;

	// Register as a named AMD module, since EhQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and EhQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of EhQuery, it will work.
	if ( typeof define === "function" && define.amd ) {
		define( "jquery", [], function () { return EhQuery; } );
	}
}
