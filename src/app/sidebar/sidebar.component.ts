import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd} from '@angular/router'
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

	currentUrl:string
	Assessment = false
	Assessment_Stats=true

  constructor(private router: Router) {

  	router.events.subscribe((_:NavigationEnd) => this.currentUrl = _.url)
   }

  ngOnInit() {
  	//Get Config File

  }

}
