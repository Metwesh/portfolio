import { useTexture } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import type * as THREE from "three";
import { MathUtils, type MeshBasicMaterial, Shape, ShapeGeometry } from "three";
import { PROJECTS } from "../constants/projects";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { scrollStore } from "../stores/scrollStore";
import { damp } from "../utils/damp";

// Module-level exit progress (0 = fully visible, 1 = fully gone).
let _exitProgress = 0;

// ─── Constants ────────────────────────────────────────────────────────────────
// Max bounds a card's image is fit within — project screenshots vary in
// their own size/aspect ratio, so each card's actual geometry is sized to
// contain its image at native aspect (see fitCardSize) rather than forcing
// every card to this exact box and cropping to fill it.
const CARD_MAX_W = 8.2;
const CARD_MAX_H = 6.0;
const CARD_RADIUS = 0.38;
// Border frame thickness, in world units, added uniformly on every side —
// grows both dimensions by 2×pad and the radius by exactly pad, which is
// what keeps the border a constant-width ring concentric with the image's
// own rounded corners (a naive uniform *scale* of the same shape does not:
// it scales the radius by the same factor as width/height, so the two
// corners drift apart and the border stops tracking the image's edge).
const BORDER_PAD = 0.14;
const CARD_SPACING = 9;
const N = PROJECTS.length;
const APPROACH_Y = 12;

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

// Full-image "contain" fit within the max card bounds, preserving the
// image's own aspect ratio — the geometry itself ends up sized to exactly
// match the image, so the whole photo is always visible, never cropped,
// and the UVs (built at 0..1 across whatever w/h makeRoundedRect gets)
// naturally sample the full texture with no repeat/offset math needed.
function fitCardSize(tex: THREE.Texture): { w: number; h: number } {
  const img = tex.image as HTMLImageElement | ImageBitmap | null;
  const imgW = img ? ("naturalWidth" in img ? img.naturalWidth : img.width) : 0;
  const imgH = img
    ? "naturalHeight" in img
      ? img.naturalHeight
      : img.height
    : 0;
  if (!imgW || !imgH) return { w: CARD_MAX_W, h: CARD_MAX_H };
  const imgAspect = imgW / imgH;
  const maxAspect = CARD_MAX_W / CARD_MAX_H;
  return imgAspect > maxAspect
    ? { w: CARD_MAX_W, h: CARD_MAX_W / imgAspect }
    : { w: CARD_MAX_H * imgAspect, h: CARD_MAX_H };
}

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
  link?: string;
  onMount: (index: number, handles: CardHandles) => void;
  // Written directly by this card's own pointer handlers, read by
  // GalleryCards' single useFrame loop (which already owns every card's
  // scale/opacity/position each frame) to apply the hover boost there —
  // a ref instead of React state so hovering never triggers a re-render,
  // same pattern as UniverseCanvas's module-level _techDrag.
  hoveredIndexRef: React.RefObject<number | null>;
}

function ProjectCard3D({
  index,
  texture,
  color,
  posX,
  link,
  onMount,
  hoveredIndexRef,
}: CardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const borderRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<MeshBasicMaterial>(null);
  const borderMatRef = useRef<MeshBasicMaterial>(null);
  // Tap-vs-drag detection — same thresholds as TechBox's pointer handling.
  // The gallery already has its own wheel/touch swipe gesture running at
  // window level, so a click can't just be "pointerup on this mesh"; it
  // has to be a short, low-movement press to avoid firing mid-swipe.
  const pointerDownRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  // Sized to this image's own aspect ratio (see fitCardSize) — geometry is
  // per-card rather than a shared singleton, since every project photo can
  // be a different size/aspect. Border geometry is the image size grown by
  // a uniform additive pad on width/height/radius, which is what keeps it a
  // constant-width ring around the image's actual rounded corners.
  const { cardGeo, borderGeo } = useMemo(() => {
    const { w, h } = fitCardSize(texture);
    return {
      cardGeo: makeRoundedRect(w, h, CARD_RADIUS),
      borderGeo: makeRoundedRect(
        w + BORDER_PAD * 2,
        h + BORDER_PAD * 2,
        CARD_RADIUS + BORDER_PAD,
      ),
    };
  }, [texture]);

  useEffect(() => {
    return () => {
      cardGeo.dispose();
      borderGeo.dispose();
    };
  }, [cardGeo, borderGeo]);

  useLayoutEffect(() => {
    onMount(index, {
      mesh: meshRef,
      border: borderRef,
      mat: matRef,
      borderMat: borderMatRef,
    });
  }, [index, onMount]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    const down = pointerDownRef.current;
    pointerDownRef.current = null;
    if (!down) return;
    const dx = Math.abs(e.clientX - down.x);
    const dy = Math.abs(e.clientY - down.y);
    const dt = Date.now() - down.time;
    if (dx >= 10 || dy >= 10 || dt >= 300) return;
    e.stopPropagation();

    // Clicking the already-active (centered) card has nothing left to
    // "center", so it opens the project instead — clicking a peeking
    // neighbor still just brings it to focus (see ProjectsSection).
    const activeIndex = Math.round(scrollStore.projectProgress * (N - 1));
    if (activeIndex === index && link) {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }
    document.dispatchEvent(
      new CustomEvent("projectgallery:cardclick", { detail: { index } }),
    );
  };

  // Reuses TechBox's cursor-hover signal — CustomCursor already listens for
  // these two event names to show a "this is clickable" cursor state; no
  // reason to duplicate that wiring for a second 3D-hover source.
  const handlePointerEnter = () => {
    hoveredIndexRef.current = index;
    window.dispatchEvent(new Event("techbox:pointerenter"));
  };
  const handlePointerLeave = () => {
    // Guard against out-of-order enter/leave when the pointer crosses
    // straight from one card to its neighbor — only clear if this card is
    // still the one on record, so the neighbor's own enter (which may have
    // already fired) doesn't get clobbered by this stale leave.
    if (hoveredIndexRef.current === index) hoveredIndexRef.current = null;
    window.dispatchEvent(new Event("techbox:pointerleave"));
  };

  return (
    <>
      <mesh
        ref={meshRef}
        position={[posX, 0, 0]}
        geometry={cardGeo}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <meshBasicMaterial ref={matRef} map={texture} transparent opacity={0} />
      </mesh>
      <mesh ref={borderRef} position={[posX, 0, -0.05]} geometry={borderGeo}>
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
  const reducedMotion = useReducedMotion();
  const imageUrls = PROJECTS.map((p) => p.image);
  const textures = useTexture(imageUrls);
  const groupRef = useRef<THREE.Group>(null);
  const exitBaseRef = useRef<number>(-1);

  // All card refs collected here — avoids N separate useFrame subscriptions
  const cardHandlesRef = useRef<Array<CardHandles | null>>(Array(N).fill(null));
  const registerCard = useCallback((index: number, handles: CardHandles) => {
    cardHandlesRef.current[index] = handles;
  }, []);
  // Which card (if any) is currently pointer-hovered — written by that
  // card's own handlers, read below each frame to apply the hover boost.
  const hoveredIndexRef = useRef<number | null>(null);

  // Cache responsive scale — recompute only on viewport change, not every frame
  const responsiveScaleRef = useRef(1.0);
  const lastSizeRef = useRef({ width: 0, height: 0 });

  // Single filtered copy of activeF, shared by every per-card dist/band/rotation
  // target below. Deriving those straight from the raw activeF (each then
  // re-damped independently, with its own lambda) let scale/opacity/rotation
  // drift out of phase with each other and with the group's own (separately
  // damped) position — reads as jitter once per-frame scroll deltas get small
  // (slow scroll, or fast scroll decelerating to a stop). One shared filtered
  // source keeps every card property moving in lockstep, same fix pattern as
  // CameraRig's single smoothed position feeding the M piece.
  const smoothedActiveFRef = useRef(0);

  useFrame((state, delta) => {
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
        (visibleWidthAtGallery * 1.2) / CARD_MAX_W,
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

    groupRef.current.position.y = damp(
      groupRef.current.position.y,
      targetY,
      0.09,
      delta,
    );
    groupRef.current.scale.setScalar(responsiveScale);

    const activeF = p * (N - 1);
    const targetX = -activeF * CARD_SPACING * responsiveScale;
    groupRef.current.position.x = damp(
      groupRef.current.position.x,
      targetX,
      0.1,
      delta,
    );
    smoothedActiveFRef.current = damp(
      smoothedActiveFRef.current,
      activeF,
      0.1,
      delta,
    );
    const smoothActiveF = smoothedActiveFRef.current;

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

      const dist = Math.abs(smoothActiveF - i);
      // Continuous near/mid/far blend instead of hard dist thresholds —
      // a step function here means damp() can fully settle into one tier
      // (scale/opacity/etc.) before the target suddenly flips to the next,
      // producing a visible pop. Only shows up once scroll is slow enough
      // for the settle to complete before the next threshold crossing,
      // which is exactly the "only at slow scroll" symptom this fixes.
      const band1 = MathUtils.smoothstep(dist, 0.35, 0.65);
      const band2 = MathUtils.smoothstep(dist, 1.35, 1.65);

      if (exiting) {
        const alpha = 1 - _exitProgress;
        mat.current.opacity =
          alpha * MathUtils.lerp(MathUtils.lerp(1.0, 0.65, band1), 0.25, band2);
        borderMat.current.opacity = alpha * MathUtils.lerp(0.22, 0.04, band1);
        continue;
      }

      // Cards beyond neighbours are already at rest — cheap lerp, skip scale/rot
      if (dist > 2.5) {
        mat.current.opacity = damp(mat.current.opacity, 0.25, 0.1, delta);
        borderMat.current.opacity = damp(
          borderMat.current.opacity,
          0.04,
          0.1,
          delta,
        );
        continue;
      }

      const isHovered = hoveredIndexRef.current === i;

      // Hover boost — scale, brighten, and a slight pop toward the camera.
      // A discrete on/off state driven by the pointer, not a continuous
      // idle loop, so (like MLogo's selection glow) this stays active
      // under reduced motion rather than being zeroed like the sine bob
      // below.
      const targetScale =
        MathUtils.lerp(MathUtils.lerp(1.0, 0.88, band1), 0.75, band2) *
        (isHovered ? 1.06 : 1);
      const curScale = mesh.current.scale.x;
      mesh.current.scale.setScalar(damp(curScale, targetScale, 0.1, delta));
      // No extra multiplier here — borderGeo already has the correct pad
      // baked in at scale 1 (see fitCardSize/BORDER_PAD), so matching the
      // image's own scale exactly keeps that pad proportionally correct at
      // any zoom level instead of drifting non-uniform like the old
      // *1.045-on-top-of-a-different-base-size version did.
      border.current.scale.setScalar(mesh.current.scale.x);

      const targetOpacity = MathUtils.lerp(
        MathUtils.lerp(1.0, 0.65, band1),
        0.25,
        band2,
      );
      mat.current.opacity = damp(
        mat.current.opacity,
        isHovered ? MathUtils.lerp(targetOpacity, 1, 0.6) : targetOpacity,
        0.1,
        delta,
      );

      const targetBorder = MathUtils.lerp(0.22, 0.04, band1);
      borderMat.current.opacity = damp(
        borderMat.current.opacity,
        isHovered ? Math.max(targetBorder, 0.4) : targetBorder,
        0.1,
        delta,
      );

      const targetPosY = reducedMotion ? 0 : Math.sin(t) * 0.08 * (1 - band1);
      mesh.current.position.y = damp(
        mesh.current.position.y,
        targetPosY,
        0.05,
        delta,
      );
      border.current.position.y = mesh.current.position.y;

      const targetPosZ = isHovered ? 0.35 : 0;
      mesh.current.position.z = damp(
        mesh.current.position.z,
        targetPosZ,
        0.15,
        delta,
      );
      border.current.position.z = mesh.current.position.z - 0.05;

      const targetRotY = Math.max(
        -0.25,
        Math.min(0.25, (smoothActiveF - i) * 0.12),
      );
      mesh.current.rotation.y = damp(
        mesh.current.rotation.y,
        targetRotY,
        0.08,
        delta,
      );
      border.current.rotation.y = mesh.current.rotation.y;
    }
  });

  return (
    <group ref={groupRef} position={[0, APPROACH_Y, 0]}>
      {PROJECTS.map((project, i) => (
        <ProjectCard3D
          key={project.name}
          index={i}
          texture={Array.isArray(textures) ? textures[i] : textures}
          color={project.color}
          posX={i * CARD_SPACING}
          link={project.link}
          onMount={registerCard}
          hoveredIndexRef={hoveredIndexRef}
        />
      ))}
    </group>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function ProjectGallery() {
  return (
    <group position={[0, -0.4, 3]}>
      <GalleryCards />
    </group>
  );
}
