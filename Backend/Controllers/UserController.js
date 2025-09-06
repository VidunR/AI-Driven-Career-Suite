import prisma from "../config/db.js";
import bcrypt from "bcrypt";

// Get User Details
export const getUserDetails = async(req, res) => {
    const {id} = req.params;

    try{
        const user = await prisma.registeredUser.findUnique({
            where: {userId: parseInt(id)}
        })

        if (!user){
            res.status(404).json({error: "User Not Found"})
        }
        res.json(user);
    }
    catch(err){
        res.status(500).json({errorMessage: `Error message is ${err}`})
    }
}

// Update user Details
export const updateUser = async(req, res) => {
    const {id} = req.params;
    const {firstName, lastName, country, phoneNumber, address, gender, bio} = req.body;

    try{
        const user = await prisma.registeredUser.update({
            where: {userId: parseInt(id)},
            data: {
                firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
                lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
                country: country.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                phoneNumber: phoneNumber,
                address: address,
                gender: gender,
                bio: bio
            }
        });

        res.status(200).json({message: "User details updated successfully", user});
    }
    catch(err){
        res.status(500).json({errorMessage: `Error message is ${err}`})
    }
}

// Delete user details

export const deleteUser = async (req, res) => {

    const {id} = req.params;

    try{
        await prisma.registeredUser.delete({
            where: {userId: parseInt(id)}
        });

        res.status(200).json({message: "User has been deleted successfully"})

    }
    catch(err){
        res.status(500).json({errorMessage: `Error message is ${err}`})
    }
}
