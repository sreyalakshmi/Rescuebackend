const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const { loginModel } = require("./models/admin")
const { peopleModel } = require("./models/people")

const app=express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://sreya:sreya123@cluster0.rk6cqoj.mongodb.net/rescuedb?retryWrites=true&w=majority&appName=Cluster0")

app.post("/adminsignUp",(req,res)=>{
    let input=req.body
    let hashedpassword=bcrypt.hashSync(input.password,12)
    input.password=hashedpassword
    console.log(input)

    let result=new loginModel(input)
    result.save()
    res.json({"status":"success"})
})
app.post("/adminsignin",(req,res)=>{
    let input=req.body
    let result=loginModel.find({username:input.username}).then(
        (response)=>{
            if (response.length>0) {
                const validator=bcrypt.compareSync(input.password,response[0].password)
                if(validator)
                {
                    jwt.sign({email:input.username},"rescue-app",{expiresIn:"1d"},
                    (error,token)=>{
                        if (error) {
                            res.json({"status":"Token Creation Failed"})

                        } else {
                            res.json({"status":"success","token":token})

                        }
                    })
                }else
                {
                    res.json({"status":"Wrong Password"})
                }
            } else {
                res.json({"status":"Invalid Authentication"}) 
            }
        }
    ).catch()
})
app.post("/addPeople",(req,res)=>{
    let input =req.body
    let token=req.headers.token
    jwt.verify(token,"rescue-app",(error,decoded)=>{
        if(decoded && decoded.email)
        {
            let result=new peopleModel(input)
            result.save()
            res.json({"status":"success"})

        }else
        {
            res.json({"status":"Invalid Authentication"}) 
        }
    })
})
app.post("/viewall",(req,res)=>{
    let token = req.headers.token
    jwt.verify(token,"rescue-app",(error,decoded)=>{
        if (decoded && decoded.email) {
            peopleModel.find().then(
                (items)=>{
                    res.json(items)
                }
            ).catch(
                (error)=>{
                    res.json({"status":"error"})
                }
            )
            
        } else {
            res.json({"status":"Invalid Authentication"})
        }
    })
})

app.listen(8080,()=>{
    console.log("server started")
})