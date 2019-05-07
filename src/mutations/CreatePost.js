import gql from 'graphql-tag';

export default gql`
    mutation CreatePost (
        $title: String!, 
        $content: String!,
        $imageUrl: String!
        ) {
            createPost(
              postInput: { 
                title: $title, 
                content: $content, 
                imageUrl: $imageUrl
              }) {
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