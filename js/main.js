(function(){

    //pseudo-global variables
    var attrArray = ["UN Partition Plan", "1949 Armistice"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute
 
 //begin script when window loads
 window.onload = setMap();
 
 //Example 1.3 line 4...set up choropleth map
 function setMap() {
 
      //map frame dimensions
      var width = window.innerWidth * 0.4,
      height = 600;
 
  //create new svg container for the map
  var map = d3
  .select("body")
  .append("svg")
  .attr("class", "map")
  .attr("width", width)
  .attr("height", height);
 
  //create Albers equal area conic projection centered on France
  var projection = d3.geoAlbers()
 .center([0, 31.5])
 .rotate([-35, 0, 0])
 .parallels([30.1, 32.8])
 .scale(8000)
 .translate([width / 2, height / 2]);
 
 var path = d3.geoPath()
 var path = d3.geoPath()
     .projection(projection);
 
     var promises = [
         d3.csv("data/arm_Data.csv"),
         d3.json("data/Countries2.topojson"),
         d3.json("data/Armistice.topojson"),
        
     ];
     Promise.all(promises).then(callback);
 
     
 
 function callback(data) {
     var csvData = data[0],
         countries = data[1],
         boundaries = data[2];
 
         console.log(boundaries)
     //translate TopoJSON
     var countryBound = topojson.feature(countries, countries.objects.Countries2),
         armBound = topojson.feature(boundaries, boundaries.objects.Boundaries).features;
 
 
         setGraticule(map,path)
 
         var countrieslayer = map.append("path")
             .datum(countryBound)
             .attr("class", "countrieslayer")
             .attr("d", path);
 
 
         armBound = joinData(armBound, csvData);
 
         //create the color scale
         var colorScale = makeColorScale(csvData);
 
         setEnumerationUnits(armBound,map,path,colorScale);
 
         createDropdown(csvData);
 
         };
 
     };
 
     function setGraticule(map, path){
         //create graticule generator
         var graticule = d3.geoGraticule()
         .step([2, 2]); //place graticule lines every 5 degrees of longitude and latitude
         
          //create graticule background
          var gratBackground = map.append("path")
          .datum(graticule.outline()) //bind graticule background
          .attr("class", "gratBackground") //assign class for styling
          .attr("d", path) //project graticule
         
           
            
         //create graticule lines
         var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
           .data(graticule.lines()) //bind graticule lines to each element to be created
           .enter() //create an element for each datum
           .append("path") //append each element to the svg as a path element
           .attr("class", "gratLines") //assign class for styling
           .attr("d", path); //project graticule lines
         };
         
         function joinData(armBound, csvData){
              //variables for data join
              var attrArray = ["UN Partition Plan", "1949 Armistice"]; 
         
              //loop through csv to assign each set of csv attribute values to geojson region
              for (var i=0; i<csvData.length; i++){
                var csvArm = csvData[i]; //the current region
                var csvKey = csvArm.OBJECTID; //the CSV primary key
         
                //loop through geojson regions to find correct region
                for (var a=0; a<armBound.length; a++){
         
                    var geojsonProps = armBound[a].properties; //the current region geojson properties
                    var geojsonKey = geojsonProps.OBJECTID; //the geojson primary key
         
                    //where primary keys match, transfer csv data to geojson properties object
                    if (geojsonKey == csvKey){
         
                        //assign all attributes and values
                        attrArray.forEach(function(attr){
                            var val = parseFloat(csvArm[attr]); //get csv attribute value
                            geojsonProps[attr] = val; //assign attribute and value to geojson properties
                        });
                    };
                };
            };
            return armBound;
         };
         
         
         //function to create color scale generator
         function makeColorScale(data){
             var colorClasses = [
                 "#D4B9DA",
                 "#C994C7",
                 "#DF65B0",
                 "#DD1C77",
                 "#980043"
             ];
         
             //create color scale generator
             var colorScale = d3.scaleQuantile()
                 .range(colorClasses);
         
             //build array of all values of the expressed attribute
             var domainArray = [];
             for (var i=0; i<data.length; i++){
                 var val = parseFloat(data[i][expressed]);
                 domainArray.push(val);
             };
         
             //assign array of expressed values as scale domain
             colorScale.domain(domainArray);
         
             return colorScale;
         
         };
         
         function setEnumerationUnits(armBound, map, path, colorScale){
         
             var armisticelayer = map
             .selectAll(".boundaries")
             .data(armBound)
             .enter()
             .append("path")
             .attr("class", function(d){
                 return "boundaries " + d.properties.OBJECTID;
             })
             .attr("d", path)
             .style("fill", function(d){
                 return colorScale(d.properties[expressed]);
             })
             .on("mouseover", function(event, d){
                 highlight(d.properties);
             })
             .on("mouseout", function(event, d){
                 dehighlight(d.properties);
             })
             .on("mousemove", moveLabel);
         
             var desc = armisticelayer.append("desc")
             .text('{"stroke": "#000", "stroke-width": "0.5px"}');
            
         };
  
         
         
         //function to create a dropdown menu for attribute selection
           
             function createDropdown(csvData) {
                 //add select element
                 var dropdown = d3
                     .select("body")
                     .append("select")
                     .attr("class", "dropdown")
                     .on("change", function () {
                         changeAttribute(this.value, csvData);
                     });
         
                 //add initial option
                 var titleOption = dropdown
                     .append("option")
                     .attr("class", "titleOption")
                     .attr("disabled", "true")
                     .text("Select Attribute");
         
                 //add attribute name options
                 var attrOptions = dropdown
                     .selectAll("attrOptions")
                     .data(attrArray)
                     .enter()
                     .append("option")
                     .attr("value", function (d) {
                         return d;
                     })
                     .text(function (d) {
                         return d;
                     });
             };
         
         function changeAttribute(attribute, csvData) {
             //change the expressed attribute
             expressed = attribute;
         
             //recreate the color scale
             var colorScale = makeColorScale(csvData);
         
             //recolor enumeration units
             var armisticelayer = d3.selectAll(".boundaries")
             .transition()
             .duration(1000)
             .style("fill", function (d) {
                 var value = d.properties[expressed];
                 if (value) {
                     return colorScale(value);
                 } else {
                     return "#ccc";
                 }
             });
         
         };
         
        
         
         //function to highlight enumeration units and bars
         function highlight(props){
             //change stroke
             var selected = d3
                 .selectAll("." + props.OBJECTID )
                 .style("stroke", "white")
                 .style("stroke-width", "2.5");
         
             setLabel(props);
         };
         
         //function to reset the element style on mouseout
         function dehighlight(props){
             var selected = d3.selectAll("." + props.OBJECTID)
                 .style("stroke", function(){
                     return getStyle(this, "stroke")
                 })
                 .style("stroke-width", function(){
                     return getStyle(this, "stroke-width")
                 });
         
             function getStyle(element, styleName){
                 var styleText = d3.select(element)
                     .select("desc")
                     .text();
         
                 var styleObject = JSON.parse(styleText);
         
                 return styleObject[styleName];
             };
             d3.select(".infolabel")
             .remove();
         };
         
         //function to create dynamic label
         function setLabel(props){
             //label content
            
             var labelAttribute = "<p><h1>" + props[expressed] +
                 "</h1><b>" + expressed + "</b>";
         
             //create info label div
             var infolabel = d3.select("body")
                 .append("div")
                 .attr("class", "infolabel")
                 .attr("id", props.COUNTY_NAME + "_label")
                 .html(labelAttribute);
         
             var countyName = infolabel.append("div")
                 .attr("class", "labelname")
                 .html(props.name);
         };
         
         //function to move info label with mouse
         function moveLabel(){
              //get width of label
              var labelWidth = d3.select(".infolabel")
              .node()
              .getBoundingClientRect()
              .width;
             //use coordinates of mousemove event to set label coordinates
             var x1 = event.clientX + 10,
             y1 = event.clientY - 75,
             x2 = event.clientX - labelWidth - 10,
             y2 = event.clientY + 25;
         
              //horizontal label coordinate, testing for overflow
              var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
              //vertical label coordinate, testing for overflow
              var y = event.clientY < 75 ? y2 : y1; 
          
              d3.select(".infolabel")
                  .style("left", x + "px")
                  .style("top", y + "px");
         };
         
        
 })();