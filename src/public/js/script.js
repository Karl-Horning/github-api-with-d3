// public/js/script.js
const username = "Karl Horning";

// Chart colours
const colours = [
    "#003f5c",
    "#2f4b7c",
    "#665191",
    "#a05195",
    "#d45087",
    "#f95d6a",
    "#ff7c43",
    "#ffa600",
];
const greyScale = ["#000000", "#333333", "#666666"];
const colourPalette = [...colours, ...greyScale];
const mainTextColour = "#ffffff";

// Formatting constants
const MARGIN_TOP = 60;
const MARGIN_RIGHT = 0;
const MARGIN_BOTTOM = 10;
const MARGIN_LEFT = 30;

/**
 * Creates a GitHub Topics chart and appends it to the specified container.
 *
 * @param {Array} data - The data to be visualized in the chart.
 * @param {HTMLElement} container - The HTML element to which the chart will be appended.
 */
const createGitHubTopicsChart = (data, container) => {
    const barHeight = 55;
    const width = Math.min(window.innerWidth);
    const height =
        Math.ceil((data.length + 0.1) * barHeight) + MARGIN_TOP + MARGIN_BOTTOM;

    /**
     * X-scale for positioning bars along the horizontal axis.
     * @type {d3.ScaleLinear<number, number>}
     */
    const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.count)])
        .range([MARGIN_LEFT, width - MARGIN_RIGHT]);

    /**
     * Y-scale for positioning bars along the vertical axis.
     * @type {d3.ScaleBand<string>}
     */
    const y = d3
        .scaleBand()
        .domain(d3.range(data.length).map(String))
        .rangeRound([MARGIN_TOP, height - MARGIN_BOTTOM])
        .padding(0.1);

    /**
     * Format function for displaying count values.
     * @type {(value: number) => string}
     */
    const format = x.tickFormat(20, "");

    /**
     * SVG container for the chart.
     * @type {d3.Selection<SVGSVGElement, unknown, HTMLElement, any>}
     */
    const svg = d3
        .create("svg")
        .attr("width", width + 20) // + 20 stops the top axis number being pushed off page
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Append a title to the SVG with fade-in effect
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", MARGIN_TOP / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .attr("opacity", 0) // Set initial opacity to 0
        .text(`${username}'s GitHub Topics`)
        .transition()
        .duration(1000) // Adjust the duration as needed
        .attr("opacity", 1); // Fade in by setting opacity to 1

    // Append a group element for the bars
    const barsGroup = svg.append("g");

    // Append bars to the SVG
    barsGroup
        .selectAll()
        .data(data)
        .join("rect")
        .attr("x", x(0))
        .attr("y", (d, i) => y(i.toString()))
        .attr("width", 0) // Set initial width to 0 for the animation
        .attr("height", y.bandwidth())
        .attr("fill", (d, i) =>
            i < colourPalette.length
                ? colourPalette[i]
                : greyScale[greyScale.length - 1]
        )
        // Add transition effect on bar width
        .transition()
        .duration(1000) // Set the duration of the animation in milliseconds
        .attr("width", (d) => x(d.count) - x(0));

    // Append labels to the SVG.
    svg.append("g")
        .attr("fill", mainTextColour)
        .attr("text-anchor", "end")
        .style("font-size", "14px") // Adjust the font size here
        .selectAll()
        .data(data)
        .join("text")
        .attr("x", (d) => x(d.count))
        .attr("y", (d, i) => y(i.toString()) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("dx", -4)
        .text((d) => format(d.count))
        .call((text) =>
            text
                .filter((d) => x(d.count) - x(0) < 20) // short bars
                .attr("dx", +4)
                .attr("fill", "black")
                .attr("text-anchor", "start")
        );

    // Append labels to the SVG for each bar.
    svg.append("g")
        .attr("fill", mainTextColour)
        .attr("text-anchor", "start")
        .style("font-size", "14px") // Adjust the font size here
        .selectAll()
        .data(data)
        .join("text")
        .attr("x", MARGIN_LEFT)
        .attr("y", (d, i) => y(i.toString()) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("dx", 8) // Adjust the distance from the bar
        .text((d) => d.topic);

    // Append top axis to the SVG with fade-in effect
    svg.append("g")
        .attr("transform", `translate(0,${MARGIN_TOP})`)
        .attr("opacity", 0) // Set initial opacity to 0
        .call(d3.axisTop(x))
        .transition()
        .duration(1000) // Adjust the duration as needed
        .attr("opacity", 1); // Fade in by setting opacity to 1

    // Append left axis to the SVG with fade-in effect
    svg.append("g")
        .attr("transform", `translate(${MARGIN_LEFT},0)`)
        .attr("opacity", 0) // Set initial opacity to 0
        .call(d3.axisLeft(y).tickFormat((d, i) => `${i+1}`).tickSizeOuter(0)) // Starts the left axis from 1
        .transition()
        .duration(1000) // Adjust the duration as needed
        .attr("opacity", 1); // Fade in by setting opacity to 1

    // Append the SVG to the document body.
    container.appendChild(svg.node());
};

/**
 * Event handler for the "DOMContentLoaded" event.
 * Fetches data from the API and creates the GitHub Topics chart.
 */
document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/data") // Get from the API route set up in index.js
        .then((response) => response.json())
        .then((data) => {
            const elGitHubData = document.getElementById("github-data");
            createGitHubTopicsChart(data, elGitHubData);
        })
        .catch((error) => console.error("Error fetching API data:", error));
});
