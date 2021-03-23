require('dotenv').config();
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.details = async (req,res) => {
    try {
        let fname = req.body.firstname;
        let lname = req.body.lastname;
        let name = fname + lname;
        let username = req.body.username;
        if(username === ''){
            return res.render("donorfillup",{
                message : 'Username is needed'
            });
        }
        else{
            db.query('SELECT * FROM donor WHERE Username = ?',[username], async (err,results)=>{
                if(err){
                    console.log(err);
                }else if(results.length > 0){
                    return res.render("donorfillup",{
                        message : 'Username already exist'
                    });
                }else{
                    username = 'DN' + username;
                    console.log(req.user.user.Email);
                    db.query('UPDATE donor SET ? WHERE Email = ?', [{
                        Name : name, Hospital : req.body.hospital, Username : username,
                        Personal_Doctor : req.body.doctor, Gender : req.body.gender,
                        Address : req.body.address, State : req.body.state, City : req.body.city,
                        Contact : req.body.contact, DOB : req.body.dob, Ailments : req.body.disease
                    }, req.user.user.Email], async (err,result) => {
                        if(err){
                            console.log(err);
                        }else{
                            console.log(result);
                            console.log('Successfully updated');
                        }
                    });

                }
            });
        } 
        
    } catch (error) {
        console.log(error);        
    }   
};

exports.register = async (req,res) => {
    const { email, password, confirmpassword} = req.body;

    db.query('SELECT * FROM donor where email=?', [email], async (err,results) => {
        if(err){
            console.log(err);
        }
        if(results.length > 0){
            return res.render('register',{
                message : 'Email already in use!!'
            });
        } else if(password !== confirmpassword){
            return res.render('register',{
                message : 'Passwords do not match!'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO donor SET ?', {Email : email, Password : hashedPassword}, (err, results) => {
            if(err){
                console.log(err);
            } else {
                const accessToken = jwt.sign({user:user}, process.env.ACCESS_TOKEN);
                res.cookie("jwt", accessToken, {secure: true, httpOnly: true})
                console.log('Passwords Match');  
                res.redirect("/donorfillup"); 
            }
        });

    });
};

exports.loginad = async (req,res) => {
    try {
        const { username, password } = req.body;
        
        db.query('SELECT * FROM admin where AdminID=?', [username], async (err,results)=>{
            if(err){
                console.log(err);
            }
            else{
                if(results.length === 0){
                    res.status(401).render("logina",{
                        message : 'Invalid ID' 
                    });
                }
                else{
                
                    console.log(await bcrypt.compare(password, results[0].Password));
                    if(await bcrypt.compare(password, results[0].Password)){ 
                        const user = results[0];
                        console.log(user);
                        const accessToken = jwt.sign({user:user}, process.env.ACCESS_TOKEN);
                        res.cookie("jwt", accessToken, {secure: true, httpOnly: true})
                        res.redirect("/admin");

                    }
                    else {
                        res.status(401).render("logina",{
                            message : 'Incorrect password' 
                        }); 
                    }
                }
            }
        });
        
    } catch (error) {
        console.log(error);        
    }
};


exports.logind = async (req,res) => {
    try {
        const { email, password } = req.body;
        
        db.query('SELECT * FROM donor where email=?', [email], async (err,results)=>{
            if(err){
                console.log(err);
            }
            else{
                if(results.length === 0){
                    res.status(401).render("logind",{
                        message : 'Invalid email' 
                    });
                }
                else{                
                    if(await bcrypt.compare(password, results[0].Password)){
                        const user = results[0];
                        const accessToken = jwt.sign({user:user}, process.env.ACCESS_TOKEN);
                        res.cookie("jwt", accessToken, {secure: true, httpOnly: true})
                        console.log('Passwords Match');  
                        res.redirect("/donorfillup");              
                    }
                    else {
                        res.status(401).render("logind",{
                            message : 'Incorrect password' 
                        }); 
                    }
                }
            }
        });
        
    } catch (error) {
        console.log(error);        
    }
};

exports.update = async (req,res) => {
    try {
        console.log(req.body);  
        const username = req.body.donor_up;
        const field = req.body.field;
        const newVal = req.body.newvalue;      
        let sql = "UPDATE donor SET " + field + " = " + newVal + " WHERE Username = ?" ;
        db.query(sql, [username], async (err,result)=>{
            if(err){
                console.log(err);
            }else{
                console.log(result);
                res.render("admin", {mu : 'Updated Succesfully', md : '', mo : ''});
            }
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(404);        
    }
};

exports.delete = async (req,res) => {
    try {
        const username = req.body.donor_del;     
        db.query('SELECT * from donor WHERE Username = ?',[username], async(err,results)=>{
            if(err){
                res.sendStatus(400);
                console.log(err);
            }else{
                if(results.length > 0){
                    db.query('DELETE FROM donor WHERE Username = ?', [username], async (err,result)=>{
                        if(err){
                            console.log(err);
                        }else{
                            console.log(result);
                            return res.render("admin", {mu : '', md : 'Deleted Successfully', mo : ''});
                        }
                    });                    
                }else {
                    res.render("admin",{mu : '', md : 'No such username exists', mo : ''});
                }
            }
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(404);        
    }
};

exports.dupdate = async (req,res) => {
    try {
        let username = req.body.donorid;
        let field = req.body.field;
        let newVal = req.body.newvalue;
        if(field === 'Contact' || field === 'Ailments' || field === 'Password'){
            if(field === 'Password'){
                newVal = await bcrypt.hash(newVal, 8);
                console.log(newVal); 
            }
            let sql = "UPDATE donor SET " + field + " = " + newVal + " WHERE Username = ?" ;     
            db.query(sql, [username], async (err,result)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log(result);
                    res.render("donor", {md : 'Updated Succesfully', mw : '', user : req.user.user.Username });
                }
            });       
        }
               
    } catch (error) {
        console.log(error);
        res.sendStatus(404);        
    }
};

exports.withdraw = async (req,res) => {
    try {
        let username = req.body.donorid;
        let reason = req.body.reason;    
        db.query('INSERT INTO deletereason SET ?',{Username : username, Reason : reason}, (err,result) =>{
            if(err){
                console.log(error);
                res.sendStatus(404);
            }else{
                console.log(result);
                res.render("donor", {md : '', mw : 'Withdraw request Sent', user : req.user.user.Username });
            }
        }) ;            
    } catch (error) {
        console.log(error);    
        res.sendStatus(404);     
    }
};