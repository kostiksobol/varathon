import React, { useEffect, useRef } from 'react'
import { MessagesForm } from './MessagesForm'
import UsersForm from './UsersForm'

export default function MessagesUsersForm() {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: "70%"}}>
        <MessagesForm />
      </div>
      <div
        style={{
          flex: "30%",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <UsersForm />
      </div>
    </div>
  )
}
