import { Router } from 'express';
import { injectable, inject } from 'inversify';
import { PatientController } from './patient.controller.js';
import { validateRequest } from '../../core/middlewares/validate-request.middleware.js';

import { CreatePatientValidationSchema } from './validators/createPatient.validator.js';

@injectable()
export class PatientRoutes {
  public router: Router;

  constructor(@inject('PatientController') private patientController: PatientController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // create
    this.router.post(
      '/',
      validateRequest(CreatePatientValidationSchema),
      this.patientController.createPatient.bind(this.patientController)
    );

    // getAll
    this.router.get('/', this.patientController.getAllPatients.bind(this.patientController));

    // search
    this.router.get('/search', this.patientController.searchPatients.bind(this.patientController));

    // getDashboardStatistics
    this.router.get(
      '/statistics/dashboard',
      this.patientController.getPatientStatistics.bind(this.patientController)
    );

    // getById
    this.router.get('/:id', this.patientController.getPatientById.bind(this.patientController));

    // update wholeDoc
    this.router.put(
      '/:id',
      validateRequest(CreatePatientValidationSchema, 'body', true),
      this.patientController.updatePatient.bind(this.patientController)
    );

    // Update partialDoc
    this.router.patch(
      '/:id',
      validateRequest(CreatePatientValidationSchema, 'body', true),
      this.patientController.updatePatient.bind(this.patientController)
    );

    // delete
    this.router.delete('/:id', this.patientController.deletePatient.bind(this.patientController));
  }
}
