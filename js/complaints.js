/**
 * Student Complaint & Grievance Management System - Complaints Logic Module
 * 
 * Note: This project uses localStorage because it is a frontend-only academic project.
 * Production systems should use a secure backend and database.
 */

const COMPLAINT_CATEGORIES = [
    "Academic",
    "Faculty",
    "Hostel",
    "Canteen",
    "Transportation",
    "Infrastructure",
    "Library",
    "Examination",
    "Fees",
    "Harassment",
    "Technical Issue",
    "Other"
];

const COMPLAINT_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const COMPLAINT_STATUSES = [
    "Submitted",
    "Under Review",
    "In Progress",
    "Resolved",
    "Rejected",
    "Closed"
];

const COLLEGE_DEPARTMENTS = [
    "Academic Department",
    "Student Affairs",
    "Hostel Administration",
    "Examination Cell",
    "Library",
    "Canteen Management",
    "Transport Department",
    "IT Department",
    "Maintenance Department"
];

const ComplaintsManager = {
    getCategories() {
        return COMPLAINT_CATEGORIES;
    },

    getPriorities() {
        return COMPLAINT_PRIORITIES;
    },

    getStatuses() {
        return COMPLAINT_STATUSES;
    },

    getDepartments() {
        return COLLEGE_DEPARTMENTS;
    },

    // Retrieve complaints for specific student
    getStudentComplaints(studentId) {
        if (!studentId) return [];
        const all = Storage.getComplaints();
        return all.filter(c => c.studentId.toUpperCase() === studentId.toUpperCase());
    },

    // Filter complaints helper
    filterComplaints(complaintsList, filters = {}) {
        let filtered = [...complaintsList];

        // Search term (ID, Title, Student Name, Student ID, Description)
        if (filters.search && filters.search.trim() !== '') {
            const query = filters.search.toLowerCase().trim();
            filtered = filtered.filter(c => 
                (c.id && c.id.toLowerCase().includes(query)) ||
                (c.title && c.title.toLowerCase().includes(query)) ||
                (c.studentName && c.studentName.toLowerCase().includes(query)) ||
                (c.studentId && c.studentId.toLowerCase().includes(query)) ||
                (c.description && c.description.toLowerCase().includes(query)) ||
                (c.location && c.location.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(c => c.category.toLowerCase() === filters.category.toLowerCase());
        }

        // Status filter
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(c => c.status.toLowerCase() === filters.status.toLowerCase());
        }

        // Priority filter
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(c => c.priority.toLowerCase() === filters.priority.toLowerCase());
        }

        // Department filter
        if (filters.department && filters.department !== 'all') {
            filtered = filtered.filter(c => c.department && c.department.toLowerCase() === filters.department.toLowerCase());
        }

        // Date Range preset filter (today, this_week, this_month, this_year, custom)
        if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            filtered = filtered.filter(c => {
                const itemDate = new Date(c.createdAt || c.incidentDate);
                if (isNaN(itemDate.getTime())) return true;

                if (filters.dateRange === 'today') {
                    return itemDate.toDateString() === now.toDateString();
                } else if (filters.dateRange === 'week') {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return itemDate >= oneWeekAgo && itemDate <= now;
                } else if (filters.dateRange === 'month') {
                    return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                } else if (filters.dateRange === 'year') {
                    return itemDate.getFullYear() === now.getFullYear();
                } else if (filters.dateRange === 'custom') {
                    const start = filters.startDate ? new Date(filters.startDate) : null;
                    const end = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null;
                    if (start && end) return itemDate >= start && itemDate <= end;
                    if (start) return itemDate >= start;
                    if (end) return itemDate <= end;
                }
                return true;
            });
        }

        // Sort (newest vs oldest)
        if (filters.sort === 'oldest') {
            filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else {
            // Default newest first
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        return filtered;
    },

    // Create a new complaint
    createComplaint(student, data) {
        if (!student) {
            return { success: false, message: "User session expired. Please log in again." };
        }

        const { title, category, description, location, incidentDate, priority, contactInfo } = data;

        if (!title || !category || !description || !location || !incidentDate || !priority) {
            return { success: false, message: "Please fill in all mandatory fields before submitting." };
        }

        if (title.trim().length < 5) {
            return { success: false, message: "Complaint title should be at least 5 characters long." };
        }

        if (description.trim().length < 15) {
            return { success: false, message: "Please provide a detailed description (at least 15 characters)." };
        }

        const newId = Storage.generateComplaintId();
        const nowIso = new Date().toISOString();

        const complaint = {
            id: newId,
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            studentDept: student.department,
            title: title.trim(),
            category: category.trim(),
            description: description.trim(),
            location: location.trim(),
            incidentDate: incidentDate,
            priority: priority.trim(),
            status: "Submitted",
            department: "",
            adminResponse: "",
            contactInfo: (contactInfo && contactInfo.trim()) ? contactInfo.trim() : student.phone,
            createdAt: nowIso,
            updatedAt: nowIso,
            timeline: [
                {
                    status: "Submitted",
                    date: nowIso,
                    note: "Complaint submitted through student portal."
                }
            ]
        };

        Storage.addComplaint(complaint);
        return { success: true, complaint };
    },

    // Badge styling helpers
    getStatusBadge(status) {
        const s = (status || 'Submitted').toLowerCase().replace(/\s+/g, '-');
        return `<span class="badge badge-status badge-${s}">${status}</span>`;
    },

    getPriorityBadge(priority) {
        const p = (priority || 'Medium').toLowerCase();
        return `<span class="badge badge-priority badge-priority-${p}">${priority}</span>`;
    },

    // Date formatter
    formatDate(dateString, includeTime = false) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return date.toLocaleDateString('en-US', options);
    }
};
