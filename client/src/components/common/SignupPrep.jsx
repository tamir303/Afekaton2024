import React, { useEffect } from "react";
import createValidationSchema from "../../utils/formValidation";
import SignupPage from "../../pages/SignupPage";
import axios from "axios";
import userRoles from "../../utils/userRoles";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams

const SignupPrep = () => {
  const { type } = useParams();
  const { role } = useParams();
  const navigate = useNavigate();
  let fields = [];
  let subTypes = [];
  let validation = {};
  let onSubmit;

  const backendUrl = process.env.REACT_APP_BACKEND_DEV_URL;

  useEffect(() => {
    if (
      ![
        userRoles.GRAD_STUDENTS,
        userRoles.OVER_EIGHTY,
        userRoles.EXTERNAL,
        userRoles.SMARTUP_STUDENT,
        userRoles.REGULAR,
      ].includes(type)
    ) {
      navigate("/");
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

  return (
    <SignupPage
      fields={fields}
      validation={validation}
      onSubmit={onSubmit}
      role={role}
      typeOfUser={type}
      subTypes={subTypes}
    />
  );
};

export default SignupPrep;
