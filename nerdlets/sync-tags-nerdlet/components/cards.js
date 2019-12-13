import React from 'react';
import { Card, Label, Icon, Menu, Divider, Header, Dropdown, Grid, Checkbox, Button, Loader, GridRow } from 'semantic-ui-react';
import { navigation } from 'nr1';
import { filterData, updateAllCheckedFlags } from '../helpers/utils';
import Summary from './summary';

export default class Cards extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            presentationData: this.props.data,
            filters: {
                syncedDataOnly: false,
                notSyncedDataOnly:false
            },
            selectedApps: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.onActionSelect = this.onActionSelect.bind(this);
    }

    openEntity(guid){
        navigation.openStackedEntity(guid)
    }

    transformToDropdown(values) {
        const newValues = [...new Set(values)]
        return  newValues.map(val => {return {key: val, text: val, value: val}})
    }

    onAppSelect(hostIndex,appIndex,e) {
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
            console.log(selectedApps)
            host.apmApps.splice(appIndex,1,app);
            entities.details.splice(hostIndex,1,host);
            this.setState({presentationData:entities, selectedApps}, () => console.log(this.state.selectedApps));
            console.log("unchecked");
        }
        console.log(hostIndex);
        console.log(appIndex);
    }

    handleChange(e,props) {
        const data = this.props.data;
        const filters = this.state.filters;
        filters[props.name] = props.value || props.checked;
        const filteredData = filterData(data, filters);
        updateAllCheckedFlags(filteredData, false);
        this.setState({presentationData:filteredData, filters, selectedApps:[]});
    }

    onActionSelect(e, props) {
        const entities = this.state.presentationData;
        if(props.value === 'sync') {
            //TODO Mutation goes here and create Modal before
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
            // TODO Modal with details  
        }
    }

    actionsDropdown() {
        const options = [
            { key: 'sync', icon: 'sync', text: 'Sync Your Applications Tags', value: 'sync' },
            { key: 'selectAll', icon: 'add', text: 'Select All Apps', value: 'selectAll' },
            { key: 'deselectAll', icon: 'delete', text: 'Deselect All Apps', value: 'deselectAll' },
            { key: 'help', icon: 'help', text: 'Help', value: 'help' },
        ];
      return ( 
        <Dropdown
        icon='cog'
        floating
        button
        className='icon'
      >
        <Dropdown.Menu>
          <Dropdown.Header content='Choose Your Action' />
          {options.map((option) => (
            <Dropdown.Item key={option.value} {...option} onClick={this.onActionSelect}/>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      );
    }

    render() {
        const { header, summary, details } = this.state.presentationData;
            return ( <div style={{margin:"40px"}}>
                    <Grid columns='equal' style={{margin:"40px 40px 0px 40px"}}>
                        <Grid.Row>
                            <Grid.Column>
                                <Dropdown
                                placeholder='NR Account'
                                name='account'
                                fluid
                                multiple
                                search
                                selection
                                onChange={this.handleChange}
                                options={this.transformToDropdown(header.accounts)}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown
                                placeholder='AWS Region'
                                name='aws.awsRegion'
                                fluid
                                multiple
                                search
                                selection
                                onChange={this.handleChange}
                                options={this.transformToDropdown(header.awsRegions)}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown
                                placeholder='AWS Availability Zone'
                                name='aws.awsAvailabilityZone'
                                fluid
                                multiple
                                search
                                selection
                                onChange={this.handleChange}
                                options={this.transformToDropdown(header.awsAZs)}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown
                                placeholder='AWS Subnet'
                                name='aws.ec2SubnetId'
                                fluid
                                multiple
                                search
                                selection
                                onChange={this.handleChange}
                                options={this.transformToDropdown(header.awsSubnets)}
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <GridRow style={{justifyContent: 'flex-end'}}>
                        <Menu secondary style={{marginBottom:"50px",marginTop:"0px"}}>
                        <Menu.Menu position='right'>
                        <Menu.Item>
                            <Checkbox label='Show data in sync only' name='syncedDataOnly' toggle onChange={this.handleChange} />
                        </Menu.Item>
                        <Menu.Item>
                            <Checkbox label='Show data not in sync only' name ='notSyncedDataOnly' toggle onChange={this.handleChange} />
                        </Menu.Item>
                        <Menu.Item>
                            {this.actionsDropdown()}
                        </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                        </GridRow>
                    </Grid>
                    
                <Divider horizontal>
                <Header as='h4'>
                    <Icon name='clipboard check' />
                    Summary
                </Header>
                </Divider>
                <Summary data={summary}/>
                <Divider horizontal>
                <Header as='h4'>
                    <Icon name='eye' />
                    Details
                </Header>
                </Divider>
                <Card.Group>
                    {details.map((host,i) => 
                        <Card key={i} style={{marginRight:"20px"}}>
                        <Card.Content style={{position:'relative'}}>
                            <div style={{display:'flex',justifyContent:'space-between'}}>
                            <Card.Header>{host.name}</Card.Header>
                            <Icon link name='server' onClick={() => this.openEntity(host.guid)}/>
                            </div>
                            <Card.Meta style={{marginBottom:"15px"}}>{host.account}</Card.Meta>
                            <Card.Description>
                            {Object.keys(host.tags).map((key,i) => 
                                <Label key={i} style={{margin:"5px", fontSize:"10px"}} tag color='teal'>
                                    {`${key}:${host.tags[key]}`}
                                </Label>
                            )}
                            </Card.Description>
                        </Card.Content>
                        {
                            host.apmApps.map((apmApp,j) => 
                                <Card.Content key={j}>
                                    {apmApp.isInSync ? 
                                        <Label color='green' style={{marginBottom:"15px"}} ribbon>Tags are in sync</Label> :
                                        <Label color='red' style={{marginBottom:"15px"}} ribbon>Tags are not in sync</Label>
                                    }
                                    <input style={{position:'absolute', right:'15px'}} type="checkbox" checked={apmApp.checked} onChange={(e) => this.onAppSelect(i,j,e)} />
                                    <div style={{display:'flex',justifyContent:'space-between'}}>
                                    <Card.Header>{apmApp.name}</Card.Header>
                                    <Icon link name='sitemap' onClick={() => this.openEntity(apmApp.guid)}/>
                                    </div>
                                    <Card.Description>
                                    {Object.keys(apmApp.tags).map((key,i) => 
                                        <Label key={i} style={{margin:"5px", fontSize:"10px"}} tag color='blue'>
                                            {`${key}:${apmApp.tags[key]}`}
                                        </Label>
                                    )}
                                    </Card.Description>
                                </Card.Content>
                            )
                        }
                        </Card>
                    )}
                </Card.Group>
            </div>
        );
        }
}