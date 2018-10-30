/* @flow */

// React
import React, { Component } from "react";

// Semantic UI
import {
  Icon,
  Label,
  Button,
  Sidebar,
  Menu,
  Segment,
  Modal
} from "semantic-ui-react";

// Components
import ThreeButton from "./ThreeButton";

// exporters
import loadExporters from "../utils/exporters";

// Cache
import IndexedCache from "../utils/cache/Cache";

// THREE
import THREE from "three";

// JSZip
import JSZip from "jszip";

// constants
import { OBJ_EXT, STL_EXT, ZIP_EXT } from "../constants/application";

// short uuid
const short = require("short-uuid");

export default class ThreeMeshExporter extends Component {
  FORMATS: Object = {
    OBJ: {
      ext: ".obj",
      mime: "text/plain",
      exporter: null
    },
    STL: {
      ext: ".stl",
      mime: "text/plain",
      exporter: null
    }
  };
  OBJ_FORMAT: string = "OBJ";
  STL_FORMAT: string = "STL";
  MIME: string = "text/plain";
  _cache: IndexedCache;
  state: Object = {
    url: null,
    OBJKey: null,
    STLKey: null,
    dbLoaded: false,
    menuVisible: false,
    filename: null
  };
  uuid = short();
  constructor(props: Object) {
    super(props);
    (this: any).export = this.export.bind(this);
    (this: any).save = this.save.bind(this);
    (this: any).initCache = this.initCache.bind(this);
    (this: any).toggleExportMenu = this.toggleExportMenu.bind(this);
    (this: any).handleClientDownload = this.handleClientDownload.bind(this);
    (this: any).OBJExporter = null;
    (this: any).STLExporter = null;
  }

  componentDidMount(): void {
    loadExporters(this.props.threeInstance).then(() => {
      this.FORMATS[
        this.OBJ_FORMAT
      ].exporter = new this.props.threeInstance.OBJExporter();
      this.FORMATS[
        this.STL_FORMAT
      ].exporter = new this.props.threeInstance.STLExporter();
      this.initCache();
    });
  }

  componentWillUnmount(): void {
    this._cache.close();
  }

  initCache(): void {
    this._cache = new IndexedCache("ThreeMesh", {
      name: "ThreeMeshIndex",
      items: ["mesh.name", "mesh.format"]
    });
    this._cache
      .open()
      .then(() => this.setState({ dbLoaded: true }))
      .catch(error => console.log(error));
  }

  export(event: SyntheticEvent, format: string): void {
    event.preventDefault();
    event.stopPropagation();
    let name = (this.props.mesh.children[0] !== undefined) ? this.props.mesh.children[0].name : this.props.mesh.name;
    if (this.state.dbLoaded !== false) {
      let result = this._cache
        .get([name, format])
        .then(query => {
          if (query.data === null) {
            this.save(format);
          } else {
            this.handleClientDownload(query.data.mesh.data, format);
          }
        })
        .catch(error => {
          console.log(
            "Unable to retrieve exported mesh from cache. Encountered the following error: ",
            error
          );
          let meshData = this.FORMATS[format].exporter.parse(
            this.props.mesh,
            this.uuid.new()
          );
          this.handleClientDownload(meshData, format);
        });
    }
  }

  save(format: string): void {
    let name = (this.props.mesh.children[0] !== undefined) ? this.props.mesh.children[0].name : this.props.mesh.name;
    let meshData = this.FORMATS[format].exporter.parse(
      this.props.mesh,
      this.uuid.new()
    );
    this._cache
      .add({
        id: this.uuid.new(),
        mesh: {
          name: name,
          format: format,
          data: meshData
        }
      })
      .then(query => {
        this.handleClientDownload(meshData, format);
      })
      .catch(error => console.log(error));
  }

  toggleExportMenu(): void {
    this.setState({
      menuVisible: !this.state.menuVisible
    });
  }

  handleClientDownload(data: Object, format: string): void {
    switch (format) {
      case this.OBJ_FORMAT:
        let zipFile = new JSZip();
        const { obj, mtl, images, zip } = data;
        zipFile.file(obj.filename, obj.rawData);
        zipFile.file(mtl.filename, mtl.rawData);
        for (let i = 0; i < images.length; i++) {
          let image = images[i];
          zipFile.file(images[i].filename, images[i].rawData, { binary: true });
        }
        zipFile.generateAsync({ type: "blob" }).then(blob => {
          this.setState(
            {
              url: window.URL.createObjectURL(blob),
              filename: zip.filename
            },
            () => this.downloadLink.click()
          );
        });
        break;

      case this.STL_FORMAT:
        const { stl } = data;
        let blob = new Blob([stl.rawData], { type: this.MIME });
        this.setState(
          {
            url: window.URL.createObjectURL(blob),
            filename: stl.filename
          },
          () => this.downloadLink.click()
        );
        break;
    }
  }

  render() {
    const { extension } = this.props;
    const { menuVisible, filename, url } = this.state;
    let downloadClass = "three-data-download-link";
    let baseClass = "three-export-menu ";
    if (menuVisible) {
      baseClass += "show";
    } else {
      baseClass += "hide";
    }
    return (
      <div className="three-export-button-container">
        <Modal
          basic
          className="three-export-modal"
          trigger={
            <ThreeButton
              content="save mesh"
              className="three-controls-button"
              icon="cube"
              labelPosition="right"
              color="grey"
            />
          }
        >
          <Modal.Header className="three-export-modal-header">
            {" "}
            Select an export format{" "}
          </Modal.Header>
          <Modal.Content className="three-export-modal-content">
            <span className="three-export-format">
              <span className="three-export-format-label">
                WaveFront OBJ (geometry + textures) --
              </span>
              <a
                className="three-export-format-info"
                href="https://en.wikipedia.org/wiki/Wavefront_.obj_file"
                target="_blank"
              >
                <Icon name="info" />
              </a>
              <span
                className="three-export-format-download"
                onClick={event => this.export(event, this.OBJ_FORMAT)}
              >
                <Icon name="cloud download" />
              </span>
            </span>
            <span className="three-export-format">
              <span className="three-export-format-label">
                Stereolithography STL (geometry only) --
              </span>
              <a
                className="three-export-format-info"
                href="https://en.wikipedia.org/wiki/Stereolithography"
                target="_blank"
              >
                <Icon name="info" />
              </a>
              <span
                className="three-export-format-download"
                onClick={event => this.export(event, this.STL_FORMAT)}
              >
                <Icon name="cloud download" />
              </span>
            </span>
            <a
              ref={ref => (this.downloadLink = ref)}
              href={url}
              download={filename}
            />
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}
