import * as d3 from 'd3';
import countries from '../data/countries.csv';
import seizures from '../data/seizuresdata2.csv';

let margin = { top: 100, right: 20, bottom: 100, left: 20 },
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

/** MAP **/
let svg = d3.select("#map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("z-index", "0")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Map and projection
let projection = d3.geoNaturalEarth1()
    .scale(width / 1.8 / Math.PI)
    .translate([width / 2.2, height / 2])

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(d) {
    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(d.features)
        .join("path")

    // draw each country
    .attr("d", d3.geoPath()
            .projection(projection)
        )
        // Set id
        .attr("id", function(d) { return d.properties.name; })
        .attr("fill", function(d) {
            // Make Antarctica disappear (fill)
            if (d.properties.name != "Antarctica") {
                return "#000000";
            } else {
                return "#ffffff";
            }
        })
        .style('stroke', function(d) {
            // Make Antarctica disappear (outline)
            if (d.properties.name != "Antarctica") {
                return "#d9fcea";
            } else {
                return "#ffffff";
            }
        })

}).then(function() {})

//slider
let slider = document.getElementById("slider");
let output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
    output.innerHTML = (this.value);
}

afficheDataMap()

function afficheDataMap(annee) {
    //Pour chacun des pays
    countries.forEach(country => {
        //Pour l'annee en question
        if (country.Year == annee) {
            //Quelle est la drogue la plus saisie
            let mostSaisie = ''
            let kgSaisi

            seizures.forEach(saisie => {

                if (country.country == saisie.Country) {

                }
            })
        }

    })
}