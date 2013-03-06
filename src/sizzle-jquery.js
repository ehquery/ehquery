// Override sizzle attribute retrieval
Sizzle.attr = EhQuery.attr;
EhQuery.find = Sizzle;
EhQuery.expr = Sizzle.selectors;
EhQuery.expr[":"] = EhQuery.expr.pseudos;
EhQuery.unique = Sizzle.uniqueSort;
EhQuery.text = Sizzle.getText;
EhQuery.isXMLDoc = Sizzle.isXML;
EhQuery.contains = Sizzle.contains;
