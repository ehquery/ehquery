var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = EhQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

EhQuery.fn.extend({
	find: function( selector ) {
		var self, matched, i,
			l = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( EhQuery( selector ).filter(function() {
				for ( i = 0; i < l; i++ ) {
					if ( EhQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		matched = [];
		for ( i = 0; i < l; i++ ) {
			EhQuery.find( selector, this[ i ], matched );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		matched = this.pushStack( l > 1 ? EhQuery.unique( matched ) : matched );
		matched.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return matched;
	},

	has: function( target ) {
		var targets = EhQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( EhQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					EhQuery( selector, this.context ).index( this[ 0 ] ) >= 0 :
					EhQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = ( rneedsContext.test( selectors ) || typeof selectors !== "string" ) ?
				EhQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						EhQuery.find.matchesSelector(cur, selectors)) ) {

					cur = matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? EhQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return core_indexOf.call( EhQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return core_indexOf.call( this,

			// If it receives a EhQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				EhQuery( selector, context ) :
				EhQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = EhQuery.merge( this.get(), set );

		return this.pushStack( EhQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}

	return cur;
}

EhQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return EhQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return EhQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return EhQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return EhQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return EhQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return EhQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return EhQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return EhQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return EhQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			EhQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	EhQuery.fn[ name ] = function( until, selector ) {
		var matched = EhQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = EhQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			if ( !guaranteedUnique[ name ] ) {
				EhQuery.unique( matched );
			}

			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});

EhQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			EhQuery.find.matchesSelector( elems[ 0 ], expr ) ? [ elems[ 0 ] ] : [] :
			EhQuery.find.matches( expr, elems );
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && EhQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	var filtered;

	if ( EhQuery.isFunction( qualifier ) ) {
		return EhQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});
	}

	if ( qualifier.nodeType ) {
		return EhQuery.grep(elements, function( elem ) {
			return ( elem === qualifier ) === keep;
		});
	}

	if ( typeof qualifier === "string" ) {
		filtered = EhQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return EhQuery.filter( qualifier, filtered, !keep );
		}

		qualifier = EhQuery.filter( qualifier, filtered );
	}

	return EhQuery.grep(elements, function( elem ) {
		return ( core_indexOf.call( qualifier, elem ) >= 0 ) === keep;
	});
}
