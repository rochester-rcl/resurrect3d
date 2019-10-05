import React, {createRef} from 'react';
import PropTypes from 'prop-types';
// React-redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as AdminActionCreators from '../../actions/ThreeViewActions';

import {
  Button,
  Checkbox,
  Container,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Menu,
  Segment,
  Sidebar,
  Sticky,
} from 'semantic-ui-react';

import SemanticContent from './SemanticContent';

class SemanticBase extends React.Component {

  constructor(props: Object){
    super(props);
    (this: any).handleSidebar = this.handleSidebar.bind(this);
    (this: any).state ={
      dimmed: false,
      visible: false
    }
  }

  componentDidMount = () => {
    this.props.getViews();
  }

  handleSidebar = () => {
    this.setState(prevState => ({ visible: !prevState.visible, dimmed: !prevState.dimmed }));
  };

  render() {
    const VerticalSidebar = ({ animation, direction, visible }) => (
      <Sidebar
        as={Menu}
        animation={animation}
        direction={direction}
        icon='labeled'
        inverted
        vertical
        onHide={() => this.handleSidebar()}
        visible={visible}
        width='thin'
      >
        <Menu.Item as='a'>
          <Icon name='home' />
          Home
        </Menu.Item>
        <Menu.Item as='a'>
          <Icon name='gamepad' />
          Games
        </Menu.Item>
        <Menu.Item as='a'>
          <Icon name='camera' />
          Channels
        </Menu.Item>
      </Sidebar>
    );

    const classes = {

      root: {
        display: 'flex',
        minHeight: '100vh',
      },
      appContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      },
      mainContent: {
        flex: 1,
        padding: '48px 36px 0',
        background: '#eaeff1',
      },
    }

    return(
      <Sidebar.Pushable as={Segment} className='root'>

        <VerticalSidebar
          animation={'overlay'}
          direction={'left'}
          visible={this.state.visible}
        />

      <Sidebar.Pusher dimmed={this.state.dimmed && this.state.visible} className='appContent'>
          <Segment basic >
            <Header as='h3'>Application Content</Header>

            <Menu
              attached='top'
              tabular
              style={{ backgroundColor: '#fff', paddingTop: '1em' }}>
              <Menu.Item as='a' active name='bio' />
              <Menu.Item as='a' active={false} name='photos' />
              <Menu.Menu position='right'>
                <Menu.Item>
                  <Input
                    transparent
                    icon={{ name: 'search', link: true }}
                    placeholder='Search users...'
                  />
                </Menu.Item>
                <Menu.Item>
                  <Button
                    circular
                    basic
                    icon
                    onClick={this.handleSidebar}>
                    <Icon name='content' />
                  </Button>
                </Menu.Item>
              </Menu.Menu>
            </Menu>

            <Segment attached='bottom' className='mainContent'>
              <SemanticContent/>
            </Segment>
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    )
  }
}

SemanticBase.propTypes = {
  classes: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps): Object {
  return {
    views: state.views.views,
    //newView: state.views.view
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(AdminActionCreators, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(SemanticBase);
