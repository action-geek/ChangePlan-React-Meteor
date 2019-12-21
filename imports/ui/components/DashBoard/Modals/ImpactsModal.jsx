import React, {useEffect, useState} from 'react';
import {withStyles, makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import {withSnackbar} from 'notistack';
import 'date-fns';
import Grid from "@material-ui/core/Grid/Grid";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import SaveChanges from "../../Modals/SaveChanges";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {withTracker} from "meteor/react-meteor-data";
import SelectStakeHolders from "../../Activities/Modals/SelectStakeHolders";
import {Companies} from "../../../../api/companies/companies";
import {Peoples} from "../../../../api/peoples/peoples";
import {withRouter} from "react-router";

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const useStyles = makeStyles(theme => ({
  createNewProject: {
    flex: 1,
    marginLeft: 15,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
}));

const DialogTitle = withStyles(styles)(props => {
  const {children, classes, onClose} = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon/>
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  }
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);


function AddImpact(props) {
  let { open, handleModalClose, project, indexImpact, editValue, template, currentType, stakeHoldersImpacts, localImpacts } = props;
  const [name, setName] = React.useState('');
  const [expectedDateOpen, setExpectedDateOpen] = useState(false);
  const [peoples, setPeoples] = useState([]);
  const [type, setType] = React.useState('');
  const [level, setLevel] = React.useState('');
  const [typeOpen, seTypeOpen] = React.useState(false);
  const [levelOpen, setLevelOpen] = React.useState(false);
  const [showModalDialog, setShowModalDialog] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [impacts, setImpacts] = useState([]);
  const [expectedDate, setExpectedDate] = useState(null);


  useEffect(() => {
    if (project && currentType === 'project') {
      setImpacts(project.impacts)
    } else if (template && currentType === 'template') {
      setImpacts(template.impacts)
    }
  }, [project.impacts, template.impacts]);

  const classes = useStyles();
  const modalName = 'impacts';

  const handleClose = () => {
    handleModalClose(modalName);
    setName('');
    setType('');
    setLevel('');
    setExpectedDate(null);
    updateFilter('localStakeHoldersImpacts', 'changed', false);
    setShowModalDialog(false);
    setIsUpdated(false);
  };

  const handleOpenModalDialog = () => {
    if (isUpdated) {
      setShowModalDialog(true);
    }
  };


  const closeModalDialog = () => {
    setShowModalDialog(false);
  };

  const handleExpectedDate = date => {
    setExpectedDate(date);
    setIsUpdated(true);
    setExpectedDateOpen(false);
  };

  const openExpectedDatePicker = () => {
    setExpectedDateOpen(true)
  };

  const updateValues = () => {
    if (indexImpact !== '') {
      const newStakeholders = impacts && impacts[indexImpact].stakeholders;
      localImpacts.changed || updateFilter('localStakeHoldersImpacts', 'ids', newStakeholders);
      if (localImpacts.changed) {
        setIsUpdated(true)
      }
      const newExpectedDate = impacts && impacts[indexImpact].expectedDate;
      setExpectedDate(newExpectedDate);
      let updatedStakeHolders = localImpacts.changed ? localImpacts.ids : newStakeholders;
      setPeoples(updatedStakeHolders);
    } else {
      let updatedStakeHolders = localImpacts.changed ? localImpacts.ids : [];
      setPeoples(updatedStakeHolders);
      updateFilter('localStakeHoldersImpacts', 'ids', updatedStakeHolders);
    }
  };

  useEffect(() => {
    updateValues();
  }, [indexImpact, stakeHoldersImpacts]);

  const createProject = () => {
    if (!(name && type && level)) {
      props.enqueueSnackbar('Please fill the required Field', {variant: 'error'});
      return false;
    }
    let impactObj = {
      expectedDate,
      type,
      level,
      description: name,
      stakeholders: peoples,
    };

    let newImpacts = impacts;
    if (currentType === 'project') {
    if (indexImpact !== '') {
      newImpacts[indexImpact] = impactObj;
      setImpacts(newImpacts);
    } else {
      newImpacts = project.impacts ? project.impacts.concat(impactObj) : [impactObj];
      setImpacts(newImpacts);
    }

    delete project.changeManagerDetails;
    delete project.managerDetails;
    delete project.peoplesDetails;
    let params = {
      ...project,
      impacts: newImpacts,
    };

    Meteor.call('projects.update', {project: params}, (err, res) => {
      if (err) {
        props.enqueueSnackbar(err.reason, {variant: 'error'})
      } else {
        handleClose();
        setName('');
        setExpectedDate(null);
        props.enqueueSnackbar('Project Updated Successfully.', {variant: 'success'})
      }
    })
    } else if (currentType === 'template') {

      if (indexImpact !== '') {
        newImpacts[indexImpact] = impactObj;
        setImpacts(newImpacts);
      } else {
        newImpacts = template.impacts ? template.impacts.concat(impactObj) : [impactObj];
        setImpacts(newImpacts);
      }

      let params = {
        ...template,
        impacts: newImpacts,
      };

      Meteor.call('templates.update', {template: params}, (err, res) => {
        if (err) {
          props.enqueueSnackbar(err.reason, {variant: 'error'})
        } else {
          handleClose();
          setName('');
          setExpectedDate(null);
          props.enqueueSnackbar('Template Updated Successfully.', {variant: 'success'})
        }
      })
    }
  };

  const handleChange = (e) => {
    setName(e.target.value);
    setIsUpdated(true);
  };

  function handleLevelChange(event) {
    setLevel(event.target.value);
    setIsUpdated(true);
  }

  function handleTypeChange(event) {
    setType(event.target.value);
    setIsUpdated(true);
  }

  function handleTypeClose() {
    seTypeOpen(false);
  }

  function handleTypeOpen() {
    seTypeOpen(true);
  }

  function handleLevelOpen() {
    setLevelOpen(true);
  }

  function handleLevelClose() {
    setLevelOpen(false);
  }

  useEffect(() => {
    setType(editValue.type);
    setLevel(editValue.level);
    setName(editValue.description);
  }, [editValue]);

  return (
    <div className={classes.createNewProject}>
      <Dialog onClose={isUpdated ? handleOpenModalDialog : handleClose} aria-labelledby="customized-dialog-title"
              open={open} maxWidth="md" fullWidth={true}>
        <DialogTitle id="customized-dialog-title" onClose={isUpdated ? handleOpenModalDialog : handleClose}>
          Add a Project Impact
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <br/>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  fullWidth
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin="normal"
                  id="date-picker-inline"
                  label="Expected Date"
                  value={expectedDate}
                  autoOk={false}
                  open={expectedDateOpen}
                  onClick={openExpectedDatePicker}
                  onChange={handleExpectedDate}
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                />
              </MuiPickersUtilsProvider>
              <br/>
              <br/>
              <br/>
            </Grid>
            <Grid item xs={6}>
              <br/>
              <Typography className={classes.heading}>Stakeholders</Typography>
              <Typography className={classes.secondaryHeading}>
                {peoples && peoples.length || 0} of {stakeHoldersImpacts.length}
              </Typography>
              <SelectStakeHolders rows={stakeHoldersImpacts} local={localImpacts} isImpacts={true} isBenefits={false}/>
              <br/>
              <br/>
              <br/>
            </Grid>
            <Grid item xs={6}>
              <br/>
              <FormControl className={classes.formControl} fullWidth={true}>
                <InputLabel htmlFor="demo-controlled-open-select"
                            required={true}>Type</InputLabel>
                <Select
                  id="type"
                  label="type"
                  fullWidth={true}
                  open={typeOpen}
                  onClose={handleTypeClose}
                  onOpen={handleTypeOpen}
                  value={type}
                  onChange={handleTypeChange}
                  inputProps={{
                    name: 'type',
                    id: 'demo-controlled-open-select',
                  }}
                >
                  <MenuItem value='process'>Process</MenuItem>
                  <MenuItem value='technology'>Technology</MenuItem>
                  <MenuItem value='people'>People</MenuItem>
                  <MenuItem value='organization'>Organization</MenuItem>
                </Select>
              </FormControl>
              <br/>
              <br/>
              <br/>
            </Grid>
            <Grid item xs={6}>
              <br/>
              <FormControl className={classes.formControl} fullWidth={true}>
                <InputLabel htmlFor="demo-controlled-open-select"
                            required={true}>Level</InputLabel>
                <Select
                  id="level"
                  label="level"
                  fullWidth={true}
                  open={levelOpen}
                  onClose={handleLevelClose}
                  onOpen={handleLevelOpen}
                  value={level}
                  onChange={handleLevelChange}
                  inputProps={{
                    name: 'level',
                    id: 'demo-controlled-open-select',
                  }}
                >
                  <MenuItem value='high'>High</MenuItem>
                  <MenuItem value='medium'>Medium</MenuItem>
                  <MenuItem value='low'>Low</MenuItem>
                </Select>
              </FormControl>
              <br/>
              <br/>
              <br/>
            </Grid>
            <Grid item xs={12}>
              <TextField
                // margin="dense"
                id="name"
                label="Description"
                value={name}
                onChange={handleChange}
                required={true}
                type="text"
                fullWidth={true}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={createProject} color="primary">
            Save
          </Button>
        </DialogActions>
        <SaveChanges
          handleClose={handleClose}
          showModalDialog={showModalDialog}
          handleSave={createProject}
          closeModalDialog={closeModalDialog}
        />
      </Dialog>
    </div>
  );
}

const AddImpactPage = withTracker(props => {
  let localImpacts = LocalCollection.findOne({
    name: 'localStakeHoldersImpacts'
  });
  Meteor.subscribe('companies');
  let company = Companies.findOne() || {};
  let companyId = company._id || {};
  Meteor.subscribe('peoples', companyId);
  return {
    stakeHoldersImpacts: Peoples.find().fetch(),
    localImpacts,
    company
  };
})(withRouter(AddImpact));

export default withSnackbar(AddImpactPage)