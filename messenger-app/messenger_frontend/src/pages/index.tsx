import { Route, Routes, useNavigate, Outlet } from 'react-router-dom';
import { useAccount } from '@gear-js/react-hooks';
import MessagesUsersForm from './main-page/MessagesUsersForm';
import LoginPage from './login-page/LoginPage';
import RegisterPage from './register-page/RegisterPage';
import MainLayer from './main-page/MainLayer';

function Routing() {
  return (
      <Routes>
        <Route key={`/`} path={`/`} element={<MainLayer />}>
          <Route key={`/:id`} path={`/:id`} element={<MessagesUsersForm />} />
        </Route>
        <Route key={`/login`} path={`/login`} element={<LoginPage />} />
        <Route key={`/register`} path={`/register`} element={<RegisterPage />} />
      </Routes>
  );
};

export { Routing}