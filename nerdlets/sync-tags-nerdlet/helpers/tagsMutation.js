import { TAGS_MUTATION } from './queries';
import { NerdGraphMutation } from 'nr1';

const tagsMutate = (appsToSync) => {
    const mutationPromises = [];
    appsToSync.forEach(app => {
        const variables = {
            guid: app.appGuid,
            tags: Object.keys(app.hostTags).map(key => ({key: key, values: app.hostTags[key]})),
        };
        mutationPromises.push(
            NerdGraphMutation.mutate({
                mutation: TAGS_MUTATION,
                variables,
            })
        );
    });
    // Skip errors. If any promise fails, do not return!
    return Promise.all(mutationPromises.map(p => p.catch(e => `ERROR: ${e}`)));
    /*const variables = {
        guid: "MjAzOTY5OHxBUE18QVBQTElDQVRJT058MTg4Mjg3Mzg5",
        tags: [{key: "env", values: "prod"}, {key: "test", values: "addtest"}],
    };
    NerdGraphMutation.mutate({
        mutation: TAGS_MUTATION,
        variables,
    }).then(res => console.log(res));*/

}

export { tagsMutate };