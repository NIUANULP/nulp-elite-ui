import React from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Divider } from "native-base";


export default function BoxCard({ items }) {
  console.log(items)
  
  return (
    <Card sx={{ maxWidth: 345, position:'relative' }}>
      <CardMedia
        sx={{ margin:'8px 3px 0 9px',height: 140,borderTopLeftRadius:'10px',borderTopRightRadius:'10px',position: 'relative',background: 'linear-gradient(45deg, RGBA(28, 25, 25, 0.46) 7%, RGBA(20, 18, 18, 0.57) 45%)' }}
        image={require("../assets/card-bg.png")}
        title="green iguana"
      />
      <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right:'15px',
    width: '95%',
    height: '47%',
    background: 'linear-gradient(45deg, RGBA(28, 25, 25, 0.46) 7%, RGBA(20, 18, 18, 0.57) 45%)',
    zIndex: 1,
    margin: '8px 10px 0 10px',
    borderTopLeftRadius: '5px',
    borderTopRightRadius:'20px'
  }}></div>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div" style={{zIndex:'9999',position:'absolute',color:'#fff',fontWeight:'500',fontSize:'16px', top:'76px'}}>
           {items.name}
        </Typography>
        <Typography gutterBottom variant="h7" component="div" style={{zIndex:'9999',position:'absolute',top:'30px',right:'7px',color:'#fff',width:'50%',textAlign:'center'}}>
        <Box style={{background:'#FFE459', borderRadius:'24px 0px 0px 24px',color:'#484848',border:'solid 1px #fff',paddingRight:'10px', fontSize:'13px'}}> {items.primaryCategory}</Box>
        </Typography>
        <Box style={{background:'#fff',padding:'10px',borderRadius:'150px',height:'50px',width:'50px',border:'solid 1px #E1E1E1',position:'absolute',top:'115px',right:'30px',textAlign:'center',zIndex:'99'}}><img src={require("../assets/swm.png")} style={{width:'100%'}} /></Box>

        <Typography variant="body2" color="#5B5B5B" style={{fontSize:'11px',padding:'20px 0',textAlign:'left'}}>
        Engineering Staff College India
        </Typography>
        <Divider></Divider>
      </CardContent>
      <CardActions style={{paddingBottom:'20px'}}>
        <Button size="small" style={{background: '#F4D46261',color:'#484848',fontSize:'10px'}}> {items.board}</Button>
        <Button size="small" style={{background: '#F4D46261',color:'#484848',fontSize:'10px'}}> {items.gradeLevel}</Button>
      </CardActions>
    </Card>
  );
}
