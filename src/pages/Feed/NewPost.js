import React, { useState } from 'react';

import Button from '../../components/Button/Button';

const NewPost = props => {
    
    return(
      <React.Fragment>
        <Button mode="raised" design="accent" onClick={ props.newPostHandler }>
          New Post
        </Button>
      </React.Fragment>
    );
}

export default NewPost;