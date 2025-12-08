import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { experiences } from "../../constants/experiences";

export function Walkway({ 
  length = 50, 
  isIntersecting = false 
}: { 
  length?: number;
  isIntersecting?: boolean;
}) {
  const wallHeight = 4;
  const corridorWidth = 10;
  const lineWidth = 2;
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Create gradient from experience colors
  const experienceColors = experiences.map((exp) => exp.color);

  // Reset animation when intersecting changes (only once)
  useEffect(() => {
    if (isIntersecting && !hasAnimated) {
      // Small delay before starting animation
      const timeout = setTimeout(() => {
        setAnimationProgress(0);
        setHasAnimated(true);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isIntersecting, hasAnimated]);

  // Animate line growth
  useFrame((_state, delta) => {
    if (hasAnimated && animationProgress < 1) {
      setAnimationProgress((prev) => Math.min(prev + delta * 0.5, 1));
    }
  });

  // Create gradient colors for vertex coloring
  const createVertexColors = useMemo(() => {
    const segments = 200; // Increased segments for smoother animation
    const colors: THREE.Color[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Map t across all experience colors
      const colorIndex = t * (experienceColors.length - 1);
      const lowerIndex = Math.floor(colorIndex);
      const upperIndex = Math.ceil(colorIndex);
      const localT = colorIndex - lowerIndex;

      const color1 = new THREE.Color(experienceColors[lowerIndex]);
      const color2 = new THREE.Color(experienceColors[upperIndex]);
      colors.push(color1.clone().lerp(color2, localT));
    }

    return colors;
  }, [experienceColors]);

  // Create points for the corridor outline with interpolated points for gradient
  const createCorridorLines = () => {
    const segments = 200; // Increased segments for smoother animation
    const lines: [number, number, number][][] = [];

    const floorY = -0.5;
    const ceilingY = wallHeight - 0.5;
    const leftX = -corridorWidth / 2;
    const rightX = corridorWidth / 2;
    const gap = 0.5;

    // Helper to create interpolated points along a line
    const interpolatePoints = (
      start: [number, number, number],
      end: [number, number, number]
    ): [number, number, number][] => {
      const points: [number, number, number][] = [];
      // Calculate how many points to include based on animation progress
      const totalPoints = segments + 1;
      const pointsToShow = Math.floor(totalPoints * animationProgress);

      for (let i = 0; i <= segments; i++) {
        if (i > pointsToShow) break; // Stop adding points beyond animation progress
        const t = i / segments;
        points.push([
          start[0] + (end[0] - start[0]) * t,
          start[1] + (end[1] - start[1]) * t,
          start[2] + (end[2] - start[2]) * t,
        ]);
      }
      return points;
    };

    // Horizontal lines along length with gradient (floor edges)
    lines.push(
      interpolatePoints([leftX, floorY, gap], [leftX, floorY, length - gap])
    );
    lines.push(
      interpolatePoints([rightX, floorY, gap], [rightX, floorY, length - gap])
    );

    // Horizontal lines along length with gradient (ceiling edges)
    lines.push(
      interpolatePoints([leftX, ceilingY, gap], [leftX, ceilingY, length - gap])
    );
    lines.push(
      interpolatePoints(
        [rightX, ceilingY, gap],
        [rightX, ceilingY, length - gap]
      )
    );

    return lines;
  };

  return (
    <group>
      {createCorridorLines().map((line) => {
        const key = `line-${line[0].join(",")}-${line[line.length - 1].join(
          ","
        )}`;

        return (
          <group key={key}>
            {/* Main line */}
            <Line
              points={line as unknown as THREE.Vector3[]}
              vertexColors={createVertexColors}
              lineWidth={lineWidth}
              fog
            />
            {/* Glow layer 1 */}
            <Line
              points={line as unknown as THREE.Vector3[]}
              vertexColors={createVertexColors}
              lineWidth={lineWidth * 3}
              transparent
              opacity={0.4}
              fog
            />
            {/* Glow layer 2 */}
            <Line
              points={line as unknown as THREE.Vector3[]}
              vertexColors={createVertexColors}
              lineWidth={lineWidth * 6}
              transparent
              opacity={0.2}
              fog
            />
          </group>
        );
      })}
    </group>
  );
}
