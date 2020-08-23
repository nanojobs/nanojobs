import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaskerComponent } from './tasker/tasker.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';

import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import {MatButtonModule, MatButton} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { GuideComponent } from './guide/guide.component';
import { NotimplementedComponent } from './notimplemented/notimplemented.component';
import { NohashComponent } from './nohash/nohash.component';
import { FormsModule } from "@angular/forms";
import { WalletComponent } from './wallet/wallet.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashsimpleComponent } from './dashsimple/dashsimple.component';
import { MasterconsoleComponent } from './masterconsole/masterconsole.component';
import { VerifyComponent } from './verify/verify.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskerComponent,
    GuideComponent,
    NotimplementedComponent,
    NohashComponent,
    WalletComponent,
    DashboardComponent,
    DashsimpleComponent,
    MasterconsoleComponent,
    VerifyComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatToolbarModule,
    MatSlideToggleModule,
    FormsModule,
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
