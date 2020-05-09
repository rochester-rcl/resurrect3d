import React, { createRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
// React-redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import LoaderModal from "../LoaderModal";

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
  Sticky,
} from "semantic-ui-react";

import SemanticContent from "./SemanticContent";

class SemanticBase extends React.Component {
  constructor(props: Object) {
    super(props);
    (this: any).handleSidebar = this.handleSidebar.bind(this);
    (this: any).state = {
      dimmed: false,
      visible: false,
    };
  }

  componentDidMount() {
    this.props.getViews();
  }

  handleSidebar() {
    const { visible, dimmed } = this.state;
    this.setState({
      visible: !visible,
      dimmed: !dimmed,
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
        <Menu.Item>
          <Button inverted size="large">
            <Link className="admin-menu-link" to="/admin/logout">
              <Icon name="window close outline" />
              Logout
            </Link>
          </Button>
        </Menu.Item>
      </Sidebar>
    );

    const classes = {
      root: {
        display: "flex",
        minHeight: "100vh",
      },
      appContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
      },
      mainContent: {
        flex: 1,
        padding: "48px 36px 0",
        background: "#eaeff1",
      },
    };

    return (
      <Sidebar.Pushable as={Segment} className="admin-root">
        <VerticalSidebar
          animation={"overlay"}
          direction={"left"}
          visible={this.state.visible}
        />
        <LoaderModal
          inline={true}
          text="Saving Model ..."
          active={this.props.pending}
        />
        <Sidebar.Pusher
          dimmed={this.state.dimmed && this.state.visible}
          className={`admin-content-container ${
            this.props.pending ? "loading" : ""
          }`}
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
              <Header size="huge" className="admin-form-header">My Models</Header>
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
  classes: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps): Object {
  return {
    views: state.views.views,
    pending: state.views.pending,
    //newView: state.views.view
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(AdminActionCreators, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(SemanticBase);
