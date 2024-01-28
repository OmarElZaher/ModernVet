// React Imports
import React from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";

// Vet Name Imports
import { vet_name } from "../../variables";

// Custom Component Imports
import Header from "../../components/General/Header";
import PetTable from "../../components/Pet/PetTable";

export default function PetTablePage() {
	return (
		<>
			<HelmetProvider>
				<Helmet>
					<title>Pet Table | {vet_name}</title>
				</Helmet>
			</HelmetProvider>

			<Header />
			<PetTable />
		</>
	);
}
