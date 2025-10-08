// 🔹 CONFIGURACIÓN DE REPOSITORIOS
const repos = {
    java: {
        owner: 'HiImGhost666',
        repo: 'Tareas_Programacion',
        path: 'src'
    },
    php: {
        owner: 'HiImGhost666',
        repo: 'DSW-T1',
        path: 'public' // puedes cambiarlo cuando el repo esté creado
    },
    javascript: {
        owner: 'HiImGhost666',
        repo: 'JavaScript',
        path: '' // lo mismo aquí
    },
    python: {
        owner: 'HiImGhost666',
        repo: 'Python',
        path: '' // lo mismo aqui
    }
    
};

// Estado inicial
let currentRepo = 'java';
let currentPath = repos[currentRepo].path;
let pathHistory = [];
let allFiles = [];

const directoryElement = document.getElementById('directory');
const codeElement = document.getElementById('code');
const backButton = document.getElementById('back-button');
const navbarButtons = document.querySelectorAll('#repo-navbar button');

// --- FUNCIONES PRINCIPALES ---

async function fetchContents(path) {
    const { owner, repo } = repos[currentRepo];
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    const data = await response.json();
    return data;
}

function sortContents(contents) {
    return contents.sort((a, b) => {
        if (a.type === b.type) {
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        }
        return a.type === 'dir' ? -1 : 1;
    });
}

function displayDirectory(contents) {
    directoryElement.innerHTML = '';
    const sorted = sortContents(contents);

    if (currentPath !== repos[currentRepo].path) {
        backButton.classList.remove('hidden');
    } else {
        backButton.classList.add('hidden');
    }

    directoryElement.appendChild(backButton);
    sorted.forEach(item => {
        const div = document.createElement('div');
        if (item.type === 'dir') {
            div.textContent = `📁 ${item.name}`;
            div.addEventListener('click', () => {
                pathHistory.push(currentPath);
                currentPath = item.path;
                fetchContents(item.path).then(displayDirectory);
            });
        } else if (item.type === 'file' && (item.name.endsWith('.java') || item.name.endsWith('.txt') || item.name.endsWith('.php') || item.name.endsWith('.js') || item.name.endsWith('.py'))) {
            div.textContent = `📄 ${item.name}`;
            div.addEventListener('click', () => fetchFileContent(item));
            allFiles.push(item);
        }
        directoryElement.appendChild(div);
    });
}

async function fetchFileContent(file) {
    const response = await fetch(file.download_url);
    const text = await response.text();
    codeElement.textContent = text;
}

backButton.addEventListener('click', () => {
    if (pathHistory.length > 0) {
        currentPath = pathHistory.pop();
        fetchContents(currentPath).then(displayDirectory);
    }
});

// 🔹 FUNCIÓN PARA CAMBIAR DE REPO
function changeRepo(repoKey) {
    currentRepo = repoKey;
    currentPath = repos[repoKey].path;
    pathHistory = [];
    allFiles = [];

    // Actualizar botones activos
    navbarButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#repo-navbar button[data-repo="${repoKey}"]`).classList.add('active');

    // Cargar nuevo repositorio
    codeElement.textContent = ''; // limpiar contenido
    fetchContents(currentPath).then(displayDirectory);
}

// Añadir eventos a los botones del navbar
navbarButtons.forEach(btn => {
    btn.addEventListener('click', () => changeRepo(btn.dataset.repo));
});

// Carga inicial
fetchContents(currentPath).then(displayDirectory);
