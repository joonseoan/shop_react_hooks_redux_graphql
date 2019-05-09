import React from 'react';
import { graphql, compose } from 'react-apollo';
import axios from 'axios';

import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import CreatePost from '../../mutations/CreatePost';
import UpdatePost from '../../mutations/UpdatePost';

const CreateUpdateFeed = props => {

    console.log('props in CreateUpdateFeed: ', props)

    const finishEditHandler = postData => {
        
        props.setLoading(true);
        
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
        .then(res => {
  
          if(!res) {
            throw new Error('Unable to get imagePath from the server');
          }
          
          const imageUrl = res.filePath || 'undefined';

          let mutations = props.CreatePost;
          let variables = { title: postData.title, content: postData.content, imageUrl }

          if(props.selectedPost) {
            mutations = props.UpdatePost;
            variables = {
              id: props.selectedPost._id, // need to check out
              title: postData.title,
              content: postData.content,
              imageUrl
            }
          } 

          mutations({
            variables
          })
          .then(resData => {

            if(resData.errors && resData.errors[0].status === 401) {
              // need to re-organize
              console.log(resData);
              // throw new Error(resData.errors[0].data[0].message ||  resData.errors[0].message);   
            }
            
            if(resData.errors) {
              throw new Error('Unable to get posting data for post');
            }

            let fields = "createPost";

            if(props.selectedPost) {
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

            props.getPost(post);
            props.feedHandler();

          })
          .catch(e => {
            console.log(e)
          })
        })
        .catch(err => {
          console.log(err);
          props.resetFeedHanlder(err);
        });

    }
    
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
  graphql(UpdatePost, { name: 'UpdatePost'})
)(CreateUpdateFeed);