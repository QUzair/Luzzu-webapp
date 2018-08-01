import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';
import { VDataService } from '../v-data.service'
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from '../material.module';
import { FormsModule, Validators} from '@angular/forms'
import 'hammerjs';
import { Chart } from 'chart.js';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { MetricDialogComponent } from '../metric-dialog/metric-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MetricProfileComponent } from '../metric-profile/metric-profile.component'
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {


  Dimen: string[] = ['Categories', 'Dimensions', 'Metrics'];
  //myControl: FormControl = new FormControl();

  CategoriesF = new FormControl();
  DimensionsF = new FormControl();

   minForm = new FormControl('', [
    Validators.required
  ]);
   maxForm = new FormControl('', [
    Validators.required
  ]);

  showProfilePage=false
  CatList = [] 
  DimList = []
  Filteredmetrics = []
  filterMetrics = false
  posts$: Object
  label = "No profile selected";
  quality_metrics = []
  metricURIs = []
  show = false
  showMetrics = false
  chart = []
  radarChart = []
  barChart = []
  lodDataService = []
  labelMetrics = []
  lodData = []
  rlabels1 = []
  rdata1 = []
  animal: "Dog"
  name: "Uzair";
  AssessDates = []
  msg:any
  constructor(private data: DataService, private vdata: VDataService, public dialog: MatDialog) {
  	
   }

  ngOnInit() {
     this.data.CurrentMetric.subscribe((res)=> {
      console.log(res)
      this.msg = res
    })
    
    this.data.Current_Label.subscribe((res) =>{
      this.label = res
      this.data.getAssessmentdates(this.label).subscribe((res)=>{
        this.AssessDates=res
        console.log(this.AssessDates)
      })
    })

    this.data.getFacets()
    .subscribe(
      data => {
        this.posts$ = (data.Categories)
        console.log(this.posts$)

        for(let c in this.posts$){
          this.CatList.push(this.posts$[c].Label)
          for(let d in this.posts$[c].Dimensions){
            this.DimList.push(this.posts$[c].Dimensions[d].Label)
            for(let m in this.posts$[c].Dimensions[d].Metrics){
              this.metricURIs.push((this.posts$[c].Dimensions[d].Metrics[m].URI))        
            }
          }
        }
    console.log(this.metricURIs)
    console.log(`category list ${this.CatList}`)
    console.log(`dimensions list ${this.DimList}`)
      }
    )
    this.loadMetrics()
  }

  metricVis(option){
    let arr = [option]
    console.log(arr)
    this.loadVis(this.label,arr)
  }

  loadMetrics(){
        this.vdata.vsQuality(this.label).subscribe(
      (data)=>{
        console.log(data)
        this.quality_metrics = data.Metrics

        for(let i in this.quality_metrics){
          console.log(this.quality_metrics[i].Observations[0]['Value-Type'])
          if(this.quality_metrics[i].Observations[0]['Value-Type']==="Double")
            this.quality_metrics[i].Observations[0]['Value']=this.quality_metrics[i].Observations[0]['Value']*100

          Object.defineProperty(this.quality_metrics[i],'weight',{
              value: 100,
              writable:true,
              configurable:true
            });
        }
        console.log(this.quality_metrics)

        this.rlabels1 = this.quality_metrics.map((res)=>{
          return res['Metric-Label']
        })
        this.rdata1 = this.quality_metrics.map((res)=>{
          console.log((res['Observations'][0]).Value)
          if((res['Observations'][0]).Value<=100) return (res['Observations'][0]).Value
          else return 50
        })

        this.labelMetrics = this.rdata1
        console.log(`rlabels: ${this.rlabels1.length} ${this.rlabels1}`)
        console.log(`rdata: ${this.rdata1}`)
        


        this.quality_metrics.sort(function(a, b){
          var nameA=(a['Observations'][0]).Value, nameB=(b['Observations'][0]).Value
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
        
      this.data.getLODdata().subscribe((res)=>{
        this.lodDataService = res
        console.log(this.lodDataService)
        console.log(this.quality_metrics)
        let loddata_temp = []
        for(let f in this.quality_metrics){
              for(let s in this.lodDataService){
                //console.log(`${this.quality_metrics[f].name} ${this.lodDataService[s].name} ${this.lodDataService[s].mean}`)
                if(this.quality_metrics[f]['Metric-Label']===this.lodDataService[s].name){
                  console.log(`${this.quality_metrics[f]['Metric-Label']} ${this.lodDataService[s].name} ${this.lodDataService[s].mean}`)
                  loddata_temp.push(this.lodDataService[s].mean)
                }
              }
            }
            this.lodData=loddata_temp
            console.log(this.lodData)
            console.log(loddata_temp)
            this.loadRadar(this.rlabels1,this.rdata1,this.lodData)
            this.loadBar(this.rlabels1,this.rdata1,this.lodData)
    })
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
            name.push(res.Metrics[i]['Metric-Label'])
            for(let c in res.Metrics[i].lstObservations){
              obsDate.push(res.Metrics[i].lstObservations[c].observationDate)
              obsValue.push(res.Metrics[i].lstObservations[c].observationValue)
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
                          "label":this.label.slice(7),"data":rdata,
                          "fill":true,"backgroundColor":"rgba(255, 99, 132, 0.2)",
                          "borderColor":"rgb(255, 99, 132)",
                          "pointBackgroundColor":"rgb(255, 99, 132)",
                          "pointBorderColor":"#fff",
                          "pointHoverBackgroundColor":"#fff",
                          "pointHoverBorderColor":"rgb(255, 99, 132)"
                        },

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

    loadBar(rlabels,rdata,loddata){
              this.barChart = new Chart('bar1',
                {
                  "type":"bar",
                  "data":
                    {
                      "labels":rlabels,
                      "datasets":[
                        {
                          "label":this.label.slice(7),"data":rdata,
                          "fill":true,"backgroundColor":"rgba(255, 99, 132, 0.2)",
                          "borderColor":"rgb(255, 99, 132)",
                          "pointBackgroundColor":"rgb(255, 99, 132)",
                          "pointBorderColor":"#fff",
                          "pointHoverBackgroundColor":"#fff",
                          "pointHoverBorderColor":"rgb(255, 99, 132)"
                        },

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

    openDialog(): void {
    const dialogRef = this.dialog.open(MetricDialogComponent, {
      width: '800px',
      data: {metrics: this.quality_metrics}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result)
      if(result) this.quality_metrics = result;
    });
  }

  newMetricProfile(label){
    this.showProfilePage=true
    //console.log(`Sending to child ${label}`)
    this.data.changeMetricName(label)
  }

  filter(){
    console.log('working')
    console.log(this.minForm.value)
    console.log(this.maxForm.value)
    let arr = []

    for(let qm in this.quality_metrics){
      for(let c in this.CategoriesF.value){
        if(this.CategoriesF.value[c]==this.quality_metrics[qm].Category){
          console.log(`Found category ${this.quality_metrics[qm]}`)
          for(let d in this.DimensionsF.value){
            if(this.DimensionsF.value[d]==this.quality_metrics[qm].Dimension){
              console.log(`Found dimension ${this.quality_metrics[qm]}`)
              console.log(this.quality_metrics[qm].Observations[0].Value)
              if(this.quality_metrics[qm].Observations[0].Value>this.minForm.value && this.quality_metrics[qm].Observations[0].Value<this.maxForm.value){
                console.log(`Found values ${this.quality_metrics[qm]}`)
                arr.push(this.quality_metrics[qm])
                console.log(arr)
              }
            }
          }
        }       
      } 
    }
    this.Filteredmetrics = arr
    console.log(this.Filteredmetrics)
  }

}











