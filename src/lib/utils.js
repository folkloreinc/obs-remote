import isObject from 'lodash/isObject';

export const pascalCase = str =>
    str
        .replace(/[^a-z0-9]+/gi, ' ')
        .replace(/(\w)(\w*)/g, (g0, g1, g2) => `${g1.toUpperCase()}${g2.toLowerCase()}`)
        .replace(/\s+/gi, '');

export const isMessage = message => isObject(message) && typeof message.id !== 'undefined';

export const getComponentFromName = (name, components, defaultComponent = null) => {
    const componentName = pascalCase(name);
    return components[componentName] || defaultComponent;
};
