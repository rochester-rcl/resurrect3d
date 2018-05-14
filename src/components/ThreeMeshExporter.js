// React
import React, { Component } from 'react';

// Semantic UI
import { Icon, Label, Button, Sidebar, Menu, Segment, Modal } from 'semantic-ui-react';

// Components
import ThreeButton from './ThreeButton';

// short uuid
const short = require('short-uuid');

// exporters
import loadExporters from '../utils/exporters';

export default class ThreeMeshExporter extends Component {
  OBJ_FORMAT = 0;
  OBJ_EXT = '.obj'
  STL_FORMAT = 1;
  STL_EXT = '.stl';
  MIME = 'text/plain';
  state = { url: null, OBJKey: null, STLKey: null, dbLoaded: false, menuVisible: false, filename: null }
  uuid = short();
  constructor(props: Object) {
    super(props);
    (this: any).exportOBJ = this.exportOBJ.bind(this);
    (this: any).exportSTL = this.exportSTL.bind(this);
    (this: any).saveOBJ = this.saveOBJ.bind(this);
    (this: any).saveSTL = this.saveSTL.bind(this);
    (this: any).initDB = this.initDB.bind(this);
    (this: any).updateDB = this.updateDB.bind(this);
    (this: any).toggleExportMenu = this.toggleExportMenu.bind(this);
    (this: any).handleClientDownload = this.handleClientDownload.bind(this);
    (this: any).indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    (this: any).meshDB = null;
    (this: any).OBJExporter = null;
    (this: any).STLExporter = null;
  }

  componentDidMount(): void {
    loadExporters(this.props.threeInstance).then(() => {
      this.OBJExporter = new this.props.threeInstance.OBJExporter();
      // do stl after
      this.initDB();
    });
  }

  componentWillUnmount(): void {
    this.meshDB.result.close();
  }

  initDB(): void {
    this.meshDB = this.indexedDB.open("ThreeMeshDB", 1);
    this.meshDB.onupgradeneeded = this.updateDB;
    this.meshDB.onsuccess = () => this.setState({ dbLoaded: true });
  }

  updateDB(): void {
    let db = this.meshDB.result;
    let store = db.createObjectStore("ThreeMeshStore", { keyPath: "id" });
    store.createIndex("MeshIndex", ["mesh.name", "mesh.format"]);
  }

  exportOBJ(event: SyntheticEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.state.dbLoaded !== false) {
      let db = this.meshDB.result;
      let transaction = db.transaction("ThreeMeshStore", "readwrite");
      let store = transaction.objectStore("ThreeMeshStore");
      let index = store.index("MeshIndex");
      let getOBJ = index.get([this.props.mesh.children[0].name, this.OBJ_FORMAT]);
      getOBJ.onsuccess = () => {
        if (getOBJ.result === undefined) {
          this.saveOBJ();
        } else {
          this.handleClientDownload(getOBJ.result.mesh.data, this.OBJ_FORMAT);
        }
      }
    }
  }

  saveOBJ(): void {
    let db = this.meshDB.result;
    let transaction = db.transaction("ThreeMeshStore", "readwrite");
    let store = transaction.objectStore("ThreeMeshStore");
    let meshData = this.OBJExporter.parse(this.props.mesh);
    store.put({ id: this.uuid.new(), mesh: { name: this.props.mesh.children[0].name, format: this.OBJ_FORMAT, data: meshData }});
    this.exportOBJ();
  }

  exportSTL(): void {

  }

  saveSTL(): void {

  }

  toggleExportMenu(): void {
    this.setState({
      menuVisible: !this.state.menuVisible,
    });
  }

  handleClientDownload(data: string, format: number, event: SyntheticEvent): void {
    let blob = new Blob([data], { type: this.MIME });
    let filename = this.uuid.new();
    filename += (format === this.OBJ_FORMAT) ? this.OBJ_EXT : this.STL_EXT;
    this.setState({
      url: window.URL.createObjectURL(blob),
      filename: filename,
    }, () => this.downloadLink.click());
  }

  render() {
    const { extension } = this.props;
    const { menuVisible, filename, url } = this.state;
    let downloadClass = "three-data-download-link";
    let baseClass = "three-export-menu ";
    if (menuVisible) {
      baseClass += 'show';
    } else {
      baseClass += 'hide';
    }
    return(
      <div className="three-export-button-container">
        <Modal basic className="three-export-modal"
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
        <Modal.Header className="three-export-modal-header"> Select an export format </Modal.Header>
        <Modal.Content className="three-export-modal-content">
          <span className="three-export-format">
            <span className="three-export-format-label">
              WaveFront OBJ --
            </span>
            <a className="three-export-format-info" href="https://en.wikipedia.org/wiki/Wavefront_.obj_file">
              <Icon name="info"/>
            </a>
            <span className="three-export-format-download" onClick={(event) => this.exportOBJ(event)}>
              <Icon name="cloud download" />
            </span>
            <a
              ref={(ref) => this.downloadLink = ref}
              href={url}
              download={filename}
            />
          </span>
        </Modal.Content>
        </Modal>
      </div>
    );
  }
}
