import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";


// This will capitalize the word we enter
function capitalizeWords(wordSet){
    return wordSet.trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

// Normal Register and Login

// User Registration
// POST: /auth/register
export const userRegistrationRequest = async (req, res) => {

    const saltRounds = 10;
    const { firstName, lastName, email, country, password, confirmPassword } = req.body;

    try {
        // Validation errors array
        const errors = [];

        // First Name
        if (!firstName || firstName.trim().length < 2 || firstName.trim().length > 50) {
            errors.push("First name must be between 2 and 50 characters.");
        }

        // Last Name
        if (!lastName || lastName.trim().length < 2 || lastName.trim().length > 50) {
            errors.push("Last name must be between 2 and 50 characters.");
        }

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.push("Invalid email address.");
        }

        // Check whether the email already exist in the database
        const existingUser = await prisma.registeredUser.findUnique({ where: { email } });
            if (existingUser) {
                errors.push("Email is already registered.");
        }

        // Country (simple check, better to validate against ISO country codes)
        if (!country || country.trim().length < 2) {
            errors.push("Country is required.");
            }

        // Password
        // Password must contain at least 8 characters, including uppercase, lowercase, number and special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            errors.push("Password must be at least 8 characters, include uppercase, lowercase, number, and special character.");
        }

        // Confirm Password
        if (password !== confirmPassword) {
            errors.push("Passwords do not match.");
        }

        // If any errors
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Password hashing
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // setting the default settings
        const defaultSettings = await prisma.settingsPreference.findFirst({
            select: {preferenceId: true},
            orderBy: {preferenceId: 'asc'},
        });

        const newUser = await prisma.registeredUser.create({
            data: {
                firstName: capitalizeWords(firstName),
                lastName: capitalizeWords(lastName),
                email: email,
                hashedPassword: hashedPassword,
                country: capitalizeWords(country),
                createdAt: new Date(),
                preferenceId: parseInt(defaultSettings.preferenceId)
            }
        });

        return res.status(200).json({message: "User succefully registered", newUser});

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// User Login
// POST: auth/login
export const userLoginRequest = async (req, res) => {
    const {email, password} = req.body;

    try{
        const emailCheck = await prisma.registeredUser.findUnique({
            where: {email: email}
        });

        if (!emailCheck){
            return res.status(404).json({message: "Invalid Email"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, emailCheck.hashedPassword);

        if(!isPasswordCorrect){
            return res.status(401).json({message: "Incorrect Password"});
        }

        // Setting up JWT Tokens and sign in
        const token = jwt.sign(
            {userId: emailCheck.userId, email: emailCheck.email},
            process.env.JWT_SECRET_KEY,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );

        res.status(200).json({message: "User is logged in", token});
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
}

// Google OAuth
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  const saltRounds = 10;
  if (!idToken) return res.status(400).json({ error: "ID token is required" });

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    let user = await prisma.registeredUser.findUnique({ where: { email } });

    if (!user) {
      // Register new user
      const defaultSettings = await prisma.settingsPreference.findFirst({
        select: { preferenceId: true },
        orderBy: { preferenceId: 'asc' },
      });

      const hashedPassword = await bcrypt.hash(process.env.GOOGLE_PASSWORD, saltRounds);

      user = await prisma.registeredUser.create({
        data: {
          firstName: capitalizeWords(given_name || ""),
          lastName: capitalizeWords(family_name || ""),
          email: email,
          hashedPassword: hashedPassword,
          createdAt: new Date(),
          preferenceId: parseInt(defaultSettings.preferenceId)
        }
      });
    }

    // Issue JWT like normal login
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({ message: "User logged in via Google", token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google login failed" });
  }
};
