import { useLoader } from "@react-three/fiber";
import { WIP, boxBg } from "../assets";
import * as THREE from "three";
import { FOG_ARGUMENTS, LIGHT_ARGUMENTS } from "./FogArguments";

export default function BoxShader(props: {
  data: {
    icon: string;
    name: string;
    wip?: boolean;
  };
}) {
  // Load the decals & backgrounds
  const decalTexture = useLoader(THREE.TextureLoader, props.data.icon);
  const backgroundTexture = useLoader(THREE.TextureLoader, boxBg);
  const wipTexture = useLoader(THREE.TextureLoader, WIP);

  // Define the options for the fog effect in the shader.
  // The color is determined by the first argument in FOG_ARGUMENTS. If it's a string, it's assumed to be a color and is converted to an RGB array. If it's not a string, a default color of "#202025" is used.
  // The near and far distances for the fog are determined by the second and third arguments in FOG_ARGUMENTS, respectively.
  const fogOptions = {
    color:
      typeof FOG_ARGUMENTS.color === "string"
        ? new THREE.Color(FOG_ARGUMENTS.color).toArray()
        : new THREE.Color("#080e19").toArray(),
    near: FOG_ARGUMENTS.near,
    far: FOG_ARGUMENTS.far,
  };

  // Define the uniforms for the shader. These are the variables that can be accessed from both the vertex and fragment shaders.
  // decalTexture, backgroundTexture, and wipTexture are the textures used in the shader.
  // useWipTexture is a boolean indicating whether to use the wipTexture.
  // lightPosition and lightColor define the position and color of the light in the shader.
  // fogColor, fogNear, and fogFar are used for fog calculations in the shader.
  const decalShaderUniforms: { [uniform: string]: THREE.IUniform } = {
    decalTexture: { value: decalTexture },
    backgroundTexture: { value: backgroundTexture },
    wipTexture: { value: wipTexture },
    useWipTexture: { value: !!props.data?.wip },
    lightPosition: { value: LIGHT_ARGUMENTS.position },
    lightColor: { value: LIGHT_ARGUMENTS.color },
    fogColor: { value: fogOptions.color },
    fogNear: { value: fogOptions.near },
    fogFar: { value: fogOptions.far },
  };

  // Define the decal shader
  const decalShader: THREE.ShaderMaterialParameters = {
    uniforms: decalShaderUniforms,
    lights: true,
    fog: true,
    // This is the vertex shader code for the material.
    // It calculates the position, normal, and light direction for each vertex and passes them to the fragment shader.
    //
    // 'varying' variables are used to pass data from the vertex shader to the fragment shader.
    // vUv is the UV coordinates of the vertex, used for texture mapping.
    // vNormal is the normal vector of the vertex, used for lighting calculations.
    // vLightDirection is the direction from the vertex to the light, used for lighting calculations.
    //
    // 'uniform' variables are read-only and are set from the TypeScript code. They are constant for all vertices.
    // lightPosition is the position of the light in the scene.
    //
    // In the main function:
    // uv is assigned to vUv.
    // The normal vector is transformed by the normal matrix to handle model scaling, and then normalized and assigned to vNormal.
    // The position of the vertex is transformed by the model-view matrix to handle model transformations and camera view, and then assigned to mvPosition.
    // The direction from the vertex to the light is calculated, normalized, and assigned to vLightDirection.
    // The position of the vertex is transformed by the projection matrix to handle camera projection, and then assigned to gl_Position, which determines the position of the vertex on the screen.
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal; 
      varying vec3 vLightDirection;
      varying float fogDepth;
      uniform vec3 lightPosition;
      uniform vec3 fogColor;
      uniform float fogNear;
      uniform float fogFar;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal); 
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vLightDirection = normalize(lightPosition - mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
        fogDepth = -mvPosition.z;
      }
    `,
    // This is the fragment shader code for the material.
    // It calculates the final color of each pixel based on the textures, lighting, and fog.
    //
    // 'uniform' variables are read-only and are set from the JavaScript code. They are constant for all pixels.
    // decalTexture, backgroundTexture, and wipTexture are the textures used in the shader.
    // useWipTexture is a boolean indicating whether to use the wipTexture.
    // lightColor is the color of the light in the scene.
    // fogColor, fogNear, and fogFar are used for fog calculations.
    //
    // 'varying' variables are interpolated from the values calculated in the vertex shader for each vertex of the primitive currently being rasterized.
    // vUv is the interpolated UV coordinates, used for texture mapping.
    // vNormal is the interpolated normal vector, used for lighting calculations.
    // vLightDirection is the interpolated direction from the vertex to the light, used for lighting calculations.
    //
    // In the main function:
    // The color of the decal and background textures at the interpolated UV coordinates is fetched.
    // The Lambertian reflectance is calculated, which is the cosine of the angle between the light direction and the normal vector, clamped between 0 and 1.
    // The light effect is calculated as the product of the light color and the Lambertian reflectance.
    // The color is calculated as a mix of the background color and the decal color, using the alpha of the decal color as the mix factor.
    // If useWipTexture is true, the color of the wip texture at the interpolated UV coordinates is fetched and mixed into the color.
    // The depth of the fragment is calculated from the z/w of the fragment's clip-space position.
    // The fog factor is calculated as a smooth interpolation between 0 and 1 based on whether the depth is between the near and far fog distances.
    // The final color is calculated as a mix of the color (modulated by the light effect) and the fog color, using the fog factor as the mix factor.
    // The final color is assigned to gl_FragColor, which is the output color of the fragment.
    fragmentShader: `
        uniform sampler2D decalTexture;
        uniform sampler2D backgroundTexture;
        uniform sampler2D wipTexture;
        uniform bool useWipTexture;
        uniform vec3 lightColor;
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vLightDirection;
        void main() {
          vec4 texColor = texture2D(decalTexture, vUv);
          vec4 bgColor = texture2D(backgroundTexture, vUv);
          float lambertian = max(dot(normalize(vNormal), vLightDirection), 0.0);
          vec3 lightEffect = lightColor * lambertian;
          vec3 color = mix(bgColor.rgb, texColor.rgb, texColor.a);
          if (useWipTexture) {
            vec4 wipColor = texture2D(wipTexture, vUv);
            color = mix(color, wipColor.rgb, wipColor.a);
          }
          float depth = gl_FragCoord.z / gl_FragCoord.w;
          float fogFactor = smoothstep(fogNear, fogFar, depth);
          vec3 finalColor = mix(color * lightEffect, fogColor, fogFactor);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
  };

  // Create the shader material
  const decalMaterial = new THREE.ShaderMaterial({
    uniforms: decalShader.uniforms,
    vertexShader: decalShader.vertexShader,
    fragmentShader: decalShader.fragmentShader,
    transparent: true,
    opacity: 1,
  });

  return <primitive attach="material" object={decalMaterial} />;
}
