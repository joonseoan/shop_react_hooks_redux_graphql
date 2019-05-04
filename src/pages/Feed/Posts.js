import React, { useState } from 'react';

import Post from '../../components/Feed/Post/Post';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';

const Posts = props => {

    const [ postsLoading, setPostLoading ] = useState(false); 
    const [ totalPosts, setTotalPosts ] = useState(null);
    const [ postPage, setPostPage ] = useState(1);

    const startEditPostHandler = postId => {
      this.setState(prevState => {
        const loadedPost = { ...prevState.posts.find(p => p._id === postId) };
  
        return {
          isEditing: true,
          editPost: loadedPost
        };
      });
    };

    return (
        <section className="feed">
          { postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          { props.posts.length <= 0 && !postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null }

          { !postsLoading && (
            <Paginator
              onPrevious={ props.loadPosts('previous') }
              onNext={ props.loadPosts('next') }
              lastPage={ Math.ceil(totalPosts / 2) }
              currentPage={ postPage }
            >
              { props.posts.map(post => (
                <Post
                  key={ post._id }
                  id={ post._id }
                  author={ post.creator.name }
                  date={ new Date(post.createdAt).toLocaleDateString('en-US') }
                  title={ post.title }
                  image={ post.imageUrl }
                  content={ post.content }
                  onStartEdit={ startEditPostHandler(post._id) }
                  onDelete={ props.deletePostHandler(post._id) }
                />
              )) }
            </Paginator>
          )}
        </section>
    );
}

export default Posts;