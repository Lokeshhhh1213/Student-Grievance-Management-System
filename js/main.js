/**
 * Student Complaint & Grievance Management System - Global UI Utilities
 * 
 * Note: This project uses localStorage because it is a frontend-only academic project.
 * Production systems should use a secure backend and database.
 */

// Toast Notifications System
const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.setAttribute('aria-live', 'polite');
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 4000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} animate-slide-in`;

        const iconMap = {
            success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
            error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
            warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
            info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
        };

        toast.innerHTML = `
            <div class="toast-content">
                ${iconMap[type] || iconMap.info}
                <span class="toast-message">${message}</span>
            </div>
            <button type="button" class="toast-close" aria-label="Close">&times;</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.dismiss(toast);
        });

        this.container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            this.dismiss(toast);
        }, duration);
    },

    dismiss(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.add('animate-fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
};

// Global helper for simple call
function showToast(message, type = 'info', duration = 4000) {
    Toast.show(message, type, duration);
}

// Confirmation Modal Dialog Helper
function showConfirmDialog(title, message, onConfirm, confirmText = 'Confirm', isDestructive = false) {
    let modalBackdrop = document.getElementById('global-confirm-modal');
    if (!modalBackdrop) {
        modalBackdrop = document.createElement('div');
        modalBackdrop.id = 'global-confirm-modal';
        modalBackdrop.className = 'modal-backdrop';
        document.body.appendChild(modalBackdrop);
    }

    modalBackdrop.innerHTML = `
        <div class="modal-dialog animate-scale-up">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button type="button" class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary modal-cancel-btn">Cancel</button>
                <button type="button" class="btn ${isDestructive ? 'btn-danger' : 'btn-primary'} modal-confirm-btn">${confirmText}</button>
            </div>
        </div>
    `;

    modalBackdrop.classList.add('active');

    const closeModal = () => {
        modalBackdrop.classList.remove('active');
    };

    modalBackdrop.querySelector('.modal-close-btn').onclick = closeModal;
    modalBackdrop.querySelector('.modal-cancel-btn').onclick = closeModal;
    modalBackdrop.querySelector('.modal-confirm-btn').onclick = () => {
        closeModal();
        if (typeof onConfirm === 'function') onConfirm();
    };

    // Close on backdrop click
    modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) closeModal();
    };
}

// Mobile Navbar and Sidebar Toggle Handler
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Hamburger
    const navToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !expanded);
        });
    }

    // Mobile Sidebar Toggle (for Dashboard pages)
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.dashboard-sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            if (sidebar) sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Auto-update header profile/logout info if logged in on public pages
    const authNavSlot = document.getElementById('auth-nav-slot');
    if (authNavSlot) {
        const student = Storage.getCurrentStudent();
        if (student) {
            authNavSlot.innerHTML = `
                <a href="dashboard.html" class="btn btn-outline-primary">Dashboard</a>
                <a href="javascript:void(0)" onclick="Auth.logoutStudent('index.html')" class="btn btn-danger-soft">Logout</a>
            `;
        } else {
            authNavSlot.innerHTML = `
                <a href="login.html" class="btn btn-outline-primary">Login</a>
                <a href="register.html" class="btn btn-primary">Register</a>
            `;
        }
    }
});
