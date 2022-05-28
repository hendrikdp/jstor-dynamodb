import { store } from "../_sampleUsage.js"

function clearCache(){
    store.fileCache.clear();
    store.keysCache.clear();
}

describe(`JStore - Batch collect multiple ids`, () => {

    beforeAll(async () => {
        //CREATE DOCUMENTS
        await store.save('key11', {fruit: 'apple'});
        await store.save('key12', {fruit: 'orange'});
        await store.save('key13', {fruit: 'melon'});
        await store.save('key14', {fruit: 'banana'});
        //clear cache
        clearCache();
    });

    test('Batch get documents', async () => {
        store.get('key13'); //this document will come from cache now, this document will not be fetched anymore
        const docs = await store.batch([
            'key11', 'keysNonExisting', 'key12', 'key13', 'key14'
        ]);
        expect(docs.length).toBe(5);
        expect(docs[0].get('fruit')).toBe('apple');
        expect(docs[1].exists).toBeFalsy();
    });

})