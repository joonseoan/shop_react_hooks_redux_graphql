import gql from 'graphql-tag';

export default gql`
    mutation UpdateStatus($status: String!) {
        updateStatus(status: $status) {
            status
        }
    }
`;