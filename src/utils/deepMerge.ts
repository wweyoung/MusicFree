function isValidValue(val) {
    return val !== null &&
        val !== undefined &&
        val !== "" &&
        !Number.isNaN(val);
}

function isPlainObject(obj) {
    return obj?.constructor === Object;
}

function deepMerge(target, ...sources) {
    if (!isPlainObject(target)) target = {};

    sources.forEach(source => {
        if (!source || typeof source !== "object") return;

        Object.keys(source).forEach(key => {
            const value = source[key];
            if (!isValidValue(value)) return;

            if (isPlainObject(target[key]) && isPlainObject(value)) {
                deepMerge(target[key], value);
            } else {
                target[key] = value;
            }
        });
    });

    return target;
}

export default deepMerge;
