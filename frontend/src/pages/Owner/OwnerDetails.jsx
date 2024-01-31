// React Imports
import React from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";

// Vet Name Imports
import { VET_NAME as vet_name } from "../../utils/constants";

// Custom Component Imports
import Header from "../../components/General/Header";
import OwnerDetails from "../../components/Owner/OwnerDetails";

export default function OwnerDetailsPage() {
	return (
		<>
			<HelmetProvider>
				<Helmet>
					<title>Owner Details | {vet_name}</title>
				</Helmet>
			</HelmetProvider>

			<Header />
			<OwnerDetails />
		</>
	);
}
