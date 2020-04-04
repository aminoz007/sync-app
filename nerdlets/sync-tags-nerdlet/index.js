import React from 'react';
import { NerdGraphQuery } from 'nr1';
import Cards from './components/cards';
import { EC2_HOSTS_WITH_APPS, fetchApps } from './helpers/queries';
import { getHostTagValue, formatData } from './helpers/utils';
import { Loader, Header } from 'semantic-ui-react';

export default class SyncTags extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loadingState: true,
            loadError: false,
            hosts: null
        }
        this.refreshData = this.refreshData.bind(this);
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
                        if (host.accountId === service.accountId && appName === service.name) {
                            host['apmApps'].push(service);
                        }
                    })

                })
            })
            this.setState({hosts:formatData(entities), loadingState: false});
            console.log("Search completed")
        })
        .catch((error) => {
            /* eslint-disable no-console */
            console.log('Apps tags query error', error)
            /* eslint-enable no-console */
            this.setState({loadError: true, loadingState: false})
        });
    };

    render() {
        const {loadError, loadingState, hosts} = this.state;
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
        return <Cards data={hosts}/>;
    }
}
