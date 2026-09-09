import { EnvironmentProviders, Provider, makeEnvironmentProviders } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { GlobalConfig, provideToastr } from 'ngx-toastr';

/**
 * Registers everything the uploader needs: Material animations, HttpClient (for uploads)
 * and ngx-toastr. Add it to your application's providers:
 *
 *   bootstrapApplication(App, { providers: [provideAngularMaterialImageUploader()] });
 *
 * Skip it and register those three yourself if your app already provides them.
 */
export function provideAngularMaterialImageUploader(toastr?: Partial<GlobalConfig>): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [
    provideAnimationsAsync(),
    provideHttpClient(),
    provideToastr({
      progressBar: true,
      progressAnimation: 'decreasing',
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
      ...(toastr ?? {})
    })
  ];
  return makeEnvironmentProviders(providers);
}
