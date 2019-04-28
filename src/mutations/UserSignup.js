import gql from 'graphql-tag';

export default gql`
    mutation CreateUser($email: String!, $password: String!, $name: String!) {
        createUser(userInput: {
            email: $email,
            password: $password,
            name: $name}) 
            {
                _id
                email
                name
      }
    }
`;

