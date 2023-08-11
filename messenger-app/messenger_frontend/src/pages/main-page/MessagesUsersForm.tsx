import React, { useEffect, useRef } from 'react'
import { MessagesForm } from './MessagesForm'
import UsersForm from './UsersForm'

export default function MessagesUsersForm() {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: "65%"}}>
        <MessagesForm />
      </div>
      <div
        style={{
          flex: "35%",
          height: "85vh",
          overflowY: "auto",
        }}
      >
        <UsersForm />
      </div>
    </div>
  )
}
