import React, { useState } from 'react';

import Button from '../../components/Button/Button';

const NewPost = props => {
    
    return(
      <section className="feed__control">
        <Button mode="raised" design="accent" onClick={props.newPostHandler}>
          New Post
        </Button>
      </section>
    );
}

export default NewPost;