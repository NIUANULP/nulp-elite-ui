import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Box,
  Pagination,
  Button
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Footer from "components/Footer";
import Header from "components/header";
const urlConfig = require("../../configs/urlConfig.json");
import NoResult from "../content/noResultFound";
import { useNavigate } from "react-router-dom"; 
 
const UserList = () => {
  const { t } = useTranslation();
  const rowsPerPage = 10;
 
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    fetchUserDetails();
  }, [currentPage]);
 
  const fetchUserDetails = async () => {
    setIsLoading(true);
    setError(null);
 
    try {
      const response = await fetch(`${urlConfig.LEARNATHON_USERLIST.USERLIST}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
 
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
 
      const result = await response.json();
      setData(result.result.data || []);
      setTotalRows(result.result.totalCount || 0);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
 
  // const filteredData = data.filter((row) =>
  //   row.name.toLowerCase().includes(search.toLowerCase())
  // );
  
  const handleBack = () => {
    navigate('/webapp/learndashboard');
  };
 
  // const paginatedData = filteredData.slice(
  //   (currentPage - 1) * rowsPerPage,
  //   currentPage * rowsPerPage
  // );

  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
 
  return (
    <div>
      <Header />
      <Box mt={8}>
        <Container>
        <Button 
            onClick={handleBack}
            className="custom-btn-primary"
            sx={{ mb: 3 }}
        >
            {t("Back")}
          </Button>
          {error && <div style={{ color: "red" }}>{t(error)}</div>}
          {isLoading ? (
            <div>{t("Loading...")}</div>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                <TableHead sx={{ background: "#D8F6FF" }}>
                    <TableRow>
                      <TableCell>{t("User Id")}</TableCell>
                      <TableCell>{t("Designation")}</TableCell>
                      <TableCell>{t("User Type")}</TableCell>
                      <TableCell>{t("Organization")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.user_id}</TableCell>
                          <TableCell>{row.designation}</TableCell>
                          <TableCell>{row.user_type}</TableCell>
                          <TableCell>{row.organisation}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                        <NoResult />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box py={2} display="flex" justifyContent="center">
                <Pagination
                  count={Math.ceil(totalRows / rowsPerPage)}
                  page={currentPage}
                  onChange={(event, value) => setCurrentPage(value)}
                />
              </Box>
            </>
          )}
        </Container>
      </Box>
      <Footer />
    </div>
  );
};
 
export default UserList;
 