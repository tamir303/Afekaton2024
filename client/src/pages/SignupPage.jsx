import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import WrapperForm from "../components/common/WrapperForm";
import { useNavigate } from "react-router-dom";

const SignupPage = ({ fields, validation, onSubmit, subTypes }) => {
  const { palette } = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const navigate = useNavigate();

  const initialValues = {};
  fields.forEach((field) => {
    if (field.includes("Subjects")) {
      initialValues[field] = [];
    } else {
      initialValues[field] = "";
    }
  });

  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 224,
        width: 250,
      },
    },
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    getContentAnchorEl: null,
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Box
        width={isNonMobileScreens ? "50%" : "93%"}
        p="2rem"
        borderRadius="1.5rem"
        bgcolor="#f0f0f0"
        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
        textAlign="center"
      >
        <Box>
          <Box gridColumn="span 4">
            <Typography fontWeight="bold" fontSize="32px" color="primary">
              Afektive
            </Typography>
          </Box>
          <Box gridColumn="span 4" mb="1.5rem">
            <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }}>
              Welcome to Afektive! a platform for matching tutors to tutee
            </Typography>
          </Box>
          <WrapperForm
            targetFunction={onSubmit}
            initialValues={initialValues}
            validation={validation}
          >
            {(formikProps) => {
              const {
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                resetForm,
              } = formikProps;

              return (
                <>
                  <Box
                    justifyContent="flex"
                    alignItems="stretch"
                    gridColumn="span 4"
                  >
                    {fields.map((field, index) =>
                      field === "Type" ? (
                        <FormControl fullWidth key={index} sx={{ mb: "1rem" }}>
                          <InputLabel shrink={false} htmlFor={field} />
                          <Select
                            displayEmpty
                            value={values[field]}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched[field] && Boolean(errors[field])}
                            name={field}
                            MenuProps={menuProps}
                            renderValue={(selected) => {
                              if (selected.length === 0) {
                                return <em>Select Type</em>;
                              }
                              return selected;
                            }}
                          >
                            <MenuItem disabled value="">
                              <em>Select Type</em>
                            </MenuItem>
                            {subTypes.map((sub, subIndex) => (
                              <MenuItem key={subIndex} value={sub}>
                                {sub}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : field.includes("Subjects") ? (
                        <Autocomplete
                          key={index}
                          multiple
                          id={field}
                          options={[
                            "Math",
                            "Science",
                            "History",
                            "Literature",
                            "Programming",
                          ]}
                          getOptionLabel={(option) => option}
                          onChange={(event, value) => {
                            handleChange({
                              target: { name: field, value: value },
                            });
                          }}
                          onBlur={handleBlur}
                          value={values[field]}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="standard"
                              label={field}
                              error={touched[field] && Boolean(errors[field])}
                              helperText={
                                touched[field] && errors[field]
                                  ? String(errors[field])
                                  : ""
                              }
                              fullWidth
                            />
                          )}
                        />
                      ) : (
                        <TextField
                          key={index}
                          type={
                            field.toLowerCase().includes("password")
                              ? "password"
                              : "text"
                          }
                          label={field}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values[field]}
                          name={field}
                          error={touched[field] && Boolean(errors[field])}
                          helperText={
                            touched[field] && errors[field]
                              ? String(errors[field])
                              : ""
                          }
                          fullWidth
                          sx={{
                            mb: index === fields.length - 1 ? "0" : "1rem",
                          }}
                        />
                      )
                    )}
                  </Box>
                  <Box gridColumn="span 4">
                    <Button
                      fullWidth
                      type="submit"
                      sx={{
                        m: "2rem 0",
                        p: "1rem",
                        bgcolor: palette.primary.main,
                        color: palette.background.paper,
                        "&:hover": { color: palette.primary.main },
                      }}
                    >
                      {"SIGNUP"}
                    </Button>
                    <Typography
                      textAlign="left"
                      onClick={() => {
                        resetForm();
                        navigate("/login");
                      }}
                      sx={{
                        textDecoration: "underline",
                        color: palette.primary.main,
                        "&:hover": {
                          cursor: "pointer",
                          color: palette.primary.light,
                        },
                      }}
                    >
                      {"Have an account? Sign in here."}
                    </Typography>
                  </Box>
                </>
              );
            }}
          </WrapperForm>
        </Box>
      </Box>
    </Box>
  );
};

export default SignupPage;
