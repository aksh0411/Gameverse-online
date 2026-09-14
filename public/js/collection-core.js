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
function createGlowPointTexture(innerColor = '#ffffff', outerColor = '#c084fc', midStop = 0.3) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(midStop, outerColor);
    grad.addColorStop(0.7, 'rgba(122, 53, 168, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// High-res bloom texture for large flares
function createLargeFlareTexture(innerColor = '#ffffff', outerColor = '#e879f9') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.12, outerColor);
    grad.addColorStop(0.35, 'rgba(168, 85, 247, 0.25)');
    grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.08)');
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
    grad.addColorStop(0, 'rgba(192, 132, 252, 0.22)');
    grad.addColorStop(0.35, 'rgba(147, 51, 234, 0.12)');
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
    not_started: '#7d6ca8',
    playing: '#10b981',
    play_later: '#9c52cf',
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
        new THREE.MeshBasicMaterial({ color: '#c084fc', wireframe: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
    );
    coreGroup.add(coreMeshInner);

    // Central flare stack — balanced, elegant bloom
    const centerPointGeo = new THREE.BufferGeometry();
    centerPointGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));

    const outerBloom = new THREE.Points(centerPointGeo, new THREE.PointsMaterial({
        size: 2.2, map: createLargeFlareTexture('#ffffff', '#e879f9'), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    coreGroup.add(outerBloom);

    const centerFlare = new THREE.Points(centerPointGeo, new THREE.PointsMaterial({
        size: 1.3, map: createGlowPointTexture('#ffffff', '#e879f9', 0.25), transparent: true, opacity: 0.90, blending: THREE.AdditiveBlending, depthWrite: false
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
        size: 0.26, map: createGlowPointTexture('#ffffff', '#f472b6'), transparent: true, opacity: 0.90, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    tesseractGroup.add(vertexPoints);

    // ── ELEGANT COSMIC ORBITAL RINGS (Sleek & Thin) ──
    const ringsGroup = new THREE.Group();
    rootGroup.add(ringsGroup);

    const ringConfigs = [
        { rx: 2.10, ry: 1.25, tiltX: 0.40, tiltZ: 0.18, warp: 0.10, speed: 0.0016, color: '#38bdf8', opacity: 0.55, photonSize: 0.26 },
        { rx: 1.85, ry: 1.35, tiltX: -0.50, tiltZ: -0.20, warp: 0.08, speed: -0.0014, color: '#c084fc', opacity: 0.50, photonSize: 0.24 },
        { rx: 2.15, ry: 1.10, tiltX: 0.55, tiltZ: -0.35, warp: 0.10, speed: 0.0018, color: '#f472b6', opacity: 0.45, photonSize: 0.24 },
        { rx: 1.45, ry: 1.05, tiltX: 0.75, tiltZ: 0.15, warp: 0.06, speed: 0.0020, color: '#818cf8', opacity: 0.50, photonSize: 0.20 }
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
        size: 0.18, map: createGlowPointTexture('#ffffff', '#818cf8', 0.35), transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false
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
    const orbColors = ['#c084fc', '#f472b6', '#38bdf8', '#818cf8'];
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
    const observer = new IntersectionObserver((entries) => { isVisible = entries[0].isIntersecting; }, { threshold: 0.01 });
    observer.observe(container);

    window.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('mouseleave', () => {
        mouse.targetX = 0;
        mouse.targetY = 0;
    });

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;
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

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const w = container.clientWidth, h = container.clientHeight;
        if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
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
// 2. COLLECTION CORE — DIMENSIONAL NETWORK & 4D HYPERVISUAL ("little small")
// =========================================================================

// ── 5 Dimensional Orbital Ring Configurations (Enlarged slightly for optimal spatial balance) ──
const RADAR_RING_CONFIGS = [
    { ringIdx: 0, radius: 0.96, rx: 1.18, ry: 0.70, tiltX: 0.12, tiltZ: 0.05, warp: 0.04, color: '#c084fc', baseOpacity: 0.52 },
    { ringIdx: 1, radius: 1.40, rx: 1.66, ry: 0.98, tiltX: -0.16, tiltZ: -0.08, warp: 0.06, color: '#38bdf8', baseOpacity: 0.48 },
    { ringIdx: 2, radius: 1.85, rx: 2.15, ry: 1.28, tiltX: 0.22, tiltZ: 0.10, warp: 0.07, color: '#818cf8', baseOpacity: 0.44 },
    { ringIdx: 3, radius: 2.30, rx: 2.64, ry: 1.55, tiltX: -0.26, tiltZ: -0.14, warp: 0.08, color: '#c084fc', baseOpacity: 0.40 },
    { ringIdx: 4, radius: 2.75, rx: 3.10, ry: 1.82, tiltX: 0.30, tiltZ: 0.16, warp: 0.09, color: '#38bdf8', baseOpacity: 0.36 }
];

// Mulberry32 deterministic seeded PRNG for consistent organic distribution
function seededRandom(seed) {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

let _radarCoreState = {
    renderer: null,
    scene: null,
    camera: null,
    rootRadar: null,
    coreCenterGroup: null,
    ringGroup: null,
    ringMeshes: [],
    nodeItems: [],
    canvasContainer: null,
    pillsContainer: null,
    activeHoverGameId: null
};

let _allLoadedGames = [];
let _currentRadarFilter = 'bookmarked';

function rebuildRadarNodes(bookmarkedGames) {
    const { scene, rootRadar, pillsContainer } = _radarCoreState;
    if (!scene || !rootRadar || !pillsContainer) return;

    // Clean up old nodes & spokes
    pillsContainer.innerHTML = '';
    _radarCoreState.nodeItems.forEach(n => {
        if (n.bead) rootRadar.remove(n.bead);
        if (n.spokeLine) rootRadar.remove(n.spokeLine);
    });
    _radarCoreState.nodeItems = [];

    // 1. Empty State
    if (!bookmarkedGames || bookmarkedGames.length === 0) {
        const filterLabels = { bookmarked: 'bookmarked', favorited: 'liked', playing: 'currently playing' };
        const label = filterLabels[_currentRadarFilter] || 'matching';
        pillsContainer.innerHTML = `
            <div class="collection-core-empty-state">
                <span class="empty-icon">✨</span>
                <h3>No ${label} worlds</h3>
                <p>Tag games as ${label} to project them into this dimensional orbit.</p>
            </div>
        `;
        return;
    }

    // 2. Build 4D Nodes for Bookmarked Games across all orbital ring layers
    const nodeItems = [];
    const count = bookmarkedGames.length;
    const numRings = RADAR_RING_CONFIGS.length;

    // Partition games into 5 orbital ring tiers
    const ringBuckets = Array.from({ length: numRings }, () => []);
    bookmarkedGames.forEach((game, i) => {
        const ringIdx = i % numRings;
        ringBuckets[ringIdx].push({ game, originalIndex: i });
    });

    ringBuckets.forEach((bucket, r) => {
        const M = bucket.length;
        if (M === 0) return;
        const cfg = RADAR_RING_CONFIGS[r];

        // Golden-ratio phase progression (~137.5 deg)
        const ringPhaseOffset = r * 2.399963;

        bucket.forEach((item, j) => {
            const { game, originalIndex } = item;
            const gid = Number(game.id || game.game_id || (originalIndex + 1));
            const gameName = (game.name || game.game_name || 'Untitled').trim();
            const playStatus = (game.play_status || 'not_started').toLowerCase();
            const color = statusColorMap[playStatus] || '#c084fc';
            const theme = badgeThemeMap[playStatus] || 'theme-silver';

            // HTML Compact Glass Pill
            const pill = document.createElement('a');
            pill.href = `game.html?id=${gid}`;
            pill.className = `orbital-badge-pill ${theme}`;
            pill.dataset.gameId = gid;
            pill.innerHTML = `
                <span class="pill-status-dot"></span>
                <span>${gameName}</span>
            `;
            pillsContainer.appendChild(pill);

            // 3D Glowing Node Bead on Radar (crisp & compact)
            const beadGeo = new THREE.BufferGeometry();
            beadGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
            const beadMat = new THREE.PointsMaterial({
                size: 0.22,
                map: createGlowPointTexture('#ffffff', color, 0.35),
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const beadMesh = new THREE.Points(beadGeo, beadMat);
            rootRadar.add(beadMesh);

            // Individual Dynamic Spoke Line from Core to Node (thin, clean)
            const spokeGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 0)
            ]);
            const spokeMat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.12,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const spokeLine = new THREE.Line(spokeGeo, spokeMat);
            rootRadar.add(spokeLine);

            // Omnidirectional organic distribution
            const baseAngle = ringPhaseOffset + (j / M) * (Math.PI * 2);
            const seed = (gid * 2654435761) ^ (r * 193) ^ (j * 71);
            const angleJitter = (seededRandom(seed + 1) - 0.5) * ((Math.PI * 2 / M) * 0.35);
            const finalAngle = (baseAngle + angleJitter + Math.PI * 2) % (Math.PI * 2);

            const radialVariance = 0.95 + seededRandom(seed + 2) * 0.10;

            const px = Math.cos(finalAngle) * (cfg.rx * radialVariance);
            const py = Math.sin(finalAngle) * (cfg.ry * radialVariance);
            const pz = Math.sin(finalAngle * 2 + seededRandom(seed + 3) * 3) * cfg.warp;

            const cosX = Math.cos(cfg.tiltX), sinX = Math.sin(cfg.tiltX);
            const cosZ = Math.cos(cfg.tiltZ), sinZ = Math.sin(cfg.tiltZ);
            const py1 = py * cosX - pz * sinX;
            const pz1 = py * sinX + pz * cosX;

            const ringX = px * cosZ - py1 * sinZ;
            const ringY = px * sinZ + py1 * cosZ;
            const ringZ = pz1 + (seededRandom(seed + 4) - 0.5) * 0.12;

            const initial4D = [
                ringX,
                ringY,
                ringZ,
                Math.sin(finalAngle * 1.5 + seededRandom(seed + 5) * 4) * 0.24
            ];

            const nodeObj = {
                id: gid,
                name: gameName,
                element: pill,
                bead: beadMesh,
                spokeLine,
                initial4D,
                baseAngle: finalAngle,
                radius: cfg.radius * radialVariance,
                ringIdx: r,
                color,
                phase: (originalIndex / count) * Math.PI * 2,
                isHovered: false,
                vec3: new THREE.Vector3(ringX, ringY, ringZ),
                screenPos: { x: 0, y: 0, targetX: 0, targetY: 0, alignX: '0%' }
            };

            pill.addEventListener('mouseenter', () => {
                nodeObj.isHovered = true;
                _radarCoreState.activeHoverGameId = gid;
            });
            pill.addEventListener('mouseleave', () => {
                nodeObj.isHovered = false;
                _radarCoreState.activeHoverGameId = null;
            });

            nodeItems.push(nodeObj);
        });
    });

    _radarCoreState.nodeItems = nodeItems;
}

function createRadarCoreScene(canvasContainer, pillsContainer, games) {
    if (!window.THREE || !canvasContainer || !pillsContainer) return;
    if (canvasContainer.dataset.initialized) {
        if (typeof window.updateCollectionCore === 'function') {
            window.updateCollectionCore(games);
        }
        return;
    }
    canvasContainer.dataset.initialized = 'true';

    const width = canvasContainer.clientWidth || 380;
    const height = canvasContainer.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(renderer.domElement);

    // Root group positioned to the right of header & sidebar panel on desktop
    let baseRadarX = width > 900 ? (width > 1300 ? 1.20 : 0.90) : 0;
    const rootRadar = new THREE.Group();
    rootRadar.position.set(baseRadarX, 0, 0);
    scene.add(rootRadar);

    // Save global reference for reactive updates
    _radarCoreState.renderer = renderer;
    _radarCoreState.scene = scene;
    _radarCoreState.camera = camera;
    _radarCoreState.rootRadar = rootRadar;
    _radarCoreState.canvasContainer = canvasContainer;
    _radarCoreState.pillsContainer = pillsContainer;

    window.addEventListener('gameNodeHover', (e) => {
        _radarCoreState.activeHoverGameId = e.detail?.gameId || null;
    });

    // ── Restrained Atmospheric Halo (Soft background) ──
    const haloGeo = new THREE.PlaneGeometry(6.4, 6.4);
    const haloMat = new THREE.MeshBasicMaterial({
        map: createAmbientHaloTexture(),
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.z = -0.4;
    rootRadar.add(haloMesh);

    // ── 5 Sleek & Thin Dimensional Orbital Rings (circles not too thick) ──
    const ringGroup = new THREE.Group();
    rootRadar.add(ringGroup);
    _radarCoreState.ringGroup = ringGroup;

    const ringConfigs = RADAR_RING_CONFIGS;

    const ringMeshes = ringConfigs.map((cfg) => {
        const ring = createOrbitalRing(cfg.rx, cfg.ry, cfg.tiltX, cfg.tiltZ, cfg.warp, cfg.color, cfg.baseOpacity, 120);
        ringGroup.add(ring);
        return { mesh: ring, config: cfg, targetOpacity: cfg.baseOpacity };
    });
    _radarCoreState.ringMeshes = ringMeshes;

    // Traveling photon pulses on orbital rings (small, crisp points)
    const ringPhotons = ringConfigs.slice(1).map((cfg, idx) => {
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
        const pMesh = new THREE.Points(pGeo, new THREE.PointsMaterial({
            size: 0.22,
            map: createGlowPointTexture('#ffffff', cfg.color, 0.35),
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        }));
        ringGroup.add(pMesh);
        return { mesh: pMesh, config: cfg, speed: 0.10 + idx * 0.03, phase: idx * 1.8 };
    });

    // ── Visual Anchor: 4D Central Core (Compact: "little small") ──
    const coreCenterGroup = new THREE.Group();
    rootRadar.add(coreCenterGroup);
    _radarCoreState.coreCenterGroup = coreCenterGroup;

    // 4D Tesseract Matrix (Scale: 0.44 — balanced anchor)
    const tesseractScale = 0.44;
    const tesseractPositions = new Float32Array(tesseractEdges.length * 6);
    const tesseractColors = new Float32Array(tesseractEdges.length * 6);
    const tesseractGeo = new THREE.BufferGeometry();
    tesseractGeo.setAttribute('position', new THREE.BufferAttribute(tesseractPositions, 3));
    tesseractGeo.setAttribute('color', new THREE.BufferAttribute(tesseractColors, 3));

    const tesseractMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const tesseractLines = new THREE.LineSegments(tesseractGeo, tesseractMat);
    coreCenterGroup.add(tesseractLines);

    // 16 Luminous 4D Vertex Beads
    const vertexPositions = new Float32Array(16 * 3);
    const vertexGeo = new THREE.BufferGeometry();
    vertexGeo.setAttribute('position', new THREE.BufferAttribute(vertexPositions, 3));
    const vertexPoints = new THREE.Points(vertexGeo, new THREE.PointsMaterial({
        size: 0.19,
        map: createGlowPointTexture('#ffffff', '#38bdf8', 0.35),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }));
    coreCenterGroup.add(vertexPoints);

    // Central Luminous Octahedron Nucleus (balanced)
    const nucleus = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.17, 0),
        new THREE.MeshBasicMaterial({
            color: '#38bdf8',
            wireframe: true,
            transparent: true,
            opacity: 0.70,
            blending: THREE.AdditiveBlending
        })
    );
    coreCenterGroup.add(nucleus);

    // Subtle Core Flare
    const coreBloomGeo = new THREE.BufferGeometry();
    coreBloomGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
    const coreBloom = new THREE.Points(coreBloomGeo, new THREE.PointsMaterial({
        size: 1.55,
        map: createGlowPointTexture('#ffffff', '#38bdf8', 0.35),
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }));
    coreCenterGroup.add(coreBloom);

    // Ambient floating dust particles
    const radarDustCount = 35;
    const radarDustGeo = new THREE.BufferGeometry();
    const radarDustPos = new Float32Array(radarDustCount * 3);
    for (let i = 0; i < radarDustCount; i++) {
        radarDustPos[i * 3] = (Math.random() - 0.5) * 5.0;
        radarDustPos[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
        radarDustPos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    radarDustGeo.setAttribute('position', new THREE.BufferAttribute(radarDustPos, 3));
    const radarDustPoints = new THREE.Points(radarDustGeo, new THREE.PointsMaterial({
        size: 0.10,
        map: createGlowPointTexture('#ffffff', '#c084fc', 0.35),
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }));
    rootRadar.add(radarDustPoints);

    // Build initial game nodes
    const bookmarkedInitial = (games || []).filter(g => g.is_bookmarked || g.bookmarked);
    rebuildRadarNodes(bookmarkedInitial);

    // ── Interaction & Calmed Animation Loop ──
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const angles = { xw: 0.20, yw: 0.30, zw: 0.10 };
    const scratch1 = [0, 0, 0, 0];
    const v3 = new THREE.Vector3();
    const projected = [];
    const vertexW = [];
    for (let i = 0; i < 16; i++) {
        projected.push(new THREE.Vector3());
        vertexW.push(0);
    }

    const projVector = new THREE.Vector3();
    const coreProj = new THREE.Vector3();

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
    }, { threshold: 0.01 });
    observer.observe(canvasContainer);

    window.addEventListener('mousemove', (e) => {
        const rect = canvasContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const nx = (e.clientX - centerX) / (rect.width * 0.5);
        const ny = -(e.clientY - centerY) / (rect.height * 0.5);
        mouse.targetX = Math.max(-1.2, Math.min(1.2, nx));
        mouse.targetY = Math.max(-1.2, Math.min(1.2, ny));
    });

    window.addEventListener('mouseleave', () => {
        mouse.targetX = 0;
        mouse.targetY = 0;
    });

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;
        time += 0.016;

        const containerW = canvasContainer.clientWidth || 380;
        const containerH = canvasContainer.clientHeight || 500;

        // Smooth subtle mouse interpolation (gentle damping)
        mouse.x += (mouse.targetX - mouse.x) * 0.045;
        mouse.y += (mouse.targetY - mouse.y) * 0.045;

        // Controlled subtle parallax translation (no wild swings)
        const targetRadarX = baseRadarX + mouse.x * 0.06;
        const targetRadarY = mouse.y * 0.05;
        rootRadar.position.x += (targetRadarX - rootRadar.position.x) * 0.05;
        rootRadar.position.y += (targetRadarY - rootRadar.position.y) * 0.05;
        rootRadar.position.z = 0;

        // Controlled subtle 3D tilt
        const targetRadarRotY = mouse.x * 0.08;
        const targetRadarRotX = -mouse.y * 0.06;
        rootRadar.rotation.y += (targetRadarRotY - rootRadar.rotation.y) * 0.05;
        rootRadar.rotation.x += (targetRadarRotX - rootRadar.rotation.x) * 0.05;
        rootRadar.rotation.z = 0;

        // Force update world matrix for correct label projection
        rootRadar.updateMatrixWorld(true);

        // Subtle dimensional sway on rings (calm, steady)
        const swayPeriod = time * (Math.PI * 2 / 16.0);
        ringGroup.position.x = Math.sin(swayPeriod) * 0.03;
        ringGroup.position.y = Math.cos(swayPeriod * 0.7) * 0.02;
        ringGroup.rotation.z += 0.0002;

        // Core calm rotation and breathing
        const corePulse = 1.0 + Math.sin(time * 0.8) * 0.025;
        coreCenterGroup.scale.setScalar(corePulse);
        nucleus.rotation.x = time * 0.06;
        nucleus.rotation.y = time * 0.09;
        coreBloom.material.opacity = 0.55 + Math.sin(time * 0.8) * 0.12;

        // Calm 4D W-Axis rotation
        angles.xw += 0.0006;
        angles.yw += 0.0005;
        angles.zw += 0.0003;

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

        // Traveling Light Photons at calm, steady speeds
        ringPhotons.forEach(rp => {
            const pAng = (time * rp.speed + rp.phase) % (Math.PI * 2);
            const cfg = rp.config;
            const px = Math.cos(pAng) * cfg.rx;
            const py = Math.sin(pAng) * cfg.ry;
            const pz = Math.sin(pAng * 2) * cfg.warp;
            const cosX = Math.cos(cfg.tiltX), sinX = Math.sin(cfg.tiltX);
            const cosZ = Math.cos(cfg.tiltZ), sinZ = Math.sin(cfg.tiltZ);
            const py1 = py * cosX - pz * sinX;
            const pz1 = py * sinX + pz * cosX;
            rp.mesh.position.set(px * cosZ - py1 * sinZ, px * sinZ + py1 * cosZ, pz1);
        });

        // 4. Bookmarked Nodes: Projection & Positioning
        const { nodeItems, activeHoverGameId } = _radarCoreState;
        const hasAnyHover = (activeHoverGameId !== null);

        coreProj.set(0, 0, 0).applyMatrix4(rootRadar.matrixWorld).project(camera);
        const coreScreenX = (coreProj.x * 0.5 + 0.5) * containerW;

        let activeRingIdx = -1;
        if (hasAnyHover) {
            const activeNode = nodeItems.find(n => n.id === activeHoverGameId);
            if (activeNode) activeRingIdx = activeNode.ringIdx;
        }

        ringMeshes.forEach((rm, rIdx) => {
            const isRingHighlighted = (rIdx === activeRingIdx);
            const targetOp = isRingHighlighted ? 0.90 : (hasAnyHover ? (rm.config.baseOpacity * 0.35) : rm.config.baseOpacity);
            rm.mesh.material.opacity += (targetOp - rm.mesh.material.opacity) * 0.12;
        });

        const activeLabelsToRelax = [];

        nodeItems.forEach((node, i) => {
            const isHovered = (node.id === activeHoverGameId);

            rotate4DInto(node.initial4D, angles, time, scratch1);
            const breathe = isHovered ? 1.0 : (1.0 + Math.sin(time * 0.6 + node.phase) * 0.015);
            scratch1[0] *= breathe;
            scratch1[1] *= breathe;

            project4Dto3DInto(scratch1, 3.6, v3);
            node.vec3.copy(v3);
            node.bead.position.copy(node.vec3);

            const spokePos = node.spokeLine.geometry.attributes.position.array;
            spokePos[0] = 0; spokePos[1] = 0; spokePos[2] = 0;
            spokePos[3] = node.vec3.x; spokePos[4] = node.vec3.y; spokePos[5] = node.vec3.z;
            node.spokeLine.geometry.attributes.position.needsUpdate = true;

            const targetSpokeOp = isHovered ? 0.75 : (hasAnyHover ? 0.03 : 0.12);
            node.spokeLine.material.opacity += (targetSpokeOp - node.spokeLine.material.opacity) * 0.12;

            const depthNorm = Math.min(Math.max((node.vec3.z + 0.4) / 0.8, 0), 1);
            const depthScale = 0.90 + depthNorm * 0.12;
            const depthOpacity = 0.65 + depthNorm * 0.30;
            const depthBeadSize = 0.20 + depthNorm * 0.08;

            const beadTargetSize = isHovered ? (depthBeadSize * 1.5) : depthBeadSize;
            const beadTargetOpacity = isHovered ? 1.0 : (hasAnyHover ? 0.25 : depthOpacity);
            node.bead.material.size += (beadTargetSize - node.bead.material.size) * 0.15;
            node.bead.material.opacity += (beadTargetOpacity - node.bead.material.opacity) * 0.15;

            projVector.copy(node.vec3);
            projVector.applyMatrix4(rootRadar.matrixWorld);
            projVector.project(camera);

            const screenX = (projVector.x * 0.5 + 0.5) * containerW;
            const screenY = (-projVector.y * 0.5 + 0.5) * containerH;

            const isRightOfCore = screenX >= coreScreenX;
            const pillW = node.element.offsetWidth || 110;
            const pillH = node.element.offsetHeight || 24;

            let targetX = isRightOfCore ? (screenX + 8) : (screenX - 8);
            let targetY = screenY;
            let alignX = isRightOfCore ? '0%' : '-100%';

            // Boundary Protection
            if (isRightOfCore) {
                targetX = Math.min(containerW - 10 - pillW, Math.max(10, targetX));
            } else {
                targetX = Math.max(10 + pillW, Math.min(containerW - 10, targetX));
            }
            targetY = Math.max(12 + pillH / 2, Math.min(containerH - 12 - pillH / 2, targetY));

            node.screenPos = {
                x: targetX,
                y: targetY,
                alignX,
                depthScale,
                depthNorm,
                isHovered,
                pillW,
                pillH
            };
            activeLabelsToRelax.push(node);
        });

        // Anti-collision relaxation
        for (let pass = 0; pass < 3; pass++) {
            activeLabelsToRelax.sort((a, b) => a.screenPos.y - b.screenPos.y);
            for (let i = 0; i < activeLabelsToRelax.length - 1; i++) {
                const cur = activeLabelsToRelax[i];
                const next = activeLabelsToRelax[i + 1];
                const vDist = next.screenPos.y - cur.screenPos.y;
                const minVGap = 26;
                if (vDist < minVGap) {
                    const curLeft = cur.screenPos.alignX === '0%' ? cur.screenPos.x : (cur.screenPos.x - cur.screenPos.pillW);
                    const curRight = curLeft + cur.screenPos.pillW;
                    const nextLeft = next.screenPos.alignX === '0%' ? next.screenPos.x : (next.screenPos.x - next.screenPos.pillW);
                    const nextRight = nextLeft + next.screenPos.pillW;

                    if (curRight > nextLeft && curLeft < nextRight) {
                        const shift = (minVGap - vDist) * 0.50;
                        cur.screenPos.y = Math.max(12, cur.screenPos.y - shift);
                        next.screenPos.y = Math.min(containerH - 12, next.screenPos.y + shift);
                    }
                }
            }
        }

        activeLabelsToRelax.forEach(node => {
            const sp = node.screenPos;
            const activeScale = sp.isHovered ? (sp.depthScale * 1.06) : sp.depthScale;
            node.element.style.transform = `translate3d(${sp.x.toFixed(1)}px, ${sp.y.toFixed(1)}px, 0) translate(${sp.alignX}, -50%) scale(${activeScale.toFixed(3)})`;
            node.element.style.zIndex = sp.isHovered ? 100 : Math.round(10 + sp.depthNorm * 20);
            node.element.classList.toggle('active-highlight', sp.isHovered);
            node.element.classList.toggle('dimmed', hasAnyHover && !sp.isHovered);
        });

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const w = canvasContainer.clientWidth, h = canvasContainer.clientHeight;
        if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            baseRadarX = w > 900 ? (w > 1300 ? 1.20 : 0.90) : 0;
            rootRadar.position.x = baseRadarX;
        }
    });
}

// =========================================================================
// 3. MASTER INITIALIZER & REACTIVE UPDATE API
// =========================================================================

// Dynamic Radar Counts & Filter Handler
function updateRadarCounts(games) {
    const list = Array.isArray(games) ? games : [];
    const countBookmarked = list.filter(g => g.is_bookmarked || g.bookmarked).length;
    const countFavorited = list.filter(g => g.is_favorited || g.favorited).length;
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
    const list = _allLoadedGames || [];

    let filtered = [];
    if (filterName === 'favorited') {
        filtered = list.filter(g => g.is_favorited || g.favorited);
    } else if (filterName === 'playing') {
        filtered = list.filter(g => (g.play_status || '').toLowerCase() === 'playing');
    } else {
        filtered = list.filter(g => g.is_bookmarked || g.bookmarked);
    }

    // Smooth transition: fade out pills → rebuild → fade in
    const pillsLayer = _radarCoreState.pillsContainer;
    if (pillsLayer) {
        pillsLayer.style.transition = 'opacity 0.25s ease';
        pillsLayer.style.opacity = '0';
        setTimeout(() => {
            rebuildRadarNodes(filtered);
            pillsLayer.style.opacity = '1';
        }, 250);
    } else {
        rebuildRadarNodes(filtered);
    }

    // Update active button state
    document.querySelectorAll('.core-filter-card').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filterName);
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

// Reactive update when bookmarks or status change
window.updateCollectionCore = function (allGames) {
    const list = Array.isArray(allGames) ? allGames : (allGames?.games || []);
    _allLoadedGames = list;
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
    const rawList = Array.isArray(gamesData) ? gamesData : (gamesData?.games || []);
    _allLoadedGames = rawList;

    updateRadarCounts(rawList);
    initRadarFilterButtons();

    // A. Hero 4D Canvas
    if (typeof window.initHeroScene === 'function') {
        window.initHeroScene();
    }

    // B. Collection Core Radar Network with Bookmarked Games
    const core3d = document.getElementById('core3d');
    const pillsLayer = document.getElementById('corePillsLayer');
    if (core3d && pillsLayer) {
        let initialList = rawList.filter(g => g.is_bookmarked || g.bookmarked);
        if (_currentRadarFilter === 'favorited') {
            initialList = rawList.filter(g => g.is_favorited || g.favorited);
        } else if (_currentRadarFilter === 'playing') {
            initialList = rawList.filter(g => (g.play_status || '').toLowerCase() === 'playing');
        }
        createRadarCoreScene(core3d, pillsLayer, initialList);
    }
}
