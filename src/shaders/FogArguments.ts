import {
  Color as ThreeColor,
  Vector3 as ThreeVector3,
  type ColorRepresentation as ThreeColorRepresentation,
} from "three";

export const FOG_ARGUMENTS: {
  color: ThreeColorRepresentation;
  near?: number | undefined;
  far?: number | undefined;
} = { color: "#202025", near: 0, far: 80 };

export const LIGHT_ARGUMENTS: {
  position: ThreeVector3;
  color: ThreeColor;
} = {
  position: new ThreeVector3(0, 0, 35),
  color: new ThreeColor(0xffffff),
};
