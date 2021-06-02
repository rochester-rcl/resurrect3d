/* @flow */

// React
import React, { Component } from "react";

// Redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// Actions
import { startConversion, restartConverter } from "../../actions/actions";

// Components
import ConverterForm from "../../components/converter/Converter";
import PtmConverterForm from "../../components/converter/PtmConverter";
import LoaderModal from "../../components/LoaderModal";
import ConverterSave from "../../components/converter/ConverterSave";

// Constants
import { CONVERSION_TYPE_RTI } from "../../constants/application";

import { Button } from "semantic-ui-react";

class ConverterContainer extends Component {
  render(): Object {
    const {
      startConversion,
      addAlternateMaps,
      restartConverter,
      conversionStarted,
      conversionComplete,
      file,
      externalMaps,
      progress,
      conversionType,
      error,
      onConversionComplete,
      enableLocalSave,
    } = this.props;
    if (conversionStarted === false) {
      return conversionType !== CONVERSION_TYPE_RTI ? (
        <ConverterForm startConversion={startConversion} addAlternateMaps={addAlternateMaps}/>
      ) : (
        <PtmConverterForm startConversion={startConversion} />
      );
    } else {
      if (conversionComplete === false) {
        return (
          <div className="three-converter-container-no-save">
            <LoaderModal
              className="three-loader-dimmer"
              text={progress.label}
              percent={progress.percent}
              active={true}
              error={error}
              cancelButton={
                <Button
                  className="three-converter-restart-button"
                  onClick={restartConverter}
                  color="green"
                >
                  convert another
                </Button>
              }
            />
          </div>
        );
      } else {
        if (onConversionComplete) {
          onConversionComplete(ConverterSave.prepareFile(file), externalMaps);
        }
        if (enableLocalSave) {
          return (
            <ConverterSave file={file} restartConverter={restartConverter} />
          );
        } else {
          return (
            <div className="three-converter-container-no-save">
              <LoaderModal
                className="three-loader-dimmer"
                text={"Conversion Completed"}
                percent={100}
                active={true}
                error={error}
                cancelButton={
                  <Button
                    className="three-converter-restart-button"
                    onClick={restartConverter}
                    color="green"
                  >
                    convert another
                  </Button>
                }
              />
            </div>
          );
        }
      }
    }
  }
}

function mapStateToProps(state: Object): Object {
  return {
    ...state.converter,
  };
}
export default connect(mapStateToProps, { startConversion, restartConverter })(
  ConverterContainer
);
