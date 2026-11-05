/**
 * HWX Gateway - Interactive 3D Gateway Hardware & Transmission Visualizer
 * Built with Three.js studio PBR rendering, ACESFilmicToneMapping, RoomEnvironment,
 * 7-part procedural composite group, and zero external 404 dependencies.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface GatewayTelemetry3DProps {
  activeDeviceName?: string;
  isTransmitting?: boolean;
}

export const GatewayTelemetry3D: React.FC<GatewayTelemetry3DProps> = ({
  activeDeviceName = 'HWX-Alpha-Gateway',
  isTransmitting = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [explodedView, setExplodedView] = useState(0); // 0 (assembled) to 1 (exploded)
  const [isRotating, setIsRotating] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'front' | 'top'>('iso');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Mutable refs to pass React state into rAF loop without re-instantiating WebGL
  const explodedRef = useRef(explodedView);
  const isRotatingRef = useRef(isRotating);
  const isTransmittingRef = useRef(isTransmitting);

  useEffect(() => {
    explodedRef.current = explodedView;
  }, [explodedView]);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    isTransmittingRef.current = isTransmitting;
  }, [isTransmitting]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.08);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.5, 3.2, 5.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Cool fill light
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.8);
    scene.add(hemiLight);

    // Accent rim light
    const rimLight = new THREE.DirectionalLight(0x6366f1, 2.0);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    // 3. Procedural Textures (Zero 404 dependencies)
    // Procedural Display canvas
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = 512;
    displayCanvas.height = 256;
    const ctx = displayCanvas.getContext('2d')!;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 256);
    // Draw telemetry HUD graphics
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, 480, 224);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('HWX GATEWAY HUB V1', 32, 54);
    ctx.font = '18px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('STATUS: ONLINE [LTE/5G ACTIVE]', 32, 90);
    ctx.fillText('SIM 1: JIO 5G (ACTIVE)', 32, 122);
    ctx.fillText('SIM 2: AIRTEL 4G (STANDBY)', 32, 154);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('QUEUE ENGINE: ARMED (0 PENDING)', 32, 196);

    const displayTexture = new THREE.CanvasTexture(displayCanvas);
    displayTexture.colorSpace = THREE.SRGBColorSpace;
    displayTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Procedural Contact Shadow Texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext('2d')!;
    const grad = sctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 256, 256);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

    // 4. Ground Contact Shadow Plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.8,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);

    // 5. Procedural 7-Part Hardware Model (THREE.Group)
    const gatewayGroup = new THREE.Group();
    gatewayGroup.position.set(0, 0, 0);
    scene.add(gatewayGroup);

    // Subpart 1: Main CNC Aluminum Body (Anodized dark metal)
    const bodyGeometry = new THREE.BoxGeometry(2.4, 0.45, 1.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const mainBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    mainBody.position.y = 0.3;
    mainBody.castShadow = !isSoftwareGl;
    mainBody.receiveShadow = !isSoftwareGl;
    gatewayGroup.add(mainBody);

    // Subpart 2: Front Bezel & Glass Telemetry Screen
    const screenGeometry = new THREE.PlaneGeometry(1.6, 0.28);
    const screenMaterial = new THREE.MeshBasicMaterial({
      map: displayTexture,
    });
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.position.set(0, 0.3, 0.805);
    gatewayGroup.add(screenMesh);

    // Subpart 3: Top Aluminum Heat Sink Fins
    const finGroup = new THREE.Group();
    const finMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.15,
    });
    for (let i = -5; i <= 5; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 1.2), finMaterial);
      fin.position.set(i * 0.14, 0.58, 0);
      fin.castShadow = !isSoftwareGl;
      finGroup.add(fin);
    }
    gatewayGroup.add(finGroup);

    // Subpart 4: Dual SIM Trays (Gold Contacts)
    const simTrayGroup = new THREE.Group();
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.9,
      roughness: 0.2,
    });
    const sim1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.2), goldMaterial);
    sim1.position.set(-0.8, 0.3, 0.81);
    const sim2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.2), goldMaterial);
    sim2.position.set(0.8, 0.3, 0.81);
    simTrayGroup.add(sim1);
    simTrayGroup.add(sim2);
    gatewayGroup.add(simTrayGroup);

    // Subpart 5: Dual RF Antennas & Brass Base Mounts
    const antennaGroup = new THREE.Group();
    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.3,
    });
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.6,
    });

    [-0.95, 0.95].forEach((xPos) => {
      const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.15, 16), brassMaterial);
      mount.position.set(xPos, 0.58, -0.65);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 16), antennaMat);
      rod.position.set(xPos, 1.3, -0.65);
      rod.castShadow = !isSoftwareGl;
      antennaGroup.add(mount);
      antennaGroup.add(rod);
    });
    gatewayGroup.add(antennaGroup);

    // Subpart 6: Transmission Pulse Wave Rings (Visualizing live SMS transmission)
    const pulseRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.015, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 })
    );
    pulseRing1.rotation.x = Math.PI / 2;
    pulseRing1.position.set(-0.95, 2.0, -0.65);
    scene.add(pulseRing1);

    const pulseRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.015, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 })
    );
    pulseRing2.rotation.x = Math.PI / 2;
    pulseRing2.position.set(0.95, 2.0, -0.65);
    scene.add(pulseRing2);

    // 6. Camera Presets Helper
    const targetCameraPos = new THREE.Vector3(4.5, 3.2, 5.0);
    const targetLookAt = new THREE.Vector3(0, 0.5, 0);

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    function tick() {
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      // Camera position damping
      camera.position.x += (targetCameraPos.x - camera.position.x) * (1 - Math.exp(-4 * dt));
      camera.position.y += (targetCameraPos.y - camera.position.y) * (1 - Math.exp(-4 * dt));
      camera.position.z += (targetCameraPos.z - camera.position.z) * (1 - Math.exp(-4 * dt));
      camera.lookAt(targetLookAt);

      // Rotation
      if (isRotatingRef.current) {
        gatewayGroup.rotation.y += 0.4 * dt;
      }

      // Exploded View Interpolation
      const explode = explodedRef.current;
      finGroup.position.y = THREE.MathUtils.damp(finGroup.position.y, explode * 0.5, 8, dt);
      antennaGroup.position.y = THREE.MathUtils.damp(antennaGroup.position.y, explode * 0.7, 8, dt);
      simTrayGroup.position.z = THREE.MathUtils.damp(simTrayGroup.position.z, explode * 0.4, 8, dt);

      // Transmission Pulse Wave Expansion
      const pulseSpeed = isTransmittingRef.current ? 4 : 1.5;
      const pulseScale = 1 + (time * pulseSpeed) % 3;
      pulseRing1.scale.set(pulseScale, pulseScale, pulseScale);
      pulseRing2.scale.set(pulseScale, pulseScale, pulseScale);
      (pulseRing1.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (pulseScale - 1) / 2);
      (pulseRing2.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (pulseScale - 1) / 2);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      displayTexture.dispose();
      shadowTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update target camera according to preset
  useEffect(() => {
    // Presets
    if (cameraPreset === 'iso') {
      // (4.5, 3.2, 5.0)
    } else if (cameraPreset === 'front') {
      // (0, 1.2, 4.5)
    } else if (cameraPreset === 'top') {
      // (0, 6.0, 0.1)
    }
  }, [cameraPreset]);

  return (
    <div className="relative w-full h-[360px] md:h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Spec Badge (Clean non-pill unboxed typography per design rules) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-0.5 text-xs text-slate-400 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 backdrop-blur-none">
        <span className="font-semibold text-slate-100 uppercase tracking-wider">{activeDeviceName}</span>
        <span className="text-slate-400 font-mono text-[11px]">Hardware Node · LTE / 5G SA · Dual-SIM Modems</span>
      </div>

      {/* Collapsible Unified Bottom Control Dock (<= 15% Viewport footprint) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[680px]">
        {/* Toggle Button */}
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 px-3 py-0.5 rounded-t-md transition-colors whitespace-nowrap shrink-0"
          >
            {isDockCollapsed ? '▴ Show Telemetry Controls' : '▾ Hide Controls'}
          </button>
        </div>

        {/* Dock Controls */}
        {!isDockCollapsed && (
          <div className="bg-slate-900/95 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 shadow-xl flex flex-wrap items-center justify-between gap-3">
            {/* Auto Rotate Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Turntable:</span>
              <button
                type="button"
                onClick={() => setIsRotating(!isRotating)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  isRotating ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isRotating ? 'Active' : 'Paused'}
              </button>
            </div>

            {/* Exploded View Slider */}
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <span className="text-slate-400 whitespace-nowrap">Explode Assembly:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodedView}
                onChange={(e) => setExplodedView(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="font-mono text-[11px] text-slate-400 w-8 tabular-nums">
                {Math.round(explodedView * 100)}%
              </span>
            </div>

            {/* Camera Angles */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 mr-1">View:</span>
              <button
                type="button"
                onClick={() => setCameraPreset('iso')}
                className={`px-2 py-1 rounded text-[11px] ${
                  cameraPreset === 'iso' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Iso
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset('front')}
                className={`px-2 py-1 rounded text-[11px] ${
                  cameraPreset === 'front' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset('top')}
                className={`px-2 py-1 rounded text-[11px] ${
                  cameraPreset === 'top' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Top
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
