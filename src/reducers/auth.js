// import { AuthType } from '../actions';

const INITIAL_STATE = {
    isAuth: false,
    userId: '',
    token: '',
    authLoading: false,
    error: []
}

export default (state = INITIAL_STATE, action) => {

    switch(action.type) {
        case 'USER_AUTH' :
            return { ...state, ...action.payload };
        // case AuthType.USER_SIGNUP:
        //     return { ...state, ...action.payload };
        // case AuthType.USER_LOGOUT:
        //     return { ...state, ...action.payload };
        default:
            return state;
    }
}