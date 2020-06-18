import get from 'lodash/get';
import set from 'lodash/set';

class Config {
    constructor(config) {
        this.config = config || {};
    }

    get(str) {
        return get(this.config, str);
    }

    set(str, val) {
        return set(this.config, str, val);
    }
}

const config = new Config();

// eslint-disable-next-line no-unused-vars
const configFunc = (key, value) => {
    if (typeof value !== 'undefined') {
        return config.set(key, value);
    } else if (typeof key === 'undefined') {
        return config.get();
    }
    return config.get(key);
};

const root = global || window || null;
if (root !== null) {
    root.app_config = configFunc;
}
