import React from 'react'

const Error = (props) => {
    return (
        <div className="alert alert-danger" role="alert">
            {props.message || 'Error'}
        </div>
    )
}

export default Error