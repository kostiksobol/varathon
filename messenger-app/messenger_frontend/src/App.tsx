import { useApi, useAccount } from '@gear-js/react-hooks';
import { Routing } from 'pages';
import { Header, Footer, ApiLoader } from 'components';
import { withProviders } from 'hocs';
import 'App.scss';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Component() {
  const navigate = useNavigate();
  const { isApiReady } = useApi();
  const {isAccountReady, account} = useAccount();

  useEffect(() => {
    navigate(`/${account?.meta.name}`);
  }, [account?.address])

  const isAppReady = isApiReady && isAccountReady;

  return (
    <>
      <Header />
      <main>{isAppReady ? <Routing /> : <ApiLoader />}</main>
      <Footer />
    </>
  );
}

export const App = withProviders(Component);
