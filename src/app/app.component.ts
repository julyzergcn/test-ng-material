import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <mat-slider min="1" max="100" step="1" value="50"></mat-slider>

    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  title = 'test_ng_material';
}
