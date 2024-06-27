import { Formik } from "formik";

function FormWrapper({
  initialValues,
  validation,
  targetFunction,
  children,
}) {
  const handleFormSubmit = async (
    values,
    submissionProps
  ) => {
    await targetFunction(values);
    submissionProps.resetForm();
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleFormSubmit}
      validationSchema={validation}
    >
      {(formikProps) => {
        return (
          <form onSubmit={formikProps.handleSubmit}>
            {children(formikProps)}
          </form>
        );
      }}
    </Formik>
  );
}

export default FormWrapper;
