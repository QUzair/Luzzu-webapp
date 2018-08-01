import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PostsComponent } from './posts/posts.component';
import { UsersComponent } from './users/users.component';
import { DetailsComponent } from './details/details.component';
import { HttpClientModule }  from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MaterialModule } from './material.module';
import { LayoutModule } from '@angular/cdk/layout';
import 'hammerjs';
import { AssessComponent } from './assess/assess.component';
import { VisualiseComponent } from './visualise/visualise.component';
import { HomeComponent } from './home/home.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AssessmentStatsComponent } from './assessment-stats/assessment-stats.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { MetricDialogComponent } from './metric-dialog/metric-dialog.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { MetricProfileComponent } from './metric-profile/metric-profile.component';




@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    PostsComponent,
    UsersComponent,
    DetailsComponent,
    AssessComponent,
    VisualiseComponent,
    HomeComponent,
    AssessmentStatsComponent,
    MetricDialogComponent,
    MetricProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    LayoutModule,
    FormsModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  entryComponents: [
        MetricDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
