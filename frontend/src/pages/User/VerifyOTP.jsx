// React Imports
import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Custom Component Imports
import { VET_NAME as vet_name } from "../../utils/constants";

// Custom Component Imports
import VerifyOTP from "../../components/User/VerifyOTP";

export default function VerifyOTPPage() {
	return (
		<>
			<HelmetProvider>
				<Helmet>
					<title>Verify OTP | {vet_name}</title>
				</Helmet>
			</HelmetProvider>
			<VerifyOTP />
		</>
	);
}