import React, { useEffect } from "react";
import createValidationSchema from "../../utils/formValidation";
import SignupPage from "../../pages/SignupPage";
import axios from "axios";
import userRoles from "../../utils/userRoles";
import { useNavigate, useParams } from "react-router-dom";

const SignupPrep = () => {
  const { type } = useParams();
  const { role } = useParams();
  const navigate = useNavigate();
  let fields = [];
  let subTypes = [];
  let validation = {};
  let onSubmit = (values) => {
    throw new Error("Function not implemented.");
  };

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

  if (role === "student") {
    fields = [
      "Email",
      "Password",
      "Confirm Password",
      "Type",
      "Subjects I Need Help With",
    ];
    validation = createValidationSchema([
      "Email",
      "Password",
      "Confirm Password",
      "Type",
    ]);
    subTypes = ["regular", "reserved", "special population", "disabilities"];
  } else if (role === "tutor") {
    fields = [
      "Email",
      "Password",
      "Confirm Password",
      "Type",
      "Subjects I Can Tutor",
    ];
    validation = createValidationSchema([
      "Email",
      "Password",
      "Confirm Password",
      "Type",
    ]);
    subTypes = [
      "external",
      "graduate student",
      "student over 80 GPA",
      "smartUp student",
    ];
  }

  const platform = "Builder";

  onSubmit = async (values) => {
    const myObj = {
      role,
      platform,
      userDetails: { password: values.Password },
      profilePicture: null,
    };

    if (role === "student") {
      myObj["subjectsNeedHelp"] = values["Subjects I Need Help With"];
    } else if (role === "tutor") {
      myObj["subjectsCanTutor"] = values["Subjects I Can Tutor"];
    }

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
