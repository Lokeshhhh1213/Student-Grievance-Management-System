/**
 * Student Complaint & Grievance Management System - Auth Module
 * 
 * Note: This project uses localStorage because it is a frontend-only academic project.
 * Production systems should use a secure backend and database.
 */

const ADMIN_CREDENTIALS = {
    email: "admin@college.com",
    password: "admin123",
    name: "Dean of Student Affairs / Administrator",
    role: "Administrator"
};

const Auth = {
    // Student Authentication
    loginStudent(identifier, password) {
        if (!identifier || !password) {
            return { success: false, message: "Please enter both Student ID/Email and password." };
        }

        const cleanId = identifier.trim();
        const student = Storage.getStudentById(cleanId) || Storage.getStudentByEmail(cleanId);

        if (!student) {
            return { success: false, message: "No account found with the provided Student ID or Email." };
        }

        if (student.password !== password) {
            return { success: false, message: "Incorrect password. Please try again." };
        }

        // Set session
        Storage.setCurrentStudent({
            id: student.id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            department: student.department,
            year: student.year
        });

        return { success: true, student };
    },

    registerStudent(data) {
        // Validation
        const { name, id, email, phone, department, year, password, confirmPassword } = data;

        if (!name || !id || !email || !phone || !department || !year || !password || !confirmPassword) {
            return { success: false, message: "All fields are required. Please complete the entire form." };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return { success: false, message: "Please provide a valid email address." };
        }

        if (password.length < 6) {
            return { success: false, message: "Password must be at least 6 characters long." };
        }

        if (password !== confirmPassword) {
            return { success: false, message: "Passwords do not match." };
        }

        const existingId = Storage.getStudentById(id.trim());
        if (existingId) {
            return { success: false, message: `Student ID "${id.trim()}" is already registered. Please log in.` };
        }

        const existingEmail = Storage.getStudentByEmail(email.trim());
        if (existingEmail) {
            return { success: false, message: `Email "${email.trim()}" is already associated with another account.` };
        }

        const newStudent = {
            id: id.trim().toUpperCase(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            department: department.trim(),
            year: year.trim(),
            password: password,
            createdAt: new Date().toISOString()
        };

        Storage.addStudent(newStudent);

        // Auto login on successful registration
        Storage.setCurrentStudent({
            id: newStudent.id,
            name: newStudent.name,
            email: newStudent.email,
            phone: newStudent.phone,
            department: newStudent.department,
            year: newStudent.year
        });

        return { success: true, student: newStudent };
    },

    // Reset Student Password
    resetStudentPassword(identifier, newPassword, confirmPassword) {
        if (!identifier || !newPassword || !confirmPassword) {
            return { success: false, message: "Please fill in all required fields." };
        }

        const cleanId = identifier.trim();
        const student = Storage.getStudentById(cleanId) || Storage.getStudentByEmail(cleanId);

        if (!student) {
            return { success: false, message: "No registered student account found with this ID or Email." };
        }

        if (newPassword.length < 6) {
            return { success: false, message: "New password must be at least 6 characters long." };
        }

        if (newPassword !== confirmPassword) {
            return { success: false, message: "New passwords do not match." };
        }

        // Update student password in Storage
        Storage.updateStudent(student.id, { password: newPassword });

        return {
            success: true,
            message: `Password reset successfully for ${student.name}!`,
            student: student
        };
    },

    logoutStudent(redirectUrl = 'login.html') {
        Storage.setCurrentStudent(null);
        window.location.href = redirectUrl;
    },

    // Admin Authentication
    loginAdmin(email, password) {
        if (!email || !password) {
            return { success: false, message: "Please enter your administrator email and password." };
        }

        if (email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
            Storage.setCurrentAdmin({
                email: ADMIN_CREDENTIALS.email,
                name: ADMIN_CREDENTIALS.name,
                role: ADMIN_CREDENTIALS.role,
                loginTime: new Date().toISOString()
            });
            return { success: true };
        }

        return { success: false, message: "Invalid administrator credentials. Please check your email and password." };
    },

    logoutAdmin(redirectUrl = 'login.html') {
        Storage.setCurrentAdmin(null);
        window.location.href = redirectUrl;
    },

    // Route Guards
    requireStudent(redirectUrl = 'login.html') {
        const student = Storage.getCurrentStudent();
        if (!student) {
            window.location.href = redirectUrl;
            return null;
        }
        return student;
    },

    requireAdmin(redirectUrl = 'login.html') {
        const admin = Storage.getCurrentAdmin();
        if (!admin) {
            window.location.href = redirectUrl;
            return null;
        }
        return admin;
    },

    redirectIfStudentLoggedIn(dashboardUrl = 'dashboard.html') {
        const student = Storage.getCurrentStudent();
        if (student) {
            window.location.href = dashboardUrl;
        }
    },

    redirectIfAdminLoggedIn(dashboardUrl = 'dashboard.html') {
        const admin = Storage.getCurrentAdmin();
        if (admin) {
            window.location.href = dashboardUrl;
        }
    }
};
