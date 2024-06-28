import React, { useEffect } from "react";
import createValidationSchema from "../../utils/formValidation"; // Adjust the path as needed
import SignupPage from "../../pages/SignupPage";
import axios from "axios";
import userRoles from "../../utils/userRoles";
import { useNavigate, useParams } from "react-router-dom";
import {useDispatch} from "react-redux";

const SignupPrep = () => {
  const { type } = useParams(); // Retrieve the 'type' parameter from the route
  const { role } = useParams(); // Retrieve the 'role' parameter from the route
  const navigate = useNavigate();
  let fields = [];
  let validation = {};
  let onSubmit;

  const backendUrl = process.env.REACT_APP_BACKEND_DEV_URL;

  useEffect(() => {
    // This useEffect will navigate to a default route if 'type' doesn't match any case
    if (
      ![userRoles.GRAD_STUDENTS, userRoles.OVER_EIGHTY, userRoles.EXTERNAL, userRoles.SMARTUP_STUDENT, userRoles.REGULAR].includes(type)
    ) {
      navigate("/"); // Navigate to a default route when 'type' doesn't match
    }
  }, [type, navigate]);

  // Determine fields and role based on the 'type' parameter
  switch (type) {
    case userRoles.GRAD_STUDENTS:
    case userRoles.OVER_EIGHTY:
    case userRoles.EXTERNAL:
    case userRoles.SMARTUP_STUDENT:
      fields = ["Email", "Username", "Password", "Confirm Password", "Subjects"];
      break;
    case userRoles.REGULAR:
      fields = ["Email", "Username", "Password", "Subjects"];
      break;
    default:
      console.log("Not matching");
      break;
  }

  const platform = "Builder";

  onSubmit = async (values) => {
    const userDetails = {"password": values.password, "subjects": [values.Subjects]}; // Defining the type of the object
    console.log({platform: "Afektive",username: values.Username, email: values.Email, role, userDetails})
    const res = await axios.post(backendUrl + "/entry/register", {platform: "Afektive",username: values.Username, email: values.Email, role, userDetails})

    if (res.status === 201) {
      navigate(`/profile/${values.Email}`);
    }
  };

  // Defining a validation schema based on the list of fields
  validation = createValidationSchema(fields);

  return (
    <>
      {/* This module will be responsible for redirecting each user to its specific tailored login page that will be reused as well */}
      <SignupPage
        fields={fields}
        validation={validation}
        onSubmit={onSubmit}
        role={role} // Pass the 'role' as role
        typeOfUser={type} // Pass the 'type' as typeOfUser
      />
    </>
  );
};

export default SignupPrep;
