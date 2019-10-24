import React from 'react';
import { Card, Label, Icon, Menu, Divider, Header, Dropdown, Grid, Checkbox,Button } from 'semantic-ui-react';
import { navigation, NerdGraphQuery } from 'nr1';

export default class CardSync extends React.Component {

    constructor(props) {
        super(props)
        this.state ={
            entities: []
        }
    }

    findNested (obj, key) {
        if (obj.hasOwnProperty(key))
            return obj[key];
    
        var res = [];
        Object.keys(obj).forEach(k => {
            let v = obj[k]
            if (typeof v == "object" && (v = this.findNested(v, key)).length)
                res.push.apply(res, v);
        });
    
        return res;
    }

    componentDidMount() {
        const { data } = this.props
        const promises = []
        const uniqueQ = []
        data.forEach(host => {
            if(host.apmApplicationNames) {
                host['apmApps']=[]
                const appNames = host.apmApplicationNames.split('|').filter(val=>val)
                appNames.forEach(appName => {
                    const query = `{
                        actor {
                          entitySearch(query: "domain in ('APM') and type in ('APPLICATION') and name='${appName}' and accountId='${host.accountId}'") {
                            results {
                              entities {
                                accountId
                                name
                                guid
                                tags {
                                  key
                                  values
                                }
                              }
                            }
                          }
                        }
                      }`
                    if(!uniqueQ.includes(query)) {
                        promises.push(NerdGraphQuery.query({query}))
                        uniqueQ.push(query)
                    }
                })
            }
        })
        Promise.all(promises).then(values => {
            values.forEach(value => {
                let dataResult = this.findNested(value, 'entities') 
                data.forEach(host => {
                    if(host.apmApplicationNames) {
                        const appNames = host.apmApplicationNames.split('|').filter(val=>val)
                        appNames.forEach(appName => {
                            if (host.accountId === dataResult[0].accountId && appName===dataResult[0].name) {
                                host['apmApps'].push(dataResult[0])
                            }
                        })
                    }
                })
            })
            this.setState({entities:data})
        })
        .catch((error) => console.log(error))
    }

    openEntity(guid){
        navigation.openEntity(guid)
    }

    transformToDropdown(values) {
        const newValues = [...new Set(values)]
        return  newValues.map(val => {return {key: val, text: val, value: val}})
    }

    onCardClick(hostData) {
        console.log(hostData)
    }

    render() {
        const { entities } = this.state
        return ( <div style={{margin:"40px"}}>
                    <Grid columns='equal' style={{margin:"40px 40px 0px 40px"}}>
                        <Grid.Row>
                            <Grid.Column>
                                <Dropdown
                                placeholder='NR Account'
                                fluid
                                multiple
                                search
                                selection
                                options={this.transformToDropdown(entities.map(host => host.account))}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown
                                placeholder='AWS Region'
                                fluid
                                multiple
                                search
                                selection
                                options={this.transformToDropdown(entities.map(host => host.awsRegion))}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown
                                placeholder='AWS Availability Zone'
                                fluid
                                multiple
                                search
                                selection
                                options={this.transformToDropdown(entities.map(host => host.awsAvailabilityZone))}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown
                                placeholder='AWS Subnet'
                                fluid
                                multiple
                                search
                                selection
                                options={this.transformToDropdown(entities.map(host => host.ec2SubnetId))}
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    <Menu secondary style={{marginBottom:"50px",marginTop:"0px"}}>
                        <Menu.Menu position='right'>
                        <Menu.Item>
                            <Checkbox label='Show only unsynced entities' toggle />
                        </Menu.Item>
                        <Menu.Item>
                            <Checkbox label='Show only hosts with APM apps' toggle />
                        </Menu.Item>
                        <Menu.Item>
                            <Button.Group>
                                <Button
                                basic
                                content='Update selected entities'
                                />
                                <Button.Or />
                                <Button
                                basic
                                content='Update all filtered entities'
                                />
                            </Button.Group>
                        </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                <Divider horizontal>
                <Header as='h4'>
                    <Icon name='clipboard check' />
                    Summary
                </Header>
                </Divider>
              <Menu compact style={{marginBottom:"40px", marginTop:"25px"}}>
                <Menu.Item>
                <Icon name='server' /> Number of running EC2
                <Label color='teal' floating>
                    1207
                </Label>
                </Menu.Item>
                <Menu.Item>
                <Icon name='sitemap' /> Number of services deployed in EC2
                <Label color='blue' floating>
                    500
                </Label>
                </Menu.Item>
                <Menu.Item>
                <Icon name='tag' /> Number of apps labels not in sync
                <Label color='red' floating>
                    300
                </Label>
                </Menu.Item>
                <Menu.Item>
                <Icon name='tag' /> Number of apps labels in sync
                <Label color='green' floating>
                    200
                </Label>
                </Menu.Item>
            </Menu>
            <Divider horizontal>
            <Header as='h4'>
                <Icon name='eye' />
                Details
            </Header>
            </Divider>
            <Card.Group>
                {entities.map((host,i) => 
                    <Card key={i} style={{marginRight:"20px"}} as='a' onClick={() => this.onCardClick(host)}>
                    <Card.Content>
                        <Label color='red' style={{marginBottom:"15px"}} ribbon>Tags not in sync</Label>
                        <Icon link name='server' style={{float:'right', marginTop:'40px'}} onClick={() => this.openEntity(host.guid)}/>
                        <Card.Header>{host.name}</Card.Header>
                        <Card.Meta style={{marginBottom:"15px"}}>{host.account}</Card.Meta>
                        <Card.Description>
                        {Object.keys(host.tags).map((key,i) => 
                            <Label key={i} style={{margin:"5px", fontSize:"10px"}} tag color='teal'>
                                {`${key}:${host.tags[key]}`}
                            </Label>
                        )}
                        </Card.Description>
                    </Card.Content>
                    {console.log(host.apmApps)}
                    { host.apmApps? 
                        host.apmApps.map( (apmApp,j) => 
                            <Card.Content key={j}>
                                <Icon link name='sitemap' style={{float:'right'}} onClick={() => this.openEntity(apmApp.guid)}/>
                                <Card.Header>{apmApp.name}</Card.Header>
                                <Card.Description>
                                {apmApp.tags.map((tag,i) => 
                                    <Label key={i} style={{margin:"5px", fontSize:"10px"}} tag color='blue'>
                                        {`${tag['key']}:${tag['values'][0]}`}
                                    </Label>
                                )}
                                </Card.Description>
                            </Card.Content>
                        )
                    :<Card.Content><Card.Description>No APM Application found in this host</Card.Description></Card.Content>}
                    </Card>
                )}
            </Card.Group>    
            </div>
        )
    }
}