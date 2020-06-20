import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import useObsSocket from '../../hooks/useObsSocket';
import { ObsProvider } from '../../contexts/ObsContext';
import ConnectBar from './ConnectBar';
import SceneItemsBar from './SceneItemsBar';
import Joystick from './Joystick';
import Scale from './Scale';

import styles from '../../styles/partials/remote.module.scss';

const propTypes = {
    host: PropTypes.string,
    port: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    host: 'localhost',
    port: '4444',
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
        }
    }, [connected, connecting, connect]);

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

    const sceneRefValue = useMemo(
        () => ({
            sceneName: sceneItem !== null ? sceneItem.scene : null,
            sceneItemName: sceneItem !== null ? sceneItem.name : null,
            maxX: sceneItem !== null ? Math.max(sceneItem.width - videoInfo.baseWidth, 0) : 0,
            maxY: sceneItem !== null ? Math.max(sceneItem.height - videoInfo.baseHeight, 0) : 0,
            centerX: videoInfo !== null ? videoInfo.baseWidth / 2 : 0,
            centerY: videoInfo !== null ? videoInfo.baseHeight / 2 : 0,
        }),
        [sceneItem, videoInfo],
    );
    const sceneRef = useRef(sceneRefValue);
    const positionRef = useRef({
        x: 0,
        y: 0,
    });
    sceneRef.current = sceneRefValue;

    // Scale
    const [interacting, setInteracting] = useState(false);
    const onScaleStart = useCallback(() => setInteracting(true), [setInteracting]);
    const onScaleStop = useCallback(() => {
        setInteracting(false);
        updateSceneItem(sceneItem.scene, sceneItem.name);
    }, [setInteracting, sceneItem, updateSceneItem]);
    const onScaleChange = useCallback(
        (scale) => {
            const centerX = videoInfo.baseWidth / 2;
            const centerY = videoInfo.baseHeight / 2;
            const maxX = Math.max((sceneItem.sourceWidth * scale) - videoInfo.baseWidth, 0);
            const maxY = Math.max((sceneItem.sourceHeight * scale) - videoInfo.baseHeight, 0);
            const { current: position } = positionRef;
            const newX = centerX + (maxX / 2) * -position.x;
            const newY = centerY + (maxY / 2) * -position.y;

            obs.send('SetSceneItemTransform', {
                'scene-name': sceneItem.scene,
                item: sceneItem.name,
                'x-scale': scale,
                'y-scale': scale,
                rotation: sceneItem.rotation,
            });

            obs.send('SetSceneItemPosition', {
                'scene-name': sceneItem.scene,
                item: sceneItem.name,
                x: newX,
                y: newY,
            });
        },
        [sceneItem, videoInfo],
    );

    const onPositionStart = useCallback(() => setInteracting(true), [setInteracting]);
    const onPositionStop = useCallback(() => {
        setInteracting(false);
        updateSceneItem(sceneItem.scene, sceneItem.name);
    }, [setInteracting, sceneItem, updateSceneItem]);
    const onPositionChange = (position) => {
        const {
            current: { maxX, maxY, centerX, centerY, sceneName, sceneItemName },
        } = sceneRef;
        const newX = centerX + (maxX / 2) * -position.x;
        const newY = centerY + (maxY / 2) * -position.y;
        positionRef.current = position;
        obs.send('SetSceneItemPosition', {
            'scene-name': sceneName,
            item: sceneItemName,
            x: newX,
            y: newY,
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
                                    onStart={onPositionStart}
                                    onStop={onPositionStop}
                                    onChange={onPositionChange}
                                    className={styles.joystick}
                                />
                                <Scale
                                    sceneItem={sceneItem}
                                    videoInfo={videoInfo}
                                    onStart={onScaleStart}
                                    onStop={onScaleStop}
                                    onChange={onScaleChange}
                                    className={styles.slider}
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
