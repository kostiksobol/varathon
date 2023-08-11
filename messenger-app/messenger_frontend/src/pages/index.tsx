import { Route, Routes, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { useAccount } from '@gear-js/react-hooks';
import MessagesUsersForm from './main-page/MessagesUsersForm';
import LoginPage from './login-page/LoginPage';
import RegisterPage from './register-page/RegisterPage';
import MainLayer from './main-page/MainLayer';
import { ReactNode } from 'react';

function Routing() {
  const {account} = useAccount();
  return (
      <Routes>
        <Route key={`/${account?.meta.name}`} path={`/${account?.meta.name}`} element={<MainLayer />}>
          <Route key={`/${account?.meta.name}/chat/:id`} path={`chat/:id`} element={<MessagesUsersForm />} />
        </Route>
        <Route key={`/${account?.meta.name}/login`} path={`/${account?.meta.name}/login`} element={<LoginPage />} />
        <Route key={`/${account?.meta.name}/register`} path={`/${account?.meta.name}/register`} element={<RegisterPage />} />
      </Routes>
  );
};

export { Routing}