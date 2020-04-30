// TODO move VRML to its own class
import * as _THREE from "three";

// Constants
import {
  THREE_MESH,
  THREE_GROUP,
  THREE_DIFFUSE_MAP,
  THREE_MESH_STANDARD_MATERIAL,
  OBJ_EXT,
  VRML_EXT,
} from "../../constants/application";

import initBufferGeometryUtils from "../BufferGeometryUtils";
import { cloneTexture } from "./normals";
// postrprocessing options
import { toYUp, centerGeometry, getChildren } from "./geometry";

import { createNormalMap } from "./normals";

// lodash
import lodash from "lodash";

// Abstract Base Class
import ThreeConverter, { generateTextureUrl } from "./ThreeConverter";

// super obnoxious pattern.
const THREE = _THREE;

initBufferGeometryUtils(THREE);

export default class ThreeVRMLConverter extends ThreeConverter {
  OPTIONS_MAP = {
    center: centerGeometry,
    createNormalMap: createNormalMap,
    yUp: toYUp,
  };
  constructor(mesh, maps, options, progress) {
    super(mesh, maps, options, progress);
    this.loadVRML = this.loadVRML.bind(this);
    this.loadVRMLCallback = this.loadVRMLCallback.bind(this);
    this.handleOptionsCallback = this.handleOptionsCallback.bind(this);
    this.asyncMaterials = [];
    this.blobs = [];
    this.loadedMaterials = [];
  }

  getMeshFileFormat() {
    const splitFilename = this.meshFile.name.split(".");
    const ext = splitFilename[splitFilename.length - 1];
    for (let key in this.MESH_FORMATS) {
      const format = this.MESH_FORMATS[key];
      if (format.includes(ext)) {
        return key;
      }
    }
  }

  getLoader() {
    return this.LOADER_METHODS[this.getMeshFileFormat()];
  }

  fixVRMLTextures(vrmlText) {
    return new Promise((resolve, reject) => {
      const windows = /(url)(.*?)\r/g;
      const unix = /(url)(.*?)\r/g;
      const { matches, isWindows } = this.findLineInFile(
        vrmlText,
        windows,
        unix
      );
      const unique = [...new Set(matches.map((m) => m[0]))];
      const maps = this.vrmlImageTexturesToObjectUrl(unique, isWindows);
      if (maps.length !== unique.length) {
        const missing = unique.filter(
          (url) => maps.findIndex((map) => url === map.url) < 0
        );
        reject(
          new Error(`Not All Texture Maps in ${
            this.meshFile.name
          } were uploaded.\n
            The following maps are missing:\n
            ${missing.join("\n")}
          `)
        );
        return;
      }
      let updated = vrmlText;
      maps.forEach((m) => {
        const regex = new RegExp(this.escapeRegExp(m.url), "g");
        updated = updated.replace(regex, `url "${m.externalUrl}"\n`);
      });
      this.blobs = lodash.uniqBy(this.blobs, "blob");
      resolve(updated);
    });
  }

  // https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string
  escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
  }

  vrmlImageTexturesToObjectUrl(urls, windows = false) {
    return urls
      .map((url) => this.vrmlImageTextureToObjectUrl(url, windows))
      .reduce((a, b) => a.concat(b), [])
      .filter((m) => m !== undefined);
  }

  vrmlImageTextureToObjectUrl(url, windows = false) {
    const basename = this.getBasename(url, windows);
    for (let key in this.mapFiles) {
      const maps = this.mapFiles[key];
      const map = maps.find((m) => {
        const mapName = lodash.trim(m.name);
        return mapName === basename;
      });
      if (map) {
        const blob = URL.createObjectURL(map);
        this.blobs.push({ type: key, blob: blob });
        return {
          url: url,
          externalUrl: blob,
        };
      }
    }
  }

  mergeMeshes(children, useGroups = true) {
    const globalMaterials = [];
    const attributeGroups = {};
    children.forEach((child) => {
      const attributesKey = Object.keys(child.geometry.attributes).join("_");
      if (!attributeGroups[attributesKey]) {
        attributeGroups[attributesKey] = {
          geometry: [],
          material: [],
        };
      }
      const ab = attributeGroups[attributesKey];
      ab.geometry.push(child.geometry);
      const materials =
        child.material.constructor === Array
          ? this.convertMultiMaterial(child.material)
          : [this.convertMaterialToStandard(child.material)];
      ab.material.push(...materials);
    });
    let merged;
    if (Object.keys(attributeGroups).length > 1) {
      merged = new THREE.Group();
    } else {
      merged = new THREE.Mesh();
    }
    for (let key in attributeGroups) {
      const mesh = new THREE.Mesh();
      const group = attributeGroups[key];
      mesh.geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(
        group.geometry,
        useGroups
      );
      const unique = lodash.uniqWith(
        group.material,
        (a, b) =>
          a.userData.src === b.userData.src &&
          a.color.getHexString() === b.color.getHexString()
      );
      mesh.material = group.material.map((m) =>
        unique.find((mat) => mat.userData.src === m.userData.src)
      );
      unique.forEach((uniq) => {
        if (uniq.src && uniq.src.userData) {
          const hasMaterial = this.asyncMaterials.some(
            (mat) => mat.userData && uniq.userData.src === mat.userData.src
          );
          if (!hasMaterial) {
            this.asyncMaterials.push(uniq);
          }
        }
      });
      if (merged.constructor.name === THREE_GROUP) {
        merged.add(mesh);
      } else {
        merged = mesh;
      }
    }
    return {
      merged: merged,
      materials: globalMaterials,
    };
  }

  convertToGroup(mesh) {
    let root = new THREE.Group();
    const groups = mesh.children.filter(
      (child) => child.constructor.name === THREE_GROUP
    );
    if (groups.length > 0) {
      const globalMaterials = [];
      groups.forEach((group) => {
        const { merged, materials } = this.mergeMeshes(getChildren(group));
        globalMaterials.push(...materials);
        root.add(merged);
      });
    } else {
      const { merged } = this.mergeMeshes(getChildren(mesh));
      root.add(merged);
    }
    return root;
  }

  // TODO clean this up
  rectifyMaps(json) {
    const uniqueImages = lodash.uniqWith(
      this.loadedMaterials,
      (a, b) => a.map.image.src === b.map.image.src
    );
    this.loadedMaterials.map((material) => {
      const mat = uniqueImages.find(
        (m) => m.map.image.src === material.map.image.src
      );
      const serializedMat = json.materials.find(
        (m) => m.uuid === material.uuid
      );
      if (serializedMat) {
        const tex = json.textures.find((t) => t.uuid === serializedMat.map);
        if (tex) {
          tex.image = mat.map.image.uuid;
        }
        const blob = this.blobs.find((b) => mat.map.image.src === b.blob);
        if (blob) {
          serializedMat.map = null;
          serializedMat[blob.type] = tex.uuid;
        }
      }
    });
    return json;
  }

  async waitForAllLoadedTextures() {
    const sleep = async (duration) =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
      });
    try {
      let materialsLoaded = false;
      while (!materialsLoaded) {
        this.loadedMaterials = this.asyncMaterials.filter(
          (m) => m.map !== null
        );
        materialsLoaded =
          this.loadedMaterials.length === this.asyncMaterials.length;
        await sleep(1000);
      }
      // ready
    } catch (error) {
      throw error;
    }
  }

  loadVRML() {
    return new Promise((resolve, reject) => {
      try {
        if (this.loadersInitialized === false) {
          reject(
            "ThreeConverter.init must be called before you can convert this mesh."
          );
          return;
        }
        if (this.meshFile !== null) {
          this.emitProgress("Reading Mesh File", 10);
          this.readASCII(this.meshFile)
            .then((meshData) => {
              this.fixVRMLTextures(meshData)
                .then((vrmlData) => {
                  const vrmlLoader = new THREE.VRMLLoader();
                  this.emitProgress("Parsing Mesh Data", 25);
                  this.mesh = vrmlLoader.parse(vrmlData);
                  // convert all materials to standard
                  this.mesh = this.convertToGroup(this.mesh);
                  this.emitProgress("Loading Textures", 50);
                  this.waitForAllLoadedTextures().then(() =>
                    resolve(this.mesh)
                  );
                })
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        } else {
          reject(new Error("No Mesh File Attached"));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  convertMaterialToStandard(mat) {
    const material = new THREE.MeshStandardMaterial();
    for (let key in mat) {
      if (material[key] !== undefined) {
        material[key] = mat[key];
        if (key === "shininess") {
          material["roughness"] = Math.pow(1.0 - mat[key], 2);
        }
      }
    }
    material.type = THREE_MESH_STANDARD_MATERIAL;
    const blob = this.blobs.find((b) => b.blob === mat.userData.src);
    if (blob) {
      if (blob.type !== "map") {
        material[blob.type] = material.map;
      }
    }
    return material;
  }

  convertMultiMaterial(mat) {
    return mat.map(this.convertMaterialToStandard);
  }

  handleOptionsCallback(mesh) {
    const exported = mesh.toJSON();
    console.log(exported);
    this.emitDone({ threeFile: exported });
  }

  loadVRMLCallback(mesh) {
    super.convert();
    this.emitProgress("Applying Post-Processing Options", 75);
    return this.handleOptions();
  }

  convert() {
    return this.loadVRML()
      .then(this.loadVRMLCallback)
      .then(this.handleOptionsCallback)
      .then((exported) => Promise.resolve(exported))
      .catch((error) => this.handleError(error));
  }
}
