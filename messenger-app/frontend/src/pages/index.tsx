import { useAccount } from '@gear-js/react-hooks';
import { Route, Routes } from 'react-router-dom';
import MainLayer from './main-page/MainLayer';
import LoginPage from './login-page/LoginPage';
import RegisterPage from './register-page/RegisterPage';
import MessagesUsersForm from './main-page/MessagesUsersForm';

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
}

export { Routing };
