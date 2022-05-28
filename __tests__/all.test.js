import { store } from "../_sampleUsage.js"

function clearCache(){
    store.fileCache.clear();
    store.keysCache.clear();
}

describe(`JStore - Batch collect multiple ids`, () => {

    beforeAll(async () => {
        //CREATE DOCUMENTS
        await store.save('key17', {name: 'hendrik'});
        await store.save('key16', {name: 'monica'});
        await store.save('key15', {name: 'miranda'});
        //clear cache
        clearCache();
    });

    test(`Check if all documents can be fetched`, async () => {
        const allDocs = await store.all();
        const keys = await store.keys();
        expect(allDocs.length).toBe(keys.length);
        expect(allDocs[0].key).toBe(keys[0]);
    });

    test(`Check if a set of documents can be found`, async () => {
        const allDocs = await store.all(1,2);
        const keys = await store.keys();
        expect(allDocs.length).toBe(2);
        expect(allDocs[0].key).toBe(keys[1]);
        expect(allDocs[1].key).toBe(keys[2]);
    });

    test(`Check if documents can be fetched in reverse order`, async () => {
        const allDocs = await store.all(null,null,true);
        const keys = await store.keys();
        expect(allDocs[0].key).toBe(keys[keys.length-1]);
        expect(allDocs[1].key).toBe(keys[keys.length-2]);
    })

})