import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import useObsSocket from '../hooks/useObsSocket';
import { ObsProvider } from '../contexts/ObsContext';
import ConnectBar from './partials/ConnectBar';
import SceneItemsBar from './partials/SceneItemsBar';
import Joystick from './partials/Joystick';

import styles from '../styles/remote.module.scss';

const propTypes = {
    host: PropTypes.string,
    port: PropTypes.string,
    screenshotMaxWidth: PropTypes.number,
    onConnect: PropTypes.func,
};

const defaultProps = {
    host: 'localhost',
    port: '4444',
    screenshotMaxWidth: 400,
    onConnect: null,
};

const Remote = ({ host: initialHost, port: initialPort, screenshotMaxWidth, onConnect }) => {
    // Connect
    const [host, setHost] = useState(initialHost);
    const [port, setPort] = useState(initialPort);
    const { obs, connecting, connected, connect, disconnect } = useObsSocket({ host, port });
    const onClickConnect = useCallback(() => {
        if (connected || connecting) {
            disconnect();
        } else {
            connect();
            if (onConnect !== null) {
                onConnect({ host, port });
            }
        }
    }, [connected, connecting, connect, disconnect, host, port, onConnect]);

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
    }, [obs, setVideoInfo]);
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
                const sourceRatio = response.sourceHeight / response.sourceWidth;
                const screenshotWidth = Math.min(screenshotMaxWidth, response.sourceWidth);
                const screenshotHeight = screenshotWidth * sourceRatio;
                return obs
                    .send('TakeSourceScreenshot', {
                        sourceName: sceneItemName,
                        embedPictureFormat: 'jpeg',
                        width: screenshotWidth,
                        height: screenshotHeight,
                    })
                    .then(({ img }) =>
                        setSceneItem({
                            ...response,
                            screenshot: img,
                            scene: sceneName,
                        }),
                    );
            });
        },
        [obs, setSceneItem, screenshotMaxWidth],
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

    const sceneItemRef = useRef(sceneItem || {});
    sceneItemRef.current = sceneItem || {};

    // Joystick
    const [interacting, setInteracting] = useState(false);
    const refInteracting = useRef(interacting);
    const onJoystickStart = useCallback(() => {
        refInteracting.current = true;
        setInteracting(true);
    }, [setInteracting]);
    const onJoystickStop = useCallback(() => {
        refInteracting.current = false;
        setInteracting(false);
        updateSceneItem(sceneItem.scene, sceneItem.name);
    }, [setInteracting, sceneItem, updateSceneItem]);
    const onJoystickChange = (value) => {
        if (!refInteracting.current) {
            return;
        }
        const {
            current: { scene: sceneName, name: sceneItemName, rotation: sceneItemRotation },
        } = sceneItemRef;
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
            <div className={styles.container}>
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
                                    onStart={onJoystickStart}
                                    onStop={onJoystickStop}
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
