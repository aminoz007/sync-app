import gql from 'graphql-tag';

// Get all running EC2 instances where APM agents are deployed
const EC2_HOSTS_WITH_APPS = `
query($queryCursor: String) {
    actor {
        entitySearch(query: "domain='INFRA' AND type='HOST' AND tags.aws.ec2State='running' AND tags.apmApplicationIds like '%'") {
            results(cursor: $queryCursor) {
                entities {
                    tags {
                      key
                      values
                    }
                    name
                    accountId
                    guid
                }
                nextCursor
            }
            count
        }
    }
}
`;

// Get application tags 
const fetchApps = (appName, accountId) => {
    return `
    {
        actor {
        entitySearch(query: "domain in ('APM') and type in ('APPLICATION') and name='${appName}' and accountId='${accountId}'") {
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
    }
    `;
}

// Add Tags Mutation
const TAGS_MUTATION = gql`
mutation($guid: EntityGuid! , $tags: [TaggingTagInput!]!) {
    taggingAddTagsToEntity(guid: $guid, tags: $tags) {
        errors {
            message
        }
    }
}
`;

  export  { EC2_HOSTS_WITH_APPS, fetchApps, TAGS_MUTATION }