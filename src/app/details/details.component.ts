import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../data.service';
import { VDataService } from '../v-data.service'
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from '../material.module';
import { FormsModule} from '@angular/forms'
import 'hammerjs';
import { Chart } from 'chart.js';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  myControl: FormControl = new FormControl();
	user$: Object;
  posts$: Object
  label = "No profile selected";
  quality_metrics = []
  metricURIs = []
  show = false
  showMetrics = false
  chart = []
  radarChart = []
  constructor(private data: DataService, private vdata: VDataService) {
  	
   }

  ngOnInit() {

  	this.data.getProfile(this.user$).subscribe(
  		data =>this.user$ = data
  	)

    this.label = this.data.datasetLabel
    console.log(this.data.datasetLabel)
    console.log(`QualityURIS ${this}`)

    this.data.getFacets()
    .subscribe(
      data => {
        this.posts$ = (data.category)
        console.log(this.posts$)

        for(let c in this.posts$){
          for(let d in this.posts$[c].dimension){
            for(let m in this.posts$[c].dimension[d].metric){
              this.metricURIs.push((this.posts$[c].dimension[d].metric[m].uri))       
            }
          }
        }
    console.log(this.metricURIs)
      }
    )

    this.loadMetrics()
    //this.loadRadar()
  }

  metricVis(option){
    let arr = [option]
    console.log(arr)
    this.loadVis(this.label,arr)
  }


  loadMetrics(){
        this.vdata.vsQuality(this.label).subscribe(
      (data)=>{
        this.quality_metrics = data.metrics
        console.log(this.quality_metrics)
        let lodData = []
        let rlabels = this.quality_metrics.map(res=>res.name)
        let rdata = this.quality_metrics.map((res)=>{
          lodData.push(Math.floor(Math.random()*(101-50))+50)
          if(res.latestValue<=100) return res.latestValue
          else return 50

        })

        console.log(`rlabels: ${rlabels}`)
        console.log(`rdata: ${rdata}`)
        this.loadRadar(rlabels,rdata,lodData)


        this.quality_metrics.sort(function(a, b){
          var nameA=a.latestValue, nameB=b.latestValue
          if (nameA < nameB) //sort string ascending
            return -1 
          if (nameA > nameB)
            return 1
          return 0 //default return value (no sorting)
        })

        for(let l in this.quality_metrics){
              Object.defineProperty(this.quality_metrics[l],'show',{
              value: false,
              writable:true,
              configurable:true
            });
        }
        //this.loadVis(this.label,this.metricURIs)
      } 
    )
  }

  loadVis(label,metrics){
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

          this.chart = new Chart('canvas',{

            type: 'line',
            data: {
              labels: visDates,
              datasets: [
                {
                  label: name,
                  data: obsValue,
                  borderColor: '#3cba9f',
                  fill: false
                }
              ]
            },
            options: {
              legend: {
                display: true
              },
              scales: {
                xAxes: [{
                  display:true
                }],
                yAxes: [{
                  display:true
                }]
              }
            }
          })
    
        }
      )

  }

  loadRadar(rlabels,rdata,loddata){
              this.radarChart = new Chart('radar1',
                {
                  "type":"radar",
                  "data":
                    {
                      "labels":rlabels,
                      "datasets":[
                        {
                          "label":"My First Dataset","data":rdata,
                          "fill":true,"backgroundColor":"rgba(255, 99, 132, 0.2)","borderColor":"rgb(255, 99, 132)",
                          "pointBackgroundColor":"rgb(255, 99, 132)","pointBorderColor":"#fff","pointHoverBackgroundColor":"#fff",
                          "pointHoverBorderColor":"rgb(255, 99, 132)"},

                        {
                          "label":"LOD Average Data",
                          "data":loddata,
                          "fill":true,
                          "backgroundColor":"rgba(54, 162, 235, 0.2)",
                          "borderColor":"rgb(54, 162, 235)",
                          "pointBackgroundColor":"rgb(54, 162, 235)",
                          "pointBorderColor":"#fff",
                          "pointHoverBackgroundColor":"#fff",
                          "pointHoverBorderColor":"rgb(54, 162, 235)"
                        }]
                     },
                  "options":
                    {
                      "elements":
                        {
                          "line":
                            {
                              "tension":0,
                               "borderWidth":3
                            }
                        }
                    }
              })

  }

}










