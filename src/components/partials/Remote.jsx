import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Cookies from 'js-cookie';

import useObsSocket from '../../hooks/useObsSocket';
import { ObsProvider } from '../../contexts/ObsContext';
import ConnectBar from './ConnectBar';
import SceneItemsBar from './SceneItemsBar';
import Joystick from './Joystick';

import styles from '../../styles/partials/remote.module.scss';

const propTypes = {
    host: PropTypes.string,
    port: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    host: Cookies.get('obs_host') || 'localhost',
    port: Cookies.get('obs_port') || '4444',
    className: null,
};

const Remote = ({ host: initialHost, port: initialPort, className }) => {
    // Connect
    const [host, setHost] = useState(initialHost);
    const [port, setPort] = useState(initialPort);
    const { obs, connecting, connected, connect, disconnect } = useObsSocket({ host, port });
    const onClickConnect = useCallback(() => {
        if (connected || connecting) {
            disconnect();
        } else {
            connect();
            Cookies.set('obs_host', host);
            Cookies.set('obs_port', port);
        }
    }, [connected, connecting, connect, host, port]);

    // Scenes
    const [scenes, setScenes] = useState(null);
    const [videoInfo, setVideoInfo] = useState(null);
    const updateScenes = useCallback(() => {
        obs.send('GetSceneList').then(({ currentScene: newCurrentScene, scenes: newScenes }) => {
            setScenes(
                newScenes.map((it) => ({
                    ...it,
                    current: it.name === newCurrentScene,
                })),
            );
        });
    }, [obs, setScenes]);
    const updateVideoInfo = useCallback(() => {
        obs.send('GetVideoInfo').then((response) => {
            setVideoInfo({
                ...response,
            });
        });
    }, [setVideoInfo]);
    useEffect(() => {
        if (!connected) {
            return;
        }
        updateScenes();
        updateVideoInfo();
    }, [connected, updateScenes, updateVideoInfo]);

    // Scene Item
    const [sceneItem, setSceneItem] = useState(null);
    const updateSceneItem = useCallback(
        (sceneName, sceneItemName) => {
            obs.send('GetSceneItemProperties', {
                'scene-name': sceneName,
                item: {
                    name: sceneItemName,
                },
            }).then((response) => {
                setSceneItem({
                    ...response,
                    scene: sceneName,
                });
            });
        },
        [setSceneItem],
    );
    const onSceneItemChange = useCallback(
        (newSceneItem) => {
            if (newSceneItem === null) {
                setSceneItem(null);
                return;
            }
            const { scene: sceneName, sceneItem: sceneItemName } = newSceneItem;
            updateSceneItem(sceneName, sceneItemName);
        },
        [setSceneItem, updateSceneItem],
    );

    const sceneItemRef = useRef({
        ...sceneItem,
    });
    const positionRef = useRef({
        x: 0,
        y: 0,
    });
    sceneItemRef.current = sceneItem || {};

    // Scale
    const [interacting, setInteracting] = useState(false);

    const onPositionStart = useCallback(() => setInteracting(true), [setInteracting]);
    const onPositionStop = useCallback(() => {
        setInteracting(false);
        updateSceneItem(sceneItem.scene, sceneItem.name);
    }, [setInteracting, sceneItem, updateSceneItem]);
    const onJoystickChange = (value) => {
        const {
            current: { scene: sceneName, name: sceneItemName, rotation: sceneItemRotation },
        } = sceneItemRef;
        positionRef.current = value;
        obs.send('SetSceneItemPosition', {
            'scene-name': sceneName,
            item: sceneItemName,
            x: value.x,
            y: value.y,
        });
        obs.send('SetSceneItemTransform', {
            'scene-name': sceneName,
            item: sceneItemName,
            'x-scale': value.scale,
            'y-scale': value.scale,
            rotation: sceneItemRotation,
        });
    };

    // Update transform
    useEffect(() => {
        if (interacting) {
            return () => {};
        }
        const onSceneItemTransformChanged = ({
            'scene-name': sceneName,
            'item-name': sceneItemName,
            transform,
        }) => {
            if (
                sceneItem !== null &&
                sceneItem.name === sceneItemName &&
                sceneName === sceneItem.scene
            ) {
                setSceneItem({
                    ...sceneItem,
                    ...transform,
                });
            }
        };
        obs.on('SceneItemTransformChanged', onSceneItemTransformChanged);
        return () => {
            obs.off('SceneItemTransformChanged', onSceneItemTransformChanged);
        };
    }, [obs, interacting, sceneItem, setSceneItem]);

    // Update scenes and sceneItems
    useEffect(() => {
        const onSwitchScenes = ({ 'scene-name': newCurrentScene }) => {
            setScenes(
                scenes.map((it) => ({
                    ...it,
                    current: it.name === newCurrentScene,
                })),
            );
        };
        const onScenesChanged = () => {
            updateScenes();
            if (sceneItem !== null) {
                updateSceneItem(sceneItem.scene, sceneItem.name);
            }
        };
        const onSceneItemAdded = () => updateScenes();
        const onSceneItemRemoved = ({ 'scene-name': sceneName, 'item-name': sceneItemName }) => {
            updateScenes();
            if (
                sceneItem !== null &&
                sceneItem.scene === sceneName &&
                sceneItem.name === sceneItemName
            ) {
                setSceneItem(null);
            }
        };
        obs.on('SwitchScenes', onSwitchScenes);
        obs.on('ScenesChanged', onScenesChanged);
        obs.on('SceneItemAdded', onSceneItemAdded);
        obs.on('SceneItemRemoved', onSceneItemRemoved);
        return () => {
            obs.off('SwitchScenes', onSwitchScenes);
            obs.off('ScenesChanged', onScenesChanged);
            obs.off('SceneItemAdded', onSceneItemAdded);
            obs.off('SceneItemRemoved', onSceneItemRemoved);
        };
    }, [obs, setScenes, scenes, updateScenes, sceneItem, setSceneItem, updateSceneItem]);

    return (
        <ObsProvider obs={obs} connected={connected} connecting={connecting}>
            <div
                className={classNames([
                    styles.container,
                    {
                        [className]: className !== null,
                    },
                ])}
            >
                <ConnectBar
                    host={host}
                    port={port}
                    connected={connected}
                    connecting={connecting}
                    onHostChange={setHost}
                    onPortChange={setPort}
                    onClickConnect={onClickConnect}
                />
                {connected && scenes !== null ? (
                    <>
                        <SceneItemsBar
                            scenes={scenes}
                            sceneItem={sceneItem}
                            onSceneItemChange={onSceneItemChange}
                        />
                        {sceneItem !== null && videoInfo !== null ? (
                            <>
                                <Joystick
                                    sceneItem={sceneItem}
                                    videoInfo={videoInfo}
                                    onStart={onPositionStart}
                                    onStop={onPositionStop}
                                    onChange={onJoystickChange}
                                    className={styles.joystick}
                                />
                            </>
                        ) : null}
                    </>
                ) : null}
            </div>
        </ObsProvider>
    );
};

Remote.propTypes = propTypes;
Remote.defaultProps = defaultProps;

export default Remote;
