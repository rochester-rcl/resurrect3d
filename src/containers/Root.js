/* @flow */

// React
import React, { Component } from "react";

// Redux
import { Provider } from "react-redux";

// Containers
import RouterContainer from "./RouterContainer";

const Root = (props: Object) => (
  <Provider store={props.store}>
    <RouterContainer />
  </Provider>
);

export default Root;
