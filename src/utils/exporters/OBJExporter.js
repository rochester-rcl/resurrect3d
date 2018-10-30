/**
 * @author mrdoob / http://mrdoob.com/
 */

// utils
import { mapMaterials, exportMap } from "../mesh";

// constants
import {
  MAP_TYPES,
  OBJ_EXT,
  MTL_EXT,
  ZIP_EXT
} from "../../constants/application";

const mtlTemplate = [
  ["#",
  "# Wavefront material file",
  "#\n"].join("\n"),

  ["Ka 0.200000 0.200000 0.200000",
  "Kd 1.000000 1.000000 1.000000",
  "Ks 1.000000 1.000000 1.000000",
  "Tr 1.000000",
  "illum 2",
  "Ns 0.000000\n"].join("\n"),
];

export default function loadOBJExporter(threeInstance: Object): typeof Promise {
  return new Promise((resolve, reject) => {
    threeInstance.OBJExporter = function() {};

    threeInstance.OBJExporter.prototype = {
      constructor: threeInstance.OBJExporter,

      parse: function(object, name) {
        var output = "";
        var images = [];
        var mtl = "";

        var indexVertex = 0;
        var indexVertexUvs = 0;
        var indexNormals = 0;

        var vertex = new threeInstance.Vector3();
        var normal = new threeInstance.Vector3();
        var uv = new threeInstance.Vector2();

        var i,
          j,
          k,
          l,
          m,
          face = [];

        var parseMesh = function(mesh) {
          var nbVertex = 0;
          var nbNormals = 0;
          var nbVertexUvs = 0;

          var geometry = mesh.geometry;

          var normalMatrixWorld = new threeInstance.Matrix3();

          if (geometry instanceof threeInstance.Geometry) {
            geometry = new threeInstance.BufferGeometry().setFromObject(mesh);
          }

          if (geometry instanceof threeInstance.BufferGeometry) {
            // shortcuts
            var vertices = geometry.getAttribute("position");
            var normals = geometry.getAttribute("normal");
            var uvs = geometry.getAttribute("uv");
            var indices = geometry.getIndex();

            // name of the mesh object
            output += "o " + name + "\n";
            output += ""
            // name of the mesh material
            if (mesh.material) {
              output += "mtllib ./" + name + MTL_EXT + "\n";
              output += "usemtl " + name + "\n";
              images = mapMaterials(mesh.material, exportMap);
              if (images.length > 0) {
                let filename;
                let normalMapCount = 1;
                let diffuseMapCount = 1;
                mtl = mtlTemplate[0];
                for (let i = 0; i < images.length; i++) {
                  let image = images[i];
                  if (image.type === MAP_TYPES.DIFFUSE_MAP) {
                    mtl += "newmtl + material_" + i + "\n";
                    mtl += mtlTemplate[1];
                    filename = name + "_diffuse_" + diffuseMapCount + image.ext;
                    mtl += "\n map_Kd " + filename + "\n";
                    diffuseMapCount++;
                  } else if (image.type === MAP_TYPES.NORMAL_MAP) {
                    filename = name + "_normal_" + normalMapCount + image.ext;
                    normalMapCount++;
                  }
                  image.filename = filename;
                }
              }
            }

            // vertices

            if (vertices !== undefined) {
              for (i = 0, l = vertices.count; i < l; i++, nbVertex++) {
                vertex.x = vertices.getX(i);
                vertex.y = vertices.getY(i);
                vertex.z = vertices.getZ(i);

                // transfrom the vertex to world space
                vertex.applyMatrix4(mesh.matrixWorld);

                // transform the vertex to export format
                output +=
                  "v " + vertex.x + " " + vertex.y + " " + vertex.z + "\n";
              }
            }

            // uvs

            if (uvs !== undefined) {
              for (i = 0, l = uvs.count; i < l; i++, nbVertexUvs++) {
                uv.x = uvs.getX(i);
                uv.y = uvs.getY(i);

                // transform the uv to export format
                output += "vt " + uv.x + " " + uv.y + "\n";
              }
            }

            // normals

            if (normals !== undefined) {
              normalMatrixWorld.getNormalMatrix(mesh.matrixWorld);

              for (i = 0, l = normals.count; i < l; i++, nbNormals++) {
                normal.x = normals.getX(i);
                normal.y = normals.getY(i);
                normal.z = normals.getZ(i);

                // transfrom the normal to world space
                normal.applyMatrix3(normalMatrixWorld);

                // transform the normal to export format
                output +=
                  "vn " + normal.x + " " + normal.y + " " + normal.z + "\n";
              }
            }

            // faces

            if (indices !== null) {
              for (i = 0, l = indices.count; i < l; i += 3) {
                for (m = 0; m < 3; m++) {
                  j = indices.getX(i + m) + 1;

                  face[m] =
                    indexVertex +
                    j +
                    (normals || uvs
                      ? "/" +
                        (uvs ? indexVertexUvs + j : "") +
                        (normals ? "/" + (indexNormals + j) : "")
                      : "");
                }

                // transform the face to export format
                output += "f " + face.join(" ") + "\n";
              }
            } else {
              for (i = 0, l = vertices.count; i < l; i += 3) {
                for (m = 0; m < 3; m++) {
                  j = i + m + 1;

                  face[m] =
                    indexVertex +
                    j +
                    (normals || uvs
                      ? "/" +
                        (uvs ? indexVertexUvs + j : "") +
                        (normals ? "/" + (indexNormals + j) : "")
                      : "");
                }

                // transform the face to export format
                output += "f " + face.join(" ") + "\n";
              }
            }
          } else {
            console.warn(
              "THREE.OBJExporter.parseMesh(): geometry type unsupported",
              geometry
            );
          }

          // update index
          indexVertex += nbVertex;
          indexVertexUvs += nbVertexUvs;
          indexNormals += nbNormals;
        };

        var parseLine = function(line) {
          var nbVertex = 0;

          var geometry = line.geometry;
          var type = line.type;

          if (geometry instanceof threeInstance.Geometry) {
            geometry = new threeInstance.BufferGeometry().setFromObject(line);
          }

          if (geometry instanceof threeInstance.BufferGeometry) {
            // shortcuts
            var vertices = geometry.getAttribute("position");

            // name of the line object
            output += "o " + line.name + "\n";

            if (vertices !== undefined) {
              for (i = 0, l = vertices.count; i < l; i++, nbVertex++) {
                vertex.x = vertices.getX(i);
                vertex.y = vertices.getY(i);
                vertex.z = vertices.getZ(i);

                // transfrom the vertex to world space
                vertex.applyMatrix4(line.matrixWorld);

                // transform the vertex to export format
                output +=
                  "v " + vertex.x + " " + vertex.y + " " + vertex.z + "\n";
              }
            }

            if (type === "Line") {
              output += "l ";

              for (j = 1, l = vertices.count; j <= l; j++) {
                output += indexVertex + j + " ";
              }

              output += "\n";
            }

            if (type === "LineSegments") {
              for (
                j = 1, k = j + 1, l = vertices.count;
                j < l;
                j += 2, k = j + 1
              ) {
                output +=
                  "l " + (indexVertex + j) + " " + (indexVertex + k) + "\n";
              }
            }
          } else {
            console.warn(
              "THREE.OBJExporter.parseLine(): geometry type unsupported",
              geometry
            );
          }

          // update index
          indexVertex += nbVertex;
        };

        object.traverse(function(child) {
          if (child instanceof threeInstance.Mesh) {
            parseMesh(child);
          }

          if (child instanceof threeInstance.Line) {
            parseLine(child);
          }
        });

        return {
          obj: { filename: name + OBJ_EXT, rawData: output },
          mtl: { filename: name + MTL_EXT, rawData: mtl },
          images: images,
          zip: { filename: name + ZIP_EXT }
        };
      }
    };
    resolve(threeInstance);
  });
}
