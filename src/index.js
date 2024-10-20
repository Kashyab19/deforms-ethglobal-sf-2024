import React from "react";
import { createRoot } from "react-dom/client";
import { PrivyProvider } from '@privy-io/react-auth';
import SurveyComponent from "./components/SurveyComponent";

const root = createRoot(document.getElementById("surveyElement"));
root.render(
  <PrivyProvider
    appId="cm2e20f7v00ud13m4mtwvf02o"
    config={{
      loginMethods: ['email', 'wallet', 'google', 'twitter', 'farcaster'],
      appearance: {
        theme: 'light',
        accentColor: '#676FFF',
        // logo: 'https://your-logo-url.com/logo.png',
      },
      embeddedWallets: {
        createOnLogin: 'users-without-wallets',
      },
    }}
  >
    <SurveyComponent />
  </PrivyProvider>
);
