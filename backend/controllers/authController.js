import TFUser from "../models/users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import redis from "../redis/client.js";
import { getActiveUsersFromRedis } from "../redis/redisFunc.js";

export const login= async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Here you would typically check the database for the user
        const user = await TFUser.findOne({$or:[{email:username},{username}]})
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if(user){
            // Check if the password matches
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const {username, fullName, email, phone, _id } = user;
            // Create a token (for demonstration purposes, we'll use a simple JWT)
            const token = jwt.sign({ id: _id, username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('Login successful:', { user: {username, fullName, email, phone, _id }, token });
            return res.status(200).cookie('ACCESS_TOKEN',token,{httpOnly:true,secure:true}).json({
                message: 'Login successful',
                user: {username, fullName, email, phone, _id },
                token
            });

        }

        // Set session or token (this is just a placeholder)

        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
export const signup = async (req, res) => {
    const {fullName,email,phone, username, password } = req.body;
    console.log('Signup attempt:', {fullName,email,phone, username, password});
    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Here you would typically save the user to the database
        const existingUser = await TFUser.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: 'Email already exists' });

        }
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new TFUser({
            fullName,
            email,
            phone,
            username,
            password:hashedPassword,
        });
        await newUser.save();
        // For demonstration, we'll assume a successful signup

        return res.status(201).json({ message: 'Signup successful', user: newUser });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        // Fetch all users from the database
        const cachedSessions=await getActiveUsersFromRedis();
        if(cachedSessions){
            console.log('List of all active users',cachedSessions);
        }
        const {username}=req.body
        const users = await TFUser.find({username: { $ne: username }}, 'username fullName email phone createdAt status lastSeen');
        console.log('Fetched users:', users);
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}