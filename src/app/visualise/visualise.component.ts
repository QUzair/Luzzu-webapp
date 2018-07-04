import { Component, OnInit } from '@angular/core';
import { VDataService } from '../v-data.service'
import { Chart } from 'chart.js';
import { map, filter } from 'rxjs/operators'
import { Observable, pipe } from 'rxjs' 
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { DataService } from '../data.service';

var counter = 0

@Component({
  selector: 'app-visualise',
  templateUrl: './visualise.component.html',
  styleUrls: ['./visualise.component.scss']
})

export class VisualiseComponent implements OnInit {

	response:Object
  radarChartm = []
  barChartm = []
	chart = [];
  users$ = [] //Contains the Options for the datasets
  rlabels = [] //Stores all metrics to be used
  rdatasets = [] //Stores data for the radar chart
  datasetsForm = new FormControl(); //Contains the desired metrics
  metricsForm = new FormControl(); // Contains the desired datasets
  metricURIs = [] //Contains the Options for metrics form

  
  constructor(private _vdata: VDataService, private data: DataService) { }
  ngOnInit() {

    this.saveMetricURIs()
    this.data.getRanking().subscribe(
      (data)=>{
        this.users$ = data
        console.log(this.users$)
      }
    )
  }

  message(){
    console.log(this.datasetsForm.value.map(res=>res.dataset))
  }
  
  saveMetricURIs(){
        this.data.getFacets()
    .subscribe(
      data => {
        let posts$ = (data.category)
        console.log(posts$)

        for(let c in posts$){
          for(let d in posts$[c].dimension){
            for(let m in posts$[c].dimension[d].metric){
              this.metricURIs.push((posts$[c].dimension[d].metric[m]))       
            }
          }
        }
    console.log(this.metricURIs)
      }
    )
  }


    loadRadar(rlabels,rdata){
      console.log('Loading Radar chart...')
      console.log(rlabels)
      console.log(rdata)
              this.radarChartm = new Chart('radar1',
                {
                  "type":"radar",
                  "data":
                    {
                      "labels":rlabels,
                      "datasets":rdata
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

  loadBar(rlabels,rdata){
      console.log('Loading Bar chart...')
      //console.log(rlabels)
      //console.log(rdata)
      //this.radarChartm.update()
              this.barChartm = new Chart('bar1',
                {
                  "type":"bar",
                  "data":
                    {
                      "labels":rlabels,
                      "datasets":rdata
                     },
                  "options":
                    {
                      "elements":
                        {
                          "line":
                            {
                              "tension":10,
                               "borderWidth":3
                            }
                        }
                    }
              })

  }


  Visualise(){
    console.log("Starting Vis...")
    let found= 0

    this.rdatasets = []

    for (let d in this.datasetsForm.value){
      let testdata  = []
      console.log(this.datasetsForm.value[d].dataset)



      this._vdata.vsQuality(this.datasetsForm.value[d].dataset).subscribe(
        (res)=>{
          //console.log(res)
          //console.log(this.metricsForm.value)
          //console.log(res.metrics.length)

          let r = 0 
          for(let dr in this.metricsForm.value){
            found=0
            r=0
            while (found==0 && r<res.metrics.length){
               //console.log(`Comparing ${res.metrics[r].name} and ${this.metricsForm.value[dr].label}`)
               //console.log(r)
               if(res.metrics[r].name===this.metricsForm.value[dr].label && res.metrics[r].latestValue>=0){
                 //console.log(`${res.metrics[r].name} ${res.metrics[r].latestValue}`)
                 testdata.push(res.metrics[r].latestValue)
                 found = 1
               }
               r++
               //console.log(r)
            }
            if(found==0){
             //console.log(`Not found ${this.metricsForm.value[dr].label} `);
             testdata.push(0)
           }
            
          }
           //Have array of data and label of datasetß
          console.log(`${this.datasetsForm.value[d].dataset} ${testdata}`)  
          let red = Math.floor(Math.random()*(255))
          let blue = Math.floor(Math.random()*(255))
          let green = Math.floor(Math.random()*(255))
          //console.log(red+" "+blue+" "+green)
          var tmp = {
            label:"hu", 
            data: [],
            "fill":true,
            "backgroundColor":`rgba(${red}, ${green}, ${blue}, 0.2)`,
            "borderColor":`rgba(${red}, ${green}, ${blue})`,
            "pointBackgroundColor":`rgba(${red}, ${green}, ${blue})`,
            "pointBorderColor":"#fff",
            "pointHoverBackgroundColor":"#fff",
            "pointHoverBorderColor":`rgba(${red}, ${green}, ${blue})`
          };
          tmp.label= this.datasetsForm.value[d].dataset
          tmp.data = testdata
          this.rdatasets.push(tmp) 
          //console.log(`Final ${this.rdatasets.map(res=>{res.data; res.label})} `)
          this.rdatasets.map(res=>{console.log(res)})
          let rlabel = this.metricsForm.value.map(res=>res.label)
          let rdatasets1 = this.rdatasets
          let rlabel2 = rlabel
          let rdatasets2 = rdatasets1

          if(counter==0){
          this.loadRadar(rlabel,rdatasets1)
          this.loadBar(rlabel,rdatasets1)
          counter++
          }
          else{
            console.log('Updating...')
            this.addData(this.radarChartm,rlabel,rdatasets1)
            this.addData(this.barChartm,rlabel,rdatasets2)
          }


        })
     
      
    }
  }

   addData(chart, label, data) {
    chart.data.labels=label;
    chart.data.datasets=data
    chart.update();
}

}




// [
//                         {
//                           "label":"My First Dataset","data":rdata,
//                           "fill":true,"backgroundColor":"rgba(255, 99, 132, 0.2)","borderColor":"rgb(255, 99, 132)",
//                           "pointBackgroundColor":"rgb(255, 99, 132)","pointBorderColor":"#fff","pointHoverBackgroundColor":"#fff",
//                           "pointHoverBorderColor":"rgb(255, 99, 132)"},

//                         {
//                           "label":"LOD Average Data",
//                           "data":loddata,
//                           "fill":true,
//                           "backgroundColor":"rgba(54, 162, 235, 0.2)",
//                           "borderColor":"rgb(54, 162, 235)",
//                           "pointBackgroundColor":"rgb(54, 162, 235)",
//                           "pointBorderColor":"#fff",
//                           "pointHoverBackgroundColor":"#fff",
//                           "pointHoverBorderColor":"rgb(54, 162, 235)"
//                         }]