import { useEffect } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';

function App() {
  const { user } = useAuthenticator();



  // Redirect to main page after authentication
  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  return <div>Redirecting...</div>;
}

export default App;
