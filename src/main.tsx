import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import LandingPage from "./LandingPage.tsx";
import "./index.css";
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

// Simple routing based on URL
function Router() {
  const path = window.location.pathname;
  
  if (path === '/app') {
    return (
      <Authenticator>
        <LandingPage />
      </Authenticator>
    );
  }
  
  // Default to landing page for all other paths
  return <LandingPage />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
