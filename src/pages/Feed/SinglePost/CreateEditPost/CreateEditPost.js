import React, { useState, useEffect } from 'react';

import FeedEdit from '../../../../components/Feed/FeedEdit/FeedEdit';
import mutation from './IsEditCreate';


const CreateEdiTpOST = props => {

    const [ isEditing, setIsEditing ] = useState(false);
    const [ editPost, setEditPost ] = useState(null);
    

    return (
        <FeedEdit
        //   editing={this.state.isEditing}
        //   selectedPost={this.state.editPost}
        //   loading={this.state.editLoading}
        //   onCancelEdit={this.cancelEditHandler}
        //   onFinishEdit={this.finishEditHandler}
        />
    );
}

export default CreateEdiTpOST;