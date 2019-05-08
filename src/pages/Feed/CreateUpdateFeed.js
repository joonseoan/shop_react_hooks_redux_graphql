import React from 'react';
import { graphql, compose } from 'react-apollo';
import axios from 'axios';

import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
// import Mutations from './CreateUpdateMutations';
// console.log('Mutation: ', Mutations);

import CreatePost from '../../mutations/CreatePost';
import UpdatePost from '../../mutations/UpdatePost';

const CreateUpdateFeed = props => {

    console.log('props in CreateUpdateFeed: ', props)

    const finishEditHandler = postData => {
        
        props.setLoading(true);
        // this.setState({
        //   editLoading: true
        // });
        
        const body = new FormData();
        body.append('image', postData.image);

        if(props.selectedPost) {
          body.append('oldPath', props.selectedPost.imagePath);
        }

        axios.put('http://localhost:8080/post-image', body, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        // fetch('http://localhost:8080/post-image', {
        //   method: 'PUT',
        //   headers: {
        //     Authorization: 'Bearer ' + this.props.token,
        //   },
        //   body
        // })
        // .then(res => {
        //   return res.json();
        // })    
        .then(res => {

          // have to modify fo the central error control.
          if(!res) {
            throw new Error('Unable to get imagePath from the server');
        }
          
        const imageUrl = res.filePath || 'undefined';

        // let graphQLQuery = {
        //     query: `
        //       mutation CreatePost (
        //         $title: String!, 
        //         $content: String!,
        //         $imageUrl: String!
        //         ) {
        //         createPost(
        //           postInput: { 
        //             title: $title, 
        //             content: $content, 
        //             imageUrl: $imageUrl
        //           }) {
        //             _id
        //             title
        //             content
        //             imageUrl
        //             creator {
        //             name
        //           }
        //           createdAt
        //         }
        //       }
        //     `,
        //     variables: { title: postData.title, content: postData.content, imageUrl }
        //   };

        let mutations = props.CreatePost;
        if(props.selectedPost) mutations = props.UpdatePost;


    
          // if(this.state.editPost) {
          //   graphQLQuery = {
          //     query: `
          //       mutation UpdatePost( 
          //         $id: ID!,
          //         $title: String!,
          //         $content: String!,
          //         $imageUrl: String
          //         ) {
          //         updatePost(
          //           id: $id,
          //           postInput: { 
          //             title: $title, 
          //             content: $content, 
          //             imageUrl: $imageUrl }
          //         ) {
          //             _id
          //             title
          //             content
          //             imageUrl
          //             creator {
          //             name
          //           }
          //           createdAt
          //         }
          //       }
          //     `,
          //     variables: { 
          //         id: this.state.editPost._id,
          //         title: postData.title,
          //         content: postData.content,
          //         imageUrl
          //     }
          //   }
          // }

          // mutations({})
          return fetch('http://localhost:8080/graphql', {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + this.props.token,
              'Content-Type': 'application/json' // must need as long as we are not using FormData() above
            },
            body: JSON.stringify(mutations)
          })
        })
        .then(res => {
          return res.json();
        })    
        .then(resData => {
          if(resData.errors && resData.errors[0].status === 401) {
            throw new Error(resData.errors[0].data[0].message ||  resData.errors[0].message);   
          }
          
          if(resData.errors) {
            throw new Error('Unable to get posting data for post');
          }

          let fields = "createPost";
          if(this.state.editPost) {
            fields = "updatePost";
          }
          const post = {
            _id: resData.data[fields]._id,
            title: resData.data[fields].title,
            content: resData.data[fields].content,
            creator: resData.data[fields].creator,
            createdAt: resData.data[fields].createdAt,
            imagePath: resData.data[fields].imageUrl
          };
    
          this.setState(prevState => {
    
            let updatedPosts = [...prevState.posts];
            let updatedTotalPosts = prevState.totalPosts;
            if (prevState.editPost) {
                const postIndex = prevState.posts.findIndex(
                    p => p._id === prevState.editPost._id
                );
                updatedPosts[postIndex] = post;
            } else {
                updatedTotalPosts++;
                
                if (prevState.posts.length >= 2) {
                    updatedPosts.pop();
                }
                updatedPosts.unshift(post);
            }
    
            return {
              posts: updatedPosts,
              isEditing: false,
              editPost: null,
              editLoading: false,
              totalPosts: updatedTotalPosts
            };
    
          });
        })
        .catch(err => {
          console.log(err);
          this.setState({
            isEditing: false,
            editPost: null,
            editLoading: false,
            error: err
          });
        });
      };
    
    return (<React.Fragment>
        <FeedEdit
            editing={ props.editing }
            selectedPost={props.selectedPost }
            loading={ props.loading }
            onCancelEdit={ props.onCancelEdit }
            onFinishEdit={ finishEditHandler }
        />
    </React.Fragment>);
}

export default compose(
  graphql(CreatePost, { name: 'CreatePost' }),
  graphql(UpdatePost, { name: 'UpdatePost '})
)(CreateUpdateFeed);