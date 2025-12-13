import React, {useContext, useEffect} from 'react'
import {AxiosContext} from "../api/axiosInstance";
import {useNavigate, useSearchParams} from "react-router-dom";
import {AuthContext} from "../context/authContext";

export default function LoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loaded, setLoaded] = React.useState(false);
  const { login } = useContext(AuthContext);
  const { axios } = useContext(AxiosContext);

  const refreshToken = async () => {
    const refreshResponse = await axios.get("/refresh-token");
    const { accessToken } = refreshResponse.data;
    login(accessToken);
  }

  const handleRedirect = async () => {
    try {
      await refreshToken();

      const type = searchParams.get("type");
      const appId = searchParams.get("appId");
      const subId = searchParams.get("subId");
      const redirect = searchParams.get("redirect");
      const appUrl = searchParams.get("appUrl");

      // Case 1: Buying subscription from home (type=client)
      if (type === 'client' && appId) {
        try {
          const response = await axios.get('/stripe/subscription/pay?id=' + appId, {
            withCredentials: true,
            maxRedirects: 2
          });
          if (response.data.url) {
            window.open(response.data.url, '_self');
            return;
          }
        } catch (error) {
          console.error('Error creating subscription payment:', error);
        }
        // After subscription, redirect to dashboard
        navigate('/auth/dashboard');
        setLoaded(true);
        return;
      }

      // Case 2: Buying product from AppSubscriptions (type=endUser)
      if (type === 'endUser' && appId && subId) {
        try {
            const response = await axios.get(`/user/app/${appId}/subscribe/${subId}`, {
                withCredentials: true,
                maxRedirects: 2
            });
            if (response.data.url) {
                window.open(response.data.url, '_self');
                return;
            }
        } catch (error) {
          console.error('Error initiating purchase:', error);
        }
      }

      // Case 3: Login from home page or app page
      if (redirect === 'dashboard') {
        // User has an application, redirect to dashboard
        navigate('/auth/dashboard');
        setLoaded(true);
        return;
      }

      if (redirect === 'user') {
        // User has bought keys
          if (appUrl) {
            // Logged in from specific app, try to get key for that app
              navigate(`/user/auth/${appUrl}`);
              setLoaded(true);
              return;
          }

          navigate(`/user/auth`);
          setLoaded(true);
          return;
      }

      // Default: redirect to home
      navigate('/');
      setLoaded(true);
    } catch (error) {
      console.error('Authentication failed:', error);
      setLoaded(false);
      navigate('/');
    }
  };

  useEffect(() => {
    handleRedirect();
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px'
    }}>
      {loaded ? 'Redirecting...' : 'Loading...'}
    </div>
  );
}
