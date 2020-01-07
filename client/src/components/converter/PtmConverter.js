/* @flow */
import React, { Component } from "react";

// Semantic UI
import { Segment, Form, Header, Divider, Button } from "semantic-ui-react";

// Constants
import {
  VALID_MESH_FORMATS,
  VALID_RTI_FORMATS,
  VALID_IMAGE_FORMATS,
  VALID_MATERIAL_FORMATS,
  CHECKBOX,
  MAP,
  FILE
} from "../../constants/application";

import ConverterForm from './Converter';

export default class PtmConverterForm extends ConverterForm {
  state = {
    ptm: {
      label: "RTI File (.ptm)",
      file: null,
      info: "http://www.hpl.hp.com/research/ptm/",
      type: FILE,
      accept: VALID_RTI_FORMATS
    },
    options: {
      createMesh: { label: "Create Mesh from Surface Normals", val: false, type: CHECKBOX },
      compress: { label: "Use JPEG Compression on Large Textures", val: false, type: CHECKBOX },
      zlib: { label: "Use zlib Compression on the Output Mesh", val: false, type: CHECKBOX },
    }
  };

  constructor(props) {
    super(props);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.handleField = this.handleField.bind(this);
    this.renderGroup = this.renderGroup.bind(this);
    this.checkFileUploadType = this.checkFileUploadType.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.prepare = this.prepare.bind(this);
  }

  prepare(data) {
    const { ptm, options } = data;
    const toSubmit = {};
    toSubmit.ptm = ptm.file;
    toSubmit.options = {};

    for (let key in options) {
      let option = options[key];
      toSubmit.options[key] = option.val;
    }
    return toSubmit;
  }

  handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    this.props.startConversion(this.prepare(this.state));
  }

  render() {
    const { options, ...rest } = this.state;
    return (
      <Form inverted className="three-converter-form">
        <Divider className="three-converter-form-divider" inverted horizontal>
          RTI
        </Divider>
        {this.renderGroup(rest)}
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
