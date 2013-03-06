// Use the right EhQuery source in iframe tests
document.write( "<script id='EhQuery-js' src='" +
	parent.document.getElementById("EhQuery-js").src.replace( /^(?![^\/?#]+:)/,
		parent.location.pathname.replace( /[^\/]$/, "$0/" ) ) +
"'><\x2Fscript>" );
