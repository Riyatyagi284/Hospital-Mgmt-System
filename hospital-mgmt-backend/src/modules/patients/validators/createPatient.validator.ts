import Joi from 'joi';

export const CreatePatientValidationSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required(),

  lastName: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required(),

  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),

  // dateOfBirth: Joi.date()
  //   .max('now')
  //   .min('1900-01-01')
  //   .required(),

  dateOfBirth: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .custom((value, helpers) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return helpers.error('any.invalid');
      }
      if (date > new Date()) {
        return helpers.error('any.invalid');
      }
      return value;
    }),

  bloodGroup: Joi.string().valid(
    'A_POSITIVE',
    'A_NEGATIVE',
    'B_POSITIVE',
    'B_NEGATIVE',
    'AB_POSITIVE',
    'AB_NEGATIVE',
    'O_POSITIVE',
    'O_NEGATIVE'
  ).allow(null, ''),

  heightCm: Joi.number().min(30).max(300),

  weightKg: Joi.number().min(2).max(500),

  primaryDoctorId: Joi.string().uuid(),

  phoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .min(8)
    .max(15)
    .required(),

  emailAddress: Joi.string().email().max(255),

  address: Joi.string().min(5).max(500).required(),

  city: Joi.string().min(2).max(100).required(),

  state: Joi.string().min(2).max(100).required(),

  pincode: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required(),

  emergencyContactName: Joi.string().min(2).max(100).required(),

  emergencyContactPhone: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required(),

  profilePhotoUrl: Joi.string().uri(),

  idProofNumber: Joi.string().max(50).allow(''),
});

export const PaginationQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),

  limit: Joi.number().min(1).max(100).default(10),

  sortBy: Joi.string()
    .valid('createdAt', 'firstName', 'lastName', 'lastVisitDate')
    .default('createdAt'),

  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),

  status: Joi.string().valid('ACTIVE', 'INACTIVE'),

  search: Joi.string().min(1).max(100),
});
