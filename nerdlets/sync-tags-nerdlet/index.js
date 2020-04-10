import React from 'react';
import { EC2_HOSTS_WITH_APPS, fetchApps } from './helpers/queries';
import { getHostTagValue, formatData } from './helpers/utils';
import { Loader, Header } from 'semantic-ui-react';
import { Toast, NerdGraphQuery } from 'nr1';
import { filterData, updateAllCheckedFlags } from './helpers/utils';
import Summary from './components/summary';
import ModalMsg from './components/modalMsg';
import Filters from './components/filters';
import Details from './components/details';
import { tagsMutate } from './helpers/tagsMutation';

export default class SyncTags extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loadingState: true,
            loadError: false,
            hosts: null,
            presentationData: null,
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

    async componentDidMount() {
        await this.loadData();
        /* eslint-disable no-console */
        console.log("Fetched all hosts data with services")
        /* eslint-enable no-console */
        this.getAppsData([...this.state.hosts]) // Get a Shallow copy of this.state.hosts
    }

    async loadData() {
        const res = await NerdGraphQuery.query({
          query: EC2_HOSTS_WITH_APPS,
        })
        const { loading, data, errors } = res;
        if (loading) {
          return;
        }
        if (errors) {
          /* eslint-disable no-console */
          console.log('Hosts query error', errors);
          /* eslint-enable no-console */
          this.setState({loadError: true, loadingState: false})
          return;
        }
        if (data) {
          const entities = data.actor.entitySearch.results.entities;
          const cursor = data.actor.entitySearch.results.nextCursor;
          this.setState({hosts:entities});
          if (cursor) {
            await this.getMoreEntityData(cursor);
          }
        }
    };
    
    async getMoreEntityData(cursor) {
        const res = await NerdGraphQuery.query({
          query: EC2_HOSTS_WITH_APPS,
          variables: { queryCursor: cursor },
        })
        const { loading, data, errors } = res;
        if (loading) return;
        if (errors) {
            /* eslint-disable no-console */
            console.log('Hosts "query more" error', errors);
            /* eslint-enable no-console */
            this.setState({loadError: true, loadingState: false})
            return;
        }
        if (data) {
            const entities = this.state.hosts;
            entities.push(...data.actor.entitySearch.results.entities);
            const cursor = data.actor.entitySearch.results.nextCursor;
            this.setState({hosts:entities});
            if (cursor) {
                await this.getMoreEntityData(cursor);
            }
        }
      };
    
    getAppsData(entities) {
        const promises = [];
        const uniqueQ = [];
        entities.forEach(host => {
            host['apmApps']=[];
            const appNames = getHostTagValue(host, 'apmApplicationNames').split('|').filter(val=>val);
            appNames.forEach(appName => {
                const query = fetchApps(appName, host.accountId);
                if(!uniqueQ.includes(query)) {
                    promises.push(NerdGraphQuery.query({query}));
                    uniqueQ.push(query);
                }
            })
        })
        Promise.all(promises).then(values => {
            values.forEach(value => {
                let service = value.data.actor.entitySearch.results.entities[0]; // We get always 1 entity giving the account Id and the app name
                entities.forEach(host => {
                    const appNames = getHostTagValue(host, 'apmApplicationNames').split('|').filter(val=>val);
                    appNames.forEach(appName => {
                        if (service && host.accountId === service.accountId && appName === service.name) {
                            host['apmApps'].push(service);
                        }
                    })
                })
            })
            const formattedData = formatData(entities);
            this.setState({hosts:formattedData, presentationData:formattedData, loadingState: false});
            console.log("Search completed")
        })
        .catch((error) => {
            /* eslint-disable no-console */
            console.log('Apps tags query error', error)
            /* eslint-enable no-console */
            this.setState({loadError: true, loadingState: false})
        });
    };

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
        const data = this.state.hosts;
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
                });
            }
        } else if(props.value === 'selectAll') {
            let allApps = entities.details.map(host => host.apmApps.map(app => ({appGuid: app.guid, appTags: app.tags, hostTags: host.tags}))).flat();
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

    async modalHandler() {
        if(this.state.showHelpMsg) {
            this.setState({showHelpMsg:false});
        }
        if(this.state.showSyncMsg) {
            this.setState({showSyncMsg:false});
        }
        if(this.state.isUpdateComplete) {
            this.setState({isUpdateComplete:false});
            // refresh the data
            this.setState({ loadingState: true, loadError: false, hosts: null, presentationData: null, selectedApps: [], 
                filters: {syncedDataOnly: false,notSyncedDataOnly:false} }); 
            await this.loadData();
            this.getAppsData([...this.state.hosts])
        }
    }

    updateTags() {
        this.setState({showSyncMsg: false, isUpdating: true});  
        tagsMutate(this.state.selectedApps).then(results => {
            results.forEach(result => {
                if (typeof result === 'string' && result.startsWith('ERROR')) {
                    console.log(result);
                    Toast.showToast({
                        title: 'Errors detected',
                        description: 'Please check your browser console!!',
                        type: Toast.TYPE.CRITICAL
                    });
                }
            });
            this.setState({isUpdating: false, isUpdateComplete: true});
        });
    }

    render() {
        const {loadError, loadingState, hosts, isUpdating, presentationData} = this.state;
        console.log(hosts)
        if (loadingState) {
            return (
                <Loader active size='large'>Checking your New Relic entities across all your accounts, this might take a while...</Loader>
            );
        }
        if (loadError) {
            return (
                <Header as='h3' className='centered' color='red'>
                    An error occurred while loading data. Please check your browser
                    console.
                </Header> 
            );
        }
        if (!hosts) {
            return (
                <Header as='h3' className='centered'>
                    Oops! it seems like you don't have any EC2 instances with running services.
                    Are you monitoring both your EC2 instances and services with NR?
                </Header> 
            );
        }
        if (isUpdating) {   
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
                    data={presentationData.header}
                    onChange={this.filterChange}
                    onActionClick={this.onActionSelect}
                />
                <Summary 
                    data={presentationData.summary}
                />
                <Details 
                    data={presentationData.details}
                    onAppSelect={this.onAppSelect}
                />
            </div>
        );
    }
}
