import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from "../lib/axios.js"; 
import '../css/Register.css'; 
import toast from "react-hot-toast";

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setProfileImage(file);
        } else {
            toast.error("Only image files are allowed!");
            setProfileImage(null);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        if (!username || !email || !password || !profileImage) {
            toast.error("All fields including profile image are required!");
            return;
        }

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('avatar', profileImage);

        try {
            const response = await axiosInstance.post('/users/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                toast.success("Registered Successfully!");
                navigate('/login');
            } else {
                setError(response.data.message || 'An error occurred.');
            }
        } catch (error) {
            console.error("Registration Error:", error);
            setError(error.response?.data?.message || 'An error occurred. Please try again.');
            toast.error(error.response?.data?.message || "Something went wrong!");
        }
    };

    return (
        <div className="register">
            <h2>Register</h2>
            <form onSubmit={handleSignUp}>
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <label htmlFor="profileImage">Profile Image</label>
                <input
                    type="file"
                    id="profileImage"
                    name="avatar"
                    onChange={handleFileChange}
                    required
                />
                {profileImage && (
                    <div className="image-preview">
                        <img src={URL.createObjectURL(profileImage)} alt="Preview" width="100" height="100" />
                    </div>
                )}
                {error && <div className="error">{error}</div>}
                <button type="submit">Register</button>
                <div className="link-container">
                    <button type="button" onClick={() => navigate('/login')}>Login</button>
                </div>
            </form>
        </div>
    );
};

export default Register;
