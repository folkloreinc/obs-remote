import { useMemo, useState, useCallback, useEffect } from 'react';
import OBSWebSocket from 'obs-websocket-js';

const useObsSocket = ({ host = 'localhost', port = '4444', password } = {}) => {
    const [{ connecting, connected }, setState] = useState({
        connecting: false,
        connected: false,
    });
    const obs = useMemo(() => new OBSWebSocket(), []);

    const connect = useCallback(() => {
        setState({
            connecting: true,
            connected: false,
        });
        obs.connect({ address: `${host}:${port}`, password })
    }, [
        obs,
        host,
        port,
    ]);

    useEffect(() => {
        const onConnectionOpened = (data) => {
            console.log(data);
            setState({
                connecting: false,
                connected: true,
            });
        }
        const onConnectionClosed = () => {
            setState({
                connecting: false,
                connected: false,
            });
        }
        obs.on('ConnectionOpened', onConnectionOpened);
        obs.on('ConnectionClosed', onConnectionClosed);
        return () => {
            obs.off('ConnectionOpened', onConnectionOpened);
            obs.off('ConnectionClosed', onConnectionClosed);
        };
    }, [obs]);

    const disconnect = useCallback(() => {
        setState({
            connecting: false,
            connected: false,
        });
        obs.disconnect();
    }, [
        obs,
    ]);

    useEffect(() => {
        return () => {
            if (connected) {
                obs.disconnect();
            }
        }
    }, [obs, connected])

    return {
        obs,
        connect,
        disconnect,
        connecting,
        connected,
    };
};

export default useObsSocket;
