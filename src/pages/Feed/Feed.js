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
import NewPost from './NewPost';
import Status from './Status';
import './Feed.css';

class Feed extends Component {

  state = {
    isEditing: false,
    posts: [],
    post: null,
    totalPosts: 0,
    editPost: null,
    status: '',
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

  resetFeedHanlder = (err) => {
    this.setState({
      isEditing: false,
      editPost: null,
      editLoading: false,
      error: err
    });
  }

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  getPost = post => this.setState({ post });

  feedHandler = () => {
  
    this.setState(prevState => {
    
      let updatedPosts = [ ...prevState.posts ];
      let updatedTotalPosts = prevState.totalPosts;
      if (prevState.editPost) {
          const postIndex = prevState.posts.findIndex(
              p => p._id === prevState.editPost._id
          );
          updatedPosts[postIndex] = this.state.post;
      } else {
          updatedTotalPosts++;
          
          if (prevState.posts.length >= 2) {
              updatedPosts.pop();
          }
          updatedPosts.unshift(this.state.post);
      }

      return {
        posts: updatedPosts,
        isEditing: false,
        editPost: null,
        editLoading: false,
        totalPosts: updatedTotalPosts
      };
    });
  }

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

        <CreateUpdateFeed 
          editing={ this.state.isEditing }
          selectedPost={ this.state.editPost }
          loading={ this.state.editLoading }
          onCancelEdit={ this.cancelEditHandler }
          setLoading={ (edit) => { this.setState({ editLoading: edit }) }}
          getPost = { this.getPost }
          resetFeedHanlder = { this.resetFeedHanlder }
          feedHandler = { this.feedHandler }
        />
        
        <section className="feed__status">
          <Status />
        </section>

        <section className="feed__control">
          <NewPost newPostHandler={ this.newPostHandler }/>
        {/* 
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        */}
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
