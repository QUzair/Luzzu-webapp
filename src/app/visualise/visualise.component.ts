import { Component, OnInit } from '@angular/core';
import { VDataService } from '../v-data.service'
import { Chart } from 'chart.js';
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs' 
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { DataService } from '../data.service';

@Component({
  selector: 'app-visualise',
  templateUrl: './visualise.component.html',
  styleUrls: ['./visualise.component.scss']
})
export class VisualiseComponent implements OnInit {

	response:Object
	chart = [];
  radarChartm = [];
  toppings = new FormControl();
  users$ = []

  toppingList = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  toppingList2 = ['Biryani ', 'Samosa', 'Chicken Tikka', 'Pakora', 'Uber', 'Duber'];

	label = "http://dbpedia.org/"
	metric = ["http://purl.org/eis/vocab/dqm#UndefinedClassesAndPropertiesMetric"]
  
  constructor(private _vdata: VDataService, private data: DataService) { }

  ngOnInit() {
    this.data.getRanking().subscribe(
      (data)=>{
        this.users$ = data
        console.log(this.users$)
      }
    )

  }
  

    loadRadar(rlabels,rdata,loddata){
              this.radarChartm = new Chart('radar1',
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







        // (res)=> {
        //   this.response = res.metrics
        //   console.log(this.response)
        //   console.log(res.metrics[0].lstObservations[0].observationDate)
        //   console.log(res.metrics[0].lstObservations[0].observationValue)

        //   let obsDate = []
        //   let obsValue = []
        //   let name = []
        //   for(let i in res.metrics){
        //     name.push(res.metrics[i].name)
        //     for(let c in res.metrics[i].lstObservations){
        //       obsDate.push(res.metrics[i].lstObservations[c].observationDate)
        //       obsValue.push(res.metrics[i].lstObservations[c].observationValue)
        //     }
        //   }

        //   console.log(` obsDate: ${obsDate}`)
        //   console.log(`obsValue: ${obsValue}`)
        //   console.log(` name: ${name}`)

        //   let visDates = []

        //   for(let c in obsDate){
        //     var jsdate = new Date(obsDate[c])

        //     console.log(jsdate)
        //     visDates.push(jsdate.toLocaleTimeString('en-GB',{year:'numeric',month:'numeric',day:'numeric'}))
        //   }

        //   console.log(visDates)

        //   this.chart = new Chart('canvas',{

        //     type: 'line',
        //     data: {
        //       labels: visDates,
        //       datasets: [
        //         {
        //           label: name,
        //           data: obsValue,
        //           borderColor: '#3cba9f',
        //           fill: false
        //         }
        //       ]
        //     },
        //     options: {
        //       legend: {
        //         display: true
        //       },
        //       scales: {
        //         xAxes: [{
        //           display:true
        //         }],
        //         yAxes: [{
        //           display:true
        //         }]
        //       }
        //     }
        //   })
    
        // }