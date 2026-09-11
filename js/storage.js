/**
 * Student Complaint & Grievance Management System
 * 
 * Note: This project uses localStorage because it is a frontend-only academic project.
 * Production systems should use a secure backend and database.
 */

const STORAGE_KEYS = {
    STUDENTS: 'scgms_students',
    COMPLAINTS: 'scgms_complaints',
    CURRENT_STUDENT: 'scgms_current_student',
    CURRENT_ADMIN: 'scgms_current_admin',
    SETTINGS: 'scgms_settings'
};

// Initial Sample Data
const SAMPLE_STUDENTS = [
    {
        id: "STU1001",
        name: "LOKESHWARAN N",
        email: "student@college.com",
        phone: "+91 98765 43210",
        department: "Information Technology",
        year: "Final Year",
        password: "student123",
        createdAt: "2026-08-01T10:00:00Z"
    },
    {
        id: "STU1002",
        name: "Priya Patel",
        email: "priya.patel@college.com",
        phone: "+91 98765 43211",
        department: "Information Technology",
        year: "2nd Year",
        password: "password123",
        createdAt: "2026-08-05T11:30:00Z"
    },
    {
        id: "STU1003",
        name: "Rohan Verma",
        email: "rohan.v@college.com",
        phone: "+91 98765 43212",
        department: "Mechanical Engineering",
        year: "4th Year",
        password: "password123",
        createdAt: "2026-08-10T09:15:00Z"
    },
    {
        id: "STU1004",
        name: "Ananya Iyer",
        email: "ananya.iyer@college.com",
        phone: "+91 98765 43213",
        department: "Electronics & Communication",
        year: "1st Year",
        password: "password123",
        createdAt: "2026-08-15T14:20:00Z"
    },
    {
        id: "STU1005",
        name: "Vikram Malhotra",
        email: "vikram.m@college.com",
        phone: "+91 98765 43214",
        department: "Civil Engineering",
        year: "3rd Year",
        password: "password123",
        createdAt: "2026-08-20T16:45:00Z"
    }
];

const SAMPLE_COMPLAINTS = [
    {
        id: "CMP-2026-00101",
        studentId: "STU1001",
        studentName: "LOKESHWARAN N",
        studentEmail: "student@college.com",
        studentDept: "Information Technology",
        title: "Classroom Fan Not Working",
        category: "Infrastructure",
        description: "The ceiling fan near row 4 in classroom IT-203 has been vibrating loudly and stopped working completely for the past two days, causing extreme heat discomfort during afternoon lectures.",
        location: "Block A - Room IT-203",
        incidentDate: "2026-09-08",
        priority: "Medium",
        status: "Submitted",
        department: "Maintenance Department",
        adminResponse: "",
        contactInfo: "+91 98765 43210",
        createdAt: "2026-09-08T10:15:00Z",
        updatedAt: "2026-09-08T10:15:00Z",
        timeline: [
            { status: "Submitted", date: "2026-09-08T10:15:00Z", note: "Complaint lodged by student." }
        ]
    },
    {
        id: "CMP-2026-00102",
        studentId: "STU1002",
        studentName: "Priya Patel",
        studentEmail: "priya.patel@college.com",
        studentDept: "Information Technology",
        title: "Hostel Water Supply Interruption",
        category: "Hostel",
        description: "Water supply on the 3rd floor of Kaveri Girls Hostel has been intermittent for 3 days. Morning timings have no running water in washrooms.",
        location: "Kaveri Girls Hostel - 3rd Floor",
        incidentDate: "2026-09-06",
        priority: "High",
        status: "In Progress",
        department: "Hostel Administration",
        adminResponse: "Plumbing team dispatched. Motor pump valve replacement is underway and will be fixed by 6:00 PM today.",
        contactInfo: "+91 98765 43211",
        createdAt: "2026-09-06T08:30:00Z",
        updatedAt: "2026-09-07T11:00:00Z",
        timeline: [
            { status: "Submitted", date: "2026-09-06T08:30:00Z", note: "Complaint lodged." },
            { status: "Under Review", date: "2026-09-06T14:00:00Z", note: "Hostel warden reviewed the grievance." },
            { status: "In Progress", date: "2026-09-07T11:00:00Z", note: "Maintenance crew actively replacing motor valves." }
        ]
    },
    {
        id: "CMP-2026-00103",
        studentId: "STU1003",
        studentName: "Rohan Verma",
        studentEmail: "rohan.v@college.com",
        studentDept: "Mechanical Engineering",
        title: "Library Evening Timing Extension Issue",
        category: "Library",
        description: "During internal examination week, the central digital library is being closed abruptly at 7:00 PM instead of the scheduled 9:30 PM.",
        location: "Central Library - 2nd Floor Reading Hall",
        incidentDate: "2026-09-05",
        priority: "Medium",
        status: "Under Review",
        department: "Library",
        adminResponse: "Chief Librarian has been notified to adhere to the extended exam-schedule timings.",
        contactInfo: "+91 98765 43212",
        createdAt: "2026-09-05T19:40:00Z",
        updatedAt: "2026-09-06T10:00:00Z",
        timeline: [
            { status: "Submitted", date: "2026-09-05T19:40:00Z", note: "Complaint lodged." },
            { status: "Under Review", date: "2026-09-06T10:00:00Z", note: "Forwarded to Central Library Committee." }
        ]
    },
    {
        id: "CMP-2026-00104",
        studentId: "STU1001",
        studentName: "LOKESHWARAN N",
        studentEmail: "student@college.com",
        studentDept: "Information Technology",
        title: "Canteen Food Quality and Hygiene Concern",
        category: "Canteen",
        description: "Served stale lunch items in Main Canteen on Sept 4. Also noticed food handlers without hairnets and gloves.",
        location: "Main Food Court / South Block Canteen",
        incidentDate: "2026-09-04",
        priority: "High",
        status: "Resolved",
        department: "Canteen Management",
        adminResponse: "Canteen inspection conducted with the Health & Sanitation Committee. Warning issued to contractor and food safety guidelines strictly enforced.",
        contactInfo: "+91 98765 43210",
        createdAt: "2026-09-04T13:10:00Z",
        updatedAt: "2026-09-07T16:00:00Z",
        timeline: [
            { status: "Submitted", date: "2026-09-04T13:10:00Z", note: "Complaint lodged." },
            { status: "Under Review", date: "2026-09-05T09:00:00Z", note: "Reviewed by Student Welfare Dean." },
            { status: "In Progress", date: "2026-09-06T12:00:00Z", note: "Surprise kitchen inspection completed." },
            { status: "Resolved", date: "2026-09-07T16:00:00Z", note: "Corrective measures implemented and vendor penalized." }
        ]
    },
    {
        id: "CMP-2026-00105",
        studentId: "STU1004",
        studentName: "Ananya Iyer",
        studentEmail: "ananya.iyer@college.com",
        studentDept: "Electronics & Communication",
        title: "Exam Hall Seating Plan Overcrowding",
        category: "Examination",
        description: "In the recent mid-term exams in Hall 401, roll numbers were packed with zero space between benches, causing commotion.",
        location: "Academic Block 2 - Hall 401",
        incidentDate: "2026-09-03",
        priority: "Urgent",
        status: "Resolved",
        department: "Examination Cell",
        adminResponse: "Controller of Examinations revised the floor seating chart. Alternate bench seating allocated for subsequent papers.",
        contactInfo: "+91 98765 43213",
        createdAt: "2026-09-03T11:00:00Z",
        updatedAt: "2026-09-05T14:30:00Z",
        timeline: [
            { status: "Submitted", date: "2026-09-03T11:00:00Z", note: "Complaint lodged." },
            { status: "Under Review", date: "2026-09-03T15:00:00Z", note: "Exam superintendent alerted." },
            { status: "Resolved", date: "2026-09-05T14:30:00Z", note: "Seating arrangement revised across all test centers." }
        ]
    },
    {
        id: "CMP-2026-00106",
        studentId: "STU1005",
        studentName: "Vikram Malhotra",
        studentEmail: "vikram.m@college.com",
        studentDept: "Civil Engineering",
        title: "College Bus Route 14 Frequent Delay",
        category: "Transportation",
        description: "Bus Route 14 (North City via Station) is arriving 25-35 minutes late every morning for the past 2 weeks, leading to missed 1st period attendance.",
        location: "North Suburb Route #14",
        incidentDate: "2026-09-07",
        priority: "Medium",
        status: "In Progress",
        department: "Transport Department",
        adminResponse: "Transport supervisor is rerouting Bus 14 to avoid metro construction traffic on Ring Road.",
        contactInfo: "+91 98765 43214",
        createdAt: "2026-09-07T09:00:00Z",
        updatedAt: "2026-09-08T15:00:00Z",
        timeline: [
            { status: "Submitted", date: "2026-09-07T09:00:00Z", note: "Complaint lodged." },
            { status: "In Progress", date: "2026-09-08T15:00:00Z", note: "Route optimization being implemented." }
        ]
    },
    {
        id: "CMP-2026-00107",
        studentId: "STU1002",
        studentName: "Priya Patel",
        studentEmail: "priya.patel@college.com",
        studentDept: "Information Technology",
        title: "Campus Wi-Fi Connectivity Issue in Tech Lab 3",
        category: "Technical Issue",
        description: "Access Point 'CAMPUS_WIFI_5G_L3' frequently drops connections and provides DNS resolution errors during practical lab hours.",
        location: "Lab Complex - Tech Lab 3",
        incidentDate: "2026-09-09",
        priority: "High",
        status: "Submitted",
        department: "IT Department",
        adminResponse: "",
        contactInfo: "+91 98765 43211",
        createdAt: "2026-09-09T14:20:00Z",
        updatedAt: "2026-09-09T14:20:00Z",
        timeline: [
            { status: "Submitted", date: "2026-09-09T14:20:00Z", note: "Complaint lodged." }
        ]
    },
    {
        id: "CMP-2026-00108",
        studentId: "STU1003",
        studentName: "Rohan Verma",
        studentEmail: "rohan.v@college.com",
        studentDept: "Mechanical Engineering",
        title: "Classroom Projector Color Distortion & Flicker",
        category: "Academic",
        description: "The ceiling mounted HDMI projector in Mechanical Seminar Hall 1 displays heavy green tint and flickers during faculty presentations.",
        location: "Mechanical Block - Seminar Hall 1",
        incidentDate: "2026-09-02",
        priority: "Low",
        status: "Resolved",
        department: "IT Department",
        adminResponse: "Defective HDMI wall module and projector bulb replaced by AV team. Tested and working crisp.",
        contactInfo: "+91 98765 43212",
        createdAt: "2026-09-02T16:00:00Z",
        updatedAt: "2026-09-04T11:00:00Z",
        timeline: [
            { status: "Submitted", date: "2026-09-02T16:00:00Z", note: "Complaint lodged." },
            { status: "Under Review", date: "2026-09-03T09:30:00Z", note: "Assigned to AV Technician." },
            { status: "Resolved", date: "2026-09-04T11:00:00Z", note: "Bulb & cable unit replaced successfully." }
        ]
    }
];

// Storage Helper API
const Storage = {
    // Initialize storage with sample data if empty or refresh sample student
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SAMPLE_STUDENTS));
        } else {
            try {
                const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
                let stuUpdated = false;
                const stu1 = students.find(s => s.id === 'STU1001');
                if (stu1 && (stu1.name === 'Aarav Sharma' || stu1.name !== 'LOKESHWARAN N' || stu1.department !== 'Information Technology' || stu1.year !== 'Final Year')) {
                    stu1.name = 'LOKESHWARAN N';
                    stu1.department = 'Information Technology';
                    stu1.year = 'Final Year';
                    stuUpdated = true;
                }
                if (stuUpdated) {
                    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
                    const currentStudent = this.getCurrentStudent();
                    if (currentStudent && currentStudent.id === 'STU1001') {
                        this.setCurrentStudent(stu1);
                    }
                }
            } catch (e) {
                console.error("Error migrating students in storage:", e);
            }
        }

        if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
            localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(SAMPLE_COMPLAINTS));
        } else {
            try {
                const complaints = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) || [];
                let cUpdated = false;
                complaints.forEach(c => {
                    if (c.studentId === 'STU1001' && (c.studentName === 'Aarav Sharma' || c.studentDept === 'Computer Science & Engineering')) {
                        c.studentName = 'LOKESHWARAN N';
                        c.studentDept = 'Information Technology';
                        cUpdated = true;
                    }
                });
                if (cUpdated) {
                    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
                }
            } catch (e) {
                console.error("Error migrating complaints in storage:", e);
            }
        }
    },

    // Students
    getStudents() {
        this.init();
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
        } catch (e) {
            console.error("Error reading students from storage:", e);
            return [];
        }
    },

    saveStudents(students) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    },

    getStudentById(id) {
        if (!id) return null;
        const students = this.getStudents();
        return students.find(s => s.id.toUpperCase() === id.trim().toUpperCase());
    },

    getStudentByEmail(email) {
        if (!email) return null;
        const students = this.getStudents();
        return students.find(s => s.email.toLowerCase() === email.trim().toLowerCase());
    },

    addStudent(student) {
        const students = this.getStudents();
        students.push(student);
        this.saveStudents(students);
        return student;
    },

    updateStudent(studentId, updatedData) {
        const students = this.getStudents();
        const index = students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedData };
            this.saveStudents(students);
            
            // Also update current student session if matching
            const current = this.getCurrentStudent();
            if (current && current.id === studentId) {
                this.setCurrentStudent(students[index]);
            }
            return students[index];
        }
        return null;
    },

    // Complaints
    getComplaints() {
        this.init();
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) || [];
        } catch (e) {
            console.error("Error reading complaints from storage:", e);
            return [];
        }
    },

    saveComplaints(complaints) {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
    },

    getComplaintById(id) {
        if (!id) return null;
        const complaints = this.getComplaints();
        return complaints.find(c => c.id.toUpperCase() === id.trim().toUpperCase());
    },

    addComplaint(complaint) {
        const complaints = this.getComplaints();
        complaints.unshift(complaint); // Add to top
        this.saveComplaints(complaints);
        return complaint;
    },

    updateComplaint(id, updateData) {
        const complaints = this.getComplaints();
        const index = complaints.findIndex(c => c.id === id);
        if (index !== -1) {
            const old = complaints[index];
            const updated = {
                ...old,
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            // If status changed, record to timeline
            if (updateData.status && updateData.status !== old.status) {
                updated.timeline = updated.timeline || [];
                updated.timeline.push({
                    status: updateData.status,
                    date: new Date().toISOString(),
                    note: updateData.timelineNote || `Status updated to ${updateData.status}`
                });
            }

            complaints[index] = updated;
            this.saveComplaints(complaints);
            return updated;
        }
        return null;
    },

    deleteComplaint(id) {
        const complaints = this.getComplaints();
        const filtered = complaints.filter(c => c.id !== id);
        this.saveComplaints(filtered);
        return filtered.length !== complaints.length;
    },

    // Authentication Session Helpers
    getCurrentStudent() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT));
        } catch (e) {
            return null;
        }
    },

    setCurrentStudent(student) {
        if (student) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(student));
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
        }
    },

    getCurrentAdmin() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN));
        } catch (e) {
            return null;
        }
    },

    setCurrentAdmin(admin) {
        if (admin) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
        }
    },

    // ID Generator
    generateComplaintId() {
        const year = new Date().getFullYear();
        const complaints = this.getComplaints();
        const randomNum = Math.floor(100 + Math.random() * 900);
        const sequence = (complaints.length + 1).toString().padStart(3, '0');
        return `CMP-${year}-${sequence}${randomNum.toString().substring(0, 2)}`;
    },

    // Global Statistics
    getStats() {
        const complaints = this.getComplaints();
        const students = this.getStudents();

        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const pending = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;
        const rejected = complaints.filter(c => c.status === 'Rejected' || c.status === 'Closed').length;

        return {
            totalComplaints: total,
            resolvedComplaints: resolved,
            pendingComplaints: pending,
            inProgressComplaints: inProgress,
            rejectedComplaints: rejected,
            registeredStudents: students.length
        };
    }
};

// Initialize immediately upon script evaluation
Storage.init();
