import React from 'react';
import { Loader } from 'semantic-ui-react';
import { Toast, NerdGraphQuery } from 'nr1';
import { filterData, updateAllCheckedFlags } from '../helpers/utils';
import Summary from './summary';
import ModalMsg from './modalMsg';
import Filters from './filters';
import Details from './details';
import { addTags } from '../helpers/tagsMutation';

export default class Cards extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            presentationData: this.props.data,
            filters: {
                syncedDataOnly: false,
                notSyncedDataOnly:false
            },
            selectedApps: [],
            showHelpMsg: false,
            showSyncMsg: false,
            isUpdating: false,
            isUpdateComplete: false
        };
        this.filterChange = this.filterChange.bind(this);
        this.onActionSelect = this.onActionSelect.bind(this);
        this.modalHandler = this.modalHandler.bind(this);
        this.updateTags = this.updateTags.bind(this);
    }

    onAppSelect = (hostIndex,appIndex,e) => {
        console.log(e);
        if(e.target.checked) {
            const entities = this.state.presentationData;
            const selectedApps = this.state.selectedApps;

            const host = entities.details[hostIndex];
            const app = host.apmApps[appIndex];
            app.checked = true;
            selectedApps.push({appGuid: app.guid, appTags: app.tags, hostTags: host.tags});
            host.apmApps.splice(appIndex,1,app);
            entities.details.splice(hostIndex,1,host);
            this.setState({presentationData:entities, selectedApps}, () => console.log(selectedApps));
            console.log("checked");

        } else {
            const entities = this.state.presentationData;

            const host = entities.details[hostIndex];
            const app = host.apmApps[appIndex];
            app.checked = false;
            const selectedApps = this.state.selectedApps.filter(sel => sel.appGuid !== app.guid);
            console.log(selectedApps);
            host.apmApps.splice(appIndex,1,app);
            entities.details.splice(hostIndex,1,host);
            this.setState({presentationData:entities, selectedApps}, () => console.log(this.state.selectedApps));
            console.log("unchecked");
        }
        console.log(hostIndex);
        console.log(appIndex);
    }

    filterChange(e,props) {
        const data = this.props.data;
        const filters = this.state.filters;
        filters[props.name] = props.value || props.checked;
        console.log(filters);
        console.log(props);
        const filteredData = filterData(data, filters);
        updateAllCheckedFlags(filteredData, false);
        this.setState({presentationData:filteredData, filters, selectedApps:[]});
    }

    onActionSelect(e,props) {
        const entities = this.state.presentationData;
        if(props.value === 'sync') {
            if(this.state.selectedApps.length){
                this.setState({showSyncMsg:true});
            } else {
                Toast.showToast({
                    title: 'Nothing to sync',
                    description: 'Please Select at least 1 application!!',
                    type: Toast.TYPE.CRITICAL
                })
            }
        } else if(props.value === 'selectAll') {
            let allApps = entities.details.map(host => host.apmApps.map(app => ({appGuid: app.guid, appTags: app.tags, hostTags: host.tags}))).flat();
            // Remove duplicates
            allApps = allApps.filter((app, i, self) => i === self.findIndex(v => v.appGuid === app.appGuid));
            // Update flags for checkbox
            updateAllCheckedFlags(entities, true);
            this.setState({selectedApps: allApps, presentationData:entities}, () => {console.log(this.state.selectedApps);console.log(this.state.presentationData)});
        } else if(props.value === 'deselectAll') {
            updateAllCheckedFlags(entities, false);
            this.setState({selectedApps: [], presentationData:entities},() => {console.log(this.state.selectedApps);console.log(this.state.presentationData)});
        } else if(props.value === 'help') {
            this.setState({showHelpMsg:true});
        }
    }

    modalHandler() {
        if(this.state.showHelpMsg) {
            this.setState({showHelpMsg:false});
        }
        if(this.state.showSyncMsg) {
            this.setState({showSyncMsg:false});
        }
        if(this.state.isUpdateComplete) {
            this.setState({isUpdateComplete:false});
            // TODO refresh the data
        }
    }

    updateTags() {
        //this.setState({showSyncMsg: false, isUpdating: true}); PUT BACKKK
        this.setState({showSyncMsg: false});
        //setTimeout(() => {
            console.log('Mutation goes here'); 
            //addTags();
          //}, 3000);
    }

    render() {
        const { header, summary, details } = this.state.presentationData;
            if(this.state.isUpdating) {
                return (
                    <Loader active size='large'>Updating services tags, this might take a while...</Loader>
                );
            }
        return ( 
            <div style={{margin:"40px"}}>
                <ModalMsg 
                    help={this.state.showHelpMsg} 
                    sync={this.state.showSyncMsg} 
                    refresh={this.state.isUpdateComplete}
                    nbApps={this.state.selectedApps.length}
                    onClose={this.modalHandler} 
                    onUpdate={this.updateTags}
                />
                
                <Filters 
                    data={header}
                    onChange={this.filterChange}
                    onActionClick={this.onActionSelect}
                />
                <Summary 
                    data={summary}
                />
                <Details 
                    data={details}
                    onAppSelect={this.onAppSelect}
                />
            </div>
        );
    }
}