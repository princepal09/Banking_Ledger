const Account = require("../models/account.model")

exports.createAccountController = async(req, res) =>{
    try{
        const user = req.user;

        const account = new Account({
            user : user._id,
        })

        await account.save();

        return res.status(201).json({
            success : true,
            message : "Account created successfully",
            account
        })

    }catch(err){
        console.error(err);
        return res.status(500).json({
            success : false,
            message : "Error creating account",
            error : err.message
        })
    }
}

exports.getUserAccountsController = async(req, res) =>{
    try{

        const user = req.user;
        const accounts = await Account.find({user : user._id})  
        if(!accounts || accounts.length === 0){
            return res.status(404).json({
                success : false,
                message : "No accounts found for the user"
            })
        }
        
        return res.status(200).json({
            success : true,
            message : "User accounts fetched successfully",
            accounts
        })


    }catch(err){
        console.error(err);
        return res.status(500).json({
            success : false,
            message : "Error fetching user accounts",
            error : err.message
        })
    }
}

exports.getAccountBalanceController = async(req, res) =>{
    try{
        const userID = req.user.id;
        const {accountId} = req.params;

        const account = await Account.findOne({_id : accountId, user : userID})
        if(!account){
            return res.status(404).json({
                success : false,
                message : "Account not found for the user"
            })
        }

        const balance = await account.getBalance();

        return res.status(200).json({
            success : true,
            message : "Account balance fetched successfully",
            accountId : account._id,
            balance
        })

    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success : false,
            message : "Error fetching account balance",
            error : err.message
        })
    }
}