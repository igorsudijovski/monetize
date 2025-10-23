import React, {useContext, useEffect} from 'react'
import {AxiosContext} from "../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../context/authContext";

export default function LoginRedirect() {
  const navigate = useNavigate();
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
      setLoaded(true);
      navigate('/auth/dashboard');
    }).catch(() => setLoaded(false));
  }, []);

  return (loaded ? 'loaded' : 'loading...')
}
