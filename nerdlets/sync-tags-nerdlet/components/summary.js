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
                <Menu compact style={{marginBottom:"40px", marginTop:"25px", fontSize:"1em"}}>
                    <Menu.Item>
                        <Icon name='server' /> Number of running EC2 containing APM services
                        <Label color='teal' floating>
                            {data.nbEc2}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name='sitemap' /> Number of unique services deployed in EC2
                        <Label color='blue' floating>
                            {data.nbUniqueServices}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name='sitemap' /> Number of services instances deployed in EC2
                        <Label color='yellow' floating>
                            {data.nbServicesInstances}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name='tag' /> Number of app instances with missing EC2 tags
                        <Label color='red' floating>
                            {data.nbServicesNotInSync}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name='tag' /> Number of app instances having all EC2 tags
                        <Label color='green' floating>
                            {data.nbServicesInSync}
                        </Label>
                    </Menu.Item>
                </Menu>
            </>
        )
    }
}