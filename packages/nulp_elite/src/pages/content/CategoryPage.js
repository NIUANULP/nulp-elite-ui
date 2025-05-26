import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import BoxCard from "components/Card";
import Box from "@mui/material/Box";
import { getAllContents } from "services/contentService";
import Header from "components/header";
import Footer from "components/Footer";
import Container from "@mui/material/Container";
import Pagination from "@mui/material/Pagination";
import Alert from "@mui/material/Alert";
import CourseStructuredData from "components/CourseStructuredData";

import domainWithImage from "../../assets/domainImgForm.json";
import DomainCarousel from "components/domainCarousel";
import * as frameworkService from "../../services/frameworkService";
import * as util from "../../services/utilService";
import { t } from "i18next";
import appConfig from "../../configs/appConfig.json";
const urlConfig = require("../../configs/urlConfig.json");
import ToasterCommon from "../ToasterCommon";
import SkeletonLoader from "components/skeletonLoader";
import NoResult from "./noResultFound";
import { Loading } from "@shiksha/common-lib";

const CategoryPage = () => {
  const [domain, setDomain] = useState([]);
  const [channelData, setChannelData] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const { pageNumber } = useParams(1);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsArray, setItemsArray] = useState([]);
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [domainName, setDomainName] = useState(null);
  const routeConfig = require("../../configs/routeConfig.json");
  const [orgId, setOrgId] = useState();
  const [framework, setFramework] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const queryString = location.search;
  const cleanQueryString = queryString.startsWith("?")
    ? queryString.slice(1)
    : queryString;

  const [categoryRaw, preselectedDomainRaw] = cleanQueryString.split("?");

  const category = decodeURIComponent(categoryRaw || "");
  const preselectedDomain = decodeURIComponent(preselectedDomainRaw || "");
  const [clearDomains, setClearDomain] = useState(preselectedDomain);

  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };

  const handleDomainFilter = (query, domainName) => {
    setSelectedDomain(query);
    setDomainName(domainName);
    // fetchMoreItems(domainName);
  };

  useEffect(() => {
    fetchMoreItems();
  }, [selectedDomain, domainName, clearDomains]);

  useEffect(() => {
    fetchMoreItems(selectedDomain);
  }, [currentPage]);

  const handleGoBack = () => {
    navigate(-1); // Navigate back in history
  };

  const handlePageChange = (event, newValue) => {
    setCurrentPage(newValue);
  };

  const fetchMoreItems = async (selectedDomain) => {
    setIsLoading(true);
    const newPath = location.pathname + "?" + category;
    sessionStorage.setItem("previousRoutes", newPath);
    setError(null);
    let data = JSON.stringify({
      request: {
        filters: {
          status: ["Live"],
          primaryCategory: [category],
          visibility: [],
          // board: domainName
          //   ? [domainName]
          //   : clearDomains && clearDomains !== "null"
          //   ? [clearDomains]
          //   : undefined,
          se_boards: domainName
            ? [domainName]
            : clearDomains && clearDomains !== "null"
            ? [clearDomains]
            : undefined,
        },
        limit: 50,
        sort_by: {
          lastPublishedOn: "desc",
        },
        fields: [
          "name",
          "appIcon",
          "medium",
          "subject",
          "resourceType",
          "contentType",
          "organisation",
          "topic",
          "mimeType",
          "trackable",
          "gradeLevel",
          "se_boards",
          "board",
          "se_subjects",
          "se_mediums",
          "se_gradeLevels",
          "primaryCategory",
          "createdOn",
          "previewUrl",
          "creator",
        ],
        facets: ["channel", "gradeLevel", "subject", "medium"],
        offset: 50 * (currentPage - 1),
      },
    });

    // Headers
    const headers = {
      "Content-Type": "application/json",
    };

    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CONTENT.SEARCH}?orgdetails=${appConfig.ContentPlayer.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.ContentPlayer.contentApiQueryParams.licenseDetails}`;
      const response = await getAllContents(url, data, headers);
      setData(response.data.result.content ?? []);
      setTotalPages(Math.ceil((response.data.result.count ?? 0) / 20));
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to push data to the array
  const pushData = (term) => {
    setItemsArray((prevData) => [...prevData, term]);
  };
  const fetchUserData = async () => {
    try {
      const uservData = await util.userData();
      setOrgId(uservData?.data?.result?.response?.rootOrgId);
      setFramework(uservData?.data?.result?.response?.framework?.id[0]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    if (orgId && framework) {
      fetchDomains();
    }
  }, [orgId, framework]);

  const fetchDomains = async () => {
    setError(null);
    const rootOrgId = sessionStorage.getItem("rootOrgId");
    const defaultFramework = localStorage.getItem("defaultFramework");
    // Headers
    const headers = {
      "Content-Type": "application/json",
      Cookie: `connect.sid=${getCookieValue("connect.sid")}`,
    };
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CHANNEL.READ}/${orgId}`;
      const response = await frameworkService.getChannel(url, headers);
      setChannelData(response.data.result ?? {});
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.FRAMEWORK.READ}/${framework}?orgdetails=${appConfig.ContentPlayer.contentApiQueryParams.orgdetails}`;
      const response = await frameworkService.getSelectedFrameworkCategories(
        url,
        headers
      );
      const categories = response?.data?.result?.framework?.categories;
      const selectedIndex = categories.findIndex(
        (category) => category.code === "board"
      );
      const terms =
        response.data.result.framework.categories[selectedIndex].terms ?? [];
      terms.forEach((term) => {
        if (domainWithImage) {
          domainWithImage.result.form.data.fields.forEach((imgItem) => {
            if ((term && term.code) === (imgItem && imgItem.code)) {
              term.image = imgItem.image ?? "";
              pushData(term);
              itemsArray.push(term);
            }
          });
        }
      });
      setDomain(terms);
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const getCookieValue = (name) => {
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const [cookieName, cookieValue] = cookie.split("=");
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return "";
  };

  const clearDomain = () => {
    setDomainName(null);
    setClearDomain(null);
    setSelectedDomain(null);
  };

  useEffect(() => {
    if (category) {
      fetchMoreItems(selectedDomain);
    }
    fetchUserData();
  }, [category]);

  const handleCardClick = (contentId, courseType) => {
    if (courseType === "Course") {
      navigate(
        `${routeConfig.ROUTES.JOIN_COURSE_PAGE.JOIN_COURSE}?${contentId}`
      );
    } else {
      navigate(`${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?id=${contentId}`);
    }
  };

  return (
    <>
      <Header />
      <Box>
        {toasterMessage && <ToasterCommon response={toasterMessage} />}
        {/* Dynamic data for course and course info structured data for SEO */}
        {data?.map((course, index) => (
          <CourseStructuredData key={index} course={course} />
        ))}
        {domain.length > 0 ? (
          <DomainCarousel
            onSelectDomain={handleDomainFilter}
            domains={domain}
            selectedDomainCode={preselectedDomain}
          />
        ) : (
          <SkeletonLoader />
        )}
        <Container
          maxWidth="xl"
          role="main"
          className="allContent xs-pb-20 pb-30 domain-list"
        >
          {(domainName || (clearDomains && clearDomains !== "null")) && (
            <Box
              className="d-flex mr-20 my-20"
              style={{ alignItems: "center", justifyContent: "space" }}
            >
              <Box
                sx={{ marginTop: "10px", alignItems: "center" }}
                className="d-flex h3-title xs-d-none"
              >
                <Box className="h3-custom-title">
                  {t("YOU_ARE_VIEWING_CONTENTS_FOR")}
                </Box>
                <Box className="remove-box">
                  <Box
                    sx={{ fontWeight: "600", paddingLeft: "5px" }}
                    className="text-blueShade2 h4-custom"
                  >
                    {domainName ? domainName : preselectedDomain}
                  </Box>
                  <Box
                    sx={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#0e7a9c",
                      paddingLeft: "10px",
                      cursor: "pointer",
                    }}
                    onClick={clearDomain}
                  >
                    &#x2716;
                  </Box>
                </Box>
                {/* <Box
                sx={{ fontSize: "16px", fontWeight: "600", paddingLeft: "5px" }}
                className="text-blueShade2 h4-custom"
              >
                {domainName ? domainName : preselectedDomain}
              </Box> */}
              </Box>
            </Box>
          )}
          {error && (
            <Alert className="my-4" severity="error">
              {error}
            </Alert>
          )}
          {category && (
            <Box
              className="d-flex mr-20 my-20 px-10"
              style={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <p className="h3-title">
                {category === "Course" ? "Courses" : category}
              </p>
              <Link onClick={handleGoBack} className="custom-btn-primary mr-17">
                {t("BACK")}
              </Link>
            </Box>
          )}
          {isLoading ? (
            <Loading message={t("LOADING")} />
          ) : (
            <>
              {data && data.length === 0 && !error && <NoResult />}
              <Box textAlign="center">
                <Box className="custom-card xs-pb-20">
                  {data &&
                    data.map((item) => (
                      <Box
                        className="custom-card-box"
                        key={item.id}
                        style={{ marginBottom: "10px" }}
                      >
                        <BoxCard
                          items={item}
                          index={item.count}
                          onClick={() =>
                            handleCardClick(item.identifier, item.contentType)
                          }
                        />
                      </Box>
                    ))}
                  <div className="blankCard"></div>
                </Box>
                {totalPages > 1 && (
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                  />
                )}
              </Box>
            </>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default CategoryPage;
