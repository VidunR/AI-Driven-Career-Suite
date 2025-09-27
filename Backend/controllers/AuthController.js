import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";


// This will capitalize the word we enter
function capitalizeWords(wordSet){
    return wordSet.trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

// Website Normal Register and Login

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

//Google OAuth
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { code } = req.body; // Changed from idToken to code
  const saltRounds = 10;
  
  console.log("Received Google auth request with code:", code ? "present" : "missing");
  
  if (!code) return res.status(400).json({ error: "Authorization code is required" });

  try {
    console.log("Exchanging code for tokens...");
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'postmessage' // This is standard for @react-oauth/google
    });

    const { id_token } = tokenResponse.data;
    console.log("Received ID token:", id_token ? "present" : "missing");
    
    if (!id_token) {
      return res.status(400).json({ error: "Failed to get ID token from Google" });
    }

    console.log("Verifying ID token...");
    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;
    console.log("Google user info:", { email, given_name, family_name });

    if (!email) {
      return res.status(400).json({ error: "Email not provided by Google" });
    }

    // Check if user already exists
    let user = await prisma.registeredUser.findUnique({ where: { email } });
    console.log("Existing user:", user ? "found" : "not found");

    if (!user) {
      console.log("Creating new user...");
      // Register new user
      const defaultSettings = await prisma.settingsPreference.findFirst({
        select: { preferenceId: true },
        orderBy: { preferenceId: 'asc' },
      });

      const hashedPassword = await bcrypt.hash(process.env.GOOGLE_PASSWORD || "google-oauth-password", saltRounds);

      user = await prisma.registeredUser.create({
        data: {
          firstName: capitalizeWords(given_name || ""),
          lastName: capitalizeWords(family_name || ""),
          email: email,
          hashedPassword: hashedPassword,
          country: "Not Specified", // You might want to get this from Google or set a default
          createdAt: new Date(),
          preferenceId: parseInt(defaultSettings.preferenceId)
        }
      });
      console.log("New user created with ID:", user.userId);
    }

    // Issue JWT like normal login
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log("JWT token generated successfully");

    res.status(200).json({ 
      message: "User logged in via Google", 
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Google OAuth Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Google login failed" });
  }
};

export const linkedinLogin = async (req, res) => {
    const { code } = req.body;
    const saltRounds = 10;

    console.log("Received LinkedIn auth request with code:", code ? "present" : "missing");

    if (!code) return res.status(400).json({ error: "Authorization code is required" });

    try {
        console.log("Exchanging code for LinkedIn access token...");
        
        // Step 1: Exchange code for access token (same as before)
        const tokenResponse = await axios.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            null,
            {
                params: {
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
                    client_id: process.env.LINKEDIN_CLIENT_ID,
                    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
                },
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const accessToken = tokenResponse.data.access_token;
        console.log("LinkedIn access token received:", accessToken ? "present" : "missing");

        if (!accessToken) {
            return res.status(400).json({ error: "Failed to get access token from LinkedIn" });
        }

        console.log("Fetching LinkedIn user info via userinfo endpoint...");
        
        // Step 2: Use the NEW userinfo endpoint (OpenID Connect)
        const userResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
            headers: { 
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const { sub, name, given_name, family_name, email, email_verified } = userResponse.data;
        
        console.log("LinkedIn user info:", { sub, name, given_name, family_name, email });

        if (!email) {
            return res.status(400).json({ error: "Email not provided by LinkedIn" });
        }

        // Step 3: Check if user already exists
        let user = await prisma.registeredUser.findUnique({ where: { email } });
        console.log("Existing user:", user ? "found" : "not found");

        if (!user) {
            console.log("Creating new LinkedIn user...");
            
            // Get default settings
            const defaultSettings = await prisma.settingsPreference.findFirst({
                select: { preferenceId: true },
                orderBy: { preferenceId: "asc" },
            });

            const hashedPassword = await bcrypt.hash(
                process.env.GOOGLE_PASSWORD || "linkedin-oauth-password",
                saltRounds
            );

            user = await prisma.registeredUser.create({
                data: {
                    firstName: capitalizeWords(given_name || name?.split(' ')[0] || "LinkedIn"),
                    lastName: capitalizeWords(family_name || name?.split(' ')[1] || "User"),
                    email: email,
                    hashedPassword: hashedPassword,
                    country: "Not Specified",
                    createdAt: new Date(),
                    preferenceId: parseInt(defaultSettings.preferenceId),
                },
            });
            
            console.log("New LinkedIn user created with ID:", user.userId);
        }

        // Step 4: Issue JWT token
        const token = jwt.sign(
            { userId: user.userId, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        console.log("JWT token generated successfully for LinkedIn user");

        res.status(200).json({ 
            message: "User logged in via LinkedIn", 
            token,
            user: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });

    } catch (err) {
        console.error("LinkedIn OAuth Error:", err.response?.data || err.message);
        
        if (err.response?.status === 400) {
            return res.status(400).json({ error: "Invalid LinkedIn authorization code" });
        } else if (err.response?.status === 401) {
            return res.status(401).json({ error: "LinkedIn authentication failed" });
        }
        
        res.status(500).json({ error: "LinkedIn login failed" });
    }
};
