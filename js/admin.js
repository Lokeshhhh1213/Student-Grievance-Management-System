/**
 * Student Complaint & Grievance Management System - Administrator Portal Controller
 * 
 * Note: This project uses localStorage because it is a frontend-only academic project.
 * Production systems should use a secure backend and database.
 */

const AdminController = {
    // 1. Admin Dashboard
    initDashboard() {
        const admin = Auth.requireAdmin('login.html');
        if (!admin) return;

        // Render Admin details
        const adminNameEl = document.getElementById('admin-header-name');
        if (adminNameEl) adminNameEl.textContent = admin.name || "Administrator";

        const complaints = Storage.getComplaints();
        const students = Storage.getStudents();

        // Calculate Stats
        const total = complaints.length;
        const submitted = complaints.filter(c => c.status === 'Submitted').length;
        const underReview = complaints.filter(c => c.status === 'Under Review').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const rejected = complaints.filter(c => c.status === 'Rejected' || c.status === 'Closed').length;

        // Set KPI elements
        const elTotal = document.getElementById('stat-admin-total');
        const elSubmitted = document.getElementById('stat-admin-submitted');
        const elUnderReview = document.getElementById('stat-admin-under-review');
        const elInProgress = document.getElementById('stat-admin-in-progress');
        const elResolved = document.getElementById('stat-admin-resolved');
        const elRejected = document.getElementById('stat-admin-rejected');

        if (elTotal) elTotal.textContent = total;
        if (elSubmitted) elSubmitted.textContent = submitted;
        if (elUnderReview) elUnderReview.textContent = underReview;
        if (elInProgress) elInProgress.textContent = inProgress;
        if (elResolved) elResolved.textContent = resolved;
        if (elRejected) elRejected.textContent = rejected;

        // Render Recent Complaints Table
        const recentTableBody = document.getElementById('admin-recent-complaints-tbody');
        if (recentTableBody) {
            const recent = complaints.slice(0, 5);
            if (recent.length === 0) {
                recentTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No complaints recorded yet.</td></tr>`;
            } else {
                recentTableBody.innerHTML = recent.map(c => `
                    <tr>
                        <td><strong>${c.id}</strong></td>
                        <td>
                            <div>${c.studentName}</div>
                            <small class="text-muted">${c.studentId}</small>
                        </td>
                        <td>
                            <div class="font-weight-500">${c.title}</div>
                            <small class="text-muted">${c.category}</small>
                        </td>
                        <td>${ComplaintsManager.getPriorityBadge(c.priority)}</td>
                        <td>${ComplaintsManager.getStatusBadge(c.status)}</td>
                        <td>${ComplaintsManager.formatDate(c.createdAt)}</td>
                        <td>
                            <div class="table-actions">
                                <a href="complaint-details.html?id=${c.id}" class="btn btn-xs btn-outline-primary" title="View & Manage">Manage</a>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Render Pure HTML/CSS Analytics Charts
        this.renderPureCharts(complaints);
    },

    // Render pure CSS/HTML bar & distribution charts (No external library)
    renderPureCharts(complaints) {
        const total = complaints.length || 1; // avoid division by zero

        // 1. Status Chart
        const statusContainer = document.getElementById('chart-status-container');
        if (statusContainer) {
            const statusCounts = {};
            COMPLAINT_STATUSES.forEach(s => statusCounts[s] = 0);
            complaints.forEach(c => {
                statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
            });

            const statusColors = {
                'Submitted': '#0284c7',
                'Under Review': '#7c3aed',
                'In Progress': '#d97706',
                'Resolved': '#059669',
                'Rejected': '#e11d48',
                'Closed': '#475569'
            };

            statusContainer.innerHTML = `
                <div class="chart-bar-list">
                    ${Object.entries(statusCounts).map(([status, count]) => {
                        const pct = Math.round((count / total) * 100);
                        const color = statusColors[status] || '#2563eb';
                        return `
                            <div class="chart-bar-item">
                                <div class="chart-bar-header">
                                    <span>${status}</span>
                                    <strong>${count} (${pct}%)</strong>
                                </div>
                                <div class="chart-bar-track">
                                    <div class="chart-bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // 2. Category Chart
        const categoryContainer = document.getElementById('chart-category-container');
        if (categoryContainer) {
            const catCounts = {};
            COMPLAINT_CATEGORIES.forEach(c => catCounts[c] = 0);
            complaints.forEach(c => {
                if (catCounts[c.category] !== undefined) {
                    catCounts[c.category]++;
                } else {
                    catCounts[c.category] = 1;
                }
            });

            // Sort categories by count descending
            const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

            categoryContainer.innerHTML = `
                <div class="chart-bar-list">
                    ${sortedCats.map(([cat, count]) => {
                        const pct = Math.round((count / total) * 100);
                        return `
                            <div class="chart-bar-item">
                                <div class="chart-bar-header">
                                    <span>${cat}</span>
                                    <strong>${count} (${pct}%)</strong>
                                </div>
                                <div class="chart-bar-track">
                                    <div class="chart-bar-fill bg-primary" style="width: ${pct}%;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // 3. Priority Chart
        const priorityContainer = document.getElementById('chart-priority-container');
        if (priorityContainer) {
            const priorityCounts = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
            complaints.forEach(c => {
                if (priorityCounts[c.priority] !== undefined) priorityCounts[c.priority]++;
            });

            const pColors = {
                Low: '#10b981',
                Medium: '#f59e0b',
                High: '#ea580c',
                Urgent: '#ef4444'
            };

            priorityContainer.innerHTML = `
                <div class="priority-chart-grid">
                    ${Object.entries(priorityCounts).map(([p, count]) => {
                        const pct = Math.round((count / total) * 100);
                        return `
                            <div class="priority-metric-card" style="border-top-color: ${pColors[p]};">
                                <span class="priority-label">${p} Priority</span>
                                <h3 class="priority-value" style="color: ${pColors[p]};">${count}</h3>
                                <span class="text-muted small">${pct}% of total</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // 4. Department Chart
        const deptContainer = document.getElementById('chart-department-container');
        if (deptContainer) {
            const deptCounts = {};
            COLLEGE_DEPARTMENTS.forEach(d => deptCounts[d] = 0);
            complaints.forEach(c => {
                const d = c.department || 'Unassigned';
                deptCounts[d] = (deptCounts[d] || 0) + 1;
            });

            const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

            deptContainer.innerHTML = `
                <div class="chart-bar-list">
                    ${sortedDepts.map(([dept, count]) => {
                        const pct = Math.round((count / total) * 100);
                        return `
                            <div class="chart-bar-item">
                                <div class="chart-bar-header">
                                    <span>${dept}</span>
                                    <strong>${count}</strong>
                                </div>
                                <div class="chart-bar-track">
                                    <div class="chart-bar-fill" style="width: ${pct}%; background-color: #6366f1;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    },

    // 2. Manage All Complaints
    initComplaintsTable() {
        const admin = Auth.requireAdmin('login.html');
        if (!admin) return;

        const tableBody = document.getElementById('admin-complaints-tbody');
        const searchInput = document.getElementById('admin-filter-search');
        const categoryFilter = document.getElementById('admin-filter-category');
        const statusFilter = document.getElementById('admin-filter-status');
        const priorityFilter = document.getElementById('admin-filter-priority');
        const deptFilter = document.getElementById('admin-filter-dept');
        const countDisplay = document.getElementById('admin-complaints-count');

        // Populate Category and Department dropdowns
        if (categoryFilter && categoryFilter.options.length <= 1) {
            COMPLAINT_CATEGORIES.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                categoryFilter.appendChild(opt);
            });
        }

        if (deptFilter && deptFilter.options.length <= 1) {
            COLLEGE_DEPARTMENTS.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                deptFilter.appendChild(opt);
            });
        }

        const render = () => {
            const all = Storage.getComplaints();
            const filtered = ComplaintsManager.filterComplaints(all, {
                search: searchInput ? searchInput.value : '',
                category: categoryFilter ? categoryFilter.value : 'all',
                status: statusFilter ? statusFilter.value : 'all',
                priority: priorityFilter ? priorityFilter.value : 'all',
                department: deptFilter ? deptFilter.value : 'all'
            });

            if (countDisplay) {
                countDisplay.textContent = `Showing ${filtered.length} of ${all.length} total records`;
            }

            if (!tableBody) return;

            if (filtered.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="10" class="text-center py-5">
                            <div class="empty-state">
                                <h4>No complaints match the specified search or filter criteria.</h4>
                                <button type="button" class="btn btn-sm btn-outline-secondary mt-2" onclick="AdminController.resetFilters()">Reset Filters</button>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = filtered.map(c => `
                <tr>
                    <td><strong>${c.id}</strong></td>
                    <td>
                        <div class="font-weight-600">${c.studentName}</div>
                        <small class="text-muted">${c.studentId}</small>
                    </td>
                    <td>
                        <div class="font-weight-500">${c.title}</div>
                        <small class="text-muted">${c.location}</small>
                    </td>
                    <td><span class="badge badge-light">${c.category}</span></td>
                    <td>${ComplaintsManager.getPriorityBadge(c.priority)}</td>
                    <td>${ComplaintsManager.getStatusBadge(c.status)}</td>
                    <td><small class="font-weight-500">${c.department || '<span class="text-muted">Unassigned</span>'}</small></td>
                    <td><small class="text-muted">${ComplaintsManager.formatDate(c.createdAt)}</small></td>
                    <td>
                        <div class="table-actions">
                            <a href="complaint-details.html?id=${c.id}" class="btn btn-xs btn-primary" title="View & Manage">Manage</a>
                            <button type="button" class="btn btn-xs btn-danger-soft" onclick="AdminController.promptDeleteComplaint('${c.id}')" title="Delete">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        };

        if (searchInput) searchInput.addEventListener('input', render);
        if (categoryFilter) categoryFilter.addEventListener('change', render);
        if (statusFilter) statusFilter.addEventListener('change', render);
        if (priorityFilter) priorityFilter.addEventListener('change', render);
        if (deptFilter) deptFilter.addEventListener('change', render);

        render();
    },

    resetFilters() {
        const searchInput = document.getElementById('admin-filter-search');
        const categoryFilter = document.getElementById('admin-filter-category');
        const statusFilter = document.getElementById('admin-filter-status');
        const priorityFilter = document.getElementById('admin-filter-priority');
        const deptFilter = document.getElementById('admin-filter-dept');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        if (priorityFilter) priorityFilter.value = 'all';
        if (deptFilter) deptFilter.value = 'all';

        this.initComplaintsTable();
    },

    promptDeleteComplaint(id) {
        showConfirmDialog(
            "Delete Complaint Record",
            `Are you sure you want to permanently delete complaint <strong>${id}</strong>? This action cannot be undone.`,
            () => {
                const deleted = Storage.deleteComplaint(id);
                if (deleted) {
                    showToast(`Complaint ${id} was deleted successfully.`, "success");
                    this.initComplaintsTable();
                } else {
                    showToast("Failed to delete complaint.", "error");
                }
            },
            "Delete Record",
            true
        );
    },

    // 3. Admin View and Update Complaint Details
    initComplaintDetails() {
        const admin = Auth.requireAdmin('login.html');
        if (!admin) return;

        const urlParams = new URLSearchParams(window.location.search);
        const complaintId = urlParams.get('id');
        const container = document.getElementById('admin-complaint-detail-container');

        if (!complaintId) {
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h4>No Complaint Selected</h4>
                        <a href="complaints.html" class="btn btn-primary mt-2">Return to Complaints</a>
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
                        <h4>Complaint Record Not Found</h4>
                        <a href="complaints.html" class="btn btn-primary mt-2">Return to Complaints</a>
                    </div>
                `;
            }
            return;
        }

        // Render full admin management interface
        if (container) {
            container.innerHTML = `
                <div class="admin-grid-layout">
                    <!-- Left: Complaint & Student Details -->
                    <div class="card">
                        <div class="card-header d-flex justify-between align-center flex-wrap gap-2">
                            <div>
                                <span class="badge badge-outline">${complaint.id}</span>
                                <h2 class="card-title mt-1">${complaint.title}</h2>
                            </div>
                            <div class="d-flex gap-2">
                                ${ComplaintsManager.getStatusBadge(complaint.status)}
                                ${ComplaintsManager.getPriorityBadge(complaint.priority)}
                            </div>
                        </div>

                        <div class="card-body">
                            <!-- Student Profile Information -->
                            <h4 class="section-title mb-2">Student Information</h4>
                            <div class="detail-grid mb-4">
                                <div class="detail-card">
                                    <label>Student Full Name</label>
                                    <strong>${complaint.studentName}</strong>
                                </div>
                                <div class="detail-card">
                                    <label>Student ID</label>
                                    <strong>${complaint.studentId}</strong>
                                </div>
                                <div class="detail-card">
                                    <label>Email Address</label>
                                    <strong>${complaint.studentEmail}</strong>
                                </div>
                                <div class="detail-card">
                                    <label>Department</label>
                                    <strong>${complaint.studentDept || 'N/A'}</strong>
                                </div>
                                <div class="detail-card">
                                    <label>Contact Number</label>
                                    <strong>${complaint.contactInfo || 'N/A'}</strong>
                                </div>
                            </div>

                            <h4 class="section-title mb-2">Grievance Overview</h4>
                            <div class="detail-grid mb-4">
                                <div class="detail-card">
                                    <label>Category</label>
                                    <strong>${complaint.category}</strong>
                                </div>
                                <div class="detail-card">
                                    <label>Location</label>
                                    <strong>${complaint.location}</strong>
                                </div>
                                <div class="detail-card">
                                    <label>Incident Date</label>
                                    <strong>${ComplaintsManager.formatDate(complaint.incidentDate)}</strong>
                                </div>
                                <div class="detail-card">
                                    <label>Date Submitted</label>
                                    <strong>${ComplaintsManager.formatDate(complaint.createdAt, true)}</strong>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="text-muted small-label">Full Complaint Description</label>
                                <div class="content-box">
                                    ${complaint.description}
                                </div>
                            </div>

                            <h4 class="section-title mb-2">Activity History Timeline</h4>
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

                    <!-- Right: Administration Actions Form -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Administrative Actions</h3>
                            <p class="text-muted small mb-0">Update grievance resolution status, assign department, and respond.</p>
                        </div>

                        <div class="card-body">
                            <form id="admin-update-form">
                                <div class="form-group mb-3">
                                    <label for="admin-status-select" class="form-label">Update Status *</label>
                                    <select id="admin-status-select" class="form-control" required>
                                        ${COMPLAINT_STATUSES.map(s => `
                                            <option value="${s}" ${s === complaint.status ? 'selected' : ''}>${s}</option>
                                        `).join('')}
                                    </select>
                                </div>

                                <div class="form-group mb-3">
                                    <label for="admin-dept-select" class="form-label">Assign Department *</label>
                                    <select id="admin-dept-select" class="form-control" required>
                                        <option value="">-- Select Department --</option>
                                        ${COLLEGE_DEPARTMENTS.map(d => `
                                            <option value="${d}" ${d === complaint.department ? 'selected' : ''}>${d}</option>
                                        `).join('')}
                                    </select>
                                </div>

                                <div class="form-group mb-3">
                                    <label for="admin-response-textarea" class="form-label">Official Admin Response to Student</label>
                                    <textarea id="admin-response-textarea" class="form-control" rows="5" placeholder="Enter resolution notes, official response, or instructions for the student...">${complaint.adminResponse || ''}</textarea>
                                    <small class="text-muted">This response will be visible on the student's dashboard and tracking portal.</small>
                                </div>

                                <div class="form-group mb-4">
                                    <label for="admin-timeline-note" class="form-label">Internal Status Note / Action Log</label>
                                    <input type="text" id="admin-timeline-note" class="form-control" placeholder="Optional audit note (e.g. Dispatched maintenance technician to Block A)" />
                                </div>

                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-primary w-100">Save & Apply Updates</button>
                                </div>
                            </form>
                        </div>

                        <div class="card-footer d-flex justify-between align-center">
                            <span class="text-muted small">Last updated: ${ComplaintsManager.formatDate(complaint.updatedAt, true)}</span>
                            <button type="button" class="btn btn-sm btn-danger-soft" onclick="AdminController.promptDeleteComplaint('${complaint.id}')">Delete Ticket</button>
                        </div>
                    </div>
                </div>
            `;

            // Form Submit Handler
            const form = document.getElementById('admin-update-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const newStatus = document.getElementById('admin-status-select').value;
                    const newDept = document.getElementById('admin-dept-select').value;
                    const newResponse = document.getElementById('admin-response-textarea').value.trim();
                    const timelineNote = document.getElementById('admin-timeline-note').value.trim();

                    const updated = Storage.updateComplaint(complaint.id, {
                        status: newStatus,
                        department: newDept,
                        adminResponse: newResponse,
                        timelineNote: timelineNote || (newResponse ? `Admin response added: "${newResponse.substring(0, 60)}..."` : `Status updated to ${newStatus}`)
                    });

                    if (updated) {
                        showToast(`Complaint ${complaint.id} successfully updated!`, "success");
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        showToast("Failed to update complaint.", "error");
                    }
                });
            }
        }
    },

    // 4. Manage Students Directory
    initStudents() {
        const admin = Auth.requireAdmin('login.html');
        if (!admin) return;

        const tableBody = document.getElementById('admin-students-tbody');
        const searchInput = document.getElementById('admin-student-search');
        const countDisplay = document.getElementById('admin-students-count');

        const render = () => {
            const students = Storage.getStudents();
            const complaints = Storage.getComplaints();

            let query = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const filtered = students.filter(s => 
                s.name.toLowerCase().includes(query) ||
                s.id.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query) ||
                s.department.toLowerCase().includes(query)
            );

            if (countDisplay) {
                countDisplay.textContent = `Showing ${filtered.length} of ${students.length} registered students`;
            }

            if (!tableBody) return;

            if (filtered.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No student records found matching your query.</td></tr>`;
                return;
            }

            tableBody.innerHTML = filtered.map(s => {
                const studentComplaints = complaints.filter(c => c.studentId.toUpperCase() === s.id.toUpperCase());
                const totalComp = studentComplaints.length;
                const resolvedComp = studentComplaints.filter(c => c.status === 'Resolved').length;

                return `
                    <tr>
                        <td><strong>${s.id}</strong></td>
                        <td>
                            <div class="font-weight-600">${s.name}</div>
                            <small class="text-muted">${s.phone || 'No phone'}</small>
                        </td>
                        <td>${s.email}</td>
                        <td>${s.department}</td>
                        <td><span class="badge badge-light">${s.year}</span></td>
                        <td>
                            <span class="badge badge-primary">${totalComp} Total</span>
                            <span class="badge badge-resolved">${resolvedComp} Resolved</span>
                        </td>
                        <td>
                            <a href="complaints.html?search=${s.id}" class="btn btn-xs btn-outline-primary">View Grievances</a>
                        </td>
                    </tr>
                `;
            }).join('');
        };

        if (searchInput) searchInput.addEventListener('input', render);
        render();
    },

    // 5. Admin Reports
    initReports() {
        const admin = Auth.requireAdmin('login.html');
        if (!admin) return;

        const dateFilter = document.getElementById('report-date-preset');
        const customDateRow = document.getElementById('custom-date-row');
        const startDateInput = document.getElementById('report-start-date');
        const endDateInput = document.getElementById('report-end-date');
        const applyBtn = document.getElementById('report-apply-btn');

        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                if (dateFilter.value === 'custom') {
                    if (customDateRow) customDateRow.style.display = 'flex';
                } else {
                    if (customDateRow) customDateRow.style.display = 'none';
                    this.generateReport();
                }
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }

        this.generateReport();
    },

    generateReport() {
        const dateFilter = document.getElementById('report-date-preset');
        const startDateInput = document.getElementById('report-start-date');
        const endDateInput = document.getElementById('report-end-date');

        const preset = dateFilter ? dateFilter.value : 'all';
        const start = startDateInput ? startDateInput.value : '';
        const end = endDateInput ? endDateInput.value : '';

        const allComplaints = Storage.getComplaints();
        const filtered = ComplaintsManager.filterComplaints(allComplaints, {
            dateRange: preset,
            startDate: start,
            endDate: end
        });

        // Compute metrics
        const total = filtered.length;
        const resolved = filtered.filter(c => c.status === 'Resolved').length;
        const pending = filtered.filter(c => c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'In Progress').length;
        const rejected = filtered.filter(c => c.status === 'Rejected' || c.status === 'Closed').length;
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        // Populate Summary
        const elTotal = document.getElementById('report-total-count');
        const elResolved = document.getElementById('report-resolved-count');
        const elPending = document.getElementById('report-pending-count');
        const elRejected = document.getElementById('report-rejected-count');
        const elRate = document.getElementById('report-resolution-rate');

        if (elTotal) elTotal.textContent = total;
        if (elResolved) elResolved.textContent = resolved;
        if (elPending) elPending.textContent = pending;
        if (elRejected) elRejected.textContent = rejected;
        if (elRate) elRate.textContent = `${resolutionRate}%`;

        // Render breakdown table
        const tbody = document.getElementById('report-breakdown-tbody');
        if (tbody) {
            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No grievance records found in the selected timeframe.</td></tr>`;
            } else {
                tbody.innerHTML = filtered.map(c => `
                    <tr>
                        <td><strong>${c.id}</strong></td>
                        <td>${c.studentName} (${c.studentId})</td>
                        <td>${c.title}</td>
                        <td>${c.category}</td>
                        <td>${ComplaintsManager.getStatusBadge(c.status)}</td>
                        <td>${ComplaintsManager.formatDate(c.createdAt)}</td>
                    </tr>
                `).join('');
            }
        }

        // Render pure visual distribution for reports
        this.renderPureCharts(filtered);
    }
};
