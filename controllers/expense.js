const { z } = require("zod");
const User = require("../models/user");
const { userIdValidation } = require("../lib/validation/user");
const { expenseSchema, expenseIdValidation } = require("../lib/validation/expense");
const Expense = require("../models/expense");


const addExpense = async (req, res) => {
    try {
        const userId = userIdValidation.parse(req.params.userId);

        const { title, description, amount, tag, currency } = expenseSchema.parse(req.body);


        const userExists = await User.findById(userId); //all
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }   

        const expense = new Expense({
            title,
            description,
            amount,
            tag,
            currency,
        }); 

        await expense.save();

        userExists.expenses.push(expense);
        await userExists.save();    

        return res.status(200).json({ message: "Expense added successfully" });
    } catch (error) {
        console.log(error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors[0].message });
        }
        return res.status(500).json({ message: "Internal server error" }); 
    }
}   

const getExpenses = async (req, res) => {
    try {
        const userId = userIdValidation.parse(req.params.userId);

        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }   

        const expenses = await Expense.find({_id: {$in: userExists.expenses}});

        return res.status(200).json(expenses);
    } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors[0].message });
        }
        return res.status(500).json({ message: "Internal server error" }); 
    }
}   
const updateExpense = async (req, res) => {
    try {
        const userId = userIdValidation.parse(req.params.userId);
        const expenseId = expenseIdValidation.parse(req.params.expenseId);
        const { title, description, amount, tag, currency } = expenseSchema.parse(req.body);

        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        if(!userExists.expenses.includes(expenseId)) {
            return res.status(404).json({ message: "Expense not found" });
        }   

        const updatedExpense = await Expense.findByIdAndUpdate(expenseId, {
            title,
            description,
            amount,
            tag,
            currency,
        });

        if(!updatedExpense) {
            return res.status(404).json({ message: "Expense not updated" });
        }

        await updatedExpense.save();

        return res.status(200).json({ message: "Expense updated successfully" });
    } catch (error) {
        console.log(error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors[0].message });
        }
        return res.status(500).json({ message: "Internal server error" }); 
    }
}

const deleteExpense = async (req, res) => {
    try {
        const userId = userIdValidation.parse(req.params.userId);
        const expenseId = expenseIdValidation.parse(req.params.expenseId);  

        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        if(!userExists.expenses.includes(expenseId)) {
            return res.status(404).json({ message: "Expense not found" });
        }
        const deletedExpense = await Expense.findByIdAndDelete(expenseId);

        if(!deletedExpense) {
            return res.status(404).json({ message: "Expense not deleted" });
        }
        
        userExists.expenses = userExists.expenses.filter(expense => expense.toString() !== expenseId);
        await userExists.save();

       

        return res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        console.log(error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors[0].message });
        }
        return res.status(500).json({ message: "Internal server error" }); 
    }
}   

module.exports = { 
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
 };
