import { Container } from 'inversify';

import { PatientController } from './modules/patients/patient.controller.js';
import { PatientService } from './modules/patients/patient.service.js';
import { PatientRepository } from './modules/patients/patient.repository.js';
import { PatientRoutes } from './modules/patients/patients.routes.js';
import logger from './config/logger.config.js';

const container = new Container();

container.bind('PatientRepository').to(PatientRepository);

container.bind('PatientService').to(PatientService);

container.bind('PatientController').to(PatientController);

container.bind('PatientRoutes').to(PatientRoutes);

container.bind('Logger').toConstantValue(logger);

export default container;
