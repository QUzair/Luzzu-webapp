import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { DetailsComponent } from './details/details.component';
import { PostsComponent } from './posts/posts.component';
import { AssessComponent } from './assess/assess.component';
import { VisualiseComponent} from './visualise/visualise.component';
import { HomeComponent } from './home/home.component';
import { AssessmentStatsComponent } from './assessment-stats/assessment-stats.component'

const routes: Routes = [
	
	{
		path: 'users',
		component: UsersComponent
	},
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'details',
		component: DetailsComponent
	},
	{
		path: 'posts',
		component: PostsComponent
	},
	{
		path: 'assess',
		component: AssessComponent
	},
	{
		path: 'visualise',
		component: VisualiseComponent
	},
		{
		path: 'assessmentstats',
		component: AssessmentStatsComponent
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
