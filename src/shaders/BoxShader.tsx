import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  CanvasTexture as ThreeCanvasTexture,
  ClampToEdgeWrapping as ThreeClampToEdgeWrapping,
  Color as ThreeColor,
  type IUniform as ThreeIUniform,
  LinearFilter as ThreeLinearFilter,
  ShaderMaterial as ThreeShaderMaterial,
  type ShaderMaterialParameters as ThreeShaderMaterialParameters,
  type Texture as ThreeTexture,
  TextureLoader as ThreeTextureLoader,
} from "three";
import { boxBg, WIP } from "../assets";
import { FOG_ARGUMENTS, LIGHT_ARGUMENTS } from "./FogArguments";

// Cache processed textures globally to avoid reprocessing the same texture multiple times
const textureCache = new Map<string, ThreeTexture>();

// Detect if we're on iOS (where the texture issues occur)
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1);

const processTexture = (
  texture: ThreeTexture,
  cacheKey: string,
): ThreeTexture => {
  // Return cached texture if available
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey) ?? texture;
  }

  // On non-iOS, just configure the texture normally (much faster)
  if (!isIOS) {
    texture.wrapS = ThreeClampToEdgeWrapping;
    texture.wrapT = ThreeClampToEdgeWrapping;
    texture.minFilter = ThreeLinearFilter;
    texture.magFilter = ThreeLinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    textureCache.set(cacheKey, texture);
    return texture;
  }

  // iOS: Process through canvas (expensive but necessary)
  if (!texture?.image) return texture;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return texture;

  const img = texture.image as HTMLImageElement;
  canvas.width = img.width || 250;
  canvas.height = img.height || 250;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const newTexture = new ThreeCanvasTexture(canvas);
  newTexture.wrapS = ThreeClampToEdgeWrapping;
  newTexture.wrapT = ThreeClampToEdgeWrapping;
  newTexture.minFilter = ThreeLinearFilter;
  newTexture.magFilter = ThreeLinearFilter;
  newTexture.generateMipmaps = false;
  newTexture.anisotropy = 0;
  newTexture.needsUpdate = true;

  textureCache.set(cacheKey, newTexture);
  return newTexture;
};

export default function BoxShader(props: {
  data: {
    icon: string;
    name: string;
    wip?: boolean;
  };
  isHovered?: boolean;
  isDimmed?: boolean;
}) {
  // Load the decals & backgrounds
  const rawDecalTexture = useLoader(ThreeTextureLoader, props.data.icon);
  const rawBackgroundTexture = useLoader(ThreeTextureLoader, boxBg);
  const rawWipTexture = useLoader(ThreeTextureLoader, WIP);

  // Process textures with global caching and iOS detection
  const decalTexture = useMemo(
    () => processTexture(rawDecalTexture, props.data.icon),
    [rawDecalTexture, props.data.icon],
  );
  const backgroundTexture = useMemo(
    () => processTexture(rawBackgroundTexture, "background"),
    [rawBackgroundTexture],
  );
  const wipTexture = useMemo(
    () => processTexture(rawWipTexture, "wip"),
    [rawWipTexture],
  );

  // Define the options for the fog effect in the shader.
  // The color is determined by the first argument in FOG_ARGUMENTS. If it's a string, it's assumed to be a color and is converted to an RGB array. If it's not a string, a default color of "#202025" is used.
  // The near and far distances for the fog are determined by the second and third arguments in FOG_ARGUMENTS, respectively.
  // Memoize fog options to avoid recreating on every render
  const fogOptions = useMemo(
    () => ({
      color:
        typeof FOG_ARGUMENTS.color === "string"
          ? new ThreeColor(FOG_ARGUMENTS.color).toArray()
          : new ThreeColor("#080e19").toArray(),
      near: FOG_ARGUMENTS.near,
      far: FOG_ARGUMENTS.far,
    }),
    [],
  );

  // Define the uniforms for the shader. These are the variables that can be accessed from both the vertex and fragment shaders.
  // decalTexture, backgroundTexture, and wipTexture are the textures used in the shader.
  // useWipTexture is a boolean indicating whether to use the wipTexture.
  // lightPosition and lightColor define the position and color of the light in the shader.
  // fogColor, fogNear, and fogFar are used for fog calculations in the shader.
  // Memoize shader material to avoid recreating on every render (CRITICAL for preventing memory leaks)
  // Note: React Compiler warning is a false positive - we need ALL these dependencies for WebGL
  // biome-ignore lint/correctness/useExhaustiveDependencies: The uniform is updated via useEffect below for better performance
  const decalMaterial = useMemo(() => {
    // Define the uniforms for the shader - initialize with actual textures for iOS compatibility
    const decalShaderUniforms: { [uniform: string]: ThreeIUniform } = {
      decalTexture: { value: decalTexture },
      backgroundTexture: { value: backgroundTexture },
      wipTexture: { value: wipTexture },
      useWipTexture: { value: !!props.data?.wip },
      lightPosition: { value: LIGHT_ARGUMENTS.position },
      lightColor: { value: LIGHT_ARGUMENTS.color },
      fogColor: { value: fogOptions.color },
      fogNear: { value: fogOptions.near },
      fogFar: { value: fogOptions.far },
      glowIntensity: { value: props.isHovered ? 1.5 : 1.0 },
    };

    // Define the decal shader
    const decalShader: ThreeShaderMaterialParameters = {
      uniforms: decalShaderUniforms,
      vertexShader: `
      precision highp float;
      precision highp int;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vLightDirection;
      varying float vFogDepth;
      uniform vec3 lightPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        // Transform light to view space so both operands share the same coordinate space
        vec3 lightViewPos = (viewMatrix * vec4(lightPosition, 1.0)).xyz;
        vLightDirection = normalize(lightViewPos - mvPosition.xyz);
        vFogDepth = -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      fragmentShader: `
        precision highp float;
        precision highp int;
        precision highp sampler2D;

        uniform sampler2D decalTexture;
        uniform sampler2D backgroundTexture;
        uniform sampler2D wipTexture;
        uniform bool useWipTexture;
        uniform vec3 lightColor;
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        uniform float glowIntensity;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vLightDirection;
        varying float vFogDepth;
        void main() {
          // Clamp UV coordinates to prevent texture bleeding on iOS
          vec2 clampedUv = clamp(vUv, 0.0, 1.0);

          vec4 texColor = texture2D(decalTexture, clampedUv);
          vec4 bgColor = texture2D(backgroundTexture, clampedUv);
          float lambertian = max(dot(normalize(vNormal), normalize(vLightDirection)), 0.0);
          vec3 lightEffect = lightColor * lambertian;
          vec3 color = mix(bgColor.rgb, texColor.rgb, texColor.a);
          if (useWipTexture) {
            vec4 wipColor = texture2D(wipTexture, clampedUv);
            color = mix(color, wipColor.rgb, wipColor.a);
          }
          float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
          vec3 finalColor = mix(color * lightEffect * glowIntensity, fogColor, fogFactor);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    };

    // Create and return the shader material
    return new ThreeShaderMaterial({
      uniforms: decalShader.uniforms,
      vertexShader: decalShader.vertexShader,
      fragmentShader: decalShader.fragmentShader,
      transparent: false,
    });
  }, [
    // Include textures in dependencies so material recreates with correct textures
    // This ensures iOS gets the right textures from the start
    decalTexture,
    backgroundTexture,
    wipTexture,
    props.data?.wip,
    fogOptions,
    // Note: props.isHovered is intentionally excluded to avoid recreating material on hover
    // The uniform is updated via useEffect below for better performance
  ]);

  // Update glow intensity when hover/dim state changes
  useEffect(() => {
    if (decalMaterial.uniforms.glowIntensity)
      decalMaterial.uniforms.glowIntensity.value = props.isDimmed
        ? 0.85
        : props.isHovered
          ? 1.5
          : 1.0;
  }, [props.isHovered, props.isDimmed, decalMaterial]);

  // Dispose of material on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      decalMaterial.dispose();
    };
  }, [decalMaterial]);

  return <primitive attach="material" object={decalMaterial} />;
}
