import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-assessment-stats',
  templateUrl: './assessment-stats.component.html',
  styleUrls: ['./assessment-stats.component.scss']
})
export class AssessmentStatsComponent implements OnInit {

  constructor(private data: DataService) { }

  pending = []
  successful = []
  failed = []
  id 
  displayedColumns: string[] = ['Request-ID', 'Dataset-PLD', 'Assessment-Date', 'Dataset-Location'];

  ngOnInit() {
  	this.data.getpending().subscribe((res)=>{
  		this.pending = res.Results
  		console.log(this.pending)
  	})
  	this.data.getsuccessful().subscribe((res)=>{
  		this.successful = res.Results
  		console.log(this.successful)
  	})
  	this.data.getfailed().subscribe((res)=>{
  		console.log(res)
  		this.failed = res.Results
  	})

  	  this.id = setInterval(() => {
    this.update(); 
  }, 7000);
}
  


  update(){
  	this.data.getpending().subscribe((res)=>{
  		this.pending = res.Results
  	})
  	this.data.getsuccessful().subscribe((res)=>{
  		this.successful = res.Results
  	})
  	this.data.getfailed().subscribe((res)=>{
  		this.failed = res.Results
  	})

  }
}
