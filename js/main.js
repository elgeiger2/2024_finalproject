//insert code here!
window.onload = setMap();

//Example 1.3 line 4...set up choropleth map
function setMap() {
    //map frame dimensions
    var width = 960,
        height = 460;

    //create new svg container for the map
    var map = d3
        .select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

        
    }