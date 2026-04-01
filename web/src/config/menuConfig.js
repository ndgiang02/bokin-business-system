export const menus = {
  ADMIN: [
    { label: "Dashboard", path: "/" },
    { label: "Users", path: "/users" },
    { label: "Departments", path: "/departments" },
    { label: "Requests", path: "/requests" },
    { label: "Tasks", path: "/tasks" },
    { label: "Reports", path: "/reports" }
  ],

  SALES_MANAGER: [
    { label: "Dashboard", path: "/" },
    { label: "Requests", path: "/requests" },
    { label: "Approve Requests", path: "/approve" },
    { label: "Team", path: "/team" }
  ],

  SALES_STAFF: [
    { label: "Dashboard", path: "/" },
    { label: "Create Request", path: "/create-request" },
    { label: "My Requests", path: "/my-requests" }
  ],

  PRODUCTION_MANAGER: [
    { label: "Dashboard", path: "/" },
    { label: "Incoming Requests", path: "/incoming" },
    { label: "Assign Tasks", path: "/assign" },
    { label: "Production Board", path: "/board" }
  ],

  PRODUCTION_STAFF: [
    { label: "Dashboard", path: "/" },
    { label: "My Tasks", path: "/my-tasks" },
    { label: "Task History", path: "/history" }
  ]
};