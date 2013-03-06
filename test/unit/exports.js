module("exports", { teardown: moduleTeardown });

test("amdModule", function() {
	expect(1);

	equal( EhQuery, amdDefined, "Make sure defined module matches EhQuery" );
});
