import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createSale, updateSale, clearMessages } from '../../redux/slices/saleSlice';
import apiService from '../../services/api';
import { Save, X } from 'lucide-react';

const PRODUCTS = {
  CONSUMER_CREDIT: 'Credito de Consumo',
  FREE_INVESTMENT: 'Libranza Libre Inversión',
  CREDIT_CARD: 'Tarjeta de Credito'
};

const FRANCHISES = ['AMEX', 'VISA', 'MASTERCARD'];

const SaleForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, success, error } = useSelector((state) => state.sales);
  const [selectedProduct, setSelectedProduct] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm();
  const product = watch('product');

  useEffect(() => {
    if (product) {
      setSelectedProduct(product);
      if (product !== PRODUCTS.CREDIT_CARD) {
        setValue('franchise', '');
      }
      if (![PRODUCTS.CONSUMER_CREDIT, PRODUCTS.FREE_INVESTMENT].includes(product)) {
        setValue('interestRate', '');
      }
    }
  }, [product, setValue]);

  useEffect(() => {
    if (id) {
      loadSale();
    }
  }, [id]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        navigate('/sales');
      }, 2000);
    }
  }, [success, navigate]);

  const loadSale = async () => {
    try {
      const response = await apiService.getSaleById(id);
      const sale = response.data;
      reset({
        product: sale.product,
        requestedAmount: sale.requestedAmount,
        franchise: sale.franchise || '',
        interestRate: sale.interestRate || ''
      });
      setSelectedProduct(sale.product);
    } catch (error) {
      console.error('Error loading sale:', error);
    }
  };

  const onSubmit = async (data) => {
    const saleData = {
      product: data.product,
      requestedAmount: parseFloat(data.requestedAmount),
      franchise: data.product === PRODUCTS.CREDIT_CARD ? data.franchise : null,
      interestRate: [PRODUCTS.CONSUMER_CREDIT, PRODUCTS.FREE_INVESTMENT].includes(data.product) ? parseFloat(data.interestRate) : null
    };

    if (id) {
      await dispatch(updateSale({ id, saleData }));
    } else {
      await dispatch(createSale(saleData));
    }
  };

  const showFranchise = selectedProduct === PRODUCTS.CREDIT_CARD;
  const showInterestRate = [PRODUCTS.CONSUMER_CREDIT, PRODUCTS.FREE_INVESTMENT].includes(selectedProduct);

  return (
    <div className="max-w-2xl mx-auto text-light">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-light">{id ? 'Editar' : 'Nueva'} Venta</h1>
        <p className="text-gray-400 mt-1">Complete los datos del producto financiero</p>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Producto *</label>
            <select {...register('product', { required: 'El producto es obligatorio' })} className="input p-1 bg-secondary text-light ml-2">
              <option value="">Seleccione un producto</option>
              {Object.values(PRODUCTS).map((prod) => (
                <option key={prod} value={prod}>{prod}</option>
              ))}
            </select>
            {errors.product && <p className="text-sm text-red-600 mt-1">{errors.product.message}</p>}
          </div>

          <div>
            <label className="label">Cupo Solicitado *</label>
            <input type="number" step="0.01" {...register('requestedAmount', { required: 'El cupo es obligatorio', min: { value: 0.01, message: 'El cupo debe ser mayor a 0' } })} className="input p-1 bg-secondary text-light ml-2" placeholder="1000000" />
            {errors.requestedAmount && <p className="text-sm text-red-600 mt-1">{errors.requestedAmount.message}</p>}
          </div>

          {showFranchise && (
            <div>
              <label className="label">Franquicia *</label>
              <select {...register('franchise', { required: showFranchise && 'La franquicia es obligatoria para tarjetas de crédito' })} className="input p-1 bg-secondary text-light ml-2">
                <option value="">Seleccione una franquicia</option>
                {FRANCHISES.map((fr) => (
                  <option key={fr} value={fr}>{fr}</option>
                ))}
              </select>
              {errors.franchise && <p className="text-sm text-red-600 mt-1">{errors.franchise.message}</p>}
            </div>
          )}

          {showInterestRate && (
            <div>
              <label className="label">Tasa de Interés (%) *</label>
              <input type="number" step="0.01" {...register('interestRate', { required: showInterestRate && 'La tasa es obligatoria', min: { value: 0, message: 'La tasa debe ser mayor o igual a 0' }, max: { value: 99.99, message: 'La tasa debe ser menor a 100' } })} className="input p-1 bg-secondary text-light ml-2" placeholder="10.50" />
              {errors.interestRate && <p className="text-sm text-red-600 mt-1">{errors.interestRate.message}</p>}
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button type="submit" disabled={loading} className="bg-accent text-primary max-w-40 p-1 flex items-center flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => navigate('/sales')} className="btn btn-secondary flex items-center">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;