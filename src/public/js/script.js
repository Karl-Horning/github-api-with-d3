// public/js/script.js
document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/data") // Get from the API route set up in app.js
        .then((response) => response.json())
        .then((data) => {
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

            const greyScale = [
                "#000000",
                "#333333",
                "#666666",
            ];

            const colourPalette = [...colours, ...greyScale];

            const barHeight = 55;
            const marginTop = 60;
            const marginRight = 0;
            const marginBottom = 10;
            const marginLeft = 30;
            const width = window.innerWidth;
            const height =
                Math.ceil((data.length + 0.1) * barHeight) +
                marginTop +
                marginBottom;

            /**
             * X-scale for positioning bars along the horizontal axis.
             * @type {d3.ScaleLinear<number, number>}
             */
            const x = d3
                .scaleLinear()
                .domain([0, d3.max(data, (d) => d.count)])
                .range([marginLeft, width - marginRight]);

            /**
             * Y-scale for positioning bars along the vertical axis.
             * @type {d3.ScaleBand<string>}
             */
            const y = d3
                .scaleBand()
                .domain(d3.range(data.length).map(String))
                .rangeRound([marginTop, height - marginBottom])
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
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr(
                    "style",
                    "max-width: 100%; height: auto; font: 10px sans-serif;"
                );

            // Append a title to the SVG.
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", marginTop / 2) // Adjusted position for the title
                .attr("text-anchor", "middle")
                .style("font-size", "18px") // Adjust the font size of the title
                .style("font-weight", "bold")
                .text("Karl Horning's GitHub Topics");

            // Append bars to the SVG.
            svg.append("g")
                .selectAll()
                .data(data)
                .join("rect")
                .attr("x", x(0))
                .attr("y", (d, i) => y(i.toString()))
                .attr("width", (d) => x(d.count) - x(0))
                .attr("height", y.bandwidth())
                .attr("fill", (d, i) =>
                    i < colourPalette.length ? colourPalette[i] : greyScale[greyScale.length - 1]
                );

            // Append labels to the SVG.
            svg.append("g")
                .attr("fill", "white")
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
                .attr("fill", "white")
                .attr("text-anchor", "start")
                .style("font-size", "14px") // Adjust the font size here
                .selectAll()
                .data(data)
                .join("text")
                .attr("x", marginLeft)
                .attr("y", (d, i) => y(i.toString()) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("dx", 8) // Adjust the distance from the bar
                .text((d) => d.topic);

            // Append top axis to the SVG.
            svg.append("g")
                .attr("transform", `translate(0,${marginTop})`)
                .call(d3.axisTop(x));

            // Append left axis to the SVG.
            svg.append("g")
                .attr("transform", `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y).tickSizeOuter(0));

            // Append the SVG to the document body.
            document.body.appendChild(svg.node());
        })
        .catch((error) => console.error("Error fetching API data:", error));
});
