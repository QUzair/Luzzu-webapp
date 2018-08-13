import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd} from '@angular/router'
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormControl} from '@angular/forms';
import { DataService } from '../data.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

	currentUrl:string
	Assessment = false
	Assessment_Stats=true

  Configs = []
  showHome = true
  showPosts = true
  showDatasets = true
  showAssessment = true
  showAssessmentStats = true
  showVisualisation = true
  

  constructor(private router: Router, private data: DataService) {
  	router.events.subscribe((_:NavigationEnd) => this.currentUrl = _.url)
   }

  ngOnInit() {

  	//Get Config File and Enable/Disable Components in SideBar
    this.data.getConfigurations().subscribe((res)=>{
        console.log(res)
        this.Configs = res
        let h = this.Configs.filter(res=>res.Name=="Home")
        this.showHome = !h[0].Disable
        let p = this.Configs.filter(res=>res.Name=="Posts")
        this.showPosts = !p[0].Disable
        let d = this.Configs.filter(res=>res.Name=="Ranked_Datasets")
        this.showDatasets = !d[0].Disable
        let v = this.Configs.filter(res=>res.Name=="Visualisation")
        this.showVisualisation = !v[0].Disable
        let a = this.Configs.filter(res=>res.Name=="Assessment")
        this.showAssessment = !a[0].Disable
        let as = this.Configs.filter(res=>res.Name=="Assessment_Stats")
        this.showAssessmentStats = !as[0].Disable
    })

  }


}
