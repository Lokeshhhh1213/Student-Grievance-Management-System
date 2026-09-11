/**
 * Interactive 3D WebGL Redressal Hologram Core
 * Uses Three.js with fallback to high-performance Canvas 3D
 */

(function () {
    'use strict';

    const Hero3D = {
        container: null,
        scene: null,
        camera: null,
        renderer: null,
        coreGroup: null,
        outerIcosahedron: null,
        innerSphere: null,
        orbitRing: null,
        orbitRing2: null,
        orbitNodes: [],
        particles: null,
        mouseX: 0,
        mouseY: 0,
        targetRotationX: 0,
        targetRotationY: 0,
        animationFrameId: null,
        clock: null,

        init() {
            this.container = document.getElementById('hero-3d-container');
            if (!this.container) return;

            // If Three.js is loaded, initialize WebGL
            if (typeof THREE !== 'undefined') {
                this.initThreeJS();
            } else {
                this.initCanvasFallback();
            }

            // Window resize handler
            window.addEventListener('resize', () => this.onResize());

            // Listen for theme toggle to adjust colors dynamically
            window.addEventListener('storage', () => this.updateThemeColors());
            const observer = new MutationObserver(() => this.updateThemeColors());
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        },

        isDarkMode() {
            return document.documentElement.getAttribute('data-theme') === 'dark';
        },

        initThreeJS() {
            const width = this.container.clientWidth || 460;
            const height = this.container.clientHeight || 420;

            // Scene setup
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            this.camera.position.z = 8.5;
            this.clock = new THREE.Clock();

            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.setClearColor(0x000000, 0);
            this.container.appendChild(this.renderer.domElement);

            // Create Master Hologram Group
            this.coreGroup = new THREE.Group();
            this.scene.add(this.coreGroup);

            // Outer Wireframe Holographic Icosahedron
            const icoGeo = new THREE.IcosahedronGeometry(2.3, 1);
            const icoMat = new THREE.MeshBasicMaterial({
                color: 0x6366f1,
                wireframe: true,
                transparent: true,
                opacity: 0.65
            });
            this.outerIcosahedron = new THREE.Mesh(icoGeo, icoMat);
            this.coreGroup.add(this.outerIcosahedron);

            // Second Outer Cage (Octahedron)
            const octGeo = new THREE.OctahedronGeometry(2.7, 0);
            const octMat = new THREE.MeshBasicMaterial({
                color: 0x06b6d4,
                wireframe: true,
                transparent: true,
                opacity: 0.35
            });
            const outerOct = new THREE.Mesh(octGeo, octMat);
            this.coreGroup.add(outerOct);

            // Glowing Inner Energy Core Sphere
            const sphereGeo = new THREE.SphereGeometry(1.2, 32, 32);
            const sphereMat = new THREE.MeshPhongMaterial({
                color: 0x4f46e5,
                emissive: 0x3b82f6,
                emissiveIntensity: 0.6,
                specular: 0x93c5fd,
                shininess: 90,
                transparent: true,
                opacity: 0.85
            });
            this.innerSphere = new THREE.Mesh(sphereGeo, sphereMat);
            this.coreGroup.add(this.innerSphere);

            // Orbit Ring 1
            const ringGeo = new THREE.TorusGeometry(3.2, 0.025, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x818cf8,
                transparent: true,
                opacity: 0.5
            });
            this.orbitRing = new THREE.Mesh(ringGeo, ringMat);
            this.orbitRing.rotation.x = Math.PI / 3;
            this.coreGroup.add(this.orbitRing);

            // Orbit Ring 2 (Cross tilt)
            const ringGeo2 = new THREE.TorusGeometry(3.5, 0.02, 16, 100);
            const ringMat2 = new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.4
            });
            this.orbitRing2 = new THREE.Mesh(ringGeo2, ringMat2);
            this.orbitRing2.rotation.x = -Math.PI / 4;
            this.orbitRing2.rotation.y = Math.PI / 6;
            this.coreGroup.add(this.orbitRing2);

            // Orbiting Department Satellite Nodes (Academics, Hostel, Infrastructure, Transport, Security)
            const nodeColors = [0x06b6d4, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xf43f5e];
            const nodeCount = 5;
            for (let i = 0; i < nodeCount; i++) {
                const nodeGeo = new THREE.SphereGeometry(0.24, 16, 16);
                const nodeMat = new THREE.MeshStandardMaterial({
                    color: nodeColors[i],
                    emissive: nodeColors[i],
                    emissiveIntensity: 0.7,
                    roughness: 0.2,
                    metalness: 0.8
                });
                const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);

                // Add small halo ring to each node
                const haloGeo = new THREE.RingGeometry(0.3, 0.38, 16);
                const haloMat = new THREE.MeshBasicMaterial({
                    color: nodeColors[i],
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.6
                });
                const halo = new THREE.Mesh(haloGeo, haloMat);
                halo.rotation.x = Math.PI / 2;
                nodeMesh.add(halo);

                this.coreGroup.add(nodeMesh);
                this.orbitNodes.push({
                    mesh: nodeMesh,
                    angle: (i / nodeCount) * Math.PI * 2,
                    speed: 0.5 + (i % 3) * 0.2,
                    radius: 3.2 + (i % 2) * 0.4,
                    inclination: ((i % 3) - 1) * 0.4
                });
            }

            // Floating 3D Star / Particle Field
            const particleCount = 200;
            const particleGeo = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 16;
                positions[i + 1] = (Math.random() - 0.5) * 16;
                positions[i + 2] = (Math.random() - 0.5) * 16;
            }
            particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const particleMat = new THREE.PointsMaterial({
                color: 0x93c5fd,
                size: 0.08,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            this.particles = new THREE.Points(particleGeo, particleMat);
            this.scene.add(this.particles);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            this.scene.add(ambientLight);

            const pointLight1 = new THREE.PointLight(0x6366f1, 2, 50);
            pointLight1.position.set(5, 5, 5);
            this.scene.add(pointLight1);

            const pointLight2 = new THREE.PointLight(0x06b6d4, 1.8, 50);
            pointLight2.position.set(-5, -4, 4);
            this.scene.add(pointLight2);

            // Mouse Interactive Motion
            document.addEventListener('mousemove', (e) => {
                const rect = this.container.getBoundingClientRect();
                const x = e.clientX - (rect.left + rect.width / 2);
                const y = e.clientY - (rect.top + rect.height / 2);
                this.targetRotationY = (x / window.innerWidth) * 0.9;
                this.targetRotationX = (y / window.innerHeight) * 0.9;
            });

            // Start Animation Loop
            this.animate();
        },

        updateThemeColors() {
            if (!this.scene) return;
            const isDark = this.isDarkMode();
            if (this.outerIcosahedron) {
                this.outerIcosahedron.material.color.setHex(isDark ? 0x818cf8 : 0x4f46e5);
                this.outerIcosahedron.material.opacity = isDark ? 0.75 : 0.6;
            }
            if (this.innerSphere) {
                this.innerSphere.material.color.setHex(isDark ? 0x6366f1 : 0x3b82f6);
                this.innerSphere.material.emissive.setHex(isDark ? 0x4338ca : 0x2563eb);
            }
        },

        animate() {
            this.animationFrameId = requestAnimationFrame(() => this.animate());

            const delta = this.clock ? this.clock.getDelta() : 0.016;
            const elapsedTime = this.clock ? this.clock.getElapsedTime() : Date.now() * 0.001;

            if (this.coreGroup) {
                // Smooth mouse follow
                this.coreGroup.rotation.y += (this.targetRotationY - this.coreGroup.rotation.y) * 0.05;
                this.coreGroup.rotation.x += (this.targetRotationX - this.coreGroup.rotation.x) * 0.05;

                // Base autonomous rotations
                this.outerIcosahedron.rotation.x += delta * 0.25;
                this.outerIcosahedron.rotation.y += delta * 0.35;

                if (this.orbitRing) this.orbitRing.rotation.z += delta * 0.15;
                if (this.orbitRing2) this.orbitRing2.rotation.z -= delta * 0.18;

                // Pulsate inner sphere
                const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.06;
                this.innerSphere.scale.set(pulse, pulse, pulse);

                // Animate orbiting department satellite nodes
                this.orbitNodes.forEach((node, idx) => {
                    const currentAngle = node.angle + elapsedTime * node.speed;
                    const x = Math.cos(currentAngle) * node.radius;
                    const z = Math.sin(currentAngle) * node.radius;
                    const y = Math.sin(currentAngle + idx) * (node.radius * 0.35);

                    node.mesh.position.set(x, y, z);
                    node.mesh.rotation.y += delta * 2;
                });
            }

            if (this.particles) {
                this.particles.rotation.y = elapsedTime * 0.04;
                this.particles.rotation.x = elapsedTime * 0.02;
            }

            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        },

        onResize() {
            if (!this.container || !this.renderer || !this.camera) return;
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            if (width === 0 || height === 0) return;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        },

        // High-Performance Pure Canvas 3D Fallback if Three.js is blocked or unavailable
        initCanvasFallback() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            this.container.appendChild(canvas);

            let width = (canvas.width = this.container.clientWidth || 460);
            let height = (canvas.height = this.container.clientHeight || 420);

            const numPoints = 60;
            const points = [];
            for (let i = 0; i < numPoints; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                const r = 110 + Math.random() * 30;
                points.push({
                    x: r * Math.sin(phi) * Math.cos(theta),
                    y: r * Math.sin(phi) * Math.sin(theta),
                    z: r * Math.cos(phi),
                    origX: r * Math.sin(phi) * Math.cos(theta),
                    origY: r * Math.sin(phi) * Math.sin(theta),
                    origZ: r * Math.cos(phi)
                });
            }

            let angleX = 0;
            let angleY = 0;

            const renderCanvas3D = () => {
                requestAnimationFrame(renderCanvas3D);
                ctx.clearRect(0, 0, width, height);

                angleX += 0.005;
                angleY += 0.008;

                const cx = width / 2;
                const cy = height / 2;
                const fov = 300;

                // Center glowing sphere
                const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 70);
                grad.addColorStop(0, 'rgba(99, 102, 241, 0.7)');
                grad.addColorStop(0.6, 'rgba(79, 70, 229, 0.3)');
                grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(cx, cy, 70, 0, Math.PI * 2);
                ctx.fill();

                // Rotate and project points
                const projected = [];
                for (let i = 0; i < points.length; i++) {
                    const p = points[i];

                    // Rotate around Y
                    let x1 = p.origX * Math.cos(angleY) - p.origZ * Math.sin(angleY);
                    let z1 = p.origZ * Math.cos(angleY) + p.origX * Math.sin(angleY);

                    // Rotate around X
                    let y2 = p.origY * Math.cos(angleX) - z1 * Math.sin(angleX);
                    let z2 = z1 * Math.cos(angleX) + p.origY * Math.sin(angleX);

                    const scale = fov / (fov + z2 + 200);
                    const px = x1 * scale + cx;
                    const py = y2 * scale + cy;

                    projected.push({ x: px, y: py, z: z2, scale: scale });

                    // Draw point
                    ctx.fillStyle = z2 > 0 ? 'rgba(99, 102, 241, 0.9)' : 'rgba(6, 182, 212, 0.4)';
                    ctx.beginPath();
                    ctx.arc(px, py, Math.max(1.5, scale * 3.5), 0, Math.PI * 2);
                    ctx.fill();
                }

                // Connect nearby points with 3D wireframe lines
                ctx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
                ctx.lineWidth = 1;
                for (let i = 0; i < projected.length; i++) {
                    for (let j = i + 1; j < projected.length; j++) {
                        const dist = Math.hypot(projected[i].x - projected[j].x, projected[i].y - projected[j].y);
                        if (dist < 55) {
                            ctx.beginPath();
                            ctx.moveTo(projected[i].x, projected[i].y);
                            ctx.lineTo(projected[j].x, projected[j].y);
                            ctx.stroke();
                        }
                    }
                }
            };

            renderCanvas3D();
        }
    };

    // Auto-initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Hero3D.init());
    } else {
        Hero3D.init();
    }

    window.Hero3D = Hero3D;
})();
