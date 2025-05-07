import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import {
	Box,
	Text,
	Button,
	Table,
	TableContainer,
	Th,
	Thead,
	Tr,
	Td,
	Tbody,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";

import Spinner from "../General/Spinner";

import { FaPerson } from "react-icons/fa6";
import { MdOutlinePets } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { IoReload } from "react-icons/io5";

import { VET_NAME as vetName, API_URL as api } from "../../utils/constants";

function titleCase(str) {
	if (!str) return "";
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
}

export default function Home() {
	const toast = useToast();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [openCases, setOpenCases] = useState([]);
	const [selectedCase, setSelectedCase] = useState(null);

	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		const fetchOpenCases = async () => {
			try {
				setLoading(true);
				const response = await axios.get(`${api}/case/getUnassignedCases`, {
					withCredentials: true,
				});

				if (response.status === 200) {
					setOpenCases(response.data.cases);
				} else {
					setError(response.data.message);
				}
			} catch (error) {
				setError(error.response.data.message);
			} finally {
				setLoading(false);
			}
		};

		fetchOpenCases();
	}, [toast]);

	const handleShowDetails = (caseItem) => {
		setSelectedCase(caseItem);
		onOpen();
	};

	return (
		<>
			{loading ? (
				<Spinner />
			) : error ? (
				<>
					<Box
						dir='rtl'
						display={"flex"}
						flexDirection={"column"}
						justifyContent={"center"}
						alignItems={"center"}
						bg={"#F3F3F3"}
						height={"87vh"}
					>
						<Text fontWeight={"bold"} fontSize={"60px"} color={"red"}>
							ERROR
						</Text>
						<Text fontSize={"40px"} textDecoration={"underline"}>
							{error}
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
								window.location.reload();
							}}
							rightIcon={<IoReload />}
							bg={"#FFF"}
							width={"25vw"}
							mt={10}
						>
							Reload Page
						</Button>
					</Box>
				</>
			) : (
				<>
					{/* Welcome Box */}
					<Box
						height={"10vh"}
						display={"flex"}
						justifyContent={"center"}
						alignItems={"center"}
						bg={"#F3F3F3"}
					>
						<Text fontSize={"30px"} fontWeight={"bold"}>
							{"Welcome to " + vetName + " Vet Clinic"}
						</Text>
					</Box>

					<hr />

					{/* Search Box */}
					<Box
						display={"flex"}
						justifyContent={"center"}
						alignItems={"center"}
						bg={"#F3F3F3"}
						height={"33vh"}
					>
						{/* Search Owner Block */}
						<Box
							width={"50%"}
							height={"95%"}
							mx={5}
							display={"flex"}
							justifyContent={"center"}
							alignItems={"center"}
						>
							<Box
								display={"flex"}
								justifyContent={"center"}
								alignItems={"center"}
								flexDirection={"column"}
								height={"80%"}
							>
								<Text fontSize={"28px"} fontWeight={"bold"} my={10}>
									Want to search for an owner?
								</Text>
								<Button
									_hover={{
										bg: "#D4F500",
										borderColor: "#D4F500",
										color: "#000",
										transform: "scale(1.05)",
									}}
									_active={{
										transform: "scale(0.98)",
										opacity: "0.5",
									}}
									onClick={() => {
										navigate("/search-owner");
									}}
									justifyContent={"flex-start"}
									alignItems={"center"}
									transition='all 0.15s ease'
									bg='#FFF'
									color='#000'
									fontSize='18px'
									my={5}
									rightIcon={<FaPerson />}
								>
									Go To Owner Search Page
								</Button>
							</Box>
						</Box>

						{/* Search Pet Block */}
						<Box
							width={"50%"}
							height={"95%"}
							mx={5}
							display={"flex"}
							justifyContent={"center"}
							alignItems={"center"}
						>
							<Box
								display={"flex"}
								justifyContent={"center"}
								alignItems={"center"}
								flexDirection={"column"}
								height={"80%"}
							>
								<Text fontSize={"28px"} fontWeight={"bold"} my={10}>
									Want to search for a pet?
								</Text>
								<Button
									_hover={{
										bg: "#D4F500",
										borderColor: "#D4F500",
										color: "#000",
										transform: "scale(1.05)",
									}}
									_active={{
										transform: "scale(0.98)",
										opacity: "0.5",
									}}
									onClick={() => {
										navigate("/search-pet");
									}}
									justifyContent={"flex-start"}
									alignItems={"center"}
									transition='all 0.15s ease'
									bg='#FFF'
									color='#000'
									fontSize='18px'
									my={5}
									rightIcon={<MdOutlinePets />}
								>
									Go To Pet Search Page
								</Button>
							</Box>
						</Box>
					</Box>

					<hr />

					{/* Open Cases Box */}
					<Box
						display={"flex"}
						justifyContent={"center"}
						alignItems={"center"}
						flexDirection={"column"}
						bg={"#F3F3F3"}
						height={"44vh"}
					>
						<Box
							display={"flex"}
							justifyContent={"center"}
							alignItems={"center"}
							width={"90%"}
							height={"10%"}
						>
							<Text fontSize={"28px"} fontWeight={"bold"}>
								Open Cases
							</Text>
						</Box>
						<Box
							dir='rtl'
							display={"flex"}
							justifyContent={"center"}
							alignItems={"center"}
							width={"90%"}
							height={"70%"}
							mx={5}
						>
							{openCases.length === 0 ? (
								<Text fontSize={"20px"} color={"#121211"}>
									لا توجد حالات متاحة
								</Text>
							) : (
								<>
									<TableContainer
										width={"80%"}
										maxHeight={"70vh"}
										overflowY={"auto"}
									>
										<Table variant='simple' size='md'>
											<Thead>
												<Tr>
													<Th textAlign={"right"}>اسم الحيوان</Th>
													<Th textAlign={"center"}>السلالة</Th>
													<Th textAlign={"center"}>النوع</Th>
													<Th textAlign={"center"}>فئة الوزن</Th>
													<Th textAlign={"left"}>تفاصيل</Th>
												</Tr>
											</Thead>
											<Tbody>
												{openCases.map((row) => (
													<Tr key={row._id}>
														<Td textAlign={"right"}>{`${row.petId.name}`}</Td>
														<Td textAlign={"center"}>{`${titleCase(
															row.petId.breed
														)}`}</Td>
														<Td textAlign={"center"}>{`${titleCase(
															row.petId.type
														)}`}</Td>
														<Td
															textAlign={"center"}
														>{`${row.petId.weightClass}`}</Td>

														<Td textAlign={"left"}>
															<Button
																rightIcon={<IoMdEye />}
																onClick={() => handleShowDetails(row)}
																variant='solid'
																_hover={{
																	bg: "#D4F500",
																	borderColor: "#D4F500",
																	color: "#000",
																	transform: "scale(1.05)",
																}}
															>
																عرض
															</Button>
														</Td>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								</>
							)}
						</Box>
					</Box>

					{/* Modal for Case Details */}
					<Modal isOpen={isOpen} onClose={onClose}>
						<ModalOverlay />
						<ModalContent dir='rtl'>
							<ModalHeader textAlign={"center"}>تفاصيل الحالة</ModalHeader>
							<ModalCloseButton />
							<ModalBody>
								<Text fontSize='lg'>
									<strong>السبب للزيارة:</strong>
									<br />
									{selectedCase?.reasonForVisit || "غير متوفر"}
								</Text>
							</ModalBody>
							<ModalFooter>
								<Button
									rightIcon={<IoMdEye />}
									onClick={() => navigate("/view-cases")}
									variant='solid'
									mx={5}
									_hover={{
										bg: "#D4F500",
										borderColor: "#D4F500",
										color: "#000",
										transform: "scale(1.05)",
									}}
								>
									Open Cases Page
								</Button>
								<Button
									onClick={onClose}
									_hover={{
										bg: "red",
										color: "#000",
										transform: "scale(1.05)",
									}}
								>
									إلغاء
								</Button>
							</ModalFooter>
						</ModalContent>
					</Modal>
				</>
			)}
		</>
	);
}
