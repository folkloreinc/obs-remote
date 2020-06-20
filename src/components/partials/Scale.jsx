import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import SliderInput from 'rc-slider';

import 'rc-slider/assets/index.css';
import styles from '../../styles/partials/scale.module.scss';

const propTypes = {
    sceneItem: PropTypes.shape({
        scale: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        }),
        sourceWidth: PropTypes.number,
        sourceHeight: PropTypes.number,
    }).isRequired,
    videoInfo: PropTypes.shape({
        baseWidth: PropTypes.number,
        baseHeight: PropTypes.number,
    }).isRequired,
    step: PropTypes.number,
    className: PropTypes.string,
    onChange: PropTypes.func,
    onStart: PropTypes.func,
    onStop: PropTypes.func,
};

const defaultProps = {
    step: 0.001,
    className: null,
    onChange: null,
    onStart: null,
    onStop: null,
};

const Scale = ({ sceneItem, videoInfo, step, className, onStart, onStop, onChange }) => {
    const minWidth = Math.min(sceneItem.sourceWidth, videoInfo.baseWidth);
    const minHeight = Math.min(sceneItem.sourceHeight, videoInfo.baseHeight);
    const min = Math.max(videoInfo.baseHeight / minHeight, videoInfo.baseWidth / minWidth);
    const max = 10;
    const [value, setValue] = useState(sceneItem.scale.x);
    const onSliderChange = useCallback(
        (newValue) => {
            setValue(newValue);
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [setValue, onChange],
    );
    useEffect(() => {
        setValue(sceneItem.scale.x);
    }, [sceneItem, setValue]);
    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <SliderInput
                value={value}
                min={min}
                max={max}
                step={step}
                onBeforeChange={onStart}
                onChange={onSliderChange}
                onAfterChange={onStop}
            />
        </div>
    );
};

Scale.propTypes = propTypes;
Scale.defaultProps = defaultProps;

export default Scale;
