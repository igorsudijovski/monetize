import React, {useContext, useEffect} from 'react'
import {AxiosContext} from "../api/axiosInstance";
import {redirect, useNavigate, useSearchParams} from "react-router-dom";
import {AuthContext} from "../context/authContext";

export default function LoginRedirect() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loaded, setLoaded] = React.useState(false);
  const { login } = useContext(AuthContext);
  const { axios } = useContext(AxiosContext);


  const refreshToken = async () => {
    const refreshResponse = await axios.get("/refresh-token"); // cookie automatically sent
    const { accessToken } = refreshResponse.data;
    login(accessToken);
  }

  const constructUrl = (refresh: string | null, redirect: string | null, appUrl: string | null): string =>{
    let refreshUrl = ''
    if (refresh === 'true') {
      refreshUrl = '?refresh=true';
    }
    if (redirect === 'dashboard') {
      return '/auth/dashboard' + refreshUrl;
    }
    if (redirect === 'user' && appUrl !== null) {
      return '/auth/user/' + appUrl + refreshUrl;
    }
    return '';
  }

  useEffect(() => {
    refreshToken().then(() => {
      const refresh = searchParams.get("refresh");
      const redirect = searchParams.get("redirect");
      const appUrl = searchParams.get("appUrl");
      const type = searchParams.get("type");
      const url = constructUrl(refresh, redirect, appUrl);
      const subId = searchParams.get("subId");
      const appId = searchParams.get("appId");

      if (type !== null) {
        if (appId !== null && type === 'client') {
          axios.get('/stripe/subscription/pay?id=' + appId, {
            withCredentials: true,
            maxRedirects: 2
          })
              .then((response) => {
                setLoaded(true);
                if (response.data.url !== undefined && response.data.url !== '') {
                  window.open(response.data.url, '_self');
                } else {
                  navigate(url);
                }
              }).catch((error) => {
            setLoaded(true);
            navigate(url);
            console.log(error);
          })
        } else if (appId !== null && subId !== null && type === 'endUser') {
        }
        else {
          setLoaded(true);
          navigate(url);
        }
      }
    }).catch(() => {
      setLoaded(false);
      navigate('');
    });
  }, []);

  return (loaded ? 'loaded' : 'loading...')
}
