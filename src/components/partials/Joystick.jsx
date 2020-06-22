/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSpring, animated, interpolate } from 'react-spring';
import { useGesture } from 'react-use-gesture';

import styles from '../../styles/partials/joystick.module.scss';

const getSceneItemAlignmentOffset = (alignment, width, height) => {
    let offsetX = 0;
    let offsetY = 0;
    if (alignment === 4 || alignment === 0 || alignment === 8) {
        offsetX = width / 2;
    } else if (alignment === 5 || alignment === 2 || alignment === 10) {
        offsetX = width;
    }
    if (alignment === 1 || alignment === 0 || alignment === 2) {
        offsetY = height / 2;
    } else if (alignment === 9 || alignment === 8 || alignment === 10) {
        offsetY = height;
    }
    return {
        x: offsetX,
        y: offsetY,
    };
};

const propTypes = {
    sceneItem: PropTypes.shape({
        scale: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        }),
        position: PropTypes.shape({
            alignment: PropTypes.number,
            x: PropTypes.number,
            y: PropTypes.number,
        }),
        sourceWidth: PropTypes.number,
        sourceHeight: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        screenshot: PropTypes.string,
    }).isRequired,
    videoInfo: PropTypes.shape({
        baseWidth: PropTypes.number,
        baseHeight: PropTypes.number,
    }).isRequired,
    sceneMinWidthRatio: PropTypes.number,
    className: PropTypes.string,
    onStart: PropTypes.func,
    onStop: PropTypes.func,
    onTap: PropTypes.func,
    onChange: PropTypes.func,
};

const defaultProps = {
    sceneMinWidthRatio: 0.4,
    className: null,
    onStart: null,
    onStop: null,
    onTap: null,
    onChange: null,
};

const Joystick = ({
    sceneItem,
    videoInfo,
    sceneMinWidthRatio,
    className,
    onStart,
    onStop,
    onTap,
    onChange,
}) => {
    // eslint-disable-next-line no-unused-vars
    const [interacting, setInteracting] = useState(false);
    const refContainer = useRef(null);
    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });
    const [{ x, y, scale }, set] = useSpring(() => ({
        x: sceneItem.position.x,
        y: sceneItem.position.y,
        scale: sceneItem.scale.x,
        tension: 30,
        friction: 4,
        onFrame: (position) => {
            if (onChange !== null) {
                onChange(position);
            }
        },
    }));
    const initialValue = useRef({
        x: sceneItem.position.x,
        y: sceneItem.position.y,
        scale: sceneItem.scale.x,
    });
    const lastValue = useRef({
        x: sceneItem.position.x,
        y: sceneItem.position.y,
        scale: sceneItem.scale.x,
    });

    initialValue.current.x = sceneItem.position.x;
    initialValue.current.y = sceneItem.position.y;
    initialValue.current.scale = sceneItem.scale.x;
    console.log(initialValue.current.scale);

    const {
        sourceWidth: sceneItemSourceWidth,
        sourceHeight: sceneItemSourceHeight,
        position: { alignment: sceneItemAlignment, x: sceneItemPositionX, y: sceneItemPositionY },
        scale: { x: sceneItemScale },
        width: sceneItemWidth,
        height: sceneItemHeight,
    } = sceneItem;
    const { baseWidth: sceneBaseWidth, baseHeight: sceneBaseHeight } = videoInfo;
    const sceneMinWidth = sceneMinWidthRatio * size.width;
    const sceneScale = sceneMinWidth / sceneBaseWidth;

    const sceneWidth = sceneBaseWidth * sceneScale;
    const sceneHeight = sceneBaseHeight * sceneScale;

    const itemWidth = sceneItemSourceWidth * sceneScale;
    const itemHeight = sceneItemSourceHeight * sceneScale;

    const onDrag = useCallback(
        ({ movement: [offsetX, offsetY] }) => {
            const relativeX = offsetX / sceneScale;
            const relativeY = offsetY / sceneScale;
            const newSceneItemWidth = sceneItemSourceWidth * lastValue.current.scale;
            const newSceneItemHeight = sceneItemSourceHeight * lastValue.current.scale;
            const {
                x: newSceneAlignmentOffsetX,
                y: newSceneAlignmentOffsetY,
            } = getSceneItemAlignmentOffset(
                sceneItemAlignment,
                newSceneItemWidth,
                newSceneItemHeight,
            );
            const left = 0 + newSceneAlignmentOffsetX;
            const top = 0 + newSceneAlignmentOffsetY;
            const right = -(newSceneItemWidth - sceneBaseWidth) + newSceneAlignmentOffsetX;
            const bottom = -(newSceneItemHeight - sceneBaseHeight) + newSceneAlignmentOffsetY;
            const newX =
                newSceneAlignmentOffsetX +
                relativeX +
                (initialValue.current.x - newSceneAlignmentOffsetX);
            const newY =
                newSceneAlignmentOffsetY +
                relativeY +
                (initialValue.current.y - newSceneAlignmentOffsetY);
            const newPosition = {
                x: Math.max(Math.min(left, newX), right),
                y: Math.max(Math.min(top, newY), bottom),
            };
            lastValue.current.x = newPosition.x;
            lastValue.current.y = newPosition.y;
            set(newPosition);
        },
        [
            set,
            sceneScale,
            sceneItemAlignment,
            sceneItemSourceWidth,
            sceneItemSourceHeight,
            sceneBaseWidth,
            sceneBaseHeight,
        ],
    );
    const minWidth = Math.min(sceneItemSourceWidth, sceneBaseWidth);
    const minHeight = Math.min(sceneItemSourceHeight, sceneBaseHeight);
    const minScale = Math.max(sceneBaseHeight / minHeight, sceneBaseWidth / minWidth);
    const onPinch = useCallback(
        ({ movement:[distance] }) => {
            const newScale = Math.max(minScale, distance / 100 + initialValue.current.scale);
            const newSceneItemWidth = sceneItemSourceWidth * newScale;
            const newSceneItemHeight = sceneItemSourceHeight * newScale;
            const {
                x: newSceneAlignmentOffsetX,
                y: newSceneAlignmentOffsetY,
            } = getSceneItemAlignmentOffset(
                sceneItemAlignment,
                newSceneItemWidth,
                newSceneItemHeight,
            );
            const left = 0 + newSceneAlignmentOffsetX;
            const top = 0 + newSceneAlignmentOffsetY;
            const right = -(newSceneItemWidth - sceneBaseWidth) + newSceneAlignmentOffsetX;
            const bottom = -(newSceneItemHeight - sceneBaseHeight) + newSceneAlignmentOffsetY;
            const newX = Math.max(Math.min(left, lastValue.current.x), right);
            const newY = Math.max(Math.min(top, lastValue.current.y), bottom);
            lastValue.current.x = newX;
            lastValue.current.y = newY;
            lastValue.current.scale = newScale;
            set({
                x: newX,
                y: newY,
                scale: newScale,
            });
        },
        [
            set,
            minScale,
            sceneWidth,
            sceneItemAlignment,
            sceneItemSourceWidth,
            sceneItemSourceHeight,
            sceneBaseWidth,
            sceneBaseHeight,
        ],
    );
    const onGestureStart = useCallback(() => {
        if (onStart !== null) {
            onStart();
        }
        if (onTap !== null) {
            onTap();
        }
        setInteracting(true);
    }, [onStart, onTap, setInteracting]);
    const onGestureStop = useCallback(() => {
        if (onStop !== null) {
            onStop();
        }
        setInteracting(false);
    }, [onStop, setInteracting]);
    const bind = useGesture(
        {
            onDrag,
            onDragStart: onGestureStart,
            onDragEnd: onGestureStop,
            onPinch,
            onPinchStart: onGestureStart,
            onPinchEnd: onGestureStop,
            onWheel: onPinch,
            onWheelStart: onGestureStart,
            onWheelEnd: onGestureStop,
        },
        {
            domTarget: refContainer.current,
            eventOptions: { passive: true, capture: true },
        },
    );

    // Update window size
    useEffect(() => {
        const { current: container } = refContainer;
        const updateSize = () =>
            setSize({
                width: container.offsetWidth,
                height: container.offsetHeight,
            });
        updateSize();
        const onResize = () => updateSize();
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, [setSize]);

    // Update when scene change
    useEffect(() => {
        set({
            x: sceneItemPositionX,
            y: sceneItemPositionY,
            scale: sceneItemScale,
        });
        lastValue.current.x = sceneItemPositionX;
        lastValue.current.y = sceneItemPositionY;
        lastValue.current.scale = sceneItemScale;
    }, [set, sceneItemPositionX, sceneItemPositionY, sceneItemScale]);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
            {...bind()}
            ref={refContainer}
        >
            <div
                className={styles.scene}
                style={{
                    width: sceneWidth,
                    height: sceneHeight,
                    marginLeft: -(sceneWidth / 2),
                    marginTop: -(sceneHeight / 2),
                }}
            >
                <div className={styles.label}>
                    {Math.round(sceneBaseWidth)}x{Math.round(sceneBaseHeight)}
                </div>
            </div>
            <animated.div
                style={{
                    transform: interpolate(
                        [x, y],
                        (ix, iy) =>
                            `translate3d(
                                ${ix * sceneScale - sceneWidth / 2}px,
                                ${iy * sceneScale - sceneHeight / 2}px,
                                0
                            )`,
                    ),
                    width: interpolate([scale], (iscale) => itemWidth * iscale),
                    height: interpolate([scale], (iscale) => itemHeight * iscale),
                    marginLeft: interpolate([scale], (iscale) => -((itemWidth * iscale) / 2)),
                    marginTop: interpolate([scale], (iscale) => -((itemHeight * iscale) / 2)),
                    backgroundImage: `url("${sceneItem.screenshot}")`,
                }}
                className={styles.item}
            >
                <div className={styles.label}>
                    {Math.round(sceneItemWidth)}x{Math.round(sceneItemHeight)} (
                    {sceneItemSourceWidth}x{sceneItemSourceHeight})
                </div>
            </animated.div>
        </div>
    );
};

Joystick.propTypes = propTypes;
Joystick.defaultProps = defaultProps;

export default Joystick;
