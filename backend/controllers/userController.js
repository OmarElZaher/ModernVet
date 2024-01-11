// Imports
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const User = require("../models/SystemModels/userModel");
const Owner = require("../models/CustomerModels/ownerModel");
const Pet = require("../models/CustomerModels/petModel");
const VaccinationCard = require("../models/CustomerModels/vaccinationModel");

// ----------------------------------------------------------------
// Global Variables

let otpExpiry;

// ----------------------------------------------------------------
// Helper Functions

const generateToken = (id) => {
	// TODO Update Token Expiration
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "1h",
	});
};

function passwordValidator(password) {
	const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.{8,})/;

	if (!passwordRegex.test(password)) {
		return false;
	} else {
		return true;
	}
}

function emailValidator(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(email)) {
		return false;
	} else {
		return true;
	}
}

function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// ----------------------------------------------------------------
// Admin Roles

// @desc Create A New User
// @route POST /user/createUser
// @access Private
const createUser = asyncHandler(async (req, res) => {
	try {
		const user = req.user;

		if (!user.isAdmin) {
			res.status(400).json({ message: "Unauthorized: Not An Admin" });
			return;
		} else {
			const {
				username,
				email,
				firstName,
				lastName,
				password,
				confirmPassword,
				isAdmin,
			} = req.body;

			// Checks if all fields are entered
			if (
				!username ||
				!email ||
				!firstName ||
				!lastName ||
				!password ||
				!confirmPassword
			) {
				res.status(400).json({ message: "Please Enter All Fields" });
				return;
			}

			// Validate email format using a regular expression
			if (!emailValidator(email)) {
				res.status(400).json({ message: "Invalid email format" });
				return;
			}

			// Password requirements
			if (!passwordValidator(password)) {
				res.status(400).json({
					message:
						"Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, and one digit",
				});
				return;
			}

			// Validation Checks
			const usernameExists = await User.findOne({ username });
			const emailExists = await User.findOne({ email });

			if (usernameExists) {
				res
					.status(400)
					.json({ message: "Username Taken, Please Try Another One" });
				return;
			} else if (emailExists) {
				res
					.status(400)
					.json({ message: "A User With This Email Already Exists" });
				return;
			} else if (password !== confirmPassword) {
				res.status(400).json({ message: "Passwords Do Not Match" });
				return;
			}

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			const user = await User.create({
				username,
				email,
				firstName,
				lastName,
				password: hashedPassword,
				isAdmin,
			});

			if (user) {
				res.status(200).json({
					message: "User Created Successfully",
					_id: user.id,
					username: user.username,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
				});
			} else {
				res.status(400).json({ message: "Invalid User Data" });
				return;
			}
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Create A New Admion
// @route POST /user/createAdmin
// @access Private
const createAdmin = asyncHandler(async (req, res) => {
	try {
		if (!req.user.isAdmin) {
			res.status(400).json({ message: "Unauthorized: Not An Admin" });
			return;
		}

		req.body.isAdmin = true;

		// Call the createUser function with isAdmin set to true
		await createUser(req, res, () => {}, {
			...req.body,
			isAdmin: true,
		});
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Get All Users (Except Logged In User)
// @route GET /user/getUsers
// @access Private
const getUsers = asyncHandler(async (req, res) => {
	try {
		if (req.user.isAdmin) {
			const users = await User.find({ username: { $ne: req.user.username } });

			if (users.length > 0) {
				res.status(200).json({
					message: "Gotten All Users Successfuly",
					users,
				});
			} else {
				res.status(400).json({ message: "No Users Found!" });
			}
		} else {
			res.status(400).json({ message: "Unauthorized: Not An Admin" });
			return;
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Delete A User
// @route GET /user/deleteUser/:userId
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
	try {
		if (req.user.isAdmin) {
			const userId = req.params.userId;

			if (!mongoose.Types.ObjectId.isValid(userId)) {
				res.status(400).json({ message: "Invalid User ID" });
				return;
			}

			const deleted = await User.findByIdAndDelete(userId);

			if (deleted) {
				res.status(200).json({ message: "User Deleted Successfuly" });
			} else {
				res
					.status(400)
					.json({ message: "User Not Found, Please Check User ID Provided" });
				return;
			}
		} else {
			res.status(400).json({ message: "Unauthorized: Not An Admin" });
			return;
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// ----------------------------------------------------------------
// General User Roles

// @desc Update User Credentials
// @route PATCH /user/updateProfile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
	try {
		const { username, email, password, passwordResetOTP, isAdmin } = req.body;

		if (password || passwordResetOTP || isAdmin) {
			res.status(400).json({ message: "Cannot Do That, Nice Try Though ;)" });
			return;
		}

		// Check if the updated username is already taken by another user
		if (username) {
			const usernameExists = await User.findOne({
				_id: { $ne: req.user._id }, // Exclude the current user from the search
				username,
			});

			if (usernameExists) {
				res.status(400).json({ message: "Username is already taken" });
				return;
			}
		}

		// Check if the updated email is already taken by another user
		if (email) {
			const emailExists = await User.findOne({
				_id: { $ne: req.user._id }, // Exclude the current user from the search
				email,
			});

			if (emailExists) {
				res.status(400).json({ message: "Email is already in use" });
				return;
			}
		}

		const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body);

		if (updatedUser) {
			res.status(200).json({ message: "User Updated Successfully" });
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Delete User
// @route DELETE /user/deleteUser
// @access Private
const deleteUserProfile = asyncHandler(async (req, res) => {
	try {
		const { confirm } = req.body;

		if (confirm !== "CONFIRM") {
			res.status(400).json({ message: "Please Enter 'CONFIRM'" });
		} else {
			const deleted = await User.findByIdAndDelete(req.user._id);

			if (deleted) {
				res.status(200).json({ message: "User Removed" });
			} else {
				res.status(400).json({ message: "User Not Found" });
				return;
			}
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Login User
// @route POST /user/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			res.status(400).json({ message: "Please Enter All Fields" });
		}

		const user = await User.findOne({ username: username });

		if (!user) {
			res.status(400).json({ message: "Invalid Username" });
		} else {
			if (await bcrypt.compare(password, user.password)) {
				let token = generateToken(user._id);
				res.cookie("token", token, {
					httpOnly: true,
				});
				res.status(200).json({
					message: "Logged In Successfully",
					token: token,
					isAdmin: user.isAdmin,
				});
			} else {
				res.status(400).json({ message: "Invalid Password" });
			}
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Logout User
// @route POST /user/logout
// @access Private
const logoutUser = asyncHandler(async (req, res) => {
	try {
		res
			.clearCookie("token")
			.status(200)
			.json({ message: "Logged Out Successfully" });
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Get User Info
// @route GET /user/getUserInfo
// @access Private
const getUserInfo = asyncHandler(async (req, res) => {
	try {
		const user = req.user;

		if (user) {
			res.status(200).json({
				message: "User Retrieved Successfully",
				_id: user._id,
				username: user.username,
				email: user.email,
				name: user.fullName,
			});
		} else {
			res.status(400).json({ message: "User Not Found" });
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Create New Owner
// @route POST /user/createOwner
// @access Private
const createOwner = asyncHandler(async (req, res) => {
	const {
		firstName,
		lastName,
		mobileNumber,
		email,
		gender,
		preferredContactMethod,
		receiveNotifications,
	} = req.body;

	if (
		!firstName ||
		!lastName ||
		!mobileNumber ||
		!email ||
		!gender ||
		!preferredContactMethod ||
		!receiveNotifications
	) {
		res.status(400).json({ message: "Please Enter All Fields" });
		return;
	}

	try {
		// Check if the email or mobileNumber already exist in the database
		const existingOwner = await Owner.findOne({
			$or: [{ email }, { mobileNumber }],
		});

		if (existingOwner) {
			res.status(400).json({
				message: "An owner with this email or mobile number already exists",
			});
			return;
		}

		// Create the owner
		const owner = await Owner.create(req.body);

		if (owner) {
			// Update the pets associated with the owner
			const petIds = req.body.pets;

			if (petIds && Array.isArray(petIds)) {
				for (const petId of petIds) {
					const pet = await Pet.findById(petId);

					if (pet) {
						pet.owners.push(owner._id);
						await pet.save();
					}
				}
			}

			res.status(200).json({ message: "Owner Created Successfully" });
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Get Owner Information
// @route GET /user/getOwnerInfo/:ownerId
// @access Private
const getOwnerInfo = asyncHandler(async (req, res) => {
	try {
		const ownerId = req.params.ownerId;

		if (!mongoose.Types.ObjectId.isValid(ownerId)) {
			res.status(400).json({ message: "Invalid User ID" });
			return;
		}

		const owner = await Owner.findById(ownerId).populate("pets");

		if (owner) {
			res.status(200).json(owner);
		} else {
			res.status(400).json({ message: "Owner Not Found!" });
			return;
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Get Owner
// @route GET /user/getOwner/
// @access Private
const getOwner = asyncHandler(async (req, res) => {
	try {
		const owner = await Owner.find(req.body);

		if (owner.length > 0) {
			res.status(200).json(owner);
		} else {
			res.status(400).json({ message: "No Owners Found!" });
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Get Owner Pets
// @route GET /user/getOwnerPets/:ownerId
// @access Private
const getOwnerPets = asyncHandler(async (req, res) => {
	try {
		const ownerId = req.params.ownerId;

		if (!mongoose.Types.ObjectId.isValid(ownerId)) {
			res.status(400).json({ message: "Invalid User ID" });
			return;
		}

		const owner = await Owner.findById(ownerId).populate("pets");

		if (!owner) {
			res.status(400).json({ message: "Owner Not Found!" });
			return;
		} else if (owner.pets.length > 0) {
			res.status(200).json({
				message: "Retrieved Owner Pets Successfuly",
				pets: owner.pets,
			});
		} else {
			res.status(400).json({ message: "No Pets Found!" });
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Update Owner Information
// @route PATCH /users/updateOwner/:ownerId
// @access Private
const updateOwnerProfile = asyncHandler(async (req, res) => {
	try {
		const ownerId = req.params.ownerId;

		if (!mongoose.Types.ObjectId.isValid(ownerId)) {
			res.status(400).json({ message: "Invalid User ID" });
			return;
		}

		const {
			firstName,
			lastName,
			mobileNumber,
			email,
			gender,
			preferredContactMethod,
			receiveNotifications,
		} = req.body;

		// Check if there was no data entered
		if (
			!firstName &&
			!lastName &&
			!mobileNumber &&
			!email &&
			!gender &&
			!preferredContactMethod &&
			!receiveNotifications
		) {
			res.status(400).json({ message: "Enter Any Data To Update" });
			return;
		}

		const updatedOwner = await Owner.findByIdAndUpdate(ownerId, req.body);

		if (updatedOwner) {
			res.status(200).json({ message: "Owner Updated Successfully" });
		} else {
			res.status(400).json({ message: "Owner Not Found!" });
			return;
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Delete Owner
// @route DELETE /user/deleteOwner/:ownerId
// @access Private
const deleteOwnerProfile = asyncHandler(async (req, res) => {
	try {
		const ownerId = req.params.ownerId;

		if (!mongoose.Types.ObjectId.isValid(ownerId)) {
			res.status(400).json({ message: "Invalid User ID" });
			return;
		}

		// Find the owner
		const owner = await Owner.findById(ownerId);

		if (!owner) {
			res.status(400).json({ message: "Owner Not Found!" });
			return;
		}

		// Find all pets that have the owner
		const pets = await Pet.find({ owners: ownerId });

		// Update each pet's owners array to remove the owner
		const updatePromises = pets.map(async (pet) => {
			const index = pet.owners.indexOf(ownerId);
			if (index !== -1) {
				pet.owners.splice(index, 1);
				await pet.save();

				// Check if the pet has no owners after removal
				if (pet.owners.length === 0) {
					await Pet.findByIdAndDelete(pet._id);
				}
			}
		});

		// Wait for all updates to complete
		await Promise.all(updatePromises);

		// Delete the owner
		const deletedOwner = await Owner.findByIdAndDelete(ownerId);

		if (deletedOwner) {
			res.status(200).json({ message: "Owner Removed From System" });
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Create Pet
// @route POST /user/createPet
// @access Private
const createPet = asyncHandler(async (req, res) => {
	try {
		const ownerIds = req.body.owners;

		// Check if ownerIds is an array
		if (!Array.isArray(ownerIds)) {
			res.status(400).json({ message: "Owners should be an array" });
			return;
		}

		// Check if any owner ID is invalid
		for (const ownerId of ownerIds) {
			const owner = await Owner.findById(ownerId);
			if (!owner) {
				res.status(400).json({ message: `Owner with ID ${ownerId} not found` });
				return;
			}
		}

		// Create the pet
		const pet = await Pet.create(req.body);

		// Associate the pet with each owner
		for (const ownerId of ownerIds) {
			const owner = await Owner.findById(ownerId);
			owner.pets.push(pet._id);
			await owner.save();
		}

		res.status(200).json({ message: "Pet Created Successfully" });
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Get Pet Information
// @route GET /user/getPetInfo/:petId
// @access Private
const getPetInfo = asyncHandler(async (req, res) => {
	try {
		const petId = req.params.petId;

		if (!mongoose.Types.ObjectId.isValid(petId)) {
			res.status(400).json({ message: "Invalid User ID" });
			return;
		}

		const pet = await Pet.findById(petId).populate({
			path: "owners",
			select: "firstName lastName mobileNumber email",
		});

		if (!pet) {
			res.status(400).json({ message: "Pet Not Found!" });
			return;
		} else {
			res
				.status(200)
				.json({ message: "Gotten Pet Successfuly", pet: pet, petAge: pet.age });
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Update Pet Information
// @route PATCH /user/updatePet/:petId
// @access Private
const updatePetProfile = asyncHandler(async (req, res) => {
	try {
		const petId = req.params.petId;

		if (!mongoose.Types.ObjectId.isValid(petId)) {
			res.status(400).json({ message: "Invalid User ID" });
			return;
		}

		const updatedPet = await Pet.findByIdAndUpdate(petId, req.body);

		if (updatedPet) {
			res.status(200).json({ message: "Pet Updated Successfully" });
		} else {
			res.status(400).json({ message: "Pet Not Found!" });
			return;
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Delete Pet
// @route DELETE /user/deletePet/:petId
// @access Private
const deletePetProfile = asyncHandler(async (req, res) => {
	try {
		const petId = req.params.petId;

		if (!mongoose.Types.ObjectId.isValid(petId)) {
			res.status(400).json({ message: "Invalid User ID" });
			return;
		}

		// Find the pet
		const pet = await Pet.findById(petId);

		if (!pet) {
			res.status(400).json({ message: "Pet Not Found!" });
			return;
		}

		// Find all owners of the pet
		const owners = await Owner.find({ pets: petId });

		// Update each owner's pets array to remove the pet
		const updatePromises = owners.map(async (owner) => {
			const index = owner.pets.indexOf(petId);
			if (index !== -1) {
				owner.pets.splice(index, 1);
				await owner.save();

				// Check if the owner has no pets after removal
				if (owner.pets.length === 0) {
					await Owner.findByIdAndDelete(owner._id);
				}
			}
		});

		// Wait for all updates to complete
		await Promise.all(updatePromises);

		// Delete the pet
		const deletedPet = await Pet.findByIdAndDelete(petId);

		if (!deletedPet) {
			res.status(400).json({ message: "Pet Not Found!" });
		} else {
			res.status(200).json({ message: "Pet Deleted Successfully" });
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Create New Vaccination Card
// @route POST /user/createVaccinationCard/:petId
// @access Private
const createVaccinationCard = asyncHandler(async (req, res) => {
	try {
		const petId = req.params.petId;

		if (!mongoose.Types.ObjectId.isValid(petId)) {
			res.status(400).json({ message: "Invalid User ID" });
			return;
		}

		const pet = await Pet.findById(petId);

		if (!pet) {
			res.status(400).json({ message: "Pet Not Found" });
			return;
		}

		const vaccinationCardExists = await VaccinationCard.findOne({
			pet: pet._id,
		});

		if (vaccinationCardExists) {
			res.status(400).json({ message: "Pet Already Has A Vaccination Card" });
			return;
		}

		const { vaccineName, vaccineBatch, vaccineGivenDate, vaccineRenewalDate } =
			req.body;

		if (!vaccineName || !vaccineBatch || !vaccineGivenDate) {
			res.status(400).json({ message: "Please Enter All Fields" });
			return;
		}

		const vaccinationCard = await VaccinationCard.create({
			pet: pet._id,
			vaccine: {
				vaccineName,
				vaccineBatch,
				vaccineGivenDate,
				vaccineRenewalDate,
			},
		});

		if (vaccinationCard) {
			res.status(200).json({ message: "Vaccination Card Created" });
		} else {
			res.status(400).json({ message: "Invalid Data" });
			return;
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Get Pet Vaccination Card
// @route GET /user/getVaccinationCard/:petId
// @access Private
const getVaccinationCard = asyncHandler(async (req, res) => {
	try {
		const petId = req.params.petId;

		if (!mongoose.Types.ObjectId.isValid(petId)) {
			res.status(400).json({ message: "Invalid User ID" });
			return;
		}

		const pet = await Pet.findById(petId);

		if (!pet) {
			res.status(400).json({ message: "Pet Not Found" });
			return;
		}

		const vaccinationCard = await VaccinationCard.findOne({ pet: petId });

		if (!vaccinationCard) {
			res.status(400).json({ message: "Pet Does Not Have A Vaccination Card" });
			return;
		} else {
			res.status(200).json({
				message: "Retrieved Vaccination Card Successfuly",
				vaccinationCard,
			});
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Add To Pet Vaccination Card
// @route POST /user/addVaccination/:petId
// @access Private
const addVaccination = asyncHandler(async (req, res) => {
	try {
		const petId = req.params.petId;

		if (!mongoose.Types.ObjectId.isValid(petId)) {
			res.status(400).json({ message: "Invalid User ID" });
			return;
		}

		const pet = await Pet.findById(req.params.petId);

		if (!pet) {
			res.status(400).json({ message: "Pet Not Found" });
			return;
		}

		const vaccinationCard = await VaccinationCard.findOne({ pet: pet._id });

		if (!vaccinationCard) {
			res.status(400).json({
				message:
					"Pet Does Not Have A Vaccination Card, Please Create One First",
			});
		}

		const { vaccineName, vaccineBatch, vaccineGivenDate } = req.body;

		if (!vaccineName || !vaccineBatch || !vaccineGivenDate) {
			res.status(400).json({ message: "Please Enter All Fields" });
			return;
		} else {
			vaccinationCard.vaccine.push(req.body);
			await vaccinationCard.save();
			res.status(200).json({ message: "Vaccination Added" });
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Renew Pet Vaccination
// @route PUT /user/renewVaccination/:petId/:vaccinationId
// @access Private
const renewVaccination = asyncHandler(async (req, res) => {
	try {
		const petId = req.params.petId;

		if (!mongoose.Types.ObjectId.isValid(petId)) {
			res.status(400).json({ message: "Invalid Pet ID" });
			return;
		}

		const vaccinationId = req.params.vaccinationId;

		if (!mongoose.Types.ObjectId.isValid(vaccinationId)) {
			res.status(400).json({ message: "Invalid Vaccination ID" });
			return;
		}

		const pet = await Pet.findById(petId);

		if (!pet) {
			res.status(400).json({ message: "Pet not found" });
			return;
		}

		const vaccinationCard = await VaccinationCard.findOne({ pet: pet._id });

		if (!vaccinationCard) {
			res
				.status(400)
				.json({ message: "Vaccination card not found for the pet" });
			return;
		}

		const vaccinationIndex = vaccinationCard.vaccine.findIndex(
			(vaccine) => vaccine._id.toString() === vaccinationId
		);

		if (vaccinationIndex === -1) {
			res.status(400).json({ message: "Vaccination not found" });
			return;
		}

		// Update the vaccineGivenDate to today's date
		vaccinationCard.vaccine[vaccinationIndex].vaccineGivenDate = new Date();

		if (!req.body.vaccineRenewalDate) {
			vaccinationCard.vaccine[vaccinationIndex].vaccineRenewalDate = null;
		} else {
			vaccinationCard.vaccine[vaccinationIndex].vaccineRenewalDate =
				req.body.vaccineRenewalDate;
		}

		// Save the updated vaccination card
		await vaccinationCard.save();
		console.log("KHALASNA DIH");

		res.status(200).json({ message: "Vaccination renewed successfully" });
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Delete Pet Vaccination
// @route DELETE /user/deleteVaccination/:petId/:vaccinationId
// @access Private
const deleteVaccination = asyncHandler(async (req, res) => {
	try {
		const petId = req.params.petId;

		if (!mongoose.Types.ObjectId.isValid(petId)) {
			res.status(400).json({ message: "Invalid Pet ID" });
			return;
		}

		const vaccinationId = req.params.vaccinationId;

		if (!mongoose.Types.ObjectId.isValid(vaccinationId)) {
			res.status(400).json({ message: "Invalid Vaccination ID" });
			return;
		}

		const pet = await Pet.findById(petId);

		if (!pet) {
			res.status(400).json({ message: "Pet not found" });
			return;
		}

		const vaccinationCard = await VaccinationCard.findOne({ pet: pet._id });

		if (!vaccinationCard) {
			res
				.status(400)
				.json({ message: "Vaccination card not found for the pet" });
			return;
		}

		const vaccinationIndex = vaccinationCard.vaccine.findIndex(
			(vaccine) => vaccine._id.toString() === vaccinationId
		);

		if (vaccinationIndex === -1) {
			res.status(400).json({ message: "Vaccination not found" });
			return;
		}

		// Remove the vaccination from the array
		vaccinationCard.vaccine.splice(vaccinationIndex, 1);

		// Save the updated vaccination card
		await vaccinationCard.save();

		res.status(200).json({ message: "Vaccination deleted successfully" });
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Change Password
// @route POST /user/changePassword
// @access Private
const changePassword = asyncHandler(async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		const { oldPassword, newPassword, confirmPassword } = req.body;

		if (!oldPassword || !newPassword || !confirmPassword) {
			res.status(400).json({ message: "Enter All Fields" });
			return;
		}

		if (!(await bcrypt.compare(oldPassword, user.password))) {
			res.status(400).json({ message: "Invalid Password" });
			return;
		} else if (await bcrypt.compare(newPassword, user.password)) {
			res
				.status(400)
				.json({ message: "New Password Cannot Be The Same As Old Password" });
			return;
		} else if (newPassword !== confirmPassword) {
			res.status(400).json({ message: "Passwords Don't Match" });
			return;
		} else if (!passwordValidator(newPassword)) {
			res.status(400).json({
				message:
					"Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, and one digit",
			});
			return;
		} else {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(newPassword, salt);

			user.password = hashedPassword;
			await user.save();
			res.status(200).json({ message: "Password Changed" });
			req.user = null;
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Forgot Username
// @route POST /user/forgotUsername
// @access Public
const forgotUsername = asyncHandler(async (req, res) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		res.status(400).json({ message: "User Not Found!" });
		return;
	} else {
		const transporter = nodemailer.createTransport({
			service: "",
			auth: {
				user: "",
				pass: "",
			},
		});

		const mailOptions = {
			from: "",
			to: user.email,
			subject: "[NO REPLY] Your Username",
			html: `<h1>Your username is ${user.username}<h1>
			<p>If you did not request to retrieve your username, you can safely disregard this message.<p>
			<p>This Is An Automated Message, Please Do Not Reply.<p>`,
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				res.status(500);
				throw new Error("Failed to Send Username Email.");
			} else {
				res
					.status(200)
					.json({ message: "Username Sent, Please Check Your Email" });
			}
		});
	}
});

// @desc Request OTP
// @route POST /user/requestOTP
// @access Public
const requestOTP = asyncHandler(async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });

		if (!user) {
			res.status(400).json({ message: "User Not Found!" });
			return;
		} else {
			const otp = generateOTP();
			user.passwordResetOTP = otp;
			await user.save();
			otpExpiry = new Date();
			otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);
			console.log(otpExpiry);

			const transporter = nodemailer.createTransport({
				service: "",
				auth: {
					user: "",
					pass: "",
				},
			});

			const mailOptions = {
				from: "",
				to: user.email,
				subject: "[NO REPLY] Your Password Reset Request",
				html: `<h1>You have requested to reset your password.<h1>
                <p>Your OTP is ${otp}<p>
                <p>If you did not request to reset your password, you can safely disregard this message.<p>
                <p>This Is An Automated Message, Please Do Not Reply.<p>`,
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					res.status(500);
					throw new Error("Failed to Send OTP Email.");
				} else {
					res
						.status(200)
						.json({ message: "OTP Sent, Please Check Your Email" });
				}
			});
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Verify OTP
// @route POST /user/verifyOTP
// @access Public
const verifyOTP = asyncHandler(async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		const otp = req.body.otp;

		if (!otp) {
			res.status(400).json({ message: "Please Enter OTP" });
			return;
		} else {
			if (Date.now() > otpExpiry) {
				res.status(400).json({ message: "OTP Expired, Please Try Again" });
				return;
			} else {
				if (user.passwordResetOTP === otp) {
					user.passwordResetOTP = "";
					await user.save();
					otpExpiry = null;
					res.status(200).json({ message: "OTP Verified" });
				} else {
					res.status(400).json({ message: "Invalid OTP" });
					return;
				}
			}
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

// @desc Reset Password
// @route POST /user/resetPassword
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		const { newPassword, confirmPassword } = req.body;

		if (!newPassword || !confirmPassword) {
			res.status(400).json({ message: "Enter All Fields" });
			return;
		} else if (newPassword !== confirmPassword) {
			res.status(400).json({ message: "Passwords Don't Match" });
			return;
		} else if (!passwordValidator(newPassword)) {
			res.status(400).json({
				message:
					"Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, and one digit",
			});
			return;
		} else {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(newPassword, salt);

			user.password = hashedPassword;
			await user.save();
			res.status(200).json({ message: "Password Has Been Reset" });
		}
	} catch (error) {
		res.status(500);
		throw new Error(error);
	}
});

module.exports = {
	createAdmin,
	createUser,
	getUsers,
	deleteUser,

	loginUser,
	logoutUser,
	getUserInfo,
	deleteUserProfile,
	updateUserProfile,
	changePassword,
	forgotUsername,
	requestOTP,
	verifyOTP,
	resetPassword,
	getPetInfo,
	updatePetProfile,
	deletePetProfile,
	createVaccinationCard,
	getVaccinationCard,
	addVaccination,
	renewVaccination,
	deleteVaccination,

	createOwner,
	getOwnerInfo,
	getOwner,
	getOwnerPets,
	updateOwnerProfile,
	deleteOwnerProfile,

	createPet,
};
