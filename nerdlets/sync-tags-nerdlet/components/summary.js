import React from 'react';
import { Label, Icon, Menu, Divider, Header } from 'semantic-ui-react';

export default class Summary extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { data } = this.props;
        return ( 
            <>
                <Divider horizontal>
                <Header as='h4'>
                    <Icon name='clipboard check' />
                    Summary
                </Header>
                </Divider>
                <Menu compact style={{marginBottom:"40px", marginTop:"25px"}}>
                    <Menu.Item>
                        <Icon name='server' /> Number of running EC2 with APM services
                        <Label color='teal' floating>
                            {data.nbEc2}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name='sitemap' /> Number of services deployed in EC2
                        <Label color='blue' floating>
                            {data.nbServices}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name='tag' /> Number of apps labels not in sync
                        <Label color='red' floating>
                            {data.nbServicesNotInSync}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name='tag' /> Number of apps labels in sync
                        <Label color='green' floating>
                            {data.nbServicesInSync}
                        </Label>
                    </Menu.Item>
                </Menu>
            </>
        )
    }
}