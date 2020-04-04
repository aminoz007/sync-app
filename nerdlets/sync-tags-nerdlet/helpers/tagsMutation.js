import { addTagsMutation } from './queries';
import { NerdGraphQuery } from 'nr1';

const addTags = () => {

    const mutation = `
        mutation {
        taggingAddTagsToEntity(guid: "MjAzOTY5OHxBUE18QVBQTElDQVRJT058MTg4Mjg3Mzg5", tags: {key: "test", values: "test"}) {
            errors {
                message
                type
            }
            }
        }`
    NerdGraphQuery.query({
        query: mutation
    }).then(res => console.log(res));

}

export { addTags };