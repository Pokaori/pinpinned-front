import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {VerifyEmailComponent} from "./verify-email/verify-email.component";
import {MapAppComponent} from "./map-app/map-app.component";
import {HttpClientModule} from "@angular/common/http";

const routes: Routes = [{
  path: 'verify/:id',
  component: VerifyEmailComponent,
},
  {
  path: '',
  component: MapAppComponent,
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
