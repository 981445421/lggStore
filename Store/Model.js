import Store from './Store'

export default class Model {
    modelName = null;
    state = {};

    dispatch(action) {
        Store.dispatch(action);
    }

    emit(method, payload) {
        Store.dispatch({type: this.modelName + "/" + method, payload});
    }

    sleep(param) {
        return Store.sleep(param);
    }

    call(fn, param) {
        return Store.call(fn, param)
    }

    takeLatest(fn, param) {
        return Store.takeLatest(fn, param)
    }

    takeEarlier(fn, param) {
        return Store.takeEarlier(fn, param)
    }

    async(fn, param) {
        const action = {
            type: this.modelName + "/" + fn.name,
            payload: param
        };
        Store.async(fn, action, this)
    }

    getState(modelName) {
        return Store.getState(modelName)
    }

    setState(param) {
        const modelName = this.modelName;
        return Store.setState(param, modelName);
    }

    sendToMainThread(type, data) {
        Store.sendToMainThread(type, data);
    }
}