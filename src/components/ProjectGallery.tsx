import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCallback, useLayoutEffect, useRef } from "react";
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
    repeatY = 1;
    repeatX = planeAspect / imgAspect;
  } else {
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
let _exitProgress = 0;

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_W = 8.2;
const CARD_H = 6.0;
const CARD_SPACING = 9;
const N = projects.length;
const APPROACH_Y = 12;

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
  const uvs = geo.attributes.uv;
  for (let i = 0; i < uvs.count; i++) {
    uvs.setXY(i, (uvs.getX(i) + hw) / w, (uvs.getY(i) + hh) / h);
  }
  uvs.needsUpdate = true;
  return geo;
}
const CARD_GEO = makeRoundedRect(CARD_W, CARD_H, 0.38);
const BORDER_GEO = makeRoundedRect(CARD_W * 1.045, CARD_H * 1.045, 0.4);

// ─── Card ref bundle — GalleryCards drives all animation ─────────────────────
interface CardHandles {
  mesh: React.RefObject<THREE.Mesh | null>;
  border: React.RefObject<THREE.Mesh | null>;
  mat: React.RefObject<MeshBasicMaterial | null>;
  borderMat: React.RefObject<MeshBasicMaterial | null>;
}

// ─── Individual card — render only, no useFrame ───────────────────────────────
interface CardProps {
  index: number;
  texture: THREE.Texture;
  color: string;
  posX: number;
  onMount: (index: number, handles: CardHandles) => void;
}

function ProjectCard3D({ index, texture, color, posX, onMount }: CardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const borderRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<MeshBasicMaterial>(null);
  const borderMatRef = useRef<MeshBasicMaterial>(null);

  useLayoutEffect(() => {
    coverTexture(texture, CARD_W, CARD_H);
    onMount(index, {
      mesh: meshRef,
      border: borderRef,
      mat: matRef,
      borderMat: borderMatRef,
    });
  }, [texture, index, onMount]);

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

// ─── Gallery group — single useFrame drives all card + group animation ────────
function GalleryCards() {
  const imageUrls = projects.map((p) => p.image);
  const textures = useTexture(imageUrls);
  const groupRef = useRef<THREE.Group>(null);
  const exitBaseRef = useRef<number>(-1);

  // All card refs collected here — avoids N separate useFrame subscriptions
  const cardHandlesRef = useRef<Array<CardHandles | null>>(Array(N).fill(null));
  const registerCard = useCallback((index: number, handles: CardHandles) => {
    cardHandlesRef.current[index] = handles;
  }, []);

  // Cache responsive scale — recompute only on viewport change, not every frame
  const responsiveScaleRef = useRef(1.0);
  const lastSizeRef = useRef({ width: 0, height: 0 });

  useFrame((state) => {
    if (!groupRef.current) return;

    // Only recompute when viewport actually changes
    const { width, height } = state.size;
    if (
      width !== lastSizeRef.current.width ||
      height !== lastSizeRef.current.height
    ) {
      lastSizeRef.current = { width, height };
      const visibleWidthAtGallery = 8.083 * (width / height);
      responsiveScaleRef.current = Math.min(
        1.0,
        (visibleWidthAtGallery * 1.2) / CARD_W,
      );
    }
    const responsiveScale = responsiveScaleRef.current;

    const p = scrollStore.projectProgress;
    const active = scrollStore.projectSectionActive;
    const t = state.clock.elapsedTime;

    let targetY: number;
    if (active) {
      exitBaseRef.current = -1;
      _exitProgress = 0;
      targetY = 0;
    } else if (p < 0.01) {
      _exitProgress = 0;
      const approach = Math.min(scrollStore.progress / 0.05, 1);
      targetY = APPROACH_Y * (1 - approach);
    } else {
      if (exitBaseRef.current < 0) exitBaseRef.current = scrollStore.progress;
      const elapsed = (scrollStore.progress - exitBaseRef.current) / 0.05;
      _exitProgress = Math.min(Math.max(elapsed, 0), 1);
      targetY = -APPROACH_Y * _exitProgress;
    }

    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * 0.09;
    groupRef.current.scale.setScalar(responsiveScale);

    const activeF = p * (N - 1);
    const targetX = -activeF * CARD_SPACING * responsiveScale;
    groupRef.current.position.x +=
      (targetX - groupRef.current.position.x) * 0.1;

    // Single loop drives all cards — replaces N separate useFrame subscriptions
    const exiting = !active && p > 0.01;
    for (let i = 0; i < N; i++) {
      const handles = cardHandlesRef.current[i];
      if (!handles) continue;
      const { mesh, border, mat, borderMat } = handles;
      if (
        !mesh.current ||
        !mat.current ||
        !border.current ||
        !borderMat.current
      )
        continue;

      const dist = Math.abs(activeF - i);

      if (exiting) {
        const alpha = 1 - _exitProgress;
        mat.current.opacity =
          alpha * (dist < 0.5 ? 1.0 : dist < 1.5 ? 0.65 : 0.25);
        borderMat.current.opacity = alpha * (dist < 0.5 ? 0.22 : 0.04);
        continue;
      }

      // Cards beyond neighbours are already at rest — cheap lerp, skip scale/rot
      if (dist > 2.5) {
        mat.current.opacity += (0.25 - mat.current.opacity) * 0.1;
        borderMat.current.opacity += (0.04 - borderMat.current.opacity) * 0.1;
        continue;
      }

      const targetScale = dist < 0.5 ? 1.0 : dist < 1.5 ? 0.88 : 0.75;
      const curScale = mesh.current.scale.x;
      mesh.current.scale.setScalar(curScale + (targetScale - curScale) * 0.1);
      border.current.scale.setScalar(mesh.current.scale.x * 1.045);

      const targetOpacity = dist < 0.5 ? 1.0 : dist < 1.5 ? 0.65 : 0.25;
      mat.current.opacity += (targetOpacity - mat.current.opacity) * 0.1;

      const targetBorder = dist < 0.5 ? 0.22 : 0.04;
      borderMat.current.opacity +=
        (targetBorder - borderMat.current.opacity) * 0.1;

      const targetPosY = dist < 0.5 ? Math.sin(t) * 0.08 : 0;
      mesh.current.position.y += (targetPosY - mesh.current.position.y) * 0.05;
      border.current.position.y = mesh.current.position.y;

      const targetRotY = Math.max(-0.25, Math.min(0.25, (activeF - i) * 0.12));
      mesh.current.rotation.y += (targetRotY - mesh.current.rotation.y) * 0.08;
      border.current.rotation.y = mesh.current.rotation.y;
    }
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
          onMount={registerCard}
        />
      ))}
    </group>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function ProjectGallery() {
  return (
    <group position={[0, -1, 3]}>
      <GalleryCards />
    </group>
  );
}
