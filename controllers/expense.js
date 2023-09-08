const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize=require('../util/expense')
const AWS = require('aws-sdk');
const uuidv1 = require('uuid');



exports.postExpense=async (req, res) => {
  console.log("id fetch>>>>>>>>>>"+ req.user)
  const  t=await sequelize.transaction(); 
  
  try {      

      const name = req.body.name;
      const price = req.body.price;
      const date=  req.body.date;
      const category = req.body.category;
     
      
      const expense = await Expense.create({
        Itemname: name,
        price: price,
        date:date,
        category: category,
        userId:req.user.id       
      },{
        transaction:t
      }
      );   
      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new Error('User not found');
    }

      const totalExpense=user.totalExpense+Number(price)           
      console.log("totalExpense>>>",price)
    await  User.update({
        totalExpense:totalExpense
      },{where:{id:req.user.id},transaction:t})
     await t.commit()
      res.status(201).json({ Expense: totalExpense });
    } catch (err) { 

      console.log("error"+err) 
    await  t.rollback()     
    res.status(500).json({ error: err }); 
    }
  }
  // {where:{userId:req.user.id}}

  exports.getExpense = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; 

        const offset = (page - 1) * limit;
        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            limit,
            offset,
        });

        res.status(200).json({ allExpenses: expenses });
    } catch (err) {
        console.log('get user is failing', JSON.stringify(err));
        res.status(500).json({ error: err });
    }
};




exports.deleteExpense=async(req,res)=>{
    try{
      const uId=req.params.id
        if(uId=='undefined'|| uId.length === 0){
            console.log('ID is missing')
            return res.status(400).json({success: false, })
        }
    ;
   const noofrows= await Expense.destroy({where:{id:uId,userId:req.user.id}})
   console.log("noofrows",noofrows)
   if(noofrows === 0){     
    return res.status(404).json({success: false, message: 'Expense doenst belong to the user'})
}
return res.status(200).json({ success: true, message: "Deleted Successfuly"})     

    }
    catch(err){
      console.log(err);
        return res.status(500).json({ success: true, message: "Failed"})
    }
  }


  exports.downloadExpenses = async (req, res) => {
    try {
        if (!req.user.ispremiumuser) {
            return res.status(401).json({ success: false, message: 'User is not a premium User' });
        }

        
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });

        const s3 = new AWS.S3();

        const bucketName = 'subendhuexpensetracker'; 

        
        const objectKey = 'expenses' + uuidv1() + '.txt';

        
        const data = JSON.stringify(await req.user.getExpenses());

        const uploadParams = {
            Bucket: bucketName,
            Key: objectKey,
            Body: data
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        const fileUrl = uploadResult.Location;

        res.status(201).json({ fileUrl, success: true });
    } catch (err) {
        res.status(500).json({ error: err, success: false, message: 'Something went wrong' });
    }
};