// [START] SECTION: Basic Setup and Data Structures
// Section ID: BASIC_SETUP

// Global variables
let projects = [];
let currentProjectId = null;
let currentDiscussionId = null;

// Data structures
class Project {
    constructor(name, summary) {
        this.id = Date.now();
        this.name = name;
        this.summary = summary;
        this.createdDate = new Date().toISOString();
        this.discussions = [];
    }
}

class Discussion {
    constructor(title, projectId) {
        this.id = Date.now();
        this.title = title;
        this.projectId = projectId;
        this.createdDate = new Date().toISOString();
        this.messages = [];
    }
}

class Message {
    constructor(sender, text) {
        this.id = Date.now();
        this.sender = sender;
        this.text = text;
        this.timestamp = new Date().toISOString();
    }
}

// Utility functions
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}
// [END] SECTION: Basic Setup and Data Structures

// [START] SECTION: Project Management Functions
// Section ID: PROJECT_MANAGEMENT
// Project management functions
function addNewProject() {
    const name = $('#new-project-name').value;
    const summary = $('#new-project-summary').value;
    if (name && summary) {
        const newProject = new Project(name, summary);
        projects.push(newProject);
        closeModal('new-project-modal');
        renderProjects();
        saveToLocalStorage();
    }
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        projects = projects.filter(p => p.id !== projectId);
        renderProjects();
        renderDiscussions();
        saveToLocalStorage();
    }
}

function editProject(projectId) {
    currentProjectId = projectId;
    const project = projects.find(p => p.id === projectId);
    $('#edit-project-name').value = project.name;
    $('#edit-project-summary').value = project.summary;
    openModal('edit-project-modal');
}

function updateProject() {
    const name = $('#edit-project-name').value;
    const summary = $('#edit-project-summary').value;
    if (name && summary) {
        const projectIndex = projects.findIndex(p => p.id === currentProjectId);
        projects[projectIndex].name = name;
        projects[projectIndex].summary = summary;
        closeModal('edit-project-modal');
        renderProjects();
        renderDiscussions();
        saveToLocalStorage();
    }
}

function renderProjects() {
    const container = $('#projects-container');
    container.innerHTML = '';
    projects.forEach(project => {
        const projectElement = createElementFromHTML(`
            <div class="list-item">
                <div class="list-item-info">
                    <h3>${project.name}</h3>
                    <p>${project.summary}</p>
                    <small>Created: ${new Date(project.createdDate).toLocaleDateString()}</small>
                </div>
                <div class="list-item-actions">
                    <button onclick="editProject(${project.id})">Edit</button>
                    <button onclick="openTab('discussion-list')">View Discussions</button>
                    <button class="delete" onclick="deleteProject(${project.id})">Delete</button>
                </div>
            </div>
        `);
        container.appendChild(projectElement);
    });
}
// [END] SECTION: Project Management Functions
// [START] SECTION: Discussion Management Functions
// Section ID: DISCUSSION_MANAGEMENT
// Discussion management functions
function openNewDiscussionModal(projectId) {
    currentProjectId = projectId;
    openModal('new-discussion-modal');
}

function addNewDiscussion() {
    const title = $('#new-discussion-title').value;
    if (title) {
        const projectIndex = projects.findIndex(p => p.id === currentProjectId);
        const newDiscussion = new Discussion(title, currentProjectId);
        projects[projectIndex].discussions.push(newDiscussion);
        closeModal('new-discussion-modal');
        renderDiscussions();
        saveToLocalStorage();
    }
}

function deleteDiscussion(projectId, discussionId) {
    if (confirm('Are you sure you want to delete this discussion?')) {
        const projectIndex = projects.findIndex(p => p.id === projectId);
        projects[projectIndex].discussions = projects[projectIndex].discussions.filter(d => d.id !== discussionId);
        renderDiscussions();
        saveToLocalStorage();
    }
}

function renderDiscussions() {
    const container = $('#discussions-container');
    container.innerHTML = '';
    projects.forEach(project => {
        const projectElement = createElementFromHTML(`
            <div class="project-discussions">
                <h2>${project.name}</h2>
                <button onclick="openNewDiscussionModal(${project.id})">New Discussion</button>
                <div class="discussions-list"></div>
            </div>
        `);
        const discussionsList = projectElement.querySelector('.discussions-list');
        project.discussions.forEach(discussion => {
            const discussionElement = createElementFromHTML(`
                <div class="list-item">
                    <div class="list-item-info">
                        <h3>${discussion.title}</h3>
                        <small>Created: ${new Date(discussion.createdDate).toLocaleDateString()}</small>
                    </div>
                    <div class="list-item-actions">
                        <button onclick="openDiscussion(${project.id}, ${discussion.id})">Open</button>
                        <button class="delete" onclick="deleteDiscussion(${project.id}, ${discussion.id})">Delete</button>
                    </div>
                </div>
            `);
            discussionsList.appendChild(discussionElement);
        });
        container.appendChild(projectElement);
    });
}

function openDiscussion(projectId, discussionId) {
    currentProjectId = projectId;
    currentDiscussionId = discussionId;
    const project = projects.find(p => p.id === projectId);
    const discussion = project.discussions.find(d => d.id === discussionId);
    
    const discussionView = $('#discussion');
    discussionView.innerHTML = `
        <h2>${discussion.title}</h2>
        <p><strong>Project:</strong> ${project.name}</p>
        <p><strong>Created:</strong> ${new Date(discussion.createdDate).toLocaleString()}</p>
        <div id="messages-container"></div>
        <div>
            <textarea id="new-message" rows="4" placeholder="Type your message..."></textarea>
            <button onclick="addMessage()">Send</button>
        </div>
    `;

    renderMessages();
    openTab('discussion');
}

function renderMessages() {
    const project = projects.find(p => p.id === currentProjectId);
    const discussion = project.discussions.find(d => d.id === currentDiscussionId);
    const container = $('#messages-container');
    container.innerHTML = '';
    discussion.messages.forEach(message => {
        const messageElement = createElementFromHTML(`
            <div class="message">
                <p><strong>${message.sender}:</strong> ${message.text}</p>
                <small>${new Date(message.timestamp).toLocaleString()}</small>
            </div>
        `);
        container.appendChild(messageElement);
    });
}

function addMessage() {
    const messageText = $('#new-message').value;
    if (messageText) {
        const projectIndex = projects.findIndex(p => p.id === currentProjectId);
        const discussionIndex = projects[projectIndex].discussions.findIndex(d => d.id === currentDiscussionId);
        
        const newMessage = new Message('User', messageText); // Replace 'User' with actual user name when implemented
        projects[projectIndex].discussions[discussionIndex].messages.push(newMessage);
        $('#new-message').value = '';
        saveToLocalStorage();
        renderMessages();
    }
}
// [END] SECTION: Discussion Management Functions

// [START] SECTION: Local Storage and Tab Management
// Section ID: STORAGE_AND_TABS
// Local Storage functions
function saveToLocalStorage() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function loadFromLocalStorage() {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
        projects = JSON.parse(storedProjects);
        // Restore class methods
        projects.forEach(project => {
            Object.setPrototypeOf(project, Project.prototype);
            project.discussions.forEach(discussion => {
                Object.setPrototypeOf(discussion, Discussion.prototype);
                discussion.messages.forEach(message => {
                    Object.setPrototypeOf(message, Message.prototype);
                });
            });
        });
        renderProjects();
        renderDiscussions();
    }
}

// Tab management functions
function openTab(tabName) {
    const tabContents = $$('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    $(`#${tabName}`).classList.add('active');

    const tabs = $$('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    $(`[data-tab="${tabName}"]`).classList.add('active');
}

// Modal management functions
function openModal(modalId) {
    $(`#${modalId}`).style.display = 'block';
}

function closeModal(modalId) {
    $(`#${modalId}`).style.display = 'none';
}

// Event listeners for close buttons in modals
$$('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        modal.style.display = 'none';
    });
});

// Event listener for clicks outside the modal
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});
// [END] SECTION: Local Storage and Tab Management

// [START] SECTION: Code Management Helpers
// Section ID: CODE_MANAGEMENT

function getSectionCode(sectionId) {
    const fullCode = document.querySelector('script[src="app.js"]').textContent;
    const sectionRegex = new RegExp(`// \\[START\\] SECTION:.*\\n// Section ID: ${sectionId}\\n([\\s\\S]*?)// \\[END\\] SECTION:`, 'g');
    const match = sectionRegex.exec(fullCode);
    return match ? match[1].trim() : null;
}

function updateSectionCode(sectionId, newCode) {
    const script = document.querySelector('script[src="app.js"]');
    let fullCode = script.textContent;
    const sectionRegex = new RegExp(`(// \\[START\\] SECTION:.*\\n// Section ID: ${sectionId}\\n)[\\s\\S]*?(// \\[END\\] SECTION:)`, 'g');
    const updatedCode = fullCode.replace(sectionRegex, `$1\n${newCode}\n$2`);
    
    const blob = new Blob([updatedCode], {type: 'application/javascript'});
    const newScript = document.createElement('script');
    newScript.src = URL.createObjectURL(blob);
    script.parentNode.replaceChild(newScript, script);
}

// Example usage:
// const projectManagementCode = getSectionCode('PROJECT_MANAGEMENT');
// updateSectionCode('PROJECT_MANAGEMENT', modifiedProjectManagementCode);

// [END] SECTION: Code Management Helpers

// Initialize the application
function init() {
    console.log("init function called");
    loadFromLocalStorage();
    
    // Add event listeners
    $('#create-project').addEventListener('click', addNewProject);
    $('#update-project').addEventListener('click', updateProject);
    $('#create-discussion').addEventListener('click', addNewDiscussion);
    
    // Add event listeners for tabs
    $$('.tab').forEach(tab => {
        tab.addEventListener('click', () => openTab(tab.dataset.tab));
    });

    // Add event listener for "Add New Project" button
    $('.add-new').addEventListener('click', () => {
        console.log("Add New Project button clicked");
        openModal('new-project-modal');
    });

    // Add event listeners for close buttons in modals
    $$('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            modal.style.display = 'none';
        });
    });
}

// Call init when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);