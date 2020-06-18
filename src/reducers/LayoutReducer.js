import { SET_SIZE } from '../actions/LayoutActions';

const initialState = {
    size: {
        width: window.innerWidth || 0,
        height: window.innerHeight || 0,
    },
};

const LayoutReducer = (previousState, action) => {
    let state = previousState || initialState;
    if (typeof state.hydrated === 'undefined' || !state.hydrated) {
        state = {
            ...initialState,
            ...previousState,
            hydrated: true,
        };
    }
    switch (action.type) {
    case SET_SIZE:
        return {
            ...state,
            size: {
                ...action.payload,
            },
        };
    default:
        return state;
    }
};

export default LayoutReducer;
