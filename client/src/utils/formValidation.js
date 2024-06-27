import * as yup from "yup";

const createValidationSchema = (fields) => {
  const validationSchema = {};

  fields.forEach((field) => {
    switch (field) {
      case "Email":
        validationSchema[field] = yup
          .string()
          .email("Invalid email format")
          .required("Email is required");
        break;
      case "Confirm Password":
        validationSchema[field] = yup
          .string()
          .oneOf([yup.ref("Password")], "Passwords must match")
          .required("Confirm Password is required");
        break;
      default:
        validationSchema[field] = yup.string().required(`rrequired`);
        break;
    }
  });

  return yup.object().shape(validationSchema);
};

export default createValidationSchema;
