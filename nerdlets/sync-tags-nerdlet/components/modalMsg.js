import React from 'react';
import { Modal, Button, Icon, Header, List } from 'semantic-ui-react';

export default class ModalMsg extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return(
            <>
                <Modal
                    open={this.props.help}
                    onClose={this.props.onClose}
                    basic
                    size='small'
                >
                    <Header icon='browser' content='Synchronization Rules And Details' />
                    <Modal.Content>
                    <Modal.Description>
                        <List bulleted relaxed>
                            <List.Item><strong>Requirements:</strong> in order to use this application you should have
                                <List.List>
                                    <List.Item>AWS EC2 instances.</List.Item>
                                    <List.Item>Services running in EC2 instances.</List.Item>
                                    <List.Item>EC2 instances monitored with NR Infrastructure.</List.Item>
                                    <List.Item>Services Monitored with NR APM agents.</List.Item>
                                </List.List>
                            </List.Item>
                            <List.Item><strong>Goal:</strong> copy the EC2 tags to NR services entities automatically. If EC2 tags are already configured, you can save a lot of time by copying 
                                these tags to NR services instead of updating them manually. Tags in NR are used in many ways: search across accounts, workloads, etc...</List.Item>
                            <List.Item><strong>Logic:</strong> this application scans all your host entities across all the accounts that you have access to.It selects first only EC2 instances
                                 and then collects all the services running in these EC2. It displays the data for each host and compare the tags between the host and the services.</List.Item>
                            <List.Item><strong>Rules and Features:</strong>
                                <List.List>
                                    <List.Item>The sync logic is very similar to Linux rsync command. The application will first compare the services tags and host tags 
                                        and then will add each missing host tag to the services tags.</List.Item>
                                    <List.Item>If the key of the host tag exist in the service tags list, then it does not change the service tag.</List.Item>
                                    <List.Item>Host and service are considered in sync if service tags keys list includes the host tags keys.</List.Item>
                                    <List.Item>If the service has a tag that does not exist in the host tags list, it will NOT be removed. This is important since the user can add some additional tags afterward.</List.Item>
                                    <List.Item>If the instance is hosting multiple services, all of them will be returned.</List.Item>
                                    <List.Item>You can select the services to update manually by checking the corresponding checkbox.</List.Item>
                                    <List.Item>You can select all services or deselect them all.</List.Item>
                                    <List.Item>Filters are provided to help narrowing down the scope and target specific hosts or services.</List.Item>
                                    <List.Item>Clicking on the host Icon will open the host entity. Clicking on the service Icon will open the service entity.</List.Item>
                                </List.List>
                            </List.Item>
                        </List>
                    </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color='green' onClick={this.props.onClose} inverted>
                        <Icon name='checkmark' /> Got it
                    </Button>
                    </Modal.Actions>
                </Modal>


                <Modal
                    open={this.props.sync}
                    onClose={this.props.onClose}
                    basic
                    size='small'
                >
                    <Header icon='sync' content='Confirmation:' />
                    <Modal.Content>
                    <h3>You are about to update the tags of <strong>{this.props.nbApps}</strong> services. Would you like to continue?</h3>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button.Group>
                        <Button onClick={this.props.onClose}>Cancel</Button>
                        <Button.Or />
                        <Button positive onClick={this.props.onUpdate}>Update</Button>
                    </Button.Group>
                    </Modal.Actions>
                </Modal>
            </>
        )
    }
}