const Expense = require('../models/expense');
const User = require('../models/user')
const AWS = require('aws-sdk');
const UserServices = require('../services/userservices');
const S3Services = require('../services/S3services')

exports.postExpense  =  async (req,res,next)=>{
    const {amount, description, category} = req.body ;
    try {
        if(!amount || !description || !category){
            return res.status(400).json({message:'add all fields'})
        }
        const data = await req.user.createExpense({amount, description, category})
        res.status(201).json({data ,  message:'sucessfully added expense'})
    } catch (error) {
        res.status(500).json({message:'unable to add expwnse'})
    }
}

// let limit_items  ;

exports.getExpenses = async(req,res,next)=>{

    let page = req.params.pageno || 1
    
    let limit_items = +(req.body.itemsPerPage) || 5 ;

    console.log(+(req.body.itemsPerPage))

    let totalItems 

    try {

        let count = await Expense.count({where:{userId:req.user.id}})
        totalItems = count ; 

        let data = await req.user.getExpenses({offset:(page-1)*limit_items , limit:limit_items})
        res.status(200).json({data ,
            info: {
              currentPage: page,
              hasNextPage: totalItems > page * limit_items,
              hasPreviousPage: page > 1,
              nextPage: +page + 1,
              previousPage: +page - 1,
              lastPage: Math.ceil(totalItems / limit_items),
            }})
    } catch (error) {
        res.status(500).json({message:'unable to get expwnse'})
    }
    
}

exports.deleteExpense = async(req,res,next)=>{
    try {
        const expenseId = req.params.expenseid ;
        await req.user.getExpenses({where:{id:expenseId}})
        .then(expense=>{
            let foundExpense = expense[0] ;
            foundExpense.destroy();
            res.status(200).json({message:'deleted sucessfully'})
        })
        
    } catch (error) {
        res.status(500).json({message:'unable to delete expwnse'})
    }
}

exports.getAllUserExpenses = async(req,res,next)=>{
    try {

        if(req.user.ispremiumuser){
            let leaderboard = [];
            let users = await User.findAll({attributes: ['id', 'name', 'email']})
    
            for(let i = 0 ;i<users.length ; i++){
                let expenses = await  users[i].getExpenses() ;
                let totalExpense = 0;
                for(let j = 0 ;j<expenses.length ; j++){
                    totalExpense += expenses[j].amount
                }
                let userObj = {
                    user:users[i],
                    expenses,
                    totalExpense
                }
                leaderboard.push(userObj);
            }
           return res.status(200).json({success : true, data : leaderboard});
        }

        return res.status(400).json({message : 'user is not premium user' });

    } catch (error) {
        res.status(500).json({success : false, data : error});
    }
}

exports.getLeaderboardUserExpense = async(req,res,next)=>{
    try {
        if(req.user.ispremiumuser){
            let userId = req.params.loadUserId;
            console.log(userId)
            console.log('##############################S')
            let user = await User.findOne({where:{id:userId}})
            const expenses = await user.getExpenses();
            
           return res.status(200).json({success:true , data: expenses })
        }
        return res.status(400).json({message : 'user is not premium user' });
    } catch (error) {
        res.status(500).json({success : false, data : error});
    }
}

exports.downloadExpense = async(req,res,next)=>{
    try {
        const userId = req.user.id ;

        const expenses = await UserServices.getExpenses(req)
        // const expenses = await req.user.getExpenses();
        
        //expenses is an array we cannot write array to file, so we convert to string.
        const stringifyExpense = JSON.stringify(expenses);
        const fileName = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await S3Services.uploadToS3( stringifyExpense , fileName) ;

        const downloadUrlData = await req.user.createDownloadurl({
            fileUrl:fileURL,
            fileName
        })

        res.status(200).json({ fileURL, downloadUrlData , success: true });

    } catch (err) {
        res.status(500).json({fileURL: "", success: false, err: err});
    }
}

exports.downloadAllUrl = async(req,res,next) => {
    try {
        let urls = await req.user.getDownloadurls() ;
        if(!urls){
            res.status(404).json({ message:'no urls found with this user' , success: false});
        }
        res.status(200).json({ urls , success: true })
    } catch (error) {
        res.status(500).json({ err})
    }
}


//moved to services folder

// function uploadToS3( data , filename){
//     const  BUCKET_NAME = process.env.BUCKET_NAME
//     const IAM_USER_KEY = process.env.IAM_ACCESS_KEY 
//     const IAM_SECRET_KEY  = process.env.IAM_SECRET


//     // make new instance with keys to access
//     let s3Bucket = new AWS.S3({
//         accessKeyId: IAM_USER_KEY,
//         secretAccessKey: IAM_SECRET_KEY
//     })

//     //create bucket with parameter to upload
//     //our bucket is already created in S3, so no need to create again

//     var params = {
//         Bucket: BUCKET_NAME,
//         Key: filename,
//         Body: data,
//         ACL: 'public-read' // to give public access to file
//     }

//     return new Promise((resolve, reject) => {
//         s3Bucket.upload(params, (err ,s3response)=>{
//             if(err){
//                 console.log('something went wrong')
//             }else{
//                 console.log(s3response)
//                 resolve(s3response.Location)  
//             }
//         })
//     })

// }