// React Imports
import React from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";

// Vet Name Imports
import { VET_NAME as vet_name } from "../../utils/constants";

// Custom Component Imports
import Header from "../../components/General/Header";
import OwnerTable from "../../components/Owner/OwnerTable";

export default function OwnerTablePage() {
	return (
		<>
			<HelmetProvider>
				<Helmet>
					<title>Owner Table | {vet_name}</title>
				</Helmet>
			</HelmetProvider>

			<Header />
			<OwnerTable />
		</>
	);
}
