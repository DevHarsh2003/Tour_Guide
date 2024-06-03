const Express = require('express');
const app= Express();
const mysql=require("mysql")
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer=require('multer');

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use('/images', Express.static(__dirname + '/path/to/your/images/directory'));
app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true
}));
app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Express.static(path.join(__dirname, 'public')));
const formatPlaceName = (place) => {
  return place.replace('/ /g', '_');
};
const storage = multer.diskStorage({
  destination: 'public/images', // Set the destination folder
  filename: function (req, file, cb) {
    const { fplace } = req.body;
    const formattedPlaceName = formatPlaceName(fplace);
    cb(null, `${formattedPlaceName}.jpg`);
  }
});

const upload = multer({storage:storage});

const con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"tour"
    
  });
  con.connect(()=>{
    console.log("Connected")
  });

app.get('/', (req,res)=>{
    res.send("Hi");
});

app.get('/signup',function(req,res){
  app.set('views', __dirname + '/views');
  res.setHeader('Content-Type', 'text/html');
  res.render('Signup.ejs');
});

// Posting SignUp Form Data
app.post('/signup',(req,res)=>{
  const {name,email,password}=req.body;
  app.set('views', __dirname + '/views');
  res.setHeader('Content-Type', 'text/html');
  const sql = `INSERT INTO users(name, email, password) VALUES (?,?,?)`;
  const values=[name,email,password];
  con.query(sql,values,(err)=>{
    if(err){
      console.log(err);
      return;
    }
    res.send("<script>alert('SignUp Successful');window.location='/login';</script>");
  })
});

// get Login page
app.get('/login',function(req,res){
    app.set('views',__dirname+'/views');
    res.setHeader('Content-Type','text/html');
    res.render('Login.ejs');
  });

// post login page
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = '${email}' LIMIT 1`;
    con.query(sql, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
       
    if(data.length == 0) {
      res.send("<script>alert('User Not found');window.location='/signup';</script>");
    }
  
     else {
        const user = data[0];
        
        if (user.password === password) {
          req.session.user = user.email;
          console.log(req.session.user)
          res.redirect('/home');
        }
        else {
          res.send("<script>alert('Incorrect Password');window.location='/login';</script>");
        }
    }
    });
  });

  app.get('/adminlogin',function(req,res){
    app.set('views',__dirname + '/views');
    res.setHeader('Content-Type','text/html');
    res.render('Adminlogin.ejs');
  });

  app.post('/adminlogin',function(req,res){
    const { email, password } = req.body;
      const sql = `SELECT * FROM users WHERE email = '${email}' LIMIT 1`;
      con.query(sql, (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
       if(data.length > 0) {
          const user = data[0];
          
          if (user.password === password) {
            req.session.username=user.name;
            res.redirect('/admin');
          }
          else {
            res.send("<script>alert('Incorrect Password');window.location='/adminlogin';</script>");
          }
      }
      });
  });



app.get('/home', (req,res)=>{
    app.set('views',__dirname+'/views');
    res.setHeader('Content-Type','text/html');
    const userEmail = req.session.user;
    const sql= `SELECT * from users where email=?`;
    const values=[userEmail];
    con.query(sql,values,(err,data)=>{
      if(err){
        console.log(err);
        return;
      }
      res.render('Home',{data:data});
    })


})

app.post('/navigate', (req,res)=>{
  const {place}=req.body;
  req.session.place = place;
  console.log(req.session.place);
  app.set('views',__dirname+'/views');
  res.setHeader('Content-Type','text/html');
  const sql1=`SELECT work,date,var from todolist where email=? and city=?`;
  const values1=[req.session.user,req.session.place];

  const sql2=`SELECT places,addfp,pics from featuredplaces where city=?`;
  const values2=[req.session.place];
  
  const sql3=`SELECT city,rest,addrb from restobars where city=?`;
  const values3=[req.session.place];
  const name=req.query.Name;
  const email=req.query.Email;
  con.query(sql1,values1,(err,data1)=>{
    if(err){
      console.log(err);
      return;
    }
    con.query(sql2,values2,(err,data2)=>{
      if(err){
        console.log(err);
        return;
      }
      con.query(sql3,values3,(err,data3)=>{
        if(err){
          console.log(err);
          return;
        }
        res.render('Navigate.ejs',{data1:data1,data2:data2,data3:data3,name:name,email:email});
      })

    })

  })
})

app.get('/navigate', (req,res)=>{
  app.set('views',__dirname+'/views');
  res.setHeader('Content-Type','text/html');
  const sql1=`SELECT work,date,var from todolist where email=? and city=?`;
  const values1=[req.query.user,req.query.place];

  const sql2=`SELECT places,addfp,pics from featuredplaces where city=?`;
  const values2=[req.session.place];
  
  const sql3=`SELECT rest,addrb,city from restobars where city=?`;
  const values3=[req.session.place];

  const name=req.query.Name;
  const email=req.query.Email;
  con.query(sql1,values1,(err,data1)=>{
    if(err){
      console.log(err);
      return;
    }
    con.query(sql2,values2,(err,data2)=>{
      if(err){
        console.log(err);
        return;
      }
      con.query(sql3,values3,(err,data3)=>{
        if(err){
          console.log(err);
          return;
        }
        res.render('Navigate.ejs',{data1:data1,data2:data2,data3:data3,name:name,email:email});
      })

    })

  })
})

app.post('/add',(req,res)=>{
  app.set('views',__dirname+'/views');
  res.setHeader('Conetent-Type','text/html');
  const {task,location,date}=req.body;
  const sql=`INSERT into todolist(email,city,work,date,var) VALUES (?,?,?,?,?)`;
  const values=[req.session.user,location,task,date,'0'];
  con.query(sql,values,(err)=>{
    if(err){
      console.log(err);
      return;
    }
    res.send("<script>alert('Task Added Sucessfully');window.location='/home';</script>");
  })
})

app.post('/done',(req,res)=>{
  const {workvalue} =req.body;
  app.set('views',__dirname+'/views');
  res.setHeader('Content-Type','text/html');
    sql4= `UPDATE todolist set var=? where city=? and work=?`
    const values=['1',req.session.place,workvalue];
    con.query(sql4,values,(err,data)=>{
      if(err){
        console.log(err);
        return;
      }
      res.redirect('/navigate');
    });
})

app.post('/delete',(req,res)=>{
  const {workvalue} =req.body;
  app.set('views',__dirname+'/views');
  res.setHeader('Content-Type','text/html');
    sql4= `DELETE from todolist where city=? and work=?`
    const values=[req.session.place,workvalue];
    con.query(sql4,values,(err,data)=>{
      if(err){
        console.log(err);
        return;
      }
      res.redirect('/navigate');
    });
})

app.get('/admin',function(req,res){
  const username=req.session.username;
  res.render('Admin.ejs',{username: username});
});

app.post('/admin',function(req,res){
  const username=req.session.username;
  res.render('Admin.ejs',{username: username});
});

app.post('/addfeaturedplaces',upload.single('image'),(req,res)=>{
  app.set('views',__dirname+'/views');
  res.setHeader('Conetent-Type','text/html');
  const image=req.file.filename;
  const {city,fplace,faddr}=req.body;
  const sql=`INSERT into featuredplaces(city,places,addfp,pics) VALUES (?,?,?,?)`;
  const values=[city,fplace,faddr,image];
  con.query(sql,values,(err)=>{
    if(err){
      console.log(err);
      return;
    }
    res.send("<script>alert('Place Added Sucessfully');window.location='/admin';</script>");
  })
})

app.post('/addrestobar',(req,res)=>{
  app.set('views',__dirname+'/views');
  res.setHeader('Conetent-Type','text/html');
  const {city,restb,restbaddr}=req.body;
  const sql=`INSERT into restobars(city,rest,addrb) VALUES (?,?,?)`;
  const values=[city,restb,restbaddr];
  con.query(sql,values,(err)=>{
    if(err){
      console.log(err);
      return;
    }
    res.send("<script>alert('Restobar Added Sucessfully');window.location='/admin';</script>");
  })
});

app.post('/display',(req,res)=>{
  app.set('views',__dirname+'/views');
  res.setHeader('Conetent-Type','text/html');
  sql1=`SELECt * from featuredplaces order by city`;
  sql2=`SELECT * from restobars order by city`;
  con.query(sql1,(err,data)=>{
    if(err){
      console.log(err);
      return;
    }
    con.query(sql2,(err,data2)=>{
      if(err){
        console.log(err);
        return;
      }
      res.render('Display.ejs',{data:data,data2:data2});
    })
  })
})

app.get('/RateIt',(req,res)=>{
  res.setHeader('Content-Type','text/html');
  app.set('views',__dirname+'/views');
  const rest=req.query.Place;
  const city=req.query.City;
  const place=req.query.Place;
  const name=req.query.Name;
  const email=req.query.Email;
  res.render('RateIt',{rest:rest,name:name,email:email,city:city,place:place});
})

app.post('/RateIt',(req,res)=>{
  const rate_value=req.body.rating;
  const name=req.body.name;
  const email= req.body.email;
  const city= req.body.city;
  const place= req.body.place;
  const sql=`INSERT into ratings (name,email,city,restobar,rate_val) VALUES (?,?,?,?,?)`;
  const values=[name,email,city,place,rate_value];
  con.query(sql,values,(err)=>{
    if(err){
      console.error(err);
      return;
    }
    res.send(`<script>alert('Thanks For Your Time');window.location='/navigate?Name=${name}&Email=${email}';</script>`);
  })
})

app.get('/UserRatings',(req,res)=>{
  res.setHeader('Content-Type','text/html');
  app.set('views',__dirname+'/views');
  const rest=req.query.Place;
  const city=req.query.City;
  const place=req.query.Place;
  const name=req.query.Name;
  const email=req.query.Email;
  const sql=`SELECT name,rate_val,city,restobar from ratings where email=? and restobar=? and city=?`;
  const values=[email,place,city];
  con.query(sql,values,(err,data)=>{
    if(err){
      console.error(err);
      return;
    }
    console.log(data);
    res.render('UserRatings',{rest:rest,name:name,email:email,data:data,city:city});
  })
})

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect('/login');
    }
  });
});



  app.listen(5000, ()=>{
    console.log("server running")
});