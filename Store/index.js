import Store from './Store'

export default class Index {
    hook(props) {
        if (props.onEffect) {
            Store.setEffect(props.onEffect);
        }
        if (props.onError) {
            Store.setError(props.onError);
        }
    };

    model(model) {
       return Store.batchMount(model)
    };

    dispatch(action) {
        Store.dispatch(action);
    };

    mount(model) {
        return Store.mount(model);
    };

    unMount(modelName) {
        return Store.unMount(modelName);
    };

    isMount(modelName) {
        return Store.isMount(modelName);
    };

    getState(modelName) {
        return Store.getState(modelName);
    };

    onSubscription(fn) {
       return Store.onSubscription(fn)
    };

}