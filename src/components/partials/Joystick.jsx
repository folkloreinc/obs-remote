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
}

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
    }).isRequired,
    videoInfo: PropTypes.shape({
        baseWidth: PropTypes.number,
        baseHeight: PropTypes.number,
    }).isRequired,
    sceneMinWidth: PropTypes.number,
    className: PropTypes.string,
    onStart: PropTypes.func,
    onStop: PropTypes.func,
    onChange: PropTypes.func,
};

const defaultProps = {
    sceneMinWidth: 100,
    className: null,
    onStart: null,
    onStop: null,
    onChange: null,
};

const Joystick = ({
    sceneItem,
    videoInfo,
    sceneMinWidth,
    className,
    onStart,
    onStop,
    onChange,
}) => {
    const refContainer = useRef(null);
    // eslint-disable-next-line
    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });
    const [{ x, y, scale }, set] = useSpring(() => ({
        x: sceneItem.position.x,
        y: sceneItem.position.y,
        scale: sceneItem.scale.x,
        immediate: true,
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
    const lastPosition = useRef({
        x: sceneItem.position.x,
        y: sceneItem.position.y,
    });

    const {
        sourceWidth: sceneItemSourceWidth,
        sourceHeight: sceneItemSourceHeight,
        position: { alignment: sceneItemAlignment, x: sceneItemPositionX, y: sceneItemPositionY },
        scale: { x: sceneItemScale },
        width: sceneItemWidth,
        height: sceneItemHeight,
    } = sceneItem;
    const { baseWidth: sceneBaseWidth, baseHeight: sceneBaseHeight } = videoInfo;
    const sceneScale = sceneMinWidth / sceneBaseWidth;

    const sceneWidth = sceneBaseWidth * sceneScale;
    const sceneHeight = sceneBaseHeight * sceneScale;

    const {
        x: sceneAlignmentOffsetX,
        y: sceneAlignmentOffsetY,
    } = getSceneItemAlignmentOffset(sceneItemAlignment, sceneItemWidth, sceneItemHeight);

    const itemWidth = sceneItemSourceWidth * sceneScale;
    const itemHeight = sceneItemSourceHeight * sceneScale;

    const onDrag = useCallback(
        ({ offset: [offsetX, offsetY] }) => {
            const relativeX = offsetX / sceneScale;
            const relativeY = offsetY / sceneScale;
            const newX =
                sceneAlignmentOffsetX +
                relativeX +
                (initialValue.current.x - sceneAlignmentOffsetX);
            const newY =
                sceneAlignmentOffsetY +
                relativeY +
                (initialValue.current.y - sceneAlignmentOffsetY);
            const left = 0 + sceneAlignmentOffsetX;
            const top = 0 + sceneAlignmentOffsetY;
            const right = -(sceneItemWidth - sceneBaseWidth) + sceneAlignmentOffsetX;
            const bottom = -(sceneItemHeight - sceneBaseHeight) + sceneAlignmentOffsetY;
            const newPosition = {
                x: Math.max(Math.min(left, newX), right),
                y: Math.max(Math.min(top, newY), bottom),
            };
            lastPosition.current = newPosition;
            set(newPosition);
        },
        [
            set,
            sceneScale,
            sceneItemWidth,
            sceneItemHeight,
            sceneBaseWidth,
            sceneBaseHeight,
            sceneAlignmentOffsetX,
            sceneAlignmentOffsetY,
        ],
    );
    const onPinch = useCallback(
        ({ offset: [distance] }) => {
            const newScale = distance / sceneWidth + initialValue.current.scale;
            const newSceneItemWidth = sceneItemSourceWidth * newScale;
            const newSceneItemHeight = sceneItemSourceHeight * newScale;
            const {
                x: newSceneAlignmentOffsetX,
                y: newSceneAlignmentOffsetY,
            } = getSceneItemAlignmentOffset(sceneItemAlignment, newSceneItemWidth, newSceneItemHeight);
            const left = 0 + newSceneAlignmentOffsetX;
            const top = 0 + newSceneAlignmentOffsetY;
            const right = -(newSceneItemWidth - sceneBaseWidth) + newSceneAlignmentOffsetX;
            const bottom = -(newSceneItemHeight - sceneBaseHeight) + newSceneAlignmentOffsetY;
            const newX = Math.max(Math.min(left, lastPosition.current.x), right);
            const newY = Math.max(Math.min(top, lastPosition.current.y), bottom);
            lastPosition.current.x = newX;
            lastPosition.current.y = newY;
            set({
                x: newX,
                y: newY,
                scale: newScale,
            });
        },
        [
            set,
            sceneItemAlignment,
            sceneWidth,
            sceneItemSourceWidth,
            sceneItemSourceHeight,
            sceneBaseWidth,
            sceneBaseHeight,
        ],
    );
    const bind = useGesture({
        onDrag,
        onDragStart: onStart,
        onDragEnd: onStop,
        onPinch,
        onPinchStart: onStart,
        onPinchEnd: onStop,
    });

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
    }, [refContainer.current, setSize]);

    useEffect(() => {
        set({
            x: sceneItemPositionX,
            y: sceneItemPositionY,
            scale: sceneItemScale,
        });
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
