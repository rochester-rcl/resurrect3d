/* @flow */

export function areaFromBounds(bbox: typeof THREE.Box3): Number {

  let { min, max } = bbox;
  let shape = {};
  shape.h = max.y - min.y;
  shape.w = max.x - min.x;
  shape.l = max.z - min.z;
  shape.area = shape.l * shape.w * shape.h;
  return shape;

}

export function fitBoxes(bbox1: typeof THREE.Box3, bbox2: typeof THREE.Box3, factor: Number): Number {

  let shape1 = areaFromBounds(bbox1);
  let shape2 = areaFromBounds(bbox2);
  let size1 = Math.floor(shape1.h * shape1.w);
  let size2 = Math.floor(shape2.h * shape2.w);
  let fit = size1 % (size2 / factor);
  return fit;

}
