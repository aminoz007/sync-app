import React from 'react';
import { Card, Label, Icon, Divider, Header } from 'semantic-ui-react';
import { navigation } from 'nr1';

export default class Details extends React.Component {

    constructor(props) {
        super(props)
    }

    openEntity(guid){
        navigation.openStackedEntity(guid);
    }

    render() {
        const { data } = this.props;
        return (
            <>
                <Divider horizontal>
                <Header as='h4'>
                    <Icon name='eye' />
                    Details
                </Header>
                </Divider>
                <Card.Group>
                    {data.map((host,i) => 
                        <Card key={i} style={{marginRight:"20px"}}>
                        <Card.Content style={{position:'relative'}}>
                            <div style={{display:'flex',justifyContent:'space-between'}}>
                            <Card.Header><strong>Host: </strong>{host.name}</Card.Header>
                            <Icon link name='server' onClick={() => this.openEntity(host.guid)}/>
                            </div>
                            <Card.Meta style={{marginBottom:"15px"}}>{host.account}</Card.Meta>
                            <Card.Description>
                            {Object.keys(host.tags).map((key,i) => 
                                <Label key={i} style={{margin:"5px", fontSize:"10px"}} tag >
                                    {`${key}: ${host.tags[key]}`}
                                </Label>
                            )}
                            </Card.Description>
                        </Card.Content>
                        {host.apmApps.map((apmApp,j) => 
                                <Card.Content key={j}>
                                    {apmApp.isInSync ? 
                                        <Label color='green' style={{marginBottom:"15px"}} ribbon>AWS Tags are in NR</Label> :
                                        <Label color='red' style={{marginBottom:"15px"}} ribbon>AWS Tags are not in NR</Label>
                                    }
                                    <input style={{position:'absolute', right:'15px'}} type="checkbox" checked={apmApp.checked} onChange={(e) => this.props.onAppSelect(i,j,e)} />
                                    <div style={{display:'flex',justifyContent:'space-between'}}>
                                    <Card.Header style={{marginBottom:"15px"}}><strong>Application: </strong>{apmApp.name}</Card.Header>
                                    <Icon link name='sitemap' onClick={() => this.openEntity(apmApp.guid)}/>
                                    </div>
                                    <Card.Description>
                                    {Object.keys(apmApp.tags).map((key,i) => 
                                        <Label key={i} style={{margin:"5px", fontSize:"10px"}} tag >
                                            {`${key}: ${apmApp.tags[key]}`}
                                        </Label>
                                    )}
                                    </Card.Description>
                                </Card.Content>
                        )}
                        </Card>
                    )}
                </Card.Group>
            </>
        )
    }
}