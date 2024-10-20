import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import CustomTextInput from "components/atoms/CustomTextInput";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import StaffList from "components/molecules/department/StaffList";
import SearchDropdown from "components/atoms/SearchDropdown";
import { useCustomQuery } from "store/hooks/react-query/query/useQuery";
import { useCustomMutation } from "store/hooks/react-query/mutate/useMutateFunc";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { handleErrorProps } from "utils/handleErrorProps";
import CustomSelect from "components/atoms/Select";
import CustomButton from "components/atoms/CustomButton";
import { GET_DEPARTMENTS, GET_STAFFS } from "utils/reactQueryKeys";

const validate = (values) => {
  const errors = {};

  if (!values.unit) {
    errors.unit = "Required";
  }
  if (!values.department) {
    errors.department = "Required";
  }

  return errors;
};

const GetUnits = ({ deptId, value, handleChange }) => {
  //get units of a dept
  const { data: staffs } = useCustomQuery(
    GET_STAFFS,
    {
      url: `/user/get-all-staff`,
      method: "post",
      data: { limit: 1000 },
    },
    {
      refetchOnWindowFocus: false,
      // enabled: !!deptId,
      select: (data) => {
        const formartedData = data.data.data.map((staf) => {
          return { name: staf.fullName, value: staf._id };
        });
        return formartedData;
      },
    }
  );

  return (
    <CustomSelect
      options={staffs}
      label="Units Head"
      state={value}
      handleChange={handleChange}
      name="headOfUnit"
      haveTopLabel={true}
      placeholder="Select"
    />
  );
};

const initialValues = {
  name: "",
  headOfUnit: "",
  department: "",
  phoneNumber: "",
};
const CreateUnit = ({ handleClose }) => {
  const { handleBlur, handleChange, values, touched, errors, setValues } =
    useFormik({
      initialValues,
      validate: (values) => validate(values),
    });

  //get depts
  const { data: allDepartments } = useCustomQuery(
    GET_DEPARTMENTS,
    {
      url: `/department/get-all-departments`,
      method: "get",
    },
    {
      refetchOnWindowFocus: false,
      select: (data) => {
        const formartedData = data.data.departments.map((dept) => {
          return { name: dept.name, value: dept._id };
        });
        return formartedData;
      },
    }
  );

  const formatValues = React.useCallback((value) => {
    if (!value.headOfUnit) {
      delete value.headOfUnit;
    }
    if (!value.phoneNumber) {
      delete value.phoneNumber;
    }

    return value;
  }, []);

  //create unit
  const { mutate: handleCreateClinic, isLoading: createClinicLoading } =
    useCustomMutation(
      {
        url: `/unit/create-unit`,
        method: "post",
        data: formatValues(values),
      },
      {
        onSuccess: () => {
          toast.success("Success");
          handleClose(true);
        },

        onError: (error) => toast.error(error.message),
      }
    );

  return (
    <Grid container spacing={3} sx={{ p: 3 }} aria-label="assign-staff-modal">
      <Grid item xs={12}>
        <Stack
          direction="column"
          alignItems="start"
          justifyContent="start"
          spacing={1}
          sx={{ width: "100%" }}
        >
          <Typography variant="displayMd">Create Units </Typography>
        </Stack>

        <Stack
          direction="column"
          alignItems="start"
          justifyContent="start"
          spacing={1}
          sx={{ width: "100%", mb: 2 }}
        >
          <CustomSelect
            options={allDepartments}
            label="Department"
            state={values.department}
            handleChange={handleChange}
            name="department"
            haveTopLabel={true}
            placeholder="Select"
            {...handleErrorProps(touched.department, errors.department)}
            onBlur={handleBlur}
          />
          <CustomTextInput
            title="Unit Name"
            value={values.name}
            name="name"
            placeholder={"Enter Unit Name"}
            handleChange={handleChange}
            boxSx={{ width: "100%" }}
            {...handleErrorProps(touched.name, errors.name)}
            onBlur={handleBlur}
          />

          <GetUnits
            deptId={values.department}
            value={values.headOfUnit}
            handleChange={handleChange}
          />

          <CustomTextInput
            title="Phone Number  (Optional)"
            value={values.phoneNumber}
            name="phoneNumber"
            handleChange={handleChange}
            boxSx={{ width: "100%" }}
          />
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="start"
          spacing={1}
          sx={{ mt: 2, width: "100%" }}
        >
          <Button
            variant="contained"
            color="secondary"
            sx={{}}
            disabled={createClinicLoading}
            onClick={handleCreateClinic}
          >
            Create
          </Button>
          <CustomButton
            variant="containedBrown"
            onClick={handleClose}
            text="Cancel"
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default CreateUnit;
