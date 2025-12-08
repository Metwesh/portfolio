import { Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { experiences } from "../../constants/experiences";

export function Walkway({ length = 50 }: { length?: number }) {
  const wallHeight = 4;
  const corridorWidth = 10;
  const lineWidth = 2;

  // Create gradient from experience colors
  const experienceColors = experiences.map((exp) => exp.color);

  // Create gradient texture
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      const colorStops = experienceColors.length;
      experienceColors.forEach((color, i) => {
        gradient.addColorStop(i / (colorStops - 1), color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [experienceColors]);

  // Create points for the corridor outline
  const createCorridorLines = () => {
    const lines: [number, number, number][][] = [];

    const floorY = -0.5;
    const ceilingY = wallHeight - 0.5;
    const leftX = -corridorWidth / 2;
    const rightX = corridorWidth / 2;
    const gap = 0.5; // Gap to prevent lines from meeting

    // Horizontal lines along length with gradient (floor edges)
    lines.push([
      [leftX, floorY, gap],
      [leftX, floorY, length - gap],
    ]);
    lines.push([
      [rightX, floorY, gap],
      [rightX, floorY, length - gap],
    ]);

    // Horizontal lines along length with gradient (ceiling edges)
    lines.push([
      [leftX, ceilingY, gap],
      [leftX, ceilingY, length - gap],
    ]);
    lines.push([
      [rightX, ceilingY, gap],
      [rightX, ceilingY, length - gap],
    ]);

    return lines;
  };

  return (
    <group>
      {createCorridorLines().map((line) => {
        const key = `line-${line[0].join(",")}-${line[1].join(",")}`;

        return (
          <group key={key}>
            {/* Main line */}
            <Line
              points={line as unknown as THREE.Vector3[]}
              color="white"
              lineWidth={lineWidth}
            >
              <lineBasicMaterial
                attach="material"
                map={gradientTexture}
                transparent={false}
              />
            </Line>
            {/* Glow effect */}
            <Line
              points={line as unknown as THREE.Vector3[]}
              color="white"
              lineWidth={lineWidth * 3}
              transparent
              opacity={0.3}
            >
              <lineBasicMaterial
                attach="material"
                map={gradientTexture}
                transparent={true}
                opacity={0.3}
              />
            </Line>
          </group>
        );
      })}
    </group>
  );
}
