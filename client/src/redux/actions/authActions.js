import axios from 'axios';
import setAuthToken from '../../utils/setAuthToken';
import jwt_decode from 'jwt-decode';

import {
    GET_ERRORS,
    SET_CURRENT_USER,
    USER_LOADING,
    SET_USER_LOADING,
} from './types';

// Register User
export const registerUser = (userData, history) => async (dispatch) => {
    dispatch(setUserLoading());
    try {
        const user = await axios.post('/api/users/register', userData);
        dispatch(setUsersLoading());
        history.push({ pathname: '/login', state: true });
    } catch (err) {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data,
        });
    }
};

// Login - Get User Token
export const loginUser = (userData) => async (dispatch) => {
    try {
        const res = await axios.post('/api/users/login', userData);
        dispatch(setUserLoading());
        // Save to localStorage
        const { token } = res.data;
        // Set token to ls
        localStorage.setItem('jwtToken', token);
        // Set token to Auth header
        setAuthToken(token);
        // Decode token to get user data
        const decoded = jwt_decode(token);
        // Set current user
        dispatch(setCurrentUser(decoded));
    } catch (err) {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data,
        });
    }
};

// Set logged in user
export const setCurrentUser = (decoded) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
    };
};

// User loading
export const setUserLoading = () => {
    return {
        type: USER_LOADING,
    };
};

export const setUsersLoading = () => {
    return {
        type: SET_USER_LOADING,
    };
};

// Log user out
export const logoutUser = () => (dispatch) => {
    // Remove token from localStorage
    localStorage.removeItem('jwtToken');
    // Remove auth header for future requests
    setAuthToken(false);
    // Set current user to {} which will set isAuthenticated to false
    dispatch(setCurrentUser({}));
};
