// Profile.js

import React, { useState, useEffect } from "react";
// import { Box, Heading, Text, Button } from '@chakra-ui/react';
import {
  Layout,
  IconByName,
  SearchLayout,
} from "@shiksha/common-lib";
import {
  VStack,
  HStack,
  Button,
  Menu,
} from "native-base";
import BoxCard from "components/Card";
import Box from '@mui/material/Box';
import Search from "components/search";
import Filter from "components/filter"; 
import data from "../../assets/contentSerach.json"
import Grid from '@mui/material/Grid';


const ContentList = (props) => {
  const [search, setSearch] = React.useState(true);
  const [searchState, setSearchState] = React.useState(false);

  return (
    <Layout
      isDisabledAppBar={true}
      _header={{
        rightIcon: (
          <HStack paddingBottom={"25px"}>
            <IconByName name="CloseCircleFillIcon" />
          </HStack>
        ),
        customeComponent: (
          <Box flex={1} minH={"40px"}>
            <HStack>
              <VStack position={"relative"} padding="10px" top={"10px"}>
                <Menu
                  w="160"
                  trigger={(triggerProps) => {
                    return (
                      <Button
                        alignSelf="center"
                        variant="solid"
                        {...triggerProps}
                      >
                        <IconByName size="20px" name="MenuFillIcon" />
                      </Button>
                    );
                  }}
                >
                  <Menu.Item>Help</Menu.Item>
                  <Menu.Item>Logout</Menu.Item>
                </Menu>
              </VStack>

              <VStack>
                {/* <Image
                  source={require("../assets/nulp_logo.jpeg")}
                  alt=""
                  size="sm"
                /> */}
              </VStack>
            </HStack>

            {/* <Right> */}
            <Box position={"absolute"} right={"20px"} top={"10px"}>
              <Menu
                w="160"
                trigger={(triggerProps) => {
                  return (
                    <Button
                      alignSelf="center"
                      variant="solid"
                      {...triggerProps}
                    >
                      Language
                    </Button>
                  );
                  // }}>
                }}
              >
                <Menu.Item>English</Menu.Item>
                <Menu.Item> Hindi</Menu.Item>
              </Menu>
            </Box>
            {/* </Right> */}

            {/* <Avatar
           size="48px"
           borderRadius=""
              source={require("../assets/nulp_logo.jpeg")}
          /> */}

            {/* <VStack>
          <Avatar
            size="37px"
            borderRadius="md"
            source={{
              uri: "https://via.placeholder.com/50x50.png",
            }}
          />
          </VStack> */}
          </Box>
        ),
        // title: "User Name",
        // // isEnableSearchBtn: true,
        // subHeading: "Hello",
        // iconComponent: (

        // ),
      }}
      // subHeader={
      //   <Link
      //     to="/"
      //     style={{ color: "rgb(63, 63, 70)", textDecoration: "none" }}
      //   >
      //     <HStack space="4" justifyContent="space-between">
      //       <VStack>
      //         <SearchLayout
      //           {...{
      //             search,
      //             setSearch,
      //             // minStringLenght: 3,
      //             notFoundMessage: "TYPE_TO_START_SEARCHING_LEARNING",
      //             onCloseSearch: setSearchState,
      //           }}
      //         ></SearchLayout>
      //       </VStack>
      //     </HStack>
      //   </Link>
      // }
      _subHeader={{ bg: "rgb(248, 117, 88)" }}
      _footer={{
        menues: [
          {
            title: "Search",
            icon: "SearchLineIcon",
            route: "/contents",
          },
          {
            title: "Contents",
            icon: "BookOpenLineIcon",
            route: "/all",
          },
          {
            title: "Connections",
            icon: "TeamLineIcon",
            route: "/home",
          },
          {
            title: "Profie",
            icon: "AccountCircleLineIcon",
            route: "/profile",
          },
        ],
      }}
      
    >
      <Box sx={{background:'#2D2D2D',padding:'20px'}}>
          <p style={{fontSize:'20px',fontWeight:'700',color:'#fff',paddingBottom:'5px',margin:'0'}}>Explore content related to your domain. Learn from well curated courses and content.</p>
          <p style={{fontSize:'16px',fontWeight:'700',color:'#C1C1C1',margin:'0',paddingBottom:'30px'}}>Learn from well curated courses and content.</p>
          <Search></Search>

        </Box>
        <Box style={{margin:'20px 0'}}>
          <Filter></Filter>
        </Box>

     <Box textAlign="center" padding="10">
     <Box sx={{paddingTop:'30px'}}>
     <Grid container spacing={2} style={{margin:'20px 0'}}  style={{marginBottom:'10px'}}>

        {data.result.content.map((items) => (
                        // console.log(items),

                <Grid item xs={12} md={6} lg={3}  style={{marginBottom:'10px'}}>
                <BoxCard items ={items}></BoxCard>

                </Grid>
        ))}
                    </Grid>

        </Box>
  
      </Box>
    </Layout>
  );
};

export default ContentList;
