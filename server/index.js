const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const { dbConnect } = require("./config/database");
const authRoutes = require("./routes/auth.routes")
const cookieParser = require("cookie-parser")
const accountRoutes = require("./routes/account.routes")

// Middleware  
app.use(express.json());
app.use(cookieParser())

//Routes
app.use("/api/v1", authRoutes);
app.use("/api/v1", accountRoutes)


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

  