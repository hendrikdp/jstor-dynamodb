import { store } from "../_sampleUsage.js"

function clearCache(){
    store.fileCache.clear();
    store.keysCache.clear();
}

describe(`JStore - Get index of all documents`, () => {

    beforeAll(async () => {
        await store.save('key4', {foo: 'bar'});
        await store.save('key5', {a: 'b'});
        await store.save('key6', {c: 'd'});
        //clear cache
        clearCache();
    });

    test(`Check keys are collected`, async () => {
        const keys = await store.keys();
        expect(keys.indexOf('key4')).toBeGreaterThan(-1);
        expect(keys.indexOf('key5')).toBeGreaterThan(-1);
        expect(keys.indexOf('key6')).toBeGreaterThan(-1);
    });

});