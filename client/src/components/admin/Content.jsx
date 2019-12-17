import React from 'react';
import PropTypes from 'prop-types';

// React-redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as ActionCreators from '../../actions/ThreeViewActions';

import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';


import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';

import Container from '@material-ui/core/Container';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import uniqueId from 'lodash/uniqueId';

const useStyles = theme => ({
  paper: {
    marginBottom: "2rem",
    maxWidth: 936,
    margin: 'auto',
    overflow: 'hidden',
  },
  searchBar: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  },
  searchInput: {
    fontSize: theme.typography.fontSize,
  },
  block: {
    display: 'block',
  },
  addUser: {
    marginRight: theme.spacing(1),
  },
  contentWrapper: {
    margin: '40px 16px',
  },
  listRoot: {
    width: '100%',
    position: 'relative',
    overflow: 'auto',
    maxHeight: 580
  },
  sortableMargin: {
    marginBottom: '1rem'
  },
  infoSnack: {
    backgroundColor: theme.palette.primary.main
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  close: {
    padding: theme.spacing(0.5),
  }
});

class Content extends React.Component {

  constructor(props : Object) {
    super(props);
    (this : any).handleSnackBarClose = this.handleSnackBarClose.bind(this);
    (this : any).handleChange = this.handleChange.bind(this);
    (this : any).state = {
      sortables: [
        "test test test test test test tets test tets test tets tte tst stts sttst",
        'test',
        'test'
      ],
      measurements: [
        {value: 'MM', label: 'mm'},
        {value: 'FT', label: 'ft'},
        {value: 'CM', label: 'cm'}
      ],
      booleans: [
        {value: false, label: 'false'},
        {value: true, label: 'true'}
      ],

      enableLight: '',
      enableMaterials: '',
      enableShaders: '',
      enableMeasurement: '',
      modelUnits: '',

      open: false,
      setOpen: false
    };
  }

  componentDidMount = () => {
    console.log(this.props);
    this.props.getViews();
    //console.log(this.props);
    //const allBucketsProps = this.props.allBucketsInfo;
    //const snack = this.props.userInfo.authToExpire;
    //if (snack) {
      //console.log(`authToExpire is: [${snack}]`);
      //this.setState({setOpen: snack});
    //}
    //this.setState({allBuckets: allBucketsProps}, () => console.log(this.state));

  }

  handleSnackBarClose(reason) {
    console.log(reason);
    if (reason === 'clickaway') {
      return;
    }

    console.log("reason was not click away");
    this.setState({setOpen: false});
    this.props.reauthorize();
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    //console.log(this.props.views);
    const entries = Object.entries(this.props.views);
    //console.log(entries);
    const sortables = this.state.sortables.map(val => (<ListItem key={uniqueId()} data-id={val}>{val}</ListItem>));

    const {classes} = this.props
    const indexs = ['groupOne', 'groupTwo', 'groupThree', 'groupFour', 'groupFive', 'groupSix', 'groupSeven', 'groupEight', 'groupNine'];

    const list = entries.map(obj =>
      <Paper key={obj[1]._id} className={classes.sortableMargin}>
        <ListSubheader>{obj[1]._id}</ListSubheader>
        <List>
          <ListItem>{obj[1].threeFile}</ListItem>
          <ListItem>{obj[1].threeThumbnail}</ListItem>
          <ListItem>{(obj[1].enableLight).toString()}</ListItem>
          <ListItem>{(obj[1].enableMaterials).toString()}</ListItem>
          <ListItem>{(obj[1].enableShaders).toString()}</ListItem>
          <ListItem>{(obj[1].enableMeasurement).toString()}</ListItem>
          <ListItem>{obj[1].modelUnits}</ListItem>
          <ListItem>{obj[1].skybox.file}</ListItem>
        </List>
        {/*
        <Sortable
          component={List}
          options={{
            group: 'shared',
            pull: true,
            put: true
          }}
          onChange={ (items, sortable, evt) => {
            //console.log(`${obj[1].catagory}: [${items}]`);
            //const catagory = obj[1]._id;
            this.handleOnChangeSortable(items, obj[1].catagory);
            /*
            this.setState(prevState => ({
              //console.log(catagory);
              allBuckets:{
                ...prevState.allBuckets,
                [catagory]:{
                  ...prevState.allBuckets[catagory],
                  sortables: items
                }
              }
            }), () => console.log(this.state.allBuckets[catagory]));

          }}>

          {obj[1].sortables.map(val => (<ListItem key={uniqueId()} data-id={val}>{val}</ListItem>))}
        </Sortable>
        */}
      </Paper>
    );

    return (
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={5} lg={4}>
          <Paper className={classes.listRoot}>
            <ListSubheader>Add new view</ListSubheader>
            <form noValidate autoComplete="off">
              <Container>
              {/*
              <FormControlLabel
                control={
                  <Button
                    variant="contained"
                    color="default"
                    component="label">
                    Upload
                    <CloudUploadIcon
                      style={{ marginLeft: "5px"}} />
                    <input
                      type="file"
                      name="threeFile"
                      style={{ display: "none" }}
                      onChange={this.onChange}
                      accept=".json,.gz"/>
                  </Button>
                }
                label={(this.state.threeFileName === "") ? "no file" : this.state.threeFileName}
                labelPlacement="bottom"/>
                */}
              <TextField
                id="standard-select-currency"
                select
                label="Select"
                className={classes.textField}
                value={this.state.enableLight}
                onChange={this.handleChange('enableLight')}
                SelectProps={{
                  MenuProps: {
                    className: classes.menu,
                  },
                }}
                helperText="Please en/disable lights"
                margin="normal">
                {this.state.booleans.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                id="standard-select-currency"
                select
                label="Select"
                className={classes.textField}
                value={this.state.enableShaders}
                onChange={this.handleChange('enableShaders')}
                SelectProps={{
                  MenuProps: {
                    className: classes.menu,
                  },
                }}
                helperText="Please select your measurement"
                margin="normal">
                {this.state.booleans.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                id="standard-select-currency"
                select
                label="Select"
                className={classes.textField}
                value={this.state.enableMaterials}
                onChange={this.handleChange('enableMaterials')}
                SelectProps={{
                  MenuProps: {
                    className: classes.menu,
                  },
                }}
                helperText="Please en/disable lights"
                margin="normal">
                {this.state.booleans.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                id="standard-select-currency"
                select
                label="Select"
                className={classes.textField}
                value={this.state.enableMeasurement}
                onChange={this.handleChange('enableMeasurement')}
                SelectProps={{
                  MenuProps: {
                    className: classes.menu,
                  },
                }}
                helperText="Please select your measurement"
                margin="normal">
                {this.state.booleans.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                id="standard-select-currency"
                select
                label="Select"
                className={classes.textField}
                value={this.state.modelUnits}
                onChange={this.handleChange('modelUnits')}
                SelectProps={{
                  MenuProps: {
                    className: classes.menu,
                  },
                }}
                helperText="Please select your measurement"
                margin="normal">
                {this.state.measurements.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              </Container>
            </form>
          </Paper>
        </Grid>
        <Grid className={classes.listRoot} item xs={12} md={7} lg={8}>
          {list}
        </Grid>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.setOpen}
          onClose={() => this.handleSnackBarClose()}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={<span id="message-id">Signed out in 5 mins</span>}
          action={[
            <Button
              key="continue"
              color="secondary"
              size="small"
              onClick={() => this.handleSnackBarClose()}
              type="button">
              Continue?
            </Button>,
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={() => this.handleSnackBarClose()}
              type="button">
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </Grid>
    );
  }
}

function mapStateToProps(state, ownProps): Object {
  return {
    views: state.views.views,
    //userProfile: state.app.userProfile,
    //allBucketsInfo: state.app.allBucketsInfo
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(withStyles(useStyles)(Content));
