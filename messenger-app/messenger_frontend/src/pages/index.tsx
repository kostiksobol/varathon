import { Route, Routes, Outlet } from 'react-router-dom';
// import { Home } from './home';

import { MessagesUsersForm, ChatsForm } from './tmp';

// const routes = [{ path: '/', Page: Home }];

function Routing() {
  const getRoutes = () =>
    (
      <Route key='/' path='/' element={<ChatsForm><Outlet /></ChatsForm>}>
        children={[<Route path="chat/:id" element={<MessagesUsersForm />} />]}
      </Route>
    );

  return <Routes>{getRoutes()}</Routes>;
}

export { Routing };
