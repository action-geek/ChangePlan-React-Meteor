import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';

import {Companies} from "/imports/api/companies/companies";
import {Projects} from "/imports/api/projects/projects";

import {withTracker} from "meteor/react-meteor-data";
import {Meteor} from "meteor/meteor";
import ControlledOpenSelect from '/imports/ui/components/admin/control-panel/selectionModal'
import ProjectsControlPanel from '/imports/ui/components/admin/control-panel/projectsSettings'
import GeneralSettings from "../admin/control-panel/GeneralSettings";
import SideMenu from "../App/SideMenu";


function TabPanel(props) {
  const {children, value, index, ...other} = props;
  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

function FullWidthTabs(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [companies, setCompanies] = React.useState([]);
  const [value, setValue] = React.useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  const userId = Meteor.userId();

  useEffect(() => {
    if (props.companies && isSuperAdmin) {
      setCompanies(props.companies)
    } else if (props.companies) {
      setCompanies(props.companies.filter(company => company.peoples.includes(userId)))
    }
  }, [props.companies, isSuperAdmin]);

  useEffect(() => {
    if (Roles.userIsInRole(userId, 'SuperAdmin')) {
      setIsSuperAdmin(true);
    }
  }, [userId]);

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  function handleChangeIndex(index) {
    setValue(index);
  }

  return (
    <div className={classes.root}>
      <SideMenu {...props}/>
      <main className={classes.content}>
        <div className={classes.toolbar}/>
        <Divider/>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="full width tabs example"
          >
            <Tab label="Projects" {...a11yProps(0)} />
            <Tab label="General Settings" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          <TabPanel value={value} index={0} dir={theme.direction}>
            <br/>
            {companies ? <ControlledOpenSelect {...props} title="Companies" entity="Company" entities={companies}
                                               localCollection="localCompanies" id="companyId"/> : ''}
            <br/>
            <ProjectsControlPanel {...props}/>
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>
            <br/>
            <GeneralSettings {...props}/>
          </TabPanel>
        </SwipeableViews>
      </main>
    </div>
  );
}


const ControlPanelPage = withTracker(props => {
  Meteor.subscribe('companies');
  Meteor.subscribe('projects');

  return {
    companies: Companies.find({}).fetch(),
    projects: Projects.find({}).fetch()
  };
})(FullWidthTabs);

export default ControlPanelPage