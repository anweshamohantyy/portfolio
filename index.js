import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');

// 👇 FIXED variable name
const profile = await fetchGitHubData('anweshamohantyy');

const profileStats = document.querySelector('#profile-stats');

profileStats.innerHTML = `
  <dl>
    <dt>Public repos</dt><dd>${profile.public_repos}</dd>
    <dt>Public gists</dt><dd>${profile.public_gists}</dd>
    <dt>Followers</dt><dd>${profile.followers}</dd>
    <dt>Following</dt><dd>${profile.following}</dd>
  </dl>
`;
