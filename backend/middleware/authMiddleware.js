const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/SystemModels/userModel");

const authenticate = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			// Get token from header
			token = req.headers.authorization.split(" ")[1];

			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			const user = await User.findById(decoded.id).select("-password");

			if (!user) {
				res.status(401);
				throw new Error("Unauthorized");
			}

			req.user = user;

			next();
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				res.status(401);
				throw new Error("Token has expired");
			} else {
				res.status(401);
				throw new Error("Error: Unauthorized");
			}
		}
	}

	if (!token) {
		res.status(401);
		throw new Error("No Token");
	}
});

module.exports = { authenticate };
