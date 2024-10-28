import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  DialogActions,
  Grid,
  Container,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import * as util from "../../services/utilService";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { Edit, Visibility, Delete } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import submissions from "./lernSubmission.json";
import Paper from "@mui/material/Paper";
import { useNavigate, useLocation } from "react-router-dom";
import { Pagination } from "@mui/material";

import Footer from "components/Footer";
import Header from "components/header";

const LernSubmissionTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState("");
  const _userId = util.userId(); // Assuming util.userId() is defined
  const urlConfig = require("../../configs/urlConfig.json");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const routeConfig = require("../../configs/routeConfig.json");

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, search]);

  const fetchData = async () => {
    const assetBody = {
      request: {
        filters: {
          created_by: _userId,
        },
        sort_by: {
          created_on: "desc",
        },
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        search: search,
      },
    };
    try {
      const response = await fetch(`${urlConfig.URLS.LEARNATHON.LIST}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assetBody),
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const result = await response.json();
      console.log("suceesss----", result);
      console.log(result.result);
      setData(result.result.data);
      setTotalRows(result.result.totalCount / 10);
    } catch (error) {
      console.log("error---", error);
      // setError(error.message);
    } finally {
      // setIsLoading(false);
    }

    // Example API endpoint with limit, offset, and search params
    // const apiUrl = `https://api.example.com/submissions?limit=${rowsPerPage}&offset=${
    //   page * rowsPerPage
    // }&search=${search}`;
    // const response = await fetch(apiUrl);

    // const result = await response.json();
    // console.log(submissions);
    // setData(submissions.result.data);
    // setTotalRows(result.totalCount);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page on search
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDeletePollConfirmed = async (id) => {
    event.stopPropagation();
    try {
      const response = await fetch(
        `${urlConfig.URLS.LEARNATHON.DELETE}?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const result = await response.json();
      console.log("suceesss----", result);
      setDialogOpen(false);
    } catch (error) {
      console.log("error---", error);
      // setError(error.message);
    } finally {
      // setIsLoading(false);
    }
  };

  const deleteContent = async (id) => {
    // show confirmation popup
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Header />
      <Container
        maxWidth="xl"
        className="pb-30 allContent xs-pb-80 all-card-list mt-180"
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" gutterBottom className="fw-600 mt-20" color={'#484848'}>
            Learnathon Submissions List
          </Typography>
        </Box>
        <Grid container>
          <Grid item xs={5}>
            <Box display="flex" alignItems="center" mb={2}>
              <TextField
                variant="outlined"
                placeholder="Search Submission"
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  endAdornment: <SearchIcon />,
                }}
                size="small"
                sx={{ background: "#fff" }}
              />
            </Box>
          </Grid>
          <Grid item xs={5}></Grid>
          <Grid item xs={2}>
            <Button
              className="viewAll"
              onClick={() =>
              (window.location.href =
                routeConfig.ROUTES.LEARNATHON.CREATELEARNCONTENT)
              }
              sx={{ padding: "7px 45px", borderRadius: "90px !important" }}
            >
              Upload Submission
            </Button>
          </Grid>

        </Grid>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead sx={{ background: "#D8F6FF" }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>

              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.title_of_submission}</TableCell>
                  <TableCell>
                    {new Date(row.updated_on).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    style={{
                      color:
                        row.status === "live"
                          ? "green"
                          : row.status === "review"
                            ? "orange"
                            : "red",
                      textTransform: "capitalize",
                    }}
                  >
                    {row.status}
                  </TableCell>
                  <TableCell>
                    {row.status == "draft" && (
                      <IconButton
                        color="primary"
                        onClick={() =>
                        (window.location.href =
                          routeConfig.ROUTES.LEARNATHON.CREATELEARNCONTENT +
                          "?" +
                          row.learnathon_content_id)
                        }
                        sx={{ color: "#057184" }}
                        className="table-icon"
                      >
                        <Edit />
                      </IconButton>
                    )}
                    {
                      <IconButton
                        color="primary"
                        onClick={() =>
                        (window.location.href =
                          routeConfig.ROUTES.PLAYER_PAGE.PLAYER +
                          "?id=" +
                          row.learnathon_content_id +
                          "&page=lern")
                        }
                        sx={{ color: "#054753" }}
                        className="table-icon"
                      >
                        <Visibility />
                      </IconButton>
                    }
                    {(row.status == "draft" || row.status == "review") && (
                      <IconButton
                        color="secondary"
                        onClick={() => handleDialogOpen()}
                        sx={{ color: "red" }}
                        className="table-icon"
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogContent>
            <Box className="h5-title">
              Are you sure you want to delete this submission
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} className="custom-btn-default">
              {t("NO")}
            </Button>
            <Button
              onClick={(event) => handleDeletePollConfirmed(row.content_id)}
              className="custom-btn-primary"
            >
              {t("YES")}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Footer />
    </>
  );
};

export default LernSubmissionTable;
