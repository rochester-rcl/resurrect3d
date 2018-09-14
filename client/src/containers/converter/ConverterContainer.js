/* @flow */

// React
import React, { Component } from 'react';

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// Actions
import { startConversion } from '../../actions/actions';

// Components
import ConverterForm from '../../components/converter/Converter';


class ConverterContainer extends Component {

  render(): Object {
    const { startConversion, conversionStarted, conversionComplete, threeFile } = this.props;
    if (conversionStarted === false) {
      return(
        <ConverterForm startConversion={startConversion} />
      );
    } else {
      if (conversionComplete === false) {
        <div>LOADER GOES HERE</div>
      } else {
        <div>DOWNLOAD PAGE GOES HERE</div>
      }
    }
  }
}

function mapStateToProps(state: Object): Object {
  return {
    ...state.converter
  }

}
export default connect(mapStateToProps, { startConversion })(ConverterContainer);
