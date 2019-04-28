// export const AuthType = {
//     USER_LOGIN: 'USER_LOGIN',
//     USER_SIGNUP: 'USER_SIGNUP',
//     USER_LOGOUT: 'USER_LOGOUT'
// }

export const authManager = authData => {
    return {
        type: 'USER_AUTH',
        payload: authData
    }
};