/* @flow */
import React, { Component } from "react";

// Semantic UI
import { Segment, Form, Header, Divider, Button } from "semantic-ui-react";

// Constants
import {
  VALID_MESH_FORMATS,
  VALID_IMAGE_FORMATS,
  VALID_MATERIAL_FORMATS,
  CHECKBOX,
  MAP,
  FILE
} from "../../constants/application";

export default class ConverterForm extends Component {
  state = {
    maps: {
      map: {
        label: "Diffuse Map",
        file: null,
        info: "http://docs.cryengine.com/display/SDKDOC2/Diffuse+Maps",
        type: FILE,
        accept: VALID_IMAGE_FORMATS
      },
      normalMap: {
        label: "Normal Map",
        file: null,
        info: "https://en.wikipedia.org/wiki/Normal_mapping",
        type: FILE,
        accept: VALID_IMAGE_FORMATS
      },
      displacementMap: {
        label: "Displacement Map",
        file: null,
        info: "https://en.wikipedia.org/wiki/Displacement_mapping",
        type: FILE,
        accept: VALID_IMAGE_FORMATS
      },
      aoMap: {
        label: "Ambient Occlusion Map",
        file: null,
        info: "https://en.wikipedia.org/wiki/Ambient_occlusion",
        type: FILE,
        accept: VALID_IMAGE_FORMATS
      },
      roughnessMap: {
        label: "Roughness Map",
        file: null,
        info:
          "https://marmoset.co/posts/physically-based-rendering-and-you-can-too/",
        type: FILE,
        accept: VALID_IMAGE_FORMATS
      },
      metalnessMap: {
        label: "Metalness Map",
        file: null,
        info:
          "https://marmoset.co/posts/physically-based-rendering-and-you-can-too/",
        type: FILE,
        accept: VALID_IMAGE_FORMATS
      },
    },
    mesh: {
      label: "Mesh File (OBJ)",
      file: null,
      info: "https://en.wikipedia.org/wiki/Wavefront_.obj_file",
      type: FILE,
      accept: VALID_MESH_FORMATS
    },
    material: {
      label: "Materials File (MTL)",
      file: null,
      info: "https://en.wikipedia.org/wiki/Wavefront_.obj_file",
      type: FILE,
      accept: VALID_MATERIAL_FORMATS
    },
    options: {
      center: { label: "Re-Center Geometry", val: false, type: CHECKBOX },
      compress: { label: "Use JPEG Compression on Large Textures", val: false, type: CHECKBOX },
      zlib: { label: "Use ZLib Compression on the Output Mesh", val: false, type: CHECKBOX },
      createNormalMap: {
        label: "Generate Normal Map from Diffuse",
        val: false,
        type: CHECKBOX
      }
    }
  };

  constructor(props: Object) {
    super(props);
    (this: any).handleFileUpload = this.handleFileUpload.bind(this);
    (this: any).handleField = this.handleField.bind(this);
    (this: any).renderGroup = this.renderGroup.bind(this);
    (this: any).checkFileUploadType = this.checkFileUploadType.bind(this);
    (this: any).handleSubmit = this.handleSubmit.bind(this);
    (this: any).prepare = this.prepare.bind(this);
  }

  checkFileUploadType(key: string): string {
    if (this.state[key] === undefined) return MAP;
    return key;
  }

  handleFileUpload(event: SynteticEvent, { name, value }): void {
    const type = this.checkFileUploadType(name);
    const shallowCopy = { ...this.state };
    if (type === MAP) {
      shallowCopy.maps[name].file = event.target.files[0];
    } else {
      shallowCopy[name].file = event.target.files[0];
    }
    this.setState(shallowCopy);
  }

  handleField(event: SyntheticEvent, { name, value, type }): void {
    const val = type === CHECKBOX ? event.target.checked : value;
    const shallowCopy = { ...this.state.options };
    shallowCopy[name].val = val;
    this.setState({ options: shallowCopy }, () => console.log(this.state));
  }

  prepare(data: Object): Object {
    const { mesh, material, maps, options } = data;
    const toSubmit = {};
    toSubmit.mesh = mesh.file;
    toSubmit.material = material.file;
    toSubmit.maps = {};
    toSubmit.options = {};
    for (let key in maps) {
      let val = maps[key];
      if (val.file !== null) {
        toSubmit.maps[key] = val.file;
      }
    }
    for (let key in options) {
      let option = options[key];
      toSubmit.options[key] = option.val;
    }
    return toSubmit;
  }

  handleSubmit(event: SyntheticEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.props.startConversion(this.prepare(this.state));
  }

  renderGroup(group: Object): Form.Group {
    return (
      <Form.Group fluid className="three-converter-form-group">
        {Object.keys(group).map((key, index) => {
          let field = group[key];
          return (
            <Form.Input
             
              className="three-converter-form-field"
              label={field.label}
              type={field.type}
              accept={field.accept}
              name={key}
              key={index}
              onChange={
                field.type === FILE ? this.handleFileUpload : this.handleField
              }
            />
          );
        })}
      </Form.Group>
    );
  }

  render() {
    const { maps, options, ...rest } = this.state;
    return (
      <Form inverted className="three-converter-form">
        <Divider className="three-converter-form-divider" inverted horizontal>
          Mesh
        </Divider>
        {this.renderGroup(rest)}
        <Divider className="three-converter-form-divider" inverted horizontal>
          Maps
        </Divider>
        {this.renderGroup(maps)}
        <Divider className="three-converter-form-divider" inverted horizontal>
          Options
        </Divider>
        {this.renderGroup(options)}
        <Button
          size="large"
          className="three-converter-form-submit"
          color="green"
          onClick={this.handleSubmit}
        >
          convert
        </Button>
      </Form>
    );
  }
}
