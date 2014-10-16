exports.prefix0 = function(thestring) {
	thestring = thestring.toString();
	thestring = thestring.length == 1 ? "0" + thestring : thestring;
	return thestring;
}