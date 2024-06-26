import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Filter from "components/filter";
import BoxCard from "components/Card";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as util from "../../services/utilService";
import Search from "components/search";
import NoResult from "pages/content/noResultFound";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import appConfig from "../../configs/appConfig.json";
const urlConfig = require("../../configs/urlConfig.json");
import ToasterCommon from "../ToasterCommon";
const routeConfig = require("../../configs/routeConfig.json");
const ContinueLearning = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [courseStatus, setCourseStatus] = useState([]);
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); // Number of items per page
  const navigate = useNavigate();
  const location = useLocation();
  const { domain } = location.state || {};
  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };
  useEffect(() => {
    fetchData();
    fetchGradeLevels();
  }, [filters]);
  const handleFilterChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setFilters({ ...filters, se_gradeLevel: selectedValues });
  };
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const _userId = util.userId();
    const headers = {
      "Content-Type": "application/json",
    };
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.GET_ENROLLED_COURSES}/${_userId}?orgdetails=${appConfig.Course.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.Course.contentApiQueryParams.licenseDetails}&fields=${urlConfig.params.enrolledCourses.fields}&batchDetails=${urlConfig.params.enrolledCourses.batchDetails}&contentDetails=${urlConfig.params.enrolledCourses.contentDetails}`;
      const response = await fetch(url, headers);
      const responseData = await response.json();
      setData(responseData.result.courses);
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };
  const fetchGradeLevels = async () => {
    const defaultFramework = localStorage.getItem("defaultFramework");
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.FRAMEWORK.READ}/nulp?categories=${urlConfig.params.framework}`;
      const response = await fetch(url);
      const data = await response.json();
      if (
        data.result &&
        data.result.framework &&
        data.result.framework.categories
      ) {
        const gradeLevelCategory = data.result.framework.categories.find(
          (category) => category.identifier === "nulp_gradelevel"
        );
        if (gradeLevelCategory && gradeLevelCategory.terms) {
          const gradeLevelsOptions = gradeLevelCategory.terms.map((term) => ({
            value: term.code,
            label: term.name,
          }));
          setGradeLevels(gradeLevelsOptions);
        }
      }
    } catch (error) {
      console.error("Error fetching grade levels:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };
  const handleCourseStatusChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setCourseStatus(selectedValues);
  };
  // Filtered courses based on selected course status
  const filteredCourses = useMemo(() => {
    if (!courseStatus.length) {
      return data;
    }
    return data.filter((courses) =>
      courseStatus.includes(courses.contents.status)
    );
  }, [courseStatus, data]);
  const handleCardClick = (contentId, courseType) => {
    if (courseType === "Course") {
      navigate(
        `${routeConfig.ROUTES.JOIN_COURSE_PAGE.JOIN_COURSE}?${contentId}`
      );
    } else {
      navigate(routeConfig.ROUTES.PLAYER_PAGE.PLAYER);
    }
  };
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };
  // Calculate the courses to display based on current page
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, filteredCourses]);
  return (
    <div>
      {toasterMessage && <ToasterCommon response={toasterMessage} />}
      <Container
        maxWidth="xl"
        className="filter-profile allContentlearning cardheight lg-pr-0"
      >
        {error && (
          <Alert severity="error" className="my-10">
            {error}
          </Alert>
        )}
        <Box style={{ margin: "20px 0 20px -9px" }}>
          <Filter
            options={gradeLevels}
            label="Filter by Sub-Domain"
            onChange={handleFilterChange}
          />
        </Box>
        <Box textAlign="center" padding="10" className="mt-30">
          <Box>
            <Grid container spacing={2}>
              <Box className="custom-card xs-pl-17 profile-card-view w-100">
                {paginatedCourses.length === 0 ? (
                  <NoResult />
                ) : (
                  paginatedCourses.map((items) => (
                    <Box className="custom-card-box" key={items.contentId}>
                      <BoxCard
                        items={items.content}
                        index={filteredCourses.length}
                        onClick={() =>
                          handleCardClick(
                            items.content.identifier,
                            items.content.primaryCategory
                          )
                        }
                      ></BoxCard>
                    </Box>
                  ))
                )}
                <div className="blankCard"></div>
              </Box>
            </Grid>
          </Box>
          <Pagination
            count={Math.ceil(filteredCourses.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
      </Container>
      <FloatingChatIcon />
    </div>
  );
};
export default ContinueLearning;
