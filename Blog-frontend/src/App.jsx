import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from './components/Register.jsx'; 
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import {Toaster} from "react-hot-toast";

function App() {
    return (
        <div>
        <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        
        <Toaster />
        
        </div>
    );
}

export default App;
