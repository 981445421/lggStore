import Store from './Store'

export default class Model {
    modelName = null;
    state = {};

    deepCopy(obj) {
        return Store.deepCopy(obj);
    }
    dispatch(action){
        Store.dispatch(action);
    }

    sleep(param) {
        return Store.sleep(param);
    }

    call(fn, action) {
        return Store.call(fn, action)
    }

    takeLatest(fn, action) {
        return Store.takeLatest(fn, action)
    }

    takeEarlier(fn, action) {
        return Store.takeEarlier(fn, action)
    }

    async(fn, action) {
        Store.async(fn, action, this)
    }

    getState(modelName) {
        return Store.getState(modelName)
    }

    setState(param) {
        const modelName = this.modelName;
        return Store.setState(param, modelName);
    }
}