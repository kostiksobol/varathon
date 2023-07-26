import React from 'react';
import { Route, Routes, useNavigate, Outlet } from 'react-router-dom';
import {ChatsForm, MessagesUsersForm} from './Main';
import Login from './Login';
import Register from './Register';
import { HexString } from '@gear-js/api';
import { useAccount } from '@gear-js/react-hooks';

function Routing() {
  const navigate = useNavigate();
  const {account} = useAccount();
  return (
    <div>
      {/* <nav>
        <button onClick={() => navigate(`/${account?.meta.name}`)}>Main</button>
        <button onClick={() => navigate(`/${account?.meta.name}/login`)}>Login</button>
        <button onClick={() => navigate(`/${account?.meta.name}/register`)}>Register</button>
      </nav> */}


      <Routes>
        <Route key={`/${account?.meta.name}`} path={`/${account?.meta.name}`} element={<ChatsForm />}>
          <Route key={`/${account?.meta.name}/chat/:id`} path={`chat/:id`} element={<MessagesUsersForm />} />
        </Route>
        <Route key={`/${account?.meta.name}/login`} path={`/${account?.meta.name}/login`} element={<Login />} />
        <Route key={`/${account?.meta.name}/register`} path={`/${account?.meta.name}/register`} element={<Register />} />
      </Routes>
    </div>
  );
};

export { Routing}
