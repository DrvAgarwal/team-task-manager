const api = async (url, options = {}) => {
    options.credentials = 'same-origin';
    options.headers = options.headers || {};
    if (!(options.body instanceof FormData) && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
        options.headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || (data.details && data.details[0]) || 'API Error');
    return data;
};

const showError = (id, msg) => {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
};

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path === '/login') initAuth('loginForm', '/api/auth/login');
    if (path === '/signup') initAuth('signupForm', '/api/auth/signup');
    if (path === '/dashboard') initDashboard();
    if (path === '/projects') initProjects();
    if (path.match(/^\/projects\/[a-f0-9]+\/tasks$/)) initProjectTasks();

    document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        await api('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    });
});

function initAuth(formId, endpoint) {
    document.getElementById(formId)?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api(endpoint, { method: 'POST', body: Object.fromEntries(new FormData(e.target)) });
            window.location.href = endpoint.includes('login') ? '/dashboard' : '/login';
        } catch (err) { showError('authError', err.message); }
    });
}

async function initDashboard() {
    try {
        const data = await api('/api/dashboard');
        const render = (tasks) => tasks.map(t => `<div class="task-card"><h4>${t.title}</h4><small>${t.project.name}</small><p class="status ${t.status}">${t.status} | Due: ${new Date(t.dueDate).toLocaleDateString()}</p></div>`).join('');
        document.getElementById('overdueList').innerHTML = render(data.overdueTasks);
        document.getElementById('upcomingList').innerHTML = render(data.upcomingTasks);
        document.getElementById('overdueCount').textContent = data.overdueTasks.length;
        document.getElementById('upcomingCount').textContent = data.upcomingTasks.length;
    } catch (err) { console.error(err); }
}

async function initProjects() {
    try {
        const projects = await api('/api/projects');
        document.getElementById('projectList').innerHTML = projects.map(p => `
      <div class="card" style="margin-bottom:1rem;cursor:pointer;" onclick="window.location.href='/projects/${p._id}/tasks'">
        <h3>${p.name}</h3><p>${p.description || ''}</p><small>Role: ${p.myRole}</small>
      </div>`).join('');
    } catch (err) { }

    document.getElementById('createProjectBtn')?.addEventListener('click', () => document.getElementById('projectModal').classList.add('active'));
    document.getElementById('closeProjectModal')?.addEventListener('click', () => document.getElementById('projectModal').classList.remove('active'));
    document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try { await api('/api/projects', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) }); window.location.reload(); }
        catch (err) { alert(err.message); }
    });
}

let currentTaskId = null;
window.openEditTaskModal = (taskId) => { currentTaskId = taskId; document.getElementById('editTaskModal').classList.add('active'); };

async function initProjectTasks() {
    const projectId = window.location.pathname.split('/')[2];
    try {
        const projData = await api(`/api/projects/${projectId}`);
        document.getElementById('projectName').textContent = projData.project.name;
        if (projData.role === 'Admin') {
            document.getElementById('adminControls').style.display = 'block';
            const members = await api(`/api/projects/${projectId}/members`);
            document.getElementById('taskAssignee').innerHTML = '<option value="">Unassigned</option>' + members.map(m => `<option value="${m.user._id}">${m.user.name}</option>`).join('');
        }

        const tasks = await api(`/api/tasks/project/${projectId}`);
        ['todo', 'in-progress', 'done'].forEach(status => {
            document.getElementById(`${status}Col`).innerHTML = tasks.filter(t => t.status === status).map(t => `
        <div class="task-card" onclick="openEditTaskModal('${t._id}')">
          <h4>${t.title}</h4><small>Assignee: ${t.assignee?.name || 'Unassigned'}</small><br><small>Due: ${new Date(t.dueDate).toLocaleDateString()}</small>
        </div>`).join('');
        });
    } catch (err) { }

    document.getElementById('addTaskBtn')?.addEventListener('click', () => document.getElementById('taskModal').classList.add('active'));
    document.getElementById('taskForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = Object.fromEntries(new FormData(e.target)); body.projectId = projectId;
        try { await api('/api/tasks', { method: 'POST', body }); window.location.reload(); } catch (err) { alert(err.message); }
    });
    document.getElementById('editTaskForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try { await api(`/api/tasks/${currentTaskId}`, { method: 'PUT', body: Object.fromEntries(new FormData(e.target)) }); window.location.reload(); } catch (err) { alert(err.message); }
    });
}
