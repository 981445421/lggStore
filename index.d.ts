import React from 'react'

export interface Action {
    type: string,
    payload?: any,
}

export function lggConnect(
    mapStateToProps?: Function
): Function;

export interface IModel<T> {
    modelName: string;
    state: T;

    dispatch(action: Action);

    sleep(param: number);

    call(fn: (arg?: any) => any, arg?: any);

    takeLatest(fn: (arg?: any) => any, arg?: any);

    takeEarlier(fn: (arg?: any) => any, arg?: any);

    async(fn: (action: Action) => void, action: Action);

    getState(modelName?: string);

    setState(param: any);

    sendToMainThread(type: string, data: any);
}

type ModelName = string;

export class Model<T> {
    modelName: string;
    state: T;

    dispatch(action: Action);

    sleep(param: number);

    call(fn: (arg?: any) => any, arg?: any);

    takeLatest(fn: (arg?: any) => any, arg?: any);

    takeEarlier(fn: (arg?: any) => any, arg?: any);

    async(fn: (action: Action) => void, action: Action);

    getState(modelName?: string);

    setState(param: any);

    sendToMainThread(type: string, data: any);
}

export class Store {
    dispatch(action: Action);

    getState(modelName?: ModelName);

    hook(arg: { onError?(action: Action, e: any), onEffect?: (fn: (action: Action) => any, action: Action, ts: IModel<any>) => Function });

    model(modelArr: any[]);

    mount(model: any);

    unMount(modelName: string);

    isMount(modelName: string);

    onSubscription: (fn: () => void) => () => void;
}

export interface Interface {
    store: {
        dispatch(action: Action);

        getState(modelName?: string);
        onSubscription: (fn: () => void) => () => void;
    }
}

export class Provider extends React.PureComponent<Interface, any> {
}