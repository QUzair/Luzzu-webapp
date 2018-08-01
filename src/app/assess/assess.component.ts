import { Component, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { VDataService } from '../v-data.service'
import { FormControl } from '@angular/forms';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-assess',
  templateUrl: './assess.component.html',
  styleUrls: ['./assess.component.scss']
})

export class AssessComponent implements OnInit {

	mconfig = {
	  "@context": {
	    "lmi": "http://purl.org/eis/vocab/lmi#",
	    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
	    "xsd": "http://www.w3.org/2001/XMLSchema#" },
	    "@id": "_:ub104bL6C1",
	    "@type": "lmi:MetricConfiguration",
	    "lmi:metric": [
	      "io.github.luzzu.linkeddata.qualitymetrics.intrinsic.consistency.MisusedOwlDatatypeOrObjectProperties",
	      "io.github.luzzu.linkeddata.qualitymetrics.intrinsic.consistency.MisplacedClassesOrProperties",
	      "io.github.luzzu.linkeddata.qualitymetrics.intrinsic.consistency.UsageOfDeprecatedClassesOrProperties"
    ]}
    
	pld = ''
	dslocation = ''
	metricsForm = new FormControl(); // Contains the desired datasets
	data = []
	checked =false
	sparQlendpoint=false
	problemReport=false
	sampleText = [
  "This is the definition of the metric you will be assessing",
  "Provides a measure of the redundancy of the dataset at the data level, computed as the ratio of the Number of Unique Subjects to the Total Number of Subjects",
  "Assesses the percentage of entities having an rdfs:label or rdfs:comment" 

  ]

  constructor(private _vdata: VDataService, public snackBar: MatSnackBar) { }

  ngOnInit() {
  	this._vdata.LoadAssessMetrics().subscribe((res)=>{
  		console.log(res)
  		this.data = res['@graph']
  		console.log(this.data)
  	})
  }

  loadRes(m){
  	console.log(m)
  }

  Assess(){
  	console.log('Starting Assessment...')
  	console.log(this.metricsForm.value)
  	console.log(this.sparQlendpoint)
  	console.log(this.problemReport)
  	this.mconfig['lmi:metric'] = this.metricsForm.value.map(res=>res['javaPackageName'])
  	console.log(this.mconfig)
  	let snackBarRef = this.snackBar.open(`${this.pld} sent for assessment`,null,{duration:2000});
  	this._vdata.Assess(this.dslocation,this.problemReport,JSON.stringify(this.mconfig),this.pld,this.sparQlendpoint).subscribe((res)=>{
  		console.log(res)
  	})
  }

    openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
}

}
