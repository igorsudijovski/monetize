// src/api/axiosInstance.ts
import axios, {Axios} from "axios";
import {createContext, useContext, useState} from "react";
import {AuthContext} from "../context/authContext";

const API_URL = "http://localhost:4000";


export const AxiosContext = createContext<{axios: Axios}>({axios: axios.create({
        baseURL: API_URL,
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true, // crucial for sending cookies
    })})

export const AxiosProvider = ({ children } : {children: React.ReactNode}) => {

    const {login, logout, getToken} = useContext(AuthContext);

    const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true, // crucial for sending cookies
    });

// Attach access token to requests
    axiosInstance.interceptors.request.use(
        (config) => {
            const accessToken = getToken();
            if (accessToken && config.headers) {
                config.headers["Authorization"] = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

// Response interceptor to handle 401 (access token expired)
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            console.log(error);
            if (error.response?.status === 401 && !error.request.responseURL.endsWith("/refresh-token")) {
                console.log(error.request.responseURL);
                try {
                    const refreshResponse = await axiosInstance.get("/refresh-token"); // cookie automatically sent
                    const {accessToken} = refreshResponse.data;
                    login(accessToken);
                    return axiosInstance(error.config); // retry original request
                } catch (err) {
                    logout();
                    return Promise.reject(err);
                }
            }
            return Promise.reject(error);
        }
    );
    return (
        <AxiosContext.Provider value={{axios: axiosInstance}}>
            {children}
        </AxiosContext.Provider>
    );
}