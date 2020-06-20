/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generatePath, useHistory } from 'react-router';

const RoutesContext = React.createContext(null);

export const useRoutes = () => {
    const { routes } = useContext(RoutesContext);
    return routes;
};

export const useUrlGenerator = () => {
    const { routes, basePath } = useContext(RoutesContext);
    const urlGenerator = useCallback(
        (key, data) => {
            const url = generatePath(routes[key], data);
            return basePath !== null
                ? `${basePath.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
                : url;
        },
        [routes, basePath],
    );
    return urlGenerator;
};

export const useRoutePush = () => {
    const url = useUrlGenerator();
    const history = useHistory();
    const push = useCallback((route, data, ...args) => history.push(url(route, data), ...args), [
        history,
        url,
    ]);
    return push;
};

const propTypes = {
    children: PropTypes.node.isRequired,
    routes: PropTypes.objectOf(PropTypes.string).isRequired,
    basePath: PropTypes.string,
};

const defaultProps = {
    basePath: null,
};

export const RoutesProvider = ({ routes, basePath, children }) => (
    <RoutesContext.Provider value={{ routes, basePath }}>{children}</RoutesContext.Provider>
);

RoutesProvider.propTypes = propTypes;
RoutesProvider.defaultProps = defaultProps;

export default RoutesContext;
