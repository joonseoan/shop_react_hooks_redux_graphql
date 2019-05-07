import gql from 'graphql-tag';

export default gql`
    mutation UpdatePost( 
        $id: ID!,
        $title: String!,
        $content: String!,
        $imageUrl: String
        ) {
        updatePost(
        id: $id,
        postInput: { 
            title: $title, 
            content: $content, 
            imageUrl: $imageUrl }
        ) {
            _id
            title
            content
            imageUrl
            creator {
            name
        }
         createdAt
        }
    }
`;