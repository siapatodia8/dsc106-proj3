const width = 1000;
const height = 600;
const margin = { top: 0, right: 50, bottom: 50, left: 50 };
const circleRadius = 7.5; 
const circleSpacing = -3; 

const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let data;

d3.csv("data.csv").then(dataset => {
    data = dataset.filter(d => +d.hs_gpa >= 3).map((d, i) => {
        d.id = i;
        d.fy_gpa = parseFloat(d.fy_gpa).toFixed(1);
        d.sex = d.sex === '1' ? 'Male' : 'Female';
        return d;
    });

    const groupedData = d3.group(data, d => d.fy_gpa);

    const xScale = d3.scaleLinear()
        .domain([0, 4])
        .range([0, width]);

    const circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.fy_gpa))
        .attr("cy", (d, i) => {
            const index = groupedData.get(d.fy_gpa).indexOf(d);
            const yOffset = index * (circleRadius * 2 + circleSpacing);
            return height - yOffset - circleRadius; 
        })
        .attr("r", circleRadius)
        .attr("fill", d => d.sex === 'Male' ? 'lightblue' : 'pink')
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("opacity", 0.7);

    const xAxis = d3.axisBottom(xScale)
                    .tickValues([0.0, 1.0, 2.0, 3.0, 4.0])
                    .tickFormat(d => `${d.toFixed(1)} GPA`);
    
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, 0)`)
        .call(xAxis);
    
    svg.selectAll(".x-axis-tick-line")
        .data([0, 1, 2, 3, 4])
        .enter().append("line")
        .attr("class", "x-axis-tick-line")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", 40)
        .attr("y2", height)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "4 2");
    
    svg.selectAll(".tick")
        .attr("font-size","20")
        .attr("font-family","system")
        .attr("font-weight", 'bold');

    document.getElementById("maleToggle").addEventListener("change", updateVisualization);
    document.getElementById("femaleToggle").addEventListener("change", updateVisualization);

    function updateVisualization() {
        const showMale = document.getElementById("maleToggle").checked;
        const showFemale = document.getElementById("femaleToggle").checked;

        const maleLabel = document.querySelector('label[for="maleToggle"]');
        const femaleLabel = document.querySelector('label[for="femaleToggle"]');

        if (showMale) {
            maleLabel.style.backgroundColor = "lightblue";
            maleLabel.style.opacity = 1;
        } else {
            maleLabel.style.backgroundColor = "lightblue";
            maleLabel.style.opacity = 0.3;
        }

        if (showFemale) {
            femaleLabel.style.backgroundColor = "pink";
            femaleLabel.style.opacity = 1;
        } else {
            femaleLabel.style.backgroundColor = "pink"; 
            femaleLabel.style.opacity = 0.3;
        }


        circles.attr("display", function(d) {
            if ((d.sex === 'Male' && showMale) || (d.sex === 'Female' && showFemale)) {
                return "block";
            } else {
                return "none";
            }
        });
    }

    document.getElementById("showButton").addEventListener("click", plotGPA);

    function plotGPA() {
        const inputGPA = parseFloat(document.getElementById("inputGPA").value);
        
        if (!isNaN(inputGPA)) {
            svg.selectAll(".inputCircle, .percentileLabel, .tooltip2").remove();
            
            const circle = svg.append("circle")
                .attr("class", "inputCircle")
                .attr("cx", xScale(inputGPA))
                .attr("cy", height / 2) // Adjust the y-coordinate as needed
                .attr("r", circleRadius)
                .attr("fill", "orange")
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("opacity", 0.9);
    
            const lowerGPAs = data.filter(d => d.fy_gpa <=inputGPA);
            const percentile = (lowerGPAs.length / data.length) * 100;
    
            const tooltip2 = d3.select("#scatterplot")
                .append("div")
                .attr("class", "tooltip2")
                ;
    
            circle.on("mouseover", (event) => {
                tooltip2.style("visibility", "visible")
                .style("position", "absolute")
                .style("background-color", "white")
                .style("padding", "10px")
                .style("border", "1px solid black")
                .style("border-radius", "5px")
                .html(`
                    <strong>GPA:</strong> ${inputGPA}<br>
                    <strong>Percentile:</strong> ${percentile.toFixed(2)}th
                `)
                .style("left", `${event.pageX}px`) // Set the left position
        .style("top", `${event.pageY}px`); // Set the top position;
            });
    
            circle.on("mouseout", () => {
                tooltip2.style("visibility", "hidden");
            });
        }
    }
    
    circles.on("mouseover", (event, d) => {
        const tooltip = d3.select("#scatterplot")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "10px")
            .style("border", "1px solid black")
            .style("border-radius", "5px")
            .html(`
                <strong>ID:</strong> ${d.id}<br>
                <strong>Sex:</strong> ${d.sex}<br>
                <strong>GPA:</strong> ${d.fy_gpa}<br>
            `);

        tooltip.style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`);

        
    });

    circles.on("mouseout", () => {
        d3.selectAll(".tooltip").remove();
    });

});

