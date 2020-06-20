/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSpring, animated, interpolate } from 'react-spring';
import { useGesture } from 'react-use-gesture';

import styles from '../../styles/partials/joystick.module.scss';

const propTypes = {
    className: PropTypes.string,
    onStart: PropTypes.func,
    onStop: PropTypes.func,
    onChange: PropTypes.func,
};

const defaultProps = {
    className: null,
    onStart: null,
    onStop: null,
    onChange: null,
};

const Joystick = ({ className, onStart, onStop, onChange }) => {
    const refContainer = useRef(null);
    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });
    const [{ x, y }, set] = useSpring(() => ({
        x: 0,
        y: 0,
        onFrame: (position) => {
            if (onChange !== null) {
                onChange(position);
            }
        },
    }));

    const maxX = (size.width - 100) / 2;
    const maxY = (size.height - 100) / 2;

    const onDrag = useCallback(
        ({ offset: [newX, newY] }) => {
            const position = {
                x: Math.max(Math.min(newX / maxX, 1), -1),
                y: Math.max(Math.min(newY / maxY, 1), -1),
            };
            set(position);
        },
        [set, maxX, maxY],
    );
    const bind = useGesture({
        onDrag,
        onDragStart: onStart,
        onDragEnd: onStop,
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

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
            ref={refContainer}
        >
            <animated.div
                {...bind()}
                style={{
                    transform: interpolate(
                        [x, y],
                        (tx, ty) => `translate3d(${tx * maxX}px,${ty * maxY}px,0)`,
                    ),
                }}
                className={styles.knob}
            />
        </div>
    );
};

Joystick.propTypes = propTypes;
Joystick.defaultProps = defaultProps;

export default Joystick;
