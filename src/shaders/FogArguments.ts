import {
  Color as ThreeColor,
  type ColorRepresentation as ThreeColorRepresentation,
  Vector3 as ThreeVector3,
} from "three";

export const FOG_ARGUMENTS: {
  color: ThreeColorRepresentation;
  near?: number | undefined;
  far?: number | undefined;
} = { color: "#080e19", near: 18, far: 40 };

export const LIGHT_ARGUMENTS: {
  position: ThreeVector3;
  color: ThreeColor;
} = {
  position: new ThreeVector3(0, 0, 35),
  color: new ThreeColor(0xffffff),
};
