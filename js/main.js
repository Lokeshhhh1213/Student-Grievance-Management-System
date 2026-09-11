/**
 * Student Complaint & Grievance Management System - Global UI Utilities & 3D Engine
 * 
 * Note: This project uses localStorage because it is a frontend-only academic project.
 * Production systems should use a secure backend and database.
 */

// Theme Management System (Dark / Light Mode)
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('app_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.applyTheme(savedTheme);
        this.renderToggleButtons();
    },

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('app_theme', theme);
        this.updateToggleIcons(theme);
    },

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    },

    updateToggleIcons(theme) {
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
            btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
            btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        });
    },

    renderToggleButtons() {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        
        // Check for public navbar actions
        const navbarActions = document.querySelector('.navbar-actions');
        if (navbarActions && !navbarActions.querySelector('.theme-toggle-btn')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'theme-toggle-btn';
            toggleBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
            toggleBtn.onclick = () => this.toggle();
            navbarActions.appendChild(toggleBtn);
        }

        // Check for dashboard topbar actions
        const topbarActions = document.querySelector('.dashboard-topbar .d-flex.align-center:last-child');
        if (topbarActions && !topbarActions.querySelector('.theme-toggle-btn')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'theme-toggle-btn';
            toggleBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
            toggleBtn.onclick = () => this.toggle();
            topbarActions.prepend(toggleBtn);
        }
    }
};

// Toast Notifications System (3D Acrylic Glass)
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
            success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
            error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
            warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
            info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
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

// Global helper for simple toast call
function showToast(message, type = 'info', duration = 4000) {
    Toast.show(message, type, duration);
}

// 3D Confirmation Modal Dialog Helper
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

// Advanced 3D Mouse Parallax & Dynamic Light Sheen Physics Engine
const Interactive3DTilt = {
    init() {
        const selector = '.card, .stat-card, .feature-card, .category-card, .complaint-card, .hero-card, .auth-card, .priority-metric-card';
        
        const attachTilt = (el) => {
            if (el.dataset.tilt3dAttached) return;
            el.dataset.tilt3dAttached = 'true';

            let bounds;

            const onMouseEnter = () => {
                bounds = el.getBoundingClientRect();
                el.style.transition = 'transform 0.12s ease-out, box-shadow 0.2s ease-out';
            };

            const onMouseMove = (e) => {
                if (!bounds) bounds = el.getBoundingClientRect();
                const mouseX = e.clientX - bounds.left;
                const mouseY = e.clientY - bounds.top;

                const percentX = mouseX / bounds.width;
                const percentY = mouseY / bounds.height;

                // Set CSS variables for dynamic specular reflection
                el.style.setProperty('--mouse-x', `${(percentX * 100).toFixed(1)}%`);
                el.style.setProperty('--mouse-y', `${(percentY * 100).toFixed(1)}%`);

                // Calculate tilt degrees (Max 8-10 degrees for clean 3D feel)
                const tiltX = ((percentY - 0.5) * -12).toFixed(2);
                const tiltY = ((percentX - 0.5) * 12).toFixed(2);

                el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px) scale3d(1.015, 1.015, 1.015)`;
            };

            const onMouseLeave = () => {
                el.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
                el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
            };

            el.addEventListener('mouseenter', onMouseEnter, { passive: true });
            el.addEventListener('mousemove', onMouseMove, { passive: true });
            el.addEventListener('mouseleave', onMouseLeave, { passive: true });
        };

        document.querySelectorAll(selector).forEach(attachTilt);

        const observer = new MutationObserver(() => {
            document.querySelectorAll(selector).forEach(attachTilt);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
};

// Interactive 3D Ambient Constellation Mesh Engine
const Interactive3DConstellation = {
    init() {
        const hero = document.querySelector('.hero');
        if (!hero || document.getElementById('ambient-3d-canvas')) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'ambient-3d-canvas';
        hero.style.position = 'relative';
        hero.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let width = (canvas.width = hero.offsetWidth);
        let height = (canvas.height = hero.offsetHeight);

        const resize = () => {
            width = canvas.width = hero.offsetWidth;
            height = canvas.height = hero.offsetHeight;
        };
        window.addEventListener('resize', resize, { passive: true });

        // 3D Particles
        const particleCount = Math.min(45, Math.floor(width / 25));
        const particles = [];
        const fov = 350;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: (Math.random() - 0.5) * width * 1.2,
                y: (Math.random() - 0.5) * height * 1.2,
                z: Math.random() * 400 + 50,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                vz: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1.5,
                hue: Math.random() > 0.5 ? 235 : 190 // Indigo or Cyan
            });
        }

        let mouseX = 0;
        let mouseY = 0;
        let targetRotX = 0;
        let targetRotY = 0;
        let rotX = 0;
        let rotY = 0;

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouseX = (e.clientX - rect.left - width / 2) * 0.0005;
            mouseY = (e.clientY - rect.top - height / 2) * 0.0005;
            targetRotY = mouseX;
            targetRotX = -mouseY;
        }, { passive: true });

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            rotX += (targetRotX - rotX) * 0.05;
            rotY += (targetRotY - rotY) * 0.05;

            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);
            const cosX = Math.cos(rotX);
            const sinX = Math.sin(rotX);

            const projected = [];

            // Update & project 3D points
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.z += p.vz;

                if (p.z < 20) p.z = 450;
                if (p.z > 450) p.z = 20;

                // 3D rotation
                const x1 = p.x * cosY - p.z * sinY;
                const z1 = p.z * cosY + p.x * sinY;
                const y1 = p.y * cosX - z1 * sinX;
                const z2 = z1 * cosX + p.y * sinX;

                const scale = fov / (fov + z2);
                const px = x1 * scale + width / 2;
                const py = y1 * scale + height / 2;
                const alpha = Math.max(0.1, Math.min(0.8, (scale - 0.3) * 1.5));

                projected.push({ x: px, y: py, z: z2, scale, alpha, hue: p.hue, radius: p.radius });
            }

            // Draw connecting 3D energy lines
            for (let i = 0; i < projected.length; i++) {
                for (let j = i + 1; j < projected.length; j++) {
                    const p1 = projected[i];
                    const p2 = projected[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        const lineAlpha = (1 - dist / 110) * 0.25 * Math.min(p1.alpha, p2.alpha);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            // Draw glowing 3D particle nodes
            for (let i = 0; i < projected.length; i++) {
                const p = projected[i];
                if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) continue;

                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(1, p.radius * p.scale), 0, Math.PI * 2);
                ctx.fillStyle = p.hue === 235 ? `rgba(129, 140, 248, ${p.alpha})` : `rgba(34, 211, 238, ${p.alpha})`;
                ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            requestAnimationFrame(animate);
        };

        animate();
    }
};

// Custom Fluid 3D Magnetic Cursor Manager
const CustomCursorManager = {
    dot: null,
    ring: null,
    cursorX: -100,
    cursorY: -100,
    ringX: -100,
    ringY: -100,
    isHovered: false,

    init() {
        if (window.matchMedia('(pointer: coarse)').matches) return; // Ignore on touch screens

        this.dot = document.createElement('div');
        this.dot.className = 'custom-cursor-dot';

        this.ring = document.createElement('div');
        this.ring.className = 'custom-cursor-ring';

        document.body.appendChild(this.dot);
        document.body.appendChild(this.ring);

        window.addEventListener('mousemove', (e) => {
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
            this.dot.style.left = `${this.cursorX}px`;
            this.dot.style.top = `${this.cursorY}px`;
        }, { passive: true });

        window.addEventListener('mousedown', () => {
            this.ring.classList.add('clicking');
        });

        window.addEventListener('mouseup', () => {
            this.ring.classList.remove('clicking');
        });

        document.addEventListener('mouseleave', () => {
            this.dot.style.opacity = '0';
            this.ring.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            this.dot.style.opacity = '1';
            this.ring.style.opacity = '1';
        });

        // Interactive hover states
        const interactiveSelector = 'a, button, .btn, .card, .stat-card, .feature-card, .category-card, .complaint-card, input, select, textarea, .theme-toggle-btn, .sidebar-link, .nav-link, .faq-question';

        const attachHover = (el) => {
            if (el.dataset.cursorAttached) return;
            el.dataset.cursorAttached = 'true';

            el.addEventListener('mouseenter', () => {
                this.ring.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                this.ring.classList.remove('hovered');
            });
        };

        document.querySelectorAll(interactiveSelector).forEach(attachHover);

        const observer = new MutationObserver(() => {
            document.querySelectorAll(interactiveSelector).forEach(attachHover);
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Fluid spring interpolation loop
        const loop = () => {
            this.ringX += (this.cursorX - this.ringX) * 0.18;
            this.ringY += (this.cursorY - this.ringY) * 0.18;

            this.ring.style.left = `${this.ringX}px`;
            this.ring.style.top = `${this.ringY}px`;

            requestAnimationFrame(loop);
        };
        loop();
    }
};

// Global Page Handlers
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Custom Fluid Magnetic Cursor
    CustomCursorManager.init();

    // Initialize Theme System
    ThemeManager.init();

    // Initialize 3D Tilt Engine
    Interactive3DTilt.init();

    // Initialize 3D Constellation Mesh
    Interactive3DConstellation.init();

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
    if (authNavSlot && typeof Storage !== 'undefined') {
        const student = Storage.getCurrentStudent();
        if (student) {
            authNavSlot.innerHTML = `
                <a href="dashboard.html" class="btn btn-outline-primary btn-sm">Dashboard</a>
                <a href="javascript:void(0)" onclick="Auth.logoutStudent('index.html')" class="btn btn-danger-soft btn-sm">Logout</a>
            `;
        } else {
            authNavSlot.innerHTML = `
                <a href="login.html" class="btn btn-outline-primary btn-sm">Student Login</a>
                <a href="register.html" class="btn btn-primary btn-sm">Register</a>
            `;
        }
        // Re-check theme toggle
        ThemeManager.renderToggleButtons();
    }
});
