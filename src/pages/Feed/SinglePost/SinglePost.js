import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    
    // [ GraphQL ]
    const GraphqlQuery = {
      query: `query Post($id: ID!) {
        post(id: $id) {
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
      variables: { id: postId }
    };

    fetch('http://localhost:8080/graphql', {

    // [ REST ]
    // fetch('http://localhost:8080/feed/post/' + postId, {
      
      method: 'POST',
      headers: { 
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body : JSON.stringify(GraphqlQuery)
    })
    .then(res => {
      // if (res.status !== 200) {
      //   throw new Error('Failed to fetch status');
      // }
      return res.json();
    })
    .then(resData => {
      console.log(resData)

      if(resData.errors) {
        throw new Error('Failed to get a single page');
      }
      // console.log(resData)

      // changed property of [ GraphQL ]
      this.setState({
        title: resData.data.post.title,
        author: resData.data.post.creator.name,
        // imageUrl: "images/lady.PNG"
        image: 'http://localhost:8080/' + resData.data.post.imageUrl,
        date: new Date(resData.data.post.createdAt).toLocaleDateString('en-US'),
        content: resData.data.post.content
      });
    })
    .catch(err => {
      console.log(err);
    });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
