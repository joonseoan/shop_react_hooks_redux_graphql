import React, { Component, Fragment } from 'react';
// import openSocket from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import CreateUpdateFeed from './CreateUpdateFeed';
import './Feed.css';

class Feed extends Component {

  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {

    const graphQLQuery = {
      query: `
        {
          user {
            status
          }
        }
      
      `
    };
    // WORKING ONCE.
    // It is the same page as modal including post form.
    
    // [ GraphQL ]
    fetch('http://localhost:8080/graphql', {
    // [REST]
    // etch('http://localhost:8080/auth/getStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.props.token
      },
      body: JSON.stringify(graphQLQuery)
    })
    .then(res => {
      // if (res.status !== 200) {
      //   throw new Error('Failed to fetch user status.');
      // }
      return res.json();
    })
    .then(resData => {
      if(resData.errors) {
        throw new Error('Unable to get status.');
      }
      // console.log(resData)
      this.setState({ status: resData.data.user.status });
    })
    .catch(this.catchError);

    this.loadPosts();

    // [ Socket IO] 
    // connection via socket io.
    // console.log(openSocket('http://localhost:8080'))
    // const socket = openSocket('http://localhost:8080');
    // console.log(socket)

    // It is asynch function like setInterval(funtion => {}, time); ************************************
    // Therefor, it is always ready to listen!!!
    // socket.on('posts', data => {
    //   console.log('data.action: ', data.action);
    //   if(data.action === 'create') {
    //     this.addPostBySocket(data.post);
    //   } else if(data.action === 'update') {
    //     this.updatePostBySocket(data.post);
    //   } else if(data.action === 'delete') {
    //     this.loadPosts();
    //   }
    // });
  }

  // [ socketio ]
  // for socket io based application. Its count-partner in server is a socketio.js
  // addPostBySocket = post => {
  //   console.log('post in addPost: ', post)
  //   this.setState(prevState => {
  //     const updatedPosts = [ ...prevState.posts ];
  //     if(prevState.postPage === 1) {
  //       // delete the last element
  //       updatedPosts.pop();
  //       // add post to the first element
  //       updatedPosts.unshift(post)
  //     }
  //     return {
  //       posts: updatedPosts,
  //       totalPosts: prevState.totalPosts + 1
  //     };

  //   });
  // };

  // updatePostBySocket = post => {
  //   this.setState(prevState => {
  //     let updatedPosts = [ ...prevState.posts ];
  //     const updatedPostIndex = updatedPosts.findIndex(ePost => ePost._id === post._id );
  //     if(updatedPostIndex > -1) {
  //       // because it is "PUT", NOT "PATCH"
  //       updatedPosts[updatedPostIndex] = post;
  //     } else {
  //       throw new Error ('Unable to find the post.');
  //     }
  //     return {
  //       posts: updatedPosts
  //     };
  //   });
  // }

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
      // console.log(resData);
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

  statusUpdateHandler = event => {
    event.preventDefault();
    const graphQLQuery = {
      query: `
        mutation UpdateStatus($status: String!) {
          updateStatus(status: $status) {
            status
          }
        }
      `,
       variables: { status: this.state.status }
    }

    fetch('http://localhost:8080/graphql', {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.props.token
      },
      body: JSON.stringify(graphQLQuery)
    })
    .then(res => {
      // if (res.status !== 200 && res.status !== 201) {
      //   throw new Error("Can't update status!");
      // }
      return res.json();
    })
    .then(resData => {
      console.log(resData);
      if(resData.errors) {
        throw new Error('Unable to updated status');
      }
    })
    .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  // finishEditHandler = postData => {
  //   this.setState({
  //     editLoading: true
  //   });

  //   // ------------------------------ image input setup ------------------------------------------------------
  //   // Set up data (with image!)
  //   // when we use multer, or when we upload a large amount of data
  //   //  we should use "formData"
  //   //  which is built-in javascript object.

  //   // json is a just text-based data. 
  //   // Therefore, it would be complicated to support large-data file.
    
  //   const body = new FormData();
  //   // [ GraphQL / REST]

  //   // two tracks : 
  //   //  1) 'image' : input from user
  //   //    when posting for the first time, it assumes 
  //   //    that 'image' must be entered. **** we do not care about edit here
  //   body.append('image', postData.image);
  //   /* 
  //     1) when user attaches a new file: mages/fb9b25c0-f019-453d-871d-4f4dee829e7e

  //     lastModified: 1553787226610
  //     lastModifiedDate: Thu Mar 28 2019 11:33:46 GMT-0400 (Eastern Daylight Time) {}
  //     name: "kelly.PNG"
  //     size: 193800
  //     type: "image/png"
  //     webkitRelativePath: ""
  //     __proto__: File

  //   // It sends a image path anyway even though the user did not enter a file name.
  //   // But req.file is not available because it doe not have property "image/png"
  //   2) when the user does not enter a new file during editing.
  //     // **************** just remember the previous file 
  //     //  because it is in the formData instance.    
     
  //     // in this case req.body
  //     images/fb9b25c0-f019-453d-871d-4f4dee829e7e

  //   */
  //   console.log('body.image: ', postData.image);

  //   //  2) 'oldPath' : when editing the post, the user must send
  //   //    regardless of wheather or not 'images' is available.
  //   //    the exsisting image URL.
  //   if(this.state.editPost) {
  //     body.append('oldPath', this.state.editPost.imagePath);
  //   }

  //   // ----------------------------------------------------------------------------------------------------------------------------------


  //   // ------------------------------------------------------------------ Send image data ------------------------------------------------------------
  //   fetch('http://localhost:8080/post-image', {
  //     method: 'PUT',
  //     headers: {
  //       Authorization: 'Bearer ' + this.props.token,
  //     },
  //     body
  //   })
  //   .then(res => {
  //     return res.json();
  //   })

  //   // ----------------------------------- receives server's imagePath from app.use('./post-iamge') --------------------------------------
  //   .then(res => {
  //     if(!res) {
  //       throw new Error('Unable to get imagePath from the server');
  //     }
  //     /* 
  //       return res.status(201).json({
  //         message: 'File stored',
  //         filePath: req.file.path
  //       });
  //     */
  //    // ================================== GraphQL quiery / mutation with image ======================================

  //    // Bear in mind that ! mark must be identical with type defintion in schema in the server!!!!!!!!!!!!!!!!!
  //     const imageUrl = res.filePath || 'undefined';
  //     let graphQLQuery = {
  //       query: `
  //         mutation CreatePost (
  //           $title: String!, 
  //           $content: String!,
  //           $imageUrl: String!
  //           ) {
  //           createPost(
  //             postInput: { 
  //               title: $title, 
  //               content: $content, 
  //               imageUrl: $imageUrl
  //             }) {
  //               _id
  //               title
  //               content
  //               imageUrl
  //               creator {
  //               name
  //             }
  //             createdAt
  //           }
  //         }
  //       `,
  //       variables: { title: postData.title, content: postData.content, imageUrl }
  //     };

  //     if(this.state.editPost) {
  //       graphQLQuery = {
  //         query: `
  //           mutation UpdatePost( 
  //             $id: ID!,
  //             $title: String!,
  //             $content: String!,
  //             $imageUrl: String
  //             ) {
  //             updatePost(
  //               id: $id,
  //               postInput: { 
  //                 title: $title, 
  //                 content: $content, 
  //                 imageUrl: $imageUrl }
  //             ) {
  //                 _id
  //                 title
  //                 content
  //                 imageUrl
  //                 creator {
  //                 name
  //               }
  //               createdAt
  //             }
  //           }
  //         `,
  //         variables: { 
  //             id: this.state.editPost._id,
  //             title: postData.title,
  //             content: postData.content,
  //             imageUrl
  //         }
  //       }
  //     }

  //     return fetch('http://localhost:8080/graphql', {
  //       // 2) to support image data
  //       method: 'POST',
  //       headers: {
  //         Authorization: 'Bearer ' + this.props.token,
  //         'Content-Type': 'application/json' // must need as long as we are not using FormData() above
  //       },
  //       body: JSON.stringify(graphQLQuery)

  //       // 1)
  //       // since we used multer for file path, json can't support it.
  //       // headers: {
  //       //   'Content-Type': 'application/json'
  //       // },
  //       // body: JSON.stringify({ 
  //       //   title: postData.title,
  //       //   content: postData.content
  //       // })
  //     })
  //   })


  //   // [ Legacy ]
  //   // for legacy and ( restul api becaus restful api also deals with json only
  //   // defining an object, "formData"
  //   // body.append('title', postData.title);
  //   // body.append('content', postData.content);
  //   // body.append('image', postData.image);


  //   // [ REST ]
  //   // let url = 'http://localhost:8080/feed/createPost';
  //   // let method = 'POST';

  //   // // when editing
  //   // if (this.state.editPost) {
  //   //   url = 'http://localhost:8080/feed/post/' + this.state.editPost._id;
  //   //   method = 'PUT';
  //   // }

  //   // [ GraphQL ]
  //   // Since the image file...
  //   // we just need "name" of creator
  //   // let graphQLQuery = {
  //   //   query: `
  //   //     mutation {
  //   //       createPost(
  //   //         postInput: { 
  //   //           title: "${postData.title}", 
  //   //           content: "${postData.content}", 
  //   //           imageUrl:"some url" }
  //   //       ) {
  //   //           _id
  //   //           title
  //   //           content
  //   //           imageUrl
  //   //           creator {
  //   //            name
  //   //         }
  //   //         createdAt
  //   //       }
  //   //     }
  //   //   `
  //   // }

  //   // fetch('http://localhost:8080/graphql', {
  //   //   // 2) to support image data
  //   //   method: 'POST',
  //   //   headers: {
  //   //     Authorization: 'Bearer ' + this.props.token,
  //   //     'Content-Type': 'application/json' // must need as long as we are not using FormData() above
  //   //   },
  //   //   body: JSON.stringify(graphQLQuery)

  //   //   // 1)
  //   //   // since we used multer for file path, json can't support it.
  //   //   // headers: {
  //   //   //   'Content-Type': 'application/json'
  //   //   // },
  //   //   // body: JSON.stringify({ 
  //   //   //   title: postData.title,
  //   //   //   content: postData.content
  //   //   // })
  //   // })
  //   .then(res => {

  //     // [ REST ]
  //     // console.log('res.status: ', res.status)
  //     // if (res.status !== 200 && res.status !== 201) {
  //     //   throw new Error('Creating or editing a post failed!');
  //     // }
  //     return res.json();
  //   })

  //   // -------------------------- Updating new post to the browser -----------------------------------------
  //   .then(resData => {
  //     if(resData.errors && resData.errors[0].status === 401) {
  //       throw new Error(resData.errors[0].data[0].message ||  resData.errors[0].message);   
  //     }
      
  //     if(resData.errors) {
  //       throw new Error('Unable to get posting data for post');
  //     }
      
  //     console.log('res: ', resData)
  //     // remove "post" property for [ GRAPHQL ]

  //     // ----------------------------------------------- useful!!!!!!!!!!!!! ***************************
  //     // since we use updatePost
  //     let fields = "createPost";
  //     if(this.state.editPost) {
  //       fields = "updatePost";
  //     }
  //     const post = {
  //       _id: resData.data[fields]._id,
  //       title: resData.data[fields].title,
  //       content: resData.data[fields].content,
  //       creator: resData.data[fields].creator,
  //       createdAt: resData.data[fields].createdAt,
  //       // ******************************************************8
  //       // In the server side, ipagePath is not available.
  //       // The reason for adding imageUrl to imagePath(new field)
  //       //    is because to find "oldImage and remove" it in the image folder
  //       // If we use imageUrl, it will remove the current image in the image folder.
  //       imagePath: resData.data[fields].imageUrl
  //     };

  //     // this.state return!!!!!!!!!!!!!!!!
  //     this.setState(prevState => {

  //       // 2)
  //       let updatedPosts = [...prevState.posts];
  //       let updatedTotalPosts = prevState.totalPosts;
  //       if (prevState.editPost) {
  //           const postIndex = prevState.posts.findIndex(
  //               p => p._id === prevState.editPost._id
  //           );
  //           updatedPosts[postIndex] = post;
  //       } else {
  //           updatedTotalPosts++;
            
  //           if (prevState.posts.length >= 2) {
  //               updatedPosts.pop();
  //           }
  //           updatedPosts.unshift(post);
  //       }


  //       // 1)
  //       // [ GraphQL ]
  //       // let updatedPosts = [ ...prevState.posts ];
  //       // if(prevState.editPost) {
  //       //   const postIndex = prevState.posts.findIndex(
  //       //     post => post._id === prevState.editPost._id
  //       //   );
  //       //     updatedPosts[postIndex] = post;
  //       // } else {
  //       //   // because it is decsending....
  //       //   updatedPosts.pop();
  //       //   updatedPosts.unshift(post);
  //       // }

  //       // [ REST ]
  //       // [ It is not required because the process shown below are done ********************************888
  //       //   in the socketIO functions, addPostBySocketIO AND updatePostBySocket up and above]

  //       // let updatedPosts = [...prevState.posts];
  //       // if (prevState.editPost) {
  //       //   const postIndex = prevState.posts.findIndex(
  //       //     p => p._id === prevState.editPost._id
  //       //   );
  //       //   updatedPosts[postIndex] = post;
  //       //   } 
  //       //   else if (prevState.posts.length < 2) {
  //       //   updatedPosts = prevState.posts.concat(post);
  //       // }

  //       return {
  //         posts: updatedPosts,
  //         isEditing: false,
  //         editPost: null,
  //         editLoading: false,
  //         totalPosts: updatedTotalPosts
  //       };

  //     });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     this.setState({
  //       isEditing: false,
  //       editPost: null,
  //       editLoading: false,
  //       error: err
  //     });
  //   });
  // };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
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

    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        {/* 
        
          <FeedEdit
            editing={this.state.isEditing}
            selectedPost={this.state.editPost}
            loading={this.state.editLoading}
            onCancelEdit={this.cancelEditHandler}
            onFinishEdit={this.finishEditHandler}
          />
        */}

        <CreateUpdateFeed 
          editing={ this.state.isEditing }
          selectedPost={ this.state.editPost }
          loading={ this.state.editLoading }
          onCancelEdit={ this.cancelEditHandler }
          setLoading={ (edit) => { this.setState({ editLoading: edit }) }}
          // onFinishEdit={this.finishEditHandler}
        />
        
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
