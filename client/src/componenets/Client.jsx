import React from 'react'
import Avatar from 'react-avatar'

function Client({username}) {
  return (
    <div className="my-3 mx-3 flex items-center">
    <Avatar name={username} size={38} round="16px" />
    <span className="mx-2 text-white">{username}</span>
  </div>
  )
}

export default Client