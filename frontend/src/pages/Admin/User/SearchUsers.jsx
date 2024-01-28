// React Imports
import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Vet Name Imports
import { vet_name } from "../../../variables";

// Custom Component Imports
import AdminHeader from "../../../components/Admin/General/AdminHeader";
import SearchUsers from "../../../components/Admin/User/SearchUsers";

export default function SearchUsersPage() {
	return (
		<>
			<HelmetProvider>
				<Helmet>
					<title>Search Users | {vet_name}</title>
				</Helmet>
			</HelmetProvider>

			<AdminHeader />
			<SearchUsers />
		</>
	);
}
