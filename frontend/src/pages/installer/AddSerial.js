import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import PendingApproval from '../../components/PendingApproval';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { serialService } from '../../services/serialService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Textarea } from '../../components/ui/textarea';

const AddSerial = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serialExists, setSerialExists] = useState(null);
  const [checkingSerial, setCheckingSerial] = useState(false);
  const [serialValidation, setSerialValidation] = useState({
    isValid: null,
    isChecking: false,
    message: ''
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm();

  const serialNumber = watch('serialNumber');

  // Loading state for form submission
  const [addingSerial, setAddingSerial] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Check serial number existence and validity
  useEffect(() => {
    const checkSerial = async () => {
      if (serialNumber && serialNumber.length >= 6) {
        setCheckingSerial(true);
        setSerialValidation({ isValid: null, isChecking: true, message: 'Checking...' });

        try {
          // Check if serial exists (already registered)
          const existsResponse = await serialService.checkSerial(serialNumber);
          setSerialExists(existsResponse.data.exists);

          // Check if serial is valid (in admin's approved list)
          const validityResponse = await serialService.checkSerialValidity(serialNumber);
          setSerialValidation({
            isValid: validityResponse.data.isValid,
            isChecking: false,
            message: validityResponse.data.message
          });
        } catch (error) {
          console.error('Error checking serial:', error);
          setSerialValidation({
            isValid: false,
            isChecking: false,
            message: 'Error checking serial number'
          });
        } finally {
          setCheckingSerial(false);
        }
      } else {
        setSerialExists(null);
        setSerialValidation({ isValid: null, isChecking: false, message: '' });
      }
    };

    const timeoutId = setTimeout(checkSerial, 500);
    return () => clearTimeout(timeoutId);
  }, [serialNumber]);

  // Check if user needs approval (after all hooks)
  if (user && user.status !== 'approved') {
    return <PendingApproval user={user} />;
  }

  const onSubmit = async (data) => {
    console.log('🚀 Form submission started');

    // Prevent double submission
    if (isSubmittingForm || addingSerial) {
      console.log('⚠️ Form already being submitted, ignoring duplicate');
      return;
    }

    if (serialExists) {
      toast.error('Serial number already exists');
      return;
    }

    try {
      setIsSubmittingForm(true);
      setAddingSerial(true);
      console.log('📝 Processing form data...');

      // Format the data to match backend validation expectations
      const formattedData = {
        serialNumber: data.serialNumber.toUpperCase().trim(),
        installationDate: data.installationDate, // Keep as date string (YYYY-MM-DD)
        location: {
          address: data.address?.trim() || 'Not specified',
          city: data.city?.trim() || 'Not specified'
        },
        inverterModel: data.inverterModel?.trim() || 'SunX-5000',
        capacity: parseInt(data.capacity) || 5000,
        notes: data.notes?.trim() || ''
      };

      console.log('Sending data:', formattedData); // Debug log

      // Call the service function
      const result = await serialService.addSerial(formattedData);
      console.log('Success result:', result); // Debug log

      // Only proceed if the API call was successful
      if (result && result.success) {
        toast.success('Serial number added successfully!');

        // Reset form safely
        try {
          reset();
          setSerialExists(null);
        } catch (resetError) {
          console.warn('Form reset error (non-critical):', resetError);
        }

        // Navigate safely
        try {
          navigate('/dashboard');
          console.log('✅ Form submission completed successfully');
        } catch (navError) {
          console.warn('Navigation error (non-critical):', navError);
          // If navigation fails, at least show success
        }
      } else {
        throw new Error('API call succeeded but returned invalid response');
      }

    } catch (error) {
      console.error('Error adding serial:', error);

      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Failed to add serial number';
        toast.error(errorMessage);
        console.error('Server error:', error.response.status, error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        toast.error('No response from server. Please check if the backend is running.');
        console.error('No response:', error.request);
      } else if (error.name === 'AbortError') {
        // Request was aborted, don't show error
        console.log('Request was aborted');
      } else {
        // Something else happened - only show error if it's a real error
        console.error('Unexpected error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        toast.error('Failed to add serial number. Please try again.');
      }
    } finally {
      setAddingSerial(false);
      setIsSubmittingForm(false);
    }
  };

  const getSerialStatus = () => {
    if (!serialNumber || serialNumber.length < 6) return null;
    if (checkingSerial || serialValidation.isChecking) return 'checking';
    if (serialExists === true) return 'exists';
    if (serialValidation.isValid === false) return 'invalid';
    if (serialExists === false && serialValidation.isValid === true) return 'available';
    return null;
  };

  const serialStatus = getSerialStatus();

  return (
    <Layout title="Add Serial Number">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/serials"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 touch-manipulation"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Serial Numbers
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Add Serial Number
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Submit a new inverter installation
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <div className="card-body p-4 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {/* Serial Number */}
              <div>
                <label htmlFor="serialNumber" className="form-label">
                  Serial Number *
                </label>
                <div className="relative">
                  <input
                    {...register('serialNumber', {
                      required: 'Serial number is required',
                      pattern: {
                        value: /^[A-Z0-9]{6,20}$/i,
                        message: 'Serial number must be 6-20 alphanumeric characters'
                      }
                    })}
                    type="text"
                    className={`form-input pr-10 ${
                      serialStatus === 'exists' || serialStatus === 'invalid' ? 'border-red-500' :
                      serialStatus === 'available' ? 'border-green-500' : ''
                    }`}
                    placeholder="Enter serial number (e.g., ABC123XYZ)"
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      setValue('serialNumber', e.target.value);
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {serialStatus === 'checking' && (
                      <LoadingSpinner size="sm" />
                    )}
                    {serialStatus === 'available' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                    {(serialStatus === 'exists' || serialStatus === 'invalid') && (
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                {errors.serialNumber && (
                  <p className="form-error">{errors.serialNumber.message}</p>
                )}
                {serialStatus === 'exists' && (
                  <p className="form-error">Serial number already exists</p>
                )}
                {serialStatus === 'invalid' && (
                  <p className="form-error">{serialValidation.message}</p>
                )}
                {serialStatus === 'available' && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Serial number is valid and available
                  </p>
                )}
                {serialValidation.isChecking && (
                  <p className="text-sm text-gray-500 mt-1">
                    Validating serial number...
                  </p>
                )}
              </div>

              {/* Installation Date */}
              <div>
                <label htmlFor="installationDate" className="form-label">
                  Installation Date *
                </label>
                <input
                  {...register('installationDate', {
                    required: 'Installation date is required',
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(23, 59, 59, 999);
                      return selectedDate <= today || 'Installation date cannot be in the future';
                    }
                  })}
                  type="date"
                  className="form-input"
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.installationDate && (
                  <p className="form-error">{errors.installationDate.message}</p>
                )}
              </div>

              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address" className="form-label">
                    Installation Address
                  </label>
                  <input
                    {...register('address', {
                      maxLength: {
                        value: 200,
                        message: 'Address cannot exceed 200 characters'
                      }
                    })}
                    type="text"
                    className="form-input"
                    placeholder="Enter installation address"
                  />
                  {errors.address && (
                    <p className="form-error">{errors.address.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <input
                    {...register('city', {
                      maxLength: {
                        value: 100,
                        message: 'City cannot exceed 100 characters'
                      }
                    })}
                    type="text"
                    className="form-input"
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="form-error">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Inverter Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inverterModel" className="form-label">
                    Inverter Model
                  </label>
                  <input
                    {...register('inverterModel')}
                    type="text"
                    className="form-input"
                    placeholder="Enter inverter model"
                  />
                </div>
                <div>
                  <label htmlFor="capacity" className="form-label">
                    Capacity
                  </label>
                  <input
                    {...register('capacity')}
                    type="text"
                    className="form-input"
                    placeholder="e.g., 5kW, 10kW"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="form-label">
                  Notes (Optional)
                </label>
                <textarea
                  {...register('notes', {
                    maxLength: {
                      value: 500,
                      message: 'Notes cannot exceed 500 characters'
                    }
                  })}
                  className="form-input"
                  rows="3"
                  placeholder="Any additional notes about the installation"
                />
                {errors.notes && (
                  <p className="form-error">{errors.notes.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <Link
                  to="/serials"
                  className="btn-secondary w-full sm:w-auto text-center touch-manipulation"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || addingSerial || isSubmittingForm || serialExists || serialValidation.isValid === false}
                  className="btn-primary flex items-center justify-center w-full sm:w-auto touch-manipulation"
                >
                  {(isSubmitting || addingSerial || isSubmittingForm) ? (
                    <>
                      <LoadingSpinner size="sm" color="white" className="mr-2" />
                      <span className="text-sm sm:text-base">Adding...</span>
                    </>
                  ) : (
                    <span className="text-sm sm:text-base">Add Serial Number</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddSerial;
