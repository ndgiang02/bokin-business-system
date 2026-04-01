import { useState } from "react";
import { createUser } from "../../api/userApi";

export default function UserForm() {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [role,setRole] = useState("");
  const [department,setDepartment] = useState("");

  const handleSubmit = async (e)=>{

    e.preventDefault();

    try{

      await createUser({
        name,
        email,
        password,
        role_id: role,
        department_id: department
      });

      alert("User created");

    }catch(err){

      alert("Create failed");

    }

  };

  return(

    <div>

      <h2>Create Member</h2>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <select onChange={(e)=>setRole(e.target.value)}>

          <option value="">Role</option>
          <option value="1">Admin</option>
          <option value="2">Sales Manager</option>
          <option value="3">Sales Staff</option>
          <option value="4">Production Manager</option>
          <option value="5">Production Staff</option>

        </select>

        <select onChange={(e)=>setDepartment(e.target.value)}>

          <option value="">Department</option>
          <option value="1">Sales</option>
          <option value="2">Production</option>

        </select>

        <button type="submit">
          Create User
        </button>

      </form>

    </div>

  );

}