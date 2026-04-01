import { getUser } from "../store/authStore";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";

export default function AppRoutes(){

  const user = getUser();

  if(!user){
    return <LoginPage/>
  }

  return <DashboardPage/>

}