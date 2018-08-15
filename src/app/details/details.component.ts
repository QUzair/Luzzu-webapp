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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  DatasetURL:string
  Dimen: string[] = ['Categories', 'Dimensions', 'Metrics'];

  CategoriesF = new FormControl('',[
      Validators.required
    ]);
  DimensionsF = new FormControl('',[
      Validators.required
    ]);



  double_minForm = new FormControl('', [
    Validators.required
  ]);
  double_maxForm = new FormControl('', [
    Validators.required
  ]);
  int_minForm = new FormControl('', [
    Validators.required
  ]);
  int_maxForm = new FormControl('', [
    Validators.required
  ]);

  ShowBooleansVal = false
  ShowThresholds = false

  CountMetric = 'Unknown'
  Syntax_boolean = false
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
  AssessDates = []
  msg:any
  constructor(private data: DataService, private vdata: VDataService, public dialog: MatDialog, private route: ActivatedRoute) {
  	this.route.params.subscribe((params) => {
      console.log(`Dataset URL: ${decodeURIComponent(params.id)}`)
      this.label = decodeURIComponent(params.id)
      this.data.changeLabel(this.label)
    })
   }

  ngOnInit() {
     this.data.CurrentMetric.subscribe((res)=> {
      console.log(res)
      this.msg = res
    })
    
      this.data.getAssessmentdates(this.label).subscribe((res)=>{
        this.AssessDates=res
        console.log(this.AssessDates)
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


  loadMetrics(){
    this.vdata.vsQuality(this.label).subscribe(
      (data)=>{
        let threshVal = 0
        console.log(data)
        this.quality_metrics = data.Metrics
        
        for(let i in this.quality_metrics){

          if(this.quality_metrics[i]['Metric-Label']==='Syntax Error')
            if(this.quality_metrics[i].Observations[0]['Value']==1) this.Syntax_boolean = true

          console.log(this.quality_metrics[i].Observations[0]['Value-Type'])
          if(this.quality_metrics[i].Observations[0]['Value-Type']==="Double")
            this.quality_metrics[i].Observations[0]['Value']=this.quality_metrics[i].Observations[0]['Value']*100

          if(this.quality_metrics[i].Observations[0]['Value-Type']==='Double') threshVal = 100
            else if(this.quality_metrics[i].Observations[0]['Value-Type']==='Integer') threshVal = 1000
              else if(this.quality_metrics[i].Observations[0]['Value-Type']==='Boolean') threshVal = 0
                else threshVal = 0

          Object.defineProperty(this.quality_metrics[i],'weight',{
              value: threshVal,
              writable:true,
              configurable:true
            })
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

        
      this.data.getLODdata().subscribe((res)=>{
        this.lodDataService = res
        console.log(this.lodDataService)
        console.log(this.quality_metrics)
        let loddata_temp = []
        for(let f in this.quality_metrics){
              for(let s in this.lodDataService){
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
    })
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
                          "label":this.label,"data":rdata,
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
                          "label":this.label,"data":rdata,
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
                        },
                        "scales": {
                          "xAxes":[{
                            "ticks": {
                              "autoSkip":false
                            }
                          }]
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
    console.log(this.double_minForm.value)
    console.log(this.double_maxForm.value)
    console.log(this.int_minForm.value)
    console.log(this.int_maxForm.value)
    console.log(this.ShowBooleansVal)

    let arr = []

    for(let qm in this.quality_metrics){
      for(let c in this.CategoriesF.value){
        if(this.CategoriesF.value[c]==this.quality_metrics[qm].Category){
          console.log(`Found category ${this.quality_metrics[qm]}`)
          for(let d in this.DimensionsF.value){
            if(this.DimensionsF.value[d]==this.quality_metrics[qm].Dimension){

              console.log(`Found dimension ${this.quality_metrics[qm]}`)
              let mVal = this.quality_metrics[qm].Observations[0].Value
              let mType = this.quality_metrics[qm].Observations[0]['Value-Type']

              if(mType==='Double'){
                if(mVal>=this.double_minForm.value && mVal<=this.double_maxForm.value){
                  console.log(`Found values ${this.quality_metrics[qm]}`)
                  arr.push(this.quality_metrics[qm])
                }
              }
              else if(mType==='Integer'){
                if(mVal>=this.int_minForm.value && mVal<=this.int_maxForm.value){
                  console.log(`Found values ${this.quality_metrics[qm]}`)
                  arr.push(this.quality_metrics[qm])
                }
              }
              else if(mType==='Boolean'){
                if(mVal===this.ShowBooleansVal)
                  arr.push(this.quality_metrics[qm])
              }
            }
          }
        }       
      } 
    }
    this.Filteredmetrics = arr
    console.log(this.Filteredmetrics)
  }


  newDate(date){
    console.log(date)
    let threshVal = 0
      this.data.MetricsForDated(this.label,date).subscribe(
      (data)=>{
        console.log(data)
        this.quality_metrics = data.Metrics
        
        for(let i in this.quality_metrics){
          console.log(this.quality_metrics[i].Observations[0]['Value-Type'])
          if(this.quality_metrics[i].Observations[0]['Value-Type']==="Double")
            this.quality_metrics[i].Observations[0]['Value']=this.quality_metrics[i].Observations[0]['Value']*100

          if(this.quality_metrics[i].Observations[0]['Value-Type']==='Double') threshVal = 100
            else if(this.quality_metrics[i].Observations[0]['Value-Type']==='Integer') threshVal = 1000
              else if(this.quality_metrics[i].Observations[0]['Value-Type']==='Boolean') threshVal = 0
                else threshVal = 0

          Object.defineProperty(this.quality_metrics[i],'weight',{
              value: threshVal,
              writable:true,
              configurable:true
            })
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

        
      this.data.getLODdata().subscribe((res)=>{
        this.lodDataService = res
        console.log(this.lodDataService)
        console.log(this.quality_metrics)
        let loddata_temp = []
        for(let f in this.quality_metrics){
              for(let s in this.lodDataService){
                if(this.quality_metrics[f]['Metric-Label']===this.lodDataService[s].name){
                  console.log(`${this.quality_metrics[f]['Metric-Label']} ${this.lodDataService[s].name} ${this.lodDataService[s].mean}`)
                  loddata_temp.push(this.lodDataService[s].mean)
                }
              }
            }
            this.lodData=loddata_temp
            console.log(this.lodData)
            console.log(loddata_temp)
            this.addData(this.radarChart,this.rlabels1,this.rdata1,this.lodData)
            this.addData(this.barChart,this.rlabels1,this.rdata1,this.lodData)
      })
    })
  }

  DisplayLatest(){
        this.vdata.vsQuality(this.label).subscribe(
      (data)=>{
        let threshVal = 0
        console.log(data)
        this.quality_metrics = data.Metrics
        
        for(let i in this.quality_metrics){
          console.log(this.quality_metrics[i].Observations[0]['Value-Type'])
          if(this.quality_metrics[i].Observations[0]['Value-Type']==="Double")
            this.quality_metrics[i].Observations[0]['Value']=this.quality_metrics[i].Observations[0]['Value']*100

          if(this.quality_metrics[i].Observations[0]['Value-Type']==='Double') threshVal = 100
            else if(this.quality_metrics[i].Observations[0]['Value-Type']==='Integer') threshVal = 1000
              else if(this.quality_metrics[i].Observations[0]['Value-Type']==='Boolean') threshVal = 0
                else threshVal = 0

          Object.defineProperty(this.quality_metrics[i],'weight',{
              value: threshVal,
              writable:true,
              configurable:true
            })
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

        
      this.data.getLODdata().subscribe((res)=>{
        this.lodDataService = res
        console.log(this.lodDataService)
        console.log(this.quality_metrics)
        let loddata_temp = []
        for(let f in this.quality_metrics){
              for(let s in this.lodDataService){
                if(this.quality_metrics[f]['Metric-Label']===this.lodDataService[s].name){
                  console.log(`${this.quality_metrics[f]['Metric-Label']} ${this.lodDataService[s].name} ${this.lodDataService[s].mean}`)
                  loddata_temp.push(this.lodDataService[s].mean)
                }
              }
            }
            this.lodData=loddata_temp
            console.log(this.lodData)
            console.log(loddata_temp)
            this.addData(this.radarChart,this.rlabels1,this.rdata1,this.lodData)
            this.addData(this.barChart,this.rlabels1,this.rdata1,this.lodData)
      })
    })
  }

   addData(chart, labels, data,LOD_Data) {
     try{
      chart.data.labels=labels;
      chart.data.datasets[0].data=data
      chart.data.datasets[1].data=LOD_Data
      chart.update();
    }catch(err){
      console.log(err)
    }
  }

    precise(x) {
    return Number.parseFloat(x).toFixed(2);
}

  boolValue(val){
    if(val==1) return 'true'
      else return 'false'
  }

booleanBar(currentVal,threshVal){
  if(currentVal===threshVal) return 100
    else return 0
}

 exists(label) {
   try {
     let arr = this.CategoriesF.value.filter(res => res == label)
     if (arr.length > 0) return false
     else return true
   } catch (err) {
     //console.log(err)
     return false
   }
 }

SelectedCatF(){
  try{
      if(this.CategoriesF!=undefined){
    if(this.CategoriesF.value.length>0)
      return false
    else return true
  }
  else return false
} catch {
  return false
}

}

}











