import { useState } from "react";

const useForm = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const resetForm = () => {
    setFormData(initialValues);
  };

  return {
    formData,
    setFormData,
    handleChange,
    resetForm,
    errors,
    setErrors,
  };
};

export default useForm;
