import axios from 'axios';
import React from 'react'

export default function usersdata() {


    const getAllUsers = async () => {
        try {
            const res = await axios.get("https://fakestoreapi.com/users");
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>usersdata</div>
    )
}
