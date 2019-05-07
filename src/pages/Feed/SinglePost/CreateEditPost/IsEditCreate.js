import React, { useState, useEffect } from 'react';

import CreatePost from '../../../../mutations/CreatePost';
import UpdatePost from '../../../../mutations/UpdatePost';

const IsEditCreate = editPost => {

    const [ edit, setEdit ] = useState();

    useEffect(() => {

        setEdit(editPost);

    }, [ editPost ]);

    if(!edit) { 
        return CreatePost;
    } else {
        return UpdatePost;
    } 
}

export default IsEditCreate;
