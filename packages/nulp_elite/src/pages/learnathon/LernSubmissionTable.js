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
import Paper from "@mui/material/Paper";
import { useNavigate, useLocation } from "react-router-dom";
import { Pagination } from "@mui/material";

import Footer from "components/Footer";
import Header from "components/header";
import dayjs from "dayjs";

const LernSubmissionTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState("");
  const _userId = util.userId(); // Assuming util.userId() is defined
  const urlConfig = require("../../configs/urlConfig.json");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emptySubmission, setEmptySubmission] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lernId, setLernId] = useState();
  const [contId, setcontId] = useState();
  const handleDialogOpen = (learnathon_content_id, content_id) => {
    setDialogOpen(true);
    setLernId(learnathon_content_id);
    setcontId(content_id);
  };

  const routeConfig = require("../../configs/routeConfig.json");


const isSubmissionClosed = dayjs().isAfter(
  dayjs(urlConfig.LEARNATHON_DATES.CONTENT_SUBMISSION_END_DATE),
  "minute"
);

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, search]);

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
        offset: 10 * (currentPage - 1),
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
      if (result.result.totalCount == 0) {
        setEmptySubmission(true);
      }
      setTotalRows(Math.ceil(result.result.totalCount / 10));
    } catch (error) {
      console.log("error---", error);
      // setError(error.message);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDeletePollConfirmed = async () => {
    event.stopPropagation();
    try {
      const response = await fetch(
        `${urlConfig.URLS.LEARNATHON.DELETE}?id=${lernId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Something went wrong");
      }
      const result = await response.json();
      console.log("suceesss----", result);
      window.location.reload();
      setDialogOpen(false);
    } catch (error) {
      console.log("error---", error);
      // setError(error.message);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleChange = (event, value) => {
    if (value !== currentPage) {
      setCurrentPage(value);
      fetchData();
    }
  };

  return (
    <>
      <Header />
      <Container
        maxWidth="xl"
        className="pb-30 allContent xs-pb-80 all-card-list mt-180"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            gutterBottom
            className="fw-600 mt-20"
            color={"#484848"}
          >
            {t("LEARN_SUBMISSION_LIST")}
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
          {!isSubmissionClosed && (
            <Button
              className="viewAll"
              onClick={() =>
                (window.location.href =
                  routeConfig.ROUTES.LEARNATHON.CREATELEARNCONTENT)
              }
              sx={{ padding: "7px 45px", borderRadius: "90px !important" }}
            >
              {t("UPLOAD_SUBMISSION")}
            </Button>
          )}
          </Grid>
        </Grid>
        {!emptySubmission && (
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead sx={{ background: "#D8F6FF" }}>
                <TableRow>
                  <TableCell>{t("NAME")}</TableCell>
                  <TableCell>{t("LAST_UPDATED")}</TableCell>
                  <TableCell>{t("CATEGORY")}</TableCell>
                  <TableCell>{t("STATUS")}</TableCell>
                  <TableCell>{t("ACTION")}</TableCell>
                  {!isSubmissionClosed && <TableCell>{t("ACTION")}</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.title_of_submission}</TableCell>
                    <TableCell>
                      {new Date(row.updated_on).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{row.category_of_participation}</TableCell>

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
                    {!isSubmissionClosed &&(
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
                              "&page=lernpreview")
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
                          onClick={() =>
                            handleDialogOpen(
                              row.learnathon_content_id,
                              row.content_id
                            )
                          }
                          sx={{ color: "red" }}
                          className="table-icon"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {emptySubmission &&  isSubmissionClosed && (
          <Box marginLeft={"550px"} padding={"32px"}>
            <Box>{t("NO_SUBMISSION")}</Box>
            <Button
              className="viewAll"
              onClick={() =>
                (window.location.href =
                  routeConfig.ROUTES.LEARNATHON.CREATELEARNCONTENT)
              }
              sx={{
                padding: "7px 45px",
                borderRadius: "90px !important",
                marginLeft: "58px",
                marginTop: "23px",
              }}
            >
              {t("UPLAOD_SUBMISSION")}
            </Button>
          </Box>
        )}

        <Pagination
          count={totalRows}
          page={currentPage}
          onChange={handleChange}
        />
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogContent>
            <Box className="h5-title">{t("CONFIRM_DELETE")}</Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} className="custom-btn-default">
              {t("NO")}
            </Button>
            <Button
              onClick={(event) => handleDeletePollConfirmed()}
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
