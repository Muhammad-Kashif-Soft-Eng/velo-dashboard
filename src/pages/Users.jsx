import axios from "axios";
import { useEffect, useState } from "react";

export default function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get("https://fakestoreapi.com/users");
                console.log(res.data);
                setUsers(res.data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div>
            Users Page
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.username}</li>
                ))}
            </ul>
        </div>
    );
}
