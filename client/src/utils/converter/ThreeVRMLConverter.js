// TODO move VRML to its own class
import * as _THREE from "three";

// LOADERS
import initLoaders from "../loaders/InitLoaders";

// Constants
import {
  THREE_MESH,
  THREE_GROUP,
  THREE_DIFFUSE_MAP,
  THREE_MESH_STANDARD_MATERIAL,
  OBJ_EXT,
  VRML_EXT,
} from "../../constants/application";

// postrprocessing options
import { toYUp, centerGeometry } from "./geometry";

import { createNormalMap } from "./normals";

// lodash
import lodash from "lodash";

// Abstract Base Class
import ThreeConverter, { generateTextureUrl } from "./ThreeConverter";

// super obnoxious pattern.
const THREE = _THREE;

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
    this.totalVRMLMaterials = 0;
    this.asyncMaterials = [];
    this.blobs = new Set([]);
    this.uniqueImageIds = new Set([]);
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
      let matches = [...vrmlText.matchAll(windows)];
      let isWindows = true;
      if (matches.length === 0) {
        isWindows = false;
        matches = [...vrmlText.matchAll(unix)];
      }
      if (matches.length === 0) {
        resolve(vrmlText); // no textures
        return;
      }
      this.totalVRMLMaterials = matches.length;
      const unique = [...new Set(matches.map((m) => m[0]))];
      const maps = this.vrmlImageTexturesToObjectUrl(unique, isWindows);
      if (maps.length !== unique.length)
        reject(
          new Error(`Not All Maps in ${this.meshFile.name} were uploaded`)
        );
      let updated = vrmlText;

      maps.forEach((m) => {
        const regex = new RegExp(this.escapeRegExp(m.url), "g");
        updated = updated.replace(regex, `url "${m.externalUrl}"\n`);
      });
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
      .filter((m) => m !== undefined);
  }

  vrmlImageTextureToObjectUrl(url, windows = false) {
    const splitChar = windows ? "\\" : "/";
    let basename = url.split(splitChar).pop();
    if (basename.includes('"')) {
      basename = basename.replace('"', "");
    }
    basename = lodash.trim(basename);
    for (let key in this.mapFiles) {
      // TODO could be an array as well
      const map = this.mapFiles[key];
      const mapName = lodash.trim(map.name);
      // for now deal with single as a proof of concept
      if (basename === mapName) {
        // read the file to a data url
        const blob = URL.createObjectURL(map);
        this.blobs.add(blob);
        return {
          url: url,
          externalUrl: blob,
        };
      }
    }

    // return Promise.reject(new Error("No matching maps found in file. Do they have the same file name?"));
  }

  convertToGroup(mesh) {
    const group = new THREE.Group();
    const addChildren = (obj3d) => {
      if (obj3d.children) {
        obj3d.children.forEach((child) => {
          group.add(child.clone());
        });
      }
    };
    addChildren(mesh);
    return group;
  }

  getUniqueImages(materials) {
   const uniqueImages = lodash.uniqWith(materials, (a, b) => a.map.image.src === b.map.image.src);
   uniqueImages.forEach((mat) => {
     const mats = materials.filter((m) => m.map.image.src === mat.map.image.src);
     mats.forEach((_m) => console.log(_m.map.image.uuid));
   })
   materials.map((mat) => {
     const _mat = uniqueImages.find((m) => m.map.image.src === mat.map.image.src);
     if (_mat) {
       mat.userData.uniqueImageId = _mat.map.image.uuid;
     }
   });
  }

  async waitForAllLoadedTextures() {
    const sleep = async (duration) =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
      });
    try {
      let materialsLoaded = false;
      let loadedMaterials;
      while (!materialsLoaded) {
        loadedMaterials = this.asyncMaterials.filter((m) => m.map !== null);
        const totalLoadedMaterials = loadedMaterials.length;
        materialsLoaded = totalLoadedMaterials === this.totalVRMLMaterials;
        await sleep(1000);
      }
      this.getUniqueImages(loadedMaterials);
    } catch (error) {
      throw error;
    }
  }

  processMaterials() {
    this.mesh.traverse((child) => {
      if (child.constructor.name === THREE_MESH) {
        child.material = this.convertMaterialToStandard(child.material);
        this.asyncMaterials.push(child.material);
      }
    });
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
          this.readASCII(this.meshFile).then((meshData) => {
            this.fixVRMLTextures(meshData).then((vrmlData) => {
              const vrmlLoader = new THREE.VRMLLoader();
              this.emitProgress("Parsing Mesh Data", 25);
              this.mesh = vrmlLoader.parse(vrmlData);
              // convert all materials to standard
              this.mesh = this.convertToGroup(this.mesh);
              this.processMaterials();
              this.emitProgress("Loading Textures", 50);
              this.waitForAllLoadedTextures().then(() => resolve(this.mesh));
            });
          });
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
      }
    }
    material.type = THREE_MESH_STANDARD_MATERIAL;
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
