import React from "react";
import { createRoot } from "react-dom/client";
import { PrivyProvider } from '@privy-io/react-auth';
import SurveyComponent from "./components/SurveyComponent";

import { rootstockTestnet } from "viem/chains";
import {addRpcUrlOverrideToChain} from '@privy-io/react-auth';

const mainnetOverride = addRpcUrlOverrideToChain(rootstockTestnet, "https://rpc.testnet.rootstock.io/eRrAbzc5vDZQzrXYcG0i5j1rvxk3HT-T");

const root = createRoot(document.getElementById("surveyElement"));
root.render(
  <PrivyProvider
    appId="cm2e20f7v00ud13m4mtwvf02o"
    config={{
      loginMethods: ['email', 'wallet', 'google', 'twitter', 'farcaster'],
      appearance: {
        theme: 'light',
        accentColor: '#676FFF',
      },
      embeddedWallets: {
        createOnLogin: 'users-without-wallets',
      },
    }}
  >
    <SurveyComponent />
  </PrivyProvider>
);
