import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Chart } from 'chart.js';
import { VDataService } from '../v-data.service'
import { Observable } from 'rxjs';
import { MatTableModule } from '@angular/material/table';

var chartcounter = 0

export interface PeriodicElement {
position:number
  statement: string;
  Parameter: string;
  Description: string;
  Value: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, statement: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#object>', Parameter: '  <http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate>', Description: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#subject>', Value: '<http://acrux.weposolutions.de/xodx/?c=activity&id=e26d7a27bb581a10d4f04dd9ca97ed3a>'},
    {position: 1, statement: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#object>', Parameter: '  <http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate>', Description: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#subject>', Value: '  <http://acrux.weposolutions.de/xodx/?c=activity&id=132077f2502515ed9f7e364b2ce4c460>'},
      {position: 1, statement: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#object>', Parameter: '  <http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate>', Description: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#subject>', Value: '  <http://eis.iai.uni-bonn.de/model/export/?m=http%3A%2F%2Feis.iai.uni-bonn.de%2F&f=turtle>'},
];

@Component({
  selector: 'app-metric-profile',
  templateUrl: './metric-profile.component.html',
  styleUrls: ['./metric-profile.component.scss']
})
export class MetricProfileComponent implements OnInit {

  constructor(private data: DataService,private vdata: VDataService) { }

  displayedColumns: string[] = ['position', 'statement', 'Parameter', 'Description', 'Value'];
  dataSource = ELEMENT_DATA;
  metric:Object
  chart = []
  donut = []
  dataset_label:string
  
  ngOnInit() {

  	this.data.Current_Label.subscribe((res)=>{
  		this.dataset_label = res
  		console.log(this.dataset_label)
  	})

    this.data.CurrentMetric.subscribe((res)=> {
      this.metric = res
      console.log(this.dataset_label)
      console.log(this.metric)

      this.loadDonut()
      this.data.getProfileObservation(this.dataset_label,this.metric['Observations'][0]['Observation-URI']).subscribe((res)=>{
        console.log(res)
      })
    })

  }

metricVis(option){
    let arr = [option]
    console.log(`array of metric: ${arr}`)
    this.loadVis(this.dataset_label,arr)
  }


  loadVis(label,metrics)
  {
      this.vdata.vstime(label,metrics)
    .subscribe(
      (res)=> {
        console.log(res)
        console.log(res.metrics[0].lstObservations[0].observationDate)
        console.log(res.metrics[0].lstObservations[0].observationValue)

        let obsDate = []
        let obsValue = []
        let name = []
        for(let i in res.metrics){
          name.push(res.metrics[i].name)
          for(let c in res.metrics[i].lstObservations){
            obsDate.push(res.metrics[i].lstObservations[c].observationDate)
            obsValue.push(res.metrics[i].lstObservations[c].observationValue)
          }
        }

        console.log(` obsDate: ${obsDate}`)
        console.log(`obsValue: ${obsValue}`)
        console.log(` name: ${name}`)

        let visDates = []

        for(let c in obsDate){
          var jsdate = new Date(obsDate[c])

          console.log(jsdate)
          visDates.push(jsdate.toLocaleTimeString('en-GB',{year:'numeric',month:'short',day:'numeric'}))
        }

      console.log(visDates)

      this.chart = new Chart('line1',{

        type: 'line',
        data: {
          labels: visDates,
          datasets: [
            {
              label: name,
              data: obsValue,
              borderColor: '#3cba9f',
              fill: false,
              //steppedLine: true
              cubicInterpolationMode: 'monotone'
            }
          ]
        },
        options: {
          scaleShowvalues:true,
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              display:true,
              ticks:{
                autoSkip:false
              }
            }],
            yAxes: [{
              ticks:{
                beginAtZero:true
              },
              display:true
            }]
          }
        }
      })

    }
  )}

    toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    })
	}

	loadDonut(){
				console.log('loading donut')
        let t = this.metric['weight'] - this.metric['Observations'][0].Value
        let r = 100 - t - this.metric['Observations'][0].Value
        console.log(this.metric['Observations'][0].Value)
        console.log(t)
        console.log(r)
    		this.donut = new Chart('donut1', {
    			type: 'doughnut',
    			data: {
    				datasets: [{
    					data: [
    						this.metric['Observations'][0].Value,t,r
    					],
                backgroundColor: [
                    'rgba(205, 255, 0)',
                    'rgba(255, 59, 119)',
                    'rgba(82, 101, 107)'
                ],
    					label: 'Dataset 1'
    				}],
    				labels: [
    					'LatestValue',
    					'To reach Threshold',
    					'To reach 100'
    				]
    			},
    			options: {
    				responsive: true,
    				legend: {
    					position: 'top',
    				},
    				title: {
    					display: true,
    					text: 'Quality Value'
    				},
    				animation: {
    					animateScale: true,
    					animateRotate: true
    				}
    			}
    		})
	}

}
