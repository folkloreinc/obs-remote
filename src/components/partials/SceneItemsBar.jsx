import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const getValueFromSceneItem = (sceneItem, scene = null) =>
    sceneItem !== null
        ? `${scene !== null ? scene.name : sceneItem.scene}||${sceneItem.name}`
        : null;

const propTypes = {
    scenes: PropTypes.arrayOf(PropTypes.object).isRequired,
    sceneItem: PropTypes.shape({
        scene: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }),
    className: PropTypes.string,
    onSceneItemChange: PropTypes.func,
};

const defaultProps = {
    sceneItem: null,
    className: null,
    onSceneItemChange: null,
};

const SceneItemsBar = ({ scenes, sceneItem, className, onSceneItemChange }) => {
    const onSelectChange = useCallback(
        (e) => {
            const selectValue = (e.target.value || '').split('||');
            let value = null;
            if (selectValue.length > 1) {
                value = {
                    scene: selectValue[0],
                    sceneItem: selectValue[1],
                };
            }
            if (onSceneItemChange !== null) {
                onSceneItemChange(value);
            }
        },
        [onSceneItemChange],
    );
    return (
        <nav
            className={classNames([
                'navbar',
                'navbar-light',
                'bg-light',
                {
                    [className]: className !== null,
                },
            ])}
        >
            <form className="form-inline">
                <select
                    className="form-control"
                    value={sceneItem !== null ? getValueFromSceneItem(sceneItem) : null}
                    onChange={onSelectChange}
                >
                    <option value="">Sources</option>
                    {scenes.map((scene) => (
                        <optgroup label={scene.name} key={`scene-item-${scene.name}`}>
                            {scene.sources.map((source) => (
                                <option
                                    value={getValueFromSceneItem(source, scene)}
                                    key={`scene-item-${scene.name}-${source.name}`}
                                >
                                    {source.name}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </form>
        </nav>
    );
};

SceneItemsBar.propTypes = propTypes;
SceneItemsBar.defaultProps = defaultProps;

export default SceneItemsBar;
