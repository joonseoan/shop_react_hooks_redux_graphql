// import React, { useState, useEffect } from 'react';
// import CreatePost from '../../mutations/CreatePost';
// import UpdatePost from '../../mutations/UpdatePost';

// const CreateUpdateMutations = ({ editPost }) => {

//     const [ edit, setEdit ] = useState(null);

//     useEffect(() => {

//         setEdit(editPost);

//     }, [ editPost ]);

//     if(!edit) {
//         return CreatePost;
//     } else {
//         return UpdatePost;
//     }
// }

// export default CreateUpdateMutations;