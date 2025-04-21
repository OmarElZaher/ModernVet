// React Imports
import React from "react";
import { useNavigate } from "react-router-dom";

// Chakra UI Imports
import {
	Box,
	Button,
	Table,
	TableContainer,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Text,
} from "@chakra-ui/react";

// React Icons Imports
import { IoMdEye, IoMdArrowRoundBack } from "react-icons/io";

// Component Imports
import Footer from "../General/Footer";

function titleCase(str) {
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
}

export default function PetTable() {
	const navigate = useNavigate();
	const data = localStorage.getItem("petFilterData");

	if (data === null) {
		return (
			<>
				<Box
					display={"flex"}
					flexDirection={"column"}
					justifyContent={"center"}
					alignItems={"center"}
					height={"100vh"}
				>
					<Text fontWeight={"bold"} fontSize={"60px"} color={"red"}>
						غير موجود
					</Text>
					<Text fontSize={"25px"} textDecoration={"underline"}>
						من فضلك دور على حيوان أليف قبل ما تفتح الصفحة دي
					</Text>
					<Button
						_hover={{
							bg: "yellowgreen",
							color: "#000",
							transform: "scale(1.01)",
						}}
						_active={{
							transform: "scale(0.99)",
							opacity: "0.5",
						}}
						onClick={() => {
							navigate("/search-pet");
						}}
						leftIcon={<IoMdArrowRoundBack />}
						width={"25vw"}
						mt={10}
					>
						الرجوع للبحث
					</Button>
				</Box>
			</>
		);
	} else {
		return (
			<>
				<Box width={"100%"} height={"90vh"}>
					<Box
						display={"flex"}
						flexDirection={"column"}
						justifyContent={"center"}
						alignItems={"center"}
						height={"15%"}
						my={5}
					>
						<Text
							fontSize={"35px"}
							color={"#121211"}
							fontWeight={500}
							textDecoration={"underline"}
						>
							الحيوانات اللي لقيناها
						</Text>
					</Box>
					<Box
						display={"flex"}
						flexDirection={"column"}
						justifyContent={"center"}
						alignItems={"center"}
						width={"100%"}
						height={"70%"}
					>
						<TableContainer width={"80%"} maxHeight={"70vh"} overflowY={"auto"}>
							<Table variant='simple' size='md'>
								<Thead>
									<Tr>
										<Th textAlign={"left"}>الاسم</Th>
										<Th textAlign={"center"}>النوع</Th>
										<Th textAlign={"center"}>السلالة</Th>
										<Th textAlign={"center"}>الجنس</Th>
										<Th textAlign={"right"}>عرض التفاصيل</Th>
									</Tr>
								</Thead>
								<Tbody>
									{JSON.parse(data).map((row) => (
										<Tr key={data._id}>
											<Td textAlign={"left"}>{titleCase(row.name)}</Td>
											<Td textAlign={"center"}>{titleCase(row.type)}</Td>
											<Td textAlign={"center"}>{titleCase(row.breed)}</Td>
											<Td textAlign={"center"}>{titleCase(row.gender)}</Td>
											<Td textAlign={"right"}>
												<Button
													_hover={{
														bg: "yellowgreen",
														color: "#000",
														transform: "scale(1.01)",
													}}
													_active={{
														transform: "scale(0.99)",
														opacity: "0.5",
													}}
													onClick={() => {
														navigate(`/pet-details/${row._id}`);
													}}
													leftIcon={<IoMdEye />}
												>
													عرض
												</Button>
											</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</TableContainer>
					</Box>
					<Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
						<Button
							_hover={{
								bg: "yellowgreen",
								color: "#000",
								transform: "scale(1.01)",
							}}
							_active={{
								transform: "scale(0.99)",
								opacity: "0.5",
							}}
							onClick={() => {
								localStorage.removeItem("petFilterData");
								navigate("/search-pet");
							}}
							leftIcon={<IoMdArrowRoundBack />}
							width={"25vw"}
							my={10}
						>
							الرجوع للبحث
						</Button>
					</Box>
				</Box>
				<Footer />
			</>
		);
	}
}
