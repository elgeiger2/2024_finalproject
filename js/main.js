(function(){

    //pseudo-global variables
    var attrArray = ["UN Partition Plan", "1949 Armistice"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute

    var layer1 = "After the conclusion of WW2 and the discovery of the Holocaust, the UN took swift action to draw up borders for the new Jewish state of Israel. However, like many borders drawn up in the middle east during this time, western powers failed to consider the actual demographics they would be dividing up. Suddenly, the majority Palestinian population were now minorities in a foreign land, and the new Jewish government had to contend with a large population ethnically and religiously different from themselves.";
    var layer2 = "Not everyone agreed to this new Jewish state, particularly its Arab neighbors. A series of violent exchanges between anti-Israel and Zionist forces eventually evolved into all out war. During this time, Israel led an incredibly effective offensive campaign which resulted in them occupying a great deal more territory allocated to them in the previous partition. Palestinians in the occupied areas were forced to flee in the hundreds of thousands, an event that is still remembered as the Nakba. Although these are where the official borders stand today, this map does not completely represent actual details on the ground. The present map looks more like our next one.";

    var currentLayer = layer1;
 
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
 
     //translate TopoJSON
     var countryBound = topojson.feature(countries, countries.objects.Countries2).features,
         armBound = topojson.feature(boundaries, boundaries.objects.Boundaries).features;
 
 
         setGraticule(map,path)
 
         armBound = joinData(armBound, csvData);
 
         setEnumerationUnits(armBound,map,path, countryBound);
 
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
                var csvKey = csvArm.NAME; //the CSV primary key
         
                //loop through geojson regions to find correct region
                for (var a=0; a<armBound.length; a++){
         
                    var geojsonProps = armBound[a].properties; //the current region geojson properties
                    var geojsonKey = geojsonProps.NAME; //the geojson primary key
         
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
         
     
         
         function setEnumerationUnits(armBound, map, path, countries){

            var countrieslayer = map
            .selectAll(".countries")
            .data(countries)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "countries " + d.properties.NAME_EN;
            })
            .attr("d", path)
            .style("fill", function(d){
                var value = d.properties.NAME_EN;
                if (value) {
                    return "#808080";
                }
                else {
                    return;
                }
            })
            .on("mouseover", function(event, d){
                highlight(d.properties);
            })
            .on("mouseout", function(event, d){
                dehighlight(d.properties);
            })
            .on("mousemove", moveLabel);

            var desc = countrieslayer.append("desc")
            .text('{"stroke": "#000", "stroke-width": "0.5px"}');
         
             var armisticelayer = map
             .selectAll(".boundaries")
             .data(armBound)
             .enter()
             .append("path")
             .attr("class", function(d){
                 return "boundaries " + d.properties.NAME;
             })
             .attr("d", path)
             .style("fill", function (d) {
                 var value = d.properties.PlanUse;
                //  if (value === "Arab_State") {
                //      return "rgb(100,215,150)";
                //  } else if (value === "Jewish_State"){
                //      return "rgb(20,100,255)";
                //  } else if (value === "Water") {return "rgb(188, 230, 255)";}
                //  else if (value === "Corpus Separatum") {return "rgb(210,20,20)"}
                if (value) {
                    return "#F5F5DC";
                }
                else {
                    return;
                }
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
                .text("SELECT MAP");
         
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

            if (expressed === "UN Partition Plan") {
                //recolor enumeration units
                var armisticelayer = d3.selectAll(".boundaries")
                .transition()
                .duration(1000)
                .style("fill", function (d) {
                    var value = d.properties.PlanUse;
                    if (value === "Arab_State") {
                        return "rgb(255, 255, 187)";
                    } else if (value === "Jewish_State"){
                        return "rgb(255, 195, 193)";
                    } else if (value === "Water") {return "rgb(188, 230, 255)";}
                    else if (value === "Corpus Separatum") {return "rgb(91, 122, 92)"}
                })
                setInfoLayer(layer1);
            }
            else if (expressed === "1949 Armistice") {
                //recolor enumeration units
                var armisticelayer = d3.selectAll(".boundaries")
                .transition()
                .duration(1000)
                .style("fill", function (d) {
                    var value = d.properties.Armistice;
                    if (value === "Egypt and Jordan") {
                        return "rgb(255, 255, 187)";
                    } else if (value === "Israel"){
                        return "rgb(255, 195, 193)";
                    } else if (value === "Water") {return "rgb(188, 230, 255)";}
                    else if (value === "Corpus Separatum") {return "rgb(91, 122, 92)"}
                });
                setInfoLayer(layer2);
            };
         
         };

         //adds information text to the screen
         function setInfoLayer(newInfoLayer) {
            currentLayer = newInfoLayer;
            var infoText = document.getElementById("infoText");
            console.log(currentLayer);
            infoText.innerText = currentLayer;
         }
         
        
         
         //function to highlight enumeration units and bars
         function highlight(props){
             //change stroke
             var selected = d3
                 .selectAll("." + props.NAME)
                 .selectAll("." + props.NAME_EN)
                 .style("stroke", "black")
                 .style("stroke-width", "2.5");
         
             setLabel(props);
         };
         
         //function to reset the element style on mouseout
         function dehighlight(props){
             var selected = d3.selectAll("." + props.NAME).selectAll("." + props.NAME_EN)
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
            
             if (expressed === "UN Partition Plan" ) {
                if (props.PlanUse === "Water"){
                    if (props.NAME === "Bound11") {
                        var labelAttribute = "<h1> Sea of Galilee </h1>";
                    }
                    if (props.NAME === "Bound3") {
                        var labelAttribute = "<h1> Dead Sea </h1>";
                    }
                    
                }
                else if (props.NAME_EN) {
                    var labelAttribute = "<h1>" + props.NAME_EN + "</h1>";
                 }
                else if (props.PlanUse === "Jewish_State"){
                    var labelAttribute = "<b>" + expressed +
                    ": </b> <p>Assigned to Jewish State" ;
                }
                else if (props.PlanUse === "Arab_State"){
                    var labelAttribute = "<b>" + expressed +
                    ": </b> <p>Assigned to Arab State" ;
                }
                else {var labelAttribute = "<b>" + expressed + ": </b> <p> Assigned to " + props.PlanUse}
             }

             else if (expressed === "1949 Armistice" ) {
                if (props.Armistice === "Water"){ 
                    if (props.NAME === "Bound11") {
                        var labelAttribute = "<h1> Sea of Galilee </h1>";
                    }
                    if (props.NAME === "Bound3") {
                        var labelAttribute = "<h1> Dead Sea </h1>";
                    }
                }
                else if (props.NAME_EN) {
                    var labelAttribute = "<h1>" + props.NAME_EN + "</h1>";
                 }
                else {
                var labelAttribute = "<p><b>" + expressed +
                ": </b><p>Assigned to " + props.Armistice ; 
                }
             }; 

             //create info label div
             var infolabel = d3.select("body")
                 .append("div")
                 .attr("class", "infolabel")
                 .attr("id", props.NAME + "_label")
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
 