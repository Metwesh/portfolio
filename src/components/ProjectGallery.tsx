import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import type * as THREE from "three";
import {
  ClampToEdgeWrapping,
  type MeshBasicMaterial,
  Shape,
  ShapeGeometry,
} from "three";
import { projects } from "../constants/projects";
import { scrollStore } from "../stores/scrollStore";

// Apply object-fit:cover to a texture given the plane's aspect and the image's natural aspect.
function coverTexture(tex: THREE.Texture, planeW: number, planeH: number) {
  const img = tex.image as HTMLImageElement | ImageBitmap | null;
  if (!img) return;
  const imgW = "naturalWidth" in img ? img.naturalWidth : img.width;
  const imgH = "naturalHeight" in img ? img.naturalHeight : img.height;
  if (!imgW || !imgH) return;

  const planeAspect = planeW / planeH;
  const imgAspect = imgW / imgH;

  let repeatX: number;
  let repeatY: number;
  if (imgAspect > planeAspect) {
    // Image wider than plane — fit height, crop sides
    repeatY = 1;
    repeatX = planeAspect / imgAspect;
  } else {
    // Image taller than plane — fit width, crop top/bottom
    repeatX = 1;
    repeatY = imgAspect / planeAspect;
  }

  tex.repeat.set(repeatX, repeatY);
  tex.offset.set((1 - repeatX) / 2, (1 - repeatY) / 2);
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  tex.needsUpdate = true;
}

// Module-level exit progress (0 = fully visible, 1 = fully gone).
// Written by GalleryCards each frame, read by ProjectCard3D for scroll-locked opacity.
let _exitProgress = 0;

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_W = 8.2;
const CARD_H = 6.0;
const CARD_SPACING = 9;
const N = projects.length;

// How many world-units the gallery travels on Y before the section pins.
// Tune this so the gallery arrives in frame at the same moment the section
// hits top:top (i.e. when projectProgress first becomes > 0).
// Positive = below screen, gallery rises up as user scrolls toward the section.
const APPROACH_Y = 12; // world units above/below resting position

// Shared rounded-rect geometries — created once, reused by every card
function makeRoundedRect(w: number, h: number, r: number): ShapeGeometry {
  const hw = w / 2;
  const hh = h / 2;
  const shape = new Shape();
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(hw, hh - r);
  shape.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-hw + r, hh);
  shape.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw, -hh + r);
  shape.absarc(-hw + r, -hh + r, r, Math.PI, (3 * Math.PI) / 2, false);
  const geo = new ShapeGeometry(shape, 4);
  // ShapeGeometry UVs are in shape-space (e.g. -4.1 to 4.1) — remap to 0–1
  // so coverTexture's repeat/offset math works correctly.
  const uvs = geo.attributes.uv;
  for (let i = 0; i < uvs.count; i++) {
    uvs.setXY(i, (uvs.getX(i) + hw) / w, (uvs.getY(i) + hh) / h);
  }
  uvs.needsUpdate = true;
  return geo;
}
const CARD_GEO = makeRoundedRect(CARD_W, CARD_H, 0.38);
const BORDER_GEO = makeRoundedRect(CARD_W * 1.045, CARD_H * 1.045, 0.4);

// ─── Individual card ──────────────────────────────────────────────────────────
interface CardProps {
  index: number;
  texture: THREE.Texture;
  color: string;
  posX: number;
}

function ProjectCard3D({ index, texture, color, posX }: CardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const borderRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<MeshBasicMaterial>(null);
  const borderMatRef = useRef<MeshBasicMaterial>(null);

  useLayoutEffect(() => {
    coverTexture(texture, CARD_W, CARD_H);
  }, [texture]);

  useFrame(() => {
    if (
      !meshRef.current ||
      !matRef.current ||
      !borderRef.current ||
      !borderMatRef.current
    )
      return;

    const p = scrollStore.projectProgress;
    const exiting = !scrollStore.projectSectionActive && p > 0.01;
    const activeF = p * (N - 1);
    const dist = Math.abs(activeF - index);

    // Exit: opacity locked to scroll progress (mirrors entry), Y handled by group
    if (exiting) {
      const alpha = 1 - _exitProgress;
      matRef.current.opacity =
        alpha * (dist < 0.5 ? 1.0 : dist < 1.5 ? 0.65 : 0.25);
      borderMatRef.current.opacity = alpha * (dist < 0.5 ? 0.22 : 0.04);
      return;
    }

    // Scale: active → 1.0, adjacent → 0.88, far → 0.75
    const targetScale = dist < 0.5 ? 1.0 : dist < 1.5 ? 0.88 : 0.75;
    const curScale = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(curScale + (targetScale - curScale) * 0.1);
    borderRef.current.scale.setScalar(meshRef.current.scale.x * 1.045);

    // Opacity by distance only — no entry envelope
    const targetOpacity = dist < 0.5 ? 1.0 : dist < 1.5 ? 0.65 : 0.25;
    matRef.current.opacity += (targetOpacity - matRef.current.opacity) * 0.1;

    // Border glow
    const targetBorder = dist < 0.5 ? 0.22 : 0.04;
    borderMatRef.current.opacity +=
      (targetBorder - borderMatRef.current.opacity) * 0.1;

    // Subtle Y bob on active card
    const targetY = dist < 0.5 ? Math.sin(Date.now() * 0.001) * 0.08 : 0;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
    borderRef.current.position.y = meshRef.current.position.y;

    // Angle toward center
    const targetRotY = Math.max(
      -0.25,
      Math.min(0.25, (activeF - index) * 0.12),
    );
    meshRef.current.rotation.y +=
      (targetRotY - meshRef.current.rotation.y) * 0.08;
    borderRef.current.rotation.y = meshRef.current.rotation.y;
  });

  return (
    <>
      <mesh ref={meshRef} position={[posX, 0, 0]} geometry={CARD_GEO}>
        <meshBasicMaterial ref={matRef} map={texture} transparent opacity={0} />
      </mesh>
      <mesh ref={borderRef} position={[posX, 0, -0.05]} geometry={BORDER_GEO}>
        <meshBasicMaterial
          ref={borderMatRef}
          color={color}
          transparent
          opacity={0}
        />
      </mesh>
    </>
  );
}

// ─── Gallery group ────────────────────────────────────────────────────────────
function GalleryCards() {
  const imageUrls = projects.map((p) => p.image);
  const textures = useTexture(imageUrls);
  const groupRef = useRef<THREE.Group>(null);
  const exitBaseRef = useRef<number>(-1);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Responsive scale: fit card width within the visible frustum width at z=3.
    // Camera z=10, gallery z=3 → depth=7; FOV=60 → half-angle=30°; visibleWidth ≈ 8.083 * aspect
    const { width, height } = state.size;
    const aspect = width / height;
    const visibleWidthAtGallery = 8.083 * aspect;
    const responsiveScale = Math.min(
      1.0,
      (visibleWidthAtGallery * 1.2) / CARD_W,
    );

    const p = scrollStore.projectProgress;
    const active = scrollStore.projectSectionActive;

    let targetY: number;
    if (active) {
      exitBaseRef.current = -1;
      _exitProgress = 0;
      targetY = 0;
    } else if (p < 0.01) {
      // Approaching — gallery rises in sync with global scroll over ~5% of page
      _exitProgress = 0;
      const approach = Math.min(scrollStore.progress / 0.05, 1);
      targetY = APPROACH_Y * (1 - approach);
    } else {
      // Exiting — mirror of entry: move out over the same ~5% window
      if (exitBaseRef.current < 0) exitBaseRef.current = scrollStore.progress;
      const elapsed = (scrollStore.progress - exitBaseRef.current) / 0.05;
      _exitProgress = Math.min(Math.max(elapsed, 0), 1);
      targetY = -APPROACH_Y * _exitProgress;
    }

    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * 0.09;

    groupRef.current.scale.setScalar(responsiveScale);

    // Horizontal: active card stays centered on X=0; spacing scaled with group
    const activeF = p * (N - 1);
    const targetX = -activeF * CARD_SPACING * responsiveScale;
    groupRef.current.position.x +=
      (targetX - groupRef.current.position.x) * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, APPROACH_Y, 0]}>
      {projects.map((project, i) => (
        <ProjectCard3D
          key={project.name}
          index={i}
          texture={Array.isArray(textures) ? textures[i] : textures}
          color={project.color}
          posX={i * CARD_SPACING}
        />
      ))}
    </group>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
// z=3 keeps the gallery in front of the M logo (z=0) when camera is at z≈14
export function ProjectGallery() {
  return (
    <group position={[0, -1, 3]}>
      <GalleryCards />
    </group>
  );
}
