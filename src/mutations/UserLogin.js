import gql from 'graphql-tag';

// must have "!" mark because it is required to find a song.
export default gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            userId
            token
        }
    }
`;