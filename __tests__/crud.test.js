import { store } from "../_sampleUsage.js"

function clearCache(){
    store.fileCache.clear();
    store.keysCache.clear();
}

describe(`JStore - Create Read Update Delete document`, () => {

    beforeAll(async () => {
        //CREATE DOCUMENTS
        await store.save('key1', {foo: 'bar'});
        await store.save('key2', {a: 'b'});
        await store.save('key3', {c: 'd'});
        //clear cache
        clearCache();
    });

   test(`GET a document`, async () => {
       const file = await store.get('key1');
       expect(file.get('foo')).toBe('bar');
       expect(file.exists).toBeTruthy();
   });

   test(`UPDATE a document`, async() => {
       let file = await store.get('key2');
       file.set('any.value.really.any', 'hello!');
       await file.save();
       clearCache();
       file = await store.get('key2');
       expect(file.get('any.value.really.any')).toBe('hello!');
   });

    test(`DELETE a document`, async() => {
        await store.remove('key3');
        clearCache();
        const file = await store.get('key3');
        expect(file.exists).toBeFalsy();
    });

});