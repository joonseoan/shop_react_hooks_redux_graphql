import React, { useState, useEffect } from 'react';
import { graphql } from 'react-apollo';

import UpdateStatus from '../../mutations/UpdateStatus';
import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';

const Status = props => {

    const [ status, setStatus ] = useState('');

    useEffect(() => {
        setStatus(props.status)
    }, []);

    const statusUpdateHandler = event => {
        event.preventDefault();
        props.mutate({
            variables: { status }
        })
        .then(res => {
             // must redefine to build centeric error handler
            if (res.status !== 200 && res.status !== 201) {
                throw new Error("Can't update status!");
            }
        })
        .catch(e => {
            // must redefine to build centeric error handler
            console.log(e);
        })
    };

    return(<React.Fragment>
            <form onSubmit={ statusUpdateHandler }>
                <Input
                    type="text"
                    placeholder="Your status"
                    control="input"
                    onChange={ (input, value) => { setStatus(value) } }
                    value={ status }
                />
                <Button mode="flat" type="submit">
                    Update
                </Button>
            </form>
        </React.Fragment>
    );
}

export default graphql(UpdateStatus)(Status);