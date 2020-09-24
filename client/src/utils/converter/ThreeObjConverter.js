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
import ThreeConverter from "./ThreeConverter";
// super obnoxious pattern.
const THREE = _THREE;

export default class ThreeObjConverter extends ThreeConverter {
  OPTIONS_MAP = {
    center: centerGeometry,
    createNormalMap: createNormalMap,
    yUp: toYUp,
  };

  constructor(
    mesh: File,
    materials: File,
    maps: Object,
    options: Object,
    progress: ConverterProgress
  ) {
    super(mesh, maps, options, progress);
    this.mtlFile = materials;
    this.loadObj = this.loadObj.bind(this);
    this.loadObjCallback = this.loadObjCallback.bind(this);
    this.loadMtl = this.loadMtl.bind(this);
    this.loadMTLCallback = this.loadMTLCallback.bind(this);
    this.handleOptionsCallback = this.handleOptionsCallback.bind(this);
    this.convertWithMaterials = this.convertWithMaterials.bind(this);
    this.convertNoMaterials = this.convertNoMaterials.bind(this);
    this.setUpMaterials = this.setUpMaterials.bind(this);
    this.rectifyDataURLs = this.rectifyDataURLs.bind(this);
    this.loadedMaps = {};
    this.materialNames = [];
  }

  loadObj(material) {
    return new Promise((resolve, reject) => {
      try {
        if (this.loadersInitialized === false) {
          reject(
            "ThreeConverter.init must be called before you can convert this mesh."
          );
        } else {
          if (this.meshFile !== null) {
            this.readASCII(this.meshFile)
              .then((meshData) => {
                const objLoader = new THREE.OBJLoader();
                objLoader.setPath("");
                if (material !== undefined) objLoader.setMaterials(material);
                this.mesh = objLoader.parse(meshData);
                console.log(this.mesh);
                this.setUpMaterials().then(() => resolve(this.mesh));
              })
              .catch((error) => reject(error));
          } else {
            resolve(new THREE.Mesh());
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  rectifyTextureURL(
    _materials: THREE.MTLLoader.MaterialCreator,
    maps: Array<Object>
  ) {
    const diffuse = maps.filter((map) => map.type === THREE_DIFFUSE_MAP);
    for (let key in _materials.materialsInfo) {
      const material = _materials.materialsInfo[key];
      console.log(material);
      console.log(this.materialNames);
      const materialName = this.materialNames.find(
        (mat) => mat.materialName === material.name
      );
      if (materialName) {
        const dm = diffuse.find((d) => d.filename === materialName.filename);
        if (dm) {
          material.map_kd = dm.dataURL;
        }
      }
    }
  }

  rectifyDataURLs(serialized: object) {
    serialized.images.forEach((image) => {
      for (let key in this.loadedMaps) {
        const maps = this.loadedMaps[key];
        const map = maps.find((m) => m.image.uuid === image.uuid);
        if (map !== undefined) {
          image.url = map.image.currentSrc;
        }
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

  // TODO so far only working with ONE MAP - will have to think about how to do it otherwise, UUIDs will work
  setUpMaterials(): Promise {
    const tasks = [];
    let children;
    if (this.mesh.constructor.name === THREE_MESH) {
      children = [this.mesh];
    } else {
      children = this.mesh.children;
    }
    children.forEach((child) => {
      if (child.material.constructor === Array) {
        child.material = this.convertMultiMaterial(child.material);
      } else {
        child.material = this.convertMaterialToStandard(child.material);
      }
      for (let key in this.maps) {
        const maps =
          this.maps[key].constructor === Array
            ? this.maps[key]
            : [this.maps[key]];

        // because diffuse is handled in the loader via map_kd
        const task = maps.map((map) =>
          this.loadTexture(map.dataURL, (tex) => {
            if (child.material.constructor === Array) {
              // TODO need to handle multi materials here
            } else {
              child.material[map.type] = tex;
              if (this.loadedMaps[map.type] === undefined) {
                this.loadedMaps[map.type] = [tex];
              } else {
                this.loadedMaps[map.type].push(tex);
              }
            }
          })
        );
        tasks.push(task);
      }
    });
    return Promise.all(tasks.reduce((a, b) => a.concat(b), []));
  }

  getMaterialNames(mtlData) {
    // https://stackoverflow.com/questions/24375462/how-to-match-all-text-between-two-strings-multiline
    const unix = /newmtl([\S\s]*?)map_Kd.*/g;
    const { matches } = this.findLineInFile(mtlData, unix, unix);
    return matches.map((match) => {
      const block = match[0];
      const mapKd = block.match(/map_Kd.*/g)[0];
      const isWindows = mapKd.includes("\\");
      return {
        materialName: block.match(/newmtl.*/g)[0].replace("newmtl ", "").trim(),
        filename: this.getBasename(mapKd.replace("map_Kd", "").trim(), isWindows),
      };
    });
  }

  loadMtl() {
    return new Promise((resolve, reject) => {
      try {
        if (this.loadersInitialized === false) {
          reject(
            "ThreeConverter.init must be called before you can convert this material."
          );
        } else {
          if (this.mtlFile !== null) {
            this.readASCII(this.mtlFile)
              .then((mtlData) => {
                this.materialNames = this.getMaterialNames(mtlData);
                const mtlLoader = new THREE.MTLLoader();
                mtlLoader.setPath("");
                this.materials = mtlLoader.parse(mtlData);
                if (!lodash.isEmpty(this.mapFiles)) {
                  this.readMaps(this.mapFiles).then((maps) => {
                    this.maps = maps;
                    this.rectifyTextureURL(this.materials, this.maps);
                    resolve(this.materials);
                  });
                } else {
                  resolve(this.materials);
                }
              })
              .catch((error) => reject(error));
          } else {
            resolve(new THREE.MeshStandardMaterial());
          }
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  loadMTLCallback(material) {
    this.emitProgress("Reading Geometry Data", 50);
    return this.loadObj(material);
  }

  loadObjCallback(mesh) {
    super.convert();
    this.emitProgress("Applying Post-Processing Options", 75);
    return this.handleOptions();
  }

  handleOptionsCallback(mesh) {
    console.log(mesh);
    const exported = mesh.toJSON();
    if (!this.options.compress && this.maps !== undefined) {
      this.rectifyDataURLs(exported);
    }
    console.log(exported);
    this.emitDone(exported);
  }

  convertWithMaterials() {
    return this.loadMtl()
      .then(this.loadMTLCallback)
      .then(this.loadObjCallback)
      .then(this.handleOptionsCallback)
      .then((exported) => Promise.resolve(exported))
      .catch((error) => this.handleError(error));
  }

  convertNoMaterials() {
    return this.loadObj()
      .then(this.loadObjCallback)
      .then(this.handleOptionsCallback)
      .then((exported) => Promise.resolve(exported))
      .catch((error) => this.handleError(error));
  }

  convert(): Promise {
    this.emitProgress("Reading Material Data", 25);
    if (this.mtlFile !== null) {
      return this.convertWithMaterials();
    }
    return this.convertNoMaterials();
  }
}
