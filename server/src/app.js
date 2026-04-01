const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const requestRoutes = require("./routes/request.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");
const depRoutes = require("./routes/department.routes");
const roleRoutes = require("./routes/role.routes");
const dashRoutes = require("./routes/dashboard.routes");


const errorMiddleware = require("./middlewares/error.middleware");
const authMiddleware = require("./middlewares/auth.middleware");

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);

//app.use(authMiddleware);

app.use("/api/requests",requestRoutes);
app.use("/api/dashboards",dashRoutes);

app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/departments", depRoutes);

//app.use(errorMiddleware);


module.exports = app;