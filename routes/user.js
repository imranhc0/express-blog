const express = require("express");
const z = require("zod");
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');

dotenv.config();

const User = require("../model/user");

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;
const saltRounds = 10;

const registerSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    password: z.string().min(8).max(15),
    email: z.string().email("Email is not valid!")
})

const loginschema = z.object({
    password: z.string().min(8).max(15),
    email: z.string().email("Email is not valid!")
})

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const isDataValid = registerSchema.safeParse(req.body);
        if (!isDataValid.success) {
            return res.status(400).json({ msg: "Invalid data", errors: isDataValid.error.errors });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ msg: "Email already in use" });
        }

        const passwordHash = await bcrypt.hash(password, saltRounds); 
        const newUser = new User({ firstName, lastName, email, password: passwordHash });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, jwtSecret);

        res.status(201).json({
            id: newUser._id,
            token: token
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});


router.post("/login", async (req, res)=> {
    try {
        const { email, password } = req.body;

        const isDataValid = loginschema.safeParse(req.body);
        if (!isDataValid.success) {
            return res.status(400).json({ msg: "Invalid data", errors: isDataValid.error.errors });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ msg: "User Not found" });
        }

        const isPassMatch = await bcrypt.compare(password, existingUser.password);
        if(!isPassMatch) {
            return res.status(400).json({ msg: "Password is not valid" });
        }
        const token = jwt.sign({ id: existingUser._id }, jwtSecret);

        res.status(200).json({
            id: existingUser._id,
            token: token
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
})

module.exports = router
