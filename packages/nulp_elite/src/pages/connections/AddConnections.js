
import React, { useState, useEffect } from "react";
import {
  Layout,
  IconByName,

} from "@shiksha/common-lib";
import {
  Box,
  VStack,
  HStack,
  
  Menu,
} from "native-base";
import Tab from '@mui/material/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Modal as BaseModal, makeStyles } from '@material-ui/core';
import { styled, css } from '@mui/system';
import PropTypes from 'prop-types';
import { Button } from '@mui/base/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

import Search from "components/search"; 
import Filter from "components/filter"; 


// Define modal styles
const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    width: '100%',
    maxWidth: 600, // Adjust as needed
    borderRadius: 10, // Add rounded corners
    borderTopLeftRadius: 0, // Ensure modal appears attached to the bottom
    borderTopRightRadius: 0,
  },
}));

const AddConnections = () => {
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [search, setSearch] = React.useState(true);
  const [searchState, setSearchState] = React.useState(false);

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [showChat, setShowChat] = useState(false);
  const [buttonText, setButtonText] = useState('Start Chat');

  const toggleChat = () => {
    setShowChat(!showChat);
    setButtonText(showChat ? 'Start Chat' : 'Send');
  };

  function handleClick(event) {
    event.preventDefault();
    console.info('You clicked a breadcrumb.');
  }
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
                  source={require("./assets/logo.png")}
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
      <Box textAlign="center" padding="10">
      <Box sx={{ width: '100%', typography: 'body1' }}>
      <div role="presentation" onClick={handleClick}>
      <Breadcrumbs aria-label="breadcrumb" style={{padding:'10px 10px 20px 0',fontSize:'16px',fontWeight:'600'}}>
        <Link underline="hover" color="#004367" href="/">
        Direct Connect
        </Link>
        <Link
          underline="hover"
          href=""
          aria-current="page"
          color="#484848"
        >
          My Connections
        </Link>
      </Breadcrumbs>
    </div>
      {/* <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
      <input type="text" placeholder="Search..." style={{ flex: 1, marginRight: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CACACA' }} />
      <button style={{ padding:'11px 16px 11px 16px', borderRadius: '4px', backgroundColor: '#004367', color: 'white', border: '1px', cursor: 'pointer' ,fontSize:'12px'}}>Search</button>
    </div> */}
    <Search/>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="My Connections" value="1" style={{fontSize:'12px',color:'#484848'}} />
            <Tab label="Add New" value="2" style={{fontSize:'12px',color:'#484848'}}  />
          </TabList>
        </Box>
        <TabPanel value="1" style={{padding:'0'}} >
        <List sx={{ }}>
          <ListItem >
            <ListItemText primary="KomalMane" secondary="Designation" />
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText primary="Manisha Kapadnis" secondary="Learner" />
          </ListItem>
          <Divider  />

          <ListItem>
            <ListItemText primary="Charvi Upadhyay" secondary="Commissioner" />
          </ListItem>
        </List>
        </TabPanel>
        <TabPanel value="2">
        <Filter></Filter>
        <List>
          <ListItem>
            <ListItemText primary="Snehal patl" secondary="Designation" />
          </ListItem>
          <Divider  />

          <ListItem>
            <ListItemText primary="Reshma M" secondary="Learner" />
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText primary="Mahesh M" secondary="Commissioner" />
          </ListItem>
          <TriggerButton type="button" onClick={handleOpen}>
        Open chat
      </TriggerButton>
        </List>
        <div>
        
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', pt: '10vh', p:'0' }}
      >
        <ModalContent sx={{ width: 400 }} style={{}}>
          <h2 id="unstyled-modal-title" className="modal-title" style={{ paddingTop:'10px',paddingRight:'10px', paddingLeft: '10px',paddingRight:'10px',backgroundColor: '#004367', color: 'white', borderRadius: 'md' }}>
           <div style={{fontSize:'14px',lineHeight:'1.6'}}>Manisha Kapdanis</div>
           <div style={{fontSize:'12px',paddingBottom:'10px'}}>Designation</div>
          </h2>
          { !showChat && (
          <p style={{fontSize:'12px', paddingLeft: '10px',paddingRight:'10px'}} id="unstyled-modal-description" className="modal-description" >
          <Box style={{fontSize:'12px', color:'#484848',paddingBottom:'15px'}}>Name Surname is a manager with the department of Revenue and taxes and has actively contributed to the growth and authenticity of the knowledge curated for the betterment of the department.</Box>
                <Box>Connect with them to get insights on what they do or simply answers to your question!</Box>
          </p>
          )}
           {showChat && (
        <div>
          {/* Your chat UI components go here */}
          <p style={{fontSize:'12px', paddingLeft: '10px',paddingRight:'10px',color:'#484848'}}>Hello Manisha K, I would like to connect with you regarding some queries i had in your course.</p>
        </div>
      )}
      <Box  style={{paddingBottom:'30px', display:'flex',justifyContent:'space-between', flexDirection:'row'}}>
        <Box style={{width:'50%'}}>
        <Button variant="outlined" style={{
  borderRadius:'10px',
  color: '#004367',
  padding: '10px 12px',
  margin:'0 10px',
  fontWeight:'500',
  fontSize:'12px',
  border:'solid 1px #004367'

 }}>Cancel</Button>
        </Box>
      <Box style={{width:'50%'}}><Button  onClick={toggleChat}
 style={{
  background:'#004367',
  borderRadius:'10px',
  color: '#fff',
  padding: '10px 12px',
  margin:'0 10px',
  fontWeight:'500',
  fontSize:'12px'

 }}
 
 >{buttonText}</Button></Box>
          </Box>
     
        </ModalContent>
      </Modal>
    </div>
        </TabPanel>
      </TabContext>
    </Box>
    </Box>
    </Layout>
  );
};

const Backdrop = React.forwardRef((props, ref) => {
  const { open, ...other } = props;
  return (
    <Fade in={open}>
      <div ref={ref} {...other} />
    </Fade>
  );
});

Backdrop.propTypes = {
  open: PropTypes.bool,
};

const blue = {
  200: '#99CCFF',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0066CC',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const Modal = styled(BaseModal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const style = {
 
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
};

const ModalContent = styled('div')(
  ({ theme }) => css`
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === 'dark' ? 'rgb(0 0 0 / 0.5)' : 'rgb(0 0 0 / 0.2)'};
    padding: 0px;
    color: ${theme.palette.mode === 'dark' ? grey[50] : grey[900]};

    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === 'dark' ? grey[400] : grey[800]};
      margin-bottom: 4px;
    }
  `,
);

const TriggerButton = styled(Button)(
  ({ theme }) => css`
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 150ms ease;
    cursor: pointer;
    
    }
  `,
);

export default AddConnections;
