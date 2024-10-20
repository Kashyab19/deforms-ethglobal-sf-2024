import React from "react";
import { createRoot } from "react-dom/client";
import { PrivyProvider } from '@privy-io/react-auth';
import SurveyComponent from "./components/SurveyComponent";

import { rootstockTestnet } from "viem/chains";
import { addRpcUrlOverrideToChain } from '@privy-io/react-auth';

const rootstockTestnetOverride = addRpcUrlOverrideToChain(rootstockTestnet, process.env.REACT_APP_ROOTSTACK_RPC_URL);

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
      supportedChains: [rootstockTestnetOverride],
    }}
  >
    <SurveyComponent />
  </PrivyProvider>
);
