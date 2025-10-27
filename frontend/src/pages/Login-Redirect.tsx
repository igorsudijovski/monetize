import React, {useContext, useEffect} from 'react'
import {AxiosContext} from "../api/axiosInstance";
import {useNavigate, useSearchParams} from "react-router-dom";
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

  useEffect(() => {
    refreshToken().then(() => {

      if (searchParams.get("appId") !== null) {
        axios.get('/stripe/subscription/pay?id=' + searchParams.get("appId"), {withCredentials: true, maxRedirects: 2})
            .then((response) => {
              if (response.data.home !== undefined && response.data.home == true) {
                setLoaded(true);
                navigate('/auth/dashboard');
              }
              if (response.data.url !== undefined && response.data.url !== '') {
                setLoaded(true);
                window.open(response.data.url, '_self');
              }
            }).catch((error) => {
              console.log(error);
        })
      } else {
        setLoaded(true);
        navigate('/auth/dashboard');
      }
    }).catch(() => setLoaded(false));
  }, []);

  return (loaded ? 'loaded' : 'loading...')
}
