import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import ProductForm from '../components/ProductForm';

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productService.createProduct(formData);
      if (response.success) {
        navigate('/', {
          state: { message: `Product "${response.data.name}" created successfully!` }
        });
      } else {
        setError(response.message || 'Failed to create product');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to connect to backend server'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProductForm
      isEdit={false}
      isLoading={isLoading}
      error={error}
      onSubmit={handleCreate}
    />
  );
}
