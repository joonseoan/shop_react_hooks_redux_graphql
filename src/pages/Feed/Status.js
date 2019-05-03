import React, { useState, useEffect } from 'react';
import { graphql } from 'react-apollo';

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';


const Status = props => {

    const [ status, setStatus ] = useState('');

    useEffect(() => {
        setStatus(props.status)
    }, []);

    const statusUpdateHandler = event => {
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


    return(<section>
        <form onSubmit={ statusUpdateHandler }>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              // onChange={this.statusInputChangeHandler}
              value={ status }
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
    </section>);
}

export default Status;