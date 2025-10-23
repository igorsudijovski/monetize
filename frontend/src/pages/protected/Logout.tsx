import React, {useContext, useEffect} from 'react'
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../../context/authContext";
import {AxiosContext} from "../../api/axiosInstance";

export default function Logout() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const { axios } = useContext<any>(AxiosContext);

    useEffect(() => {
        axios.post('/api/logout', {}, { withCredentials: true })
            .then(() => {
                logout();
                navigate('/');
            })
            .catch((error: any) => console.error('Error logging out:', error));
    }, []);
  return (
      <></>
  )
}
