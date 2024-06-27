import React, { useEffect } from "react";
import createValidationSchema from "../../utils/formValidation"; // Adjust the path as needed
import SignupPage from "../../pages/SignupPage";
import axios from "axios";
import userRoles from "../../utils/userRoles";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams

const SignupPrep = () => {
  const { type } = useParams(); // Retrieve the 'type' parameter from the route
  const { role } = useParams(); // Retrieve the 'role' parameter from the route
  const navigate = useNavigate();
  let fields = [];
  let validation = {};
  let onSubmit = (values) => {
    throw new Error("Function not implemented.");
  };

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
      fields = ["Email", "Username", "Password", "Confirm Password", "Fields that I can help with"];
      break;
    case userRoles.REGULAR:
      fields = ["Email", "Username", "Password", "Fields that I need help with"];
      break;
    default:
      console.log("Not matching");
      break;
  }

  const platform = "Builder";

  onSubmit = async (values) => {
    const myObj = {}; // Defining the type of the object

    for (const value in values) {
      if (value.toLowerCase().includes("password")) {
        continue; // The backend API needs the password within userDetails property
      }
      myObj[value.toLowerCase()] = values[value];
    }

    // Additional properties based on the selected role
    myObj["role"] = role;
    myObj["platform"] = platform;
    myObj["userDetails"] = { password: values.Password };

    try {
      const savedUserResponse = await axios.post(
        `${backendUrl}/entry/register`,
        myObj
      );

      const savedUser = await savedUserResponse.data;

      if (savedUser) {
        console.log(
          `The user ${savedUser.email} has been registered successfully!`
        );
      }
      navigate(`/login/${role}`);
    } catch (error) {
      console.error(`Encountered error for Registering ${type}:`, error);
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
