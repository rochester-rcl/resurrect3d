import React, { createRef } from "react";
import PropTypes from "prop-types";
// React-redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as AdminActionCreators from "../../actions/ThreeViewActions";

import {
  Button,
  Checkbox,
  Container,
  Grid,
  Divider,
  Header,
  Icon,
  Input,
  Image,
  Menu,
  Segment,
  Sidebar,
  Sticky
} from "semantic-ui-react";

import SemanticContent from "./SemanticContent";

class SemanticBase extends React.Component {
  constructor(props: Object) {
    super(props);
    (this: any).handleSidebar = this.handleSidebar.bind(this);
    (this: any).state = {
      dimmed: false,
      visible: false
    };
  }

  componentDidMount() {
    this.props.getViews();
  }

  handleSidebar() {
    const { visible, dimmed } = this.state;
    this.setState({
      visible: !visible,
      dimmed: !dimmed
    });
  }

  render() {
    const VerticalSidebar = ({ animation, direction, visible }) => (
      <Sidebar
        as={Menu}
        animation={animation}
        direction={direction}
        icon="labeled"
        inverted
        vertical
        onHide={() => this.handleSidebar()}
        visible={visible}
        width="thin"
      >
        <Menu.Item as="a">
          <Icon name="home" />
          Home
        </Menu.Item>
        <Menu.Item as="a">
          <Icon name="address card outline" />
          Account
        </Menu.Item>
        <Menu.Item as="a">
          <Icon name="window close outline" />
          Logout
        </Menu.Item>
      </Sidebar>
    );

    const classes = {
      root: {
        display: "flex",
        minHeight: "100vh"
      },
      appContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column"
      },
      mainContent: {
        flex: 1,
        padding: "48px 36px 0",
        background: "#eaeff1"
      }
    };

    return (
      <Sidebar.Pushable as={Segment} className="root">
        <VerticalSidebar
          animation={"overlay"}
          direction={"left"}
          visible={this.state.visible}
        />

        <Sidebar.Pusher
          dimmed={this.state.dimmed && this.state.visible}
          className="admin-content-container"
        >
          <Segment basic inverted className="admin-form-container">
            <Menu
              className="admin-menu"
              inverted
              attached="top"
              tabular
              style={{ color: "#fff", paddingTop: "1em" }}
            >
              <Menu.Menu position="right">
                <Menu.Item>
                  <Button circular basic icon onClick={this.handleSidebar}>
                    <Icon name="content" color="grey" />
                  </Button>
                </Menu.Item>
              </Menu.Menu>
            </Menu>
            <Divider inverted horizontal>
              My Models
            </Divider>
            <Segment inverted className="admin-form-content" attached="bottom">
              <SemanticContent />
            </Segment>
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}

SemanticBase.propTypes = {
  classes: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps): Object {
  return {
    views: state.views.views
    //newView: state.views.view
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(AdminActionCreators, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(SemanticBase);
