/** Script code for people.html */


var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        showResult(xhttp.responseXML);
    }
};
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const name = urlParams.get('name');
xhttp.open("GET", "https://directory.columbia.edu/people/search?newSearch=" + name, true);
xhttp.send(); 

function showResult(html) {
    var txt = "";
    path = "//a[@class=\"mailto\"]"
    if (html.evaluate) {
        var nodes = html.evaluate(path, html, null, XPathResult.ANY_TYPE, null);
        var result = nodes.iterateNext();
        while (result) {
          // TO DO: redirect to the composing page if only one result is found
            txt += result.childNodes[0].nodeValue + "<br>";
            result = nodes.iterateNext();
        } 
    // Code For Internet Explorer
    } else if (window.ActiveXObject || xhttp.responseType == "msxml-document") {
        html.setProperty("SelectionLanguage", "XPath");
        nodes = html.selectNodes(path);
        for (i = 0; i < nodes.length; i++) {
            txt += nodes[i].childNodes[0].nodeValue + "<br>";
        }
    }
    document.getElementById("email-list").innerHTML = txt;
}