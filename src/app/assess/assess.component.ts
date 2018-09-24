import { Component, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { VDataService } from '../v-data.service'
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
	selector: 'app-assess',
	templateUrl: './assess.component.html',
	styleUrls: ['./assess.component.scss']
})

export class AssessComponent implements OnInit {

	//Create JSON Object for Assessment Request
	mconfig = {
		"@context": {
			"lmi": "http://purl.org/eis/vocab/lmi#",
			"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
			"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
			"xsd": "http://www.w3.org/2001/XMLSchema#"
		},
		"@id": "_:ub104bL6C1",
		"@type": "lmi:MetricConfiguration",
		"lmi:metric": [
			"io.github.luzzu.linkeddata.qualitymetrics.intrinsic.consistency.MisusedOwlDatatypeOrObjectProperties",
			"io.github.luzzu.linkeddata.qualitymetrics.intrinsic.consistency.MisplacedClassesOrProperties",
			"io.github.luzzu.linkeddata.qualitymetrics.intrinsic.consistency.UsageOfDeprecatedClassesOrProperties"
		]
	}

	pld: string
	dslocation: string
	metricsForm = new FormControl(); // Contains the desired datasets
	data = []
	checked = false
	sparQlendpoint = false
	problemReport = false


	constructor(private _vdata: VDataService, public snackBar: MatSnackBar) { }

	ngOnInit() {
		//Receive All ASSESSABLE Metrics
		this._vdata.LoadAssessMetrics().subscribe((res) => {
			console.log(res)
			this.data = res['@graph']
			console.log(this.data)
		})
	}

	loadRes(m) {
		console.log(m)
	}

	Assess() {
		console.log('Starting Assessment...')
		console.log(this.metricsForm.value)
		console.log(this.sparQlendpoint)
		console.log(this.problemReport)

		//Input the Metrics, Dataset Name to the JSON Request Object 
		this.mconfig['lmi:metric'] = this.metricsForm.value.map(res => res['javaPackageName'])
		console.log(this.mconfig)

		// Tell User Request has been sent
		let snackBarRef = this.snackBar.open(`${this.pld} sent for assessment`, null, { duration: 2000 });

		//Send Request to backend
		this._vdata.Assess(this.dslocation, this.problemReport, JSON.stringify(this.mconfig), this.pld, this.sparQlendpoint).subscribe((res) => {
			console.log(res)
		})
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action, {
			duration: 2000,
		});
	}

}
