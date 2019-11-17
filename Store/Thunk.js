export const Thunk = function (instance, cb, action,onError) {

    function next(err, data) {
        try {
            if (err) {
                return instance.throw(data);
            }
            const result = instance.next(data);
            if (result.done) {
                return result.value;
            }
            return result.value(next, cb, instance);
        } catch (e) {
            //抓取yeild错误
            if (onError) {
                onError(action,e);
            }
        }
    }

    next(false);
};