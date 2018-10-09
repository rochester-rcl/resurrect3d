/* @flow */

// React
import React, { Component } from 'react';

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// Actions
import { startConversion, restartConverter } from '../../actions/actions';

// Components
import ConverterForm from '../../components/converter/Converter';
import PtmConverterForm from '../../components/converter/PtmConverter';
import LoaderModal from '../../components/LoaderModal';
import ConverterSave from '../../components/converter/ConverterSave';

// Constants
import { CONVERSION_TYPE_RTI } from '../../constants/application';
class ConverterContainer extends Component {

  render(): Object {
    const { startConversion, restartConverter, conversionStarted, conversionComplete, file, progress, conversionType } = this.props;
    if (conversionStarted === false) {
      return(
        conversionType !== CONVERSION_TYPE_RTI ? <ConverterForm startConversion={startConversion} /> : <PtmConverterForm startConversion={startConversion} />
      );
    } else {
      if (conversionComplete === false) {
        return(<LoaderModal className="three-loader-dimmer" text={progress.label} percent={progress.percent} active={true} />);
      } else {
        return(<ConverterSave file={file} restartConverter={restartConverter} />);
      }
    }
  }
}

function mapStateToProps(state: Object): Object {
  return {
    ...state.converter
  }

}
export default connect(mapStateToProps, { startConversion, restartConverter })(ConverterContainer);
