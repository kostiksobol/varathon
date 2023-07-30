import { useApi, useAccount } from '@gear-js/react-hooks';
import { Routing } from 'pages';
import { Header, Footer, ApiLoader } from 'components';
import { withProviders } from 'hocs';
import 'App.scss';
import {gearApiContext} from 'context';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Component() {
  const navigate = useNavigate();
  const { api, isApiReady } = useApi();
  const {isAccountReady, account} = useAccount();

  useEffect(() => {
    navigate(`/`);
  }, [account?.address])

  const isAppReady = isApiReady && isAccountReady;

  return (
    <>
      <gearApiContext.Provider value={api}>
        <Header />
        <main>{isAppReady ? <Routing /> : <ApiLoader />}</main>
        <Footer />
      </gearApiContext.Provider>
    </>
  );
}

export const App = withProviders(Component);
