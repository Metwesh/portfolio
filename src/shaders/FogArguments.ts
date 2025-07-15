import * as THREE from "three";

export const FOG_ARGUMENTS: {
  color: THREE.ColorRepresentation;
  near?: number | undefined;
  far?: number | undefined;
} = { color: "#202025", near: 0, far: 80 };

export const LIGHT_ARGUMENTS: {
  position: THREE.Vector3;
  color: THREE.Color;
} = {
  position: new THREE.Vector3(0, 0, 35),
  color: new THREE.Color(0xffffff),
};
