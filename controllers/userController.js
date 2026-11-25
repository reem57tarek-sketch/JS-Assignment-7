
const User = require("../models/userModel");
const bcrypt = require("bcrypt");


const signup = async (req, res) => {
    try {
        const { name, email, password, phone, age } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            age
        });

        res.status(201).json({
            message: "Signup successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                age: user.age
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

       
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                age: user.age
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};




const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, age } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, email, phone, age },
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const deleteUser = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deleted successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getUser = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



module.exports = { 
        signup,
        login,
        updateUser,
        deleteUser,
        getUser
     };

