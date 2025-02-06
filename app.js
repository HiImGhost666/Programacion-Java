const owner = 'HiImGhost666';
const repo = 'Tareas_Programacion';
const path = 'src';

const directoryElement = document.getElementById('directory');
const codeElement = document.getElementById('code');
const searchInput = document.getElementById('search');
const backButton = document.getElementById('back-button');

let allFiles = []; // Store all files for search functionality
let currentPath = path; // Track the current directory path
let pathHistory = []; // Track the navigation history

// Fetch contents of a directory
async function fetchContents(path) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    const data = await response.json();
    return data;
}

// Sort files and folders by name
function sortContents(contents) {
    return contents.sort((a, b) => {
        if (a.type === b.type) {
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        }
        return a.type === 'dir' ? -1 : 1; // Folders first
    });
}

// Display directory contents
function displayDirectory(contents) {
    directoryElement.innerHTML = '';
    const sortedContents = sortContents(contents);

    // Show/hide the back button based on the current path
    if (currentPath !== path) {
        backButton.classList.remove('hidden');
    } else {
        backButton.classList.add('hidden');
    }

    // Add the back button to the directory listing
    directoryElement.appendChild(backButton);

    sortedContents.forEach(item => {
        const itemElement = document.createElement('div');
        if (item.type === 'dir') {
            itemElement.textContent = `📁 ${item.name}`;
            itemElement.addEventListener('click', () => {
                pathHistory.push(currentPath); // Save current path to history
                currentPath = item.path; // Update current path
                fetchContents(item.path).then(displayDirectory);
            });
        } else if (item.type === 'file' && item.name.endsWith('.java') || item.name.endsWith('.txt')) {
            itemElement.textContent = `📄 ${item.name}`;
            itemElement.addEventListener('click', () => {
                fetchFileContent(item);
            });
            allFiles.push(item); // Add file to searchable list
        }
        directoryElement.appendChild(itemElement);
    });
}

// Fetch and display file content
async function fetchFileContent(file) {
    const response = await fetch(file.download_url);
    const text = await response.text();
    codeElement.textContent = text;
}

// Search files for keywords
async function searchFiles(keyword) {
    const results = [];
    for (const file of allFiles) {
        const response = await fetch(file.download_url);
        const text = await response.text();
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
            results.push(file);
        }
    }
    return results;
}

// Debounce function to limit API calls
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Back button functionality
backButton.addEventListener('click', () => {
    if (pathHistory.length > 0) {
        currentPath = pathHistory.pop(); // Go back to the previous path
        fetchContents(currentPath).then(displayDirectory);
    }
});

// Initial load
fetchContents(currentPath).then(displayDirectory);
