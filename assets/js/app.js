var svgWidth = 700;
var svgHeight = 500;

  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 30, bottom: 80, left: 80},
  width = svgWidth - margin.left - margin.right,
  height = svgHeight - margin.top - margin.bottom;
  
// Create an SVG wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
 
// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating Dots labelas group with a transition to
// new circles
function renderXDotsText(textDots, newXScale, chosenXAxis) {

  textDots.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));

  return textDots;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;
  var percentage;

  if (chosenXAxis === "poverty") {
    label = "Poverty: ";
    percentage = '%'
  }
  else if (chosenXAxis === "age") {
    label = "Age: ";
    percentage = '%'
  }
  else {
    label = "Household Income ";
    percentage = ''
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label}${d[chosenXAxis]}${percentage}<br>${'Lacks Healthcare: '}${d.healthcare}${"%"}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(data,err) {
  if (err) throw err;

  // parse data
  data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.abbr = data.abbr;
    data.income = +data.income;
 
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 12)
    .attr("fill", "#69b3a2")
    .attr("opacity", ".5")
    ;
  
    var textDots = chartGroup.append("g")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d =>  yLinearScale(d.healthcare) +3 )
        .attr("font-family", "arial")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .style("fill", "hsl(327, 77%, 33%)");

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var InPovertyLabel = labelsGroup.append("text") 
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)")
   

  var AgeMediaLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)")
    

    var IncomeMediaLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)")
  

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)")
    .style("fill","black");
  
  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
         
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);
     
        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);
        
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates dot labels
        textDots = renderXDotsText(textDots, xLinearScale, chosenXAxis);
      
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    
        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          AgeMediaLabel
            .classed("active", false)
            .classed("inactive", true);
          InPovertyLabel 
            .classed("active", true)
            .classed("inactive", false);
          IncomeMediaLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          AgeMediaLabel
            .classed("active", true)
            .classed("inactive", false);
          InPovertyLabel 
            .classed("active", false)
            .classed("inactive", true);
          IncomeMediaLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else { //income
          AgeMediaLabel
            .classed("active", false)
            .classed("inactive", true);
          InPovertyLabel 
            .classed("active", false)
            .classed("inactive", true);
          IncomeMediaLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

