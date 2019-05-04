import React, { Component, Fragment } from 'react';
import { graphql } from 'react-apollo';

import statusQuery from '../../query/statusQuery';


import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';


import Status from './Status';
import Posts from './Posts';

import './Feed.css';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    // status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {

    this.loadPosts();

  }

  loadPosts = direction => {
    // Pagination
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }

    // [ REST ]
    // // 2) With Pagination
    // // - ?page=' + page : to create req.query.page in the server. ****
    // // url for get/posts

    // // It is a "get" request. How can we send token, which is received from the server,
    // //  to verify it is a logged in user?

    // // While the user is using "get" in the rest api,
    // //  there are two ways to send data to the server
    // //  1) 
    // //  by using queries in the URL
    // //  like "http:localhost:8080/feed/post?page=1&token=tokenString..."
    // //  However, it is not elegant.
    // //  2)   
    // //  by using headers!! like the one below.
    // fetch('http://localhost:8080/feed/posts?page=' + page, {
    //   headers: {
    //     // "Authorization" is a official key name in header
    //     //  to send / receive authentication data. 
    //     // Please bear in mind that 
    //     // we set "res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');"
    //     //  in the server.
    //     // "this.props.token: ", from "App.js"
    //     Authorization: 'Bearer ' + this.props.token
    //   }
    // }) 

    // [ GraphQL ]
    const graphQLQuery = {
      query: `query Posts($page: Int!) {
          posts(page: $page) {
            posts {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
            }
            totalPosts
          } 
       }`,
       variables: { page }

    };

    // graphql method 'Post' even when getting only queraying data
    //  because it must send query commands!!!!!!!!!!************
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQLQuery)
    })
    .then(res => {
      // if (res.status !== 200) {
      //   throw new Error('Failed to fetch posts.');
      // }
      return res.json();
    })
    .then(resData => {
      console.log(resData);
      // we do not need to take care of validation erros!

      // we just need operation errors.
      if(resData.errors) {
        throw new Error('Unable to fetch posts.');
      }
      
      this.setState({
        // changing property for [GraphQL]
        posts: resData.data.posts.posts.map(post => {
          return {
            ...post,
            imagePath: post.imageUrl
          };
        }),
        // totalItems => totalPosts
        totalPosts: resData.data.posts.totalPosts,
        postsLoading: false
      });
    })
    .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };



  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    
    const body = new FormData();
    
    body.append('image', postData.image);
    

    //  2) 'oldPath' : when editing the post, the user must send
    //    regardless of wheather or not 'images' is available.
    //    the exsisting image URL.
    if(this.state.editPost) {
      body.append('oldPath', this.state.editPost.imagePath);
    }

    // ----------------------------------------------------------------------------------------------------------------------------------


    // ------------------------------------------------------------------ Send image data ------------------------------------------------------------
    fetch('http://localhost:8080/post-image', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
      },
      body
    })
    .then(res => {
      return res.json();
    })

    // ----------------------------------- receives server's imagePath from app.use('./post-iamge') --------------------------------------
    .then(res => {
      if(!res) {
        throw new Error('Unable to get imagePath from the server');
      }
      /* 
        return res.status(201).json({
          message: 'File stored',
          filePath: req.file.path
        });
      */
     // ================================== GraphQL quiery / mutation with image ======================================

     // Bear in mind that ! mark must be identical with type defintion in schema in the server!!!!!!!!!!!!!!!!!
      const imageUrl = res.filePath || 'undefined';
      let graphQLQuery = {
        query: `
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
        `,
        variables: { title: postData.title, content: postData.content, imageUrl }
      };

      if(this.state.editPost) {
        graphQLQuery = {
          query: `
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
          `,
          variables: { 
              id: this.state.editPost._id,
              title: postData.title,
              content: postData.content,
              imageUrl
          }
        }
      }

      return fetch('http://localhost:8080/graphql', {
        // 2) to support image data
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + this.props.token,
          'Content-Type': 'application/json' // must need as long as we are not using FormData() above
        },
        body: JSON.stringify(graphQLQuery)

        // 1)
        // since we used multer for file path, json can't support it.
        // headers: {
        //   'Content-Type': 'application/json'
        // },
        // body: JSON.stringify({ 
        //   title: postData.title,
        //   content: postData.content
        // })
      })
    })


    // [ Legacy ]
    // for legacy and ( restul api becaus restful api also deals with json only
    // defining an object, "formData"
    // body.append('title', postData.title);
    // body.append('content', postData.content);
    // body.append('image', postData.image);


    // [ REST ]
    // let url = 'http://localhost:8080/feed/createPost';
    // let method = 'POST';

    // // when editing
    // if (this.state.editPost) {
    //   url = 'http://localhost:8080/feed/post/' + this.state.editPost._id;
    //   method = 'PUT';
    // }

    // [ GraphQL ]
    // Since the image file...
    // we just need "name" of creator
    // let graphQLQuery = {
    //   query: `
    //     mutation {
    //       createPost(
    //         postInput: { 
    //           title: "${postData.title}", 
    //           content: "${postData.content}", 
    //           imageUrl:"some url" }
    //       ) {
    //           _id
    //           title
    //           content
    //           imageUrl
    //           creator {
    //            name
    //         }
    //         createdAt
    //       }
    //     }
    //   `
    // }

    // fetch('http://localhost:8080/graphql', {
    //   // 2) to support image data
    //   method: 'POST',
    //   headers: {
    //     Authorization: 'Bearer ' + this.props.token,
    //     'Content-Type': 'application/json' // must need as long as we are not using FormData() above
    //   },
    //   body: JSON.stringify(graphQLQuery)

    //   // 1)
    //   // since we used multer for file path, json can't support it.
    //   // headers: {
    //   //   'Content-Type': 'application/json'
    //   // },
    //   // body: JSON.stringify({ 
    //   //   title: postData.title,
    //   //   content: postData.content
    //   // })
    // })
    .then(res => {

      // [ REST ]
      // console.log('res.status: ', res.status)
      // if (res.status !== 200 && res.status !== 201) {
      //   throw new Error('Creating or editing a post failed!');
      // }
      return res.json();
    })

    // -------------------------- Updating new post to the browser -----------------------------------------
    .then(resData => {
      if(resData.errors && resData.errors[0].status === 401) {
        throw new Error(resData.errors[0].data[0].message ||  resData.errors[0].message);   
      }
      
      if(resData.errors) {
        throw new Error('Unable to get posting data for post');
      }
      
      console.log('res: ', resData)
      // remove "post" property for [ GRAPHQL ]

      // ----------------------------------------------- useful!!!!!!!!!!!!! ***************************
      // since we use updatePost
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
        // ******************************************************8
        // In the server side, ipagePath is not available.
        // The reason for adding imageUrl to imagePath(new field)
        //    is because to find "oldImage and remove" it in the image folder
        // If we use imageUrl, it will remove the current image in the image folder.
        imagePath: resData.data[fields].imageUrl
      };

      // this.state return!!!!!!!!!!!!!!!!
      this.setState(prevState => {

        // 2)
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


        // 1)
        // [ GraphQL ]
        // let updatedPosts = [ ...prevState.posts ];
        // if(prevState.editPost) {
        //   const postIndex = prevState.posts.findIndex(
        //     post => post._id === prevState.editPost._id
        //   );
        //     updatedPosts[postIndex] = post;
        // } else {
        //   // because it is decsending....
        //   updatedPosts.pop();
        //   updatedPosts.unshift(post);
        // }

        // [ REST ]
        // [ It is not required because the process shown below are done ********************************888
        //   in the socketIO functions, addPostBySocketIO AND updatePostBySocket up and above]

        // let updatedPosts = [...prevState.posts];
        // if (prevState.editPost) {
        //   const postIndex = prevState.posts.findIndex(
        //     p => p._id === prevState.editPost._id
        //   );
        //   updatedPosts[postIndex] = post;
        //   } 
        //   else if (prevState.posts.length < 2) {
        //   updatedPosts = prevState.posts.concat(post);
        // }

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

  deletePostHandler = postId => {
    this.setState({ postsLoading: true });
    
    const graphQLQuery = {
      // do not need to { } and return value here.
      query: `
        mutation DeletePost ($id: ID!) {
          deletePost(id: $id)
        }
      `,
      variables: { id: postId }
    };

    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQLQuery)
    })
    .then(res => {
      // if (res.status !== 200 && res.status !== 201) {
      //   throw new Error('Deleting a post failed!');
      // }
      return res.json();
    })
    .then(resData => {
      if (resData.errors) {
        throw new Error('Deleting a post failed!');
      }

      // just refresh the page
      //  it automatically remove the post because no data in the database is available******************************
      this.loadPosts();

      // console.log(resData);
      // this.setState(prevState => {
      //   const updatedPosts = prevState.posts.filter(p => p._id !== postId);
      //   return { posts: updatedPosts, postsLoading: false };
      // });
    })
    .catch(err => {
      console.log(err);
      this.setState({ postsLoading: false });
    });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {

    if(this.props.data.loading) return <div>Loading...</div>;
    console.log('this.props.data.user.status: ', this.props.data.user.status)

    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <Status status= { this.props.data.user.status } />
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={ this.newPostHandler }>
            New Post
          </Button>
        </section>
        <section>
          <Posts posts = { this.state.posts } loadPosts={ this.loadPosts } deletePostHandler={ this.deletePostHandler }/>
        </section>
      </Fragment>
    );
  }
}

export default graphql(statusQuery)(Feed);
