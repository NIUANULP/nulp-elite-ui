import React, { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import domainWithImage from "../assets/domainImgForm.json";
import { Tooltip } from "@mui/material";
import { MarginOutlined } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 8,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 4,
  },
};

export default function DomainCarousel({
  domains,
  onSelectDomain,
  selectedDomainCode,
}) {
  const dotsToShow = 4; // Number of dots to display
  const [isActive, setIsActive] = useState(false);
  const [itemsArray, setItemsArray] = useState([]);
  const [data, setData] = React.useState();
  const [activeStates, setActiveStates] = useState(null);
  // (
  //   () => domains?.map(() => false) // Initialize all items as inactive
  // );
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [activeDomain, setActiveDomain] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  // const navigate = useNavigate();

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 767);
  };
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    domains?.map((term) => {
      if (domainWithImage) {
        domainWithImage?.result?.form?.data?.fields?.map((imgItem) => {
          if ((term && term.code) === (imgItem && imgItem.code)) {
            term["image"] = imgItem.image ? imgItem.image : "";
            pushData(term);
            itemsArray?.push(term);
          }
        });
      }
    });
    const croppedArray = itemsArray?.slice(0, 10);
    setData(croppedArray);
  }, []);

  useEffect(() => {
    if (selectedDomainCode) {
      domains?.map((domain, index) => {
        if (domain.code === selectedDomainCode) {
          setActiveStates(index);
        }
      });
    }
  }, [selectedDomainCode]);

  useEffect(() => {
    console.log("activeStates", activeStates);
  }, [activeStates]);

  // Function to push data to the array
  const pushData = (term) => {
    setItemsArray((prevData) => [...prevData, term]);
  };
  const handleDomainClick = (query, index, name) => {
    setActiveStates(index === activeStates ? null : index);
    if (index === activeStates) {
      onSelectDomain(null, null);
      // navigate(-2);
    } else {
      onSelectDomain(query, name);
    }
  };

  const handleMouseEnter = (index) => {
    setActiveDomain(index);
  };

  const handleMouseLeave = () => {
    setActiveDomain(null);
  };

  return (
    <Box style={{ position: "relative" }} className="bg-darkblue">
      {isMobile ? (
        <>
          <Carousel
            swipeable={true}
            draggable={true}
            showDots={["mobile"]} // Show dots only if there are more than 4 items
            responsive={responsive}
            ssr={true} // means to render carousel on server-side.
            infinite={true}
            autoPlaySpeed={1000}
            keyBoardControl={true}
            customTransition="all .5"
            transitionDuration={500}
            containerClass="carousel-container carousel-bx"
            dotListClass="custom-dot-list-style-none"
            itemClass="carousel-item-padding-40-px"
          >
            {itemsArray &&
              itemsArray?.slice(0, 10).map((domain, index) => (
                <Box
                  className={`my-class ${
                    activeStates === index ? "carousel-active-ui" : ""
                  }`}
                  onClick={(e) =>
                    handleDomainClick(domain.code, index, domain.name)
                  }
                  key={index}
                  orientation="horizontal"
                  size="sm"
                  variant="outlined"
                >
                  <Box
                    // className="imgBorder cursor-pointer"
                    className="cursor-pointer"
                    // style={{
                    //   background: "#fff",
                    //   padding: "4px",
                    //   borderRadius: "10px",
                    //   height: "48px",
                    //   width: "48px",
                    // }}
                  >
                    {/* {(domain.image != undefined) && <img src={require(baseImgUrl+domain.image)}  style={{width:'40px',objectFit:'contain'}} alt={domain.name} />}
                {(domain.image == undefined)&& <img src={require("../assets/swm.png")}  style={{width:'40px',objectFit:'contain'}} alt={domain.name} />} */}
                    <img
                      src={require(`../assets/domainImgs${domain.image}`)}
                      alt={domain.name}
                      className="domainHover"

                      // style={{ transform: "translate(5px, 4px)" }}
                    />
                    {/* <img src={require("../assets/swm.png")}  style={{width:'40px',objectFit:'contain'}} alt={domain.name} /> */}
                  </Box>
                  <Box sx={{ alignSelf: "center" }} className="cursor-pointer">
                    <Typography
                      level="title-md"
                      style={{
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                      className="domainText"
                    >
                      {domain.name}
                    </Typography>
                  </Box>
                </Box>
              ))}
          </Carousel>
        </>
      ) : (
        <>

          <Box className={scrolled ? "carousel-bx scrolled" : "carousel-bx"}>
            <Box className="text-white h5-title pl-20 pb-10">
              Select your prefered domain :
            </Box>

            <Box sx={{ display: "flex" }}>
              {itemsArray &&
                itemsArray?.slice(0, 10).map((domain, index) => (
                  <Box
                    className={`my-class ${
                      activeStates === index ? "carousel-active-ui" : ""
                    }`}
                    onClick={(e) =>
                      handleDomainClick(domain.code, index, domain.name)
                    }
                    key={index}
                    orientation="horizontal"
                    size="sm"
                    variant="outlined"
                    style={{ display: "flex", margin: "0 4px" }}
                    onMouseEnter={(event) => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Box className=" cursor-pointer">
                      <Box className=" cursor-pointer">
                        {/* {(domain.image != undefined) && <img src={require(baseImgUrl+domain.image)}  style={{width:'40px',objectFit:'contain'}} alt={domain.name} />}
                {(domain.image == undefined)&& <img src={require("../assets/swm.png")}  style={{width:'40px',objectFit:'contain'}} alt={domain.name} />} */}
                        {/* <Tooltip title={domain.description}> */}
                        <img
                          className="domainHover"
                          src={require(`../assets/domainImgs${domain.image}`)}
                          alt={domain.name}
                        />

                        {/* </Tooltip> */}

                        {/* <img src={require("../assets/swm.png")}  style={{width:'40px',objectFit:'contain'}} alt={domain.name} /> */}
                      </Box>

                      {/* {(activeDomain === index || activeStates === index) && ( */}
                      <span className=" cursor-pointer domainText">
                        {domain.name}
                      </span>
                      {/* )} */}
                    </Box>
                  </Box>
                ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
