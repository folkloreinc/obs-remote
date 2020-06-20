/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import OBSWebSocket from 'obs-websocket-js';

const ObsContext = React.createContext(null);

export const useObs = () => useContext(ObsContext);

const propTypes = {
    children: PropTypes.node.isRequired,
    obs: PropTypes.instanceOf(OBSWebSocket).isRequired,
    connected: PropTypes.bool,
    connecting: PropTypes.bool,
};

const defaultProps = {
    connected: false,
    connecting: false,
};

export const ObsProvider = ({ children, obs, connected, connecting }) => (
    <ObsContext.Provider value={{ obs, connected, connecting }}>{children}</ObsContext.Provider>
);

ObsProvider.propTypes = propTypes;
ObsProvider.defaultProps = defaultProps;

export default ObsContext;
