/**
 * Student Complaint & Grievance Management System - Student Portal Controller
 * 
 * Note: This project uses localStorage because it is a frontend-only academic project.
 * Production systems should use a secure backend and database.
 */

const StudentController = {
    // 1. Dashboard Initialization
    initDashboard() {
        const student = Auth.requireStudent('login.html');
        if (!student) return;

        // Render Welcome Banner
        const welcomeEl = document.getElementById('student-welcome-name');
        if (welcomeEl) welcomeEl.textContent = student.name;

        const deptYearEl = document.getElementById('student-dept-year');
        if (deptYearEl) deptYearEl.textContent = `${student.department} • ${student.year} • (${student.id})`;

        // Render Statistics
        const complaints = ComplaintsManager.getStudentComplaints(student.id);
        const total = complaints.length;
        const pending = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;

        const statTotal = document.getElementById('stat-student-total');
        const statPending = document.getElementById('stat-student-pending');
        const statProgress = document.getElementById('stat-student-progress');
        const statResolved = document.getElementById('stat-student-resolved');

        if (statTotal) statTotal.textContent = total;
        if (statPending) statPending.textContent = pending;
        if (statProgress) statProgress.textContent = inProgress;
        if (statResolved) statResolved.textContent = resolved;

        // Render Recent Complaints (Last 4)
        const recentContainer = document.getElementById('recent-complaints-list');
        if (recentContainer) {
            const recent = complaints.slice(0, 4);
            if (recent.length === 0) {
                recentContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <h4>No Complaints Lodged Yet</h4>
                        <p>Have any issues or grievances regarding campus life or academics? Submit your first complaint.</p>
                        <a href="submit-complaint.html" class="btn btn-primary mt-3">Submit a Complaint</a>
                    </div>
                `;
            } else {
                recentContainer.innerHTML = recent.map(c => `
                    <div class="complaint-card hover-lift">
                        <div class="complaint-card-header">
                            <div>
                                <span class="complaint-id">${c.id}</span>
                                <h3 class="complaint-title">${c.title}</h3>
                            </div>
                            <div class="complaint-badges">
                                ${ComplaintsManager.getStatusBadge(c.status)}
                                ${ComplaintsManager.getPriorityBadge(c.priority)}
                            </div>
                        </div>
                        <p class="complaint-desc">${c.description.length > 120 ? c.description.substring(0, 120) + '...' : c.description}</p>
                        <div class="complaint-card-footer">
                            <div class="complaint-meta">
                                <span><i class="icon">📁</i> ${c.category}</span>
                                <span><i class="icon">📍</i> ${c.location}</span>
                                <span><i class="icon">📅</i> ${ComplaintsManager.formatDate(c.createdAt)}</span>
                            </div>
                            <div class="complaint-actions">
                                <a href="complaint-details.html?id=${c.id}" class="btn btn-sm btn-outline-primary">View Details</a>
                                <a href="track-complaint.html?id=${c.id}" class="btn btn-sm btn-secondary">Track</a>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    },

    // 2. Submit Complaint Form
    initSubmitForm() {
        const student = Auth.requireStudent('login.html');
        if (!student) return;

        const form = document.getElementById('submit-complaint-form');
        const descInput = document.getElementById('complaint-description');
        const charCount = document.getElementById('char-counter');
        const contactInput = document.getElementById('complaint-contact');
        const dateInput = document.getElementById('incident-date');

        // Pre-fill contact if available
        if (contactInput && !contactInput.value && student.phone) {
            contactInput.value = student.phone;
        }

        // Set max incident date to today
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.max = today;
            dateInput.value = today;
        }

        // Character counter
        if (descInput && charCount) {
            descInput.addEventListener('input', () => {
                const len = descInput.value.length;
                charCount.textContent = `${len} / 1000 characters`;
                if (len > 1000) {
                    charCount.classList.add('text-danger');
                } else {
                    charCount.classList.remove('text-danger');
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const title = document.getElementById('complaint-title').value;
                const category = document.getElementById('complaint-category').value;
                const description = descInput ? descInput.value : '';
                const location = document.getElementById('complaint-location').value;
                const incidentDate = dateInput ? dateInput.value : '';
                const priority = document.getElementById('complaint-priority').value;
                const contactInfo = contactInput ? contactInput.value : '';

                const result = ComplaintsManager.createComplaint(student, {
                    title,
                    category,
                    description,
                    location,
                    incidentDate,
                    priority,
                    contactInfo
                });

                if (!result.success) {
                    showToast(result.message, 'error');
                    return;
                }

                showToast(`Complaint registered successfully! ID: ${result.complaint.id}`, 'success');
                setTimeout(() => {
                    window.location.href = `track-complaint.html?id=${result.complaint.id}`;
                }, 1200);
            });
        }
    },

    // 3. Track Complaint
    initTrack() {
        // Can be viewed by public or logged in student
        const searchForm = document.getElementById('track-search-form');
        const trackInput = document.getElementById('track-input-id');
        const resultContainer = document.getElementById('track-result-container');

        const executeTrack = (id) => {
            if (!id || !id.trim()) {
                showToast("Please enter a valid Complaint ID.", "warning");
                return;
            }

            const cleanId = id.trim().toUpperCase();
            const complaint = Storage.getComplaintById(cleanId);

            if (!complaint) {
                if (resultContainer) {
                    resultContainer.innerHTML = `
                        <div class="empty-state animate-fade-in">
                            <div class="empty-icon">🔍</div>
                            <h4>Complaint Not Found</h4>
                            <p>No complaint record exists with ID: <strong>${cleanId}</strong>. Please verify the ID format (e.g., CMP-2026-00101).</p>
                        </div>
                    `;
                    resultContainer.style.display = 'block';
                }
                showToast("Complaint ID not found.", "error");
                return;
            }

            // Render Tracking Details & Interactive Progress Bar
            this.renderTrackingProgress(complaint, resultContainer);
        };

        // Check if URL has ?id= parameter
        const urlParams = new URLSearchParams(window.location.search);
        const paramId = urlParams.get('id');
        if (paramId) {
            if (trackInput) trackInput.value = paramId;
            executeTrack(paramId);
        }

        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (trackInput) executeTrack(trackInput.value);
            });
        }
    },

    renderTrackingProgress(complaint, container) {
        if (!container) return;

        const isTerminalReject = complaint.status === 'Rejected';
        const isTerminalClosed = complaint.status === 'Closed';

        const stages = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
        const currentStageIdx = stages.indexOf(complaint.status);

        let progressHtml = '';

        if (isTerminalReject) {
            progressHtml = `
                <div class="status-alert alert-danger mb-4">
                    <strong>Complaint Status: Rejected</strong>
                    <p class="mb-0">This complaint has been reviewed and marked as rejected by the administration.</p>
                </div>
            `;
        } else if (isTerminalClosed) {
            progressHtml = `
                <div class="status-alert alert-info mb-4">
                    <strong>Complaint Status: Closed</strong>
                    <p class="mb-0">This ticket has been officially closed.</p>
                </div>
            `;
        } else {
            // Normal 4-step stepper
            const stepsRender = stages.map((stage, idx) => {
                let stateClass = 'step-pending';
                let iconContent = idx + 1;

                if (idx < currentStageIdx || complaint.status === 'Resolved') {
                    stateClass = 'step-completed';
                    iconContent = '✓';
                } else if (idx === currentStageIdx) {
                    stateClass = 'step-active';
                }

                return `
                    <div class="stepper-step ${stateClass}">
                        <div class="step-circle">${iconContent}</div>
                        <div class="step-label">${stage}</div>
                    </div>
                `;
            }).join('<div class="stepper-line"></div>');

            progressHtml = `
                <div class="stepper-wrapper mb-4">
                    ${stepsRender}
                </div>
            `;
        }

        container.style.display = 'block';
        container.innerHTML = `
            <div class="card tracking-result-card animate-scale-up">
                <div class="card-header d-flex justify-between align-center flex-wrap gap-2">
                    <div>
                        <span class="tracking-sub">Tracking Record</span>
                        <h2 class="card-title text-primary">${complaint.id}</h2>
                    </div>
                    <div class="d-flex gap-2">
                        ${ComplaintsManager.getStatusBadge(complaint.status)}
                        ${ComplaintsManager.getPriorityBadge(complaint.priority)}
                    </div>
                </div>

                <div class="card-body">
                    ${progressHtml}

                    <div class="tracking-info-grid mb-4">
                        <div class="info-item">
                            <label>Complaint Title</label>
                            <p class="font-weight-600">${complaint.title}</p>
                        </div>
                        <div class="info-item">
                            <label>Category</label>
                            <p>${complaint.category}</p>
                        </div>
                        <div class="info-item">
                            <label>Student Name / ID</label>
                            <p>${complaint.studentName} (${complaint.studentId})</p>
                        </div>
                        <div class="info-item">
                            <label>Location of Incident</label>
                            <p>${complaint.location}</p>
                        </div>
                        <div class="info-item">
                            <label>Assigned Department</label>
                            <p class="text-primary font-weight-600">${complaint.department || 'Awaiting Assignment'}</p>
                        </div>
                        <div class="info-item">
                            <label>Submission Date</label>
                            <p>${ComplaintsManager.formatDate(complaint.createdAt, true)}</p>
                        </div>
                        <div class="info-item">
                            <label>Last Updated</label>
                            <p>${ComplaintsManager.formatDate(complaint.updatedAt, true)}</p>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="text-muted small-label">Description</label>
                        <div class="desc-box">
                            ${complaint.description}
                        </div>
                    </div>

                    ${complaint.adminResponse ? `
                        <div class="admin-response-box mb-4">
                            <div class="admin-response-header">
                                <span class="icon">💬</span>
                                <strong>Official Administration Response:</strong>
                            </div>
                            <p class="admin-response-text">${complaint.adminResponse}</p>
                            <div class="admin-response-meta">Updated: ${ComplaintsManager.formatDate(complaint.updatedAt, true)}</div>
                        </div>
                    ` : `
                        <div class="alert alert-info">
                            <span>⏳ Admin response pending review from the concerned department.</span>
                        </div>
                    `}

                    <div class="timeline-section mt-4">
                        <h4 class="mb-3">Audit Timeline & Activity Log</h4>
                        <div class="timeline-list">
                            ${(complaint.timeline || []).map(t => `
                                <div class="timeline-item">
                                    <div class="timeline-dot"></div>
                                    <div class="timeline-content">
                                        <div class="d-flex justify-between align-center">
                                            <strong>${t.status}</strong>
                                            <span class="timeline-date">${ComplaintsManager.formatDate(t.date, true)}</span>
                                        </div>
                                        <p class="timeline-note">${t.note || ''}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="card-footer d-flex justify-between flex-wrap gap-2">
                    <a href="my-complaints.html" class="btn btn-outline-secondary">Back to My Complaints</a>
                    <a href="complaint-details.html?id=${complaint.id}" class="btn btn-primary">Full Details View</a>
                </div>
            </div>
        `;
    },

    // 4. My Complaints List & Filtering
    initMyComplaints() {
        const student = Auth.requireStudent('login.html');
        if (!student) return;

        const container = document.getElementById('my-complaints-list');
        const searchInput = document.getElementById('filter-search');
        const categoryFilter = document.getElementById('filter-category');
        const statusFilter = document.getElementById('filter-status');
        const priorityFilter = document.getElementById('filter-priority');
        const sortFilter = document.getElementById('filter-sort');
        const countDisplay = document.getElementById('complaints-count-display');

        // Populate Category Filter Dropdown dynamically
        if (categoryFilter && categoryFilter.options.length <= 1) {
            ComplaintsManager.getCategories().forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                categoryFilter.appendChild(opt);
            });
        }

        const render = () => {
            const rawComplaints = ComplaintsManager.getStudentComplaints(student.id);
            const filtered = ComplaintsManager.filterComplaints(rawComplaints, {
                search: searchInput ? searchInput.value : '',
                category: categoryFilter ? categoryFilter.value : 'all',
                status: statusFilter ? statusFilter.value : 'all',
                priority: priorityFilter ? priorityFilter.value : 'all',
                sort: sortFilter ? sortFilter.value : 'newest'
            });

            if (countDisplay) {
                countDisplay.textContent = `Showing ${filtered.length} of ${rawComplaints.length} complaints`;
            }

            if (!container) return;

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📂</div>
                        <h4>No Complaints Found</h4>
                        <p>No complaints matched your current search filters or category selections.</p>
                        <button type="button" class="btn btn-sm btn-outline-secondary mt-2" onclick="StudentController.resetMyFilters()">Reset Filters</button>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="complaints-grid">
                    ${filtered.map(c => `
                        <div class="complaint-card hover-lift">
                            <div class="complaint-card-header">
                                <div>
                                    <span class="complaint-id">${c.id}</span>
                                    <h3 class="complaint-title">${c.title}</h3>
                                </div>
                                <div class="complaint-badges">
                                    ${ComplaintsManager.getStatusBadge(c.status)}
                                    ${ComplaintsManager.getPriorityBadge(c.priority)}
                                </div>
                            </div>
                            <p class="complaint-desc">${c.description.length > 130 ? c.description.substring(0, 130) + '...' : c.description}</p>
                            
                            <div class="complaint-card-footer">
                                <div class="complaint-meta">
                                    <span><i class="icon">📁</i> ${c.category}</span>
                                    <span><i class="icon">🏢</i> ${c.department || 'Not Assigned'}</span>
                                    <span><i class="icon">📅</i> ${ComplaintsManager.formatDate(c.createdAt)}</span>
                                </div>
                                <div class="complaint-actions">
                                    <a href="complaint-details.html?id=${c.id}" class="btn btn-sm btn-outline-primary">View Details</a>
                                    <a href="track-complaint.html?id=${c.id}" class="btn btn-sm btn-secondary">Track</a>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        };

        // Attach listeners
        if (searchInput) searchInput.addEventListener('input', render);
        if (categoryFilter) categoryFilter.addEventListener('change', render);
        if (statusFilter) statusFilter.addEventListener('change', render);
        if (priorityFilter) priorityFilter.addEventListener('change', render);
        if (sortFilter) sortFilter.addEventListener('change', render);

        render();
    },

    resetMyFilters() {
        const searchInput = document.getElementById('filter-search');
        const categoryFilter = document.getElementById('filter-category');
        const statusFilter = document.getElementById('filter-status');
        const priorityFilter = document.getElementById('filter-priority');
        const sortFilter = document.getElementById('filter-sort');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        if (priorityFilter) priorityFilter.value = 'all';
        if (sortFilter) sortFilter.value = 'newest';

        this.initMyComplaints();
    },

    // 5. Complaint Full Details View
    initComplaintDetails() {
        const student = Auth.requireStudent('login.html');
        if (!student) return;

        const urlParams = new URLSearchParams(window.location.search);
        const complaintId = urlParams.get('id');
        const container = document.getElementById('complaint-detail-container');

        if (!complaintId) {
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h4>No Complaint Selected</h4>
                        <p>Please select a complaint from your complaints list.</p>
                        <a href="my-complaints.html" class="btn btn-primary mt-2">View My Complaints</a>
                    </div>
                `;
            }
            return;
        }

        const complaint = Storage.getComplaintById(complaintId);
        if (!complaint) {
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h4>Complaint Not Found</h4>
                        <p>Could not locate grievance ticket ${complaintId}.</p>
                        <a href="my-complaints.html" class="btn btn-primary mt-2">View My Complaints</a>
                    </div>
                `;
            }
            return;
        }

        // Render detailed card
        if (container) {
            container.innerHTML = `
                <div class="card animate-fade-in">
                    <div class="card-header d-flex justify-between align-center flex-wrap gap-3">
                        <div>
                            <div class="d-flex align-center gap-2 mb-1">
                                <span class="badge badge-outline">${complaint.id}</span>
                                <span class="text-muted">| Submitted on ${ComplaintsManager.formatDate(complaint.createdAt, true)}</span>
                            </div>
                            <h2 class="card-title">${complaint.title}</h2>
                        </div>
                        <div class="d-flex gap-2">
                            ${ComplaintsManager.getStatusBadge(complaint.status)}
                            ${ComplaintsManager.getPriorityBadge(complaint.priority)}
                        </div>
                    </div>

                    <div class="card-body">
                        <!-- Key Information Grid -->
                        <div class="detail-grid mb-4">
                            <div class="detail-card">
                                <label>Category</label>
                                <strong>${complaint.category}</strong>
                            </div>
                            <div class="detail-card">
                                <label>Incident Date</label>
                                <strong>${ComplaintsManager.formatDate(complaint.incidentDate)}</strong>
                            </div>
                            <div class="detail-card">
                                <label>Location</label>
                                <strong>${complaint.location}</strong>
                            </div>
                            <div class="detail-card">
                                <label>Assigned Department</label>
                                <strong class="text-primary">${complaint.department || 'Pending Assignment'}</strong>
                            </div>
                            <div class="detail-card">
                                <label>Priority Level</label>
                                <strong>${complaint.priority}</strong>
                            </div>
                            <div class="detail-card">
                                <label>Last Updated</label>
                                <strong>${ComplaintsManager.formatDate(complaint.updatedAt, true)}</strong>
                            </div>
                        </div>

                        <!-- Full Description -->
                        <div class="detail-section mb-4">
                            <h3 class="section-subtitle">Grievance Description</h3>
                            <div class="content-box">
                                ${complaint.description}
                            </div>
                        </div>

                        <!-- Administration Official Response -->
                        <div class="detail-section mb-4">
                            <h3 class="section-subtitle">Official Administration Response</h3>
                            ${complaint.adminResponse ? `
                                <div class="admin-response-box">
                                    <div class="admin-response-header">
                                        <span class="icon">🏛️</span>
                                        <strong>College Administration Remark</strong>
                                    </div>
                                    <p class="admin-response-text">${complaint.adminResponse}</p>
                                    <div class="admin-response-meta">
                                        Department: ${complaint.department || 'Administrative Office'} • Updated: ${ComplaintsManager.formatDate(complaint.updatedAt, true)}
                                    </div>
                                </div>
                            ` : `
                                <div class="alert alert-info">
                                    <span>The administration has received your complaint and is currently evaluating it. Once actions are logged or a reply is posted, it will appear here.</span>
                                </div>
                            `}
                        </div>

                        <!-- Timeline -->
                        <div class="detail-section">
                            <h3 class="section-subtitle">Status Lifecycle & Timeline</h3>
                            <div class="timeline-list">
                                ${(complaint.timeline || []).map(t => `
                                    <div class="timeline-item">
                                        <div class="timeline-dot"></div>
                                        <div class="timeline-content">
                                            <div class="d-flex justify-between align-center">
                                                <strong>${t.status}</strong>
                                                <span class="timeline-date">${ComplaintsManager.formatDate(t.date, true)}</span>
                                            </div>
                                            <p class="timeline-note">${t.note || ''}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="card-footer d-flex justify-between flex-wrap gap-2">
                        <a href="my-complaints.html" class="btn btn-outline-secondary">← Back to My Complaints</a>
                        <div class="d-flex gap-2">
                            <a href="track-complaint.html?id=${complaint.id}" class="btn btn-outline-primary">Track Live Progress</a>
                            <button type="button" class="btn btn-secondary" onclick="window.print()">Print Details</button>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // 6. Student Profile
    initProfile() {
        const student = Auth.requireStudent('login.html');
        if (!student) return;

        // Populate Fields
        const idDisplay = document.getElementById('profile-id-display');
        const nameDisplay = document.getElementById('profile-name-display');
        const emailDisplay = document.getElementById('profile-email-display');
        const deptDisplay = document.getElementById('profile-dept-display');
        const yearDisplay = document.getElementById('profile-year-display');

        const inputName = document.getElementById('profile-edit-name');
        const inputEmail = document.getElementById('profile-edit-email');
        const inputPhone = document.getElementById('profile-edit-phone');
        const inputDept = document.getElementById('profile-edit-dept');
        const inputYear = document.getElementById('profile-edit-year');

        // Form fields
        if (idDisplay) idDisplay.textContent = student.id;
        if (nameDisplay) nameDisplay.textContent = student.name;
        if (emailDisplay) emailDisplay.textContent = student.email;
        if (deptDisplay) deptDisplay.textContent = student.department;
        if (yearDisplay) yearDisplay.textContent = student.year;

        if (inputName) inputName.value = student.name || '';
        if (inputEmail) inputEmail.value = student.email || '';
        if (inputPhone) inputPhone.value = student.phone || '';
        if (inputDept) inputDept.value = student.department || '';
        if (inputYear) inputYear.value = student.year || '';

        // Statistics
        const complaints = ComplaintsManager.getStudentComplaints(student.id);
        const statTotal = document.getElementById('profile-stat-total');
        const statResolved = document.getElementById('profile-stat-resolved');
        const statPending = document.getElementById('profile-stat-pending');

        if (statTotal) statTotal.textContent = complaints.length;
        if (statResolved) statResolved.textContent = complaints.filter(c => c.status === 'Resolved').length;
        if (statPending) statPending.textContent = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'In Progress').length;

        // Edit Form Submission
        const form = document.getElementById('profile-edit-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const updated = Storage.updateStudent(student.id, {
                    name: inputName.value.trim(),
                    email: inputEmail.value.trim(),
                    phone: inputPhone.value.trim(),
                    department: inputDept.value.trim(),
                    year: inputYear.value.trim()
                });

                if (updated) {
                    showToast("Profile details updated successfully!", "success");
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showToast("Failed to update profile.", "error");
                }
            });
        }
    }
};
