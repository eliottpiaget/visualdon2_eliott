import * as d3 from 'd3';
import countries from '../data/countries.csv';
import seizures from '../data/seizuresdata2.csv';

let margin = { top: 20, right: 20, bottom: 20, left: 20 },
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

/** MAP **/
let svg = d3.select("#map")
    .append("svg")
    .attr('class', 'map')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height)
    .style("z-index", "0")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Map and projection
let projection = d3.geoNaturalEarth1()
    .scale(width / 1.8 / Math.PI)
    .translate([width / 2.2, height / 1.9])

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(d) {
    // Draw the map
    svg.append("g")
        .attr('class', 'groupPath')
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
}).then(function() {
    dataTopClassement(slider.value)
    dataBubbleMap(slider.value)
})

/////////////////////////////////////////////////////////////////////////////////////
//slider
let slider = document.getElementById("slider");
let output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
        output.innerHTML = (this.value);
        dataBubbleMap(this.value)
        dataTopClassement(this.value)
    }
    ////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////
//Get all drug names
let drugNames = []
seizures.forEach(saisie => {
        drugNames.push(saisie.Drug)
    })
    //Get every name only once in the array
drugNames.sort()
drugNames = [...new Set(drugNames)]
    /////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////
//DATA BUBBLE MAP
function dataBubbleMap(annee) {
    d3.select('.groupBubble').remove()
        //Pour chaque pays
    countries.forEach(pays => {
        let centroid
        let coordX
        let coordY
        if (d3.select('#' + pays.country)._groups[0][0] !== null) {
            let geometry = d3.select('#' + pays.country)._groups[0][0].__data__.geometry
                //Get the center of country
            centroid = d3.geoPath().projection(projection).centroid(geometry)
            coordX = centroid[0]
            coordY = centroid[1]
                //Gérer le cas de la France (Pas exactement en France à cause des îles)
            if (pays.country == 'France') {
                coordX += 25
                coordY -= 20
            }

            //Bubbles de données
            d3.select('.map').append('g').attr('class', 'groupBubble')
                //Get Plus grosses saisies par pays
            let mostSaisie = ''
            let mostKgSaisi = 0
            drugNames.forEach(drug => {
                    let kgSaisie = 0
                    seizures.forEach(saisie => {
                        if (saisie.Drug == drug && saisie.Year == annee && saisie.Country == pays.country) {
                            kgSaisie += parseInt(saisie.KgEquivalent)
                        }
                    })
                    if (kgSaisie > mostKgSaisi) {
                        mostKgSaisi = kgSaisie
                        mostSaisie = drug
                    }
                })
                //Si la saisie est plus grande que 1 tonne
                //Changer la couleur pour les groupes de drogues différents
            let drugGroup = ''
            seizures.forEach(saisie => {
                if (saisie.Drug == mostSaisie) drugGroup = saisie.DrugGroup
            })
            let drugGroupColor = 'black'
            switch (drugGroup) {
                case 'ATS':
                    drugGroupColor = 'pink'
                    break;
                case 'Cannabis-type':
                    drugGroupColor = 'green'
                    break;
                case 'Cocaine-type':
                    drugGroupColor = 'black'
                    break;
                case 'Hallucinogens':
                    drugGroupColor = 'blue'
                    break;
                case 'Non-specified':
                    drugGroupColor = 'Aqua'
                    break;
                case 'Opioids':
                    drugGroupColor = 'red'
                    break;
                case 'Other miscellaneous':
                    drugGroupColor = 'grey'
                    break;
                case 'Precursors':
                    drugGroupColor = 'brown'
                    break;
                case 'Sedatives and Tranquillizers':
                    drugGroupColor = 'orange'
                    break;
                case 'Solvents and Inhallants':
                    drugGroupColor = 'SlateBlue'
                    break;
                case 'Substances not under international control':
                    drugGroupColor = 'DarkBlue'
                    break;
            }
            if (mostKgSaisi >= 1000) {
                //Créer les cercles
                d3.select('.groupBubble').append('circle').attr('class', 'c')
                    .attr('cx', coordX).attr('cy', coordY)
                    .attr('r', 6)
                    .style('fill', drugGroupColor)
                    //Fonction pour le hover de la souris sur les cercles
                    .on('mouseover', function(d) {
                        //Box d'infos
                        d3.select('.map').append('g').attr('class', 'groupHover')
                            .attr('transform', 'translate(' + coordX + ',' + (coordY - 45) + ')')
                            .append('rect').attr('class', 'boxInfo').attr('width', ((mostSaisie.length + 10) * 10)).attr('height', 40)
                            .style('fill', '#d9fcea').style('stroke', '#000000')
                            //Texte
                        d3.select('.groupHover').append('text')
                            .text(pays.country).attr('text-anchor', 'middle').attr('dominant-baseline', "middle")
                            .attr('x', d3.select('.boxInfo').attr('width') / 2).attr('y', d3.select('.boxInfo').attr('height') / 3)
                        d3.select('.groupHover').append('text')
                            .text(mostSaisie + ' : ' + mostKgSaisi + 'kg').attr('text-anchor', 'middle').attr('dominant-baseline', "middle")
                            .attr('x', d3.select('.boxInfo').attr('width') / 2).attr('y', d3.select('.boxInfo').attr('height') * 2 / 3)
                    })
            }
        }
    })
    dataHoverOff()
}
/////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////
//HOVER Off CIRCLES
function dataHoverOff() {
    d3.selectAll('.c').on('mouseout', function(d) {
        d3.select('.groupHover').remove()
    })
}
/////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////
//DATA SEIZURES CLASSEMENT
function dataTopClassement(annee) {
    d3.select('.classement').remove()
        //Data for seizures
    let classementTop3Name = []
    let classementTop3Quantity = []
        //Trouver le top 3 des drogues par année
    for (let index = 0; index < 3; index++) {
        //Drogue la plus saisie
        let already = false
        let mostKgSaisie = 0
        let mostSaisie = ''
            //Pour chaque drogue
        drugNames.forEach(drug => {
                ///////////////////////////Trouve la drogue la plus saisie 1er
                //Check si déja dans le classement
                classementTop3Name.forEach(drugAlready => {
                        if (drug == drugAlready) already = true
                    })
                    //Si la drogue est dans le classement déja, alors on ne la remet pas.
                if (!(already)) {
                    let kgSaisie = 0
                        //Pour chaque saisie
                    seizures.forEach(saisie => {
                            if (saisie.Year == annee && saisie.Drug == drug) {
                                kgSaisie += parseInt(saisie.KgEquivalent)
                            }
                        })
                        //Si la plus saisie
                    if (kgSaisie > mostKgSaisie) {
                        mostKgSaisie = kgSaisie
                        mostSaisie = drug
                    }
                }
            })
            //Add to array of classement
        classementTop3Quantity.push(mostKgSaisie)
        classementTop3Name.push(mostSaisie)
    }

    //Créer la section du graph
    d3.select('body').append('div').attr('class', 'classement').append('h3').text('Les drogues les plus saisies dans le monde en kg')
    d3.select('.classement').append('svg').attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append('g').attr('class', 'graph')
        .attr('transform', "translate(" + (width / 3) + "," + 20 + ")")
        //Axe x
    let x = d3.scaleBand()
        .range([0, 500])
        .domain(classementTop3Name)
        .padding(0.2);
    d3.select('.graph').append("g")
        .attr("transform", "translate(0," + 500 + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        //Axe y
    let y = d3.scalePow()
        .exponent(0.5)
        .domain([0, classementTop3Quantity[0]])
        .range([500, 0])
    d3.select('.graph').append("g")
        .call(d3.axisLeft(y))
        //Bars
    let i = 0
    classementTop3Name.forEach(drug => {
        d3.select('.graph')
            .append('rect')
            .attr("x", x(drug))
            .attr("y", y(classementTop3Quantity[i]))
            .attr("width", x.bandwidth())
            .attr("height", 500 - y(classementTop3Quantity[i]))
            .attr("fill", "#d9fcea")
            .attr('stroke', '#000000')
        i++
    })
}
////////////////////////////////////////////////////////////////////////////////////