import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Chart } from 'chart.js';
import { VDataService } from '../v-data.service'
import { Observable } from 'rxjs';
import { MatTableModule } from '@angular/material/table';

 

export interface PeriodicElement {
position:number
  statement: string;
  Parameter: string;
  Description: string;
  Value: string;
}

@Component({
  selector: 'app-metric-profile',
  templateUrl: './metric-profile.component.html',
  styleUrls: ['./metric-profile.component.scss']
})
export class MetricProfileComponent implements OnInit {

  constructor(private data: DataService,private vdata: VDataService) { }

  ETU = false
  EP = false
  hideTripleChart = true
  metricType = 'Double'
  chartcounter = 0
  timGraphCounter = 0 
  facetOptions = []
  chart = []
  donut = []
  barChart = []
  dates = []

  dataset_label:string
  comment:string
  metric:Object
  profileProperties:any

  ngOnInit() {
    
    this.data.getFacets().subscribe(res=>this.facetOptions=res.Categories) //Needed to obtain the definitions of each Metric

    //Subscribe to the Current Dataset Label
  	this.data.Current_Label.subscribe((res)=>{
  		this.dataset_label = res
  		console.log(this.dataset_label)
      this.data.getAssessmentdates(this.dataset_label).subscribe((res)=>{        
        this.dates=res['Assessment-Dates'].reverse()
        console.log(this.dates) 
      })
  	})

    //Subscribe to the Current Metric
    this.data.CurrentMetric.subscribe((res)=> {
      let visData = []
      this.metric = res
      this.metricType  = res['Observations'][0]['Value-Type']
      console.log(this.dataset_label)
      console.log(this.metric)
      this.getComment(this.metric)

      console.log(visData)

      this.data.getProfileObservation(this.dataset_label,this.metric['Observations'][0]['Observation-URI']).subscribe((res)=>{
        let r = 0
        this.DatesCall(r,visData)
        this.profileProperties = res 
        if(res['Estimation-Technique-Used']) this.ETU = true
          else this.ETU = false
        if(res['Estimation-Parameter']) this.EP = true
          else this.EP = false
        console.log(res)

        if(this.chartcounter==0){
          this.TriplesChart(res['Total-Dataset-Triples'],res['Total-Dataset-Triples-Assessed'])
          this.loadDonut()
          this.chartcounter++
          }
          else{
            console.log('Updating...')
            this.addBarData(this.barChart, res['Total-Dataset-Triples'], res['Total-Dataset-Triples-Assessed'])
            this.addDonutData(this.donut,this.metric['Observations'][0].Value)
          }
      })
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
    						this.metric['Observations'][0].Value,t
    					],
                backgroundColor: [
                    'rgba(205, 255, 0)',
                    'rgba(255, 59, 119)',
                    'rgba(82, 101, 107)'
                ]
    				}],
    				labels: [
    					'LatestValue',
    					'To reach Threshold'
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
    console.log('here')
    let data = []
    for(let d in visData){
      if (!(visData[d] === undefined || visData[d].length == 0)) {
        console.log('Value')
        console.log(visData[d][0]['Observations'][0]['Value-Type'])
        data.push((visData[d][0]['Observations'][0]['Value-Type']==='Double') ? visData[d][0]['Observations'][0].Value*100 : visData[d][0]['Observations'][0].Value)
      }
      else if(visData[parseInt(d)-1])  data.push((visData[parseInt(d)-1][0]['Observations'][0]['Value-Type']==='Double') ? visData[parseInt(d)-1][0]['Observations'][0].Value*100 : visData[parseInt(d)-1][0]['Observations'][0].Value)
      else data.push(0)
    }
    console.log('Dataaa')
    console.log(data)
    let type = this.metric['Observations'][0]['Value-Type']
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
              beginAtZero:true,
              callback: function(value, index, values) {
                //console.log(`Value in Chart ${value}`)
                if(type==='Boolean'){
                  if(value==0) return 'False'
                  else if(value==1) return 'True'
                  else return ' '
                }
                else return value
              }
            },
            display:true
          }]
        }
      }
    })
  }

  TriplesChart(total,assessed){
    if(total==0) this.hideTripleChart = false
      else if(total>0) this.hideTripleChart = true
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
          label: this.metric['Metric-Label']
        }],
        labels: [
          'Total-Dataset-Triples',
          'Total-Dataset-Triples-Assessed'
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        legend: {
          position: 'top',
        },
        scales: {
          yAxes : [{
            ticks:{
              callback: function(value,index,values) {
                return Math.floor(value)
              }
            }
          }]
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

     if(total==0) this.hideTripleChart = true
       else this.hideTripleChart  = false

     if(total===undefined){
       total=0
       this.hideTripleChart = true
       console.log(total)
     }
     if(assessed===undefined){
       assessed=0
       console.log(assessed)
     } 
    console.log('Creating graph')
    console.log(total)
    console.log(assessed)

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

     
      console.log(latestObs)
      console.log(this.metric['weight'])
      console.log(t)
     try{
      chart.data.datasets[0].data[0] = latestObs
      chart.data.datasets[0].data[1] = t
      chart.update();
    }catch(err){
      console.log(err)
    }
  }

  addTimeData(chart,visData){

    if(visData[0][0]['Observations'][0]['Value-Type']==='Boolean')
      console.log('Changing Chart Axis to Boolean')


    console.log(visData)
    console.log(visData[0][0])
    let data = []
    let type = this.metric['Observations'][0]['Value-Type']
    for(let d in visData){
      if (!(visData[d] === undefined || visData[d].length == 0)) {
        console.log('Value')
        console.log(visData[d][0]['Observations'][0]['Value-Type'])
        data.push((visData[d][0]['Observations'][0]['Value-Type']==='Double') ? visData[d][0]['Observations'][0].Value*100 : visData[d][0]['Observations'][0].Value)
      }
      else if(visData[parseInt(d)-1])  data.push((visData[parseInt(d)-1][0]['Observations'][0]['Value-Type']==='Double') ? visData[parseInt(d)-1][0]['Observations'][0].Value*100 : visData[parseInt(d)-1][0]['Observations'][0].Value)
      else data.push(0)
    }

        console.log('Dataaa')
        console.log(data)
    try{
      console.log(`data: ${data}`)
      console.log(`Time: ${this.dates}`)
      chart.data.datasets[0].data = data
      chart.data.datasets[0].label = this.metric['Metric-Label']
      chart.options.scales.yAxes = [{
            ticks:{
              beginAtZero:true,
              callback: function(value, index, values) {
                //console.log(`Value in Chart ${value}`)
                if(type==='Boolean'){
                  if(value==0) return 'False'
                  else if(value==1) return 'True'
                  else return ' '
                }
                else return value
              }
            },
            display:true
          }]
      chart.update();
    }catch(err){
      console.log(err)
    }

  }

  DatesCall(r,visData){
          console.log(r)
          console.log(this.dates)
          this.data.MetricsForDated(this.dataset_label,this.dates[r]).subscribe((res)=>{
          console.log(res)
          let arr = res['Metrics'].filter(res=>res['Metric-URI']==this.metric['Metric-URI'])
          console.log(arr)
          console.log(`Metrics Found for ${this.metric['Metric-Label']}`)
          visData.push(arr)
          r+=1
          if(r<this.dates.length) this.DatesCall(r,visData)
          if(r==this.dates.length){
            console.log('final')
            console.log(visData)
            if(this.timGraphCounter==0){
              this.loadTimeGraph(visData)
              this.timGraphCounter+=1
            } 
            else this.addTimeData(this.chart,visData)
          }
        })

  }

 getStyle(){
   if(this.metric['Observations'][0]['Value']==0)
     return 'red'
   else return 'green'
 }

getBooleanString(){
     if(this.metric['Observations'][0]['Value']==0)
     return 'False'
   else return 'True'
}



}
