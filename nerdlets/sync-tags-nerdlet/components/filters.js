import React from 'react';
import { Menu, Dropdown, Grid, Checkbox, GridRow } from 'semantic-ui-react';

export default class Filters extends React.Component {

    constructor(props) {
        super(props)
    }

    transformToDropdown(values) {
        const options = [...new Set(values)];
        return  options.map(val => {return {key: val, text: val, value: val}});
    }

    dropdown(placeholder, name, key) {
        return (
            <Dropdown
                placeholder={placeholder}
                name={name}
                fluid
                multiple
                search
                selection
                onChange={this.props.onChange}
                options={this.transformToDropdown(this.props.data[key])}
            />
        );
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
                    <Dropdown.Item key={option.value} {...option} onClick={this.props.onActionClick}/>
                ))}
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    render() {
        return(
            <Grid columns='equal' style={{margin:"40px 40px 0px 40px"}}>
                <Grid.Row>
                    <Grid.Column>
                        {this.dropdown('AWS Region','aws.awsRegion','awsRegions')}
                    </Grid.Column>
                    <Grid.Column>
                        {this.dropdown('AWS Availability Zone','aws.awsAvailabilityZone','awsAZs')}
                    </Grid.Column>
                    <Grid.Column>
                        {this.dropdown('AWS Subnet','aws.ec2SubnetId','awsSubnets')}
                    </Grid.Column>
                </Grid.Row>
                <GridRow style={{justifyContent: 'flex-end'}}>
                <Menu secondary style={{marginBottom:"30px",marginTop:"0px"}}>
                <Menu.Menu position='right'>
                <Menu.Item>
                    <Checkbox label='Show only entities in sync' name='syncedDataOnly' toggle onChange={this.props.onChange} />
                </Menu.Item>
                <Menu.Item>
                    <Checkbox label='Show only entities not in sync' name ='notSyncedDataOnly' toggle onChange={this.props.onChange} />
                </Menu.Item>
                <Menu.Item>
                    {this.actionsDropdown()}
                </Menu.Item>
                </Menu.Menu>
            </Menu>
                </GridRow>
            </Grid>
        )
    }
}