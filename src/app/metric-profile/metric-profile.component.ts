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

  ETU = false
  EP = false
  facetOptions = []
  displayedColumns: string[] = ['position', 'statement', 'Parameter', 'Description', 'Value'];
  dataSource = ELEMENT_DATA;
  metric:Object
  chart = []
  donut = []
  barChart = []
  dataset_label:string
  comment:string
  dates = []
  profileProperties:any

  ngOnInit() {
    
    this.data.getFacets().subscribe(res=>this.facetOptions=res.Categories)

  	this.data.Current_Label.subscribe((res)=>{
  		this.dataset_label = res
  		console.log(this.dataset_label)
      this.data.getAssessmentdates(this.dataset_label).subscribe((res)=>{
        this.dates=res['Assessment-Dates'].reverse()
        console.log(this.dates) 
      })
  	})

    this.data.CurrentMetric.subscribe((res)=> {

      let visData = []
      this.metric = res
      console.log(this.dataset_label)
      console.log(this.metric)
      this.getComment(this.metric)

      for(let r in this.dates){
        this.data.MetricsForDated(this.dataset_label,this.dates[r]).subscribe((res)=>{
          console.log(res)
          let arr = res['Metrics'].filter(res=>res['Metric-URI']==this.metric['Metric-URI'])
          console.log(arr)
          console.log(`Metrics Found for ${this.metric['Metric-Label']}`)
          visData.push(arr)
        })
      }
      console.log(visData)


      this.data.getProfileObservation(this.dataset_label,this.metric['Observations'][0]['Observation-URI']).subscribe((res)=>{
        this.profileProperties = res 
        if(res['Estimation-Technique-Used']) this.ETU = true
          else this.ETU = false
        if(res['Estimation-Parameter']) this.EP = true
          else this.EP = false
        console.log(res)
        this.addBarData(this.barChart, res['Total-Dataset-Triples'], res['Total-Dataset-Triples-Assessed'])

        if(chartcounter==0){
          this.TriplesChart(res['Total-Dataset-Triples'],res['Total-Dataset-Triples-Assessed'])
          this.loadDonut()
          this.loadTimeGraph(visData)
          chartcounter++
          }
          else{
            console.log('Updating...')
            this.addBarData(this.barChart, res['Total-Dataset-Triples'], res['Total-Dataset-Triples-Assessed'])
            this.addDonutData(this.donut,this.metric['Observations'][0].Value)
            this.addTimeData(this.chart,visData)
          }
        //this.TriplesChart(res['Total-Dataset-Triples'],res['Total-Dataset-Triples-Assessed'])
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
                ]
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

  loadTimeGraph(visData){
    console.log(visData)

        let data = []
    for(var d in visData){
      if (!(visData[d] === undefined || visData[d].length == 0)) {
        console.log(visData[d][0]['Observations'][0]['Value-Type'])
        data.push((visData[d][0]['Observations'][0]['Value-Type']==='Double') ? visData[d][0]['Observations'][0].Value*100 : visData[d][0]['Observations'][0].Value)
      }
      else if(visData[parseInt(d)-1])  data.push((visData[parseInt(d)-1][0]['Observations'][0]['Value-Type']==='Double') ? visData[parseInt(d)-1][0]['Observations'][0].Value*100 : visData[parseInt(d)-1][0]['Observations'][0].Value)
      else data.push(0)
    }

    // let data = visData.map((res)=>{
    //   if (!(res === undefined || res.length == 0)) {
    //     console.log(res[0]['Observations'][0]['Value-Type'])
    //     return (res[0]['Observations'][0]['Value-Type']==='Double') ? res[0]['Observations'][0].Value*100 : res[0]['Observations'][0].Value
    //   }
    //   else return 0
    // })

console.log(data)

      this.chart = new Chart('line1',{

        type: 'line',
        data: {
          labels:this.dates,
          datasets: [
            {
              label: this.metric['Metric-Label'],
              data: data,
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

  TriplesChart(total,assessed){
        this.barChart = new Chart('bar', {
          type: 'bar',
          data: {
            datasets: [{
              data: [
                total,assessed
              ],
                backgroundColor: [
                    'rgba(205, 255, 0)',
                    'rgba(255, 59, 119)'
                ],
              label: 'Dataset 1'
            }],
            labels: [
              'Total-Dataset-Triples',
              'Total-Dataset-Triples-Assessed'
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
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

  getComment(currLabel){
    console.log(this.facetOptions)
    for(let c in this.facetOptions){
      for(let d in this.facetOptions[c].Dimensions){
        for(let m in this.facetOptions[c].Dimensions[d].Metrics){
          if(this.facetOptions[c].Dimensions[d].Metrics[m]['Label']===currLabel['Metric-Label'])
            this.comment = this.facetOptions[c].Dimensions[d].Metrics[m].Comment
        }
      }
    }
  }

   addBarData(chart, total, assessed) {
     if(total===undefined){
       total=0
       console.log(total)
     }
     if(assessed===undefined){
       assessed=0
       console.log(assessed)
     } 

     try{
      chart.data.datasets[0].data[0] = total
      chart.data.datasets[0].data[1] = assessed
      chart.update();
    }catch(err){
      console.log(err)
    }
  }

   addDonutData(chart, latestObs) {
      if(latestObs===undefined) latestObs = 0
      let t = this.metric['weight'] - latestObs
      let r = 100 - t - latestObs
      console.log(latestObs)
      console.log(this.metric['weight'])
      console.log(t)
      console.log(r)
     try{
      chart.data.datasets[0].data[0] = latestObs
      chart.data.datasets[0].data[1] = t
      chart.data.datasets[0].data[2] = r
      chart.update();
    }catch(err){
      console.log(err)
    }
  }

  addTimeData(chart,visData){

    console.log(visData)
    console.log(visData[0][0])
    let data = []
    for(var d in visData){
      if (!(visData[d] === undefined || visData[d].length == 0)) {
        console.log(visData[d][0]['Observations'][0]['Value-Type'])
        data.push((visData[d][0]['Observations'][0]['Value-Type']==='Double') ? visData[d][0]['Observations'][0].Value*100 : visData[d][0]['Observations'][0].Value)
      }
      else if(visData[parseInt(d)-1])  data.push((visData[parseInt(d)-1][0]['Observations'][0]['Value-Type']==='Double') ? visData[parseInt(d)-1][0]['Observations'][0].Value*100 : visData[parseInt(d)-1][0]['Observations'][0].Value)
      else data.push(0)
    }
    // var dat = visData.map((res)=>{
    //   if (!(res === undefined || res.length == 0)) {
    //     console.log(res[0]['Observations'][0]['Value-Type'])
    //     return (res[0]['Observations'][0]['Value-Type']==='Double') ? res[0]['Observations'][0].Value*100 : res[0]['Observations'][0].Value
    //   }
    //   else return 
    // })

    try{
      console.log(`data: ${data}`)
      console.log(`Time: ${this.dates}`)
      chart.data.datasets[0].data = data
      chart.update();
    }catch(err){
      console.log(err)
    }

  }



}
