import {batchMountEnd, coerceRender, dispatchEnd, dispatchStart, mountEnd, unMountEnd, updateType} from "./ConstType";
import {Thunk} from "./Thunk";

class Store {
    timer = null;
    store = {};
    subscriptionArr = [];
    onError = null;
    onEffect = null;
    modelInstance = {};//数据模型实例
    takeEarlierStack = new Set();
    takeLatestStack = new Map();

    setError(error) {
        this.onError = error;
    }

    setEffect(effect) {
        this.onEffect = effect;
    }

    batchMount(props) {
        if (Array.isArray(props)) {
            props.forEach(model => {
                //初始化数据模型，指定类索引到基类
                this.mount(model);
            });
            props = null;
        } else {
            //初始化数据模型，指定类索引到基类
            this.mount(props);
        }
        // 发送初始化的batchMountEnd 结束
        this.sendToMainThread(batchMountEnd, undefined);
    }

    deepCopy(obj) {
        const result = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    result[key] = this.deepCopy(obj[key]);   //递归复制
                } else {
                    result[key] = obj[key];
                }
            }
        }
        return result;
    }

    mount(model) {
        const instance = new model();
        const modelName = instance.modelName;
        if (!modelName) {
            throw new Error("异常：modelName 未定义 " + model.name);
        }
        //实列没有挂载过返回
        this.modelInstance[modelName] = instance;
        //获取数据模型state，赋值到基类state；
        this.store[modelName] = this.modelInstance[modelName].state;
        // 发送初始化的mountEnd 结束
        this.sendToMainThread(mountEnd, undefined);
        return true;
    }

    unMount(modelName) {
        if (this.isMount(modelName)) {
            //删除当前实列
            delete this.modelInstance[modelName];
            //删除当前实列数据；
            delete this.store[modelName];
            this.sendToMainThread(unMountEnd, undefined);
            return true;
        }
        return false;
    }

    isMount(modelName) {
        if (this.modelInstance.hasOwnProperty(modelName)) {
            return true;
        }
        return false;
    }

    dispatch(action) {
        this.sendToMainThread(dispatchStart, action);
        const type = action.type.split("/");
        if (this.isMount(type[0])) {
            if (typeof this.modelInstance[type[0]][type[1]] === "function") {
                const fnInstance = this.modelInstance[type[0]][type[1]](action);
                if (fnInstance && typeof fnInstance === "object" && fnInstance && fnInstance["next"] && fnInstance["return"] && fnInstance["throw"] && typeof fnInstance.next === "function" && typeof fnInstance.return === "function" && typeof fnInstance.throw === "function") {
                    fnInstance.return();
                    this.async(this.modelInstance[type[0]][type[1]], action, this.modelInstance[type[0]]);
                } else {
                    this.sendToMainThread(dispatchEnd, action);
                }
            }
        } else {
            throw new Error("dispatch 异常 : " + action);
        }
    }

    sleep(param) {
        return (next) => {
            setTimeout(function () {
                next(false, 100);
            }, param)
        }
    }

    call(fn, arg) {
        return (next, cb, cbInstance) => {
            fn(arg).then((res) => {
                return next(false, res);
            }).catch((error) => {
                return next(true, error);
            });
        }
    }

    takeLatest(fn, arg) {
        return (next, cb, cbInstance) => {
            if (this.takeLatestStack.has(cb)) {
                //如果存在相同的实例,销毁任务,并删除这个引用
                const val = this.takeLatestStack.get(cb);
                if (val) {
                    val.return();
                }
                this.takeLatestStack.delete(cb);
            }
            //添加新的引用和实例
            this.takeLatestStack.set(cb, cbInstance);
            fn(arg).then((res) => {
                //删除锁
                this.takeLatestStack.delete(cb);
                return next(false, res);
            }).catch((error) => {
                //删除锁
                this.takeLatestStack.delete(cb);
                return next(true, error);
            });
        }

    }

    takeEarlier(fn, arg) {
        return (next, cb, cbInstance) => {
            if (this.takeEarlierStack.has(cb)) {
                //删除实例
                return cbInstance.return();
            }
            this.takeEarlierStack.add(cb);
            fn(arg).then((res) => {
                //删除锁
                setTimeout(() => {
                    this.takeEarlierStack.delete(cb);
                }, 1000);
                return next(false, res);
            }).catch((error) => {
                //删除锁
                this.takeEarlierStack.delete(cb);
                return next(true, error);
            });
        }
    }

    async(fn, action, ts) {
        let fnInstance = null;
        if (typeof this.onEffect === "function") {
            const newFn = this.onEffect(fn, action, ts);
            fnInstance = newFn.call(ts, action);
        } else {
            fnInstance = fn.call(ts, action);
        }
        Thunk(fnInstance, fn, action, this.onError);
    }

    getState(modelName) {
        if (modelName) {
            if (this.store.hasOwnProperty(modelName)) {
                return this.store[modelName];
            } else {
                return null;
            }
        } else {
            return this.store;
        }
    }

    getInstance(modelName) {
        if (modelName) {
            if (this.modelInstance.hasOwnProperty(modelName)) {
                return this.modelInstance[modelName];
            } else {
                return null;
            }
        } else {
            return this.modelInstance;
        }
    }

    setState(param, modelName) {
        let update = false;
        //更新state数据
        if (this.store.hasOwnProperty(modelName)) {
            const currentState = this.store[modelName];
            Object.keys(param).forEach(key => {
                if (currentState[key] !== param[key]) {
                    currentState[key] = param[key];
                    update = true;
                }
                return false;
            });
        }
        if (update) {
            //发送到主线程
            this.sendToMainThread(updateType, undefined);
        }
        return update;
    }

    sendToMainThread(type, data) {
        if (type === updateType) {
            //非强制渲染
            this.render(false);
        } else if (type === coerceRender) {
            //强制渲染
            this.render(true);
        }
    }

    onSubscription(fn) {
        this.subscriptionArr.push(fn);
        return () => {
            for (let i = 0; i < this.subscriptionArr.length; i++) {
                const itemFn = this.subscriptionArr[i];
                if (itemFn === fn) {
                    this.subscriptionArr.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
    }

    render(coerceRender) {
        if (this.timer === null) {
            this.timer = setTimeout(() => {
                this.subscriptionArr.forEach(fn => {
                    fn(this.store, coerceRender);
                });
                this.timer = null;
            }, 0);
        }
    }
}

export default new Store();