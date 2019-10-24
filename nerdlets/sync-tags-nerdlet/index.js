import React from 'react';
import { EntitySearchQuery, Spinner } from 'nr1';
import CardSync from './card'

export default class SyncTags extends React.Component {






    render() {
        const filters = [
            {
                type: 'entityType',
                value: {domain: 'INFRA', type: 'HOST'}
            },
            {
                type: 'tag',
                value: {key: 'ec2State', value: 'running'}
            },
        ]
        return (        
            <EntitySearchQuery filters={filters} includeTags includeCount>
                {({loading, error, data, fetchMore}) => {
                    if (loading) {
                        return <Spinner />
                    }

                    if (error) {
                        console.log(error)
                        return 'Error!'
                    }
                    //if (fetchMore) {
                    //    fetchMore();
                    //}
                    const hostInfo = data.entities.map(host => {
                        const info = {accountId:host.accountId, name:host.name, guid:host.guid}
                        const ec2Tags = {}
                        host.tags.forEach(tag => {
                            if(tag.key.startsWith('ec2Tag_')) {
                                ec2Tags[tag.key.replace('ec2Tag_','')] = tag.values[0]
                            } else if(tag.key==='account' || tag.key==='awsRegion' || tag.key==='awsAvailabilityZone' || tag.key==='ec2SubnetId' || tag.key==='apmApplicationNames'){
                                info[tag.key] = tag.values[0]
                            }
                        })
                        info['tags'] = ec2Tags
                        return info
                    })
                    console.log(hostInfo)
                    console.log(data);
                    return <CardSync data={hostInfo}/>
                }}
            </EntitySearchQuery>
        )
    }
}
