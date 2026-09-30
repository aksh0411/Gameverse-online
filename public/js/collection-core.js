// ===== GAMEVERSE 4D HYPERVISUAL ENGINE — Orbital Overlap Edition =====
// Ultra-premium orbital overlap visualization inspired by the Gameverse dimensional network.
// Features: overlapping orbital ellipses, 4D tesseract core, traveling photon lights,
// glowing game nodes, cosmic particle dust, cinematic atmosphere.

// ---- 4D Tesseract Geometry Matrix ----
const tesseractVertices = [];
for (let i = 0; i < 16; i++) {
    tesseractVertices.push([
        i & 1 ? 1 : -1,
        i & 2 ? 1 : -1,
        i & 4 ? 1 : -1,
        i & 8 ? 1 : -1,
    ]);
}

const tesseractEdges = [];
for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j;
        if (diff && (diff & (diff - 1)) === 0) {
            tesseractEdges.push([i, j]);
        }
    }
}

const innerEdges = [];
for (let i = 0; i < 8; i++) {
    innerEdges.push([i, i + 8]);
}

// 4D Rotation with asymmetric dimensional distortion
function rotate4DInto(point, angles, time, out) {
    let x = point[0], y = point[1], z = point[2], w = point[3];

    // Asymmetric 4D harmonic breathing wave
    w += 0.15 * Math.sin(time * 0.7 + x * 0.4);
    x += 0.08 * Math.cos(time * 0.5 + y * 0.3);

    // XW Plane Rotation
    let c = Math.cos(angles.xw), s = Math.sin(angles.xw);
    const x1 = x * c - w * s;
    const w1 = x * s + w * c;
    x = x1; w = w1;

    // YW Plane Rotation
    c = Math.cos(angles.yw); s = Math.sin(angles.yw);
    const y1 = y * c - w * s;
    const w2 = y * s + w * c;
    y = y1; w = w2;

    // ZW Plane Rotation
    c = Math.cos(angles.zw); s = Math.sin(angles.zw);
    const z1 = z * c - w * s;
    const w3 = z * s + w * c;
    z = z1; w = w3;

    out[0] = x; out[1] = y; out[2] = z; out[3] = w;
}

// 4D -> 3D Perspective projection factoring W-axis depth
function project4Dto3DInto(point, distance, out) {
    const factor = distance / (distance - point[3]);
    out.set(point[0] * factor, point[1] * factor, point[2] * factor);
    return factor;
}

// Multi-layered soft radiant billboard texture
function createGlowPointTexture(innerColor = '#ffffff', outerColor = '#00f5d4', midStop = 0.3) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(midStop, outerColor);
    grad.addColorStop(0.7, 'rgba(6, 182, 212, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// High-res bloom texture for large flares
function createLargeFlareTexture(innerColor = '#ffffff', outerColor = '#00f5d4') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.12, outerColor);
    grad.addColorStop(0.35, 'rgba(6, 182, 212, 0.25)');
    grad.addColorStop(0.6, 'rgba(45, 212, 191, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Diffuse background halo texture
function createAmbientHaloTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(0, 245, 212, 0.22)');
    grad.addColorStop(0.35, 'rgba(6, 182, 212, 0.12)');
    grad.addColorStop(0.65, 'rgba(56, 189, 248, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Create an orbital ring ellipse — refined, thin, crisp neon line (circles not too thick)
function createOrbitalRing(rx, ry, tiltX, tiltZ, warp3D, color, opacity, segments = 120) {
    const group = new THREE.Group();

    const posCore = new Float32Array((segments + 1) * 3);
    const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);
    const cosZ = Math.cos(tiltZ), sinZ = Math.sin(tiltZ);

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.cos(theta) * rx;
        const y = Math.sin(theta) * ry;
        const z = Math.sin(theta * 2) * warp3D;

        // Apply tilts to center point
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;
        const px = x * cosZ - y1 * sinZ;
        const py = x * sinZ + y1 * cosZ;
        const pz = z1;

        posCore[i * 3] = px;
        posCore[i * 3 + 1] = py;
        posCore[i * 3 + 2] = pz;
    }

    // Razor-thin crisp neon core line
    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute('position', new THREE.BufferAttribute(posCore, 3));
    const coreMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: Math.min(0.95, opacity * 1.3),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const coreLine = new THREE.Line(coreGeo, coreMat);
    group.add(coreLine);

    // Delicate whisper glow line (barely 0.6% offset, low opacity — no fat thickness)
    const glowMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: opacity * 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const glowLine = new THREE.Line(coreGeo, glowMat);
    glowLine.scale.setScalar(1.006);
    group.add(glowLine);

    // Reactive .material.opacity interface for animation loops
    group.material = {
        get opacity() {
            return coreMat.opacity;
        },
        set opacity(val) {
            coreMat.opacity = Math.min(0.95, val * 1.3);
            glowLine.material.opacity = val * 0.25;
        }
    };

    return group;
}

// Status colors mapping
const statusColorMap = {
    not_started: '#0e7490',
    playing: '#10b981',
    play_later: '#06b6d4',
    completed: '#3b82f6',
    wont_play: '#6b2d4b'
};

const badgeThemeMap = {
    not_started: 'theme-silver',
    playing: 'theme-green',
    play_later: 'theme-amber',
    completed: 'theme-blue',
    wont_play: 'theme-silver'
};

// =========================================================================
// 1. HERO 4D HYPERVISUAL — ORBITAL OVERLAP EDITION
// =========================================================================
function createHeroScene(container) {
    if (!window.THREE || !container) return null;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── WebThreads-style flowing-line backdrop (straight lines, no bending) ──
    let threads = null;
    if (window.createThreadsBackground) {
        threads = window.createThreadsBackground({ opacity: 0.85, threadCount: 6, speed: 0.2 });
        threads.resize(width, height, renderer.getPixelRatio());
        renderer.autoClear = false;
    }

    let basePosX = width > 900 ? (width > 1300 ? 1.40 : 1.10) : 0;
    let basePosY = width <= 768 ? 1.20 : 0.42;
    const baseScale = width <= 768 ? 0.85 : 1.0;
    const rootGroup = new THREE.Group();
    rootGroup.position.set(basePosX, basePosY, 0);
    rootGroup.scale.set(baseScale, baseScale, baseScale);
    scene.add(rootGroup);

    // ── Core Group — icosahedron wireframe + glowing center flares ──
    const coreGroup = new THREE.Group();
    rootGroup.add(coreGroup);

    // Double-layer icosahedron for richer wireframe look
    const coreMeshOuter = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.30, 2),
        new THREE.MeshBasicMaterial({ color: '#38bdf8', wireframe: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending })
    );
    coreGroup.add(coreMeshOuter);

    const coreMeshInner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.18, 1),
        new THREE.MeshBasicMaterial({ color: '#00f5d4', wireframe: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
    );
    coreGroup.add(coreMeshInner);

    // Central flare stack — balanced, elegant bloom
    const centerPointGeo = new THREE.BufferGeometry();
    centerPointGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));

    const outerBloom = new THREE.Points(centerPointGeo, new THREE.PointsMaterial({
        size: 2.2, map: createLargeFlareTexture('#ffffff', '#00f5d4'), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    coreGroup.add(outerBloom);

    const centerFlare = new THREE.Points(centerPointGeo, new THREE.PointsMaterial({
        size: 1.3, map: createGlowPointTexture('#ffffff', '#06b6d4', 0.25), transparent: true, opacity: 0.90, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    coreGroup.add(centerFlare);

    const cyanFlare = new THREE.Points(centerPointGeo, new THREE.PointsMaterial({
        size: 0.75, map: createGlowPointTexture('#ffffff', '#38bdf8', 0.35), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    coreGroup.add(cyanFlare);

    // ── 4D Tesseract Structure ──
    const tesseractGroup = new THREE.Group();
    tesseractGroup.rotation.z = 0.24;
    tesseractGroup.rotation.x = 0.16;
    rootGroup.add(tesseractGroup);

    const tesseractScale = 0.60;
    const tesseractPositions = new Float32Array(tesseractEdges.length * 6);
    const tesseractColors = new Float32Array(tesseractEdges.length * 6);
    const tesseractGeo = new THREE.BufferGeometry();
    tesseractGeo.setAttribute('position', new THREE.BufferAttribute(tesseractPositions, 3));
    tesseractGeo.setAttribute('color', new THREE.BufferAttribute(tesseractColors, 3));

    const tesseractLines = new THREE.LineSegments(tesseractGeo, new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    tesseractGroup.add(tesseractLines);

    // Subtle inner bridge lines
    const innerPositions = new Float32Array(innerEdges.length * 6);
    const innerColors = new Float32Array(innerEdges.length * 6);
    const innerGeo = new THREE.BufferGeometry();
    innerGeo.setAttribute('position', new THREE.BufferAttribute(innerPositions, 3));
    innerGeo.setAttribute('color', new THREE.BufferAttribute(innerColors, 3));

    const innerLines = new THREE.LineSegments(innerGeo, new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.70, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    tesseractGroup.add(innerLines);

    // Dynamic 4D Vertex Points — crisp radiant nodes
    const vertexPositions = new Float32Array(16 * 3);
    const vertexGeo = new THREE.BufferGeometry();
    vertexGeo.setAttribute('position', new THREE.BufferAttribute(vertexPositions, 3));
    const vertexPoints = new THREE.Points(vertexGeo, new THREE.PointsMaterial({
        size: 0.26, map: createGlowPointTexture('#ffffff', '#2dd4bf'), transparent: true, opacity: 0.90, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    tesseractGroup.add(vertexPoints);

    // ── ELEGANT COSMIC ORBITAL RINGS (Sleek & Thin) ──
    const ringsGroup = new THREE.Group();
    rootGroup.add(ringsGroup);

    const ringConfigs = [
        { rx: 2.10, ry: 1.25, tiltX: 0.40, tiltZ: 0.18, warp: 0.10, speed: 0.0016, color: '#38bdf8', opacity: 0.55, photonSize: 0.26 },
        { rx: 1.85, ry: 1.35, tiltX: -0.50, tiltZ: -0.20, warp: 0.08, speed: -0.0014, color: '#00f5d4', opacity: 0.50, photonSize: 0.24 },
        { rx: 2.15, ry: 1.10, tiltX: 0.55, tiltZ: -0.35, warp: 0.10, speed: 0.0018, color: '#06b6d4', opacity: 0.45, photonSize: 0.24 },
        { rx: 1.45, ry: 1.05, tiltX: 0.75, tiltZ: 0.15, warp: 0.06, speed: 0.0020, color: '#2dd4bf', opacity: 0.50, photonSize: 0.20 }
    ];

    const ringObjects = ringConfigs.map((cfg, idx) => {
        // Single sleek, thin ring line (no duplicate glow bloom)
        const ring = createOrbitalRing(cfg.rx, cfg.ry, cfg.tiltX, cfg.tiltZ, cfg.warp, cfg.color, cfg.opacity);
        ringsGroup.add(ring);

        // Traveling photon light (crisp, small point)
        const photonGeo = new THREE.BufferGeometry();
        photonGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
        const photon = new THREE.Points(photonGeo, new THREE.PointsMaterial({
            size: cfg.photonSize, map: createGlowPointTexture('#ffffff', cfg.color, 0.25), transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false
        }));
        ringsGroup.add(photon);

        // Second photon traveling at offset phase
        const photon2Geo = new THREE.BufferGeometry();
        photon2Geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
        const photon2 = new THREE.Points(photon2Geo, new THREE.PointsMaterial({
            size: cfg.photonSize * 0.75, map: createGlowPointTexture('#ffffff', cfg.color, 0.3), transparent: true, opacity: 0.70, blending: THREE.AdditiveBlending, depthWrite: false
        }));
        ringsGroup.add(photon2);

        return { mesh: ring, photon, photon2, config: cfg, phase: idx * 0.9 };
    });

    // ── Cosmic Dust Particles ──
    const dustCount = 90;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    const dustPhases = [];
    for (let i = 0; i < dustCount; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * 7.5;
        dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
        dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
        dustSizes[i] = 0.08 + Math.random() * 0.22;
        dustPhases.push({
            speed: 0.2 + Math.random() * 0.4,
            xOffset: Math.random() * Math.PI * 2,
            yOffset: Math.random() * Math.PI * 2
        });
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
        size: 0.18, map: createGlowPointTexture('#ffffff', '#06b6d4', 0.35), transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    rootGroup.add(dustPoints);

    // Larger ambient orbs (scattered sparkles)
    const orbCount = 18;
    const orbPositions = new Float32Array(orbCount * 3);
    for (let i = 0; i < orbCount; i++) {
        const angle = (i / orbCount) * Math.PI * 2 + Math.random() * 0.5;
        const r = 1.8 + Math.random() * 2.5;
        orbPositions[i * 3] = Math.cos(angle) * r;
        orbPositions[i * 3 + 1] = Math.sin(angle) * r * 0.7;
        orbPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    const orbGeo = new THREE.BufferGeometry();
    orbGeo.setAttribute('position', new THREE.BufferAttribute(orbPositions, 3));
    const orbColors = ['#00f5d4', '#06b6d4', '#38bdf8', '#2dd4bf'];
    const orbMat = new THREE.PointsMaterial({
        size: 0.35, map: createGlowPointTexture('#ffffff', orbColors[Math.floor(Math.random() * 4)], 0.3),
        transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const orbPoints = new THREE.Points(orbGeo, orbMat);
    rootGroup.add(orbPoints);

    // ── Animation Loop ──
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, velX: 0, velY: 0, prevX: 0, prevY: 0 };
    const angles = { xw: 0.35, yw: 0.25, zw: 0.15 };
    const scratch1 = [0, 0, 0, 0];
    const v3 = new THREE.Vector3();
    const projected = [];
    const vertexW = [];
    for (let i = 0; i < 16; i++) {
        projected.push(new THREE.Vector3());
        vertexW.push(0);
    }

    let isVisible = true;
    let animId = null;

    const observer = new IntersectionObserver((entries) => {
        const visible = entries[0].isIntersecting;
        if (visible && !isVisible) {
            isVisible = true;
            if (!animId) {
                animId = requestAnimationFrame(animate);
            }
        } else if (!visible && isVisible) {
            isVisible = false;
            if (animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
        }
    }, { threshold: 0.01 });
    observer.observe(container);

    window.addEventListener('mousemove', (e) => {
        if (!isVisible) return;
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('mouseleave', () => {
        mouse.targetX = 0;
        mouse.targetY = 0;
    });

    let time = 0;
    function animate() {
        if (!isVisible) {
            animId = null;
            return;
        }
        animId = requestAnimationFrame(animate);
        time += 0.016;

        // Track mouse velocity for reactive effects
        mouse.velX = mouse.targetX - mouse.prevX;
        mouse.velY = mouse.targetY - mouse.prevY;
        mouse.prevX = mouse.targetX;
        mouse.prevY = mouse.targetY;
        const mouseSpeed = Math.sqrt(mouse.velX * mouse.velX + mouse.velY * mouse.velY);
        const mouseDist = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);

        // Responsive mouse interpolation (snappy damping)
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;

        // Strong 3D parallax translation — follows cursor
        const targetPosX = basePosX + mouse.x * 0.28;
        const targetPosY = basePosY + mouse.y * 0.22;
        rootGroup.position.x += (targetPosX - rootGroup.position.x) * 0.08;
        rootGroup.position.y += (targetPosY - rootGroup.position.y) * 0.08;

        // Responsive tactile parallax tilt
        const targetRotY = mouse.x * 0.22;
        const targetRotX = -mouse.y * 0.18;
        rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.08;
        rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.08;
        rootGroup.rotation.z = mouse.x * -0.04;

        // Cosmic drift on rings — amplified by cursor position
        const swayPeriod = time * (Math.PI * 2 / 14.0);
        ringsGroup.position.x = Math.sin(swayPeriod) * 0.04 + mouse.x * 0.12;
        ringsGroup.position.y = Math.cos(swayPeriod * 0.7) * 0.03 + mouse.y * 0.10;
        ringsGroup.rotation.z = Math.sin(swayPeriod * 0.5) * 0.02 + mouse.x * 0.06;
        // Rings spread apart when cursor moves away from center
        const ringSpread = 1.0 + mouseDist * 0.12;
        ringsGroup.scale.setScalar(ringSpread);

        // Core reactive pulse — pulses bigger with cursor speed, breathes with proximity
        const speedPulse = Math.min(mouseSpeed * 8, 0.15);
        const proximityPulse = (1.0 - mouseDist * 0.3);
        const corePulse = 1.0 + Math.sin(time * 0.8) * 0.025 + speedPulse + Math.max(0, (1 - mouseDist) * 0.08);
        coreGroup.scale.setScalar(corePulse);
        coreMeshOuter.rotation.x = Math.sin(time * 0.3) * 0.12 + mouse.y * 0.15;
        coreMeshOuter.rotation.y = time * 0.12 + mouse.x * 0.2;
        coreMeshInner.rotation.x = -time * 0.09 - mouse.y * 0.12;
        coreMeshInner.rotation.y = Math.cos(time * 0.25) * 0.15 + mouse.x * 0.18;

        // Bloom reacts to cursor speed
        outerBloom.material.opacity = 0.60 + Math.sin(time * 0.8) * 0.12 + speedPulse * 2;
        centerFlare.material.opacity = 0.90 + speedPulse * 1.5;

        // Mouse-driven 4D W-Axis rotation — cursor accelerates dimensional shift
        angles.xw += 0.0008 + Math.abs(mouse.x) * 0.002;
        angles.yw += 0.0006 + Math.abs(mouse.y) * 0.0018;
        angles.zw += 0.0004 + mouseSpeed * 0.008;

        for (let i = 0; i < 16; i++) {
            rotate4DInto(tesseractVertices[i], angles, time, scratch1);
            vertexW[i] = scratch1[3];
            project4Dto3DInto(scratch1, 3.4, v3);
            projected[i].set(v3.x * tesseractScale, v3.y * tesseractScale, v3.z * tesseractScale);
            vertexPositions[i * 3] = projected[i].x;
            vertexPositions[i * 3 + 1] = projected[i].y;
            vertexPositions[i * 3 + 2] = projected[i].z;
        }
        vertexGeo.attributes.position.needsUpdate = true;

        for (let i = 0; i < tesseractEdges.length; i++) {
            const idx1 = tesseractEdges[i][0];
            const idx2 = tesseractEdges[i][1];
            const p1 = projected[idx1];
            const p2 = projected[idx2];
            const avgW = (vertexW[idx1] + vertexW[idx2]) * 0.5;

            const wNorm = Math.min(Math.max((avgW + 1.2) / 2.4, 0.2), 1.0);
            const r = 0.95 * wNorm + 0.15;
            const g = 0.50 * wNorm + 0.15;
            const b = 1.0 * wNorm + 0.25;

            tesseractPositions[i * 6] = p1.x;
            tesseractPositions[i * 6 + 1] = p1.y;
            tesseractPositions[i * 6 + 2] = p1.z;
            tesseractPositions[i * 6 + 3] = p2.x;
            tesseractPositions[i * 6 + 4] = p2.y;
            tesseractPositions[i * 6 + 5] = p2.z;

            tesseractColors[i * 6] = r; tesseractColors[i * 6 + 1] = g; tesseractColors[i * 6 + 2] = b;
            tesseractColors[i * 6 + 3] = r; tesseractColors[i * 6 + 4] = g; tesseractColors[i * 6 + 5] = b;
        }
        tesseractGeo.attributes.position.needsUpdate = true;
        tesseractGeo.attributes.color.needsUpdate = true;

        for (let i = 0; i < innerEdges.length; i++) {
            const idx1 = innerEdges[i][0];
            const idx2 = innerEdges[i][1];
            const p1 = projected[idx1];
            const p2 = projected[idx2];
            const avgW = (vertexW[idx1] + vertexW[idx2]) * 0.5;
            const wNorm = Math.min(Math.max((avgW + 1.2) / 2.4, 0.2), 1.0);

            innerPositions[i * 6] = p1.x;
            innerPositions[i * 6 + 1] = p1.y;
            innerPositions[i * 6 + 2] = p1.z;
            innerPositions[i * 6 + 3] = p2.x;
            innerPositions[i * 6 + 4] = p2.y;
            innerPositions[i * 6 + 5] = p2.z;

            innerColors[i * 6] = 1.0 * wNorm; innerColors[i * 6 + 1] = 0.45 * wNorm; innerColors[i * 6 + 2] = 0.8 * wNorm;
            innerColors[i * 6 + 3] = 1.0 * wNorm; innerColors[i * 6 + 4] = 0.45 * wNorm; innerColors[i * 6 + 5] = 0.8 * wNorm;
        }
        innerGeo.attributes.position.needsUpdate = true;
        innerGeo.attributes.color.needsUpdate = true;

        tesseractGroup.position.x = Math.sin(swayPeriod + 1.2) * 0.04 + mouse.x * 0.10;
        tesseractGroup.position.y = Math.cos(swayPeriod * 0.7) * 0.02 + mouse.y * 0.08;
        tesseractGroup.rotation.z = 0.24 + Math.sin(swayPeriod * 0.5) * 0.02 + mouse.x * 0.08;

        // Orbital ring rotation + traveling photon lights — cursor speeds them up
        const photonSpeedMult = 1.0 + mouseSpeed * 12;
        ringObjects.forEach(r => {
            r.mesh.rotation.z += r.config.speed * (1 + Math.abs(mouse.x) * 2);

            // Primary photon — faster when cursor moves
            const photonAngle = (time * 0.35 * photonSpeedMult + r.phase) % (Math.PI * 2);
            const px = Math.cos(photonAngle) * r.config.rx;
            const py = Math.sin(photonAngle) * r.config.ry;
            const pz = Math.sin(photonAngle * 2) * r.config.warp;
            const cosX = Math.cos(r.config.tiltX), sinX = Math.sin(r.config.tiltX);
            const cosZ = Math.cos(r.config.tiltZ), sinZ = Math.sin(r.config.tiltZ);
            const py1 = py * cosX - pz * sinX;
            const pz1 = py * sinX + pz * cosX;
            const finalX = px * cosZ - py1 * sinZ;
            const finalY = px * sinZ + py1 * cosZ;
            r.photon.position.set(finalX, finalY, pz1);

            // Secondary photon (opposite side)
            const p2Angle = (photonAngle + Math.PI) % (Math.PI * 2);
            const p2x = Math.cos(p2Angle) * r.config.rx;
            const p2y = Math.sin(p2Angle) * r.config.ry;
            const p2z = Math.sin(p2Angle * 2) * r.config.warp;
            const p2y1 = p2y * cosX - p2z * sinX;
            const p2z1 = p2y * sinX + p2z * cosX;
            r.photon2.position.set(p2x * cosZ - p2y1 * sinZ, p2x * sinZ + p2y1 * cosZ, p2z1);
        });

        // Reactive particle drift — scatter away from cursor
        for (let i = 0; i < dustCount; i++) {
            const p = dustPhases[i];
            dustPositions[i * 3] += Math.sin(time * p.speed + p.xOffset) * 0.001;
            dustPositions[i * 3 + 1] += Math.cos(time * p.speed + p.yOffset) * 0.001;
        }
        dustGeo.attributes.position.needsUpdate = true;
        // Strong magnetic scatter — particles flee from cursor
        dustPoints.position.x = -mouse.x * 0.25;
        dustPoints.position.y = -mouse.y * 0.20;
        dustPoints.position.z = mouseDist * 0.15;
        orbPoints.position.x = -mouse.x * 0.18;
        orbPoints.position.y = -mouse.y * 0.14;
        orbPoints.position.z = -mouseDist * 0.10;

        if (threads) {
            threads.setMouse(mouse.x, mouse.y);
            threads.update(time);
            renderer.clear();
            threads.render(renderer);
        }
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const w = container.clientWidth, h = container.clientHeight;
        if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            if (threads) threads.resize(w, h, renderer.getPixelRatio());
            basePosX = w > 900 ? (w > 1300 ? 1.40 : 1.10) : 0;
            basePosY = w <= 768 ? 1.20 : 0.42;
            const s = w <= 768 ? 0.85 : 1.0;
            rootGroup.position.x = basePosX;
            rootGroup.position.y = basePosY;
            rootGroup.scale.set(s, s, s);
        }
    });
}

// =========================================================================
// 2. COLLECTION CORE — VOLUMETRIC ORBITAL RIBBON UNIVERSE (Primary Effect Focus)
// =========================================================================

// ── Multi-Planar Astronomical Orbits (Primary Volumetric Energy Ribbons) ──
const CELESTIAL_ORBITS = [
    {
        id: 'orbit-cyan',
        name: 'Cyan Energy Conduit',
        radius: 2.35,
        rotX: -0.18,
        rotY: 0.32,
        rotZ: 0.24,
        ribbonWidth: 0.088,
        haloWidth: 0.19,
        color: '#00f5d4',
        glowColor: '#2dd4bf',
        coreColor: '#f0fdfa',
        speed: 0.024
    },
    {
        id: 'orbit-amber',
        name: 'Amber Solar Ribbon',
        radius: 3.10,
        rotX: 0.26,
        rotY: -0.30,
        rotZ: -0.20,
        ribbonWidth: 0.082,
        haloWidth: 0.18,
        color: '#06b6d4',
        glowColor: '#0891b2',
        coreColor: '#ecfeff',
        speed: 0.018
    },
    {
        id: 'orbit-purple',
        name: 'Amethyst Dimensional Ribbon',
        radius: 3.85,
        rotX: -0.08,
        rotY: -0.14,
        rotZ: 0.12,
        ribbonWidth: 0.078,
        haloWidth: 0.17,
        color: '#0284c7',
        glowColor: '#0ea5e9',
        coreColor: '#e0f2fe',
        speed: 0.013
    },
    {
        id: 'orbit-lavender',
        name: 'Outer Cosmic Strand',
        radius: 4.60,
        rotX: 0.14,
        rotY: 0.20,
        rotZ: -0.08,
        ribbonWidth: 0.072,
        haloWidth: 0.16,
        color: '#14b8a6',
        glowColor: '#5eead4',
        coreColor: '#f0fdf4',
        speed: 0.009
    }
];

// Inner Resonance Accretion Rings at Base of Core
const CORE_RIPPLE_RADII = [0.55, 0.90, 1.35];

// Cinematic Quadrant Angles for Balanced Node Distribution across 3D Space
const QUADRANT_ANGLES = [
    2.85, // 0: Mid-Left (e.g. Baldur's Gate 3)
    4.15, // 1: Top-Left Back (e.g. Hollow Knight)
    5.45, // 2: Top-Right Back (e.g. Cuphead)
    6.10, // 3: Far-Right Upper (e.g. Outer Wilds)
    0.25, // 4: Mid-Right (e.g. Disco Elysium)
    1.65, // 5: Bottom-Center Front (e.g. Assassin's Creed)
    0.95, // 6: Lower-Right Front
    4.85, // 7: Upper-Mid Back
    2.20  // 8: Lower-Left Front
];

const MAX_DEFAULT_VISIBLE_LABELS = 6;

// Distinct Celestial Color Spectrum for Game Worlds
const WORLD_PALETTES = [
    { name: 'cyan', planet: '#22d3ee', rim: '#a5f3fc', corona: '#06b6d4', dot: '#22d3ee', theme: 'theme-blue', rgb: [0.13, 0.83, 0.93] },
    { name: 'amber', planet: '#fbbf24', rim: '#fef08a', corona: '#d97706', dot: '#fbbf24', theme: 'theme-amber', rgb: [0.98, 0.75, 0.14] },
    { name: 'purple', planet: '#06b6d4', rim: '#67e8f9', corona: '#0369a1', dot: '#06b6d4', theme: 'theme-purple', rgb: [0.75, 0.52, 0.98] },
    { name: 'rose', planet: '#2dd4bf', rim: '#ccfbf1', corona: '#0f766e', dot: '#2dd4bf', theme: 'theme-amber', rgb: [0.96, 0.45, 0.71] },
    { name: 'blue', planet: '#38bdf8', rim: '#bae6fd', corona: '#0284c7', dot: '#38bdf8', theme: 'theme-blue', rgb: [0.22, 0.74, 0.97] },
    { name: 'emerald', planet: '#10b981', rim: '#a7f3d0', corona: '#059669', dot: '#10b981', theme: 'theme-green', rgb: [0.06, 0.73, 0.51] }
];


// =========================================================================
// CUSTOM GLSL MOLDED GLASS CRYSTAL SHADER (High Refraction & Chromatic Dispersion)
// =========================================================================
const GlassCrystalShader = {
    uniforms: {
        uTime: { value: 0 },
        uRefractRatio: { value: 0.68 },
        uDispersion: { value: 0.028 },
        uFresnelPower: { value: 3.2 },
        uGlassColor: { value: new THREE.Color('#031f2b') },     // Very deep dark violet base
        uPlasmaColor1: { value: new THREE.Color('#0891b2') },   // Rich purple
        uPlasmaColor2: { value: new THREE.Color('#00f5d4') },   // Magenta-purple (NOT cyan)
        uRimColor: { value: new THREE.Color('#a5f3fc') }        // Soft lavender rim (NOT pure white)
    },
    vertexShader: /* glsl */ `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        varying vec3 vLocalPosition;

        void main() {
            vLocalPosition = position;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            vNormal = normalize(normalMatrix * normal);
            vViewDirection = normalize(cameraPosition - worldPos.xyz);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uRefractRatio;
        uniform float uDispersion;
        uniform float uFresnelPower;
        uniform vec3 uGlassColor;
        uniform vec3 uPlasmaColor1;
        uniform vec3 uPlasmaColor2;
        uniform vec3 uRimColor;

        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        varying vec3 vLocalPosition;

        float hash(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise3D(vec3 x) {
            vec3 p = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), f.x),
                    mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
                mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x),
                    mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y), f.z
            );
        }

        float fbm(vec3 p) {
            float v = 0.0;
            v += 0.5000 * noise3D(p); p *= 2.02;
            v += 0.2500 * noise3D(p); p *= 2.03;
            v += 0.1250 * noise3D(p);
            return v;
        }

        void main() {
            vec3 N = normalize(vNormal);
            vec3 V = normalize(vViewDirection);

            // 1. Fresnel — controls edge glow intensity
            float NdotV = max(dot(N, V), 0.0);
            float fresnel = pow(1.0 - NdotV, uFresnelPower);

            // 2. Chromatic dispersion refraction sampling
            vec3 refrR = refract(-V, N, uRefractRatio - uDispersion);
            vec3 refrG = refract(-V, N, uRefractRatio);
            vec3 refrB = refract(-V, N, uRefractRatio + uDispersion);

            vec3 samplePos = vLocalPosition * 2.5;
            float nR = fbm(samplePos + refrR * 1.0 + vec3(0.0, uTime * 0.35, 0.0));
            float nG = fbm(samplePos + refrG * 1.0 + vec3(0.0, uTime * 0.35, 0.0) + vec3(0.8));
            float nB = fbm(samplePos + refrB * 1.0 + vec3(0.0, uTime * 0.35, 0.0) + vec3(1.6));

            // 3. Internal plasma — stay in the PURPLE family, no cyan
            vec3 plasmaR = mix(uGlassColor, uPlasmaColor1, nR);
            vec3 plasmaG = mix(uGlassColor, uPlasmaColor2, nG);
            vec3 plasmaB = mix(uPlasmaColor1, uPlasmaColor2, nB);
            vec3 internalPlasma = vec3(plasmaR.r, plasmaG.g, plasmaB.b);

            // Brighten core axis slightly
            float distFromAxis = length(vLocalPosition.xz);
            float coreMask = smoothstep(0.6, 0.02, distFromAxis);
            internalPlasma = mix(internalPlasma, uPlasmaColor1 * 1.2, coreMask * 0.45);

            // 4. Subtle facet specular — NOT white-hot, tinted purple
            vec3 lightDir1 = normalize(vec3(0.7, 1.2, 0.6));
            vec3 lightDir2 = normalize(vec3(-0.8, -0.4, -0.5));
            vec3 H1 = normalize(lightDir1 + V);
            vec3 H2 = normalize(lightDir2 + V);
            float spec1 = pow(max(dot(N, H1), 0.0), 48.0);
            float spec2 = pow(max(dot(N, H2), 0.0), 32.0);
            // Tint specular lavender instead of pure white
            vec3 facetSpecular = vec3(0.40, 0.95, 0.90) * spec1 * 0.55 + vec3(0.20, 0.75, 0.85) * spec2 * 0.30;

            // 5. Edge rim glow — soft lavender-magenta, NOT blinding white
            vec3 rimGlow = mix(uPlasmaColor1, uRimColor, pow(fresnel, 2.5)) * fresnel * 1.1;

            // 6. Final composite — purple-dominant, glass-like translucency
            vec3 finalColor = internalPlasma * 0.82 + facetSpecular + rimGlow;
            float alpha = clamp(0.55 + fresnel * 0.30 + spec1 * 0.12, 0.0, 0.92);

            gl_FragColor = vec4(finalColor, alpha);
        }
    `
};

let _universeState = {
    renderer: null,
    scene: null,
    camera: null,
    rootGroup: null,
    coreGroup: null,
    crystalMesh: null,
    innerFacetMesh: null,
    wireCage: null,
    equatorialCage: null,
    volumetricRibbons: [],
    coreLightTubes: [],
    photonBeads: [],
    asteroidBelt: null,
    foregroundDebris: [],
    intersectionSparks: [],
    nodeItems: [],
    hitProxyMeshes: [],
    ambientMoons: [],
    canvasContainer: null,
    pillsContainer: null,
    activeHoverGameId: null,
    mouseNDC: new THREE.Vector2(-999, -999),
    raycaster: new THREE.Raycaster(),
    time: 0
};

let _allLoadedGames = [];
let _currentRadarFilter = 'bookmarked';

// Helper: Calculate 3D point on an inclined orbit at angle theta
function getOrbitPoint(orbit, angle, target) {
    if (!target) target = new THREE.Vector3();
    target.set(Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius);
    if (!orbit._euler) {
        orbit._euler = new THREE.Euler(orbit.rotX || 0, orbit.rotY || 0, orbit.rotZ || 0, 'XYZ');
    }
    target.applyEuler(orbit._euler);
    return target;
}

// Three.js Curve Subclass for generating closed 3D tube conduits
class CelestialOrbitCurve extends THREE.Curve {
    constructor(orbit) {
        super();
        this.orbit = orbit;
        this.euler = new THREE.Euler(orbit.rotX || 0, orbit.rotY || 0, orbit.rotZ || 0, 'XYZ');
    }
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const angle = t * Math.PI * 2;
        optionalTarget.set(
            Math.cos(angle) * this.orbit.radius,
            0,
            Math.sin(angle) * this.orbit.radius
        );
        optionalTarget.applyEuler(this.euler);
        return optionalTarget;
    }
}

// Procedural 3D Volumetric Ribbon Mesh Geometry Generator
function createOrbitRibbonGeometry(orbit, width = 0.08, segments = 180) {
    const euler = new THREE.Euler(orbit.rotX || 0, orbit.rotY || 0, orbit.rotZ || 0, 'XYZ');
    const positions = new Float32Array((segments + 1) * 2 * 3);
    const uvs = new Float32Array((segments + 1) * 2 * 2);
    const indices = [];

    const p = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0).applyEuler(euler);
    const binormal = new THREE.Vector3();

    for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const angle = u * Math.PI * 2;

        p.set(Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius).applyEuler(euler);
        tangent.set(-Math.sin(angle) * orbit.radius, 0, Math.cos(angle) * orbit.radius).applyEuler(euler).normalize();
        binormal.crossVectors(tangent, up).normalize();

        const v1 = p.clone().addScaledVector(binormal, width * 0.5);
        const v2 = p.clone().addScaledVector(binormal, -width * 0.5);

        const vIdx = i * 2;
        positions[vIdx * 3] = v1.x;
        positions[vIdx * 3 + 1] = v1.y;
        positions[vIdx * 3 + 2] = v1.z;

        positions[(vIdx + 1) * 3] = v2.x;
        positions[(vIdx + 1) * 3 + 1] = v2.y;
        positions[(vIdx + 1) * 3 + 2] = v2.z;

        uvs[vIdx * 2] = u * 4.0;
        uvs[vIdx * 2 + 1] = 0.0;

        uvs[(vIdx + 1) * 2] = u * 4.0;
        uvs[(vIdx + 1) * 2 + 1] = 1.0;

        if (i < segments) {
            const a = i * 2;
            const b = i * 2 + 1;
            const c = (i + 1) * 2;
            const d = (i + 1) * 2 + 1;
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
}

// Procedural Volumetric Ribbon Energy Texture Generator
function createVolumetricRibbonTexture(glowColor = '#22d3ee', coreColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 64);

    // Vertical gradient across ribbon width: transparent -> neon -> blazing core -> neon -> transparent
    const gradV = ctx.createLinearGradient(0, 0, 0, 64);
    gradV.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
    gradV.addColorStop(0.22, glowColor);
    gradV.addColorStop(0.42, coreColor);
    gradV.addColorStop(0.50, '#ffffff');
    gradV.addColorStop(0.58, coreColor);
    gradV.addColorStop(0.78, glowColor);
    gradV.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, 512, 64);

    // Longitudinal pulsating crests
    const gradH = ctx.createLinearGradient(0, 0, 512, 0);
    gradH.addColorStop(0.0, 'rgba(255, 255, 255, 0.15)');
    gradH.addColorStop(0.25, 'rgba(255, 255, 255, 0.95)');
    gradH.addColorStop(0.45, 'rgba(255, 255, 255, 0.20)');
    gradH.addColorStop(0.75, 'rgba(255, 255, 255, 0.90)');
    gradH.addColorStop(1.0, 'rgba(255, 255, 255, 0.15)');

    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = gradH;
    ctx.fillRect(0, 0, 512, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(4, 1);
    texture.needsUpdate = true;
    return texture;
}

// Procedural Atmospheric Outer Halo Ribbon Texture
function createHaloRibbonTexture(glowColor = '#22d3ee') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradV = ctx.createLinearGradient(0, 0, 0, 64);
    gradV.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
    gradV.addColorStop(0.35, glowColor);
    gradV.addColorStop(0.50, glowColor);
    gradV.addColorStop(0.65, glowColor);
    gradV.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(2, 1);
    texture.needsUpdate = true;
    return texture;
}

// Radial glow canvas texture generator
function createCoronaTexture(innerColor = '#ffffff', outerColor = '#06b6d4') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.20, outerColor);
    grad.addColorStop(0.55, 'rgba(139, 92, 246, 0.22)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Distant Background Crescent Planet Texture Generator
function createCrescentPlanetTexture(rimColor = '#818cf8', bodyColor = '#0b0714') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bodyColor;
    ctx.fillRect(0, 0, 256, 256);

    const grad = ctx.createRadialGradient(210, 45, 10, 128, 128, 130);
    grad.addColorStop(0, rimColor);
    grad.addColorStop(0.35, 'rgba(129, 140, 248, 0.4)');
    grad.addColorStop(0.7, 'rgba(15, 10, 25, 0.95)');
    grad.addColorStop(1, bodyColor);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < 40; i++) {
        const cx = Math.random() * 256;
        const cy = Math.random() * 256;
        const cr = 2 + Math.random() * 8;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Luminous Node Bead Texture Generator
function createNodeBeadTexture(baseColor, rimColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 128, 64);
    grad.addColorStop(0, rimColor);
    grad.addColorStop(0.4, baseColor);
    grad.addColorStop(0.85, '#0b0718');
    grad.addColorStop(1, '#05020c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 64);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 18, 128, 8);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Rebuild Minimalist 3D Game Nodes with Short Glowing Light Trails
function rebuildRadarNodes(filteredGames) {
    const { rootGroup, pillsContainer } = _universeState;
    if (!rootGroup || !pillsContainer) return;

    pillsContainer.innerHTML = '';
    _universeState.nodeItems.forEach(n => {
        if (n.meshGroup) rootGroup.remove(n.meshGroup);
        if (n.trailLine) rootGroup.remove(n.trailLine);
    });
    _universeState.nodeItems = [];
    _universeState.hitProxyMeshes = [];

    const list = Array.isArray(filteredGames) ? filteredGames : [];

    if (list.length === 0) {
        const filterLabels = {
            all: 'loaded',
            bookmarked: 'bookmarked',
            favorited: 'liked',
            playing: 'currently playing',
            backlog: 'in the backlog',
            completed: 'completed'
        };
        const label = filterLabels[_currentRadarFilter] || 'matching';
        pillsContainer.innerHTML = `
            <div class="collection-core-empty-state animate-fade-in" role="status" aria-live="polite">
                <span class="empty-icon" aria-hidden="true">✨</span>
                <h3>No ${label} worlds</h3>
                <p>Tag games as ${label} to project them into this dimensional orbit.</p>
            </div>
        `;
        return;
    }

    const nodeItems = [];
    const hitProxyMeshes = [];
    const numOrbits = CELESTIAL_ORBITS.length;

    list.forEach((game, i) => {
        const gid = Number(game.id || game.game_id || (i + 1));
        const gameName = (game.name || game.game_name || 'Untitled').trim();
        const playStatus = (game.play_status || 'not_started').toLowerCase();

        let palette = WORLD_PALETTES[i % WORLD_PALETTES.length];
        if (playStatus === 'playing') {
            palette = WORLD_PALETTES[5];
        } else if (game.is_favorited || game.favorited) {
            palette = WORLD_PALETTES[2];
        }

        const orbitIdx = i % numOrbits;
        const orbit = CELESTIAL_ORBITS[orbitIdx];
        const baseAngle = QUADRANT_ANGLES[i % QUADRANT_ANGLES.length] + Math.floor(i / QUADRANT_ANGLES.length) * 0.40;
        const isDefaultVisible = i < MAX_DEFAULT_VISIBLE_LABELS;

        // ── 1. Screen Capsule Badge (● Game Title) ──
        const pill = document.createElement('a');
        pill.href = `game.html?id=${gid}`;
        pill.className = `orbital-badge-pill ${palette.theme}${isDefaultVisible ? '' : ' hidden-label'}`;
        pill.dataset.gameId = gid;
        pill.tabIndex = 0;
        pill.setAttribute('aria-label', `View details for ${gameName}`);
        pill.innerHTML = `
            <span class="pill-status-dot" style="background:${palette.dot};box-shadow:0 0 8px ${palette.dot}" aria-hidden="true"></span>
            <span>${gameName}</span>
        `;

        pill.addEventListener('click', (e) => {
            if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                if (typeof window.openGameDetail === 'function') {
                    e.preventDefault();
                    window.openGameDetail(pill, game);
                    return;
                }
            }
            window.location.href = `game.html?id=${gid}`;
        });

        pill.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pill.click();
            }
        });

        pillsContainer.appendChild(pill);

        // ── 2. Minimalist 3D Game Node Group ──
        const meshGroup = new THREE.Group();
        rootGroup.add(meshGroup);

        const beadGeo = new THREE.SphereGeometry(0.052, 16, 16);
        const beadMat = new THREE.MeshBasicMaterial({
            map: createNodeBeadTexture(palette.planet, palette.rim),
            transparent: true,
            opacity: 0.96
        });
        const beadMesh = new THREE.Mesh(beadGeo, beadMat);
        meshGroup.add(beadMesh);

        const coronaMat = new THREE.PointsMaterial({
            size: 0.26,
            map: createCoronaTexture('#ffffff', palette.corona),
            transparent: true,
            opacity: 0.90,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const coronaGeo = new THREE.BufferGeometry();
        coronaGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
        const coronaMesh = new THREE.Points(coronaGeo, coronaMat);
        meshGroup.add(coronaMesh);

        const hitGeo = new THREE.SphereGeometry(0.24, 8, 8);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitProxy = new THREE.Mesh(hitGeo, hitMat);
        hitProxy.userData = { gameId: gid };
        meshGroup.add(hitProxy);
        hitProxyMeshes.push(hitProxy);

        // ── 3. Subtle Tapered Light Trail behind moving node ──
        const TRAIL_LENGTH = 6;
        const trailPositions = new Float32Array(TRAIL_LENGTH * 3);
        const trailColors = new Float32Array(TRAIL_LENGTH * 3);
        const startPos = getOrbitPoint(orbit, baseAngle);

        for (let t = 0; t < TRAIL_LENGTH; t++) {
            trailPositions[t * 3] = startPos.x;
            trailPositions[t * 3 + 1] = startPos.y;
            trailPositions[t * 3 + 2] = startPos.z;

            const alpha = Math.pow(1.0 - (t / TRAIL_LENGTH), 1.8);
            trailColors[t * 3] = palette.rgb[0] * alpha;
            trailColors[t * 3 + 1] = palette.rgb[1] * alpha;
            trailColors[t * 3 + 2] = palette.rgb[2] * alpha;
        }

        const trailGeo = new THREE.BufferGeometry();
        trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
        trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

        const trailMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.80,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const trailLine = new THREE.Line(trailGeo, trailMat);
        rootGroup.add(trailLine);

        const nodeObj = {
            id: gid,
            name: gameName,
            game,
            element: pill,
            meshGroup,
            beadMesh,
            coronaMesh,
            hitProxy,
            trailLine,
            trailGeo,
            trailHistory: Array.from({ length: TRAIL_LENGTH }, () => startPos.clone()),
            orbitIdx,
            orbit,
            baseAngle,
            currentAngle: baseAngle,
            palette,
            isDefaultVisible,
            isHovered: false,
            pos3D: startPos.clone(),
            screenPos: { x: 0, y: 0, scale: 1, zIndex: 10 }
        };

        const onEnter = () => {
            nodeObj.isHovered = true;
            _universeState.activeHoverGameId = gid;
        };
        const onLeave = () => {
            nodeObj.isHovered = false;
            if (_universeState.activeHoverGameId === gid) {
                _universeState.activeHoverGameId = null;
            }
        };

        pill.addEventListener('mouseenter', onEnter);
        pill.addEventListener('mouseleave', onLeave);
        pill.addEventListener('focus', onEnter);
        pill.addEventListener('blur', onLeave);

        nodeItems.push(nodeObj);
    });

    _universeState.nodeItems = nodeItems;
    _universeState.hitProxyMeshes = hitProxyMeshes;
}

// ── Master Scene Construction ──
function createRadarCoreScene(canvasContainer, pillsContainer, games) {
    if (!window.THREE || !canvasContainer || !pillsContainer) return;
    if (canvasContainer.dataset.initialized) {
        if (typeof window.updateCollectionCore === 'function') {
            window.updateCollectionCore(games);
        }
        return;
    }
    canvasContainer.dataset.initialized = 'true';

    _universeState.canvasContainer = canvasContainer;
    _universeState.pillsContainer = pillsContainer;

    // The dashboard radar widget always orbits the ENTIRE library (no bookmark pre-filter)
    if (canvasContainer.id === 'radarCore3d') {
        _currentRadarFilter = 'all';
    }

    const width = canvasContainer.clientWidth || 800;
    const height = canvasContainer.clientHeight || 720;

    const scene = new THREE.Scene();

    // ── 3D Camera: Elevated 3/4 Perspective (~30 deg above horizontal) ──
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 4.25, 7.8);
    camera.lookAt(0, 0.22, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(renderer.domElement);

    // Root Group: Shifted up and scaled so outer bounds never clip at bottom
    // Compact widget mode (library dashboard radar card): centered scene at reduced scale
    const isRadarWidget = canvasContainer.id === 'radarCore3d';
    const rootGroup = new THREE.Group();
    let baseRadarX;
    if (isRadarWidget) {
        baseRadarX = 0;
        // Lifted + slightly smaller scale so the outer ring never clips at the card's bottom edge
        rootGroup.position.set(0, 0.45, 0);
        const ws = Math.min(1.05, Math.max(0.6, width / 1150));
        rootGroup.scale.set(ws, ws, ws);
    } else {
        baseRadarX = width > 900 ? (width > 1300 ? 1.25 : 0.95) : 0;
        rootGroup.position.x = baseRadarX;
        rootGroup.position.y = 0.38;
        const baseScale = width > 1300 ? 0.82 : (width > 900 ? 0.76 : 0.68);
        rootGroup.scale.set(baseScale, baseScale, baseScale);
    }
    scene.add(rootGroup);

    // ── WebThreads-style flowing-line backdrop (subtle, keeps pills readable) ──
    let threads = null;
    if (window.createThreadsBackground) {
        threads = window.createThreadsBackground(isRadarWidget ? {
            opacity: 0.55, threadCount: 5, speed: 0.16, thickness: 1.1,
            brightness: 0.62, glow: 0.03, falloff: 0.4, mouseStrength: 0.2
        } : {
            opacity: 0.4, threadCount: 5, speed: 0.18, thickness: 1.0, brightness: 0.55
        });
        threads.resize(width, height, renderer.getPixelRatio());
        renderer.autoClear = false;
    }

    _universeState.renderer = renderer;
    _universeState.scene = scene;
    _universeState.camera = camera;
    _universeState.rootGroup = rootGroup;

    // =========================================================================
    // 0. DEEP SPACE BACKGROUND ATMOSPHERE & CRESCENT CELESTIAL BODIES
    // =========================================================================
    const bgGroup = new THREE.Group();
    scene.add(bgGroup);

    const planetLeftGeo = new THREE.SphereGeometry(1.65, 32, 32);
    const planetLeftMat = new THREE.MeshBasicMaterial({
        map: createCrescentPlanetTexture('#0891b2', '#020810'),
        transparent: true,
        opacity: 0.85
    });
    const planetLeft = new THREE.Mesh(planetLeftGeo, planetLeftMat);
    planetLeft.position.set(-5.4, -2.6, -6.5);
    planetLeft.rotation.z = Math.PI * 0.25;
    bgGroup.add(planetLeft);

    const planetRightGeo = new THREE.SphereGeometry(0.95, 24, 24);
    const planetRightMat = new THREE.MeshBasicMaterial({
        map: createCrescentPlanetTexture('#06b6d4', '#030914'),
        transparent: true,
        opacity: 0.75
    });
    const planetRight = new THREE.Mesh(planetRightGeo, planetRightMat);
    planetRight.position.set(5.8, 2.8, -7.5);
    planetRight.rotation.z = -Math.PI * 0.35;
    bgGroup.add(planetRight);

    const starCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let s = 0; s < starCount; s++) {
        starPos[s * 3] = (Math.random() - 0.5) * 24;
        starPos[s * 3 + 1] = (Math.random() - 0.5) * 16;
        starPos[s * 3 + 2] = -3 - Math.random() * 8;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
        size: 0.035,
        color: '#a5f3fc',
        transparent: true,
        opacity: 0.55
    });
    bgGroup.add(new THREE.Points(starGeo, starMat));

    // =========================================================================
    // 1. CENTRAL CRYSTAL CORE — FULL MOLDED GLASS DIAMOND MONOLITH (Matching Reference Image)
    // =========================================================================
    const coreGroup = new THREE.Group();
    rootGroup.add(coreGroup);
    _universeState.coreGroup = coreGroup;

    // ── A. Faceted Molded Glass Diamond Monolith Geometry (Compact Bipyramid) ──
    // Compact size to not block orbital ribbons. Height ~1.15 units, radius ~0.38.
    const crystalGeo = new THREE.OctahedronGeometry(0.48, 0).toNonIndexed();
    crystalGeo.scale(0.80, 1.18, 0.80);
    crystalGeo.computeVertexNormals();

    const crystalGlassMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(GlassCrystalShader.uniforms),
        vertexShader: GlassCrystalShader.vertexShader,
        fragmentShader: GlassCrystalShader.fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.NormalBlending
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalGlassMat);
    coreGroup.add(crystalMesh);
    _universeState.crystalMesh = crystalMesh;
    _universeState.crystalGlassMat = crystalGlassMat;

    // ── B. Razor-Sharp Neon Edge Bevels (Emissive Facet Edges) ──
    const wireGeo = new THREE.WireframeGeometry(crystalGeo);
    const wireMat = new THREE.LineBasicMaterial({
        color: '#00f5d4', // Bright turquoise edge bevels
        transparent: true,
        opacity: 0.82,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const wireCage = new THREE.LineSegments(wireGeo, wireMat);
    coreGroup.add(wireCage);
    _universeState.wireCage = wireCage;

    // ── C. Inner Counter-Rotating Plasma Soul Gem (Nested Deep Within Glass) ──
    const innerFacetGeo = new THREE.OctahedronGeometry(0.30, 0).toNonIndexed();
    innerFacetGeo.scale(0.75, 1.08, 0.75);
    innerFacetGeo.computeVertexNormals();
    const innerFacetMat = new THREE.MeshBasicMaterial({
        color: '#0891b2', // Deep Turkish blue
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const innerFacetMesh = new THREE.Mesh(innerFacetGeo, innerFacetMat);
    coreGroup.add(innerFacetMesh);
    _universeState.innerFacetMesh = innerFacetMesh;

    // ── D. Inner Radiant Singularity Core ──
    const innerGeo = new THREE.OctahedronGeometry(0.14, 0);
    innerGeo.scale(0.75, 1.10, 0.75);
    const innerMat = new THREE.MeshBasicMaterial({
        color: '#a5f3fc', // Luminous sea-glass
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });
    const innerGem = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerGem);

    // ── E. Central Superheated Flare Point ──
    const flareGeo = new THREE.BufferGeometry();
    flareGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
    const flareMat = new THREE.PointsMaterial({
        size: 0.85,
        map: createCoronaTexture('#a5f3fc', '#06b6d4'),
        transparent: true,
        opacity: 0.80,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const flarePoint = new THREE.Points(flareGeo, flareMat);
    coreGroup.add(flarePoint);

    // ── F. Vertical Piercing Laser Light Beam (Through Top & Bottom Apexes) ──
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -1.05, 0),
        new THREE.Vector3(0, 1.25, 0)
    ]);
    const axisMat = new THREE.LineBasicMaterial({
        color: '#00f5d4',
        transparent: true,
        opacity: 0.60,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const axisLine = new THREE.Line(axisGeo, axisMat);
    coreGroup.add(axisLine);

    // Top & Bottom Apex Flares
    const topFlareGeo = new THREE.BufferGeometry();
    topFlareGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.57, 0]), 3));
    const apexFlareMat = new THREE.PointsMaterial({
        size: 0.45,
        map: createCoronaTexture('#ffffff', '#2dd4bf'),
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const topApexFlare = new THREE.Points(topFlareGeo, apexFlareMat);
    coreGroup.add(topApexFlare);

    const btmFlareGeo = new THREE.BufferGeometry();
    btmFlareGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, -0.57, 0]), 3));
    const bottomApexFlare = new THREE.Points(btmFlareGeo, apexFlareMat);
    coreGroup.add(bottomApexFlare);

    // ── G. Concentric Accretion Swirl Rings At Base of Crystal Monolith ──
    const baseRipples = [0.40, 0.70, 1.05, 1.45];
    const baseRippleMeshes = [];
    baseRipples.forEach((r, idx) => {
        const ripplePts = [];
        const segs = 100;
        for (let s = 0; s <= segs; s++) {
            const th = (s / segs) * Math.PI * 2;
            ripplePts.push(Math.cos(th) * r, -0.58, Math.sin(th) * r);
        }
        const rGeo = new THREE.BufferGeometry();
        rGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ripplePts), 3));
        const rMat = new THREE.LineBasicMaterial({
            color: idx % 2 === 0 ? '#00f5d4' : '#0891b2',
            transparent: true,
            opacity: 0.55 - idx * 0.10,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const rLine = new THREE.Line(rGeo, rMat);
        rootGroup.add(rLine);
        baseRippleMeshes.push({ mesh: rLine, speed: (idx % 2 === 0 ? 1 : -1) * 0.008 });
    });
    _universeState.baseRippleMeshes = baseRippleMeshes;

    // =========================================================================
    // 2. THE PRIMARY VOLUMETRIC ORBITAL RIBBONS (The Hero Visual Architecture)
    // =========================================================================
    const volumetricRibbons = [];
    const coreLightTubes = [];
    const photonBeads = [];

    CELESTIAL_ORBITS.forEach((orbit) => {
        const curve = new CelestialOrbitCurve(orbit);

        // ── A. Inner Luminous Core Light Tube (Solid physical 3D light pipe) ──
        const tubeGeo = new THREE.TubeGeometry(curve, 180, 0.016, 8, true);
        const tubeMat = new THREE.MeshBasicMaterial({
            color: orbit.coreColor,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        rootGroup.add(tubeMesh);
        coreLightTubes.push(tubeMesh);

        // ── B. Main Volumetric Energy Ribbon Mesh Band (Physical Width ~0.08 units) ──
        const ribbonGeo = createOrbitRibbonGeometry(orbit, orbit.ribbonWidth, 180);
        const ribbonTex = createVolumetricRibbonTexture(orbit.glowColor, orbit.coreColor);
        const ribbonMat = new THREE.MeshBasicMaterial({
            map: ribbonTex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.88,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
        rootGroup.add(ribbonMesh);

        // ── C. Outer Soft Atmospheric Halo Ribbon (Soft glowing neon perimeter) ──
        const haloGeo = createOrbitRibbonGeometry(orbit, orbit.haloWidth, 180);
        const haloTex = createHaloRibbonTexture(orbit.glowColor);
        const haloMat = new THREE.MeshBasicMaterial({
            map: haloTex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.40,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        rootGroup.add(haloMesh);

        volumetricRibbons.push({
            orbit,
            ribbonMesh,
            ribbonMat,
            haloMesh,
            haloMat,
            tex: ribbonTex,
            haloTex: haloTex,
            speed: orbit.speed
        });

        // ── D. Traveling High-Energy Pulse Beads along the Ribbon ──
        const photonGeo = new THREE.BufferGeometry();
        photonGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
        const photonMat = new THREE.PointsMaterial({
            size: 0.22,
            map: createCoronaTexture('#ffffff', orbit.glowColor),
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const photonMesh = new THREE.Points(photonGeo, photonMat);
        rootGroup.add(photonMesh);
        photonBeads.push({ mesh: photonMesh, orbit });
    });

    _universeState.volumetricRibbons = volumetricRibbons;
    _universeState.coreLightTubes = coreLightTubes;
    _universeState.photonBeads = photonBeads;

    // =========================================================================
    // 3. MIDGROUND SHIMMERING ASTEROID BELT & FOREGROUND DEBRIS
    // =========================================================================
    // Intersection Spark at crossing between Cyan and Amber inclined tracks
    const sparkCrossGeo = new THREE.BufferGeometry();
    const crossPt = new THREE.Vector3(1.75, 0.42, 1.15);
    sparkCrossGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([crossPt.x, crossPt.y, crossPt.z]), 3));
    const sparkCrossMat = new THREE.PointsMaterial({
        size: 0.32,
        map: createCoronaTexture('#ffffff', '#38bdf8'),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const sparkCrossMesh = new THREE.Points(sparkCrossGeo, sparkCrossMat);
    rootGroup.add(sparkCrossMesh);
    _universeState.intersectionSparks.push(sparkCrossMesh);

    // Midground Shimmering Curved Asteroid Belt
    const asteroidCount = 680;
    const asteroidGeo = new THREE.BufferGeometry();
    const asteroidPos = new Float32Array(asteroidCount * 3);
    const asteroidColors = new Float32Array(asteroidCount * 3);
    const beltMinR = 2.65;
    const beltMaxR = 3.00;
    const beltEuler = new THREE.Euler(0.06, 0.04, -0.02, 'XYZ');
    const tempV = new THREE.Vector3();

    for (let a = 0; a < asteroidCount; a++) {
        const th = Math.random() * Math.PI * 2;
        const r = beltMinR + Math.random() * (beltMaxR - beltMinR);
        const yDisp = (Math.random() - 0.5) * 0.12;

        tempV.set(Math.cos(th) * r, yDisp, Math.sin(th) * r);
        tempV.applyEuler(beltEuler);

        asteroidPos[a * 3] = tempV.x;
        asteroidPos[a * 3 + 1] = tempV.y;
        asteroidPos[a * 3 + 2] = tempV.z;

        const isGold = Math.random() > 0.42;
        if (isGold) {
            asteroidColors[a * 3] = 0.98;
            asteroidColors[a * 3 + 1] = 0.78;
            asteroidColors[a * 3 + 2] = 0.28;
        } else {
            asteroidColors[a * 3] = 0.75;
            asteroidColors[a * 3 + 1] = 0.48;
            asteroidColors[a * 3 + 2] = 0.98;
        }
    }

    asteroidGeo.setAttribute('position', new THREE.BufferAttribute(asteroidPos, 3));
    asteroidGeo.setAttribute('color', new THREE.BufferAttribute(asteroidColors, 3));

    const asteroidMat = new THREE.PointsMaterial({
        size: 0.048,
        vertexColors: true,
        transparent: true,
        opacity: 0.70,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const asteroidBelt = new THREE.Points(asteroidGeo, asteroidMat);
    rootGroup.add(asteroidBelt);
    _universeState.asteroidBelt = asteroidBelt;

    // Foreground Cinematic Space Debris (Peripheral Out-of-Focus Framing)
    const foregroundDebris = [];
    const debrisPositions = [
        { x: -4.8, y: -1.8, z: 5.2, size: 0.22, rx: 0.012, ry: 0.018 },
        { x: -5.4, y: 1.4, z: 4.9, size: 0.18, rx: 0.015, ry: -0.012 },
        { x: 4.9, y: -2.0, z: 5.4, size: 0.26, rx: -0.014, ry: 0.016 },
        { x: 5.5, y: 1.8, z: 4.8, size: 0.16, rx: 0.018, ry: 0.010 },
        { x: -3.8, y: -2.6, z: 5.8, size: 0.28, rx: 0.009, ry: 0.015 },
        { x: 3.9, y: 2.5, z: 5.6, size: 0.20, rx: -0.011, ry: -0.014 }
    ];

    debrisPositions.forEach((dp) => {
        const dGeo = new THREE.DodecahedronGeometry(dp.size, 0);
        const dMat = new THREE.MeshBasicMaterial({
            color: '#1c132c',
            wireframe: false,
            transparent: true,
            opacity: 0.55
        });
        const dMesh = new THREE.Mesh(dGeo, dMat);
        dMesh.position.set(dp.x, dp.y, dp.z);
        scene.add(dMesh);
        foregroundDebris.push({ mesh: dMesh, rx: dp.rx, ry: dp.ry });
    });
    _universeState.foregroundDebris = foregroundDebris;

    // Initial node building with initial filtered list
    rebuildRadarNodes(games);

    // =========================================================================
    // 4. ANIMATION LOOP & SMOOTH INTERACTION PIPELINE
    // =========================================================================
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let isVisible = true;
    let animId = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver((entries) => {
        const visible = entries[0].isIntersecting;
        if (visible && !isVisible) {
            isVisible = true;
            if (!animId) {
                animId = requestAnimationFrame(animate);
            }
        } else if (!visible && isVisible) {
            isVisible = false;
            if (animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
        }
    }, { threshold: 0.01 });
    observer.observe(canvasContainer);

    window.addEventListener('mousemove', (e) => {
        if (!isVisible) return;
        const rect = canvasContainer.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
            _universeState.mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            _universeState.mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            if (!prefersReducedMotion) {
                const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.5);
                const ny = -(e.clientY - (rect.top + rect.height / 2)) / (rect.height * 0.5);
                mouse.targetX = Math.max(-1.0, Math.min(1.0, nx));
                mouse.targetY = Math.max(-1.0, Math.min(1.0, ny));
            }
        } else {
            _universeState.mouseNDC.x = -999;
            _universeState.mouseNDC.y = -999;
        }
    });

    window.addEventListener('mouseleave', () => {
        mouse.targetX = 0;
        mouse.targetY = 0;
        _universeState.mouseNDC.x = -999;
        _universeState.mouseNDC.y = -999;
    });

    const projVector = new THREE.Vector3();
    const coreScreenPos = new THREE.Vector3();

    function animate() {
        if (!isVisible) {
            animId = null;
            return;
        }
        animId = requestAnimationFrame(animate);

        _universeState.time += 0.016;
        const time = _universeState.time;

        const containerW = canvasContainer.clientWidth || 800;
        const containerH = canvasContainer.clientHeight || 720;
        const halfW = containerW * 0.5;
        const halfH = containerH * 0.5;

        // Subtle mouse parallax damping
        if (!prefersReducedMotion) {
            mouse.x += (mouse.targetX - mouse.x) * 0.035;
            mouse.y += (mouse.targetY - mouse.y) * 0.035;
            rootGroup.rotation.y = mouse.x * 0.06;
            rootGroup.rotation.x = -mouse.y * 0.04;
        }

        // Animate Molded Glass Crystal Monolith & Internal Shader
        if (_universeState.crystalGlassMat && _universeState.crystalGlassMat.uniforms) {
            _universeState.crystalGlassMat.uniforms.uTime.value = time;
        }

        // Glass crystal rotates smoothly along Y-axis
        crystalMesh.rotation.y = time * 0.28;
        wireCage.rotation.y = crystalMesh.rotation.y;

        // Inner plasma soul gem counter-rotates on dual axes for deep refraction
        innerFacetMesh.rotation.y = -time * 0.52;
        innerFacetMesh.rotation.x = Math.sin(time * 0.45) * 0.35;
        innerFacetMesh.rotation.z = Math.cos(time * 0.38) * 0.25;

        // Subtle organic crystal breathing
        const breath = 1.0 + Math.sin(time * 1.2) * 0.024;
        crystalMesh.scale.set(0.80 * breath, 1.18 * breath, 0.80 * breath);
        wireCage.scale.set(breath, breath, breath);

        // Rotate Base Concentric Accretion Swirl Rings
        if (_universeState.baseRippleMeshes && !prefersReducedMotion) {
            _universeState.baseRippleMeshes.forEach(rm => {
                rm.mesh.rotation.y += rm.speed;
            });
        }

        // Rotate Asteroid Belt & Tumble Foreground Debris
        if (!prefersReducedMotion) {
            asteroidBelt.rotation.y = time * 0.014;
            foregroundDebris.forEach(fd => {
                fd.mesh.rotation.x += fd.rx;
                fd.mesh.rotation.y += fd.ry;
            });
        }

        // Intersection Sparks Pulsing
        _universeState.intersectionSparks.forEach(isp => {
            const pFlare = Math.pow(Math.sin(time * 2.8), 4);
            isp.material.size = 0.25 + pFlare * 0.20;
            isp.material.opacity = 0.65 + pFlare * 0.35;
        });

        // ── Continuous High-Energy Flow Along Volumetric Ribbons (THE PRIMARY HERO EFFECT) ──
        _universeState.volumetricRibbons.forEach((vr) => {
            if (!prefersReducedMotion) {
                // Translate the energy texture offset along the closed ribbon loop
                vr.tex.offset.x -= vr.speed * 0.45;
                vr.haloTex.offset.x -= vr.speed * 0.30;
            }
        });

        // Traveling Photon Pulses along 3D orbits
        photonBeads.forEach((pb, pIdx) => {
            const pAngle = time * pb.orbit.speed * 1.5 + (pIdx * 1.6);
            getOrbitPoint(pb.orbit, pAngle, tempV);
            const posAttr = pb.mesh.geometry.attributes.position;
            posAttr.setXYZ(0, tempV.x, tempV.y, tempV.z);
            posAttr.needsUpdate = true;
        });

        // 3D Raycasting for Direct Node Hovering
        let rayHoveredGameId = null;
        if (_universeState.mouseNDC.x !== -999 && _universeState.hitProxyMeshes.length > 0) {
            _universeState.raycaster.setFromCamera(_universeState.mouseNDC, camera);
            const intersects = _universeState.raycaster.intersectObjects(_universeState.hitProxyMeshes, false);
            if (intersects.length > 0) {
                rayHoveredGameId = intersects[0].object.userData.gameId;
            }
        }

        // ── 3D Game Nodes, Tapered Trails & Screen Capsule Labels ──
        const activeLabelsToRelax = [];
        const hasAnyHover = !!(_universeState.activeHoverGameId || rayHoveredGameId);

        coreScreenPos.set(0, 0, 0);
        rootGroup.localToWorld(coreScreenPos);
        coreScreenPos.project(camera);
        const coreScreenX = (coreScreenPos.x * halfW) + halfW;
        const coreScreenY = -(coreScreenPos.y * halfH) + halfH;

        _universeState.nodeItems.forEach((node) => {
            const isNodeHovered = node.isHovered || (rayHoveredGameId === node.id);

            const speed = isNodeHovered ? 0.002 : (prefersReducedMotion ? 0 : node.orbit.speed);
            node.currentAngle += speed * 0.016;

            getOrbitPoint(node.orbit, node.currentAngle, node.pos3D);
            node.meshGroup.position.copy(node.pos3D);

            // Update Tapered Light Trail behind moving node
            node.trailHistory.unshift(node.pos3D.clone());
            node.trailHistory.pop();
            const trailPosAttr = node.trailGeo.attributes.position;
            for (let t = 0; t < node.trailHistory.length; t++) {
                const hp = node.trailHistory[t];
                trailPosAttr.setXYZ(t, hp.x, hp.y, hp.z);
            }
            trailPosAttr.needsUpdate = true;
            node.trailLine.material.opacity = isNodeHovered ? 0.95 : 0.65;

            // Hover bloom
            const targetBeadScale = isNodeHovered ? 2.2 : 1.0;
            node.beadMesh.scale.lerp(new THREE.Vector3(targetBeadScale, targetBeadScale, targetBeadScale), 0.14);
            node.coronaMesh.material.size = isNodeHovered ? 0.65 : 0.26;

            // Project 3D Node Position -> 2D Screen Space
            projVector.copy(node.pos3D);
            rootGroup.localToWorld(projVector);
            projVector.project(camera);

            let screenX = (projVector.x * halfW) + halfW;
            let screenY = -(projVector.y * halfH) + halfH;

            const depthNorm = Math.max(0, Math.min(1, (node.pos3D.z + 3.8) / 7.6));
            const depthScale = 0.86 + depthNorm * 0.24;

            const pillW = node.element.offsetWidth || 140;
            const pillH = node.element.offsetHeight || 28;

            let labelOffset = (18 * depthScale) + (pillW * 0.5);
            if (screenX > containerW - 190) {
                labelOffset = -((18 * depthScale) + (pillW * 0.5));
            }
            screenX += labelOffset;

            // Core Avoidance (compact widget uses a tighter exclusion box)
            const avoidW = isRadarWidget ? 55 : 85;
            const avoidH = isRadarWidget ? 34 : 55;
            const avoidShift = isRadarWidget ? 24 : 32;
            const distToCoreX = screenX - coreScreenX;
            const distToCoreY = screenY - coreScreenY;
            if (Math.abs(distToCoreX) < avoidW && Math.abs(distToCoreY) < avoidH) {
                screenY += distToCoreY >= 0 ? avoidShift : -avoidShift;
            }

            // Viewport Clamping: Never cuts off at bottom or collides with top
            // (full-page core keeps a 340px left clearance for its filter sidebar; the widget clamps to its own
            //  edges and keeps labels clear of the floating header text in its top-left corner)
            const pillLeftClearance = isRadarWidget ? 10 : 340;
            const pillTopClearance = isRadarWidget ? (screenX < 520 ? 145 : 38) : 50;
            screenY = Math.max(pillTopClearance + pillH / 2, Math.min(containerH - 35 - pillH / 2, screenY));
            screenX = Math.max(pillLeftClearance + pillW / 2, Math.min(containerW - 10 - pillW / 2, screenX));

            node.screenPos = {
                x: screenX,
                y: screenY,
                depthScale,
                depthNorm,
                isHovered: isNodeHovered,
                pillW,
                pillH
            };

            if (node.isDefaultVisible || isNodeHovered) {
                activeLabelsToRelax.push(node);
            }
        });

        // Anti-Collision Relaxation Pass across visible badges
        for (let pass = 0; pass < 3; pass++) {
            activeLabelsToRelax.sort((a, b) => a.screenPos.y - b.screenPos.y);
            for (let i = 0; i < activeLabelsToRelax.length - 1; i++) {
                const cur = activeLabelsToRelax[i];
                const next = activeLabelsToRelax[i + 1];
                const vDist = next.screenPos.y - cur.screenPos.y;
                const minVGap = 30;

                if (vDist < minVGap) {
                    const hDist = Math.abs(next.screenPos.x - cur.screenPos.x);
                    if (hDist < 135) {
                        const shift = (minVGap - vDist) * 0.5;
                        cur.screenPos.y = Math.max(50, cur.screenPos.y - shift);
                        next.screenPos.y = Math.min(containerH - 35, next.screenPos.y + shift);
                    }
                }
            }
        }

        // Apply Screen Transformations & Visibility to Capsule Badges
        _universeState.nodeItems.forEach((node) => {
            const sp = node.screenPos;
            const isVisibleLabel = node.isDefaultVisible || sp.isHovered;

            if (isVisibleLabel) {
                node.element.classList.remove('hidden-label');
            } else {
                node.element.classList.add('hidden-label');
            }

            const activeScale = sp.isHovered ? (sp.depthScale * 1.08) : sp.depthScale;
            node.element.style.transform = `translate3d(${sp.x.toFixed(1)}px, ${sp.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${activeScale.toFixed(3)})`;
            node.element.style.zIndex = sp.isHovered ? 100 : Math.round(10 + sp.depthNorm * 25);
            node.element.classList.toggle('active-highlight', sp.isHovered);
            node.element.classList.toggle('dimmed', hasAnyHover && !sp.isHovered);
        });

        if (threads) {
            threads.setMouse(mouse.x, mouse.y);
            threads.update(time);
            renderer.clear();
            threads.render(renderer);
        }
        renderer.render(scene, camera);
    }
    animate();

    // Responsive Canvas Resize
    window.addEventListener('resize', () => {
        const w = canvasContainer.clientWidth, h = canvasContainer.clientHeight;
        if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            if (threads) threads.resize(w, h, renderer.getPixelRatio());
            if (isRadarWidget) {
                rootGroup.position.x = 0;
                rootGroup.position.y = 0.45;
                const s = Math.min(1.05, Math.max(0.6, w / 1150));
                rootGroup.scale.set(s, s, s);
            } else {
                baseRadarX = w > 900 ? (w > 1300 ? 1.25 : 0.95) : 0;
                rootGroup.position.x = baseRadarX;
                const s = w > 1300 ? 0.82 : (w > 900 ? 0.76 : 0.68);
                rootGroup.scale.set(s, s, s);
            }
        }
    });
}

// =========================================================================
// 3. MASTER INITIALIZER & REACTIVE UPDATE API
// =========================================================================

function updateRadarCounts(games) {
    const list = Array.isArray(games) ? games : (window.__ALL_GAMES__ || []);
    const countBookmarked = list.filter(g => Boolean(g.is_bookmarked || g.bookmarked)).length;
    const countFavorited = list.filter(g => Boolean(g.is_favorited || g.favorited)).length;
    const countPlaying = list.filter(g => (g.play_status || '').toLowerCase() === 'playing').length;

    const elB = document.getElementById('radarCountBookmarked');
    const elF = document.getElementById('radarCountFavorited');
    const elP = document.getElementById('radarCountPlaying');

    if (elB) elB.textContent = countBookmarked;
    if (elF) elF.textContent = countFavorited;
    if (elP) elP.textContent = countPlaying;
}

window.setRadarFilter = function (filterName) {
    _currentRadarFilter = filterName;
    const list = _allLoadedGames && _allLoadedGames.length > 0 ? _allLoadedGames : (window.__ALL_GAMES__ || []);

    let filtered = [];
    if (filterName === 'all') {
        filtered = list;
    } else if (filterName === 'favorited') {
        filtered = list.filter(g => Boolean(g.is_favorited || g.favorited));
    } else if (filterName === 'playing') {
        filtered = list.filter(g => (g.play_status || '').toLowerCase() === 'playing');
    } else if (filterName === 'backlog') {
        // Backlog view = play later games only
        filtered = list.filter(g => (g.play_status || '').toLowerCase() === 'play_later');
    } else if (filterName === 'completed') {
        filtered = list.filter(g => (g.play_status || '').toLowerCase() === 'completed');
    } else {
        filtered = list.filter(g => Boolean(g.is_bookmarked || g.bookmarked));
    }

    const pillsLayer = _universeState.pillsContainer || document.getElementById('corePillsLayer');
    const coreGroup = _universeState.coreGroup;

    const isWidgetCore = _universeState.canvasContainer && _universeState.canvasContainer.id === 'radarCore3d';
    if (coreGroup && !isWidgetCore) {
        coreGroup.scale.set(1.25, 1.25, 1.25);
    }

    if (pillsLayer) {
        pillsLayer.style.opacity = '0';
        setTimeout(() => {
            rebuildRadarNodes(filtered);
            pillsLayer.style.opacity = '1';
        }, 160);
    } else {
        rebuildRadarNodes(filtered);
    }

    document.querySelectorAll('.core-filter-card').forEach(btn => {
        const isActive = btn.dataset.filter === filterName;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
};

function initRadarFilterButtons() {
    const filterTabs = document.getElementById('radarFilterTabs');
    if (!filterTabs || filterTabs.dataset.bound) return;
    filterTabs.dataset.bound = 'true';

    filterTabs.querySelectorAll('.core-filter-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = btn.dataset.filter;
            if (filter) window.setRadarFilter(filter);
        });
    });
}

window.updateCollectionCore = function (allGames) {
    const list = Array.isArray(allGames) ? allGames : (allGames?.games || window.__ALL_GAMES__ || []);
    _allLoadedGames = list;
    window.__ALL_GAMES__ = list;
    updateRadarCounts(list);
    window.setRadarFilter(_currentRadarFilter);
};

window.initHeroScene = function () {
    const heroContainer = document.getElementById('hero3d');
    if (heroContainer && !heroContainer.dataset.initialized) {
        heroContainer.dataset.initialized = 'true';
        createHeroScene(heroContainer);
    }
};

function initCollectionCore(gamesData) {
    const rawList = Array.isArray(gamesData) ? gamesData : (gamesData?.games || window.__ALL_GAMES__ || []);
    _allLoadedGames = rawList;
    window.__ALL_GAMES__ = rawList;

    updateRadarCounts(rawList);
    initRadarFilterButtons();

    if (typeof window.initHeroScene === 'function') {
        window.initHeroScene();
    }

    const core3d = document.getElementById('core3d');
    const pillsLayer = document.getElementById('corePillsLayer');
    if (core3d && pillsLayer) {
        let initialList = rawList.filter(g => Boolean(g.is_bookmarked || g.bookmarked));
        if (_currentRadarFilter === 'favorited') {
            initialList = rawList.filter(g => Boolean(g.is_favorited || g.favorited));
        } else if (_currentRadarFilter === 'playing') {
            initialList = rawList.filter(g => (g.play_status || '').toLowerCase() === 'playing');
        }
        createRadarCoreScene(core3d, pillsLayer, initialList);
    }
}
