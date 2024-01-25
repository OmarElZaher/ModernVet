const convertToLowercase = (req, res, next) => {
	if (req.body && typeof req.body === "object") {
		for (const key in req.body) {
			if (
				req.body.hasOwnProperty(key) &&
				typeof req.body[key] === "string" &&
				key.toLowerCase() !== "password" &&
				key.toLowerCase() !== "newPassword" &&
				key.toLowerCase() !== "confirmPassword"
			) {
				req.body[key] = req.body[key].toLowerCase();
			}
		}
	}
	next();
};

module.exports = convertToLowercase;
