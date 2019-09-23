import React, {useEffect} from "react";
import {Meteor} from "meteor/meteor";
import MaterialTable from "material-table";
import {withTracker} from "meteor/react-meteor-data";
import {Companies} from "../../../../api/companies/companies";
import {Projects} from "../../../../api/projects/projects";

function CompaniesControlPanel(props) {
    if (!props.currentCompany){
        return <div></div>
    }
    const [companies, setCompanies] = React.useState({});
    const [state, setState] = React.useState({
        columns: [
            {title: 'FirstName', field: 'firstName', editable: 'onAdd'},
            {title: 'LastName', field: 'lastName', editable: 'onAdd'},
            {title: 'Email', field: 'email', editable: 'onAdd'},
            {title: 'CurrentRole', field: 'currentRole', editable: 'never'},
            {
                title: 'Assign Role',
                field: 'role',
                lookup: {
                    admin: 'Admin',
                    noRole: 'No Role',
                },
            },
        ],
        data: props.currentCompany.peoplesDetails.map(user => {
            return {
                _id: user._id,
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                email: user.emails[0].address,
                role: props.currentCompany.admins.includes(user._id) ? 'admin' :  'noRole',
                currentRole: props.currentCompany.admins.includes(user._id) ? 'admin' :  'noRole'
            }
        })
    });



    useEffect(() => {
    });


    return (
        <MaterialTable
            title="Control Panel"
            columns={state.columns}
            options={{
                actionsColumnIndex: -1
            }}
            data={state.data}
            editable={{
                onRowAdd: newData => {
                    return new Promise((resolve, reject) => {
                        let company ={
                            _id : props.currentCompany._id
                        };
                        newData.role === 'admin' && (company.role = 'admin');
                        let profile = {
                            firstName: newData.firstName,
                            lastName: newData.lastName
                        };
                        Meteor.call('users.inviteNewUser', {
                            profile, email: newData.email,
                            company
                        }, (err, res) => {
                            if(err){
                                reject("Email already exists");
                                return false;
                            }
                            else{
                                resolve();
                                const data = [...state.data];
                                newData.currentRole = newData.role;
                                newData._id = res;
                                data.push(newData);
                                setState({...state, data});
                            }

                        })
                    })
                },

                onRowUpdate: (newData, oldData) => {
                    return new Promise((resolve, reject) => {
                        let params = {
                            companyId: props.currentCompany._id,
                            userId: newData._id,
                            role: newData.role
                        };
                        Meteor.call('users.updateRole', params, (err, res) => {
                            if (err) {
                                reject("Email already exists");
                                return false;
                            }
                            else {
                                resolve();
                                const data = [...state.data];
                                newData.currentRole = newData.role;
                                data[data.indexOf(oldData)] = newData;
                                setState({...state, data});
                            }

                        })
                    })
                },
                onRowDelete: oldData => {
                    return new Promise((resolve, reject) => {
                        let params = {
                            companyId: props.currentCompany._id,
                            userId: oldData._id,
                        };
                        Meteor.call('users.removeCompany', params, (err, res) => {
                            if (err) {
                                reject("No User Found");
                                return false;
                            }
                            else {
                                resolve();
                                const data = [...state.data];
                                data.splice(data.indexOf(oldData), 1);
                                setState({ ...state, data });
                            }

                        })
                    })
                }
            }}
        />
    );
}


const CompaniesControlPanelPage = withTracker(props => {
    // Do all your reactive data access in this method.
    // Note that this subscription will get cleaned up when your component is unmounted
    // const handle = Meteor.subscribe('todoList', props.id);
    Meteor.subscribe('compoundCompanies');
    Meteor.subscribe('projects');
    // let { parentProps } = props;
    let local = LocalCollection.findOne({
        name: 'localCompanies'
    });

    const currentCompany = Companies.findOne({_id: local.id});

    return {
        companies: Companies.find({}).fetch(),
        projects: Projects.find({}).fetch(),
        currentCompany,
    };
})(CompaniesControlPanel);

export default CompaniesControlPanelPage