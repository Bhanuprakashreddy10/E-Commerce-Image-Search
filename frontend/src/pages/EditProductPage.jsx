import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import ProductForm from '../components/ProductForm';

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      setIsFetching(true);
      setError(null);
      try {
        const response = await productService.getProductById(id);
        if (response.success) {
          setInitialData(response.data);
        } else {
          setError(response.message || 'Product not found');
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || 'Failed to load product details'
        );
      } finally {
        setIsFetching(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await productService.updateProduct(id, formData);
      if (response.success) {
        navigate('/', {
          state: { message: `Product "${response.data.name}" updated successfully!` }
        });
      } else {
        setError(response.message || 'Failed to update product');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to save product changes'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <ProductForm
      initialData={initialData}
      isEdit={true}
      isLoading={isSubmitting}
      error={error}
      onSubmit={handleUpdate}
    />
  );
}
