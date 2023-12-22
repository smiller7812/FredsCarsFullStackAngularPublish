import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { VehiclesComponent } from "./vehicles/vehicles.component";
import { WelcomeComponent } from "./welcome/welcome.component";


const routes: Routes = [
  { path: '', component: WelcomeComponent, pathMatch: 'full' },
  { path: 'vehicles', component: VehiclesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
