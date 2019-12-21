//Reference Github_Adam-Forest
// @TODO: YOUR CODE HERE!
// create SVG for chart
var svgArea = d3.select("body").select("svg");

// set svg size to window size
var svgWidth = 1080;
var svgHeight = 720;

// choose margin here
var margin = {
    top: 50,
    bottom: 150,
    right: 50,
    left: 180
};

// calculate chart size less margins
var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// append SVG element to scatter div
// viewBox so SVG is responsive
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

// append group element to SVG and move to margin
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}

function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}


function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis])+6);

    return textGroup;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
 
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, tipGroup) {

    //check x axis
    if (chosenXAxis === "poverty") {
        var label = "In Poverty (%)";
    
    }

    // check y axis
    if (chosenYAxis === 'healthcare') {
        var yLabel = "Lacks Healthcare (%)"
   
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function (d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);

        });

    tipGroup.call(toolTip);

    tipGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return tipGroup;

}

// read in CSV data
d3.csv("./assets/data/data.csv").then(function (censusData, err) {
    if (err) throw err;

    // cast data, make sure numbers are numbers
    censusData.forEach(function (data) {
        data.id = +data.id;
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
       
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);


            //append y axis
    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll(".stateCircle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("opacity", ".5")
        .classed("stateCircle", true);

    var textGroup = chartGroup.selectAll(".stateText")
        .data(censusData)
        .enter()
        .append("text")
        .classed("stateText", "True")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis])+6)
        .text(function (d) { return d.abbr });

    // Create group for  2 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 30)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("xlabel", true)
        .text("In Poverty (%)");

        // **************
    // Create group for y- axis labels
    var ylabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(90)")
            // .attr("y", -5000)
            // .attr("x", -5000)
            .classed("axis-text", true)
        .attr("transform", `translate(${-110 - margin.left / 4}, ${(height / 2)}), rotate(-90)`);


        
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 30)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .classed("ylabel", true)
        .text("Lacks Healthcare (%)");

   

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    var textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(censusData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates circles text with new x values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);


                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

                // deactivate all
                d3.selectAll(".xlabel").classed("active", false).classed("inactive", true);

                // activate selected
                if (chosenXAxis === "age") {
                   ageLabel
                       .classed("active", true)
                       .classed("inactive", false);
               } else if (chosenXAxis === "poverty") {
                   povertyLabel
                       .classed("active", true)
                       .classed("inactive", false);
               } else if (chosenXAxis === "income") {
                   incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
               }
           }
       });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(censusData, chosenYAxis);

                // updates x axis with transition
                yAxis = renderAxesY(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates circles text with new x values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);


                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

                // deactivate all
                d3.selectAll(".ylabel").classed("active", false).classed("inactive", true);

                // activate selected
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else if (chosenYAxis === "obesity") {
                   obesityLabel
                       .classed("active", true)
                       .classed("inactive", false);
                } else if (chosenYAxis === "smokes") {
                   smokesLabel
                       .classed("active", true)
                       .classed("inactive", false);
               }
           }
        });


}).catch(function (error) {
    console.log(error);
});