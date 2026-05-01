import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const title = document.querySelector('.projects-title');
title.textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let selectedIndex = -1;
let query = '';

function getFilteredProjects() {
  return projects.filter((project) => {
    let matchesQuery = Object.values(project).join('\n').toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
  });
}

function renderPieChart(projectsGiven) {
  let svg = d3.select('svg');
  svg.selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  newArcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', i === selectedIndex ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        svg
          .selectAll('path')
          .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

        legend
          .selectAll('li')
          .attr('class', (_, idx) =>
            idx === selectedIndex ? 'legend-item selected' : 'legend-item'
          );

        // Filter by BOTH query and selected year
        let filtered = getFilteredProjects();
        if (selectedIndex !== -1) {
          filtered = filtered.filter((p) => p.year == newData[selectedIndex].label);
        }
        renderProjects(filtered, projectsContainer, 'h2');
      });
  });

  let legend = d3.select('.legend');
  newData.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', i === selectedIndex ? 'legend-item selected' : 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('change', (event) => {
  query = event.target.value;

  // Filter by BOTH query and selected year
  let filtered = getFilteredProjects();
  if (selectedIndex !== -1) {
    let svg = d3.select('svg');
    let currentData = d3.rollups(filtered, (v) => v.length, (d) => d.year)
      .map(([year, count]) => ({ value: count, label: year }));
    if (currentData[selectedIndex]) {
      filtered = filtered.filter((p) => p.year == currentData[selectedIndex].label);
    }
  }

  renderProjects(filtered, projectsContainer, 'h2');
  renderPieChart(getFilteredProjects());
});
