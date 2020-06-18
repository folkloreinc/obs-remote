/**
 * Constants
 */
export const SET_ERRORS = 'site@SET_ERRORS';
export const RESET_REQUEST = 'site@RESET_REQUEST';

/**
 * Actions creator
 */
export const setErrors = payload => ({
    type: SET_ERRORS,
    payload,
});

export const resetErrors = () => ({
    type: SET_ERRORS,
    payload: null,
});

export const resetRequest = () => ({
    type: RESET_REQUEST,
});
