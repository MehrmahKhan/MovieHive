const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/signup", (req,res)=>{
  const {username,email,password} = req.body;

  const query = "INSERT INTO users (username,email,password) VALUES (?,?,?)";

  db.query(query,[username,email,password], (err,result)=>{
    if(err){
      if(err.code==="ER_DUP_ENTRY"){ // duplicate email
        return res.json({success:false, message:"Email already exists"});
      }
      return res.json({success:false, message:"Signup failed"});
    }

    res.json({success:true, message:"Account created successfully"});
  });
});

module.exports = router;