import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameOfLifeComponent } from './game-of-life/game-of-life.component';

const routes: Routes = [
  { path: '', component: GameOfLifeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
