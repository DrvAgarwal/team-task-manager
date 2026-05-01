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

const hideError = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
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
        const renderTask = (t) => `
            <div class="dash-task-item">
                <h4>${t.title}</h4>
                <div class="meta">${t.project.name} &nbsp;|&nbsp; ${t.status} &nbsp;|&nbsp; Due: ${new Date(t.dueDate).toLocaleDateString()}</div>
            </div>`;
        const overdueHTML = data.overdueTasks.length ? data.overdueTasks.map(renderTask).join('') : '<div class="empty-state"><div class="icon">✅</div>No overdue tasks</div>';
        const upcomingHTML = data.upcomingTasks.length ? data.upcomingTasks.map(renderTask).join('') : '<div class="empty-state"><div class="icon">📭</div>No upcoming tasks</div>';
        document.getElementById('overdueList').innerHTML = overdueHTML;
        document.getElementById('upcomingList').innerHTML = upcomingHTML;
        document.getElementById('overdueCount').textContent = data.overdueTasks.length;
        document.getElementById('upcomingCount').textContent = data.upcomingTasks.length;
    } catch (err) { console.error(err); }
}

let currentProjectId = null;

async function loadMembers(projectId) {
    const members = await api(`/api/projects/${projectId}/members`);
    document.getElementById('membersListBody').innerHTML = members.map(m => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0.75rem;background:var(--surface-2);border-radius:var(--radius-sm);margin-bottom:0.5rem;border:1px solid var(--border);">
            <div>
                <span style="font-weight:600;font-size:0.875rem;">${m.user.name}</span>
                <span style="color:var(--text-muted);font-size:0.78rem;margin-left:0.5rem;">${m.user.email}</span>
            </div>
            <span style="font-size:0.75rem;font-weight:600;padding:0.2rem 0.6rem;border-radius:20px;background:${m.role === 'Admin' ? 'var(--accent-light)' : 'var(--success-light)'};color:${m.role === 'Admin' ? 'var(--accent)' : 'var(--success)'};">${m.role}</span>
        </div>`).join('') || '<div style="color:var(--text-muted);font-size:0.875rem;">No members yet</div>';
    return members;
}

async function initProjects() {
    try {
        const projects = await api('/api/projects');
        document.getElementById('projectList').innerHTML = projects.length ? projects.map(p => `
            <div class="project-card">
                <h3>${p.name}</h3>
                <p>${p.description || 'No description'}</p>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:1rem;">
                    <span class="role-badge ${p.myRole === 'Admin' ? 'admin' : 'member'}">${p.myRole}</span>
                    <div style="display:flex;gap:0.5rem;">
                        ${p.myRole === 'Admin' ? `<button class="btn-ghost" style="padding:0.4rem 0.75rem;font-size:0.78rem;" onclick="openMemberModal('${p._id}')">👥 Members</button>` : ''}
                        <button class="btn-primary" style="padding:0.4rem 0.75rem;font-size:0.78rem;" onclick="window.location.href='/projects/${p._id}/tasks'">View Tasks →</button>
                    </div>
                </div>
            </div>`).join('') : '<div class="empty-state"><div class="icon">📁</div>No projects yet. Create one!</div>';
    } catch (err) { console.error(err); }

    // Create Project
    document.getElementById('createProjectBtn')?.addEventListener('click', () => document.getElementById('projectModal').classList.add('active'));
    document.getElementById('closeProjectModal')?.addEventListener('click', () => document.getElementById('projectModal').classList.remove('active'));
    document.getElementById('cancelProjectBtn')?.addEventListener('click', () => document.getElementById('projectModal').classList.remove('active'));
    document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/api/projects', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) });
            window.location.reload();
        } catch (err) { showError('projectError', err.message); }
    });

    // Add Member
    document.getElementById('closeMemberModal')?.addEventListener('click', () => document.getElementById('memberModal').classList.remove('active'));
    document.getElementById('cancelMemberBtn')?.addEventListener('click', () => document.getElementById('memberModal').classList.remove('active'));
    document.getElementById('memberForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError('memberError');
        try {
            await api(`/api/projects/${currentProjectId}/members`, { method: 'POST', body: Object.fromEntries(new FormData(e.target)) });
            e.target.reset();
            await loadMembers(currentProjectId);
        } catch (err) { showError('memberError', err.message); }
    });
}

window.openMemberModal = async (projectId) => {
    currentProjectId = projectId;
    document.getElementById('memberModal').classList.add('active');
    await loadMembers(projectId);
};

let currentTaskId = null;
window.openEditTaskModal = (taskId) => {
    currentTaskId = taskId;
    document.getElementById('editTaskModal').classList.add('active');
};

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
        const counts = { todo: 0, 'in-progress': 0, done: 0 };
        ['todo', 'in-progress', 'done'].forEach(status => {
            const filtered = tasks.filter(t => t.status === status);
            counts[status] = filtered.length;
            const colId = status === 'in-progress' ? 'inProgressCol' : `${status}Col`;
            document.getElementById(colId).innerHTML = filtered.map(t => `
                <div class="task-card" onclick="openEditTaskModal('${t._id}')">
                    <h4>${t.title}</h4>
                    <div class="task-meta">
                        <span>👤 ${t.assignee?.name || 'Unassigned'}</span>
                        <span>📅 Due: ${new Date(t.dueDate).toLocaleDateString()}</span>
                    </div>
                </div>`).join('') || '<div style="color:var(--text-muted);font-size:0.8rem;padding:0.5rem;">No tasks</div>';
        });

        if (document.getElementById('todoCount')) document.getElementById('todoCount').textContent = counts['todo'];
        if (document.getElementById('progressCount')) document.getElementById('progressCount').textContent = counts['in-progress'];
        if (document.getElementById('doneCount')) document.getElementById('doneCount').textContent = counts['done'];

    } catch (err) { console.error(err); }

    document.getElementById('addTaskBtn')?.addEventListener('click', () => document.getElementById('taskModal').classList.add('active'));
    document.getElementById('closeTaskModal')?.addEventListener('click', () => document.getElementById('taskModal').classList.remove('active'));
    document.getElementById('cancelTaskBtn')?.addEventListener('click', () => document.getElementById('taskModal').classList.remove('active'));
    document.getElementById('closeEditModal')?.addEventListener('click', () => document.getElementById('editTaskModal').classList.remove('active'));
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => document.getElementById('editTaskModal').classList.remove('active'));

    document.getElementById('taskForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = Object.fromEntries(new FormData(e.target));
        body.projectId = projectId;
        try { await api('/api/tasks', { method: 'POST', body }); window.location.reload(); }
        catch (err) { showError('taskError', err.message); }
    });

    document.getElementById('editTaskForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try { await api(`/api/tasks/${currentTaskId}`, { method: 'PUT', body: Object.fromEntries(new FormData(e.target)) }); window.location.reload(); }
        catch (err) { alert(err.message); }
    });
}