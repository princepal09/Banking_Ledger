const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const { dbConnect } = require("./config/database");
const authRoutes = require("./routes/auth.routes")
const cookieParser = require("cookie-parser")
const accountRoutes = require("./routes/account.routes")
const transactionRoutes = require("./routes/transaction.routes")

// Middleware  
app.use(express.json());
app.use(cookieParser())

//Routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/account", accountRoutes)
app.use("/api/v1/transaction", transactionRoutes)

// Db Connection + Server Start 
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

  