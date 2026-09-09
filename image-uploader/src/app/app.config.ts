import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAngularMaterialImageUploader } from 'angular-material-image-uploader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAngularMaterialImageUploader()
  ]
};
