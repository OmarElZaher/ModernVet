import React from "react";

import { HelmetProvider, Helmet } from "react-helmet-async";

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HomePage() {
	return (
		<>
			<HelmetProvider>
				<Helmet>
					<title>Home | Modern Vet</title>
				</Helmet>
			</HelmetProvider>

			<Header />
			<Footer />
		</>
	);
}